import express from 'express';
import {

  createNewSurveyUrl,
  createNewSurvey
} from '../controllers/surveyController.js';

const router = express.Router();



router.post('/create-survey-url', createNewSurveyUrl);
router.post('/create-survey', createNewSurvey);


export default router;
