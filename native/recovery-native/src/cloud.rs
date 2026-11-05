#![allow(dead_code)]

//! Provider-neutral, read-only cloud connector contracts.
//!
//! This module intentionally contains no HTTP client, OAuth implementation, provider
//! endpoint, or secret-bearing token type. Provider adapters and credential stores
//! implement these contracts in a higher layer.

use std::future::Future;
use std::io;
use std::pin::Pin;

pub const CLOUD_CONNECTOR_SPI: &str = "recovery.cloud-connector/v1";
pub const CLOUD_AUTH_SCHEMA: &str = "recovery.cloud-auth-request/v1";
pub const CLOUD_MANIFEST_SCHEMA: &str = "recovery.cloud-acquisition-manifest/v1";

pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;
pub type CloudResult<T> = Result<T, CloudError>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudCapabilities {
    pub provider: String,
    pub api_version: String,
    pub read_only: bool,
    pub list_sources: bool,
    pub object_metadata: bool,
    pub versions: bool,
    pub resumable_downloads: bool,
    pub provider_checksums: Vec<ChecksumAlgorithm>,
    pub exports: Vec<ExportFormat>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudAccountContext {
    pub provider: String,
    pub subject_hash: String,
    pub display_name: Option<String>,
    pub email_redacted: Option<String>,
    pub domain: Option<String>,
    pub scopes: Vec<String>,
    pub retrieved_at: String,
    pub evidence: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudQuery {
    pub object_ids: Vec<String>,
    pub parent_id: Option<String>,
    pub name: Option<String>,
    pub mime_type: Option<String>,
    pub modified_after: Option<String>,
    pub modified_before: Option<String>,
    pub include_trashed: bool,
    pub page_size: u32,
}

impl Default for CloudQuery {
    fn default() -> Self {
        Self {
            object_ids: Vec::new(),
            parent_id: None,
            name: None,
            mime_type: None,
            modified_after: None,
            modified_before: None,
            include_trashed: false,
            page_size: 100,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Page<T> {
    pub items: Vec<T>,
    /// Opaque provider cursor. Callers must persist and replay it, never interpret it.
    pub next_cursor: Option<String>,
    pub has_more: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudObjectSummary {
    pub provider: String,
    pub object_id: String,
    pub name: String,
    pub mime_type: Option<String>,
    pub size: Option<u64>,
    pub modified_time: Option<String>,
    pub trashed: bool,
    pub evidence: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudObject {
    pub summary: CloudObjectSummary,
    pub created_time: Option<String>,
    pub parents: Vec<String>,
    pub checksum: Option<ProviderChecksum>,
    pub version: Option<CloudVersionRef>,
    pub web_link: Option<String>,
    /// Provider-specific metadata must remain namespaced here.
    pub provider_fields: Vec<(String, String)>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudVersion {
    pub provider: String,
    pub object_id: String,
    pub version_id: String,
    pub modified_time: Option<String>,
    pub size: Option<u64>,
    pub checksum: Option<ProviderChecksum>,
    pub is_pinned: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudVersionRef {
    pub id: String,
    pub is_pinned: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PinRequest {
    pub object_id: String,
    pub version_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PinnedObject {
    pub object_id: String,
    pub version_id: Option<String>,
    pub size: Option<u64>,
    pub modified_time: Option<String>,
    pub checksum: Option<ProviderChecksum>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DownloadRequest {
    pub object_id: String,
    pub version_id: Option<String>,
    pub destination: String,
    pub checkpoint: Option<DownloadCheckpoint>,
    pub max_bytes: u64,
    pub export: Option<ExportFormat>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DownloadCheckpoint {
    pub object_id: String,
    pub version_id: Option<String>,
    pub committed_bytes: u64,
    pub local_sha256: String,
    pub destination: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudDownloadResult {
    pub provider: String,
    pub object_id: String,
    pub version_id: Option<String>,
    pub destination: String,
    pub bytes_expected: Option<u64>,
    pub bytes_transferred: u64,
    pub source_modified: bool,
    pub local_sha256: String,
    pub provider_checksum: Option<ProviderChecksumMatch>,
    pub status: CloudStatus,
    pub checkpoint: Option<DownloadCheckpoint>,
    pub retries: u32,
    pub rate_limit_events: u32,
    pub provenance: CloudProvenance,
    pub limitations: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudProvenance {
    pub manifest_schema: String,
    pub authorization_record_id: String,
    pub request_ids: Vec<String>,
    pub scopes: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProviderChecksum {
    pub algorithm: ChecksumAlgorithm,
    pub value: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProviderChecksumMatch {
    pub algorithm: ChecksumAlgorithm,
    pub provider_value: String,
    pub local_value: String,
    pub matched: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ChecksumAlgorithm {
    Md5,
    Sha1,
    Sha256,
    ProviderSpecific(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExportFormat {
    pub mime_type: String,
    pub extension: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CloudStatus {
    Verified,
    Partial,
    Corrupted,
    Unsupported,
}

/// A sink receives verified-range bytes from a connector without exposing the
/// connector's transport or access token to the caller.
pub trait DownloadSink: Send {
    fn write_chunk(&mut self, offset: u64, bytes: &[u8]) -> io::Result<()>;
    fn commit(self: Box<Self>) -> io::Result<()>;
    fn abort(self: Box<Self>);
}

/// Provider-neutral read-only connector contract.
pub trait CloudConnector: Send + Sync {
    fn provider_id(&self) -> &str;
    fn capabilities(&self) -> CloudCapabilities;
    fn account_context<'a>(&'a self) -> BoxFuture<'a, CloudResult<CloudAccountContext>>;
    fn list_sources<'a>(
        &'a self,
        query: CloudQuery,
        cursor: Option<String>,
    ) -> BoxFuture<'a, CloudResult<Page<CloudObjectSummary>>>;
    fn get_object<'a>(&'a self, object_id: &'a str) -> BoxFuture<'a, CloudResult<CloudObject>>;
    fn list_versions<'a>(
        &'a self,
        object_id: &'a str,
        cursor: Option<String>,
    ) -> BoxFuture<'a, CloudResult<Page<CloudVersion>>>;
    fn pin_version<'a>(&'a self, request: PinRequest) -> BoxFuture<'a, CloudResult<PinnedObject>>;
    fn download_object<'a>(
        &'a self,
        request: DownloadRequest,
        sink: Box<dyn DownloadSink>,
    ) -> BoxFuture<'a, CloudResult<CloudDownloadResult>>;
    fn revoke<'a>(&'a self) -> BoxFuture<'a, CloudResult<()>>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AuthorizationRequest {
    pub schema: String,
    pub provider: String,
    pub requested_scopes: Vec<String>,
    pub access_mode: AccessMode,
    pub account_hint: Option<String>,
    pub interactive: bool,
    pub redirect_mode: RedirectMode,
    pub pkce: bool,
    pub state_hash: String,
    pub operator_id: String,
    pub ticket: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AccessMode {
    ReadOnly,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RedirectMode {
    Loopback,
    InjectedBroker,
}

/// A public credential reference contains no token material.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CredentialRef {
    pub provider: String,
    pub account_id: String,
    pub handle_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AuthorizationResult {
    pub provider: String,
    pub account_id: String,
    pub subject_hash: String,
    pub granted_scopes: Vec<String>,
    pub authorization_record_id: String,
    pub credential: CredentialRef,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CredentialMetadata {
    pub provider: String,
    pub account_id: String,
    pub subject_hash: String,
    pub scopes: Vec<String>,
    pub expires_at: Option<String>,
}

/// Secret storage is an injected boundary. Implementations may use an OS
/// keychain or enterprise secret manager; the SPI never serializes token bytes.
pub trait CredentialStore: Send + Sync {
    fn get<'a>(
        &'a self,
        provider: &'a str,
        account_hint: Option<&'a str>,
    ) -> BoxFuture<'a, CloudResult<Option<(CredentialRef, CredentialMetadata)>>>;
    fn put<'a>(
        &'a self,
        provider: &'a str,
        account_id: &'a str,
        authorization: AuthorizationResult,
    ) -> BoxFuture<'a, CloudResult<CredentialRef>>;
    fn delete<'a>(&'a self, credential: CredentialRef) -> BoxFuture<'a, CloudResult<()>>;
}

pub trait AuthorizationBroker: Send + Sync {
    fn authorize<'a>(
        &'a self,
        request: AuthorizationRequest,
    ) -> BoxFuture<'a, CloudResult<AuthorizationResult>>;
    fn refresh<'a>(
        &'a self,
        credential: CredentialRef,
    ) -> BoxFuture<'a, CloudResult<AuthorizationResult>>;
    fn revoke<'a>(&'a self, credential: CredentialRef) -> BoxFuture<'a, CloudResult<()>>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudPolicy {
    pub read_only: bool,
    pub allow_network: bool,
    pub allow_cloud: bool,
    pub max_bytes: u64,
}

impl CloudPolicy {
    pub fn permits_read_only_cloud(&self) -> bool {
        self.read_only && self.allow_network && self.allow_cloud && self.max_bytes > 0
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CloudError {
    pub provider: String,
    pub code: CloudErrorCode,
    pub category: ErrorCategory,
    pub retryable: bool,
    pub safe_message: String,
    pub provider_status: Option<u16>,
    pub request_id: Option<String>,
    pub object_id: Option<String>,
    pub checkpoint: Option<DownloadCheckpoint>,
    pub remediation: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ErrorCategory {
    Authorization,
    Policy,
    Object,
    Version,
    Transfer,
    Provider,
    Output,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CloudErrorCode {
    AuthRequired,
    AuthCancelled,
    AuthScopeDenied,
    AuthTokenExpired,
    AuthRevoked,
    AuthAccountMismatch,
    PolicyNetworkDenied,
    PolicyCloudDenied,
    ObjectNotFound,
    ObjectPermissionDenied,
    VersionUnavailable,
    VersionChanged,
    ExportUnsupported,
    RateLimited,
    ProviderUnavailable,
    ChecksumMismatch,
    OutputCollision,
    CheckpointInvalid,
    QuotaExceeded,
    Aborted,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cloud_policy_fails_closed_by_default() {
        let policy = CloudPolicy {
            read_only: true,
            allow_network: false,
            allow_cloud: false,
            max_bytes: 1,
        };
        assert!(!policy.permits_read_only_cloud());
    }

    #[test]
    fn cloud_policy_requires_read_only_network_and_cloud_flags() {
        let policy = CloudPolicy {
            read_only: true,
            allow_network: true,
            allow_cloud: true,
            max_bytes: 1,
        };
        assert!(policy.permits_read_only_cloud());
        assert!(!CloudPolicy {
            read_only: false,
            ..policy.clone()
        }
        .permits_read_only_cloud());
        assert!(!CloudPolicy {
            allow_network: false,
            ..policy.clone()
        }
        .permits_read_only_cloud());
        assert!(!CloudPolicy {
            allow_cloud: false,
            ..policy
        }
        .permits_read_only_cloud());
    }

    #[test]
    fn public_credential_reference_contains_only_opaque_identifiers() {
        let credential = CredentialRef {
            provider: "google-drive".into(),
            account_id: "account-1".into(),
            handle_id: "keychain:abc".into(),
        };
        let debug = format!("{credential:?}");
        assert!(!debug.contains("access_token"));
        assert!(!debug.contains("refresh_token"));
    }

    #[test]
    fn checkpoint_identity_is_explicit() {
        let checkpoint = DownloadCheckpoint {
            object_id: "object-1".into(),
            version_id: Some("revision-1".into()),
            committed_bytes: 512,
            local_sha256: "a".repeat(64),
            destination: "/case/artifact".into(),
        };
        assert_eq!(checkpoint.object_id, "object-1");
        assert_eq!(checkpoint.version_id.as_deref(), Some("revision-1"));
        assert_eq!(checkpoint.committed_bytes, 512);
    }
}
