// Shows a visible red banner instead of the page silently doing nothing.
// Include this AFTER firebase-config.js and BEFORE auth-guard.js / page scripts.

function showFatalBanner(message) {
  if (window.__firebaseBannerShown) return; // avoid stacking duplicate banners
  window.__firebaseBannerShown = true;

  const bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:9999;background:#B3261E;color:#fff;' +
    'padding:14px 18px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.3);';
  bar.innerHTML =
    '<strong>Setup problem — nothing will work until this is fixed:</strong><br>' + message;
  document.body.prepend(bar);
}

// Returns true if Firebase is ready to use; shows a banner and returns false otherwise.
function checkFirebaseReady() {
  if (typeof firebase === 'undefined') {
    showFatalBanner(
      'The Firebase library did not load (check your internet connection, or that the ' +
      '&lt;script&gt; tags for firebase-app-compat.js etc. are present).'
    );
    return false;
  }
  if (!firebase.apps || firebase.apps.length === 0) {
    showFatalBanner(
      'js/firebase-config.js is missing, failed to load, or firebase.initializeApp() was never called. ' +
      'Copy js/firebase-config.sample.js to js/firebase-config.js and fill in your real project values.'
    );
    return false;
  }
  try {
    // Accessing .database() throws immediately if no Realtime Database is set up
    // for this project (e.g. only Firestore was created instead).
    firebase.database();
  } catch (err) {
    showFatalBanner(
      'Firebase Realtime Database isn\'t reachable. In the Firebase console, make sure you created ' +
      'a <em>Realtime Database</em> (Build &rarr; Realtime Database) — not just Firestore — and that ' +
      'the databaseURL in firebase-config.js matches it.<br><span style="opacity:.85">Details: ' +
      String(err.message || err) + '</span>'
    );
    return false;
  }
  return true;
}

// Catch-all so any other uncaught error also shows up on screen, not just in devtools.
window.addEventListener('error', (event) => {
  if (window.__firebaseBannerShown) return; // don't pile a second banner on top of the real cause
  showFatalBanner('Unexpected error: ' + (event.message || 'see browser console for details') +
    '<br><span style="opacity:.85">Open DevTools (F12) → Console for the full details.</span>');
});
