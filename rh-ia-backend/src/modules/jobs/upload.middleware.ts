import multer from "multer";

const ACCEPTED_MIME_TYPES = new Set(["application/pdf"]);

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error("Apenas arquivos PDF são aceitos para currículo"));
      return;
    }
    callback(null, true);
  },
});
