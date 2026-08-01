const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendError } = require("../utils/responseFormatter");

const tempDir = path.join(__dirname, "..", "uploads", "temp");

fs.mkdirSync(tempDir, { recursive: true });

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
];

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, tempDir);
  },
  filename: (_, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(null, `${Date.now()}_${baseName}${extension}`);
  },
});

const fileFilter = (_, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(new Error("Unsupported file type."));
  }

  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

exports.uploadAttachmentsMiddleware = (req, res, next) => {
  uploader.array("attachments", 10)(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, "Each file must be less than 10 MB.", null, 400);
      }

      return sendError(res, err.message, null, 400);
    }

    return sendError(res, err.message, null, 400);
  });
};
