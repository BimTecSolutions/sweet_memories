// ============================================================
//  config.js — YOUR CLOUDINARY CREDENTIALS GO HERE
//  
//  SETUP STEPS:
//  1. Create a free account at https://cloudinary.com
//  2. Copy your Cloud Name from the dashboard
//  3. Go to Settings → Upload → Add an Upload Preset
//     • Set signing mode to "Unsigned"
//     • Name it anything (e.g. "memories_upload")
//     • Set folder to "memories" (optional but recommended)
//  4. Replace the values below with your own
//  5. Save this file, commit, and push to GitHub
// ============================================================

const CLOUDINARY_CONFIG = {
  cloudName:    'dry5njpao',     // e.g. 'my-sweet-memories'
  uploadPreset: 'lovely_images',  // e.g. 'memories_upload'
};

// ============================================================
//  Optional: Customize your site here
// ============================================================

const SITE_CONFIG = {
  // Name shown in the header (change to your names!)
  coupleName: 'Our Sweet Memories',

  // Slideshow auto-play interval (milliseconds)
  slideshowInterval: 4000,

  // Maximum file size in MB
  maxFileSizeMB: 10,
};
