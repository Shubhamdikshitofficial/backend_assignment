# 🎬 Web-Based Video Editing Backend

This is a Node.js-based backend for a simple web video editing platform. It allows users to:
- Upload videos
- Trim specific segments
- Add subtitles with custom timings
- Render and download the final edited video

> ⚙️ Built with Node.js, Express, Prisma, Multer, and FFmpeg

---

## 🚀 Features

- ✅ Upload video (MP4 and similar formats)
- ✂️ Trim a selected portion of the uploaded video
- 📝 Add subtitles with precise control over timing
- 🎥 Render final video with effects
- ⬇️ Download final output

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/shubhamdikshitofficial/video-editing-backend.git
cd video-editing-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install PostgreSQL and Set Up Prisma

Ensure you have PostgreSQL installed. Create a database and update the `.env` file:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/yourdbname"
```
Then run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Set Up FFmpeg

Install FFmpeg and make sure it's in your system path. You can download it from:  
👉 https://www.gyan.dev/ffmpeg/builds/
Also install static binaries for Node:

```bash
npm install fluent-ffmpeg ffmpeg-static ffprobe-static
```

## ▶️ How to Use

### 1. Upload a Video
- Endpoint: `POST /upload`
- Form field: `video`

### 2. Trim the Video
- Endpoint: `POST /trim/:id`
- Body:
```json
{
  "startTime": "10", 
  "endTime": "20"
}
```

### 3. Add Subtitles
- Endpoint: `POST /subtitle/:id`
- Body:
```json
{
  "subtitleText": "Hello World!",
  "startTime": "1",
  "endTime": "3"
}
```

### 4. Render Final Video
- Endpoint: `GET /render/:id`

### 5. Download Final Video
- Endpoint: `GET /download/:id`

---

## 📂 Project Structure

```
controllers/
  videoController.js
routes/
  videoRoutes.js
uploads/
  (temporary video storage)
app.js
```

---

## 📌 Notes

- Trimming is applied to the original uploaded video.
- Subtitles are added on the **trimmed video** as per assignment scope.
- Supports `.mp4`, `.mov`, and `.avi` file formats.
- FFmpeg and ffprobe must be properly set up on your system.

---

## 📷 Demo Video

➡️ Google Drive Link (make sure to update):
[Watch Project Demo](https://drive.google.com/file/d/YOUR_LINK_HERE) Yet to upload

---

## 👨‍💻 Developed By

**Shubham Dikshit**  
For internship assignment submission.  
📧 Email: shubhamdixit912@gmail.com

