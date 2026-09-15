# Preschool Pickup Line

A staff-only, real-time pickup app: tap a child's name → every teacher device
and classroom smart board updates instantly. Built as static files so it can
be hosted for free on **GitHub Pages**, with **Firebase Realtime Database**
providing the shared "backend" and live updates, and **Firebase
Authentication** keeping it staff-only.

## What's in this folder

```
index.html        Pickup staff screen (tap names to call)
display.html       Smart board / teacher display (read-only, auto-updates)
admin.html          Manage Students (add / edit / remove / bulk add)
login.html          Staff sign-in
css/styles.css       Shared styling
js/firebase-config.sample.js   Template for your Firebase credentials
js/auth-guard.js      Shared "must be signed in" check
js/index.js, display.js, admin.js, login.js   Page logic
database.rules.json    Firebase security rules (staff-only read/write)
```

Why Firebase and not a "real" server: GitHub Pages only serves static
files — it can't run backend code. Firebase's Realtime Database is a
managed, shared database with live sync built in, and its SDK runs
entirely in the browser, so it works perfectly from a static site. This
is the same approach used by countless static-hosted apps that need
real-time data.

---

## Part 1 — Create your Firebase project (~10 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**. Name it something like `preschool-pickup`. Google Analytics is not needed — you can turn it off.
2. Once the project is created, click the **</> (web)** icon to register a web app. Give it any nickname (e.g. "Pickup App"). You do **not** need Firebase Hosting — you're using GitHub Pages instead.
3. Firebase will show you a `firebaseConfig` object with keys like `apiKey`, `authDomain`, etc. Keep this tab open — you'll need it in Part 3.
4. In the left sidebar, go to **Build → Realtime Database → Create Database**. Choose a location close to you, and start in **locked mode** (we'll paste in our own rules next).
5. In the left sidebar, go to **Build → Authentication → Get started**. Under **Sign-in method**, enable **Email/Password**.
6. Still in Authentication, go to the **Users** tab and click **Add user** to create a login for your staff. For a school of ~6 staff, the simplest approach is:
   - **One shared account** everyone uses (e.g. `pickup@yourschool.org` / a shared password), used on every device — simplest to manage.
   - *or* **one account per staff member**, if you'd rather be able to tell who's signed in on which device.

   Either works with this app as-is.

## Part 2 — Set the database rules

1. In Firebase, go to **Realtime Database → Rules**.
2. Replace the contents with the contents of `database.rules.json` from this folder:

   ```json
   {
     "rules": {
       "students": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "pickupSession": {
         ".read": "auth != null",
         ".write": "auth != null"
       },
       "$other": {
         ".read": false,
         ".write": false
       }
     }
   }
   ```

3. Click **Publish**. This means: only signed-in staff accounts can read or write student names or pickup calls — nothing is publicly accessible, and parents (who have no account) can't see or touch anything.

## Part 3 — Add your Firebase credentials to the app

1. In this folder, copy `js/firebase-config.sample.js` to a new file named `js/firebase-config.js`.
2. Open `js/firebase-config.js` and paste in the real values from the `firebaseConfig` object Firebase showed you in Part 1, step 3. It should look like:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "preschool-pickup.firebaseapp.com",
     databaseURL: "https://preschool-pickup-default-rtdb.firebaseio.com",
     projectId: "preschool-pickup",
     storageBucket: "preschool-pickup.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };

   firebase.initializeApp(firebaseConfig);
   ```

3. **This file is safe to commit to a public GitHub repo.** Firebase's web config isn't a secret credential — it just tells the app which project to talk to. The actual protection is the sign-in requirement and the rules from Part 2.

## Part 4 — Put it on GitHub Pages

1. Create a new GitHub repository (public or private — either works with GitHub Pages on a paid plan; public is required for Pages on a free personal account, but you're not exposing anything sensitive since real security is the Firebase login).
2. Upload every file in this folder to the repo, **keeping the folder structure** (`css/`, `js/`, and the `.html` files at the root), including your new `js/firebase-config.js`.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch," pick your main branch and the `/ (root)` folder, then **Save**.
5. GitHub will give you a URL like `https://yourusername.github.io/your-repo-name/`. It can take a minute or two to go live.

## Part 5 — Test it before using real names

1. Open `https://yourusername.github.io/your-repo-name/login.html` on your laptop and sign in with the staff account you made in Part 1.
2. You'll land on the pickup screen — it starts empty. Go to **Manage Students** and add a few **fake test names** (the brief calls for testing with fake data first — good instinct).
3. Open `display.html` on a second device (another laptop, your phone, or the actual smart board's browser) and sign in there too.
4. Back on the pickup screen, tap a test child's name. Within a second or two, the display device should flash and show that name in large text — that's the real-time sync working.
5. Try **"Call siblings together"** to select two names and call them at once.
6. Try **Reset Today's Pickup List** and confirm the "called" checkmarks clear while the names stay saved.
7. Once you're happy, delete the test names from Manage Students and add your real class list (the bulk "Add all" box on that page accepts a whole list, one name per line, pasted at once).

### Setting up each device

- **Pickup staff device**: open `index.html`, sign in once. Add it to the home screen (Safari/Chrome → Share/Menu → "Add to Home Screen") for a full-screen, app-like feel.
- **Classroom smart boards**: open `display.html` on each one, sign in once. Since sign-in is remembered on that device/browser, staff won't need to log in again — it can just stay open all day.
- **Manage Students**: only needs to be opened occasionally, from `admin.html`, by whoever handles roster changes.

---

## Notes on what's included vs. what's a future step

**Included now:**
- Staff-only login (parents have no accounts and can't reach any screen without one)
- Real-time sync across unlimited devices (phones, tablets, smart boards)
- Tap-to-call with no typing during pickup
- Sibling / multi-child calling
- Recently called list
- Daily reset that keeps the roster but clears today's called status
- Add / edit / remove one child, or paste in a whole class list at once
- Works on iPhone, Android, tablets, and any smart board with a browser (installable as a home-screen web app / PWA-style icon)

**Deliberately left for a later pass, once you're happy with the basics:**
- **Push notifications** (a phone buzzing even if the browser tab isn't open) require a service worker plus Firebase Cloud Messaging and, on iPhone, the app must be added to the home screen first — it's a real feature but a separate, fiddlier build step on top of what's here. Today, the display page updates live *while it's open*, which covers the "smart board always on" and "teacher's tablet in view" cases described in the brief; it just won't buzz a phone that's asleep in a pocket.
- **Per-role permissions** (e.g. only some staff can remove students) — the current rules treat all signed-in staff equally; this can be tightened later with Firebase custom claims.
- **A real native App Store app** — intentionally skipped for now per the brief, in favor of testing this live web version first.
