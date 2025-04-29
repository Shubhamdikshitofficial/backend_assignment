const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const ffmpeg = require("fluent-ffmpeg");

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

    // Get duration using FFmpeg
    ffmpeg.ffprobe(filePath, async (err, metadata) => {
      if (err) return res.status(500).json({ error: "Error reading video metadata" });

      const duration = metadata.format.duration;

      const video = await prisma.video.create({
        data: {
          filename,
          originalPath: filePath,
          duration,
          size,
          status: "uploaded",
        },
      });

      res.json({ message: "Video uploaded", videoId: video.id });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during upload" });
  }
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

    const drawtext = `drawtext=text='${subtitleText}':enable='between(t,${startTime},${endTime})':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-50`;

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
