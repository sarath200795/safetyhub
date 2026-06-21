# WE EHS — Demo Account Seeder

Creates **one shared demo organization** named **`WE EHS`** with an admin login
(`demo@weehs.app` / `Demo@123`) inside each WE EHS app's Firebase project — the
same credentials shown on the landing page.

It does this by replicating exactly what each app's own *"Register Organization"*
flow writes to Firebase Auth + Firestore, so the seeded account behaves like a
normal admin signup.

> ⚠️ Run this **locally** (it needs internet + each app's Firebase config).
> It can't run from the Claude Code web sandbox, which has no outbound network.

## Setup

```bash
cd demo-seed
cp apps.config.example.mjs apps.config.mjs   # apps.config.mjs is git-ignored
```

Edit `apps.config.mjs` and, for each app, paste its **Firebase Web config** — the
six `VITE_FIREBASE_*` values from that app's **Vercel → Settings → Environment
Variables** (or its local `.env`). Then flip `enabled: true` on the apps you want
to seed. These config values are public client identifiers, not secrets.

## Run

```bash
npm install
npm run seed
```

You'll see a line per app, e.g.:

```
• HECP · LOTO: auth user created
• HECP · LOTO: ✓ demo org + admin profile created
• Fire Marshal: ✓ demo org + admin profile created
```

The script is **idempotent** — re-running it reuses the existing login and skips
apps that already have the demo org.

## Adapters

Each app entry names an `adapter` describing how that app stores orgs/users.
**All eight are verified against each app's own register-organization source.**

| Adapter | App | Writes |
| --- | --- | --- |
| `hecp` | hecp-loto | `organizations/{id}` + `users/{uid}` (admin, approved, full `permissions[]`, `joinCode`) |
| `firemarshal` | fire-marshal | `organizations/{id}` + `users/{uid}` (admin, approved) + `orgIndex/{nameLower}` |
| `ptw` | permit-to-work | `organizations/{id}` + `users/{uid}` (admin, approved, `phone`) + `orgIndex/{nameLower}` |
| `hira` | hira | `organizations/{id}` + `users/{uid}` (admin, approved) + `orgIndex/{nameLower}` |
| `ira` | incident-ira | `organizations/{id}` (`notificationEmail`) + `users/{uid}` (admin, approved, `dept`) + `orgIndex/{nameLower}` |
| `committee` | hse-committee-meeting | `organizations/{id}` (`notificationEmail`) + `users/{uid}` (admin, approved) + `orgIndex/{nameLower}` |
| `inspect` | inspections-portal | `organizations/{id}` (`notificationEmail`) + `users/{uid}` (admin, approved) + `orgIndex/{nameLower}` |
| `audit` | internal-audit-portal | `organizations/{id}` (`location`, `adminUid`) + `users/{uid}` (admin, approved) — no orgIndex |
| `authOnly` | — | only the Firebase Auth login; create the org via the app's signup UI |

If you ever change an app's signup schema, send me the updated `createOrganization`
and I'll adjust its adapter.

## Notes

- **Email verification:** Firebase Email/Password doesn't verify addresses by
  default, so `demo@weehs.app` works as a login even though it's not a real inbox.
  If an app enforces verification or password reset, use a mailbox you control and
  update both this config and the landing page.
- **Firestore rules:** these apps allow a freshly-signed-up user to create their
  own org/profile, so the seed writes succeed under normal rules. If a rule blocks
  a write you'll see a `permission-denied` line — tell me and we'll adjust.
