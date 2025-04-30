const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path; // Ensure ffprobe path is loaded
const ffmpeg = require("fluent-ffmpeg");
const { spawn } = require("child_process");

ffmpeg.setFfmpegPath(ffmpegPath);
const prisma = new PrismaClient();
const uploadDir = path.join(__dirname, "..", "uploads");

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDirExists(uploadDir);

// 1. Upload Video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { filename, size } = req.file;
    const filePath = req.file.path;
    const videoPath = path.join(__dirname, "..", "uploads", req.file.filename);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Uploaded video file not found" });
    }

    // Get duration using FFmpeg
    getVideoMetadata(videoPath)
      .then(async (metadata) => {
        const duration = metadata.duration;

        const video = await prisma.video.create({
          data: {
            filename,
            originalPath: filePath,
            duration,
            size,
            status: "uploaded",
          },
        });
        res.json({ message: "Video uploaded", videoId: video.id , videoName: video.filename});
      })
      .catch((err) => {
        console.error("❌ FFprobe Error:", err);
        res.status(500).json({ error: "Error reading video metadata" });
      });
  } catch (err) {
    console.error("Error during upload:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
};

// Function to get video metadata
const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {

    const ffprobe = spawn(ffprobePath, ["-v", "error", "-show_format", "-show_streams", videoPath]);

    let data = "";
    let errorData = "";

    ffprobe.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    ffprobe.stderr.on("data", (chunk) => {
      errorData += chunk.toString();
      console.error("ffprobe stderr:", chunk.toString());
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        console.error("FFprobe Error:", errorData);
        return reject(new Error("Error reading video metadata"));
      }

      try {
        const metadata = parseMetadata(data);
        resolve(metadata);
      } catch (err) {
        console.error("Error parsing metadata:", err);
        reject(new Error("Error parsing video metadata"));
      }
    });
  });
};

// Function to parse ffprobe metadata
const parseMetadata = (data) => {
  const metadata = {};
  const formatMatch = data.match(/duration=([\d.]+)/);
  if (formatMatch) {
    metadata.duration = parseFloat(formatMatch[1]);
  }
  return metadata;
};

// 2. Trim Video
exports.trimVideo = async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;

  try {
    const video = await prisma.video.findUnique({ where: { id: Number(id) } });
    if (!video) return res.status(404).json({ error: "Video not found" });

    const trimmedPath = path.join(uploadDir, `trimmed-${video.filename}`);

    ffmpeg(video.originalPath)
      .setStartTime(startTime)
      .setDuration(parseFloat(endTime) - parseFloat(startTime))
      .output(trimmedPath)
      .on("end", async () => {
        await prisma.video.update({
          where: { id: Number(id) },
          data: {
            trimmedPath,
            status: "trimmed",
          },
        });
        res.json({ message: "Video trimmed", trimmedPath });
      })
      .on("error", (err) => res.status(500).json({ error: "Trimming failed", details: err.message }))
      .run();
  } catch (err) {
    res.status(500).json({ error: "Server error during trimming" });
  }
};

// 3. Add Subtitles
exports.addSubtitles = async (req, res) => {
  const { id } = req.params;
  const { subtitleText, startTime, endTime } = req.body;

  try {
    const video = await prisma.video.findUnique({ where: { id: Number(id) } });
    if (!video || !video.trimmedPath) return res.status(404).json({ error: "Trimmed video not found" });

    const subtitleFilePath = path.join(uploadDir, `sub-${video.filename}.mp4`);

    const drawtext = `drawtext=text='${subtitleText}':enable='between(t,${startTime},${endTime})':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=h-50:box=1:boxcolor=black@0.5:boxborderw=5`;

    ffmpeg(video.trimmedPath)
      .videoFilter(drawtext)
      .output(subtitleFilePath)
      .on("end", async () => {
        await prisma.video.update({
          where: { id: Number(id) },
          data: {
            subtitlePath: subtitleFilePath,
            status: "subtitled",
          },
        });
        res.json({ message: "Subtitles added", subtitlePath: subtitleFilePath });
      })
      .on("error", (err) => res.status(500).json({ error: "Subtitle failed", details: err.message }))
      .run();
  } catch (err) {
    res.status(500).json({ error: "Server error during subtitles" });
  }
};

// 4. Render Final Video
exports.renderFinal = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await prisma.video.findUnique({ where: { id: Number(id) } });
    if (!video || !video.subtitlePath) return res.status(404).json({ error: "Subtitle video not found" });

    const finalPath = path.join(uploadDir, `final-${video.filename}`);

    fs.copyFile(video.subtitlePath, finalPath, async (err) => {
      if (err) return res.status(500).json({ error: "Rendering failed", details: err.message });

      await prisma.video.update({
        where: { id: Number(id) },
        data: {
          finalPath,
          status: "rendered",
        },
      });

      res.json({ message: "Final video rendered", finalPath });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during rendering" });
  }
};

// 5. Download Final Video
exports.downloadVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await prisma.video.findUnique({ where: { id: Number(id) } });
    if (!video || !video.finalPath) return res.status(404).json({ error: "Final video not found" });

    res.download(video.finalPath);
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
};
