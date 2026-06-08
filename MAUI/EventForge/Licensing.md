# EventForge Licensing (Offline License Keys)

> Status: **Step 1 of monetization** — offline activation core.
> Demo mode (Step 2) and Microsoft Store packaging (Step 3) build on this.

## Goal

Let a user unlock the **Full** version by entering a license key **once**, with
**no internet connection** and **no account/login**. This keeps EventForge's
offline-first guarantee intact.

## How it works

1. You (publisher) hold an **RSA-2048 private key**. It never ships.
2. The app embeds the matching **public key**.
3. A license key is a signed token:

   ```
   EVF1.<base64url(payload)>.<base64url(signature)>
   ```

   * `payload` — JSON: license id, product (`EventForge`), edition, optional
     customer name/email, issued date.
   * `signature` — RSA/SHA-256 (PKCS#1) over `EVF1.<base64url(payload)>`,
     made with your private key.
4. The app verifies the signature offline with the embedded public key. If it
   verifies and the product matches, the app switches to **Full** and stores the
   key in `license.key` (next to the DB, but **not inside it**).

### Why the license is stored outside the SQLite DB

The architecture's litmus test is "copy the DB file → app works immediately."
The license is a **per-install / per-purchase** concern, not app *data*, so it
lives in its own file. Copying the DB still moves all leagues/teams/auctions; it
just doesn't move the license — which is the correct behavior.

### Trade-off (v1)

No machine-binding: a key is a plain string and could be shared. This is the
deliberate cost of a fully-offline, no-server model. A future version can add a
machine fingerprint to the payload without changing the key format.

## One-time setup (you, locally)

```bash
cd tools/EventForge.LicenseGen
dotnet run -- keygen
```

* Copy the printed **PUBLIC KEY** into
  `MAUI/EventForge/Infrastructure/Licensing/LicenseService.cs`
  → replace `PublicKeyBase64 = "REPLACE_WITH_PUBLIC_KEY_FROM_LICENSEGEN"`.
* Keep `eventforge-private.key` **secret** (password manager / offline vault).
  Anyone with it can mint licenses. Do **not** commit it.
* Rebuild the app.

## Issuing a license to a customer

```bash
cd tools/EventForge.LicenseGen
dotnet run -- issue --name "Jane Doe" --email jane@example.com
```

Send the printed `EVF1...` string to the customer. They paste it into the app's
**Activate** screen (`/activate`).

## Components

| Layer | File | Role |
|---|---|---|
| MAUI | `Infrastructure/Licensing/LicenseService.cs` | Verify + persist + state |
| MAUI | `Infrastructure/Licensing/LicenseModels.cs` | Enums, payload, UI snapshot |
| Bridge | `InterOperable/HybridBridge.cs` | `license.status/activate/deactivate` |
| Router | `Infrastructure/NativeCommandRouter.cs` | Routes the 3 methods |
| DI | `MauiProgram.cs` | Registers `LicenseService` (singleton) |
| Tool | `tools/EventForge.LicenseGen` | keygen + issue (publisher-side) |
| UI | `shared/services/license/license.service.ts` | Angular gate + signal |
| UI | `shell/license-activation/*` | Activation screen (`/activate`) |

## Bridge contract

* `license.status` → `LicenseSnapshot`
* `license.activate` `{ key }` → `LicenseSnapshot` (`error` set on failure)
* `license.deactivate` → `LicenseSnapshot`

```ts
interface LicenseSnapshot {
  status: 'NotActivated' | 'Active' | 'Invalid';
  edition: 'demo' | 'full';
  licensed: boolean;
  customerName?: string | null;
  customerEmail?: string | null;
  issuedUtc?: string | null;
  error?: string | null;
}
```

## Verify locally

1. Build the MAUI app, run it. `/activate` shows **Demo mode**.
2. Mint a key with the tool, paste it → status becomes **Full version active**.
3. Restart the app → still Full (loaded from `license.key`).
4. Edit one character of the stored key → app falls back to Demo (Invalid).
