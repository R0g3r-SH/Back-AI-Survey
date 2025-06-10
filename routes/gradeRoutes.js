import express from 'express';

import { createGrade, getGrades } from '../controllers/gradesController.js';

const router = express.Router();

// Route to create a new grade
router.post('/', createGrade);
router.get('/', getGrades);

export default router;