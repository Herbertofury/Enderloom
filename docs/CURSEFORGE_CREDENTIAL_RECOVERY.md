# CurseForge credential preservation and recovery

Enderloom stores its saved CurseForge key in the current Windows user's Credential Manager under the service `com.megalithofficial.basalt-launcher` and account `settings/curseforge-api-key`. The launcher database and a source checkout do not back up that secret. Preserve the Windows account and its credential store during migrations or cleanup; do not delete or reset the entry. Keep a separately secured copy of an approved key in a trusted password manager if one is available. Never commit it to Git, put it in an issue, paste it into logs, or send it to anyone.

If CurseForge search or update checks report that no credential is available:

1. Open **Settings → Integrations** and enter your approved CurseForge API key. Restart Enderloom and retry the check. A saved key is displayed as a mask, not its value.
2. If the user has authorized use of the credential from their own installed CurseForge app, the Windows-only recovery helper can validate the installed app's credential against the official API and store it in the same Windows credential vault. From a working Enderloom source checkout with Node and the native service built, run:

   ```powershell
   node scripts/recover-curseforge-credential.cjs --verify
   node scripts/recover-curseforge-credential.cjs --restore
   ```

   The first command makes no changes. The second refuses to overwrite an existing saved key. It does not print the credential or write it to a source file. Restart Enderloom after recovery because a running service may have cached the missing-key result. The helper recognizes the installed app layout observed on November 14, 2026; a future app update may require adjusting it. If verification fails, obtain an approved key through CurseForge and use Settings instead.
3. Deployment operators can alternatively supply `ENDERLOOM_CURSEFORGE_API_KEY` at runtime through a protected environment. Do not commit it or expose it in command history. A bundled deployment credential is another supported route when legitimately provisioned.

After recovery, retry a CurseForge search and the instance update check. A successful search verifies API access; the full update check can take longer and can still fail for another provider. Existing results are retained when a provider cannot be checked.

On November 14, 2026, a previously working credential was absent from the Windows vault. An authorized installed-app credential was validated against the official API and restored to the vault. Live Enderloom search, project details, versions and filters passed. The original reason the vault entry disappeared was not established; this guide and helper do not guarantee that credentials can never be lost.
