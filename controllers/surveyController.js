import Survey from "../models/surveyModels.js";
import Company from "../models/companyModel.js";

import { generateSurveyUrl } from "../utils/survey.utils.js";

// Create new survey

export const createNewSurveyUrl = async (req, res) => {
  try {
    let { company_name } = req.body;

    if (!company_name) {
      //agregar un timestamp para evitar duplicados
      const timestamp = new Date();
      company_name = `Encuesta General - ${timestamp}`; // Default company name with timestamp
    }

    // create a new company
    const newCompany = new Company({ name: company_name });
    await newCompany.save();
    // Generate survey URL
    const surveyUrl = generateSurveyUrl(newCompany._id);
    // Update the company with the survey URL
    newCompany.survey_url = surveyUrl;
    await newCompany.save();

    res.status(201).json({ surveyUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createNewSurvey = async (req, res) => {
  try {
    const { survey, company_id } = req.body;

    if (!survey || !company_id) {
      return res
        .status(400)
        .json({ error: "Survey data and company ID are required" });
    }
    // Create a new survey
    const newSurvey = new Survey({
      ...survey,
    });
    await newSurvey.save();
    // Update the company with the new survey
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    company.surveys.push(newSurvey._id);
    await company.save();
    res
      .status(201)
      .json({ message: "Survey created successfully", survey: newSurvey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
