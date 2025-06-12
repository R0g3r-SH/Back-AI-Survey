import express from "express";

import { getAllCompanies ,getCompanyById } from "../controllers/companyController.js";

const router = express.Router();

// Route to get all companies
router.get("/", getAllCompanies);
// Route to get a company by ID
router.get("/:id", getCompanyById);


export default router;
