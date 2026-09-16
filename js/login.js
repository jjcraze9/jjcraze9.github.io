if (typeof checkFirebaseReady === 'function' && !checkFirebaseReady()) {
  // banner already shown by diagnostics.js; stop before touching firebase.auth()
} else {

const params = new URLSearchParams(location.search);
const next = params.get('next') || 'index.html';

// If already signed in, skip straight to the destination page.
firebase.auth().onAuthStateChanged((user) => {
  if (user) location.href = next;
});

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorBox.classList.remove('show');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in…';

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
    .then(() => {
      location.href = next;
    })
    .catch((err) => {
      errorBox.textContent = err.code === 'auth/invalid-api-key' || err.code === 'auth/configuration-not-found'
        ? 'Firebase isn\'t configured correctly yet — double check js/firebase-config.js. (' + err.code + ')'
        : 'That email or password isn\'t right. Try again.';
      errorBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    });
});

}

