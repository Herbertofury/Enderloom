pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const CHANNEL: &str = env!("BASALT_BUILD_CHANNEL");
pub const DEV_BUILD: &str = env!("BASALT_DEV_BUILD");
#[cfg(target_os = "linux")]
pub const DISTRIBUTION: &str = env!("BASALT_DISTRIBUTION");
const CURSEFORGE_API_KEY: &str = env!("BASALT_CURSEFORGE_API_KEY");
const DISCORD_APP_ID: &str = env!("BASALT_DISCORD_APP_ID");

pub fn bundled_curseforge_key() -> Option<&'static str> {
    Some(CURSEFORGE_API_KEY.trim()).filter(|key| !key.is_empty())
}

/// Runtime deployment credentials take precedence over the packaged app key.
/// Values never cross the settings/UI boundary; only availability is exposed.
pub fn automatic_curseforge_key() -> Option<String> {
    ["ENDERLOOM_CURSEFORGE_API_KEY", "CURSEFORGE_API_KEY"]
        .iter()
        .filter_map(|name| std::env::var(name).ok())
        .map(|value| value.trim().to_owned())
        .find(|value| !value.is_empty())
        .or_else(|| bundled_curseforge_key().map(str::to_owned))
}

pub fn bundled_discord_app_id() -> Option<&'static str> {
    Some(DISCORD_APP_ID.trim()).filter(|id| !id.is_empty())
}

pub fn display_version() -> String {
    if CHANNEL == "dev" {
        format!("{VERSION}-dev.{DEV_BUILD}")
    } else {
        VERSION.to_string()
    }
}
