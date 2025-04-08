// const apiUrl = "http://localhost:5000/api/notes"; //for local
const apiUrl = '/api/notes';


let isEditing = false;
let currentEditId = null;

async function fetchNotes() {
  const res = await fetch(apiUrl);
  const notes = await res.json();

  const list = document.getElementById("notes-list");
  list.innerHTML = "";

  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `
    <div style="margin: inherit;"><strong>${note.title}</strong>
    <p>${note.content}</p></div>
    
    <div class="button-group">
        <button class="edit-btn" onclick="editNote('${note._id}', '${
      note.title
    }', \`${note.content.replace(/`/g, "\\`")}\`)">Edit</button>
        <button class="delete-btn" onclick="deleteNote('${
          note._id
        }')">Delete</button>
    </div>
`;

    list.appendChild(div);
  });
}

async function createNote() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) return;

  if (isEditing && currentEditId) {
    // Обновление заметки
    await fetch(`${apiUrl}/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    isEditing = false;
    currentEditId = null;
    document.querySelector(".note-form button").innerText = "Add Note";
  } else {
    // Создание новой заметки
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  }

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  fetchNotes();
}

async function deleteNote(id) {
  await fetch(`${apiUrl}/${id}`, {
    method: "DELETE",
  });
  fetchNotes();
}

function editNote(id, title, content) {
  document.getElementById("title").value = title;
  document.getElementById("content").value = content;
  document.querySelector(".note-form button").innerText = "Save Changes";
  isEditing = true;
  currentEditId = id;
}

// Init
fetchNotes();
