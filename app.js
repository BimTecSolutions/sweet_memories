// ============================================================
//  app.js — Our Sweet Memories
//  Images are loaded from Cloudinary (shared between all users)
// ============================================================

// ── State ────────────────────────────────────────────────────
let images       = [];   // { url, caption, date, publicId, width, height }
let currentSlide = 0;
let slideTimer   = null;
let isPlaying    = false;
let transition   = 'fade';
let lbIndex      = 0;
let pendingFiles = [];

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  generateHearts();
  setupDragDrop();
  checkConfig();
  fetchAllImages();  // ← Load shared images from Cloudinary
});

// ── Navigation ───────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  const map = { gallery: 0, slideshow: 1, upload: 2 };
  document.querySelectorAll('.nav-tab')[map[name]]?.classList.add('active');
  if (name === 'slideshow') initSlideshow();
}

// ── Fetch ALL images from Cloudinary (shared gallery) ────────
async function fetchAllImages() {
  if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME') {
    renderGallery();
    return;
  }

  showLoadingState(true);

  try {
    // Use Cloudinary's Search API to get all images in the folder
    // This works with just the API Key (no secret needed for this endpoint)
    const folder = SITE_CONFIG.folder;
    const url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${folder}.json`;

    const res = await fetch(url);

    if (!res.ok) {
      // Fallback: try the search API with a signed request is not possible client-side,
      // so we use the resource list approach via a named tag
      await fetchByTag();
      return;
    }

    const data = await res.json();
    if (data.resources && data.resources.length > 0) {
      images = data.resources.map(r => {
        const context = r.context?.custom || {};
        return {
          url:      `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${r.public_id}`,
          caption:  context.caption || '',
          date:     context.date    || formatDateFromPublicId(r.public_id),
          publicId: r.public_id,
        };
      }).reverse(); // Newest first
    } else {
      images = [];
    }
  } catch (err) {
    console.warn('List fetch failed, trying tag method:', err);
    await fetchByTag();
    return;
  }

  showLoadingState(false);
  renderGallery();
}

// Fallback: fetch by tag "memory" (we tag every upload)
async function fetchByTag() {
  try {
    const url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/memory.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Tag list failed');
    const data = await res.json();

    if (data.resources && data.resources.length > 0) {
      images = data.resources.map(r => {
        const context = r.context?.custom || {};
        return {
          url:      `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${r.public_id}`,
          caption:  context.caption || '',
          date:     context.date    || '',
          publicId: r.public_id,
        };
      }).reverse();
    } else {
      images = [];
    }
  } catch (err) {
    console.error('Could not load images from Cloudinary:', err);
    images = [];
  }
  showLoadingState(false);
  renderGallery();
}

function formatDateFromPublicId(publicId) {
  // Try to extract a readable date if possible, otherwise return empty
  return '';
}

function showLoadingState(loading) {
  const grid = document.getElementById('galleryGrid');
  let loader = document.getElementById('galleryLoader');
  if (loading) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'galleryLoader';
      loader.className = 'gallery-empty';
      loader.innerHTML = `<div class="loading-hearts">
        <span>♥</span><span>♥</span><span>♥</span>
      </div><p>Loading your memories…</p>`;
      grid.appendChild(loader);
    }
    loader.style.display = 'block';
  } else {
    if (loader) loader.style.display = 'none';
  }
}

// ── Floating Hearts ──────────────────────────────────────────
function generateHearts() {
  const container = document.getElementById('heartsBg');
  const symbols = ['♥', '♡', '❤', '✿', '✦'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('span');
    el.className = 'heart-float';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left            = Math.random() * 100 + 'vw';
    el.style.fontSize        = (Math.random() * 14 + 10) + 'px';
    el.style.color           = `hsl(${Math.random() * 30 + 340}, 80%, ${Math.random() * 20 + 65}%)`;
    el.style.animationDuration = (Math.random() * 14 + 10) + 's';
    el.style.animationDelay    = (Math.random() * 12) + 's';
    container.appendChild(el);
  }
}

// ── Gallery ──────────────────────────────────────────────────
function renderGallery() {
  const grid  = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');

  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

  if (images.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  images.forEach((img, idx) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    // Use Cloudinary auto-format & quality for faster loading on mobile
    const thumbUrl = img.url.replace('/upload/', '/upload/f_auto,q_auto,w_400/');
    item.innerHTML = `
      <img src="${thumbUrl}" alt="${img.caption || 'Memory'}" loading="lazy" />
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

// ── Refresh Button (pull latest from Cloudinary) ─────────────
function refreshGallery() {
  images = [];
  renderGallery();
  fetchAllImages();
  showToast('🔄 Refreshing gallery…');
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
  const fullUrl = img.url.replace('/upload/', '/upload/f_auto,q_auto/');
  document.getElementById('lbImg').src = fullUrl;
  document.getElementById('lbCaption').textContent = img.caption || '';
  document.getElementById('lbDate').textContent    = img.date    || '';
  const dl = document.getElementById('lbDownload');
  dl.href     = img.url;
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
  if (e) e.stopPropagation();
  lbIndex = (lbIndex + dir + images.length) % images.length;
  updateLightbox();
}
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox({ currentTarget: lb, target: lb });
  if (e.key === 'ArrowLeft')  lightboxNav(-1, null);
  if (e.key === 'ArrowRight') lightboxNav(1, null);
});

// ── Slideshow ─────────────────────────────────────────────────
function initSlideshow() {
  const empty    = document.getElementById('slideshowEmpty');
  const frame    = document.getElementById('slideFrame');
  const controls = document.getElementById('slideshowControls');
  const picker   = document.getElementById('transitionPicker');
  const counter  = document.getElementById('slideCounter');

  if (images.length === 0) {
    [empty].forEach(el => el.style.display = 'block');
    [frame, controls, picker, counter].forEach(el => el.style.display = 'none');
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
  const img   = images[currentSlide];
  const frame = document.getElementById('slideFrame');
  frame.classList.remove('trans-fade','trans-slide','trans-zoom','trans-flip','trans-blur');
  void frame.offsetWidth;
  frame.classList.add('trans-' + transition);

  const slideUrl = img.url.replace('/upload/', '/upload/f_auto,q_auto,w_900/');
  document.getElementById('slideImg').src = slideUrl;
  document.getElementById('slideCaption').textContent = img.caption || '';
  document.getElementById('slideDate').textContent    = img.date    || '';

  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
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

function nextSlide() { currentSlide = (currentSlide + 1) % images.length; renderSlide(); }
function prevSlide() { currentSlide = (currentSlide - 1 + images.length) % images.length; renderSlide(); }

function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById('playBtn').textContent = isPlaying ? '⏸' : '▶';
  if (isPlaying) slideTimer = setInterval(nextSlide, SITE_CONFIG.slideshowInterval);
  else clearInterval(slideTimer);
}

function setTransition(type, btn) {
  transition = type;
  document.querySelectorAll('.trans-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── File Select & Preview ─────────────────────────────────────
function handleFileSelect(e) {
  addPendingFiles(Array.from(e.target.files));
  e.target.value = '';
}
function addPendingFiles(files) {
  const maxBytes = SITE_CONFIG.maxFileSizeMB * 1024 * 1024;
  files.forEach(file => {
    if (!file.type.startsWith('image/')) { showToast('⚠️ Only image files allowed'); return; }
    if (file.size > maxBytes) { showToast(`⚠️ ${file.name} too large (max ${SITE_CONFIG.maxFileSizeMB}MB)`); return; }
    pendingFiles.push(file);
    addPreview(file, pendingFiles.length - 1);
  });
  document.getElementById('uploadBtn').disabled = pendingFiles.length === 0;
}
function addPreview(file, idx) {
  const reader = new FileReader();
  reader.onload = e => {
    const thumb = document.createElement('div');
    thumb.className = 'preview-thumb';
    thumb.innerHTML = `
      <img src="${e.target.result}" alt="preview" />
      <button class="preview-remove" onclick="removePreview(this,${idx})">✕</button>`;
    document.getElementById('previewRow').appendChild(thumb);
  };
  reader.readAsDataURL(file);
}
function removePreview(btn, idx) {
  pendingFiles[idx] = null;
  btn.closest('.preview-thumb').remove();
  document.getElementById('uploadBtn').disabled = pendingFiles.filter(Boolean).length === 0;
}

// ── Drag & Drop ──────────────────────────────────────────────
function setupDragDrop() {
  const zone = document.getElementById('dropZone');
  if (!zone) return;
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop',      e => { e.preventDefault(); zone.classList.remove('drag-over'); addPendingFiles(Array.from(e.dataTransfer.files)); });
}

// ── Upload to Cloudinary ──────────────────────────────────────
async function uploadImages() {
  const files = pendingFiles.filter(Boolean);
  if (!files.length) return;

  if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME') {
    showSetupGuide();
    showToast('⚙️ Please configure Cloudinary credentials first!');
    return;
  }

  const caption  = document.getElementById('captionInput').value.trim();
  const dateStr  = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const progress = document.getElementById('uploadProgress');
  const fill     = document.getElementById('progressFill');
  const text     = document.getElementById('progressText');
  const btn      = document.getElementById('uploadBtn');

  btn.disabled = true;
  progress.style.display = 'block';

  let uploaded = 0;
  for (let i = 0; i < files.length; i++) {
    text.textContent = `Uploading ${i+1} of ${files.length}… 💕`;
    fill.style.width = ((i / files.length) * 100) + '%';

    try {
      const formData = new FormData();
      formData.append('file',           files[i]);
      formData.append('upload_preset',  CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder',         SITE_CONFIG.folder);
      formData.append('tags',           'memory');   // ← tag for easy listing
      // Store caption & date in context metadata
      if (caption) formData.append('context', `caption=${caption}|date=${dateStr}`);
      else         formData.append('context', `date=${dateStr}`);

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body:   formData,
      });
      const data = await res.json();

      if (data.secure_url) {
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
  text.textContent = `Done! ${uploaded} photo${uploaded !== 1 ? 's' : ''} saved 🎉`;

  setTimeout(async () => {
    progress.style.display = 'none';
    fill.style.width       = '0%';
    btn.disabled           = false;
    pendingFiles           = [];
    document.getElementById('previewRow').innerHTML = '';
    document.getElementById('captionInput').value   = '';
    showToast('💕 Memories added to our shared gallery!');
    // Reload gallery from Cloudinary so both users see the new images
    await fetchAllImages();
    showSection('gallery');
  }, 1600);
}

// ── Config Check ─────────────────────────────────────────────
function checkConfig() {
  if (CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME') {
    const notice = document.getElementById('configNotice');
    if (notice) notice.style.display = 'none';
  }
}
function showSetupGuide() {
  document.getElementById('setupModal').style.display = 'flex';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
