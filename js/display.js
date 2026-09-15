const db = firebase.database();

const board = document.getElementById('board');
const idleView = document.getElementById('idleView');
const callView = document.getElementById('callView');
const callNames = document.getElementById('callNames');
const callInstruction = document.getElementById('callInstruction');
const lastUpdated = document.getElementById('lastUpdated');

let lastTimestamp = null;

requireStaffLogin(() => {
  db.ref('pickupSession/currentCall').on('value', (snap) => {
    const call = snap.val();
    if (!call || !call.names || call.names.length === 0) {
      showIdle();
      return;
    }
    // Avoid re-flashing on a plain page reload for the same call.
    const isNew = call.timestamp !== lastTimestamp;
    lastTimestamp = call.timestamp;
    showCall(call, isNew);
  });
});

function showIdle() {
  board.classList.remove('board-call');
  board.classList.add('board-idle');
  idleView.style.display = 'block';
  callView.style.display = 'none';
  lastUpdated.textContent = '';
}

function showCall(call, isNew) {
  board.classList.remove('board-idle');
  board.classList.add('board-call');
  idleView.style.display = 'none';
  callView.style.display = 'block';

  callNames.textContent = call.names.join(' & ');
  callInstruction.textContent = call.names.length > 1
    ? 'Please bring them to the pickup door.'
    : 'Please bring to the pickup door.';

  if (call.timestamp) {
    const time = new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lastUpdated.textContent = 'Called at ' + time;
  }

  if (isNew) {
    board.classList.remove('flash');
    // Force reflow so the animation can restart on repeated calls.
    void board.offsetWidth;
    board.classList.add('flash');
  }
}
