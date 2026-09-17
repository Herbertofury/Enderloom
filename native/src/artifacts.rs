use std::{io::Read, path::Path};
use sha2::{Digest, Sha256, Sha512};
use crate::{db::{ArtifactIdentity, ContentFile, Db, FileHash, ProjectGraph}, error::{Error,Result}, files::FileManager, state::AppState};

pub fn observe(db: &Db, files: &FileManager, target_kind: &str, target_id: &str, kind: &str, source: &ContentFile, path: &Path) -> Result<()> {
    let mut file = files.open(path)?;
    let before = file.metadata()?;
    let mut sha256 = Sha256::new(); let mut sha512 = Sha512::new(); let mut sha1 = sha1_smol::Sha1::new();
    let mut buffer = [0u8; 65536]; let mut size = 0u64;
    loop { let count = file.read(&mut buffer)?; if count == 0 { break; } sha256.update(&buffer[..count]); sha512.update(&buffer[..count]); sha1.update(&buffer[..count]); size += count as u64; }
    let after = file.metadata()?;
    let current = files.open(path)?.metadata()?;
    if before.len()!=size || after.len()!=size || current.len()!=size || before.modified()? != after.modified()? || current.modified()? != after.modified()? { return Err(Error::other("File changed while its identity was being measured; verify again after editing stops")); }
    let sha256 = format!("{:x}",sha256.finalize());
    let artifact = ArtifactIdentity{sha256:sha256.clone(),size,hashes:vec![FileHash{algorithm:"sha256".into(),value:sha256},FileHash{algorithm:"sha1".into(),value:sha1.digest().to_string()},FileHash{algorithm:"sha512".into(),value:format!("{:x}",sha512.finalize())}],evidence_class:"measured".into()};
    db.record_artifact_observation(target_kind,target_id,kind,source,&artifact)
}

pub async fn observe_installed(state: &AppState, target_kind: &str, target_id: &str, kind: &str, source: &ContentFile, path: &Path) -> Result<()> {
    let db=state.db.clone(); let files=state.files.clone(); let source=source.clone(); let path=path.to_owned();
    let target_kind=target_kind.to_owned(); let target_id=target_id.to_owned(); let kind=kind.to_owned();
    tokio::task::spawn_blocking(move || observe(&db,&files,&target_kind,&target_id,&kind,&source,&path)).await.map_err(|error|Error::other(error.to_string()))?
}

pub async fn verify_project(state: &AppState, provider: String, project: String) -> Result<ProjectGraph> {
    crate::search::Provider::parse(&provider)?;
    let mut jobs = Vec::new();
    for instance in state.db.list_instances(&state.files)? {
        for (kind,source) in state.db.all_content_files(&instance.id)? {
            if source.provider.as_deref()==Some(&provider) && source.project_id.as_deref()==Some(&project) {
                let dir=state.paths.instance_dir(&instance.id).join(&kind);
                let path=crate::content::resolve_path(&state.files,&dir,&source.file_name);
                jobs.push((instance.id.clone(),kind,source,path));
            }
        }
    }
    let db=state.db.clone(); let files=state.files.clone();
    tokio::task::spawn_blocking(move || {
        for (target,kind,source,path) in jobs { observe(&db,&files,"instance",&target,&kind,&source,&path)?; }
        db.project_artifact_graph(&provider,&project)
    }).await.map_err(|error|Error::other(error.to_string()))?
}
