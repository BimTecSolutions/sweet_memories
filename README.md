# 💕 Our Sweet Memories — Deployment Guide

A beautiful, mobile-friendly photo sharing website for couples.  
Free to host. Easy to use. Made with love.

---

## 📁 Files in This Project

```
index.html   ← Main webpage
style.css    ← All styling
app.js       ← All functionality
config.js    ← YOUR CREDENTIALS GO HERE ← ⚠️ Edit this!
README.md    ← This guide
```

---

## 🚀 Step-by-Step Deployment

### Step 1 — Set Up Cloudinary (Image Storage)

Cloudinary hosts your images for FREE (25GB free storage).

1. Go to **https://cloudinary.com** and create a free account
2. After logging in, find your **Cloud Name** on the dashboard
3. Go to **Settings → Upload** (top right gear icon)
4. Scroll down to **Upload presets** → click **Add upload preset**
5. Set **Signing mode** to `Unsigned`
6. Give it a name like `memories_upload`
7. (Optional) Set **Folder** to `memories`
8. Click **Save**

### Step 2 — Configure Your Site

Open `config.js` and replace the placeholder values:

```js
const CLOUDINARY_CONFIG = {
  cloudName:    'my-sweet-memories',   // ← Your Cloudinary Cloud Name
  uploadPreset: 'memories_upload',     // ← Your Upload Preset name
};
```

Also customize your couple name:
```js
const SITE_CONFIG = {
  coupleName: 'Alex & Jordan 💕',     // ← Your names!
  slideshowInterval: 4000,            // Milliseconds between slides
  maxFileSizeMB: 10,                  // Max upload size
};
```

### Step 3 — Deploy to GitHub Pages

1. Create a **GitHub account** at https://github.com (if you don't have one)
2. Click **New Repository** → name it `sweet-memories` (or anything)
3. Set visibility to **Public**
4. Click **Create repository**
5. Upload all 4 files (`index.html`, `style.css`, `app.js`, `config.js`)
   - Click **Add file → Upload files** and drag all 4 files in
   - Click **Commit changes**
6. Go to **Settings → Pages**
7. Under **Source**, select `main` branch → click **Save**
8. Your site will be live at:  
   `https://YOUR-USERNAME.github.io/sweet-memories/`

---

## 🎯 How to Use the Site

### Uploading Photos
- Tap the **💌 Upload** tab
- Tap the camera area or drag photos in
- Add an optional caption like "Our first trip 🌸"
- Tap **Upload to Our Gallery 💕**

### Viewing Gallery
- Tap the **📸 Gallery** tab to see all photos in a grid
- Tap any photo to view it full screen
- Use ⬇ button to download any photo

### Slideshow
- Tap the **🎞️ Slideshow** tab
- Press ▶ to auto-play
- Choose from 5 transitions: Fade, Slide, Zoom, Flip, Blur

---

## 💰 Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| GitHub Pages | Unlimited (public repos) | — |
| Cloudinary | 25 GB storage, 25k transforms/mo | From $89/mo if exceeded |
| Custom domain | ~$10-15/year (optional) | — |

**Total cost: $0 forever** (unless you exceed 25GB of photos)

---

## 🌐 Custom Domain (Optional)

If you want `oursweetmemories.com` instead of `github.io`:

1. Buy a domain from **Namecheap** (~$10/yr) or **Cloudflare** (~$9/yr)
2. In GitHub Pages settings, enter your custom domain
3. Add a CNAME DNS record pointing to `YOUR-USERNAME.github.io`

---

## ❓ Troubleshooting

**Photos not uploading?**
- Make sure `config.js` has your real Cloud Name and Upload Preset
- Make sure the Upload Preset is set to **Unsigned**

**Site not loading?**
- Wait 2-5 minutes after enabling GitHub Pages
- Make sure all 4 files are in the same folder/repo

**Photos disappear after refresh?**
- Photos are stored in your browser's localStorage AND on Cloudinary
- If you clear browser data, re-sync: photos are safe on Cloudinary
- For full persistence across devices, photos uploaded to Cloudinary remain accessible via their URL

---

Made with ♥ — for every couple who wants to share their story
