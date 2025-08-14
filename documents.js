// ---------- Local Session Files ----------
const fileInput = document.getElementById("doc-files");
const fileTableBody = document.getElementById("file-doc-tbody");

fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      saveFileToStorage(file.name, file.type, e.target.result);
      renderFiles();
    };
    reader.readAsDataURL(file);
  });
  fileInput.value = ""; // reset input
});

// ---------- LocalStorage Handling ----------
function getStoredFiles() {
  return JSON.parse(localStorage.getItem("storedDocs") || "[]");
}

function saveFileToStorage(name, type, dataUrl) {
  const files = getStoredFiles();
  files.push({ name, type, dataUrl, date: new Date().toLocaleString() });
  localStorage.setItem("storedDocs", JSON.stringify(files));
}

function deleteStoredFile(index) {
  const files = getStoredFiles();
  files.splice(index, 1);
  localStorage.setItem("storedDocs", JSON.stringify(files));
  renderFiles();
}

// ---------- Render Files Table ----------
function renderFiles() {
  const files = getStoredFiles();
  fileTableBody.innerHTML = files.map((file, index) => `
    <tr>
      <td>${file.name}</td>
      <td>${(file.dataUrl.length / 1024).toFixed(1)} KB</td>
      <td>
        <a href="${file.dataUrl}" download="${file.name}" class="btn btn-primary">Download</a>
        <button onclick="deleteStoredFile(${index})" class="btn btn-danger">Delete</button>
      </td>
    </tr>
  `).join("");
}

// ---------- Document Links ----------
const docUrlForm = document.getElementById("doc-url-form");
const urlDocTableBody = document.getElementById("url-doc-tbody");

function getStoredLinks() {
  return JSON.parse(localStorage.getItem("storedLinks") || "[]");
}

function saveLink(title, url) {
  const links = getStoredLinks();
  links.push({ title, url, date: new Date().toLocaleString() });
  localStorage.setItem("storedLinks", JSON.stringify(links));
}

function deleteLink(index) {
  const links = getStoredLinks();
  links.splice(index, 1);
  localStorage.setItem("storedLinks", JSON.stringify(links));
  renderLinks();
}

function renderLinks() {
  const links = getStoredLinks();
  urlDocTableBody.innerHTML = links.map((link, index) => `
    <tr>
      <td>${link.title || "(No Title)"}</td>
      <td><a href="${link.url}" target="_blank">Open</a></td>
      <td>${link.date}</td>
      <td><button onclick="deleteLink(${index})" class="btn btn-danger">Delete</button></td>
    </tr>
  `).join("");
}

docUrlForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  saveLink(title, url);
  docUrlForm.reset();
  renderLinks();
});

// ---------- Init ----------
renderFiles();
renderLinks();


// ====== IndexedDB Setup ======
let db;
const request = indexedDB.open("DocumentsDB", 1);

request.onupgradeneeded = function(e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("files")) {
    db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function(e) {
  db = e.target.result;
  loadFiles();
};

request.onerror = function() {
  console.error("Error opening database");
};

// ====== Handle File Upload ======
document.getElementById("doc-files").addEventListener("change", function(e) {
  const files = e.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      saveFile({ 
        name: file.name, 
        size: file.size, 
        type: file.type, 
        data: evt.target.result 
      });
    };
    reader.readAsDataURL(file); // Store as Base64
  }
  e.target.value = "";
});

// ====== Save File to IndexedDB ======
function saveFile(fileObj) {
  const tx = db.transaction("files", "readwrite");
  tx.objectStore("files").add(fileObj);
  tx.oncomplete = loadFiles;
}

// ====== Load Files from IndexedDB ======
function loadFiles() {
  const tbody = document.getElementById("file-doc-tbody");
  tbody.innerHTML = "";
  
  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");
  
  store.openCursor().onsuccess = function(e) {
    const cursor = e.target.result;
    if (cursor) {
      const file = cursor.value;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${file.name}</td>
        <td>${(file.size / 1024).toFixed(1)} KB</td>
        <td>
          <a href="${file.data}" download="${file.name}" class="btn btn-primary">Download</a>
          <button onclick="deleteFile(${cursor.key})" class="btn btn-danger">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
      cursor.continue();
    }
  };
}

// ====== Delete File ======
function deleteFile(id) {
  const tx = db.transaction("files", "readwrite");
  tx.objectStore("files").delete(id);
  tx.oncomplete = loadFiles;
}

