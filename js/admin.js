if (typeof checkFirebaseReady === 'function' && !checkFirebaseReady()) {
  // banner already shown by diagnostics.js; stop before touching firebase.database()
} else {

const db = firebase.database();
let students = {};
let adminSearchTerm = '';
let currentAdminGrade = '3s';

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

function studentGrade(id) {
  return (students[id] && students[id].grade) || '3s'; // fallback for older test data with no grade set
}

function studentClassColor(id) {
  return (students[id] && students[id].classColor) || 'green'; // fallback for older test data
}

function renderTable() {
  tbody.innerHTML = '';
  const ids = Object.keys(students).filter((id) =>
    (students[id].name || '').toLowerCase().includes(adminSearchTerm.toLowerCase()) &&
    studentGrade(id) === currentAdminGrade
  );
  ids.sort((a, b) => (students[a].name || '').localeCompare(students[b].name || ''));

  noStudentsNote.style.display = ids.length === 0 ? 'block' : 'none';

  ids.forEach((id) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.textContent = students[id].name;

    const gradeTd = document.createElement('td');
    gradeTd.textContent = studentGrade(id);

    const classTd = document.createElement('td');
    const classColor = studentClassColor(id);
    const badge = document.createElement('span');
    badge.className = 'class-badge class-badge-' + classColor;
    badge.textContent = classColor === 'orange' ? 'Orange' : 'Green';
    classTd.appendChild(badge);

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
    tr.appendChild(gradeTd);
    tr.appendChild(classTd);
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

  const gradeTd = document.createElement('td');
  const gradeSelect = document.createElement('select');
  gradeSelect.className = 'edit-input';
  ['3s', '4s'].forEach((g) => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    if (studentGrade(id) === g) opt.selected = true;
    gradeSelect.appendChild(opt);
  });
  gradeTd.appendChild(gradeSelect);

  const classTd = document.createElement('td');
  const classSelect = document.createElement('select');
  classSelect.className = 'edit-input';
  [['green', 'Green'], ['orange', 'Orange']].forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (studentClassColor(id) === value) opt.selected = true;
    classSelect.appendChild(opt);
  });
  classTd.appendChild(classSelect);

  const actionsTd = document.createElement('td');
  actionsTd.className = 'row-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-amber';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    const newName = input.value.trim();
    const newGrade = gradeSelect.value;
    const newClassColor = classSelect.value;
    if (!newName) return;
    db.ref(`students/${id}`).update({ name: newName, grade: newGrade, classColor: newClassColor });
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-outline';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', renderTable);

  actionsTd.appendChild(saveBtn);
  actionsTd.appendChild(cancelBtn);

  tr.appendChild(nameTd);
  tr.appendChild(gradeTd);
  tr.appendChild(classTd);
  tr.appendChild(actionsTd);
}

function removeStudent(id, name) {
  const confirmed = confirm(`Remove ${name} from the pickup list? This can't be undone.`);
  if (!confirmed) return;

  const updates = {};
  updates[`students/${id}`] = null;
  updates[`pickupSession/callLog/${id}`] = null;
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

  const grade = document.querySelector('input[name="addGrade"]:checked').value;
  const classColor = document.querySelector('input[name="addClass"]:checked').value;

  db.ref('students').push({ name, grade, classColor }).then(() => {
    input.value = '';
    addStatus.textContent = `Added ${name} (${grade}, ${classColor} class).`;
    addStatus.className = 'status-msg ok';
    setTimeout(() => { addStatus.textContent = ''; }, 2500);
  }).catch((err) => {
    addStatus.textContent = `Couldn't save: ${err.message}`;
    addStatus.className = 'status-msg err';
  });
});

// ---- Bulk add ----

document.getElementById('bulkAddBtn').addEventListener('click', () => {
  const textarea = document.getElementById('bulkInput');
  const bulkStatus = document.getElementById('bulkStatus');
  const grade = document.querySelector('input[name="bulkGrade"]:checked').value;
  const classColor = document.querySelector('input[name="bulkClass"]:checked').value;
  const names = textarea.value
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (names.length === 0) return;

  const updates = {};
  names.forEach((name) => {
    const newRef = db.ref('students').push();
    updates[`students/${newRef.key}`] = { name, grade, classColor };
  });

  db.ref().update(updates).then(() => {
    textarea.value = '';
    bulkStatus.textContent = `Added ${names.length} student${names.length === 1 ? '' : 's'} to ${grade}, ${classColor} class.`;
    bulkStatus.className = 'status-msg ok';
    setTimeout(() => { bulkStatus.textContent = ''; }, 3000);
  }).catch((err) => {
    bulkStatus.textContent = `Couldn't save: ${err.message}`;
    bulkStatus.className = 'status-msg err';
  });
});

// ---- Grade tabs ----

document.querySelectorAll('#adminGradeTabs .grade-tab').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    currentAdminGrade = tabBtn.dataset.grade;
    document.querySelectorAll('#adminGradeTabs .grade-tab').forEach((b) => b.classList.toggle('active', b === tabBtn));
    renderTable();
  });
});

// ---- Search ----

document.getElementById('adminSearch').addEventListener('input', (e) => {
  adminSearchTerm = e.target.value;
  renderTable();
});

}
