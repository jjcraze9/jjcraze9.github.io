const db = firebase.database();
let students = {};
let adminSearchTerm = '';

const tbody = document.getElementById('studentTableBody');
const noStudentsNote = document.getElementById('noStudentsNote');

requireStaffLogin((user) => {
  document.getElementById('userEmail').textContent = user.email;
  wireSignOut(document.getElementById('signOutBtn'));

  db.ref('students').on('value', (snap) => {
    students = snap.val() || {};
    renderTable();
  });
});

function renderTable() {
  tbody.innerHTML = '';
  const ids = Object.keys(students).filter((id) =>
    (students[id].name || '').toLowerCase().includes(adminSearchTerm.toLowerCase())
  );
  ids.sort((a, b) => (students[a].name || '').localeCompare(students[b].name || ''));

  noStudentsNote.style.display = ids.length === 0 ? 'block' : 'none';

  ids.forEach((id) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = students[id].name;

    const actionsTd = document.createElement('td');
    actionsTd.className = 'row-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(tr, id));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-danger';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeStudent(id, students[id].name));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(removeBtn);

    tr.appendChild(nameTd);
    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  });
}

function startEdit(tr, id) {
  tr.innerHTML = '';

  const nameTd = document.createElement('td');
  const input = document.createElement('input');
  input.className = 'edit-input';
  input.value = students[id].name;
  nameTd.appendChild(input);

  const actionsTd = document.createElement('td');
  actionsTd.className = 'row-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-amber';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    const newName = input.value.trim();
    if (!newName) return;
    db.ref(`students/${id}/name`).set(newName);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-outline';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', renderTable);

  actionsTd.appendChild(saveBtn);
  actionsTd.appendChild(cancelBtn);

  tr.appendChild(nameTd);
  tr.appendChild(actionsTd);
}

function removeStudent(id, name) {
  const confirmed = confirm(`Remove ${name} from the pickup list? This can't be undone.`);
  if (!confirmed) return;

  const updates = {};
  updates[`students/${id}`] = null;
  updates[`pickupSession/called/${id}`] = null;
  db.ref().update(updates);
}

// ---- Add single child ----

const addForm = document.getElementById('addForm');
const addStatus = document.getElementById('addStatus');

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('addNameInput');
  const name = input.value.trim();
  if (!name) return;

  db.ref('students').push({ name }).then(() => {
    input.value = '';
    addStatus.textContent = `Added ${name}.`;
    addStatus.className = 'status-msg ok';
    setTimeout(() => { addStatus.textContent = ''; }, 2500);
  });
});

// ---- Bulk add ----

document.getElementById('bulkAddBtn').addEventListener('click', () => {
  const textarea = document.getElementById('bulkInput');
  const bulkStatus = document.getElementById('bulkStatus');
  const names = textarea.value
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (names.length === 0) return;

  const updates = {};
  names.forEach((name) => {
    const newRef = db.ref('students').push();
    updates[`students/${newRef.key}`] = { name };
  });

  db.ref().update(updates).then(() => {
    textarea.value = '';
    bulkStatus.textContent = `Added ${names.length} student${names.length === 1 ? '' : 's'}.`;
    bulkStatus.className = 'status-msg ok';
    setTimeout(() => { bulkStatus.textContent = ''; }, 3000);
  });
});

// ---- Search ----

document.getElementById('adminSearch').addEventListener('input', (e) => {
  adminSearchTerm = e.target.value;
  renderTable();
});
