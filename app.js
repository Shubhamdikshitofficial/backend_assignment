const express = require("express");
const app = express();
const videoRoutes = require("./routes/videoRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/videos", videoRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
