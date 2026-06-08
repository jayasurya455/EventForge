using System.Text.Json.Serialization;

namespace EventForge.Infrastructure.Licensing;

/// <summary>
/// Product edition the running app is operating under.
/// Demo = unlicensed (default). Full = a valid license key has been activated.
/// </summary>
public enum LicenseEdition
{
    Demo = 0,
    Full = 1
}

/// <summary>
/// Result of inspecting the currently stored license.
/// </summary>
public enum LicenseStatus
{
    /// No license key has been activated yet. App runs in Demo.
    NotActivated = 0,

    /// A valid, signature-verified license is active. App runs in Full.
    Active = 1,

    /// A license key exists but failed verification (tampered, malformed,
    /// wrong product, or signed by an unknown key). App falls back to Demo.
    Invalid = 2
}

/// <summary>
/// The signed payload carried inside a license key.
/// Property names are deliberately short to keep keys compact.
/// </summary>
public sealed class LicenseInfo
{
    /// Unique license id (GUID string). Lets you track / revoke later.
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// Product guard. Must equal "EventForge" or the key is rejected.
    [JsonPropertyName("app")]
    public string App { get; set; } = string.Empty;

    /// Edition granted by this key. Currently always "full".
    [JsonPropertyName("ed")]
    public string Edition { get; set; } = "full";

    /// Customer display name (optional, shown in About / Settings).
    [JsonPropertyName("name")]
    public string? CustomerName { get; set; }

    /// Customer email (optional).
    [JsonPropertyName("email")]
    public string? CustomerEmail { get; set; }

    /// Issued-at, Unix seconds (UTC). Informational only.
    [JsonPropertyName("iat")]
    public long IssuedAtUnix { get; set; }
}

/// <summary>
/// Immutable snapshot handed to the UI through the bridge.
/// </summary>
public sealed class LicenseSnapshot
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = nameof(LicenseStatus.NotActivated);

    [JsonPropertyName("edition")]
    public string Edition { get; set; } = "demo";

    [JsonPropertyName("licensed")]
    public bool Licensed { get; set; }

    [JsonPropertyName("customerName")]
    public string? CustomerName { get; set; }

    [JsonPropertyName("customerEmail")]
    public string? CustomerEmail { get; set; }

    [JsonPropertyName("issuedUtc")]
    public string? IssuedUtc { get; set; }

    /// Populated when an activation attempt fails, so the UI can show why.
    [JsonPropertyName("error")]
    public string? Error { get; set; }
}
