import express from 'express';

import { getDashboardData ,getComparativeDashboardData} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/:companyId',getDashboardData);
router.get('/comparative/:companyId', getComparativeDashboardData);
router.get('/comparative/:companyId/:companyId2', getComparativeDashboardData);


export default router;