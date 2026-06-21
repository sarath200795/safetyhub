// ---------------------------------------------------------------------------
// WE EHS demo-seed configuration
//
// 1. Copy this file to `apps.config.mjs`  (the real one is git-ignored).
// 2. For EACH app, paste its Firebase Web config — the six VITE_FIREBASE_*
//    values from that app's Vercel project (Settings → Environment Variables)
//    or its local .env. These are public client identifiers, not secrets.
// 3. Pick the right `adapter` for each app (see notes at the bottom).
// 4. Run:  npm install  &&  npm run seed
// ---------------------------------------------------------------------------

// The single shared demo account created in every app. Matches the credentials
// shown on the WE EHS landing page.
export const DEMO = {
  orgName: "WE EHS",
  name: "Demo User",
  email: "demo@weehs.app",
  password: "Demo@123",
  address: "WE EHS — Demo Organization",
};

// Helper so each entry is easy to read.
const fb = (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) =>
  ({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });

export const APPS = [
  {
    label: "HECP · LOTO",
    adapter: "hecp",            // verified against the hecp-loto source
    enabled: false,            // set true once you've filled the config below
    firebase: fb(
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_STORAGE_BUCKET",
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
      "VITE_FIREBASE_APP_ID",
    ),
  },
  {
    label: "Fire Marshal",
    adapter: "firemarshal",    // verified against the fire-marshal source
    enabled: false,
    firebase: fb("", "", "", "", "", ""),
  },

  // --- All six below use adapters verified against each app's own source. ---
  { label: "Permit to Work (PTW)", adapter: "ptw",       enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "HIRA",                 adapter: "hira",      enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Incident IRA",         adapter: "ira",       enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "HSE Committee",        adapter: "committee", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Internal Audit",       adapter: "audit",     enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Inspections",          adapter: "inspect",   enabled: false, firebase: fb("", "", "", "", "", "") },
];

// ---------------------------------------------------------------------------
// Adapters (all verified against each app's own register-organization source):
//   "hecp"        hecp-loto      — org + admin user (full permissions[] + joinCode).
//   "firemarshal" fire-marshal   — org + admin user + public orgIndex/{nameLower}.
//   "ptw"         permit-to-work — org + admin user (phone) + orgIndex.
//   "hira"        hira           — org + admin user + orgIndex.
//   "ira"         incident-ira   — org (notificationEmail) + admin user (dept) + orgIndex.
//   "committee"   hse-committee  — org (notificationEmail) + admin user + orgIndex.
//   "inspect"     inspections    — org (notificationEmail) + admin user + orgIndex.
//   "audit"       internal-audit — org (location + adminUid) + admin user (no orgIndex).
//   "authOnly"    Only creates the Firebase Auth login; make the org via the app's signup UI.
// ---------------------------------------------------------------------------
