import express from 'express';
import {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
} from '../controllers/surveyController.js';

const router = express.Router();

// Create a new survey
router.post('/', createSurvey);

// Get all surveys
router.get('/', getAllSurveys);

// Get a single survey by ID
router.get('/:id', getSurveyById);

// Update a survey by ID
router.put('/:id', updateSurvey);

// Delete a survey by ID
router.delete('/:id', deleteSurvey);

export default router;
