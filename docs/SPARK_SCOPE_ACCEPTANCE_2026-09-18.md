# Spark instance isolation

Pending Spark/log analysis keeps its original instance when saved. Results, errors, mod identity, filters and busy state cannot leak into another instance or a remounted view. Saved evidence no longer silently stops at 30 reports.

Verified with the real native service and Electron: `spark-scope-ui-qa.js` retained all 66 reports, switched instances during delayed analysis and delayed failure, and verified the other instance kept exactly its own report. `spark-ui-qa.js` verified worker parsing, 60/40 sample attribution, log findings, persistence after reload and zero renderer errors. Both suites are in the release gate.
