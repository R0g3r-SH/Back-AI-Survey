import Company from "../models/companyModel.js";
import Survey from "../models/surveyModels.js";
import Dashboard from "../models/dashboardModel.js";
import {
  generateAIResponse,
  calculatePotentialAutomation,
} from "../utils/ai.utils.js";

import {
  calculateUseCases,
  processDepartment,
  processTipoTarea,
  processLevelOfPreparation,
  processTasksEfortvsImpact,
} from "../utils/dashboard.utils.js";

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

export const getComparativeDashboardData = async (req, res) => {
  try {
    const { companyId, companyId2 } = req.params;

    // Validar que al menos una empresa esté presente
    if (!companyId && !companyId2) {
      return res.status(400).json({ error: "At least one company ID is required" });
    }

    // Buscar compañías según los IDs proporcionados
    const [company, company2] = await Promise.all([
      companyId ? Company.findById(companyId) : null,
      companyId2 ? Company.findById(companyId2) : null
    ]);

    // Verificar que las compañías existan si se proporcionaron sus IDs
    if ((companyId && !company) || (companyId2 && !company2)) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Buscar dashboards
    const [dashboard, dashboard2] = await Promise.all([
      company ? Dashboard.findOne({ companyId: company._id }) : null,
      company2 ? Dashboard.findOne({ companyId: company2._id }) : null
    ]);

    // Verificar que existan dashboards para las compañías proporcionadas
    if ((company && !dashboard) || (company2 && !dashboard2)) {
      return res.status(404).json({ error: "No dashboard data found" });
    }

    // Función para preparar datos de una sola empresa
    const prepareSingleCompanyData = (dashboardData, isEmpresa1) => {
      if (!dashboardData) return [];
      
      const key = isEmpresa1 ? 'empresa1' : 'empresa2';
      return dashboardData.participationByDepartment.graphData.map(area => ({
        area: area.name,
        [key]: isEmpresa1 ? area.responses : area.responses,
        [isEmpresa1 ? 'empresa2' : 'empresa1']: 0 // La otra empresa en 0
      }));
    };

    // Función para combinar datos de ambas empresas
    const combineData = (data1, data2) => {
      const allAreas = new Set([
        ...data1.map(item => item.area),
        ...data2.map(item => item.area)
      ]);

      return Array.from(allAreas).map(area => {
        const item1 = data1.find(item => item.area === area);
        const item2 = data2.find(item => item.area === area);

        return {
          area,
          empresa1: item1 ? item1.empresa1 : 0,
          empresa2: item2 ? item2.empresa2 : 0
        };
      });
    };

    // Procesar datos según qué empresas se proporcionaron
    let combinedAreas, combinedAutomation, combinedOpportunity;

    if (companyId && companyId2) {
      // Caso 1: Ambas empresas proporcionadas
      const areasData1 = dashboard.participationByDepartment.graphData.map(area => ({
        area: area.name,
        empresa1: area.responses
      }));

      const areasData2 = dashboard2.participationByDepartment.graphData.map(area => ({
        area: area.name,
        empresa2: area.responses
      }));

      combinedAreas = combineData(areasData1, areasData2);

      // Procesamiento similar para automation y opportunity...
      combinedAutomation = combineData(
        dashboard.participationByDepartment.graphData.map(area => ({
          area: area.name,
          empresa1: area.automation
        })),
        dashboard2.participationByDepartment.graphData.map(area => ({
          area: area.name,
          empresa2: area.automation
        }))
      );

      combinedOpportunity = combineData(
        dashboard.taskTypeData.graphData.map(area => ({
          area: area.name,
          empresa1: area.value
        })),
        dashboard2.taskTypeData.graphData.map(area => ({
          area: area.name,
          empresa2: area.value
        }))
      );
    } else if (companyId) {
      // Caso 2: Solo empresa1
      combinedAreas = prepareSingleCompanyData(dashboard, true);
      combinedAutomation = dashboard.participationByDepartment.graphData.map(area => ({
        area: area.name,
        empresa1: area.automation,
        empresa2: 0
      }));
      combinedOpportunity = dashboard.taskTypeData.graphData.map(area => ({
        area: area.name,
        empresa1: area.value,
        empresa2: 0
      }));
    } else {
      // Caso 3: Solo empresa2
      combinedAreas = prepareSingleCompanyData(dashboard2, false);
      combinedAutomation = dashboard2.participationByDepartment.graphData.map(area => ({
        area: area.name,
        empresa1: 0,
        empresa2: area.automation
      }));
      combinedOpportunity = dashboard2.taskTypeData.graphData.map(area => ({
        area: area.name,
        empresa1: 0,
        empresa2: area.value
      }));
    }

    const output = {
      areas: combinedAreas,
      tipeOportunity: combinedOpportunity,
      potentialAutomation: combinedAutomation
    };

    return res.status(200).json(output);
  } catch (error) {
    console.error("Error fetching comparative dashboard data:", error);
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

    dashboard.section1.automationPotential.mean =
      data.reduce((sum, value) => sum + value, 0) / data.length;
    dashboard.section1.numberUseCases =
      dashboard.section1.numberUseCases +
        calculateUseCases(surveyData.taskDetails) || 0;

    await dashboard.save();

    await processDepartment(
      dashboard._id,
      surveyData.department,
      automationPotential
    );
    await processTipoTarea(dashboard._id, surveyData.mainTasks);
    await processLevelOfPreparation(dashboard._id, surveyData.aiKnowledge);
    await processTasksEfortvsImpact(
      dashboard._id,
      surveyData.taskDetails,
      surveyData.mainTasks
    );
  } catch (error) {
    console.error("Error processing dashboard data:", error);
    throw new Error("Internal server error");
  }
};
