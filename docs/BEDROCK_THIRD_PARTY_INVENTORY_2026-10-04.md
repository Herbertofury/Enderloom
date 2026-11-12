# Bedrock third-party source inventory

**Read-only observations, October 4, 2026. Integration/conversion remains planned.**

[Roadmap](https://github.com/Herbertofury/Enderloom/wiki/Marketplace-Studio-and-Bedrock-Roadmap) / [Conversion fixture plan](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/BEDROCK_JAVA_CONVERSION_FIDELITY_AND_ACTIONS_STUFF_2026-10-04.md) / [Machine-readable public index](https://github.com/Herbertofury/Enderloom/blob/docs/marketplace-studio-bedrock-roadmap-2026-10-04/docs/bedrock-third-party-provenance-2026-10-04.json)

Original location: `C:/Users/Owner/Desktop/Enderloom/third_party`. ZIP directory
tables, selected readable manifests, project metadata and notices were inspected
with standard archive readers. Archives were hashed without extraction or bundled
code execution. Original files and the active AoA working tree were not changed.
This public inventory contains file identities and findings, not source archives,
paid assets, account credentials, content keys or permission documents.

## Exact supplied files

| Original filename | Bytes | File members | SHA-256 |
| --- | ---: | ---: | --- |
| `PackDL-v1.6 Source.zip` | 7,857,676 | 141 | `02e74e89d8d22ce10288cd9f64ca9e92848e4694d4333e41ee1bbcb9fe3e26ae` |
| `McTools-v12_Source.zip` | 5,094,833 | 108 | `808036a1cc00293116415dbb4c9939fdd21f0d5d829568b882b93502597d0989` |
| `Actions & Stuff 1.11.1 2cf066eb-1254-4b7d-affb-80fe3216b18c resources.mcpack` | 29,621,325 | 12,137 | `60734380e2bb4aaeed023ea119de0055e7883b6e878070d4d9dce3d85ae8ff10` |
| `Actions & Stuff 1.11.1 218d7771-3b76-4bdf-a46e-5f76af23353a skin_pack.mcpack` | 57,553 | 36 | `e23a5a37f67817a093eb7210e1dde554ca3f0dc58fc1b0d97ed966b5e02653c9` |

Member counts exclude directory entries. No traversal-style paths were found by
the directory-table scan; this is not a complete archive security certification.
None of the four inputs is missing. No behavior/script pack or independent
reference Java conversion was identified among these four files.

## Source/runtime/license observations

**PackDL.** Projects `PackDl`, `PackLib` and `PackServer` target .NET 8. The library
declares `fNbt-netcore 0.6.5` and `Newtonsoft.Json 13.0.4`. Source contains distinct
entitlement, PlayFab authentication/inventory, download and `.brarchive` processing
areas, plus server/provider and network-related code. Adapter review must select
the entitled/user-authorized supported flow rather than indiscriminately running
the entire upstream program. No LICENSE/COPYING/NOTICE file was found in the
supplied archive; public redistribution terms are not established by this
inventory. Reconcile source/tag and distribution terms with the intended
integration scope. The user reports all-party permission; ordinary planning
continues on that basis.

**McTools.** `LibMcCrypt`, `McDecryptor` and `McEncryptor` target .NET Framework
4.8; the source includes archive processing and Marketplace/local-cache handling.
`mctools/LICENSE` contains a BSD-3-Clause-style grant, copyright 2024
BedrockReverse, with source/binary notice retention and a non-endorsement clause.
The source archive also bundles Newtonsoft.Json 13.0.1 (MIT) and System.IO.Compression
4.3.0 license/third-party notices. Preserve the complete notices and audit all
bundled dependencies before packaging. .NET Framework 4.8 is a concrete runtime
dependency to provision or adapt; cross-platform behavior has not been tested.

**Actions & Stuff resources.** Header UUID
`2cf066eb-1254-4b7d-affb-80fe3216b18c`, manifest `format_version: 3`, header/module
version `1.1.54`, `min_engine_version: 1.26.10`, resource module UUID
`22ed17a6-ea7c-5ccd-93b4-b90e86ce0046`, author `Oreville Studios Ltd`. No declared
dependencies, data/script module or `metadata.license` was observed. There are
19 `.brarchive` files under `__brarchive`, covering animations, animation
controllers, attachables, entity definitions/models, particles, render controllers,
materials, audio, textures, text and UI. Inner semantic completeness and encryption
state were not established by this read-only scan. 2,577 JSON-named members within
the reader's 2 MiB/member bound parsed; those checks do not inspect archive inner
members or validate game schemas.

**Actions & Stuff skins.** Header UUID
`218d7771-3b76-4bdf-a46e-5f76af23353a`, format 1, header/module version `[1,1,54]`,
skin module UUID `56da2e57-c634-41df-8f50-d5cf337c4b18`. No metadata license or
declared dependencies was observed. Both filenames use `1.11.1`, which differs
from the manifests. Preserve exact hashes and naming until the creator/source
receipt reconciles that identity; do not assume a missing file or wrong edition.

The [official product identity](https://www.minecraft.net/en-us/marketplace/pdp?id=61c7a786-d7ad-49e0-a710-817121cd9795)
is separate from pack UUIDs. A changing storefront title is not proof that these
local bytes are the current retail revision. Test artifacts stay local/private;
this roadmap does not publish paid content or infer redistribution rights from
possession of an archive.

## Verified upstream locations

| Source | Verification and current observation | Next action |
| --- | --- | --- |
| [Official Marketplace](https://www.minecraft.net/en-us/marketplace) | Official page resolves; search extraction omits much client-rendered catalogue behavior | Implement/test the full native browser site; verify the permitted structured API contract separately |
| [PackDL releases](https://git.silica.codes/BedrockReverse/PackDL/releases) | Direct HTML timed out twice in this environment; [same-host API](https://git.silica.codes/api/v1/repos/BedrockReverse/PackDL/releases?limit=1) returned `v1.6`, published `2026-08-27T04:46:38Z`, with `lin64.zip` / `win64.zip` assets | Keep the supplied releases URL; use API metadata with retry/error handling for tracking |
| [PackDL v1.6 tag](https://git.silica.codes/BedrockReverse/PackDL/releases/tag/v1.6) | [Tag reference](https://git.silica.codes/api/v1/repos/BedrockReverse/PackDL/git/refs/tags/v1.6) resolves to commit `0a0e14721fd54749d6a1edd6580659e962f3488c` | Compare source member hashes to exact upstream tag before adopting the local source as that release |
| [McTools releases](https://git.silica.codes/BedrockReverse/McTools/releases) | HTML and [same-host API](https://git.silica.codes/api/v1/repos/BedrockReverse/McTools/releases?limit=1) identify `v12`, published `2026-08-27T04:41:00Z`, asset `McTools v12.zip` | Track source and binary artifacts independently |
| [McTools v12 tag](https://git.silica.codes/BedrockReverse/McTools/releases/tag/v12) | [Tag reference](https://git.silica.codes/api/v1/repos/BedrockReverse/McTools/git/refs/tags/v12) resolves to commit `15412fd2a21cddcb94c08397a36bbec3a0f0a59c` | Confirm exact local/upstream correspondence and preserve notices |

The release asset metadata inspected lists no detached signature/checksum
attachment. No binaries were downloaded or executed, no signatures were claimed
verified and local archives were not proven identical to upstream source ZIPs.
Record future signature/attestation availability rather than treating a SHA-256
measured locally as publisher authentication.

## Dependencies to resolve without narrowing scope

The concrete next work is release-source correspondence, PackDL distribution
metadata, managed .NET runtime adapters, a supported provider/authentication and
entitlement contract, filename/manifest identity reconciliation, and the full
archive-inner census. These keep affected implementation acceptance open; they
do not establish impossibility. The requested browsing, two download routes,
comparison and full conversion targets remain in the roadmap.

The current primary sources describe [deep links](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/deep-links?view=minecraft-bedrock-stable),
[pack manifests](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/packmanifest?view=minecraft-bedrock-stable),
[animation controllers](https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable),
[Molang](https://learn.microsoft.com/en-us/minecraft/creator/documents/molang/introduction?view=minecraft-bedrock-stable)
and [Java rendering](https://docs.fabricmc.net/develop/rendering/basic-concepts).
They support format/runtime-specific implementation and testing; they do not
certify this fixture's conversion or a private API grant. No legal partnership or
unrestricted asset redistribution claim is made in public documentation.

## Wiki source of truth

The authored roadmap lives in `docs/wiki/Marketplace-Studio-and-Bedrock-Roadmap.md`.
Existing `scripts/knowledge/knowledge.py` imports authored wiki guides into
`docs/knowledge` and `build/knowledge/wiki`, adds feature-guide sidebar navigation,
checks links and retains `requirements.json` as the single progress owner.
Publication follows `.github/workflows/enderloom-knowledge.yml`'s manifest/collision
checks and verifies pushed page bytes. The new pages are published from the
feature branch as explicitly planned material; their new source links target that
branch until a later reviewed merge/link update. AoA and existing progress are
not marked complete.
