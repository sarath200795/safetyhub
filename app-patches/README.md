# App patch — "Try the demo" on each login screen

Adds a small panel to each app's **Login** screen that shows the shared WE EHS
demo credentials (`demo@weehs.app` / `Demo@123`) and a **Use demo account** button
that fills the form so a visitor can sign in with one click.

> These changes go in the **individual app repos** (permit-to-work, hecp-loto,
> hira, incident-ira, hse-committee-meeting, internal-audit-portal,
> inspections-portal, fire-marshal) — not in this repo. They couldn't be pushed
> from the web session that generated them (it only has write access to
> `safetyhub`), so apply them per repo, or open a Claude session on each repo and
> ask it to apply this patch.

## Apply (2 small edits per app)

1. **Copy the component** into the app:
   `cp DemoCredentials.jsx <app>/src/components/DemoCredentials.jsx`

2. **Edit `src/pages/Login.jsx`:**

   a. Add the import near the other imports:
   ```js
   import DemoCredentials from '../components/DemoCredentials'
   ```

   b. Inside the sign-in `<form>`, just **after the submit button**, add:
   ```jsx
   <DemoCredentials onUse={(creds) => setForm(creds)} />
   ```

That's it. These apps store the login fields as
`const [form, setForm] = useState({ email: '', password: '' })`, so
`onUse={(creds) => setForm(creds)}` fills both fields. The visitor then clicks
**Sign in**.

### Optional: auto-submit after filling
If you want the demo button to log in immediately instead of just filling the
fields, point `onUse` at the existing submit handler. Example:
```jsx
<DemoCredentials onUse={async (creds) => {
  setForm(creds)
  setBusy(true)
  try { await login(creds); navigate('/app/dashboard', { replace: true }) }
  catch (err) { toast.error(authErrorMessage(err)) }
  finally { setBusy(false) }
}} />
```

## Per-app notes

| App | Login file | Form setter | Notes |
| --- | --- | --- | --- |
| permit-to-work | `src/pages/Login.jsx` | `setForm` | standard |
| hecp-loto | `src/pages/Login.jsx` | `setForm` | standard |
| hira | `src/pages/Login.jsx` | `setForm` | standard |
| incident-ira | `src/pages/Login.jsx` | `setForm` | standard |
| hse-committee-meeting | `src/pages/Login.jsx` | `setForm` | standard |
| inspections-portal | `src/pages/Login.jsx` | `setForm` | standard |
| fire-marshal | `src/pages/Login.jsx` | `setForm` | standard |
| internal-audit-portal | `src/pages/Login.jsx` | check the local state | if its login state isn't named `form`, pass a setter that sets the email + password fields |

If any app's Login uses different field state, just wire `onUse` to whatever sets
its email/password inputs — the component itself doesn't change.
