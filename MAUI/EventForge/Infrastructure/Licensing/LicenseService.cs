using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace EventForge.Infrastructure.Licensing;

/// <summary>
/// Offline license verification + persistence.
///
/// A license key has the form:  EVF1.&lt;base64url(payloadJson)&gt;.&lt;base64url(signature)&gt;
/// where the signature is RSA-2048 / SHA-256 (PKCS#1) over the UTF-8 bytes of
/// "EVF1.&lt;base64url(payloadJson)&gt;" produced with the publisher's PRIVATE key.
///
/// The matching PUBLIC key is embedded below and used to verify keys with no
/// network access. The private key NEVER ships with the app — it lives only in
/// the EventForge.LicenseGen tool you run when issuing keys.
///
/// This type is infrastructure / app-shell only. It does not touch the Domain
/// layer and it stores its state OUTSIDE the SQLite database (in license.key),
/// so copying the DB file does not transfer a license.
/// </summary>
public sealed class LicenseService
{
    private const string KeyPrefix = "EVF1";
    private const string ExpectedApp = "EventForge";
    private const string LicenseFileName = "license.key";

    // ─────────────────────────────────────────────────────────────────────
    // EMBEDDED PUBLIC KEY (SubjectPublicKeyInfo, base64).
    //
    // ⚠️ PLACEHOLDER. Generate a real keypair with:
    //        cd tools/EventForge.LicenseGen
    //        dotnet run -- keygen
    //    then paste the printed public key string here and rebuild the app.
    //
    // Until a real key is pasted, all activation attempts fail (Invalid) and
    // the app stays in Demo — which is the safe default.
    // ─────────────────────────────────────────────────────────────────────
    private const string PublicKeyBase64 = "REPLACE_WITH_PUBLIC_KEY_FROM_LICENSEGEN";

    private readonly string _licenseFilePath;
    private readonly object _gate = new();

    private LicenseStatus _status = LicenseStatus.NotActivated;
    private LicenseInfo? _license;

    public LicenseService(string appDataRoot)
    {
        _licenseFilePath = Path.Combine(appDataRoot, LicenseFileName);
        LoadFromDisk();
    }

    /// <summary>True only when a signature-verified license is active.</summary>
    public bool IsLicensed
    {
        get { lock (_gate) return _status == LicenseStatus.Active; }
    }

    public LicenseEdition Edition =>
        IsLicensed ? LicenseEdition.Full : LicenseEdition.Demo;

    /// <summary>Current snapshot for the UI (no error attached).</summary>
    public LicenseSnapshot GetSnapshot()
    {
        lock (_gate)
            return BuildSnapshot(_status, _license, error: null);
    }

    /// <summary>
    /// Validate a pasted license key. On success, persists it and switches the
    /// app to Full. On failure, leaves any existing license untouched and
    /// returns a snapshot whose <see cref="LicenseSnapshot.Error"/> explains why.
    /// Idempotent: activating the same valid key twice is a no-op success.
    /// </summary>
    public LicenseSnapshot Activate(string? licenseKey)
    {
        if (string.IsNullOrWhiteSpace(licenseKey))
            return Failure("License key is empty.");

        if (!TryVerify(licenseKey.Trim(), out var info, out var error))
            return Failure(error);

        lock (_gate)
        {
            try
            {
                File.WriteAllText(_licenseFilePath, licenseKey.Trim());
            }
            catch (Exception ex)
            {
                return Failure($"Could not save license: {ex.Message}");
            }

            _license = info;
            _status = LicenseStatus.Active;
            return BuildSnapshot(_status, _license, error: null);
        }
    }

    /// <summary>Remove the stored license and return to Demo.</summary>
    public LicenseSnapshot Deactivate()
    {
        lock (_gate)
        {
            try
            {
                if (File.Exists(_licenseFilePath))
                    File.Delete(_licenseFilePath);
            }
            catch
            {
                // Best-effort: even if the file lingers, drop in-memory state.
            }

            _license = null;
            _status = LicenseStatus.NotActivated;
            return BuildSnapshot(_status, _license, error: null);
        }
    }

    // ── internals ─────────────────────────────────────────────────────────

    private void LoadFromDisk()
    {
        try
        {
            if (!File.Exists(_licenseFilePath))
            {
                _status = LicenseStatus.NotActivated;
                return;
            }

            var key = File.ReadAllText(_licenseFilePath);
            if (TryVerify(key.Trim(), out var info, out _))
            {
                _license = info;
                _status = LicenseStatus.Active;
            }
            else
            {
                // A stored-but-broken key (tampered / key rotated) → Demo.
                _license = null;
                _status = LicenseStatus.Invalid;
            }
        }
        catch
        {
            _license = null;
            _status = LicenseStatus.Invalid;
        }
    }

    private static bool TryVerify(string licenseKey, out LicenseInfo? info, out string? error)
    {
        info = null;
        error = null;

        var parts = licenseKey.Split('.');
        if (parts.Length != 3 || parts[0] != KeyPrefix)
        {
            error = "License key format is not recognized.";
            return false;
        }

        byte[] payloadBytes;
        byte[] signature;
        try
        {
            payloadBytes = Base64Url.Decode(parts[1]);
            signature = Base64Url.Decode(parts[2]);
        }
        catch
        {
            error = "License key is corrupted.";
            return false;
        }

        // Signature covers "EVF1.<base64url(payload)>" exactly.
        var signedData = Encoding.UTF8.GetBytes($"{parts[0]}.{parts[1]}");

        bool verified;
        try
        {
            using var rsa = RSA.Create();
            rsa.ImportSubjectPublicKeyInfo(
                Convert.FromBase64String(PublicKeyBase64), out _);

            verified = rsa.VerifyData(
                signedData, signature,
                HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        }
        catch
        {
            // Almost always the placeholder public key not yet replaced.
            error = "License verification is not available (public key not configured).";
            return false;
        }

        if (!verified)
        {
            error = "License key is invalid.";
            return false;
        }

        LicenseInfo? parsed;
        try
        {
            parsed = JsonSerializer.Deserialize<LicenseInfo>(payloadBytes);
        }
        catch
        {
            error = "License key payload is unreadable.";
            return false;
        }

        if (parsed is null || !string.Equals(parsed.App, ExpectedApp, StringComparison.Ordinal))
        {
            error = "License key is not valid for this product.";
            return false;
        }

        info = parsed;
        return true;
    }

    private LicenseSnapshot Failure(string? error)
    {
        lock (_gate)
            return BuildSnapshot(_status, _license, error ?? "Activation failed.");
    }

    private static LicenseSnapshot BuildSnapshot(
        LicenseStatus status, LicenseInfo? license, string? error)
    {
        var active = status == LicenseStatus.Active && license is not null;
        return new LicenseSnapshot
        {
            Status = status.ToString(),
            Edition = active ? "full" : "demo",
            Licensed = active,
            CustomerName = license?.CustomerName,
            CustomerEmail = license?.CustomerEmail,
            IssuedUtc = license is null
                ? null
                : DateTimeOffset.FromUnixTimeSeconds(license.IssuedAtUnix)
                    .UtcDateTime.ToString("yyyy-MM-dd"),
            Error = error
        };
    }
}

/// <summary>Minimal URL-safe base64 (no padding) shared with the key tool.</summary>
internal static class Base64Url
{
    public static string Encode(byte[] data) =>
        Convert.ToBase64String(data)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public static byte[] Decode(string value)
    {
        var s = value.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }
        return Convert.FromBase64String(s);
    }
}
