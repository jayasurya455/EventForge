using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

// EventForge license tooling (publisher-side, run locally — NEVER shipped).
//
//   dotnet run -- keygen [--out <dir>]
//       Creates an RSA-2048 keypair.
//       • Prints the PUBLIC key to paste into LicenseService.PublicKeyBase64.
//       • Writes the PRIVATE key to <dir>/eventforge-private.key  (KEEP SECRET).
//
//   dotnet run -- issue --name "Jane Doe" --email jane@x.com
//                       [--private <path>] [--edition full]
//       Mints a signed license key for a customer and prints it.
//
// Key format produced:  EVF1.<base64url(payload)>.<base64url(signature)>

return Run(args);

static int Run(string[] args)
{
    if (args.Length == 0)
    {
        PrintUsage();
        return 1;
    }

    try
    {
        return args[0].ToLowerInvariant() switch
        {
            "keygen" => KeyGen(ParseOptions(args)),
            "issue"  => Issue(ParseOptions(args)),
            _        => Fail($"Unknown command: {args[0]}")
        };
    }
    catch (Exception ex)
    {
        return Fail(ex.Message);
    }
}

static int KeyGen(Dictionary<string, string> opts)
{
    var outDir = opts.GetValueOrDefault("out", Directory.GetCurrentDirectory());
    Directory.CreateDirectory(outDir);

    using var rsa = RSA.Create(2048);

    var publicKey = Convert.ToBase64String(rsa.ExportSubjectPublicKeyInfo());
    var privateKey = Convert.ToBase64String(rsa.ExportPkcs8PrivateKey());

    var privatePath = Path.Combine(outDir, "eventforge-private.key");
    File.WriteAllText(privatePath, privateKey);

    Console.WriteLine();
    Console.WriteLine("==================================================================");
    Console.WriteLine(" PUBLIC KEY — paste into LicenseService.PublicKeyBase64 and rebuild");
    Console.WriteLine("==================================================================");
    Console.WriteLine(publicKey);
    Console.WriteLine();
    Console.WriteLine($"Private key written to: {privatePath}");
    Console.WriteLine("⚠️  Keep the private key SECRET. Anyone with it can mint licenses.");
    Console.WriteLine();
    return 0;
}

static int Issue(Dictionary<string, string> opts)
{
    var privatePath = opts.GetValueOrDefault("private", "eventforge-private.key");
    if (!File.Exists(privatePath))
        return Fail($"Private key not found: {privatePath}  (run 'keygen' first)");

    var name = opts.GetValueOrDefault("name");
    var email = opts.GetValueOrDefault("email");
    var edition = opts.GetValueOrDefault("edition", "full");

    using var rsa = RSA.Create();
    rsa.ImportPkcs8PrivateKey(
        Convert.FromBase64String(File.ReadAllText(privatePath).Trim()), out _);

    var payload = new
    {
        id = Guid.NewGuid().ToString("N"),
        app = "EventForge",
        ed = edition,
        name,
        email,
        iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
    };

    var payloadJson = JsonSerializer.SerializeToUtf8Bytes(payload);
    var payloadB64 = Base64Url(payloadJson);

    var signed = Encoding.UTF8.GetBytes($"EVF1.{payloadB64}");
    var signature = rsa.SignData(
        signed, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

    var key = $"EVF1.{payloadB64}.{Base64Url(signature)}";

    Console.WriteLine();
    Console.WriteLine("License key:");
    Console.WriteLine(key);
    Console.WriteLine();
    if (!string.IsNullOrWhiteSpace(name) || !string.IsNullOrWhiteSpace(email))
        Console.WriteLine($"  Issued to: {name} {(string.IsNullOrWhiteSpace(email) ? "" : $"<{email}>")}");
    Console.WriteLine($"  Edition:   {edition}");
    Console.WriteLine();
    return 0;
}

static Dictionary<string, string> ParseOptions(string[] args)
{
    var opts = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    for (var i = 1; i < args.Length; i++)
    {
        if (!args[i].StartsWith("--")) continue;
        var key = args[i][2..];
        var value = (i + 1 < args.Length && !args[i + 1].StartsWith("--"))
            ? args[++i]
            : "true";
        opts[key] = value;
    }
    return opts;
}

static string Base64Url(byte[] data) =>
    Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');

static int Fail(string message)
{
    Console.Error.WriteLine($"Error: {message}");
    return 1;
}

static void PrintUsage()
{
    Console.WriteLine("EventForge license tool");
    Console.WriteLine();
    Console.WriteLine("  dotnet run -- keygen [--out <dir>]");
    Console.WriteLine("  dotnet run -- issue --name \"Jane Doe\" --email jane@x.com [--private <path>] [--edition full]");
}
