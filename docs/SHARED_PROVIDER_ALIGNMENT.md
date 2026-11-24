# Shared provider improvements — 2026-11-24

[Athena M1](https://github.com/Herbertofury/Athena/issues/363) compares overlapping real implementations. This slice adopts the exact identity pattern already used by Modhunter and Athena: Spiget resource ID, Hangar namespace owner/slug and GitLab project ID/path must bind to the requested project before the fast icon is shown. Missing/mismatched metadata does not suppress existing complete page/gallery routes. This uses [Spiget API docs](https://spiget.org/documentation/), [GitLab projects docs](https://docs.gitlab.com/api/projects/) and the existing Hangar namespace contract in Minecraft Mod Vault. The Hangar live endpoint was not reachable in the initial review.

The existing Modrinth batching route is retained, not replaced with another API request. It already handles case-sensitive Base62 IDs, ambiguous slugs, URL-length chunking and exact fallback. This change stops deduplication from collapsing different image names or extensions; the explicit gallery raw/preview relation and exact URL identify duplicates. A distinct media URL is not guaranteed distinct content, so further content-hash deduplication belongs after verified bytes, not before discovery. Tests: provider-api-fastlane-qa, provider-api-race-qa and modrinth-project-identity-qa. Real rendered-card performance and live provider validation remain required. Reuse the maintained code and test evidence via Athena; do not create a second Modrinth resolver.


## Live identity readback (2026-11-24)

Independent, tokenless HTTPS queries of the public project endpoints returned HTTP 200 JSON. The unmodified adapter at `e23eaea97d46` accepted the following exact response identities, produced a project icon URL, and kept canonical page/gallery enrichment eligible:

| Provider | Canonical project | Verified API identity |
| --- | --- | --- |
| Spiget | [Custom Images](https://www.spigotmc.org/resources/custom-images.53036/) | [Resource 53036](https://api.spiget.org/v2/resources/53036) |
| Hangar | [ViaVersion](https://hangar.papermc.io/ViaVersion/ViaVersion) | [Project 31, owner and slug ViaVersion](https://hangar.papermc.io/api/v1/projects/ViaVersion) |
| GitLab | [GitLab](https://gitlab.com/gitlab-org/gitlab) | [Project 278964, path gitlab-org/gitlab](https://gitlab.com/api/v4/projects/gitlab-org%2Fgitlab) |

The Spiget fixtures now use the canonical label and slug for resource 53036. The API's numeric resource ID, not the display label in the page URL, determines identity. The shell fetched public JSON through its configured HTTPS route; only adapter selection and returned metadata were verified. No icon bytes, native Electron networking, rendered cards, or rendered-card performance were tested.
