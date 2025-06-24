import express from 'express';

import {analysisAndClusteringByCompanyID} from '../controllers/analysisController.js';

const router = express.Router();

// Route to perform analysis and clustering by company ID
router.get('/:companyId', analysisAndClusteringByCompanyID);    

export default router;
// This route will trigger the analysis and clustering process for the specified company ID