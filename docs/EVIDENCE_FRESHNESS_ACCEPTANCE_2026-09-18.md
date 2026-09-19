# Evidence freshness acceptance

PA-011 uses the existing task/service/CLI owner to check retained source, normalized record, producer version and exact input dependencies. The UI exposes **Check current inputs**, a timestamp, current/stale/unknown state and individual reasons.

Testing Lab evidence is compared against a fresh full inspection of the source instance, including mod hashes, enabled state, configs, content and launch settings. Changed mods/configs/settings are named. A newer full inspection invalidates a cached check; incomplete list-only inspections cannot certify freshness. Restoring original inputs restores a current result after rechecking. Imported reports without a recorded runtime input fingerprint remain unknown for current-instance applicability.

Package evidence follows its exact SHA-256 in the current project inputs. Adding an unrelated reference does not invalidate it. Replacing/removing that package does. Previous evidence is preserved. Source verification and input checks remain distinct from semantic/runtime acceptance; checks are observations at their recorded time, not an always-on filesystem monitor.

Verified:

- Native service/CLI and frontend builds; operation coverage.
- `evidence-freshness-qa.js`: matching inputs, config change with filename, same-name changed mod, restoration, newer-scan invalidation, independent reference preservation, replaced project input, unknown import, adapter version change and restart.
- `evidence-graph-qa.js`, `evidence-ui-qa.js`, `studio-ui-qa.js` pass after this change. New freshness suite is in the release gate; the preceding evidence checkpoint passed all 76 then-registered release suites.
- Installed Enderloom: actual AoA authority package reports **Inputs still match**. Actual Aether rendered run `cfbe854f-5b91-4e1b-97d1-dc332c28614d` matches all four dependencies, including the full installed-input fingerprint (`output/aether-evidence-freshness.json`). No new game launch was required or claimed.

Next master dependency: PA-020 task model expansion. AoA Savior's private promoted source/receipt bundle and Dev Kit still need acquisition; the original donor packages are now recovered and verified separately.
