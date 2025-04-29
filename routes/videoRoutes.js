const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const videoController = require("../controllers/videoController");

// Upload Video
router.post("/upload", upload.single("video"), videoController.uploadVideo);

// Trim Video
router.post("/:id/trim", videoController.trimVideo);

// Add Subtitles
router.post("/:id/subtitles", videoController.addSubtitles);

// Render Final Video
router.post("/:id/render", videoController.renderFinal);

// Download Final Video
router.get("/:id/download", videoController.downloadVideo);

module.exports = router;
