import express from 'express';

import {analysisAndClusteringByCompanyID,gerateReport,generateRoadmap} from '../controllers/analysisController.js';

const router = express.Router();

// Route to perform analysis and clustering by company ID
router.get('/:companyId', analysisAndClusteringByCompanyID);    
router.get('/report/:companyId', gerateReport);
router.get('/roadmap/:companyId', generateRoadmap);


export default router;
// This route will trigger the analysis and clustering process for the specified company ID