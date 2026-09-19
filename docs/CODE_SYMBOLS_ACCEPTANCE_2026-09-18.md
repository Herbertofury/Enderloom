# Installed source and code identity

PA-004 now has declared source/licensing provenance and directly measured class symbols in the canonical project detail. The existing installed-file and nested-manifest projections supply the archive identities; GitHub config declarations reuse the existing verified repository queue and pinned revisions. No secondary inventory, source crawler or project database was added.

`get_content_code_symbols` is one read-only native operation shared by the GUI, service and generic CLI operation route. Its response identifies the instance/server, content kind, filename, nested archive, parser version and SHA-256 of the installed artifact, selected archive and selected class. It lists every class path, then reads fields, overloaded methods, descriptors, signatures, class version, superclass/interfaces and compiler-recorded source filenames/line ranges only when a class is selected. Rust members/classes and frontend results have explicit types. No mod class is loaded or executed. Files are rehashed after reading to reject concurrent changes.

The project detail's **Source & licenses → Explore installed code** provides search, pagination without dropping class entries, refresh, member expansion and exact fingerprints. Bundled mods remain separate. Missing debug metadata stays unknown. Corrupt entries show an error without hiding other classes. Closing/navigating/changing selection invalidates late responses. Metadata/bounded decompression errors are explicit, never treated as an empty successful inspection.

Verification:

- Native `code-symbols-qa.js`: 68 classes, overloads, JVM descriptors, source lines, modified UTF-8, long/double constant-pool slots, invokedynamic, separate nested ownership, stripped debug data, malformed/truncated entries, invalid paths, undeclared nested archives, disabled files, byte preservation, same-size/time edits and service/CLI parity.
- Real Electron `code-symbols-ui-qa.js`: search, page two, source lines/hashes, malformed entry recovery, nested class selection and an intentionally held stale response. Screenshot: `output/playwright/code-symbols.png`.
- Existing bundled manifests, GitHub config-source matching, project relationships and operation coverage passed.
- The user's installed Aether 1.5.2 for 1.20.1 in Noxviola's Dream was inspected read-only: 977 classes; `com.aetherteam.aether.item.combat.GravititeSwordItem`, `GravititeSwordItem.java`, two methods, source lines 11–12 and 16–17. Installed SHA-256: `5cb64ab1f27e78e8338fe67f9c766578904aad9bc1f8bcc90f306ea52aea3fc5`. Bundled Cumulus contained 23 classes and retained its own archive hash. Evidence: `output/aether-code-symbols-real.json` and actual app screenshot `output/playwright/aether-real-code-symbols.png`.

The observed symbols include original obfuscated names where present. This accepts identity/provenance/code metadata, not decompilation, remapping, build-to-source equivalence, runtime execution, or a legal rights determination. Declared asset/code licenses stay distinct; missing rights remain unknown. Broader mapping, Mixin, audit and conversion behavior belongs to later requirements.

Format reference: [JVM class-file specification](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html).
