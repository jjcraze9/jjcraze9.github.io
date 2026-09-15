let students = {};      // id -> { name }
let calledToday = {};   // id -> true
let searchTerm = '';
let siblingMode = false;
let selectedIds = new Set();

const db = firebase.database();
const grid = document.getElementById('childGrid');
const emptyState = document.getElementById('emptyState');
const recentList = document.getElementById('recentList');
const recentEmpty = document.getElementById('recentEmpty');
const modeHint = document.getElementById('modeHint');

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

  db.ref('pickupSession/called').on('value', (snap) => {
    calledToday = snap.val() || {};
    render();
  });

  db.ref('pickupSession/callLog').orderByChild('timestamp').limitToLast(15).on('value', (snap) => {
    const entries = [];
    snap.forEach((child) => entries.push(child.val()));
    entries.reverse();
    renderRecent(entries);
  });
}

function render() {
  grid.innerHTML = '';
  const ids = Object.keys(students).filter((id) => {
    const name = (students[id].name || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  ids.sort((a, b) => (students[a].name || '').localeCompare(students[b].name || ''));

  emptyState.style.display = ids.length === 0 ? 'block' : 'none';

  ids.forEach((id) => {
    const btn = document.createElement('button');
    btn.className = 'child-btn';
    btn.textContent = students[id].name;

    if (calledToday[id]) btn.classList.add('called');
    if (selectedIds.has(id)) btn.classList.add('selected');

    btn.addEventListener('click', () => handleTap(id));
    grid.appendChild(btn);
  });
}

function renderRecent(entries) {
  recentList.innerHTML = '';
  recentEmpty.style.display = entries.length === 0 ? 'block' : 'none';
  entries.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = '✓ ' + (entry.names || []).join(' & ');
    recentList.appendChild(li);
  });
}

function handleTap(id) {
  if (siblingMode) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    render();
    return;
  }
  callChildren([id]);
}

function callChildren(ids) {
  const names = ids.map((id) => students[id].name).filter(Boolean);
  if (names.length === 0) return;

  const timestamp = firebase.database.ServerValue.TIMESTAMP;

  const updates = {};
  updates['pickupSession/currentCall'] = { names, timestamp };
  ids.forEach((id) => {
    updates[`pickupSession/called/${id}`] = true;
  });

  db.ref().update(updates).then(() => {
    db.ref('pickupSession/callLog').push({ names, timestamp });
  });

  if (siblingMode) exitSiblingMode();
}

// ---- Sibling / multi-select mode ----

const siblingModeBtn = document.getElementById('siblingModeBtn');
const callSelectedBtn = document.getElementById('callSelectedBtn');
const cancelSiblingBtn = document.getElementById('cancelSiblingBtn');

siblingModeBtn.addEventListener('click', () => {
  siblingMode = true;
  selectedIds = new Set();
  siblingModeBtn.style.display = 'none';
  callSelectedBtn.style.display = 'inline-block';
  cancelSiblingBtn.style.display = 'inline-block';
  modeHint.textContent = 'Tap each child being picked up together, then tap "Call selected."';
  render();
});

cancelSiblingBtn.addEventListener('click', exitSiblingMode);

function exitSiblingMode() {
  siblingMode = false;
  selectedIds = new Set();
  siblingModeBtn.style.display = 'inline-block';
  callSelectedBtn.style.display = 'none';
  cancelSiblingBtn.style.display = 'none';
  modeHint.textContent = '';
  render();
}

callSelectedBtn.addEventListener('click', () => {
  if (selectedIds.size === 0) return;
  callChildren(Array.from(selectedIds));
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

  db.ref('pickupSession').set({}).then(() => {
    exitSiblingMode();
  });
});
