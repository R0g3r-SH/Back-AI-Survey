import express from 'express';

import { generateRoadmap , getRecomendationsBycompanyId  ,generatTaining} from '../controllers/recomendationsController.js';

const router = express.Router();    

router.get('/:companyId', getRecomendationsBycompanyId);
router.get('/roadmap/:companyId', generateRoadmap);
router.get('/training/:companyId', generatTaining);

export default router;