if (typeof checkFirebaseReady === 'function' && !checkFirebaseReady()) {
  // banner already shown by diagnostics.js; stop before touching firebase.database()
} else {

let students = {};   // id -> { name, grade }
let callLog = {};    // id -> { name, timestamp }  (presence = "called today")
let currentGrade = '3s';
let searchTerm = '';

const db = firebase.database();
const grid = document.getElementById('childGrid');
const emptyState = document.getElementById('emptyState');
const recentList = document.getElementById('recentList');
const recentEmpty = document.getElementById('recentEmpty');

requireStaffLogin((user) => {
  document.getElementById('userEmail').textContent = user.email;
  wireSignOut(document.getElementById('signOutBtn'));
  startListeners();
});

function startListeners() {
  db.ref('students').on('value', (snap) => {
    students = snap.val() || {};
    render();
  });

  db.ref('pickupSession/callLog').on('value', (snap) => {
    callLog = snap.val() || {};
    render();
    renderRecent();
  });
}

function studentGrade(id) {
  return (students[id] && students[id].grade) || '3s'; // fallback for older test data with no grade set
}

function studentClassColor(id) {
  return (students[id] && students[id].classColor) || 'green'; // fallback for older test data
}

function render() {
  grid.innerHTML = '';
  const ids = Object.keys(students).filter((id) => {
    const name = (students[id].name || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesGrade = studentGrade(id) === currentGrade;
    return matchesSearch && matchesGrade;
  });

  ids.sort((a, b) => (students[a].name || '').localeCompare(students[b].name || ''));

  emptyState.style.display = ids.length === 0 ? 'block' : 'none';

  ids.forEach((id) => {
    const btn = document.createElement('button');
    btn.className = 'child-btn';
    btn.textContent = students[id].name;

    if (callLog[id]) {
      btn.classList.add('called');
      btn.classList.add(studentClassColor(id) === 'orange' ? 'called-orange' : 'called-green');
    }

    btn.addEventListener('click', () => handleTap(id));
    grid.appendChild(btn);
  });
}

function renderRecent() {
  const entries = Object.keys(callLog).map((id) => ({ id, ...callLog[id] }));
  entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // oldest first
  const recentThree = entries.slice(-3); // last 3 chronologically, still oldest-of-these-three first

  recentList.innerHTML = '';
  recentEmpty.style.display = recentThree.length === 0 ? 'block' : 'none';

  recentThree.forEach((entry) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'recent-chip ' + (studentClassColor(entry.id) === 'orange' ? 'recent-chip-orange' : 'recent-chip-green');
    btn.textContent = '✓ ' + entry.name;
    btn.title = 'Tap to undo this call';
    btn.addEventListener('click', () => uncallStudent(entry.id));
    li.appendChild(btn);
    recentList.appendChild(li);
  });
}

function handleTap(id) {
  if (callLog[id]) {
    uncallStudent(id);
  } else {
    callStudent(id);
  }
}

function callStudent(id) {
  const name = students[id] && students[id].name;
  if (!name) return;

  const timestamp = firebase.database.ServerValue.TIMESTAMP;
  const updates = {};
  updates[`pickupSession/callLog/${id}`] = { name, timestamp };
  updates['pickupSession/currentCall'] = { names: [name], timestamp };

  db.ref().update(updates).catch((err) => {
    alert("Couldn't send the pickup call: " + err.message);
  });
}

function uncallStudent(id) {
  db.ref(`pickupSession/callLog/${id}`).remove().catch((err) => {
    alert("Couldn't undo that call: " + err.message);
  });
}

// ---- Grade tabs ----

document.querySelectorAll('.grade-tab').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    currentGrade = tabBtn.dataset.grade;
    document.querySelectorAll('.grade-tab').forEach((b) => b.classList.toggle('active', b === tabBtn));
    render();
  });
});

// ---- Search ----

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  render();
});

// ---- Reset ----

document.getElementById('resetBtn').addEventListener('click', () => {
  const confirmed = confirm(
    "Reset today's pickup list?\n\nThis clears who has been called and the recently-called list, " +
    "but keeps every student's name saved."
  );
  if (!confirmed) return;

  db.ref('pickupSession').set({});
});

}
