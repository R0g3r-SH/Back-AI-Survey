
import Company from "../models/companyModel.js";
import Dashboard from "../models/dashboardModel.js";
import {generateAIRoadMap,generateAITraining} from "../utils/ai.utils.js";

export const getRecomendationsBycompanyId = async (req, res) => {
    const { companyId } = req.params;
    try {
        // Find the company by ID
        const company = await Company.findOne({ _id: companyId });

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Find the dashboard data for the company
        const dashboard = await Dashboard.findOne({ companyId: company._id });
        if (!dashboard) {
            return res.status(404).json({ error: "Dashboard data not found" });
        }
        // Check if the analysis and clustering data is available
        if (!dashboard.recomendations) {
            return res.status(404).json({ error: "Recommendations data not found" 
            });
        }

        // Extract the analysis and clustering data
        const recomendations = dashboard.recomendations || {};

        // Return the analysis and clustering data
        return res.status(200).json({
            success: true,      
            recomendations: recomendations,
        });


    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const generateRoadmap = async (req, res) => {
  const { companyId } = req.params;

  try {
    // Find the company by ID
    const company = await Company.findOne({ _id: companyId });      

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    } 

    // Find the dashboard data for the company
    const dashboard = await Dashboard.findOne({ companyId: company._id });
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard data not found" });
    }


    const Data = {
      companyName: company.name,
      section1: dashboard.section1 || {},
      participationByDepartment: dashboard.participationByDepartment || {},
      levelOfPreparation: dashboard.levelOfPreparation || {},
      taskTypeData: dashboard.taskTypeData || {},
  }

    const roadmap = await generateAIRoadMap(Data);

    // Update the dashboard with the AI roadmap
    dashboard.recomendations.roadmap = roadmap;
    await dashboard.save();

    return res.status(200).json({
      success: true,
      roadmap: roadmap,
    });

  } catch (error) {
    console.error("Error generating roadmap:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

}

export const generatTaining = async (req, res) => {
  const { companyId } = req.params;

  try {
    // Find the company by ID
    const company = await Company.findOne({ _id: companyId });  
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }   

    // Find the dashboard data for the company
    const dashboard = await Dashboard.findOne({ companyId: company._id });
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard data not found" });
    }

    const roadmap = dashboard.recomendations.roadmap || {};

    if (!roadmap || Object.keys(roadmap).length === 0) {
      return res.status(404).json({ error: "Roadmap data not found" });
    }

    // Generate training based on the roadmap
    const training = await generateAITraining(roadmap);  

    // Update the dashboard with the AI training
    dashboard.recomendations.training = training;
    await dashboard.save();

    return res.status(200).json({
      success: true,
      training: training,
    });

    

  }
  catch (error) {
    console.error("Error generating training:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

}
