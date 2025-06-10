import express from 'express';
import { createEval,getEvals,processEval} from '../controllers/evalsController.js';

const router = express.Router();

// Route to create a new evaluation
router.post('/', createEval);
router.get('/', getEvals);
router.post('/process', processEval);
export default router;

