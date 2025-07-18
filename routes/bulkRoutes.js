import express from "express";
import { bulkUpload } from "../controllers/bulkController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// File filter for CSV files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// Use memory storage instead of disk storage
const upload = multer({ 
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post("/bulk-upload", upload.single("csvFile"), bulkUpload);

export default router;