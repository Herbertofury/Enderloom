use std::{
    collections::HashSet,
    sync::{Arc, Mutex, OnceLock},
};

use reqwest::{header::IF_NONE_MATCH, RequestBuilder, StatusCode};
use serde::{de::DeserializeOwned, Serialize};

use crate::{db::CachedResponse, error::Result, state::AppState};

pub const TTL_TAGS: i64 = 60 * 60 * 24;
pub const TTL_SEARCH: i64 = 60 * 5;
pub const TTL_PROJECT: i64 = 60 * 60;
pub const TTL_VERSIONS: i64 = 60 * 15;
pub const TTL_PROVIDER_MAP: i64 = 60 * 60 * 24;
pub const TTL_PROVIDER_MAP_MISS: i64 = 60 * 10;

pub const MAX_STALE_FALLBACK: i64 = 60 * 60 * 24;

fn now() -> i64 {
    chrono::Utc::now().timestamp()
}

fn servable_stale(cached: &Option<CachedResponse>) -> Option<&CachedResponse> {
    cached
        .as_ref()
        .filter(|entry| entry.age_secs <= MAX_STALE_FALLBACK)
}

fn rejects_key(status: StatusCode) -> bool {
    matches!(status, StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN)
}

pub async fn fetch<T: DeserializeOwned>(
    state: &AppState,
    key: &str,
    ttl_secs: i64,
    request: RequestBuilder,
) -> Result<T> {
    let cached = state.db.cache_get(key, now()).ok().flatten();
    if let Some(entry) = &cached {
        if entry.fresh {
            if let Ok(value) = serde_json::from_str(&entry.body) {
                return Ok(value);
            }
        }
    }

    let request = match cached.as_ref().and_then(|c| c.etag.as_deref()) {
        Some(etag) => request.header(IF_NONE_MATCH, etag),
        None => request,
    };

    let fetched = match state.network.fetch_body(request).await {
        Ok(fetched) => fetched,
        Err(e) => match servable_stale(&cached) {
            Some(entry) => return Ok(serde_json::from_str(&entry.body)?),
            None => return Err(e),
        },
    };

    if fetched.status == StatusCode::NOT_MODIFIED {
        if let Some(entry) = &cached {
            let _ = state.db.cache_touch(key, now());
            return Ok(serde_json::from_str(&entry.body)?);
        }
    }

    if !fetched.status.is_success() {
        let error = crate::error::Error::http_response(fetched.status, fetched.body.as_bytes());
        if rejects_key(fetched.status) {
            return Err(error);
        }
        return match servable_stale(&cached) {
            Some(entry) => Ok(serde_json::from_str(&entry.body)?),
            None => Err(error),
        };
    }

    let value = serde_json::from_str(&fetched.body)?;
    let _ = state
        .db
        .cache_put(key, &fetched.body, fetched.etag.as_deref(), now(), ttl_secs);
    Ok(value)
}

fn background_refreshes() -> &'static Mutex<HashSet<String>> {
    static REFRESHING: OnceLock<Mutex<HashSet<String>>> = OnceLock::new();
    REFRESHING.get_or_init(|| Mutex::new(HashSet::new()))
}

fn spawn_background_refresh(
    state: &AppState,
    key: &str,
    ttl_secs: i64,
    request: RequestBuilder,
    cached: &CachedResponse,
) {
    {
        let mut refreshing = background_refreshes().lock().unwrap();
        if !refreshing.insert(key.to_string()) {
            return;
        }
    }

    let key = key.to_string();
    let db = state.db.clone();
    let network = Arc::clone(&state.network);
    let request = match cached.etag.as_deref() {
        Some(etag) => request.header(IF_NONE_MATCH, etag),
        None => request,
    };

    tokio::spawn(async move {
        let refreshed = match network.fetch_body(request).await {
            Ok(fetched) if fetched.status == StatusCode::NOT_MODIFIED => {
                db.cache_touch(&key, now())
            }
            Ok(fetched) if fetched.status.is_success() => {
                if serde_json::from_str::<serde_json::Value>(&fetched.body).is_err() {
                    tracing::warn!(cache_key = %key, "background cache refresh returned invalid JSON");
                    Ok(())
                } else {
                    db.cache_put(
                        &key,
                        &fetched.body,
                        fetched.etag.as_deref(),
                        now(),
                        ttl_secs,
                    )
                }
            }
            Ok(fetched) => {
                tracing::debug!(
                    cache_key = %key,
                    status = %fetched.status,
                    "background cache refresh kept stale value"
                );
                Ok(())
            }
            Err(error) => {
                tracing::debug!(
                    cache_key = %key,
                    %error,
                    "background cache refresh kept stale value"
                );
                Ok(())
            }
        };

        if let Err(error) = refreshed {
            tracing::warn!(cache_key = %key, %error, "could not persist background cache refresh");
        }
        background_refreshes().lock().unwrap().remove(&key);
    });
}

/// Cache-first stale-while-revalidate fetch for latency-sensitive, read-only browse metadata.
///
/// Fresh data is returned synchronously from SQLite. A still-servable stale entry is also
/// returned immediately while exactly one background refresh per key revalidates it. If no
/// usable cache exists, this falls through to the normal authoritative network path.
///
/// Use this for browse/search/project presentation data. Do not use it for mutation plans or
/// release selection where the caller requires freshly validated state before changing files.
pub async fn fetch_swr<T: DeserializeOwned>(
    state: &AppState,
    key: &str,
    ttl_secs: i64,
    request: RequestBuilder,
) -> Result<T> {
    let cached = state.db.cache_get(key, now()).ok().flatten();
    if let Some(entry) = &cached {
        if let Ok(value) = serde_json::from_str(&entry.body) {
            if entry.fresh {
                return Ok(value);
            }
            if servable_stale(&cached).is_some() {
                spawn_background_refresh(state, key, ttl_secs, request, entry);
                return Ok(value);
            }
        }
    }

    fetch(state, key, ttl_secs, request).await
}

pub fn local_json<T: DeserializeOwned>(state: &AppState, key: &str) -> Option<T> {
    let entry = state.db.cache_get(key, now()).ok().flatten()?;
    if !entry.fresh {
        return None;
    }
    serde_json::from_str(&entry.body).ok()
}

pub fn put_local_json<T: Serialize>(
    state: &AppState,
    key: &str,
    ttl_secs: i64,
    value: &T,
) -> Result<()> {
    let body = serde_json::to_string(value)?;
    state.db.cache_put(key, &body, None, now(), ttl_secs)
}

pub async fn post<T: DeserializeOwned>(state: &AppState, request: RequestBuilder) -> Result<T> {
    let fetched = state.network.fetch_body(request).await?;
    if !fetched.status.is_success() {
        return Err(crate::error::Error::http_response(
            fetched.status,
            fetched.body.as_bytes(),
        ));
    }
    Ok(serde_json::from_str(&fetched.body)?)
}

#[cfg(test)]
mod tests {
    use super::{rejects_key, servable_stale, MAX_STALE_FALLBACK};
    use crate::db::CachedResponse;
    use reqwest::StatusCode;

    fn entry(age_secs: i64) -> Option<CachedResponse> {
        Some(CachedResponse {
            body: "{}".to_string(),
            etag: None,
            fresh: false,
            age_secs,
        })
    }

    #[test]
    fn stale_entries_are_served_only_inside_the_fallback_window() {
        assert!(servable_stale(&entry(MAX_STALE_FALLBACK - 1)).is_some());
        assert!(servable_stale(&entry(MAX_STALE_FALLBACK)).is_some());
        assert!(servable_stale(&entry(MAX_STALE_FALLBACK + 1)).is_none());
        assert!(servable_stale(&None).is_none());
    }

    #[test]
    fn only_auth_failures_bypass_the_stale_fallback() {
        assert!(rejects_key(StatusCode::UNAUTHORIZED));
        assert!(rejects_key(StatusCode::FORBIDDEN));
        assert!(!rejects_key(StatusCode::INTERNAL_SERVER_ERROR));
        assert!(!rejects_key(StatusCode::TOO_MANY_REQUESTS));
        assert!(!rejects_key(StatusCode::SERVICE_UNAVAILABLE));
    }
}
