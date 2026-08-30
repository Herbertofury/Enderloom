# impit native transport provenance

Vendored from Apify `impit` JavaScript release `js-0.14.4` (Apache-2.0), commit `4fd6c3167c55d9d059a3e5872846e0b5c0a31e3b`.

Official GitHub Actions artifacts:
- Linux x64 GNU: artifact 9559385984, workflow archive SHA-256 `811c041150a835e424e534782c78a3e0ff69aed5d1762693043fb2b933a31b3f`.
- Windows x64 MSVC: artifact 9559459356, workflow archive SHA-256 `04538e8ea9a8ec3156695597542a287c9427ba61fb7391df3cbb98e09456bf80`.

The companion loads the N-API binding directly and uses the native `Impit` / streamed `ImpitResponse.body` APIs. HTTP/3 is enabled on the shared client; selected visible CurseForge gallery hedges additionally set `forceHttp3: true`.
