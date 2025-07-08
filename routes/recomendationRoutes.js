import express from 'express';

import { generateRoadmap , getRecomendationsBycompanyId  ,generatTaining ,generateTechStack} from '../controllers/recomendationsController.js';

const router = express.Router();    

router.get('/:companyId', getRecomendationsBycompanyId);
router.get('/roadmap/:companyId', generateRoadmap);
router.get('/training/:companyId', generatTaining);
router.get('/techstack/:companyId', generateTechStack);

export default router;