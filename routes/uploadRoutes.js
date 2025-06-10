import { uploadFileS3,uploadCSVFile } from '../controllers/uploadController.js';
import express from 'express';

const router = express.Router();

router.post('/', uploadFileS3);

// Route to upload a CSV file
router.post('/csv', uploadCSVFile);

export default router;