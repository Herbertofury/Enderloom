# Hidden media page lifecycle

The DOM extraction pool now executes against the captured ready frame, applies one deadline across navigation and extraction, and destroys unfinished lookups. Successful lookups stop requests, drain the previous navigation, reset to a blank document, and clear history before reusing the browser. Idle browsers retire; shutdown rejects queued work and closes extraction-owned browsers. Existing user tabs, discovery result coverage and foreground capacity are preserved.

Electron's `WebContents.executeJavaScript` waits for `did-stop-loading` internally. Racing that promise against a timeout did not remove its listener and could defer execution into a later project. The pool uses the documented ready-frame execution API instead: [Electron implementation](https://github.com/electron/electron/blob/main/lib/browser/api/web-contents.ts), [WebFrameMain API](https://www.electronjs.org/docs/latest/api/web-frame-main).

Verified on Electron 44.0.0:

- `media-view-lifecycle-qa.js`: 25 pages with deliberately hanging images, DOM result in 92 ms while still loading, all 25 requests abandoned on release, stable listener counts, muted extraction views, isolated errors/timeouts/redirects, foreground work in 63 ms while background slots were occupied, idle retirement and complete shutdown settlement.
- Full Electron self-test passes, including live media extraction, gallery/provider identity, browser navigation, history and split workspaces.
- All 60 release QA suites pass, including the new real Electron lifecycle regression.
- Real Home card navigation opens Noxviola's Dream 1.20.1 and lists its 630 installed/disabled mod files with both provider identities.

These local fixture timings measure DOM availability and cleanup, not a promise about remote video startup or internet speed. PA-003 remains the next incomplete graph requirement.
