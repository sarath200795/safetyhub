// ---------------------------------------------------------------------------
// WE EHS demo seeder
//
// Creates ONE shared demo organization ("WE EHS") + admin login
// (demo@weehs.app / Demo@123) inside each configured app's Firebase project,
// by replicating what each app's own "Register Organization" flow writes.
//
// Run locally (you need internet + each app's Firebase web config):
//     cp apps.config.example.mjs apps.config.mjs   # then fill it in
//     npm install
//     npm run seed
//
// Safe to re-run: if the auth user already exists it signs in and reuses the
// uid; if the user's org profile already exists it skips that app.
// ---------------------------------------------------------------------------

import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { APPS, DEMO } from "./apps.config.mjs";

// ---- helpers --------------------------------------------------------------

const HECP_PERMISSIONS = [
  "procedure.view",
  "procedure.create",
  "procedure.revise",
  "procedure.sendForApproval",
  "procedure.approve",
  "procedure.delete",
  "loto.perform",
  "users.manage",
];

// Mirrors hecp-loto's generateJoinCode(): e.g. "K7P-3QX".
function generateJoinCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let raw = "";
  for (let i = 0; i < 6; i++) raw += alphabet[bytes[i] % alphabet.length];
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

// ---- adapters: replicate each app's org-registration writes ---------------

// Shared helper for the org/user/orgIndex pattern used by most apps. orgExtra
// and userExtra carry the per-app fields verified from each repo's source.
function orgIndexSeeder({ orgExtra = {}, userExtra = {} } = {}) {
  return async function (db, { uid }) {
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (existing.exists() && existing.data().orgId) return "already-seeded";

    const orgRef = doc(collection(db, "organizations"));
    const nameLower = DEMO.orgName.trim().toLowerCase();
    const batch = writeBatch(db);
    batch.set(orgRef, {
      name: DEMO.orgName,
      nameLower,
      address: DEMO.address || "",
      createdBy: uid,
      ...orgExtra,
      createdAt: serverTimestamp(),
    });
    batch.set(userRef, {
      name: DEMO.name,
      email: DEMO.email,
      orgId: orgRef.id,
      orgName: DEMO.orgName,
      role: "admin",
      status: "approved",
      ...userExtra,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, "orgIndex", nameLower), { orgId: orgRef.id, name: DEMO.orgName });
    await batch.commit();
    return "created";
  };
}

const adapters = {
  // hecp-loto: organizations/{id} + users/{uid} (admin, approved, permissions).
  async hecp(db, { uid }) {
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (existing.exists() && existing.data().orgId) return "already-seeded";

    const orgRef = doc(collection(db, "organizations"));
    const batch = writeBatch(db);
    batch.set(orgRef, {
      name: DEMO.orgName,
      address: DEMO.address || "",
      joinCode: generateJoinCode(),
      sites: [],
      createdBy: uid,
      createdAt: serverTimestamp(),
    });
    batch.set(userRef, {
      email: DEMO.email,
      displayName: DEMO.name,
      orgId: orgRef.id,
      role: "admin",
      status: "approved",
      permissions: [...HECP_PERMISSIONS],
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      approvedBy: uid,
    });
    await batch.commit();
    return "created";
  },

  // fire-marshal: organizations/{id} + users/{uid} + public orgIndex/{nameLower}.
  async firemarshal(db, { uid }) {
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (existing.exists() && existing.data().orgId) return "already-seeded";

    const orgRef = doc(collection(db, "organizations"));
    const nameLower = DEMO.orgName.trim().toLowerCase();
    const batch = writeBatch(db);
    batch.set(orgRef, {
      name: DEMO.orgName,
      nameLower,
      address: DEMO.address || "",
      createdBy: uid,
      notificationEmail: DEMO.email,
      createdAt: serverTimestamp(),
    });
    batch.set(userRef, {
      name: DEMO.name,
      email: DEMO.email,
      orgId: orgRef.id,
      orgName: DEMO.orgName,
      role: "admin",
      status: "approved",
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, "orgIndex", nameLower), { orgId: orgRef.id, name: DEMO.orgName });
    await batch.commit();
    return "created";
  },

  // permit-to-work: org + admin user (with phone) + orgIndex.  [verified]
  ptw: orgIndexSeeder({ userExtra: { phone: "" } }),

  // hira: org + admin user + orgIndex.  [verified]
  hira: orgIndexSeeder(),

  // incident-ira: org has notificationEmail; user has a dept field.  [verified]
  ira: orgIndexSeeder({ orgExtra: { notificationEmail: DEMO.email }, userExtra: { dept: "" } }),

  // hse-committee-meeting: org has notificationEmail.  [verified]
  committee: orgIndexSeeder({ orgExtra: { notificationEmail: DEMO.email } }),

  // inspections-portal: org has notificationEmail.  [verified]
  inspect: orgIndexSeeder({ orgExtra: { notificationEmail: DEMO.email } }),

  // internal-audit-portal: distinct shape — location + adminUid, no orgIndex.  [verified]
  async audit(db, { uid }) {
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);
    if (existing.exists() && existing.data().orgId) return "already-seeded";

    const orgRef = doc(collection(db, "organizations"));
    const batch = writeBatch(db);
    batch.set(orgRef, {
      name: DEMO.orgName,
      location: "",
      adminUid: uid,
      createdAt: serverTimestamp(),
    });
    batch.set(userRef, {
      name: DEMO.name,
      email: DEMO.email,
      orgId: orgRef.id,
      role: "admin",
      status: "approved",
      createdAt: serverTimestamp(),
    });
    await batch.commit();
    return "created";
  },

  // Only creates the auth login; org gets made via the app's signup UI.
  async authOnly() {
    return "auth-only";
  },
};

// ---- per-app driver -------------------------------------------------------

function hasConfig(fb) {
  return fb && fb.apiKey && fb.projectId && !String(fb.apiKey).startsWith("VITE_");
}

async function seedApp(entry) {
  const tag = `• ${entry.label}`;
  if (entry.enabled === false) return console.log(`${tag}: skipped (enabled:false)`);
  if (!hasConfig(entry.firebase)) return console.log(`${tag}: skipped (Firebase config not filled in)`);

  const adapter = adapters[entry.adapter];
  if (!adapter) return console.log(`${tag}: skipped (unknown adapter "${entry.adapter}")`);

  const app = initializeApp(entry.firebase, `seed-${entry.label}-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  try {
    // 1) Ensure the auth user exists; reuse it if it already does.
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, DEMO.email, DEMO.password);
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: DEMO.name }).catch(() => {});
      console.log(`${tag}: auth user created`);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        const cred = await signInWithEmailAndPassword(auth, DEMO.email, DEMO.password);
        uid = cred.user.uid;
        console.log(`${tag}: auth user already existed — reusing`);
      } else {
        throw e;
      }
    }

    // 2) Write the org/profile docs for this app's schema.
    const result = await adapter(db, { uid });
    const msg = {
      created: "✓ demo org + admin profile created",
      "already-seeded": "✓ already seeded — left as-is",
      "auth-only": "✓ login created (create the WE EHS org via the app's signup screen)",
    }[result] || result;
    console.log(`${tag}: ${msg}`);
  } catch (e) {
    console.log(`${tag}: ✗ FAILED — ${e.code || ""} ${e.message}`);
  } finally {
    await signOut(auth).catch(() => {});
    await deleteApp(app).catch(() => {});
  }
}

// ---- main -----------------------------------------------------------------

console.log(`\nSeeding "${DEMO.orgName}" demo account (${DEMO.email}) across ${APPS.length} apps…\n`);
for (const entry of APPS) {
  await seedApp(entry); // sequential: keeps auth/firestore state clean per app
}
console.log("\nDone. Re-run any time — it's idempotent.\n");
