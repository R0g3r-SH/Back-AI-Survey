import Dashboard from "../models/dashboardModel.js";

import { getTaskType, classifyByCluster } from "./ai.utils.js";

export const clusteringByTasks = async (
  dashboardID,
  tasks,
  department,
  AIMaturuty
) => {
  console.log("Clustering tasks:", tasks);

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  // Get the cluster key from the AI service
  const clusterKey = await classifyByCluster(tasks);

  // Mongoose ya garantiza que participationClusters existe con la estructura del esquema
  if (dashboard.participationClusters[clusterKey]) {
    dashboard.participationClusters[clusterKey].count++;
    if (
      !dashboard.participationClusters[clusterKey].departments.includes(
        department
      )
    ) {
      dashboard.participationClusters[clusterKey].departments.push(department);
    }
  }

  await dashboard.save();

  await processTotalAIMaturityByClusters(dashboardID, clusterKey, AIMaturuty);

  return {
    success: true,
    message: `Tasks clustered successfully under ${clusterKey}`,
    clusterKey,
  };
};

export const processTotalAIMaturityByClusters = async (
  dashboardID,
  clusterKey,
  aiMaturity
) => {
  console.log(
    `Processing AI Maturity by Clusters for Dashboard ID: ${dashboardID}`
  );

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  // Definición de clusters y nombres legibles
  const clusterDefinitions = {
    analistasDeDatosEInformacion: "Analistas de datos",
    constructoresDeDocumentosYContenido: "Constructores de contenido",
    integradoresYOptimizadoresDeProcesos: "Integradores de procesos",
    comunicadoresYDifusoresDeInformacion: "Comunicadores",
    gestoresDeEstrategiaYDecision: "Gestores estratégicos",
  };

  const readableClusterName = clusterDefinitions[clusterKey];
  if (!readableClusterName) {
    throw new Error(`Invalid cluster key provided: ${clusterKey}`);
  }

  // Initialize main data structure if not exists
  if (!dashboard.totalAIMaturityByClusters) {
    dashboard.totalAIMaturityByClusters = {};
  }

  // Initialize cluster if not exists
  if (!dashboard.totalAIMaturityByClusters[clusterKey]) {
    dashboard.totalAIMaturityByClusters[clusterKey] = {
      data: [],
      mean: 0,
    };
  }

  // Update cluster data
  const department = dashboard.totalAIMaturityByClusters[clusterKey];
  department.data.push(aiMaturity);
  department.mean =
    department.data.reduce((sum, val) => sum + val, 0) / department.data.length;

  // HEATMAP GRAPH UPDATE
  const clusterDefinitionsHP = {
    analistasDeDatosEInformacion: "Analistas",
    constructoresDeDocumentosYContenido: "Constructores",
    integradoresYOptimizadoresDeProcesos: "Integradores",
    comunicadoresYDifusoresDeInformacion: "Comunicadores",
    gestoresDeEstrategiaYDecision: "Gestores",
  };

  const clusterName = clusterDefinitionsHP[clusterKey];

  // 3. Asegurar que heatmapGraph existe
  if (!dashboard.totalAIMaturityByClusters.heatmapGraph) {
    dashboard.totalAIMaturityByClusters.heatmapGraph = [];
  }

  // 4. Encontrar o crear entrada
  let clusterEntry = dashboard.totalAIMaturityByClusters.heatmapGraph.find(
    (e) => e.cluster === clusterName
  );

  if (!clusterEntry) {
    clusterEntry = {
      cluster: clusterName,
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
      level_5: 0,
    };
    dashboard.totalAIMaturityByClusters.heatmapGraph.push(clusterEntry);
    console.log(`Created new heatmap entry for ${clusterName}`);
  }

  // 5. Calcular nivel
  const clampedMaturity = Math.max(1, Math.min(5, Math.round(aiMaturity)));
  const levelKey = `level_${clampedMaturity}`;

  if (clusterEntry[levelKey] !== undefined) {
    clusterEntry[levelKey]++;
    console.log(`Incremented ${levelKey} for ${clusterName}`);
  } else {
    console.error(`Invalid level key: ${levelKey}`);
  }

  console.log(
    "Updated heatmap graph:",
    JSON.stringify(dashboard.totalAIMaturityByClusters.heatmapGraph, null, 2)
  );

  // 6. Guardar correctamente
  dashboard.markModified("totalAIMaturityByClusters.heatmapGraph");
  await dashboard.save();

  return {
    success: true,
    message: "Department AI Maturity data updated successfully",
    department: readableClusterName,
  };
};

export const calculateUseCases = (taskDetails) => {
  // Ponderaciones
  const WEIGHTS = {
    frequency: {
      diaria: 1.0,
      semanal: 0.8,
      mensual: 0.6,
      trimestral: 0.4,
      anual: 0.2,
    },
    structureLevel: {
      completa: 1.0,
      parcial: 0.7,
      "no-estructurada": 0.3,
    },
    impact: {
      alto: 1.0,
      medio: 0.6,
      bajo: 0.3,
    },
    dataAvailability: {
      completa: 1.0,
      parcial: 0.5,
      no: 0.1,
    },
  };

  // Calcular score para cada tarea
  const scoredTasks = taskDetails.map((task) => {
    const freqScore = WEIGHTS.frequency[task.frequency] || 0;
    const structScore = WEIGHTS.structureLevel[task.structureLevel] || 0;
    const impactScore = WEIGHTS.impact[task.impact] || 0;
    const dataScore = WEIGHTS.dataAvailability[task.dataAvailability] || 0;

    const score =
      (freqScore * 0.3 +
        structScore * 0.2 +
        impactScore * 0.3 +
        dataScore * 0.2) *
      10;

    return {
      ...task,
      score,
      meetsCriteria: score >= 5, // Umbral ajustable
    };
  });

  // Contar tareas que cumplen criterios
  const totalTasks = scoredTasks.length;
  const meetsCriteriaCount = scoredTasks.filter(
    (task) => task.meetsCriteria
  ).length;
  const meetsCriteriaPercentage = (meetsCriteriaCount / totalTasks) * 100;

  // Estadísticas de score
  const scores = scoredTasks.map((task) => task.score);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / totalTasks;

  console.log(meetsCriteriaCount);
  console.log(meetsCriteriaPercentage);

  return totalTasks;
};

export async function calcualtetotalAIMaturitySection(
  dashboardID,
  aiknowledge,
  aiEthicsAndGovernance,
  aiCulture,
) {
  // Helper function to round to 2 decimal places
  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // Get current dashboard data
  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) throw new Error('Dashboard not found');

  // Helper function to calculate new mean including new value
  const calculateNewMean = (existingArray, newValue) => {
    const allValues = [...(existingArray || []).map(Number), newValue];
    return roundToTwo(allValues.reduce((sum, val) => sum + val, 0) / allValues.length);
  };

  // Calculate all new means
  // AI Knowledge Section
  const basicKnowledgeMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiknowledge?.basicKnowledge?.data,
    aiknowledge.aiBasicKnowledge
  );
  const promtsMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiknowledge?.promts?.data,
    aiknowledge.aiKnowledgePromptDesign
  );
  const integrationMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiknowledge?.integration?.data,
    aiknowledge.aiKnowledgeIntegration
  );
  const riskAssessmentMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiknowledge?.riskAssessment?.data,
    aiknowledge.aiKnowledgeRiskAssessment
  );
  const frequencyMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiknowledge?.frequency?.data,
    aiknowledge.aiKnowledgeUsageFrequency
  );
  const aiKnowledgeSectionMean = roundToTwo(
    (basicKnowledgeMean + promtsMean + integrationMean + riskAssessmentMean + frequencyMean) / 5
  );

  // AI Culture Section
  const curiosityMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.culture?.curiosity?.data,
    aiCulture.aiCuriosity
  );
  const resistanceMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.culture?.resistance?.data,
    aiCulture.aiResistance
  );
  const cautionMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.culture?.caution?.data,
    aiCulture.aiCaution
  );
  const aiCultureSectionMean = roundToTwo(
    (curiosityMean + resistanceMean + cautionMean) / 3
  );

  // AI Ethics and Governance Section
  const polticsMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiEthichsandGovernance?.poltics?.data,
    aiEthicsAndGovernance.aiPolicy
  );
  const dataGovernanceMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiEthichsandGovernance?.dataGovernance?.data,
    aiEthicsAndGovernance.aiDataGovernance
  );
  const securityMean = calculateNewMean(
    dashboard.totalAIMaturitySection?.aiEthichsandGovernance?.security?.data,
    aiEthicsAndGovernance.aiSecurityPrivacy
  );
  const aiEthicsSectionMean = roundToTwo(
    (polticsMean + dataGovernanceMean + securityMean) / 3
  );

  // Prepare the complete update operation
  return Dashboard.findByIdAndUpdate(
    dashboardID,
    {
      $push: {
        // Push new data points
        'totalAIMaturitySection.aiknowledge.basicKnowledge.data': roundToTwo(aiknowledge.aiBasicKnowledge),
        'totalAIMaturitySection.aiknowledge.promts.data': roundToTwo(aiknowledge.aiKnowledgePromptDesign),
        'totalAIMaturitySection.aiknowledge.integration.data': roundToTwo(aiknowledge.aiKnowledgeIntegration),
        'totalAIMaturitySection.aiknowledge.riskAssessment.data': roundToTwo(aiknowledge.aiKnowledgeRiskAssessment),
        'totalAIMaturitySection.aiknowledge.frequency.data': roundToTwo(aiknowledge.aiKnowledgeUsageFrequency),
        
        'totalAIMaturitySection.culture.curiosity.data': roundToTwo(aiCulture.aiCuriosity),
        'totalAIMaturitySection.culture.resistance.data': roundToTwo(aiCulture.aiResistance),
        'totalAIMaturitySection.culture.caution.data': roundToTwo(aiCulture.aiCaution),
        
        'totalAIMaturitySection.aiEthichsandGovernance.poltics.data': roundToTwo(aiEthicsAndGovernance.aiPolicy),
        'totalAIMaturitySection.aiEthichsandGovernance.dataGovernance.data': roundToTwo(aiEthicsAndGovernance.aiDataGovernance),
        'totalAIMaturitySection.aiEthichsandGovernance.security.data': roundToTwo(aiEthicsAndGovernance.aiSecurityPrivacy),
      },
      $set: {
        // Set all calculated means
        // AI Knowledge
        'totalAIMaturitySection.aiknowledge.basicKnowledge.mean': basicKnowledgeMean,
        'totalAIMaturitySection.aiknowledge.promts.mean': promtsMean,
        'totalAIMaturitySection.aiknowledge.integration.mean': integrationMean,
        'totalAIMaturitySection.aiknowledge.riskAssessment.mean': riskAssessmentMean,
        'totalAIMaturitySection.aiknowledge.frequency.mean': frequencyMean,
        'totalAIMaturitySection.aiknowledge.mean': aiKnowledgeSectionMean,
        
        // AI Culture
        'totalAIMaturitySection.culture.curiosity.mean': curiosityMean,
        'totalAIMaturitySection.culture.resistance.mean': resistanceMean,
        'totalAIMaturitySection.culture.caution.mean': cautionMean,
        'totalAIMaturitySection.culture.mean': aiCultureSectionMean,
        
        // AI Ethics and Governance
        'totalAIMaturitySection.aiEthichsandGovernance.poltics.mean': polticsMean,
        'totalAIMaturitySection.aiEthichsandGovernance.dataGovernance.mean': dataGovernanceMean,
        'totalAIMaturitySection.aiEthichsandGovernance.security.mean': securityMean,
        'totalAIMaturitySection.aiEthichsandGovernance.mean': aiEthicsSectionMean,
      }
    },
    { new: true }
  );
}

function getInterpretation(score) {
  if (score >= 8) return "Excelente - La mayoría son casos de uso críticos";
  if (score >= 6) return "Bueno - Muchos casos de uso importantes";
  if (score >= 4) return "Regular - Algunos casos de uso valiosos";
  return "Bajo - Pocos casos de uso relevantes";
}
// Mapeo de nombres de departamentos (lo que llega -> como se almacena en DB)
const DEPARTMENT_MAPPING = {
  "Recursos Humanos": "recursosHumanos",
  Finanzas: "finanzas",
  Marketing: "marketing",
  Ventas: "ventas",
  IT: "it",
  Operaciones: "operaciones",
  Legal: "legal",
  Compras: "compras",
  "Atención al Cliente": "atencionclientes",
  Otro: "otro",
};

export const processDepartment = async (dashboardID, departmentName, score) => {
  try {
    // Validación del score
    if (typeof score !== "number" || isNaN(score) || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    // Verificar si el departamento es válido y obtener su clave en la DB
    const dbDepartmentKey = DEPARTMENT_MAPPING[departmentName];
    if (!dbDepartmentKey) {
      throw new Error(`Departamento "${departmentName}" no válido`);
    }

    // Buscar el dashboard
    const dashboard = await Dashboard.findById(dashboardID);
    if (!dashboard) {
      throw new Error("Dashboard no encontrado");
    }

    // Inicializar participationByDepartment si no existe
    if (!dashboard.participationByDepartment) {
      dashboard.participationByDepartment = {};
    }

    // Inicializar el departamento si no existe
    if (!dashboard.participationByDepartment[dbDepartmentKey]) {
      dashboard.participationByDepartment[dbDepartmentKey] = {
        data: [],
        mean: 0,
        total: 0,
      };
    }

    console.log(
      "-> Processing department:",
      dbDepartmentKey,
      "with score:",
      score
    );

    const department = dashboard.participationByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.total = department.data.length;
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateGraphData(
      dashboard,
      departmentName,
      parseFloat(department.mean.toFixed(2))
    );

    // Guardar los cambios
    await dashboard.save();

    return {
      success: true,
      message: "Datos actualizados correctamente",
      department: dbDepartmentKey,
      newDataPoint: score,
      currentMean: department.mean,
      currentTotal: department.total,
      totalDataPoints: department.data.length,
    };
  } catch (error) {
    console.error("Error en processDepartment:", error);
    return {
      success: false,
      message: error.message || "Error al procesar el departamento",
    };
  }
};

export const processDepartmentAICulture = async (
  dashboardID,
  departmentName,
  score
) => {
  try {
    // Validación del score
    if (typeof score !== "number" || isNaN(score) || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    // Verificar si el departamento es válido y obtener su clave en la DB
    const dbDepartmentKey = DEPARTMENT_MAPPING[departmentName];
    if (!dbDepartmentKey) {
      throw new Error(`Departamento "${departmentName}" no válido`);
    }

    // Buscar el dashboard
    const dashboard = await Dashboard.findById(dashboardID);
    if (!dashboard) {
      throw new Error("Dashboard no encontrado");
    }

    // Inicializar participationByDepartment si no existe
    if (!dashboard.aiCultureByDepartment) {
      dashboard.aiCultureByDepartment = {};
    }

    // Inicializar el departamento si no existe
    if (!dashboard.aiCultureByDepartment[dbDepartmentKey]) {
      dashboard.aiCultureByDepartment[dbDepartmentKey] = {
        data: [],
        mean: 0,
      };
    }

    console.log(
      "-> Processing AI Culture department:",
      dbDepartmentKey,
      "with score:",
      score
    );

    const department = dashboard.aiCultureByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateCultureGraphData(
      dashboard,
      departmentName,
      parseFloat(department.mean.toFixed(2))
    );

    // Guardar los cambios
    await dashboard.save();

    return {
      success: true,
      message: "Datos actualizados correctamente",
      department: dbDepartmentKey,
      newDataPoint: score,
      currentMean: department.mean,
      currentTotal: department.total,
      totalDataPoints: department.data.length,
    };
  } catch (error) {
    console.error("Error en processDepartment:", error);
    return {
      success: false,
      message: error.message || "Error al procesar el departamento",
    };
  }
};

export const processDepartmentAIKnowledge = async (
  dashboardID,
  departmentName,
  score
) => {
  try {
    // Validación del score
    if (typeof score !== "number" || isNaN(score) || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    // Verificar si el departamento es válido y obtener su clave en la DB
    const dbDepartmentKey = DEPARTMENT_MAPPING[departmentName];
    if (!dbDepartmentKey) {
      throw new Error(`Departamento "${departmentName}" no válido`);
    }

    // Buscar el dashboard
    const dashboard = await Dashboard.findById(dashboardID);
    if (!dashboard) {
      throw new Error("Dashboard no encontrado");
    }

    // Inicializar participationByDepartment si no existe
    if (!dashboard.aiknowledgeByDepartment) {
      dashboard.aiknowledgeByDepartment = {};
    }

    // Inicializar el departamento si no existe
    if (!dashboard.aiknowledgeByDepartment[dbDepartmentKey]) {
      dashboard.aiknowledgeByDepartment[dbDepartmentKey] = {
        data: [],
        mean: 0,
      };
    }

    console.log(
      "-> Processing AI Knowledge department:",
      dbDepartmentKey,
      "with score:",
      score
    );

    const department = dashboard.aiknowledgeByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateAIKnowledgeGraphData(
      dashboard,
      departmentName,
      parseFloat(department.mean.toFixed(2))
    );

    // Guardar los cambios
    await dashboard.save();

    return {
      success: true,
      message: "Departmen AI Knowledge data updated successfully",
      department: dbDepartmentKey,
    };
  } catch (error) {
    console.error("Error en processDepartment:", error);
    return {
      success: false,
      message: error.message || "Error al procesar el departamento",
    };
  }
};

export const processaiEthichsandGovernanceByDepartment = async (
  dashboardID,
  departmentName,
  score
) => {
  try {
    // Validación del score
    if (typeof score !== "number" || isNaN(score) || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    // Verificar si el departamento es válido y obtener su clave en la DB
    const dbDepartmentKey = DEPARTMENT_MAPPING[departmentName];
    if (!dbDepartmentKey) {
      throw new Error(`Departamento "${departmentName}" no válido`);
    }

    // Buscar el dashboard
    const dashboard = await Dashboard.findById(dashboardID);
    if (!dashboard) {
      throw new Error("Dashboard no encontrado");
    }

    // Inicializar participationByDepartment si no existe
    if (!dashboard.aiEthichsandGovernanceByDepartment) {
      dashboard.aiEthichsandGovernanceByDepartment = {};
    }

    // Inicializar el departamento si no existe
    if (!dashboard.aiEthichsandGovernanceByDepartment[dbDepartmentKey]) {
      dashboard.aiEthichsandGovernanceByDepartment[dbDepartmentKey] = {
        data: [],
        mean: 0,
      };
    }

    console.log(
      "-> Processing AI Ethics and Governance department:",
      dbDepartmentKey,
      "with score:",
      score
    );

    const department =
      dashboard.aiEthichsandGovernanceByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateEthicsAndGovernanceGraphData(
      dashboard,
      departmentName,
      parseFloat(department.mean.toFixed(2))
    );

    // Guardar los cambios
    await dashboard.save();

    return {
      success: true,
      message: "Department AI Ethics and Governance data updated successfully",
      department: dbDepartmentKey,
    };
  } catch (error) {
    console.error("Error en processaiEthichsandGovernanceByDepartment:", error);
    return {
      success: false,
      message: error.message || "Error al procesar el departamento",
    };
  }
};

export const processaiMaturityByDepartment = async (
  dashboardID,
  departmentName,
  score
) => {
  try {
    // Validación del score
    if (typeof score !== "number" || isNaN(score) || score < 0) {
      throw new Error("El score debe ser un número positivo");
    }

    // Verificar si el departamento es válido y obtener su clave en la DB
    const dbDepartmentKey = DEPARTMENT_MAPPING[departmentName];
    if (!dbDepartmentKey) {
      throw new Error(`Departamento "${departmentName}" no válido`);
    }

    // Buscar el dashboard
    const dashboard = await Dashboard.findById(dashboardID);
    if (!dashboard) {
      throw new Error("Dashboard no encontrado");
    }

    // Inicializar participationByDepartment si no existe
    if (!dashboard.totalAIMaturityByDepartment) {
      dashboard.totalAIMaturityByDepartment = {};
    }

    // Inicializar el departamento si no existe
    if (!dashboard.totalAIMaturityByDepartment[dbDepartmentKey]) {
      dashboard.totalAIMaturityByDepartment[dbDepartmentKey] = {
        data: [],
        mean: 0,
      };
    }

    console.log(
      "-> Processing AI Maturity department:",
      dbDepartmentKey,
      "with score:",
      score
    );

    const department = dashboard.totalAIMaturityByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateMaturityGraphData(
      dashboard,
      departmentName,
      parseFloat(department.mean.toFixed(2))
    );

    // Guardar los cambios
    await dashboard.save();

    return {
      success: true,
      message: "Department AI Maturity data updated successfully",
      department: dbDepartmentKey,
    };
  } catch (error) {
    console.error("Error en processaiEthichsandGovernanceByDepartment:", error);
    return {
      success: false,
      message: error.message || "Error al procesar el departamento",
    };
  }
};

// Función para actualizar los datos de la gráfica
function updateGraphData(dashboard, departmentName, score) {
  // Inicializar graphData si no existe
  if (!dashboard.participationByDepartment.graphData) {
    dashboard.participationByDepartment.graphData = [];
  }

  const graphData = dashboard.participationByDepartment.graphData;

  // Buscar si ya existe una entrada para este departamento
  const existingEntryIndex = graphData.findIndex(
    (item) => item.name === departmentName
  );

  if (existingEntryIndex >= 0) {
    // Actualizar entrada existente
    graphData[existingEntryIndex].responses += 1;
    graphData[existingEntryIndex].automation = score;
  } else {
    // Crear nueva entrada
    graphData.push({
      name: departmentName,
      responses: 1,
      automation: parseFloat(score.toFixed(2)),
    });
  }

  // Opcional: Ordenar por número de respuestas (mayor a menor)
  graphData.sort((a, b) => b.responses - a.responses);
}

function updateCultureGraphData(dashboard, departmentName, mean) {
  // Ensure graphData is initialized
  if (!dashboard.aiCultureByDepartment.graphData) {
    dashboard.aiCultureByDepartment.graphData = [];
  }

  const graphData = dashboard.aiCultureByDepartment.graphData;

  // Find existing entry
  const existingEntryIndex = graphData.findIndex(
    (item) => item.name === departmentName
  );

  if (existingEntryIndex >= 0) {
    // Update the existing department mean
    graphData[existingEntryIndex].mean = mean;
    graphData[existingEntryIndex].responses += 1; // Optional
  } else {
    // Create a new department entry
    graphData.push({
      name: departmentName,
      mean: mean,
      responses: 1,
    });
  }

  // Optional: sort by number of responses or by mean
  graphData.sort((a, b) => b.responses - a.responses);
}

function updateEthicsAndGovernanceGraphData(dashboard, departmentName, mean) {
  // Ensure graphData is initialized
  if (!dashboard.aiEthichsandGovernanceByDepartment.graphData) {
    dashboard.aiEthichsandGovernanceByDepartment.graphData = [];
  }

  const graphData = dashboard.aiEthichsandGovernanceByDepartment.graphData;

  // Find existing entry
  const existingEntryIndex = graphData.findIndex(
    (item) => item.name === departmentName
  );

  if (existingEntryIndex >= 0) {
    // Update the existing department mean
    graphData[existingEntryIndex].mean = mean;
    graphData[existingEntryIndex].responses += 1; // Optional
  } else {
    // Create a new department entry
    graphData.push({
      name: departmentName,
      mean: mean,
      responses: 1,
    });
  }

  // Optional: sort by number of responses or by mean
  graphData.sort((a, b) => b.responses - a.responses);
}

function updateAIKnowledgeGraphData(dashboard, departmentName, mean) {
  // Ensure graphData is initialized

  console.log(
    "Updating AI Knowledge graph data for department:",
    departmentName,
    "with mean:",
    mean
  );
  if (!dashboard.aiknowledgeByDepartment.graphData) {
    dashboard.aiknowledgeByDepartment.graphData = [];
  }

  const graphData = dashboard.aiknowledgeByDepartment.graphData;

  // Find existing entry
  const existingEntryIndex = graphData.findIndex(
    (item) => item.name === departmentName
  );

  if (existingEntryIndex >= 0) {
    // Update the existing department mean
    graphData[existingEntryIndex].mean = mean;
    graphData[existingEntryIndex].responses += 1; // Optional
  } else {
    // Create a new department entry
    graphData.push({
      name: departmentName,
      mean: mean,
      responses: 1,
    });
  }

  // Optional: sort by number of responses or by mean
  graphData.sort((a, b) => b.responses - a.responses);
}

function updateMaturityGraphData(dashboard, departmentName, mean) {
  // Ensure graphData is initialized
  if (!dashboard.totalAIMaturityByDepartment.graphData) {
    dashboard.totalAIMaturityByDepartment.graphData = [];
  }

  const graphData = dashboard.totalAIMaturityByDepartment.graphData;

  // Find existing entry
  const existingEntryIndex = graphData.findIndex(
    (item) => item.name === departmentName
  );

  if (existingEntryIndex >= 0) {
    // Update the existing department mean
    graphData[existingEntryIndex].mean = mean;
    graphData[existingEntryIndex].responses += 1; // Optional
  } else {
    // Create a new department entry
    graphData.push({
      name: departmentName,
      mean: mean,
      responses: 1,
    });
  }

  // Optional: sort by number of responses or by mean
  graphData.sort((a, b) => b.responses - a.responses);
}

export const processTipoTarea = async (dashboardID, tasks) => {
  console.log("Processing Task Types for Dashboard ID:", dashboardID);

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  const tasksMap = {
    documentation: "Documentación",
    communication: "Comunicación",
    analysis: "Análisis",
    creativity: "Creatividad",
    management: "Gestión",
    reports: "Reportes",
  };

  const colorMap = {
    documentation: "#8884d8",
    communication: "#82ca9d",
    analysis: "#ffc658",
    creativity: "#ff7300",
    management: "#d0ed57",
    reports: "#ffbb28",
  };

  // Acumular tareas por tipo
  for (const task of tasks) {
    try {
      const taskType = await getTaskType(task);
      const taskTypeKey = taskType.toLowerCase().replace(/\s+/g, "_");

      if (!dashboard.taskTypeData[taskTypeKey]) {
        dashboard.taskTypeData[taskTypeKey] = { total: 0 };
      }

      dashboard.taskTypeData[taskTypeKey].total += 1;
    } catch (error) {
      console.error(`Error processing task "${task.description}":`, error);
    }
  }

  // Regenerar toda la gráfica desde cero
  dashboard.taskTypeData.graphData = [];

  for (const [key, data] of Object.entries(dashboard.taskTypeData)) {
    // Saltar si no tiene total válido
    if (typeof data.total !== "number") continue;

    if (data.total === 0) continue; // No agregar si el total es 0

    dashboard.taskTypeData.graphData.push({
      name: tasksMap[key] || key,
      value: getPercentageByDepartment(dashboard.taskTypeData, key),
      color: colorMap[key] || "#000000",
    });
  }

  await dashboard.save();
  console.log("Dashboard updated successfully.");
};

function getPercentageByDepartment(taskTypeData, type) {
  const totalTasks = Object.values(taskTypeData).reduce(
    (sum, t) => sum + (t.total || 0),
    0
  );
  const percentage =
    totalTasks > 0 ? (taskTypeData[type].total / totalTasks) * 100 : 0;
  return parseFloat(percentage.toFixed(2));
}

export const processLevelOfPreparation = async (dashboardID, level) => {
  console.log("Processing Level of Preparation for Dashboard ID:", dashboardID);
  console.log("Level provided:", level);

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  // Define level mappings
  const levelsMap = {
    1: "starting",
    2: "basic",
    3: "intermediate",
    4: "advanced",
    5: "expert",
  };

  const levelsMapForGraph = {
    starting: "Principiante",
    basic: "Básico",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto",
  };

  // Validate and parse level
  const levelNumber = parseInt(level);
  if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 5) {
    throw new Error(`Invalid level provided: ${level}`);
  }
  const levelKey = levelsMap[levelNumber];

  // Initialize levelOfPreparation if it doesn't exist
  if (
    !dashboard.levelOfPreparation ||
    typeof dashboard.levelOfPreparation !== "object"
  ) {
    dashboard.levelOfPreparation = {
      starting: { total: 0 },
      basic: { total: 0 },
      intermediate: { total: 0 },
      advanced: { total: 0 },
      expert: { total: 0 },
      graphData: [],
    };
  }

  // Ensure all levels exist in the object
  Object.values(levelsMap).forEach((key) => {
    if (!dashboard.levelOfPreparation[key]) {
      dashboard.levelOfPreparation[key] = { total: 0 };
    }
  });

  // Increment the count for the specified level
  dashboard.levelOfPreparation[levelKey].total += 1;

  // Regenerate graph data
  dashboard.levelOfPreparation.graphData = Object.entries(levelsMapForGraph)
    .map(([key, label]) => ({
      level: label,
      count: dashboard.levelOfPreparation[key]?.total || 0,
    }))
    .filter((item) => item.count !== undefined); // Remove undefined counts

  // Save the updated dashboard
  await dashboard.save();
  console.log("Dashboard updated successfully:", dashboard.levelOfPreparation);

  return dashboard;
};

export const processTasksEfortvsImpact = async (
  dashboardID,
  taskDetails,
  mainTasks
) => {
  console.log(
    "Processing Tasks Effort vs Impact for Dashboard ID:",
    dashboardID
  );

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  // Inicializar la gráfica si no existe
  if (!dashboard.matrixImpactEffort.graphData) {
    dashboard.matrixImpactEffort.graphData = [];
  }

  // Mapeo de valores cualitativos a numéricos (0-100)
  const impactMapping = {
    5: 100, // Alto impacto
    4: 80, // Impacto alto
    3: 50, // Impacto medio
    2: 30,
    1: 20, // Bajo impacto
  };

  const structureLevelMapping = {
    5: 100, // Estructura completa
    4: 80, // Esfuerzo alto
    3: 50, // Esfuerzo medio
    2: 30,
    1: 20, // Menos esfuerzo
  };

  const dataAvailabilityMapping = {
    5: 100, // Datos completos
    4: 80, // Datos disponibles
    3: 50, // Datos medios
    2: 30,
    1: 20,
  };

  const frecuencyMapping = {
    1: "Ad-hoc (≤1 vez/mes)",
    2: "Trimestral",
    3: "Mensual",
    4: "Semanal",
    5: "Diaria",
  };

  // Procesar cada tarea en taskDetails
  const processedTasks = taskDetails.map((task, index) => {
    if (
      !task ||
      !task.frequency ||
      !task.structureLevel ||
      !task.impact ||
      !task.dataAvailability
    ) {
      console.warn(`Skipping task ${index + 1} due to missing data`);
      return null; // Omitir tareas incompletas
    }

    // Calcular Impacto (directo del campo "impact")
    const impact = impactMapping[task.impact] || 50; // Default: 50 (medio)

    // Calcular Esfuerzo (combinando structureLevel + dataAvailability)
    const effortStructure = structureLevelMapping[task.structureLevel] || 50;
    const effortData = dataAvailabilityMapping[task.dataAvailability] || 50;
    const effort = Math.round((effortStructure + effortData) / 2); // Promedio

    return {
      name: mainTasks[index] || `Tarea ${index + 1}`, // Nombre de la tarea
      impact, // Eje X (Impacto)
      effort, // Eje Y (Esfuerzo)
      size: 10, // Tamaño fijo del punto
      frequency: frecuencyMapping[task.frequency] || "No definido",
    };
  });

  //remover null tasks
  const validTasks = processedTasks.filter((task) => task !== null);

  // Actualizar el dashboard con los datos procesados
  dashboard.matrixImpactEffort.graphData.push(...validTasks);
  await dashboard.save();

  return { success: true, data: validTasks };
};
