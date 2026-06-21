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

  // --- The six apps below use the GENERIC adapter (best-guess common shape). ---
  // Verify the field names against each app's signup code before trusting it,
  // or set adapter: "authOnly" to just create the login and finish the org
  // setup inside the app's own "Register Organization" screen.
  { label: "Permit to Work (PTW)", adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "HIRA",                 adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Incident IRA",         adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "HSE Committee",        adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Internal Audit",       adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
  { label: "Inspections",          adapter: "generic", enabled: false, firebase: fb("", "", "", "", "", "") },
];

// ---------------------------------------------------------------------------
// Adapters:
//   "hecp"        Exact schema for hecp-loto (org + admin user w/ permissions + joinCode).
//   "firemarshal" Exact schema for fire-marshal (org + admin user + public orgIndex doc).
//   "generic"     Common pattern: organizations/{id} + users/{uid} (role admin,
//                 status approved) + orgIndex/{nameLower}. Verify before relying on it.
//   "authOnly"    Only creates the Firebase Auth login (email+password). Use when
//                 you'd rather create the "WE EHS" org via the app's own signup UI.
// ---------------------------------------------------------------------------
