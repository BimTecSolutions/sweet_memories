// ============================================================
//  app.js — Our Sweet Memories
//  All app logic: gallery, slideshow, upload, lightbox
// ============================================================

// ── State ────────────────────────────────────────────────────
let images        = [];      // { url, caption, date, publicId }
let currentSlide  = 0;
let slideTimer    = null;
let isPlaying     = false;
let transition    = 'fade';
let lbIndex       = 0;
let pendingFiles  = [];      // Files queued for upload

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  generateHearts();
  loadImages();
  setupDragDrop();
  checkConfig();
});

// ── Navigation ───────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  document.getElementById('section-' + name).classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  const map = { gallery: 0, slideshow: 1, upload: 2 };
  if (tabs[map[name]]) tabs[map[name]].classList.add('active');

  if (name === 'slideshow') initSlideshow();
}

// ── Floating Hearts ──────────────────────────────────────────
function generateHearts() {
  const container = document.getElementById('heartsBg');
  const symbols = ['♥', '♡', '❤', '✿', '✦'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.className = 'heart-float';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left     = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 14 + 10) + 'px';
    el.style.color    = `hsl(${Math.random() * 30 + 340}, 80%, ${Math.random() * 20 + 65}%)`;
    el.style.animationDuration  = (Math.random() * 14 + 10) + 's';
    el.style.animationDelay     = (Math.random() * 12) + 's';
    container.appendChild(el);
  }
}

// ── Local Storage ────────────────────────────────────────────
function saveImages() {
  try { localStorage.setItem('sweetMemories_images', JSON.stringify(images)); } catch(e) {}
}
function loadImages() {
  try {
    const stored = localStorage.getItem('sweetMemories_images');
    if (stored) images = JSON.parse(stored);
  } catch(e) { images = []; }
  renderGallery();
}

// ── Gallery ──────────────────────────────────────────────────
function renderGallery() {
  const grid  = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');

  // Clear old items (keep empty placeholder)
  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

  if (images.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${img.url}" alt="${img.caption || 'Memory'}" loading="lazy" />
      <div class="gallery-item-overlay">
        ${img.caption ? `<p class="gallery-item-caption">${escHtml(img.caption)}</p>` : ''}
      </div>
      <a class="gallery-download-btn" href="${img.url}" download="memory-${idx+1}.jpg" 
         onclick="event.stopPropagation()" title="Download">⬇</a>
    `;
    item.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(item);
  });
}

// ── Lightbox ─────────────────────────────────────────────────
function openLightbox(idx) {
  lbIndex = idx;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function updateLightbox() {
  const img = images[lbIndex];
  document.getElementById('lbImg').src     = img.url;
  document.getElementById('lbCaption').textContent = img.caption || '';
  document.getElementById('lbDate').textContent    = img.date    || '';
  const dl = document.getElementById('lbDownload');
  dl.href = img.url;
  dl.download = `memory-${lbIndex+1}.jpg`;
}
function closeLightbox(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('lightbox')) return;
  if (!e || e.currentTarget === document.getElementById('lightbox') || e.target.classList.contains('lb-close')) {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
}
function lightboxNav(dir, e) {
  if(e) e.stopPropagation();
  lbIndex = (lbIndex + dir + images.length) % images.length;
  updateLightbox();
}
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox({currentTarget: lb, target: lb});
  if (e.key === 'ArrowLeft')   lightboxNav(-1, null);
  if (e.key === 'ArrowRight')  lightboxNav(1, null);
});

// ── Slideshow ─────────────────────────────────────────────────
function initSlideshow() {
  const empty    = document.getElementById('slideshowEmpty');
  const frame    = document.getElementById('slideFrame');
  const controls = document.getElementById('slideshowControls');
  const picker   = document.getElementById('transitionPicker');
  const counter  = document.getElementById('slideCounter');

  if (images.length === 0) {
    empty.style.display   = 'block';
    frame.style.display   = 'none';
    controls.style.display = 'none';
    picker.style.display   = 'none';
    counter.style.display  = 'none';
    return;
  }

  empty.style.display    = 'none';
  frame.style.display    = 'block';
  controls.style.display = 'flex';
  picker.style.display   = 'block';
  counter.style.display  = 'block';

  currentSlide = 0;
  renderSlide();
  renderDots();
}

function renderSlide() {
  const img  = images[currentSlide];
  const frame = document.getElementById('slideFrame');

  // Trigger transition
  frame.classList.remove('trans-fade','trans-slide','trans-zoom','trans-flip','trans-blur');
  void frame.offsetWidth; // reflow
  frame.classList.add('trans-' + transition);

  document.getElementById('slideImg').src = img.url;
  document.getElementById('slideCaption').textContent = img.caption || '';
  document.getElementById('slideDate').textContent    = img.date    || '';

  // Dots
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });

  // Counter
  document.getElementById('counterText').textContent = `${currentSlide + 1} / ${images.length}`;
}

function renderDots() {
  const container = document.getElementById('slideDots');
  container.innerHTML = '';
  images.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === currentSlide ? ' active' : '');
    dot.addEventListener('click', () => { currentSlide = i; renderSlide(); });
    container.appendChild(dot);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % images.length;
  renderSlide();
}
function prevSlide() {
  currentSlide = (currentSlide - 1 + images.length) % images.length;
  renderSlide();
}

function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
  if (isPlaying) {
    slideTimer = setInterval(nextSlide, SITE_CONFIG.slideshowInterval);
  } else {
    clearInterval(slideTimer);
  }
}

function setTransition(type, btn) {
  transition = type;
  document.querySelectorAll('.trans-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── File Select & Preview ─────────────────────────────────────
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addPendingFiles(files);
  e.target.value = ''; // Reset so same file can be re-selected
}

function addPendingFiles(files) {
  const maxMB = SITE_CONFIG.maxFileSizeMB * 1024 * 1024;
  files.forEach(file => {
    if (!file.type.startsWith('image/')) { showToast('⚠️ Only image files allowed'); return; }
    if (file.size > maxMB) { showToast(`⚠️ ${file.name} is too large (max ${SITE_CONFIG.maxFileSizeMB}MB)`); return; }
    pendingFiles.push(file);
    addPreview(file, pendingFiles.length - 1);
  });
  document.getElementById('uploadBtn').disabled = pendingFiles.length === 0;
}

function addPreview(file, idx) {
  const row    = document.getElementById('previewRow');
  const reader = new FileReader();
  reader.onload = e => {
    const thumb = document.createElement('div');
    thumb.className    = 'preview-thumb';
    thumb.dataset.idx  = idx;
    thumb.innerHTML    = `
      <img src="${e.target.result}" alt="preview" />
      <button class="preview-remove" onclick="removePreview(this, ${idx})">✕</button>
    `;
    row.appendChild(thumb);
  };
  reader.readAsDataURL(file);
}

function removePreview(btn, idx) {
  pendingFiles[idx] = null;
  btn.closest('.preview-thumb').remove();
  const active = pendingFiles.filter(Boolean);
  document.getElementById('uploadBtn').disabled = active.length === 0;
}

// ── Drag & Drop ──────────────────────────────────────────────
function setupDragDrop() {
  const zone = document.getElementById('dropZone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    addPendingFiles(Array.from(e.dataTransfer.files));
  });
}

// ── Upload to Cloudinary ──────────────────────────────────────
async function uploadImages() {
  const files = pendingFiles.filter(Boolean);
  if (files.length === 0) return;

  // Config check
  if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME') {
    showSetupGuide();
    showToast('⚙️ Please set up your Cloudinary credentials first!');
    return;
  }

  const caption = document.getElementById('captionInput').value.trim();
  const progress = document.getElementById('uploadProgress');
  const fill     = document.getElementById('progressFill');
  const text     = document.getElementById('progressText');
  const btn      = document.getElementById('uploadBtn');

  btn.disabled = true;
  progress.style.display = 'block';

  let uploaded = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    text.textContent = `Uploading ${i+1} of ${files.length}… 💕`;
    fill.style.width = ((i / files.length) * 100) + '%';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', 'memories');

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.secure_url) {
        images.unshift({
          url:       data.secure_url,
          caption:   caption,
          date:      new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
          publicId:  data.public_id
        });
        uploaded++;
      } else {
        console.error('Upload error:', data);
        showToast('⚠️ Upload failed for one file');
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ Network error during upload');
    }
  }

  fill.style.width = '100%';
  text.textContent = `Done! ${uploaded} photo${uploaded !== 1 ? 's' : ''} uploaded 🎉`;

  saveImages();
  renderGallery();

  setTimeout(() => {
    progress.style.display = 'none';
    fill.style.width       = '0%';
    btn.disabled           = false;
    pendingFiles           = [];
    document.getElementById('previewRow').innerHTML   = '';
    document.getElementById('captionInput').value     = '';
    showToast('💕 Memories saved to your gallery!');
    showSection('gallery');
  }, 1800);
}

// ── Config Check ─────────────────────────────────────────────
function checkConfig() {
  const notice = document.getElementById('configNotice');
  if (CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME') {
    if (notice) notice.style.display = 'none';
  }
}

function showSetupGuide() {
  document.getElementById('setupModal').style.display = 'flex';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
