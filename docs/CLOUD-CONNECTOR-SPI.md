# Cloud Connector SPI and Google Drive Authentication Design

**Status:** Proposed design — no cloud connector or remote authentication is implemented by this document.

**Initial provider:** Google Drive, read-only object and version acquisition.

**Package context:** `@enterprise-recovery/forensic-recovery` 0.5.x, Node.js >=20, ESM, local-first, read-only by default.

## 1. Objective

Define a provider-neutral cloud connector service-provider interface (SPI) that can acquire user-authorized cloud evidence without weakening the package's forensic policy. Google Drive is the first adapter target because the initial recovery context involves Google Drive exports and account data.

The first implementation must support only explicit, read-only, user-authorized acquisition of pinned Drive objects or revisions. It must not perform account recovery, bypass authentication, enumerate data outside granted scopes, modify remote objects, or claim recovery of provider-side state that is not returned by the provider API.

## 2. Assumptions

1. The first implementation is an SDK/CLI connector, not a multi-tenant service endpoint.
2. Authentication is delegated to Google OAuth 2.0; the package does not collect or store a Google password.
3. The default package policy remains `allowNetwork: false` and `allowCloud: false`.
4. Cloud access requires an explicit per-operation policy transition and an auditable authorization record.
5. Tokens are stored outside case evidence, through an injected credential store. A plaintext token file is not an accepted production implementation.
6. Google Drive files are acquired through official Drive APIs only. Arbitrary URL fetching is not part of the SPI.
7. Every acquired object is pinned to a provider object ID and, where available, a provider revision/version identifier before download.
8. Provider metadata is evidence; it is not independently trusted as proof of content authenticity unless the downloaded bytes are hash-verified and the provider supplies a verifiable checksum.

## 3. Capability boundary

### Included in the first slice

- OAuth authorization-code flow with PKCE for interactive authorization.
- Device or administrator-provided authorization through an injected browser/credential broker, where the deployment supports it.
- Least-privilege Google Drive scopes.
- Token refresh through an injected credential store.
- Authorized source listing with opaque cursors.
- Metadata retrieval for a selected file.
- Revision listing and revision pinning where supported by the object type.
- Resumable, bounded downloads to a caller-selected output outside registered source paths.
- Local SHA-256 hashing and provider checksum comparison when available.
- Remote metadata and acquisition provenance manifests.
- Rate-limit, transient-failure, permission, token, version-change, and partial-download classification.
- Explicit cancellation and resumable checkpoints.

### Explicitly excluded

- Password collection, password reset, account takeover, or recovery-code handling.
- Circumventing Google authorization, organization policies, or Drive permissions.
- Deleting, moving, sharing, renaming, trashing, or modifying Drive objects.
- Broad account backup without explicit user-selected scope.
- Arbitrary URL download or generic HTTP proxying.
- Recovery of deleted provider-side content that the API does not expose.
- Silent remote version changes during acquisition.
- Storage of refresh tokens in case manifests, reports, audit logs, command arguments, or recovered artifacts.

## 4. Module boundaries and build order

| Module | Responsibility | Depends on |
|---|---|---|
| `cloud-core` | Provider-neutral SPI, schemas, errors, pagination, checkpoints | Existing policy/result conventions |
| `cloud-auth` | Credential-store and authorization interfaces | `cloud-core` |
| `cloud-google-drive` | Google OAuth and Drive API adapter | `cloud-core`, `cloud-auth` |
| `cloud-acquisition` | Pinned download, hashing, resume, provenance | `cloud-core`, `cloud-google-drive` |
| `cloud-fixtures` | Deterministic fake provider and security fixtures | `cloud-core` |

Build order: `cloud-core` → `cloud-auth` → `cloud-google-drive` → `cloud-acquisition` → integration and adversarial fixtures.

The first implementation should not add RBAC or a service daemon. Those belong to the later enterprise service boundary and must wrap this SPI rather than be embedded into the provider adapter.

## 5. Provider-neutral SPI

The SPI uses JavaScript object contracts and asynchronous iterators. Implementations must be deterministic with respect to supplied cursors, object IDs, revision IDs, and options.

```js
export const CLOUD_CONNECTOR_SPI = 'recovery.cloud-connector/v1';

/**
 * Provider adapter constructed with an injected authenticated session.
 * No method may mutate a remote object.
 */
export class CloudConnector {
  providerId;       // stable lowercase provider ID, e.g. 'google-drive'
  apiVersion;       // provider adapter contract version

  capabilities();
  getAccountContext(options = {});
  listSources(query = {}, options = {});       // AsyncIterable<CloudObjectSummary>
  getObject(objectId, options = {});            // Promise<CloudObject>
  listVersions(objectId, options = {});         // AsyncIterable<CloudVersion>
  pinVersion(objectId, versionId, options = {});
  downloadObject(request, sink, options = {});  // Promise<CloudDownloadResult>
  revoke(options = {});
}
```

### Required provider-neutral data contracts

```js
/** No access token, refresh token, authorization code, or secret may appear here. */
{
  provider: 'google-drive',
  account: {
    subject: 'provider-scoped-redacted-id',
    displayName: null,
    emailRedacted: null,
    domain: null
  },
  scopes: ['drive.readonly'],
  retrievedAt: '2026-01-01T00:00:00.000Z',
  evidence: 'provider-account-context'
}
```

```js
{
  provider: 'google-drive',
  objectId: 'opaque-provider-object-id',
  name: 'export.zip',
  mimeType: 'application/zip',
  size: 12345,
  createdTime: '2026-01-01T00:00:00.000Z',
  modifiedTime: '2026-01-02T00:00:00.000Z',
  checksum: { algorithm: 'md5', value: 'provider-value', availability: 'provider-supplied' },
  version: { id: 'provider-version-id', isPinned: true },
  parents: ['opaque-parent-id'],
  trashed: false,
  webLink: null,
  providerFields: {},
  evidence: 'provider-object-metadata'
}
```

Provider-specific fields must be namespaced under `providerFields`; they must not change the meaning of the common fields.

```js
{
  provider: 'google-drive',
  objectId: 'opaque-provider-object-id',
  versionId: 'opaque-provider-version-id',
  destination: '/case-output/cloud/export.zip',
  bytesExpected: 12345,
  bytesTransferred: 12345,
  sourceModified: false,
  localSha256: '64-lowercase-hex-characters',
  providerChecksum: { algorithm: 'md5', value: 'provider-value', matched: true },
  status: 'verified',
  checkpoint: null,
  retries: 0,
  rateLimitEvents: 0,
  provenance: {
    manifestSchema: 'recovery.cloud-acquisition-manifest/v1',
    authorizationRecordId: 'auth-record-id',
    requestIds: ['provider-request-id'],
    scopes: ['drive.readonly']
  },
  limitations: []
}
```

### SPI invariants

- `listSources` must use provider cursors, not offsets invented by the adapter.
- Cursors are opaque and must be persisted only in job state, not interpreted by callers.
- `getObject` and `listVersions` must return provider identifiers exactly as received, with safe redaction in logs.
- `pinVersion` must perform a read-only existence/metadata check; it must not create or alter a provider revision.
- `downloadObject` must verify that the remote object still matches the pinned identity before committing output.
- Output must use a temporary file, hash the bytes, fsync where configured, and commit with an atomic rename.
- Existing output is never overwritten unless a higher-level policy explicitly permits it; the default is reject-on-collision.
- A partial transfer must retain a checkpoint and must not be labeled `verified`.
- The source is remote; `sourceModified` means the provider object or pinned version changed during the operation.

## 6. Authentication interface

Authentication is an injected dependency. The Google adapter must not directly decide where secrets are stored.

```js
export class CredentialStore {
  async get(provider, accountHint = null);        // returns opaque credential handle or null
  async put(provider, accountId, credential);     // secret-bearing operation
  async delete(provider, accountId);
  async list(provider);
}

export class AuthorizationBroker {
  async authorize(request);                       // returns authorization result
  async refresh(provider, credential, options = {});
  async revoke(provider, credential, options = {});
}
```

### Authorization request

```js
{
  schema: 'recovery.cloud-auth-request/v1',
  provider: 'google-drive',
  requestedScopes: ['https://www.googleapis.com/auth/drive.readonly'],
  accessMode: 'read-only',
  accountHint: null,
  interactive: true,
  redirectMode: 'loopback-or-injected-broker',
  pkce: true,
  state: 'cryptographically-random-one-time-value',
  operatorId: 'local-operator-or-service-principal',
  ticket: 'IR-1001'
}
```

### Required OAuth controls

- Authorization Code + PKCE for interactive flows.
- `state` validation and one-time use.
- Exact redirect URI allowlisting; no open redirect behavior.
- Minimum initial scope: `https://www.googleapis.com/auth/drive.readonly`.
- Do not request `drive` or write scopes for the initial adapter.
- Validate issuer, audience, token type, expiry, and scope set before use.
- Refresh tokens are encrypted by the injected credential store and excluded from all result objects and logs.
- Access tokens are held in memory only for the shortest practical lifetime.
- Refresh-token rotation and replacement must be atomic in the credential store.
- Revoke must erase the credential-store record after provider revocation is attempted, with the outcome audited.
- Authentication metadata records provider, subject hash, scopes, timestamps, and authorization record ID—not token values.

### Credential-store implementations

The first production implementation should support one secure store selected by deployment, for example:

1. OS keychain/credential manager for local interactive use.
2. Enterprise secret manager for managed deployments.
3. An explicitly injected test store for deterministic tests.

A JSON file containing raw OAuth tokens is allowed only in a test fixture that is never packaged, never used by the CLI, and is clearly marked non-production.

## 7. Google Drive adapter design

### Provider mapping

| SPI operation | Google Drive operation | Read-only behavior |
|---|---|---|
| `getAccountContext` | OAuth token introspection plus Drive `about.get` | Request only user/storage metadata needed for the case |
| `listSources` | `files.list` with explicit query and `nextPageToken` | No unrestricted account crawl by default |
| `getObject` | `files.get` with selected fields | Metadata only; no content download |
| `listVersions` | `revisions.list` | Preserve opaque revision IDs and modified times |
| `pinVersion` | `files.get` or `revisions.get` metadata check | Verify identity; never create a revision |
| `downloadObject` | `files.get?alt=media` or export endpoint for Google-native files | Stream bytes, hash, and verify pinned metadata |
| `revoke` | OAuth revocation endpoint | No Drive mutation |

Google-native documents require an explicit export format selected by the operator. The result must record that the output is an export representation, not the original native provider object. Export format selection must be allowlisted; arbitrary MIME targets are rejected.

### Listing safety

The initial adapter must not recursively enumerate an entire Drive account automatically. The caller must supply at least one of:

- explicit object ID;
- an approved folder ID plus bounded recursion settings;
- a provider search expression from an allowlisted query builder.

Raw caller-provided Drive query strings should not be passed directly to the API without validation. The adapter should construct queries from typed filters such as name, MIME type, parent ID, modified-time range, trashed state, and explicit object IDs.

### Version pinning

Before download:

1. Fetch metadata for the object.
2. List or fetch the requested revision/version.
3. Store the object ID, revision ID, modified time, size, and provider checksum.
4. Download only that identity.
5. Re-fetch metadata after download when the provider supports it.
6. Compare version ID, size, and relevant checksum fields.
7. Commit the local artifact only if identity and byte-level checks satisfy the result policy.

If the object changes, the output is retained only as partial/unverified evidence in a quarantine location, and the result status is `partial` or `corrupted` depending on whether the bytes can be safely explained.

## 8. Error model

All connector errors must be structured and serializable. Secret values, authorization codes, access tokens, and raw provider headers are never included.

```js
{
  schema: 'recovery.cloud-error/v1',
  provider: 'google-drive',
  code: 'AUTH_SCOPE_DENIED',
  category: 'authorization',
  retryable: false,
  safeMessage: 'The authorized account did not grant the required read-only Drive scope.',
  providerStatus: 403,
  requestId: 'provider-request-id-or-null',
  sourceObjectId: 'redacted-or-null',
  checkpoint: null,
  remediation: 'Re-authorize with the minimum requested Drive read-only scope.',
  secretRedacted: true
}
```

### Initial error codes

- `AUTH_REQUIRED` — no usable credential exists.
- `AUTH_CANCELLED` — operator cancelled authorization.
- `AUTH_SCOPE_DENIED` — required read-only scope was not granted.
- `AUTH_TOKEN_EXPIRED` — refresh failed or token expired.
- `AUTH_REVOKED` — provider rejected the credential as revoked.
- `AUTH_ACCOUNT_MISMATCH` — credential subject differs from the requested account context.
- `POLICY_NETWORK_DENIED` — package policy does not permit network access.
- `POLICY_CLOUD_DENIED` — package policy does not permit cloud access.
- `OBJECT_NOT_FOUND` — object or pinned revision is unavailable.
- `OBJECT_PERMISSION_DENIED` — object exists but is not accessible.
- `VERSION_UNAVAILABLE` — requested revision cannot be retrieved.
- `VERSION_CHANGED` — object identity changed during acquisition.
- `EXPORT_UNSUPPORTED` — selected Google-native export is unavailable or disallowed.
- `RATE_LIMITED` — provider requested backoff.
- `PROVIDER_UNAVAILABLE` — transient provider failure.
- `CHECKSUM_MISMATCH` — provider/local integrity comparison failed.
- `OUTPUT_COLLISION` — destination already exists under current policy.
- `CHECKPOINT_INVALID` — resume state does not match the pinned object identity.
- `QUOTA_EXCEEDED` — local or provider transfer quota was exceeded.
- `ABORTED` — operator or system cancellation occurred.

Retry behavior must be explicit. `401` may trigger one refresh attempt; `403` is not blindly retried; `404` is not retried unless the provider documents eventual consistency; `429` and selected `5xx` responses use bounded exponential backoff with jitter and a maximum retry budget.

## 9. Provenance manifest

Each acquisition writes a separate manifest beside the artifact or into the case report area, never into the source and never containing secrets.

```js
{
  schema: 'recovery.cloud-acquisition-manifest/v1',
  provider: 'google-drive',
  accountSubjectHash: 'sha256-of-provider-subject',
  authorizationRecordId: 'auth-record-id',
  requestedScopes: ['drive.readonly'],
  object: {
    id: 'opaque-object-id',
    revisionId: 'opaque-revision-id',
    name: 'export.zip',
    mimeType: 'application/zip',
    size: 12345,
    modifiedTime: '2026-01-02T00:00:00.000Z',
    providerChecksum: { algorithm: 'md5', value: 'redacted-or-provider-value' }
  },
  acquisition: {
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:01:00.000Z',
    bytesTransferred: 12345,
    localSha256: '64-lowercase-hex-characters',
    sourceModified: false,
    retries: 0,
    requestIds: ['provider-request-id'],
    checkpointCount: 0
  },
  result: { status: 'verified', evidenceClass: 'validated' },
  readOnly: true,
  limitations: []
}
```

The manifest must be hashable and optionally signed by a later evidence-signing module. This SPI does not invent organization signing keys.

## 10. Policy integration

The existing defaults remain unchanged:

```js
{
  readOnly: true,
  allowNetwork: false,
  allowCloud: false,
  allowPlugins: false
}
```

A cloud operation requires all of the following:

1. `readOnly === true`.
2. `allowNetwork === true`.
3. `allowCloud === true`.
4. A valid authorization record for the selected provider and account.
5. An explicit object/folder selection or typed bounded query.
6. A destination outside registered source paths.
7. A configured transfer/output quota.
8. An audit event recording the policy snapshot, operator/ticket context, provider, account hash, object selection, and authorization record ID.

No cloud connector may interpret `allowCloud` as permission to modify remote objects. Remote mutation methods should not be present in the first interface.

## 11. Testing and verification strategy

### Unit tests

- Contract validation for every neutral schema.
- Cursor preservation and deterministic pagination.
- Provider field isolation.
- Error-code mapping and retry classification.
- Redaction tests proving no tokens appear in results, logs, manifests, or thrown errors.
- Policy denial tests for both network and cloud defaults.
- Credential-store atomic replacement and deletion.

### Google adapter tests

Use a deterministic fake provider; do not use live credentials in the normal test suite.

- OAuth state mismatch.
- PKCE verifier mismatch.
- Missing scope.
- Expired access token with successful refresh.
- Refresh failure and revoked credential.
- Account-subject mismatch.
- Object listing pagination.
- Object permission denial.
- Revision pinning.
- Object changed during download.
- Provider checksum match/mismatch.
- Interrupted download and valid resume.
- Invalid or stale checkpoint.
- HTTP 429 and bounded backoff.
- HTTP 5xx retry exhaustion.
- Google-native export allowlist.
- Output collision and source-path safety.
- Cancellation leaves no falsely verified artifact.
- Source and manifest immutability.

### Live integration gate

A separate opt-in integration job may use a dedicated test Google account and encrypted CI secret storage. It must be excluded from the default `npm test` command and must never run against a personal or production Drive account.

## 12. Implementation files and package surface

Proposed files:

```text
src/cloud/core.js              # neutral schemas, SPI, pagination, errors
src/cloud/auth.js              # CredentialStore and AuthorizationBroker contracts
src/cloud/google-drive.js      # Google OAuth and Drive adapter
src/cloud/acquisition.js       # pinned streaming download and manifests
src/cloud/redaction.js         # secret-safe diagnostic helpers
test/cloud-connector.test.js   # fake-provider contract and policy tests
 test/google-drive.test.js     # adapter behavior using fake HTTP/provider
```

Proposed package exports:

```json
{
  "./cloud": "./src/cloud/core.js",
  "./cloud-auth": "./src/cloud/auth.js",
  "./cloud/google-drive": "./src/cloud/google-drive.js"
}
```

The CLI should initially expose planning and explicit acquisition commands only after implementation, for example:

```text
recovery cloud provider list
recovery cloud auth google-drive
recovery cloud source list --provider google-drive --account <alias>
recovery cloud acquire --provider google-drive --object-id <id> --revision-id <id> --output <path>
recovery cloud revoke --provider google-drive --account <alias>
```

All commands must fail closed when cloud/network policy is disabled.

## 13. Acceptance criteria

The first implementation is ready for an audited promotion only when:

1. The neutral SPI passes contract tests using a fake provider.
2. Google authorization uses PKCE, validates state, requests only read-only scopes, and never logs secrets.
3. Credentials are stored through an injected secure store rather than case files or CLI arguments.
4. Network/cloud policy denial is tested and remains the default behavior.
5. Listing is bounded, cursor-based, and explicit; no unrestricted Drive crawl occurs.
6. Downloads pin object identity and revision before transfer.
7. Resumption rejects stale or mismatched checkpoints.
8. Local SHA-256 is always computed; provider checksum comparison is recorded when available.
9. Version changes, permission failures, token failures, throttling, and partial transfer states are represented using structured errors and result statuses.
10. Acquisition manifests contain complete provenance but no credentials or secret values.
11. Source/output collision and read-only invariants pass.
12. Default tests use deterministic fake providers; live Google integration is opt-in and isolated.
13. Capability catalogs, README, compatibility metadata, and audit ledgers are updated only after the implementation and tests pass.

## 14. Open decisions before implementation

- Which OS keychain or enterprise secret-manager adapter is supported first?
- Should interactive OAuth use a local loopback listener or an external browser/credential broker in the target deployment?
- Should Google-native files be exportable in the first release, and which exact MIME mappings are approved?
- What maximum object size, daily transfer quota, and retry budget should be the default?
- Is account email allowed in local operator-visible output, or must it always be redacted to a subject hash?
- Which evidence-signing module will later sign the acquisition manifest?
