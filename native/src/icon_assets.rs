use base64::Engine;
use sha2::{Digest, Sha256};
use crate::files::FileManager;

/// Keep tiny icons inline, but carry larger original artwork by a local asset
/// reference. Inventory refreshes do not repeatedly copy full image blobs.
pub fn embedded_icon_url(files: &FileManager, mime: &str, bytes: &[u8]) -> Option<String> {
    if bytes.len() <= 512 {
        return Some(format!("data:{mime};base64,{}",base64::engine::general_purpose::STANDARD.encode(bytes)));
    }
    let extension = match mime { "image/png" => "png", "image/jpeg" => "jpg", "image/webp" => "webp", _ => return None };
    let hash = format!("{:x}",Sha256::digest(bytes));
    let path = files.paths().root.join("icon-cache").join(format!("{hash}.{extension}"));
    if !files.exists(&path).ok()? { files.write_atomic(&path,bytes).ok()?; }
    Some(format!("enderloom-asset://local/{}",base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(path.to_string_lossy().as_bytes())))
}

pub fn compact_existing_icon(files: &FileManager, value: &str) -> Option<String> {
    if value.len() <= 710 { return None; }
    let (header,body)=value.split_once(",")?;
    let mime=header.strip_prefix("data:")?.strip_suffix(";base64")?;
    if body.len()>1024*1024 { return None; }
    let bytes=base64::engine::general_purpose::STANDARD.decode(body).ok()?;
    embedded_icon_url(files,mime,&bytes)
}

pub fn available(files: &FileManager, url: &str) -> bool {
    let Some(encoded)=url.strip_prefix("enderloom-asset://local/") else { return true; };
    base64::engine::general_purpose::URL_SAFE_NO_PAD.decode(encoded).ok()
        .and_then(|bytes|String::from_utf8(bytes).ok()).is_some_and(|path|files.exists(path).unwrap_or(false))
}
