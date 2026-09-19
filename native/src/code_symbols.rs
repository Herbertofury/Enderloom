//! Read-only, on-demand symbols from exact installed class bytes. Never loads mod code.
use crate::{
    error::{Error, Result},
    state::AppState,
};
use serde::Serialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    io::{Cursor, Read, Seek, SeekFrom},
    path::Path,
};

fn invalid(message: &str) -> Error {
    Error::other(message)
}
#[derive(Serialize)]
struct CodeMember {
    kind: String,
    name: String,
    descriptor: String,
    access_flags: u16,
    signature: Option<String>,
    first_line: Option<u16>,
    last_line: Option<u16>,
}
#[derive(Serialize)]
struct ClassSymbols {
    name: String,
    superclass: Option<String>,
    interfaces: Vec<String>,
    class_version: String,
    access_flags: u16,
    signature: Option<String>,
    source_file: Option<String>,
    fields: Vec<CodeMember>,
    methods: Vec<CodeMember>,
    sha256: String,
}
struct Bytes<'a> {
    data: &'a [u8],
    at: usize,
}
impl<'a> Bytes<'a> {
    fn take(&mut self, size: usize) -> Result<&'a [u8]> {
        let end = self
            .at
            .checked_add(size)
            .ok_or_else(|| invalid("Invalid class length"))?;
        let bytes = self
            .data
            .get(self.at..end)
            .ok_or_else(|| invalid("Truncated class file"))?;
        self.at = end;
        Ok(bytes)
    }
    fn u1(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }
    fn u2(&mut self) -> Result<u16> {
        Ok(u16::from_be_bytes(self.take(2)?.try_into().unwrap()))
    }
    fn u4(&mut self) -> Result<u32> {
        Ok(u32::from_be_bytes(self.take(4)?.try_into().unwrap()))
    }
}
enum Constant {
    Other,
    Text(String),
    Class(u16),
}
fn text(pool: &[Constant], index: u16) -> Result<&str> {
    match pool.get(index as usize) {
        Some(Constant::Text(text)) => Ok(text),
        _ => Err(invalid("Invalid class text reference")),
    }
}
fn class(pool: &[Constant], index: u16) -> Result<Option<String>> {
    if index == 0 {
        return Ok(None);
    }
    match pool.get(index as usize) {
        Some(Constant::Class(name)) => Ok(Some(text(pool, *name)?.replace('/', "."))),
        _ => Err(invalid("Invalid class name reference")),
    }
}
fn attributes<'a>(bytes: &mut Bytes<'a>, pool: &[Constant]) -> Result<Vec<(String, &'a [u8])>> {
    let mut result = Vec::new();
    for _ in 0..bytes.u2()? {
        let name = text(pool, bytes.u2()?)?.to_string();
        let size = bytes.u4()? as usize;
        result.push((name, bytes.take(size)?));
    }
    Ok(result)
}
fn members(bytes: &mut Bytes<'_>, pool: &[Constant], kind: &str) -> Result<Vec<CodeMember>> {
    let mut result = Vec::new();
    for _ in 0..bytes.u2()? {
        let flags = bytes.u2()?;
        let name = text(pool, bytes.u2()?)?;
        let descriptor = text(pool, bytes.u2()?)?;
        let mut first = None::<u16>;
        let mut last = None::<u16>;
        let mut signature = None;
        for (attribute, raw) in attributes(bytes, pool)? {
            let mut data = Bytes { data: raw, at: 0 };
            if attribute == "Signature" {
                signature = Some(text(pool, data.u2()?)?.to_string());
            }
            if attribute == "Code" && kind == "method" {
                data.take(4)?;
                let size = data.u4()? as usize;
                data.take(size)?;
                let handlers = data.u2()? as usize;
                data.take(handlers * 8)?;
                for (attribute, raw) in attributes(&mut data, pool)? {
                    if attribute == "LineNumberTable" {
                        let mut lines = Bytes { data: raw, at: 0 };
                        for _ in 0..lines.u2()? {
                            lines.u2()?;
                            let line = lines.u2()?;
                            first = Some(first.map_or(line, |v| v.min(line)));
                            last = Some(last.map_or(line, |v| v.max(line)));
                        }
                    }
                }
            }
        }
        result.push(CodeMember {
            kind: kind.into(),
            name: name.into(),
            descriptor: descriptor.into(),
            access_flags: flags,
            signature,
            first_line: first,
            last_line: last,
        });
    }
    Ok(result)
}
fn parse(data: &[u8]) -> Result<ClassSymbols> {
    let mut bytes = Bytes { data, at: 0 };
    if bytes.u4()? != 0xcafebabe {
        return Err(invalid("This entry is not a Java class file"));
    }
    let minor = bytes.u2()?;
    let major = bytes.u2()?;
    let count = bytes.u2()? as usize;
    let mut pool = vec![Constant::Other];
    while pool.len() < count {
        let tag = bytes.u1()?;
        let item = match tag {
            1 => {
                let size = bytes.u2()? as usize;
                Constant::Text(
                    cesu8::from_java_cesu8(bytes.take(size)?)
                        .map_err(|_| invalid("Invalid modified UTF-8 in class file"))?
                        .into_owned(),
                )
            }
            7 => Constant::Class(bytes.u2()?),
            3 | 4 | 9 | 10 | 11 | 12 | 17 | 18 => {
                bytes.take(4)?;
                Constant::Other
            }
            5 | 6 => {
                bytes.take(8)?;
                pool.push(Constant::Other);
                Constant::Other
            }
            8 | 16 | 19 | 20 => {
                bytes.take(2)?;
                Constant::Other
            }
            15 => {
                bytes.take(3)?;
                Constant::Other
            }
            _ => {
                return Err(invalid(
                    "Unsupported constant-pool tag; symbols could not be verified",
                ))
            }
        };
        pool.push(item);
    }
    if pool.len() != count {
        return Err(invalid("Invalid constant-pool slot count"));
    }
    let flags = bytes.u2()?;
    let name = class(&pool, bytes.u2()?)?.ok_or_else(|| invalid("Missing class name"))?;
    let superclass = class(&pool, bytes.u2()?)?;
    let mut interfaces = Vec::new();
    for _ in 0..bytes.u2()? {
        interfaces
            .push(class(&pool, bytes.u2()?)?.ok_or_else(|| invalid("Missing interface name"))?);
    }
    let fields = members(&mut bytes, &pool, "field")?;
    let methods = members(&mut bytes, &pool, "method")?;
    let mut source = None;
    let mut signature = None;
    for (attribute, raw) in attributes(&mut bytes, &pool)? {
        let mut data = Bytes { data: raw, at: 0 };
        if attribute == "SourceFile" {
            source = Some(text(&pool, data.u2()?)?.to_string());
        }
        if attribute == "Signature" {
            signature = Some(text(&pool, data.u2()?)?.to_string());
        }
    }
    if bytes.at != data.len() {
        return Err(invalid("Unexpected bytes after class metadata"));
    }
    Ok(ClassSymbols {
        name,
        superclass,
        interfaces,
        class_version: format!("{major}.{minor}"),
        access_flags: flags,
        signature,
        source_file: source,
        fields,
        methods,
        sha256: format!("{:x}", Sha256::digest(data)),
    })
}
fn safe_entry(name: &str) -> bool {
    !name.is_empty()
        && !name.contains(['\\', ':', '\0'])
        && name
            .split('/')
            .all(|p| !p.is_empty() && p != "." && p != "..")
}
fn read_entry<R: Read + Seek>(
    archive: &mut zip::ZipArchive<R>,
    name: &str,
    budget: u64,
) -> Result<Vec<u8>> {
    if !safe_entry(name) {
        return Err(invalid("Invalid archive entry path"));
    }
    let mut file = archive
        .by_name(name)
        .map_err(|e| Error::other(e.to_string()))?;
    if file.size() > budget {
        return Err(invalid(
            "Entry exceeds the inspection memory budget; its symbols are unverified",
        ));
    }
    let mut bytes = Vec::new();
    file.by_ref().take(budget + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > budget {
        return Err(invalid(
            "Expanded entry exceeds the inspection memory budget",
        ));
    }
    Ok(bytes)
}
fn inspect_archive<R: Read + Seek>(
    archive: &mut zip::ZipArchive<R>,
    class_path: Option<&str>,
) -> Result<Value> {
    if let Some(name) = class_path {
        if !name.ends_with(".class") {
            return Err(invalid("Choose a class entry"));
        }
        let bytes = read_entry(archive, name, 16 * 1024 * 1024)?;
        Ok(json!({"class_path":name,"symbol":parse(&bytes)?}))
    } else {
        let mut names = archive
            .file_names()
            .filter(|n| n.ends_with(".class") && safe_entry(n))
            .map(str::to_string)
            .collect::<Vec<_>>();
        names.sort();
        names.dedup();
        Ok(json!({"classes":names}))
    }
}

pub fn get(
    state: &AppState,
    target_kind: &str,
    target_id: &str,
    content_kind: &str,
    file_name: &str,
    archive_path: &str,
    class_path: Option<&str>,
) -> Result<Value> {
    if !matches!(content_kind, "mods" | "plugins")
        || file_name.contains(['/', '\\', ':', '\0'])
        || !file_name.ends_with(".jar")
    {
        return Err(invalid("Choose an installed JAR file"));
    }
    let root = match target_kind {
        "instance" => crate::commands::find_instance(state, target_id)?.dir,
        "server" => crate::commands::find_server(state, target_id)?.dir,
        _ => return Err(invalid("Unknown installation type")),
    };
    let folder = Path::new(&root).join(content_kind);
    let path = crate::content::resolve_path(&state.files, &folder, file_name);
    for entry in [&folder, &path] {
        if state.files.symlink_metadata(entry)?.is_symlink() {
            return Err(invalid("Linked code files cannot be inspected"));
        }
    }
    let mut input = state.files.open(&path)?;
    let before = input.metadata()?;
    let mut digest = Sha256::new();
    let mut buffer = [0; 65536];
    loop {
        let size = input.read(&mut buffer)?;
        if size == 0 {
            break;
        }
        digest.update(&buffer[..size]);
    }
    let artifact_hash = format!("{:x}", digest.finalize());
    input.seek(SeekFrom::Start(0))?;
    let mut archive = zip::ZipArchive::new(input).map_err(|e| Error::other(e.to_string()))?;
    let mut archive_hash = artifact_hash.clone();
    let mut result = if archive_path.is_empty() {
        inspect_archive(&mut archive, class_path)?
    } else {
        let facts = crate::mod_manifest::inspect(&state.files, &path)?;
        if !facts
            .provenance
            .iter()
            .any(|p| p.archive_path == archive_path)
        {
            return Err(invalid(
                "This bundled archive is not declared by the installed mod",
            ));
        }
        let names = archive_path
            .strip_suffix("!/")
            .ok_or_else(|| invalid("Invalid bundled archive path"))?
            .split("!/")
            .collect::<Vec<_>>();
        let mut budget = 128 * 1024 * 1024;
        let mut data = read_entry(&mut archive, names[0], budget)?;
        budget -= data.len() as u64;
        for name in &names[1..] {
            let mut child =
                zip::ZipArchive::new(Cursor::new(data)).map_err(|e| Error::other(e.to_string()))?;
            data = read_entry(&mut child, name, budget)?;
            budget -= data.len() as u64;
        }
        archive_hash = format!("{:x}", Sha256::digest(&data));
        inspect_archive(
            &mut zip::ZipArchive::new(Cursor::new(data))
                .map_err(|e| Error::other(e.to_string()))?,
            class_path,
        )?
    };
    let mut current = state.files.open(&path)?;
    let after = current.metadata()?;
    let mut digest = Sha256::new();
    loop {
        let size = current.read(&mut buffer)?;
        if size == 0 {
            break;
        }
        digest.update(&buffer[..size]);
    }
    if before.len() != after.len()
        || before.modified()? != after.modified()?
        || artifact_hash != format!("{:x}", digest.finalize())
    {
        return Err(invalid(
            "The installed file changed during inspection. Refresh to inspect its new bytes.",
        ));
    }
    result["artifact_sha256"] = json!(artifact_hash);
    result["archive_sha256"] = json!(archive_hash);
    result["archive_path"] = json!(archive_path);
    result["file_name"] = json!(file_name);
    result["target_kind"] = json!(target_kind);
    result["target_id"] = json!(target_id);
    result["content_kind"] = json!(content_kind);
    result["evidence_class"] = json!("measured");
    result["parser_version"] = json!("class-symbols-1");
    result["scope"]=json!("Static class metadata. Source filenames and lines are compiler declarations; source equivalence, rights and runtime execution are not inferred.");
    Ok(result)
}
