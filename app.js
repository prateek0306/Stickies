const API = "http://localhost:3000/notes";

const COLORS = [
  { bg: '#fff9b0' },
  { bg: '#ffc8d4' },
  { bg: '#b8e0ff' },
  { bg: '#c1f0c1' },
  { bg: '#ffdab0' },
  { bg: '#e0ccff' },
];

let notes = [];
let zCounter = 100;

/* LOAD NOTES */
async function loadNotes() {
  const res = await fetch(API);
  notes = await res.json();

  notes.forEach(n => renderNote(n));
  updateEmpty();
  updateCount();
}

loadNotes();

/* ADD NOTE */
function addNote(data = null) {
  const board = document.getElementById('board');
const bw = board.clientWidth;
const bh = board.clientHeight;

// note size approx (match your CSS)
const NOTE_WIDTH = 220;
const NOTE_HEIGHT = 180;

const note = data || {
  text: '',
  color: COLORS[Math.floor(Math.random() * COLORS.length)].bg,

  x: Math.floor(Math.random() * (bw - NOTE_WIDTH)),
  y: Math.floor(Math.random() * (bh - NOTE_HEIGHT)),

  z: ++zCounter,
  pinned: false,
  date: "Today"
};

  if (!data) {
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
    })
    .then(res => res.json())
    .then(newNote => {
      notes.push(newNote);
      renderNote(newNote);
      updateEmpty();
      updateCount();
    });
    return;
  }

  renderNote(note);
}

/* RENDER */
function renderNote(note) {
  const board = document.getElementById('board');

  const existing = document.getElementById(note._id);
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'note note-enter';
  el.id = note._id;

  el.style.cssText = `
    left:${note.x}px;
    top:${note.y}px;
    z-index:${note.z};
    background:${note.color};
  `;

  if (note.pinned) el.classList.add('pinned');

  const tilt = ((Math.random() * 6) - 3);
  el.style.transform = `rotate(${tilt}deg)`;
  el.dataset.tilt = tilt;

  el.innerHTML = `
    <div class="pin-indicator"></div>

    <div class="color-picker">
      ${COLORS.map(c =>
        `<div class="color-dot" style="background:${c.bg}"
          onclick="changeColor('${note._id}','${c.bg}')"></div>`
      ).join('')}
    </div>

    <div class="note-toolbar">
      <button class="note-btn ${note.pinned ? 'active' : ''}"
        onclick="togglePin('${note._id}')">⭐</button>

      <button class="note-btn"
        onclick="deleteNote('${note._id}')">✖</button>
    </div>

    <textarea class="note-text"
      oninput="updateText('${note._id}', this.value)"
    >${note.text}</textarea>

    <div class="note-date">${note.date || "Today"}</div>
  `;

  makeDraggable(el, note);
  board.appendChild(el);

  setTimeout(() => el.classList.remove('note-enter'), 300);
}

/* UPDATE TEXT */
function updateText(id, val) {
  const note = notes.find(n => n._id === id);
  if (!note) return;

  note.text = val;

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note)
  });
}

/* DELETE */
function deleteNote(id) {
  fetch(`${API}/${id}`, { method: "DELETE" });

  document.getElementById(id)?.remove();
  notes = notes.filter(n => n._id !== id);
  updateCount();
}

/* DRAG */
function makeDraggable(el, note) {
  let startX, startY;

  el.onmousedown = function(e) {
    startX = e.clientX - note.x;
    startY = e.clientY - note.y;

    document.onmousemove = function(e) {
      note.x = e.clientX - startX;
      note.y = e.clientY - startY;

      el.style.left = note.x + "px";
      el.style.top = note.y + "px";
    };

    document.onmouseup = function() {
      document.onmousemove = null;

      fetch(`${API}/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
    };
  };
}

/* COLOR */
function changeColor(id, color) {
  const note = notes.find(n => n._id === id);
  if (!note) return;

  note.color = color;

  // update UI instantly
  const el = document.getElementById(id);
  if (el) el.style.background = color;

  // sync with backend
  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note)
  });
}

/* PIN */
function togglePin(id) {
  const note = notes.find(n => n._id === id);
  if (!note) return;

  note.pinned = !note.pinned;

  if (note.pinned) {
    note.z = ++zCounter;
  }

  renderNote(note);

  // sync with backend
  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note)
  });
}

/* DELETE ALL */
async function clearAll() {
  if (notes.length === 0) return;

  if (!confirm(`Delete all ${notes.length} notes?`)) return;

  try {
    // delete all notes from backend
    await Promise.all(
      notes.map(n =>
        fetch(`${API}/${n._id}`, {
          method: "DELETE"
        })
      )
    );

    // 🧹 clear UI + state
    notes = [];
    document.querySelectorAll('.note').forEach(el => el.remove());

    updateEmpty();
    updateCount();

  } catch (err) {
    console.error("Clear all failed:", err);
  }
}

/* UI HELPERS */
function updateEmpty() {
  document.getElementById('empty-state').style.opacity =
    notes.length === 0 ? '1' : '0';
}

function updateCount() {
  const el = document.getElementById('note-count');
  el.textContent = notes.length + " notes";
}