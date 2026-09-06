//! Authenticated, loopback-only transport to the existing service owner.
use crate::{
    error::{Error, Result},
    state::AppState,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    io::Write,
    path::{Path, PathBuf},
    sync::{Arc, Weak},
    time::Duration,
};
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    net::{TcpListener, TcpStream},
};

const ENDPOINT: &str = ".enderloom-control.json";
const MAX_LINE: usize = 8 * 1024 * 1024;
#[derive(Deserialize, Serialize)]
struct Endpoint {
    protocol: u32,
    port: u16,
    token: String,
    pid: u32,
}
pub(crate) struct Listener {
    task: tokio::task::JoinHandle<()>,
    path: PathBuf,
    token: String,
}
impl Drop for Listener {
    fn drop(&mut self) {
        self.task.abort();
        if std::fs::read(&self.path)
            .ok()
            .and_then(|b| serde_json::from_slice::<Endpoint>(&b).ok())
            .is_some_and(|e| e.token == self.token)
        {
            let _ = std::fs::remove_file(&self.path);
        }
    }
}

async fn write_line(writer: &mut tokio::net::tcp::OwnedWriteHalf, value: &Value) -> Result<()> {
    writer.write_all(value.to_string().as_bytes()).await?;
    writer.write_all(b"\n").await?;
    Ok(())
}

async fn read_line(
    reader: &mut BufReader<tokio::net::tcp::OwnedReadHalf>,
) -> Result<Option<Value>> {
    let mut bytes = Vec::new();
    loop {
        let available = reader.fill_buf().await?;
        if available.is_empty() {
            return if bytes.is_empty() {
                Ok(None)
            } else {
                Err(Error::other("Incomplete local command message"))
            };
        }
        let count = available
            .iter()
            .position(|b| *b == b'\n')
            .map(|i| i + 1)
            .unwrap_or(available.len());
        if bytes.len() + count > MAX_LINE {
            return Err(Error::other("Local command exceeds 8 MiB"));
        }
        let complete = available[count - 1] == b'\n';
        bytes.extend_from_slice(&available[..count]);
        reader.consume(count);
        if complete {
            return Ok(Some(serde_json::from_slice(&bytes)?));
        }
    }
}

async fn serve(socket: TcpStream, owner: Weak<AppState>, token: String) -> Result<()> {
    let (reader, mut writer) = socket.into_split();
    let mut reader = BufReader::new(reader);
    let hello = tokio::time::timeout(Duration::from_secs(5), read_line(&mut reader))
        .await
        .map_err(|_| Error::other("Local authentication timed out"))??;
    if !hello
        .as_ref()
        .is_some_and(|h| h["protocol"] == 1 && h["token"].as_str() == Some(&token))
    {
        return Err(Error::other("Local command authentication failed"));
    }
    let state = owner
        .upgrade()
        .ok_or_else(|| Error::other("Service is stopping"))?;
    let mut events = state.control_events.subscribe();
    write_line(&mut writer,&json!({"protocol":1,"event":"service:ready","payload":{"pid":std::process::id(),"version":env!("CARGO_PKG_VERSION")}})).await?;
    let (requests_tx, mut requests_rx) = tokio::sync::mpsc::channel(32);
    let reader_task = tokio::spawn(async move {
        loop {
            match read_line(&mut reader).await {
                Ok(Some(message)) => {
                    if requests_tx.send(Ok(message)).await.is_err() {
                        break;
                    }
                }
                Ok(None) => break,
                Err(error) => {
                    let _ = requests_tx.send(Err(error)).await;
                    break;
                }
            }
        }
    });
    struct ReaderGuard(tokio::task::JoinHandle<()>);
    impl Drop for ReaderGuard {
        fn drop(&mut self) {
            self.0.abort();
        }
    }
    let _reader = ReaderGuard(reader_task);
    loop {
        tokio::select! {
            message=requests_rx.recv()=>{
                let Some(message)=message else{return Ok(())};
                let message=message?;
                let id=message["id"].as_str().unwrap_or("").to_string();
                if message["protocol"]!=1 {return Err(Error::other("Local command protocol mismatch"));}
                let command=message["command"].as_str().ok_or_else(||Error::other("Missing command"))?;
                let args=message.get("args").cloned().unwrap_or_else(||json!({}));
                let scope=message["request_scope"].as_str().map(str::to_owned);
                let work=crate::tasks::request_scoped(scope,crate::service::dispatch(&state,command,&args));
                tokio::pin!(work);
                let result=loop {
                    tokio::select! {
                        result=&mut work=>break result,
                        event=events.recv()=>match event {
                            Ok(event)=>write_line(&mut writer,&event).await?,
                            Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped))=>write_line(&mut writer,&json!({"protocol":1,"event":"stream:gap","payload":{"skipped":skipped,"recovery":"Read the persisted task/log state"}})).await?,
                            Err(_)=>{}
                        }
                    }
                };
                let response=match result {Ok(result)=>json!({"protocol":1,"id":id,"ok":true,"result":result}),Err(error)=>json!({"protocol":1,"id":id,"ok":false,"error":error.to_string(),"cancelled":matches!(error,Error::Cancelled)})};
                write_line(&mut writer,&response).await?;
            },
            event=events.recv()=>match event {
                Ok(event)=>write_line(&mut writer,&event).await?,
                Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped))=>write_line(&mut writer,&json!({"protocol":1,"event":"stream:gap","payload":{"skipped":skipped,"recovery":"Read the persisted task/log state"}})).await?,
                Err(_)=>return Ok(())
            }
        }
    }
}

pub(crate) fn listen(state: &Arc<AppState>) -> Result<Listener> {
    let socket = std::net::TcpListener::bind((std::net::Ipv4Addr::LOCALHOST, 0))?;
    let port = socket.local_addr()?.port();
    socket.set_nonblocking(true)?;
    let listener = TcpListener::from_std(socket)?;
    let token = format!(
        "{}{}",
        uuid::Uuid::new_v4().simple(),
        uuid::Uuid::new_v4().simple()
    );
    let endpoint = Endpoint {
        protocol: 1,
        port,
        token: token.clone(),
        pid: std::process::id(),
    };
    let path = state.paths.root.join(ENDPOINT);
    let pending = state
        .paths
        .root
        .join(format!(".{ENDPOINT}.{}", uuid::Uuid::new_v4()));
    let mut options = std::fs::OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(&pending)?;
    file.write_all(&serde_json::to_vec(&endpoint)?)?;
    file.sync_all()?;
    drop(file);
    if path.exists() {
        std::fs::remove_file(&path)?;
    }
    std::fs::rename(&pending, &path)?;
    let weak = Arc::downgrade(state);
    let auth = token.clone();
    let task = tokio::spawn(async move {
        while let Ok((socket, peer)) = listener.accept().await {
            if !peer.ip().is_loopback() {
                continue;
            }
            let owner = weak.clone();
            let token = auth.clone();
            tokio::spawn(async move {
                if let Err(error) = serve(socket, owner, token).await {
                    tracing::debug!(%error,"local command connection ended");
                }
            });
        }
    });
    Ok(Listener { task, path, token })
}

pub(crate) struct Client {
    reader: BufReader<tokio::net::tcp::OwnedReadHalf>,
    writer: tokio::net::tcp::OwnedWriteHalf,
    pub owner_pid: u32,
}
impl Client {
    pub async fn connect(root: &Path) -> Result<Option<Self>> {
        let path = root.join(ENDPOINT);
        if !path.is_file() {
            return Ok(None);
        }
        let endpoint: Endpoint = serde_json::from_slice(&std::fs::read(path)?)?;
        if endpoint.protocol != 1 {
            return Err(Error::other("Local endpoint protocol mismatch"));
        }
        let socket = match tokio::time::timeout(
            Duration::from_secs(2),
            TcpStream::connect((std::net::Ipv4Addr::LOCALHOST, endpoint.port)),
        )
        .await
        {
            Ok(Ok(socket)) => socket,
            _ => return Ok(None), // The root lease must still be acquired before bootstrapping.
        };
        let (reader, mut writer) = socket.into_split();
        write_line(&mut writer, &json!({"protocol":1,"token":endpoint.token})).await?;
        let mut reader = BufReader::new(reader);
        let ready = tokio::time::timeout(Duration::from_secs(3), read_line(&mut reader))
            .await
            .map_err(|_| Error::other("Service handshake timed out"))??;
        if !ready.is_some_and(|r| {
            r["event"] == "service:ready"
                && r["payload"]["pid"].as_u64() == Some(endpoint.pid as u64)
        }) {
            return Err(Error::other("Local service handshake failed"));
        }
        Ok(Some(Self {
            reader,
            writer,
            owner_pid: endpoint.pid,
        }))
    }
    pub async fn request(
        &mut self,
        command: &str,
        args: Value,
        request_scope: &str,
        event: &dyn Fn(&str, Value),
    ) -> Result<Value> {
        let id = uuid::Uuid::new_v4().to_string();
        write_line(
            &mut self.writer,
            &json!({"protocol":1,"id":id,"command":command,"args":args,"request_scope":request_scope}),
        )
        .await?;
        while let Some(message) = read_line(&mut self.reader).await? {
            if let Some(name) = message["event"].as_str() {
                event(name, message["payload"].clone());
            } else if message["id"] == id {
                return if message["ok"] == true {
                    Ok(message["result"].clone())
                } else if message["cancelled"] == true {
                    Err(Error::Cancelled)
                } else {
                    Err(Error::other(
                        message["error"].as_str().unwrap_or("Shared command failed"),
                    ))
                };
            }
        }
        Err(Error::other("The owning Enderloom service disconnected"))
    }
}
