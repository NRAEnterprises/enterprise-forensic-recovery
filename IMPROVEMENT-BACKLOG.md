# Enterprise Forensic Recovery Improvement Backlog

## Purpose

This is one consolidated, review-ready list of improvements for the current `@enterprise-recovery/forensic-recovery` project. It covers the current 0.2.0 release, the gaps already visible in the repository, and the major capabilities required for a serious enterprise recovery platform. Items are grouped by domain for readability, but they form one backlog. Each item has a stable identifier and a suggested priority.

The current release is a dependency-light Node.js CLI with case creation, source registration, recursive inventory, SHA-256 hashing, leading-signature detection, basic binary diagnostics, ZIP validation and extraction through host tools, limited carving, project marker analysis, verification, audit logging, and JSON reports. It is not yet a complete filesystem, block-device, cloud, native-accelerated, or distributed forensic platform. The backlog deliberately distinguishes a recoverability improvement from a packaging or enterprise-governance improvement.

Priority meanings are **P0**, required for a trustworthy production foundation; **P1**, high-value capabilities for the first enterprise release; **P2**, important breadth, scale, or usability improvements; and **P3**, optional advanced features or long-term research.

## A. Product definition and recovery boundaries

1. **[P0] Publish a formal capability matrix.** Document every command, source type, filesystem, archive type, cloud provider, operating system, privilege requirement, maximum tested size, and recovery classification supported by each release.
2. **[P0] Define recovery-result semantics.** Standardize `recovered`, `verified`, `partial`, `carved`, `reconstructed`, `uncertain`, `encrypted`, `corrupted`, `unsupported`, and `unrecoverable` statuses with machine-readable definitions.
3. **[P0] Separate evidence preservation from recovery output.** Make it structurally impossible for repair or extraction jobs to overwrite registered source material unless an explicit administrative policy enables a destructive operation.
4. **[P0] Document hard limits.** State clearly that secure erasure, overwritten sectors, discarded solid-state-drive blocks, missing encryption keys, physically unreadable media, and unavailable provider-side state may be unrecoverable.
5. **[P0] Define an authorized-use policy.** Add an explicit requirement that operators own or are authorized to examine every source, account, device, and cloud object.
6. **[P1] Define recovery profiles.** Add named profiles for quick triage, archive recovery, deleted-file analysis, project recovery, regulated evidence handling, cloud export recovery, and full deep scan.
7. **[P1] Define evidence confidence scoring.** Combine parser validation, source provenance, hash validation, structural completeness, metadata preservation, and independent cross-check results into an explainable score.
8. **[P1] Add a decision engine.** Recommend the next safest operation based on source type, integrity findings, available disk space, privilege, and estimated risk.
9. **[P1] Add a supported-versus-experimental classification.** Prevent experimental parsers from being presented as production recovery methods.
10. **[P2] Maintain a recovery-method catalog.** Describe signature detection, metadata recovery, journal recovery, carving, reconstruction, decompression, database-page recovery, cache recovery, cloud-export recovery, and manual review as distinct methods.
11. **[P2] Add release compatibility notes.** Record which reports, case schemas, plugin APIs, and command outputs are backward compatible.
12. **[P3] Add a research track.** Track experimental techniques such as probabilistic fragmentation reconstruction, learned file classification, and format-specific partial decoding without mixing them into default evidence workflows.

## B. Repository and package architecture

13. **[P0] Convert the current single package into a real monorepo or clearly modular package.** Separate core domain types, CLI, parsers, reporting, cloud connectors, native bindings, server mode, and plugins.
14. **[P0] Add complete package metadata.** Include repository URL, homepage, bugs URL, maintainers, funding if applicable, `types`, `sideEffects`, supported platforms, and explicit export maps.
15. **[P0] Add a package-lockfile policy.** Pin dependency versions, document update cadence, and make clean `npm ci` a release gate.
16. **[P0] Remove generated tarballs and case outputs from the working tree.** Keep release artifacts in GitHub Releases or a package registry rather than beside source files.
17. **[P0] Add a public or private package publication strategy.** Decide whether releases are private, scoped, public, or distributed through an internal registry, and document who owns npm publication credentials.
18. **[P0] Add Node.js support testing.** Test every supported LTS line and reject unsupported versions with a clear message.
19. **[P1] Add platform-specific package handling.** Distribute native helpers through optional platform packages or a controlled postinstall download with integrity verification.
20. **[P1] Add a stable public SDK.** Export typed interfaces, schema versions, error classes, progress events, cancellation, and compatibility guarantees.
21. **[P1] Add configuration-file support.** Support a case-independent configuration file with explicit precedence between defaults, system policy, user settings, environment variables, and command-line flags.
22. **[P1] Add environment diagnostics.** Make `doctor` test filesystem permissions, available space, path length behavior, locale, clock, native modules, optional tools, encryption support, and service connectivity.
23. **[P1] Add command aliases only through a compatibility layer.** Keep old command names working while introducing clearer subcommands.
24. **[P2] Add plugin package templates.** Provide a generator, example parser, schema validator, test harness, and publishing guidance.
25. **[P2] Add a separate compatibility package.** Preserve old report schemas and CLI behavior for organizations with existing automation.
26. **[P3] Add WebAssembly parser support.** Permit portable, memory-limited parsers where native deployment is undesirable.

## C. CLI and operator experience

27. **[P0] Add robust argument parsing.** Replace positional ad hoc parsing with a tested parser that supports quoted paths, spaces, Unicode, repeated options, `--`, subcommand validation, and consistent error messages.
28. **[P0] Add stable exit codes.** Distinguish success, partial recovery, validation failure, source access failure, policy denial, user error, cancellation, and internal error.
29. **[P0] Add `--json`, `--jsonl`, `--quiet`, `--verbose`, and `--log-level`.** Ensure machine output never mixes with human progress text.
30. **[P0] Add `--dry-run` everywhere a write or external action may occur.** Show planned reads, writes, output paths, estimated space, and policy decisions.
31. **[P0] Add cancellation handling.** Catch SIGINT and SIGTERM, flush audit events, close file handles, persist checkpoints, and report whether the job can resume safely.
32. **[P0] Add progress reporting.** Report files, bytes, sectors, throughput, ETA, retries, errors, candidate counts, and output volume.
33. **[P0] Add destination safety checks.** Reject output paths inside sources, detect collisions, require explicit overwrite policy, and defend against symlink and path-traversal attacks.
34. **[P1] Add an interactive recovery wizard.** Guide operators through case creation, source registration, triage, imaging, scan selection, output policy, and verification.
35. **[P1] Add job lifecycle commands.** Support list, inspect, pause, resume, cancel, retry, clone, archive, and delete-with-policy workflows.
36. **[P1] Add human-readable summaries.** Print concise findings and next actions without requiring the operator to open JSON manually.
37. **[P1] Add review filters.** Filter by status, confidence, file type, source, offset, parser, encryption, corruption, secret detection, and date.
38. **[P1] Add a report diff command.** Compare two inventories or recovery runs and show new, missing, changed, and reclassified artifacts.
39. **[P2] Add shell completion.** Support Bash, Zsh, Fish, PowerShell, and Windows command completion.
40. **[P2] Add progress dashboards.** Provide a local terminal dashboard and an optional local web dashboard.
41. **[P2] Add localization support.** Keep machine schemas stable while supporting localized operator messages.
42. **[P3] Add a graphical desktop wrapper.** Keep the recovery engine independent so the GUI cannot alter evidence semantics.

## D. Case management and chain of custody

43. **[P0] Version the case schema.** Add migrations, schema validation, compatibility checks, and a case upgrade command.
44. **[P0] Record full acquisition metadata.** Capture operator, host, process, OS, timezone, clock source, source identity, device identifiers, mount state, tool version, configuration, and privilege mode.
45. **[P0] Add append-only audit integrity.** Chain audit records with hashes and optionally sign or forward them to immutable storage.
46. **[P0] Add artifact provenance.** Link each output to source path, source hash, byte offsets or blocks, parser, parser version, operation, policy decision, and validation result.
47. **[P0] Add evidence manifest signing.** Support organization-managed signing keys and verification of exported manifests.
48. **[P0] Add immutable source registration.** Snapshot source metadata at registration and detect later source mutation.
49. **[P1] Add case notes and annotations.** Permit operator comments, tags, review decisions, exclusions, and escalation notes with audit history.
50. **[P1] Add evidence bundles.** Export a self-contained case package with manifest, reports, logs, schemas, tool metadata, and selected artifacts.
51. **[P1] Add retention and legal-hold metadata.** Track retention class, expiration, legal hold, owner, and disposition approval.
52. **[P1] Add chain-of-custody transfer records.** Record export, copy, handoff, recipient, timestamp, hashes, and acknowledgment.
53. **[P2] Add multi-case search.** Search authorized cases by hash, filename, source, ticket, status, or artifact type.
54. **[P2] Add case deduplication.** Identify repeated source images and artifacts without deleting evidence.
55. **[P2] Add evidence escrow support.** Export encrypted, signed bundles for a separate evidence repository.
56. **[P3] Add formal courtroom or regulatory report templates.** Make them configurable and clearly distinguish technical findings from legal conclusions.

## E. Acquisition and block-level recovery

57. **[P0] Add verified file-copy acquisition.** Copy ordinary sources with streaming hashes, metadata preservation, retry logic, and resumable checkpoints.
58. **[P0] Add raw device imaging.** Support authorized block devices with read-only open, sector-size detection, progress, retry strategy, sparse output, and error maps.
59. **[P0] Add image verification.** Hash source and image, verify selected ranges, and record mismatches and unreadable sectors.
60. **[P1] Add forensic image formats.** Support raw, E01-like segmented images, AFF-like formats, sparse images, and virtual disk formats through maintained adapters.
61. **[P1] Add partition-table parsing.** Detect GPT, MBR, protective MBR, hybrid layouts, backup GPT, and partition boundaries.
62. **[P1] Add volume discovery.** Identify filesystems and nested volumes inside images without mounting them read-write.
63. **[P1] Add bad-sector strategies.** Support configurable retries, reverse reads, block subdivision, skip maps, and a record of every failed region.
64. **[P1] Add live-source risk warnings.** Detect mounted or actively changing sources and require explicit acknowledgment before acquisition.
65. **[P1] Add snapshot integration.** Support filesystem snapshots, volume shadow copies, LVM snapshots, ZFS snapshots, and cloud object versions where available.
66. **[P2] Add remote acquisition.** Support controlled SSH or agent-based acquisition with mutual authentication, bandwidth limits, and remote hash verification.
67. **[P2] Add removable-media monitoring.** Detect insertion, identify devices, and require explicit source selection before reading.
68. **[P2] Add hardware health capture.** Record SMART/NVMe health, temperature, read-only status, and device error counters where authorized.
69. **[P3] Add specialized damaged-media workflows.** Support head parking, controller-specific recovery integrations, and lab-tool handoff without pretending software alone can repair hardware.

## F. Filesystem support and deleted-data recovery

70. **[P0] Add filesystem identification independent of mount state.** Detect filesystem superblocks and report confidence and corruption.
71. **[P0] Implement NTFS analysis.** Add MFT parsing, resident/nonresident data, attributes, ADS, timestamps, `$UsnJrnl`, `$LogFile`, recycle-bin metadata, and deleted-entry analysis.
72. **[P0] Implement ext-family analysis.** Add inode, extent, directory, journal, orphan-list, extended-attribute, and deleted-entry recovery.
73. **[P1] Implement APFS analysis.** Add containers, volumes, snapshots, objects, metadata, encryption state reporting, and recoverable deleted records where feasible.
74. **[P1] Implement HFS+ analysis.** Add catalog, extents, journal, resource forks, and deleted-entry parsing.
75. **[P1] Implement FAT/exFAT analysis.** Add directory entries, long names, allocation chains, deleted entries, slack, and FAT inconsistencies.
76. **[P1] Implement XFS, Btrfs, ZFS, and ReFS adapters.** Start with metadata inventory and add recovery depth in separate releases.
77. **[P1] Preserve filesystem metadata.** Capture ACLs, ownership, timestamps, alternate streams, extended attributes, flags, hard links, sparse extents, and case sensitivity.
78. **[P1] Add journal and transaction-log recovery.** Recover metadata and prior names from filesystem journals where available.
79. **[P1] Add unallocated-space scanning.** Scan clusters or blocks while retaining offsets, allocation state, and filesystem context.
80. **[P1] Add slack-space analysis.** Report recoverable bytes in file slack and volume slack separately from ordinary file content.
81. **[P1] Add fragmentation reconstruction.** Use filesystem extents, format structure, neighboring blocks, and confidence scoring to reconstruct fragmented files.
82. **[P2] Add directory-tree reconstruction.** Rebuild deleted or orphaned directory relationships with explicit uncertainty markers.
83. **[P2] Add mountless virtual filesystem browsing.** Let operators inspect images without mounting them on the host.
84. **[P3] Add specialized RAID and storage-pool reconstruction.** Support documented layouts, degraded arrays, parity verification, and safe read-only assembly.

## G. Archive, compression, and container recovery

85. **[P0] Replace shell-only ZIP handling with a maintained library or native implementation.** Preserve structured errors, entry metadata, encryption flags, and partial extraction results across platforms.
86. **[P0] Add archive path safety.** Reject absolute paths, traversal, device names, symlink escapes, duplicate-path ambiguity, and unsafe permissions during extraction.
87. **[P0] Add decompression quotas.** Limit expanded bytes, nesting depth, file count, CPU time, and memory use to prevent decompression bombs.
88. **[P0] Add archive repair provenance.** Record exactly which headers, members, checksums, and indexes were recovered or reconstructed.
89. **[P1] Add tar, gzip, bzip2, xz, zstandard, 7z, RAR, ISO, CPIO, and package-container support.** Include validation and extraction behavior per format.
90. **[P1] Add split-archive reassembly.** Detect numbered parts, ordering, missing parts, duplicate parts, and inconsistent sizes.
91. **[P1] Add ZIP central-directory reconstruction.** Recover intact local entries when the central directory is damaged.
92. **[P1] Add partial decompression.** Extract complete blocks or members from truncated streams where the format permits it.
93. **[P1] Add encrypted-container reporting.** Distinguish readable metadata, wrong key, missing key, unsupported encryption, and corrupted ciphertext.
94. **[P1] Add password/key integration.** Support secure prompts, OS keychains, enterprise secret providers, and audit references without exposing secrets.
95. **[P2] Add nested-container graphing.** Show which archive contains each child and identify repeated or cyclic nesting.
96. **[P2] Add archive duplicate handling.** Preserve all entries while separately identifying identical names, hashes, and conflicting metadata.
97. **[P2] Add format-specific repair plugins.** Support office packages, PST/OST-like stores, disk images, email containers, and application bundles.
98. **[P3] Add block-level compressed-stream reconstruction.** Research partial recovery of fragmented compressed streams with explicit experimental status.

## H. File identification, carving, and content reconstruction

99. **[P0] Expand signature definitions.** Add versioned signatures, offsets, trailers, structural checks, MIME aliases, and known false-positive rules.
100. **[P0] Add parser-based validation.** Do not classify a header hit as recovered until a format parser confirms meaningful structure.
101. **[P0] Add streaming carving.** Avoid loading large sources entirely into memory; support chunk overlap and resumable offsets.
102. **[P0] Add source-offset mapping.** Record every carved byte range, sector, cluster, and parent source.
103. **[P0] Add collision-safe artifact naming.** Use deterministic IDs based on source hash and offset while preserving friendly names separately.
104. **[P1] Add more document formats.** Cover office documents, OpenDocument, EPUB, RTF, Markdown, HTML, mail formats, PST-like stores, and common database exports.
105. **[P1] Add more media validation.** Cover common image, audio, video, font, subtitle, and archive formats with structural checks.
106. **[P1] Add text and encoding recovery.** Detect UTF-8, UTF-16, UTF-32, legacy encodings, mixed encodings, line boundaries, and damaged text.
107. **[P1] Add entropy and randomness analysis.** Use it to flag encryption or compression candidates but never label entropy alone as proof.
108. **[P1] Add overlap resolution.** Manage competing carved candidates and retain discarded alternatives for review.
109. **[P1] Add fragmented-file candidate assembly.** Score possible extents and expose the evidence supporting each assembly.
110. **[P2] Add embedded-object extraction.** Recover attachments, thumbnails, previews, media, macros, and package members from valid documents.
111. **[P2] Add thumbnail and cache recovery.** Locate previews and cached content even when originals are absent.
112. **[P2] Add approximate duplicate detection.** Use perceptual hashes for images and similarity fingerprints for text while preserving exact hashes separately.
113. **[P2] Add manual carving controls.** Allow analysts to define signatures, trailers, maximum sizes, alignment, and exclusion ranges.
114. **[P3] Add probabilistic reconstruction experiments.** Use format-aware scoring or model-assisted ranking only as a review aid, never as silent evidence modification.

## I. Databases and application data

115. **[P0] Add SQLite validation and safe copying.** Validate headers, page sizes, freelists, schema, checksums, WAL, SHM, and journal state before analysis.
116. **[P0] Add SQLite record recovery.** Recover deleted or unreferenced records where page contents remain, with page offsets and confidence.
117. **[P1] Add LevelDB, RocksDB, LMDB, Berkeley DB, and common key-value formats.** Begin with read-only inventory and record export.
118. **[P1] Add WAL and journal replay controls.** Let operators compare main database, WAL state, and recovered merged views without overwriting any copy.
119. **[P1] Add schema migration reporting.** Identify schema versions, migrations, incomplete migrations, and incompatible readers.
120. **[P1] Add JSON, JSONL, CSV, XML, YAML, plist, protobuf, MessagePack, and CBOR extraction.** Preserve raw source plus normalized exports.
121. **[P1] Add application cache adapters.** Support browser history/downloads, editor caches, notebook checkpoints, package-manager caches, and common messaging exports where authorized.
122. **[P1] Add Git recovery.** Reconstruct loose objects, packed objects, refs, reflogs, dangling commits, branches, and worktrees.
123. **[P1] Add secret detection.** Detect credentials, tokens, private keys, recovery codes, connection strings, and personal data without printing values in reports.
124. **[P1] Add redaction profiles.** Redact secrets in reports while preserving an access-controlled unredacted evidence copy.
125. **[P2] Add data lineage.** Link normalized records to raw database pages, offsets, source files, and parser versions.
126. **[P2] Add record-level diffing.** Compare recovered database states and identify additions, deletions, and conflicts.
127. **[P2] Add application-specific project adapters.** Cover notebooks, IDEs, build systems, package registries, and source-control metadata.
128. **[P3] Add forensic timeline extraction.** Normalize timestamps from filesystem, database, logs, document metadata, commits, and cloud revisions.

## J. Project and developer-data recovery

129. **[P0] Expand project detection beyond marker filenames.** Use directory structure, manifests, imports, lockfiles, Git metadata, and build outputs.
130. **[P0] Add Python recovery.** Reconstruct `pyproject.toml`, requirements, virtual environments, notebooks, package caches, test data, logs, and source distributions.
131. **[P0] Add Rust recovery.** Reconstruct Cargo manifests, lockfiles, registry caches, target metadata, source trees, docs, and build diagnostics.
132. **[P0] Add Node.js and TypeScript recovery.** Analyze package manifests, lockfiles, source maps, npm caches, build outputs, and editor artifacts.
133. **[P1] Add Java, .NET, Go, C/C++, Swift, Kotlin, and shell-project analyzers.** Preserve source and generated outputs separately.
134. **[P1] Reconstruct dependency graphs.** Identify declared, locked, cached, and actually present dependencies.
135. **[P1] Detect secret-bearing project files.** Flag environment files, CI settings, cloud credentials, private keys, and connection strings.
136. **[P1] Add build reproducibility checks.** Report what can be rebuilt, what dependencies are missing, and which toolchains are required.
137. **[P1] Add source-map and compiled-artifact recovery.** Associate minified or compiled output with recovered source where possible.
138. **[P2] Add notebook execution-free inspection.** Extract cells, outputs, metadata, attachments, and checkpoints without running recovered code.
139. **[P2] Add repository reconstruction.** Rebuild working trees from Git objects while preserving original object IDs and uncertain paths.
140. **[P2] Add project-level export bundles.** Produce portable reports, dependency inventories, secret findings, and recovered source archives.
141. **[P3] Add semantic project search.** Search recovered source by symbol, API, configuration, or text while retaining evidence links.

## K. Cloud and account-export recovery

142. **[P0] Define cloud connector security.** Use official OAuth/API flows, minimum scopes, encrypted token storage, expiration, revocation, and audit references.
143. **[P0] Add a connector interface.** Standardize authorization, listing, metadata, download, revision handling, pagination, rate limits, retries, and cancellation.
144. **[P0] Distinguish file export from account-state restore.** Report when an export contains user files but cannot recreate provider-side account metadata.
145. **[P1] Add Google Drive ingestion.** Preserve file IDs, revisions, parents, owners where authorized, timestamps, permissions, checksums, and export warnings.
146. **[P1] Add S3-compatible ingestion.** Support object versions, multipart objects, metadata, server-side encryption state, ranges, and inventory files.
147. **[P1] Add Microsoft OneDrive/SharePoint ingestion.** Preserve drive IDs, item IDs, versions, sharing metadata, and export limitations.
148. **[P1] Add Dropbox ingestion.** Preserve revisions, deleted-file metadata where exposed, namespaces, and shared-link context.
149. **[P1] Add provider-export validators.** Detect missing manifests, incomplete downloads, altered filenames, split archives, and unsupported restore packages.
150. **[P1] Add resumable cloud downloads.** Persist page tokens, byte ranges, hashes, retries, and rate-limit backoff.
151. **[P1] Add remote-to-local provenance.** Map every downloaded object to provider ID, revision, request, timestamp, and local hash.
152. **[P2] Add cloud snapshot comparison.** Compare multiple exports or revisions without deleting earlier copies.
153. **[P2] Add enterprise secret-manager integration.** Support approved vaults through short-lived credentials and least-privileged service identities.
154. **[P2] Add cloud cost and bandwidth controls.** Estimate object count, size, egress, and duration before ingestion.
155. **[P3] Add provider-specific account-recovery support packets.** Generate evidence packages tailored to official support workflows without submitting them automatically.

## L. Security and defensive hardening

156. **[P0] Add threat modeling.** Model malicious archives, hostile files, compromised plugins, untrusted mounts, symlink attacks, decompression bombs, credential leakage, and case tampering.
157. **[P0] Add dependency auditing.** Run `npm audit`, license checks, dependency review, lockfile validation, and vulnerability monitoring in CI.
158. **[P0] Add parser isolation.** Execute high-risk parsers in worker processes or native isolation with time, memory, file-count, and output quotas.
159. **[P0] Add safe extraction defaults.** Prevent path traversal, absolute paths, symlink escapes, device nodes, unsafe permissions, and overwrites.
160. **[P0] Add secret-safe logging.** Redact tokens, passwords, private keys, recovery codes, and customer data from errors and progress output.
161. **[P0] Add secure temporary storage.** Use controlled temporary directories, restrictive permissions, cleanup policies, and optional encrypted scratch space.
162. **[P0] Add policy enforcement.** Enforce allowed source types, output destinations, cloud providers, destructive actions, plugins, retention, and network access.
163. **[P0] Add privilege separation.** Run ordinary analysis unprivileged and isolate only the operations that require administrator/root access.
164. **[P1] Add signed releases.** Sign npm artifacts, native binaries, checksums, SBOMs, and GitHub release assets.
165. **[P1] Add provenance attestations.** Publish build provenance and reproducible-build verification where supported.
166. **[P1] Add plugin trust controls.** Require signing, allowlists, version pinning, capability declarations, and review before execution.
167. **[P1] Add network-deny mode.** Let operators run completely offline and prove that a job made no network calls.
168. **[P1] Add secure deletion policy for derived data.** Provide policy-controlled cleanup of scratch data while warning that secure deletion depends on the storage medium.
169. **[P1] Add audit-log forwarding.** Send append-only events to enterprise logging or SIEM systems over authenticated channels.
170. **[P2] Add FIPS-oriented crypto configuration.** Use approved algorithms and configurable providers where regulated deployments require them.
171. **[P2] Add malware-aware handling.** Never execute recovered files; integrate optional static scanning and quarantine workflows.
172. **[P2] Add memory and resource guards.** Enforce limits globally and per parser, source, archive, and job.
173. **[P3] Add formal security review.** Commission independent review of native code, parsers, acquisition paths, cloud connectors, and update mechanisms.

## M. Performance, scale, and reliability

174. **[P0] Add streaming everywhere.** Avoid reading entire files or devices into memory for hashing, scanning, carving, and extraction.
175. **[P0] Add resumable checkpoints.** Persist source offset, parser state, output mapping, and hashes so interrupted jobs resume safely.
176. **[P0] Add bounded concurrency.** Tune workers by media type, CPU, memory, device health, and operator policy.
177. **[P0] Add backpressure.** Prevent fast scanners from overwhelming parsers, disks, queues, or output storage.
178. **[P0] Add atomic output writes.** Use temporary files, fsync where appropriate, rename-based commits, and recovery of incomplete outputs.
179. **[P1] Add a Rust native accelerator.** Move hashing, signature scanning, archive traversal, block reads, and carving into a memory-safe high-throughput core.
180. **[P1] Add performance benchmarks.** Track throughput, memory, CPU, I/O amplification, parser latency, and scaling across source sizes.
181. **[P1] Add large-file tests.** Test multi-gigabyte and multi-terabyte logical inputs through sparse fixtures and controlled block sources.
182. **[P1] Add queue-backed job execution.** Support local worker queues first and distributed workers later.
183. **[P1] Add crash recovery.** Recover job state after process, host, filesystem, or power failure.
184. **[P1] Add storage forecasting.** Estimate image, extracted, carved, temporary, report, and duplicate-storage requirements.
185. **[P2] Add content-addressed storage.** Deduplicate derived artifacts by hash without merging provenance records.
186. **[P2] Add remote object storage for case artifacts.** Support encrypted S3-compatible targets with immutability and retention controls.
187. **[P2] Add workload scheduling.** Schedule scans around business hours, device health, bandwidth, and priority.
188. **[P3] Add distributed scanning.** Partition large images or object sets across workers while preserving deterministic provenance and ordering.

## N. Testing and quality engineering

189. **[P0] Expand unit coverage.** Test every public function, error path, policy path, schema, and command parser.
190. **[P0] Add integration fixtures.** Include valid, truncated, malformed, encrypted, split, nested, extension-mismatched, and decompression-bomb archives.
191. **[P0] Add property tests.** Verify hashing, path normalization, manifest serialization, status aggregation, chunk boundaries, and resume behavior.
192. **[P0] Add fuzz testing.** Fuzz archive parsers, signature detection, metadata readers, report readers, and plugin boundaries.
193. **[P0] Add differential tests.** Compare supported parsers against independent tools and known-good reference outputs.
194. **[P0] Add mutation tests.** Corrupt headers, indexes, pages, extents, directory entries, and compressed blocks to measure graceful degradation.
195. **[P0] Add clean-install tests.** Test local tarball, GitHub source, npm registry package, global install, local install, Windows, macOS, and Linux.
196. **[P1] Add golden reports.** Keep stable expected JSON and human-readable outputs with deliberate schema migration tests.
197. **[P1] Add cross-platform path tests.** Test Unicode, spaces, reserved names, long paths, case sensitivity, symlinks, junctions, UNC paths, and alternate data streams.
198. **[P1] Add permission tests.** Test unreadable files, root-only devices, ACLs, locked files, changing sources, and partial access.
199. **[P1] Add crash and resume tests.** Kill jobs at controlled offsets and confirm no evidence or output corruption.
200. **[P1] Add performance regression gates.** Fail CI when throughput or memory regresses beyond documented thresholds.
201. **[P1] Add security regression fixtures.** Test path traversal, symlink escapes, decompression bombs, zip bombs, malicious metadata, and secret leakage.
202. **[P2] Add hardware matrix testing.** Test HDD, SSD, NVMe, removable media, network storage, sparse images, and degraded devices.
203. **[P2] Add parser corpus management.** Track provenance, license, expected result, sensitivity, and retention for every fixture.
204. **[P3] Add independent validation.** Have an external forensic reviewer reproduce selected results from clean evidence.

## O. CI/CD, release engineering, and supply chain

205. **[P0] Restore CI with a token or workflow path that has the required permissions.** The current GitHub token could not push a workflow file.
206. **[P0] Add matrix CI.** Test supported Node.js versions and operating systems.
207. **[P0] Add package-content checks.** Verify that published packages contain required files and exclude evidence, test fixtures, secrets, and generated artifacts.
208. **[P0] Add release gates.** Require tests, audit, license checks, SBOM, clean install, CLI smoke test, and report schema validation before tagging.
209. **[P0] Add npm provenance.** Publish with trusted publishing or equivalent provenance when the npm account is configured.
210. **[P1] Add automated GitHub Releases.** Attach tarballs, checksums, SBOMs, signatures, changelog, and installation instructions.
211. **[P1] Add semantic-release or controlled versioning.** Ensure package, CLI, schema, native ABI, and plugin versions remain aligned.
212. **[P1] Add changelog automation.** Require release notes to state new recovery methods, changed classifications, compatibility changes, and known limits.
213. **[P1] Add SBOM generation.** Publish SPDX or CycloneDX for JavaScript, native, and system-tool dependencies.
214. **[P1] Add dependency update automation.** Use reviewed update pull requests with compatibility and security checks.
215. **[P1] Add artifact checksums.** Publish SHA-256 and stronger checksums for every release asset.
216. **[P1] Add reproducible-build checks.** Rebuild the same tag in a clean environment and compare outputs.
217. **[P2] Add private-registry support.** Document scoped registry configuration, access tokens, provenance, and air-gapped mirroring.
218. **[P2] Add offline bundles.** Provide a signed package bundle containing approved dependencies and native helpers for disconnected environments.
219. **[P3] Add long-term-support channels.** Maintain security-only releases for regulated deployments.

## P. Enterprise service and administration

220. **[P0] Add a local service mode.** Provide authenticated job submission, status, cancellation, reports, and artifact browsing without exposing data externally by default.
221. **[P0] Add role-based access control.** Separate case creation, acquisition, analysis, repair, export, policy administration, and audit review.
222. **[P0] Add authentication integration.** Support enterprise identity, short-lived sessions, MFA through the identity provider, and service accounts.
223. **[P0] Add tenant and case isolation.** Prevent cross-case path, artifact, report, and log access.
224. **[P0] Add API schemas.** Publish OpenAPI or equivalent contracts with versioned request, response, error, and event types.
225. **[P1] Add worker registration.** Record worker capabilities, versions, health, location, access policy, and active cases.
226. **[P1] Add quotas.** Limit case storage, concurrent jobs, parser memory, cloud bandwidth, and output volume.
227. **[P1] Add operational metrics.** Track job duration, throughput, failures, parser errors, recovered bytes, and storage usage without exposing evidence content.
228. **[P1] Add alerting.** Alert on integrity mismatch, policy denial, source mutation, repeated parser crashes, storage exhaustion, and unauthorized access attempts.
229. **[P1] Add backup and restore for metadata.** Back up case databases, manifests, policies, and audit logs while keeping evidence storage separate.
230. **[P2] Add administrative dashboards.** Show fleet health, cases, queue state, storage, policy violations, and release versions.
231. **[P2] Add enterprise ticketing integration.** Link case IDs to approved ticket or incident systems without copying sensitive evidence into tickets.
232. **[P2] Add legal-hold workflows.** Prevent retention cleanup while a hold is active and audit every override.
233. **[P3] Add multi-region disaster recovery.** Replicate encrypted metadata and selected evidence according to jurisdictional policy.

## Q. Reporting, timelines, and analyst workflows

234. **[P0] Add schema-validated JSON reports.** Publish JSON Schema and validate every report before writing it.
235. **[P0] Add report self-hashes.** Include hashes of report sections and referenced artifacts.
236. **[P0] Add clear uncertainty language.** Explain why a result is partial, carved, reconstructed, encrypted, or unsupported.
237. **[P1] Add HTML reports.** Include source summary, findings, artifact tables, timelines, integrity results, and next actions.
238. **[P1] Add CSV and Parquet exports.** Support large inventories and analytical workflows without forcing JSON-only processing.
239. **[P1] Add forensic timeline reports.** Normalize timestamps with timezone, source, precision, and reliability metadata.
240. **[P1] Add hash-set reports.** Export exact hashes, fuzzy hashes where appropriate, and duplicate groups.
241. **[P1] Add visual artifact maps.** Show disk offsets, carved ranges, archive nesting, and project relationships.
242. **[P1] Add analyst review queues.** Let reviewers accept, reject, annotate, merge, or defer findings while preserving all prior decisions.
243. **[P2] Add report templates.** Support incident response, account recovery, media failure, project recovery, and regulated evidence cases.
244. **[P2] Add SIEM/SOAR export.** Export non-sensitive findings and operational events to enterprise systems.
245. **[P2] Add comparison reports.** Compare exports, revisions, scans, and repair attempts.
246. **[P3] Add interactive evidence explorer.** Browse source-to-artifact relationships with strict case access controls.

## R. Documentation and training

247. **[P0] Correct installation documentation.** Give separate, tested commands for npm registry, GitHub, local tarball, source checkout, global install, and local project install.
248. **[P0] Add a quick-start tutorial.** Use a synthetic fixture so operators can learn without exposing real evidence.
249. **[P0] Add a complete CLI reference.** Document every option, default, exit code, output path, policy, and example.
250. **[P0] Add recovery-method documentation.** Explain what each method can recover, what it cannot recover, and how to interpret confidence.
251. **[P0] Add security and privacy documentation.** Explain credentials, cloud scopes, secrets, temporary data, logs, plugins, and network behavior.
252. **[P1] Add platform prerequisites.** Document permissions, optional system tools, filesystem support, storage requirements, and administrator/root boundaries.
253. **[P1] Add operator runbooks.** Provide procedures for account exports, damaged archives, disks, deleted files, databases, projects, and provider escalation.
254. **[P1] Add troubleshooting guides.** Cover failed installs, missing binaries, permission errors, corrupted archives, encrypted sources, incomplete exports, and storage exhaustion.
255. **[P1] Add schema and SDK documentation.** Generate API docs from types and examples.
256. **[P1] Add disaster and incident procedures.** Document how to stop, preserve, resume, recover, and report a job after failure.
257. **[P2] Add training labs.** Provide synthetic cases for archive repair, carving, filesystem recovery, Git recovery, and cloud export diagnosis.
258. **[P2] Add known-limit examples.** Demonstrate secure erasure, overwritten sectors, missing encryption keys, and provider-side state that cannot be reconstructed.
259. **[P2] Add contribution guidelines.** Define parser quality, fixtures, security review, evidence handling, licensing, and changelog expectations.
260. **[P3] Add formal administrator and analyst certifications.** Provide role-based training and assessment material.

## S. Current-release defects and immediate corrections

261. **[P0] Replace the hand-written CLI parser.** The current parser relies on positional array manipulation and should be tested or replaced before adding many commands.
262. **[P0] Add missing package metadata.** The current manifest lacks repository, homepage, bugs, maintainer, and package publication metadata.
263. **[P0] Make ZIP support portable.** The current implementation depends on the host `unzip` command, which is not guaranteed on Windows or minimal Linux installations.
264. **[P0] Add explicit tool failure messages.** `extract` should explain when `unzip` is missing and how to install or enable a native fallback.
265. **[P0] Fix capability truthfulness as features expand.** `doctor` should report per-command availability and version, not only broad booleans.
266. **[P0] Add tests for missing tools.** Validate graceful behavior when `unzip`, `7z`, or other optional utilities are absent.
267. **[P0] Add tests for source mutation.** Change a source after inventory and verify that verification reports the mismatch.
268. **[P0] Add tests for unsafe extraction paths.** Use malicious ZIP fixtures and confirm no output escapes the destination.
269. **[P0] Add tests for duplicate case registration.** Verify clear behavior when a case already exists or a source is registered twice.
270. **[P0] Add tests for special files.** Handle sockets, devices, FIFOs, symlinks, junctions, and inaccessible paths safely.
271. **[P1] Add a proper archive abstraction.** Use one interface for validate, list, extract, repair, encryption, nested containers, and provenance.
272. **[P1] Add a report schema validator.** Prevent malformed or incomplete report files from being treated as final output.
273. **[P1] Add output-path collision tests.** Ensure repeated extraction, carving, and report generation cannot silently replace prior results.
274. **[P1] Add a real test fixture directory.** Keep synthetic fixtures outside the package tarball and document how they are generated.
275. **[P1] Add missing commands promised by documentation.** Implement or remove references to raw imaging, cloud ingestion, plugin installation, policy management, and job control until available.
276. **[P1] Add an npm smoke test after packing.** Install the generated tarball in a clean directory and execute `recovery doctor`, `--help`, and one case workflow.
277. **[P2] Improve diagnostics for opaque binaries.** Add chunked scanning, text extraction, encoding detection, entropy windows, and optional external `file` integration.
278. **[P2] Add a dedicated account-export diagnosis command.** Report manifest presence, archive completeness, split parts, provider markers, and likely restore incompatibility.
279. **[P2] Add report links to source evidence.** Make every finding traceable from summary to source bytes and recovery method.
280. **[P3] Add a formal release audit checklist.** Require package install, clean clone, tests, security checks, source exclusion, report validation, and GitHub/npm publication verification.

## Suggested review order

Review **P0** items first because they determine whether the tool can be trusted with enterprise evidence. Next select a coherent **P1** product slice rather than adding isolated parsers. A practical first enterprise milestone would combine case integrity, verified acquisition, portable archive support, filesystem inventory, safe extraction, parser isolation, report schemas, clean-install CI, and a supported cloud-export validator. P2 and P3 items can then be prioritized by the target users, operating systems, storage types, regulatory obligations, and available engineering capacity.

## References

[1]: https://www.nist.gov/publications/guidelines-integrating-forensic-techniques-incident-response "NIST Guidelines for Integrating Forensic Techniques into Incident Response"
[2]: https://www.rfc-editor.org/rfc/rfc3227 "RFC 3227 Guidelines for Evidence Collection and Archiving"
[3]: https://www.swgde.org/ "Scientific Working Group on Digital Evidence Guidance"
[4]: https://nodejs.org/api/packages.html "Node.js Packages Documentation"
[5]: https://docs.npmjs.com/cli/v10/using-npm/package-json "npm package.json Documentation"
