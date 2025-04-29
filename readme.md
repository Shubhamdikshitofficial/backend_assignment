# Video Editing Backend Platform 🎬

This is the backend for a web-based video editing tool. Users can upload, trim, subtitle, render, and download videos.

### 🔧 Tech Stack
- Node.js
- Express.js
- PostgreSQL + Prisma
- FFmpeg
- Multer
- REST API

### 🚀 How to Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/video-editing-backend.git
cd video-editing-backend
npm install
npx prisma migrate dev
npm run dev

Video Editing Backend Platform - README
🎬 Project Description
This project is a backend service for a web-based video editing platform. It allows users to upload videos, apply basic editing features (trimming, subtitles, etc.), and download the final rendered version.

🛠️ Built using Node.js, Express.js, Prisma (PostgreSQL), Multer, and FFmpeg.
📦 Features
•	✅ Video Upload API with metadata storage
•	✂️ Trim video using start/end timestamps
•	📝 Add subtitles (overlay text with time range)
•	🧱 Modular FFmpeg-based video processing
•	🧪 Built for Postman testing (API-first)
•	🗃️ Prisma ORM with PostgreSQL database
•	🎞️ Video render and final download endpoint
🚀 Tech Stack
Technology	Purpose
Node.js + Express	Server and API Framework
Prisma + PostgreSQL	Database and ORM
Multer	File upload handling
FFmpeg (via fluent-ffmpeg)	Video transformation
dotenv	Environment variable management
📁 Folder Structure

├── controllers/
├── middlewares/
├── routes/
├── prisma/
│   ├── schema.prisma
├── uploads/
├── utils/
├── .env
├── server.js
├── package.json
└── README.md

⚙️ Getting Started
1. Clone the Repo:

```
git clone https://github.com/Shubhamdikshitofficial/backend_assignment.git
cd backend_assignment
```
2. Install Dependencies:

```
npm install
```
3. Set Up `.env` File:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/video_editing"
PORT=5000
```
4. Setup Prisma and DB:

```
npx prisma generate
npx prisma migrate dev --name init
```
5. Start the Server:

```
npm run dev
```
📬 API Endpoints (Use with Postman)
Endpoint	Method	Description
/api/videos/upload	POST	Upload a video
/api/videos/:id/trim	POST	Trim the uploaded video
/api/videos/:id/subtitles	POST	Add subtitles to video
/api/videos/:id/render	POST	Combine edits and render final video
/api/videos/:id/download	GET	Download final video

📂 A Postman collection is available inside the repository for easy testing.
🎯 Demo Instructions
To fulfill assignment requirements:
- Start the server
- Use Postman to test each endpoint (record while doing this)
- Explain your approach, FFmpeg integration, and design decisions
🎁 Future Improvements
•	Add audio background support
•	Image overlay support
•	Job queue via BullMQ and Redis
•	S3 support for scalable storage
📽️ Submission Checklist
•	✅ Code pushed to GitHub
•	✅ Readme created
•	🔜 3–5 minute demo video with voice-over (upload to Google Drive)
📮 Contact
Developed by Shubham Dikshit
Feel free to connect for collaboration or questions!
