# Translate Web Pages integration origin

Minecraft Catalog Companion 2.6 integrates an audited Electron-native adapter inspired by and kept in sync with **Translate Web Pages (TWP)**:

- Upstream: https://github.com/FilipePS/Traduzir-paginas-web
- Baseline release: `v10.2.1.0`
- Upstream license: Mozilla Public License 2.0
- Upstream functionality tracked: page translation, engine switching, original/translated toggling, selected-text translation, dynamic-page translation, translation caching, and per-site automatic translation.

The runtime updater checks the official GitHub release API every six hours, downloads the official tagged source archive, verifies the TWP manifest identity/version and MPL-2.0 license, retains the relevant upstream source files for provenance, and imports only allow-listed translation-service endpoint recipes. Remote upstream JavaScript is **not executed blindly** in the privileged Electron main process.

The browser-facing translation DOM agent runs in a dedicated Chromium isolated world; remote pages receive no Node.js or Electron privileges. Page text is sent only to the translation service selected by the user.
