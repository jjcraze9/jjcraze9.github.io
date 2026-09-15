// Shared auth guard. Include after firebase-config.js on every staff page
// (index.html, display.html, admin.html). Calls onReady(user) once we know
// someone is signed in; otherwise bounces to login.html.

function requireStaffLogin(onReady) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      onReady(user);
    } else {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?next=${next}`;
    }
  });
}

function wireSignOut(buttonEl) {
  if (!buttonEl) return;
  buttonEl.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      location.href = 'login.html';
    });
  });
}
