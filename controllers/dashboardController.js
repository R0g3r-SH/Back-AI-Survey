import Company from "../models/companyModel.js";
import Survey from "../models/surveyModels.js";
import Dashboard from "../models/dashboardModel.js";
import {
  generateAIResponse,
  calculatePotentialAutomation,
} from "../utils/ai.utils.js";

import {calculateUseCases,processDepartment} from "../utils/dashboard.utils.js";

export const getDashboardData = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find the company by ID
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Find the dashboard data for the company
    const dashboard = await Dashboard.findOne({ companyId: company._id });

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard data not found" });
    }
    // return the dashboard data

    res.status(200).json(dashboard);

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processDashboardData = async (companyId, surveyData) => {
  console.log("Processing dashboard data for company:", companyId);

  if (!companyId || !surveyData) {
    throw new Error("Invalid input data");
  }

  try {
    // Find the company by ID
    const company = await Company.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    // Find the dashboard data for the company
    let dashboard = await Dashboard.findOne({ companyId: company._id });
    if (!dashboard) {
      // If no dashboard exists, create a new one
      dashboard = new Dashboard({ companyId: company._id });
    }

    dashboard.section1.totalAnswers = dashboard.section1.totalAnswers + 1 || 1;

    // Calculate automation potential using AI

    const automationData = surveyData.mainTasks || [];

    const automationPotential = await calculatePotentialAutomation(
      automationData
    );

    const { data } = dashboard.section1.automationPotential;

    data.push(automationPotential);

    dashboard.section1.automationPotential.mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    dashboard.section1.numberUseCases = dashboard.section1.numberUseCases + calculateUseCases(surveyData.taskDetails) || 0;
    
    await dashboard.save();

    await processDepartment(dashboard._id, surveyData.department,automationPotential)

  } catch (error) {
    console.error("Error processing dashboard data:", error);
    throw new Error("Internal server error");
  }
};
