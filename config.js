// ============================================================
//  config.js — YOUR CREDENTIALS
//
//  You need TWO free services:
//  1. Cloudinary  → stores the actual photos
//  2. JSONBin.io  → stores the shared list of photo URLs
//                   (so both users see the same gallery)
// ============================================================

// ── Cloudinary (image storage) ───────────────────────────────
// Get these from: cloudinary.com → Dashboard
const CLOUDINARY_CONFIG = {
  cloudName:    'dry5njpao',     // e.g. 'dxyz1234abc'
  uploadPreset: 'lovely_images',  // e.g. 'memories_upload'
};

// ── JSONBin (shared database) ────────────────────────────────
// Get these from: jsonbin.io → follow setup steps below
const JSONBIN_CONFIG = {
  binId:     '69fb136d856a682189b1c6f2',      // e.g. '6643f1e4acd3cb34a83e5f2a'
  masterKey: '$2a$10$FAMddAE0jCbifixey8xQGOc3jJJCCVGVzg/mi9Tf4wlAcpBfDfOUC',  // e.g. '$2a$10$abc123...'
};

// ── Site settings ─────────────────────────────────────────────
const SITE_CONFIG = {
  coupleName:        'Our Sweet Memories',
  slideshowInterval: 4000,
  maxFileSizeMB:     10,
  folder:            'memories',
};
