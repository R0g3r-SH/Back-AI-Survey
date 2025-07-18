import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';  // Import multer

import { connectDB } from './config/db.js';


import surveyRoutes from './routes/surveyRoutes.js'; // Assuming you have a surveyRoutes.js file
import companyRoutes from './routes/companyRoutes.js'; // Assuming you have a companyRoutes.js file
import dashboardRoutes from './routes/dashboardRoutes.js'; // Assuming you have a dashboardRoutes.js file
import analysisRoutes from './routes/analysisRoutes.js'; // Assuming you have an analysisRoutes.js file
import recomendationsRoutes from './routes/recomendationRoutes.js'; // Assuming you have a recomendationsRoutes.js file
import bulkRoutes from './routes/bulkRoutes.js'; // Assuming you have a bulkRoutes.js file
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());



// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});
  

// MongoDB connection
connectDB();

app.use('/api/dashboard', dashboardRoutes); // Assuming you have a dashboardRoutes.js file
app.use('/api/surveys', surveyRoutes); // Assuming you have a surveyRoutes.js file
app.use('/api/companies', companyRoutes); // Assuming you have a companyRoutes.js file
app.use('/api/analysis', analysisRoutes); // Assuming you have an analysisRoutes.js file
app.use('/api/recomendations', recomendationsRoutes); // Assuming you have a recomendationsRoutes.js file
app.use('/api/bulk', bulkRoutes);
// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
