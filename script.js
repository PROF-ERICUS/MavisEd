// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const menuList = document.querySelector('.nav ul');
if (menuBtn && menuList) {
  menuBtn.addEventListener('click', () => menuList.classList.toggle('show'));
}

// Set active nav link by pathname (works for file-based nav)
(function markActive() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();

// CONTACT: simple client-side handler
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
    ts: new Date().toISOString()
  };
  if (!payload.name || !payload.email || !payload.message) {
    alert('Please complete required fields.');
    return;
  }
  // store to localStorage (demo only)
  const key = 'contact_submissions';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push(payload);
  localStorage.setItem(key, JSON.stringify(list));
  form.reset();
  alert('Thanks! Your message was recorded locally. (Connect to email/server to actually send.)');
}

// BOOKING: save locally
function handleBookingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    mode: form.mode.value,
    date: form.date.value,
    time: form.time.value,
    topic: form.topic.value.trim(),
    notes: form.notes.value.trim(),
    ts: new Date().toISOString()
  };
  if (!payload.name || !payload.email || !payload.date || !payload.time) {
    alert('Please complete required fields.');
    return;
  }
  const key = 'booking_requests';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push(payload);
  localStorage.setItem(key, JSON.stringify(list));
  form.reset();
  alert('Booking saved locally. You can later connect this to email/DB.');
}

// DOCUMENTS: URL entries (persistent) + file session list (not persistent beyond refresh)
(function documentsInit() {
  const urlForm = document.getElementById('doc-url-form');
  const fileInput = document.getElementById('doc-files');
  const urlTableBody = document.getElementById('url-doc-tbody');
  const fileTableBody = document.getElementById('file-doc-tbody');

  if (urlForm && urlTableBody) {
    const KEY = 'doc_urls';
    function load() {
      urlTableBody.innerHTML = '';
      const docs = JSON.parse(localStorage.getItem(KEY) || '[]');
      docs.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${d.title || '(untitled)'}</td>
          <td><a href="${d.url}" target="_blank" rel="noopener">Open</a></td>
          <td>${new Date(d.ts).toLocaleString()}</td>
          <td><button data-i="${i}" class="btn btn-ghost">Remove</button></td>
        `;
        urlTableBody.appendChild(tr);
      });
    }
    load();

    urlForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = urlForm.title.value.trim();
      const url = urlForm.url.value.trim();
      if (!url) return alert('Enter a document URL.');
      const docs = JSON.parse(localStorage.getItem(KEY) || '[]');
      docs.push({ title, url, ts: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(docs));
      urlForm.reset(); load();
    });

    urlTableBody.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        const i = +e.target.dataset.i;
        const docs = JSON.parse(localStorage.getItem(KEY) || '[]');
        docs.splice(i, 1);
        localStorage.setItem(KEY, JSON.stringify(docs));
        load();
      }
    });
  }

  if (fileInput && fileTableBody) {
    fileInput.addEventListener('change', () => {
      fileTableBody.innerHTML = '';
      [...fileInput.files].forEach(file => {
        const url = URL.createObjectURL(file); // session-only
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${file.name}</td>
          <td>${(file.size/1024).toFixed(1)} KB</td>
          <td><a href="${url}" download="${file.name}">Download</a></td>
        `;
        fileTableBody.appendChild(tr);
      });
    });
  }
})();
