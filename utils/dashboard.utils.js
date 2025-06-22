import Dashboard from "../models/dashboardModel.js";

import {getTaskType} from "./ai.utils.js";

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

// Función principal mejorada
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

    const department = dashboard.participationByDepartment[dbDepartmentKey];

    // Actualizar los datos del departamento
    department.data.push(score);
    department.total = department.data.length;
    department.mean =
      department.data.reduce((sum, val) => sum + val, 0) /
      department.data.length;

    // Actualizar los datos de la gráfica
    updateGraphData(dashboard, departmentName, department.mean);

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
      automation: parseFloat(score.toFixed(2))
    });
  }

  // Opcional: Ordenar por número de respuestas (mayor a menor)
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
    reports: "Reportes"
  };

  const colorMap = {
    documentation: "#8884d8",
    communication: "#82ca9d",
    analysis: "#ffc658",
    creativity: "#ff7300",
    management: "#d0ed57",
    reports: "#ffbb28"
  };

  // Acumular tareas por tipo
  for (const task of tasks) {
    try {
      const taskType = await getTaskType(task);
      const taskTypeKey = taskType.toLowerCase().replace(/\s+/g, '_');

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
    if (typeof data.total !== 'number') continue;

    dashboard.taskTypeData.graphData.push({
      name: tasksMap[key] || key,
      value: getPercentageByDepartment(dashboard.taskTypeData, key),
      color: colorMap[key] || "#000000"
    });
  }

  await dashboard.save();
  console.log("Dashboard updated successfully.");
};

function getPercentageByDepartment(taskTypeData, type) {
  const totalTasks = Object.values(taskTypeData).reduce((sum, t) => sum + (t.total || 0), 0);
  const percentage = totalTasks > 0 ? (taskTypeData[type].total / totalTasks) * 100 : 0;
  return parseFloat(percentage.toFixed(2));
}

export const processLevelOfPreparation = async (dashboardID, level) => {
  console.log("Processing Level of Preparation for Dashboard ID:", dashboardID);

  const dashboard = await Dashboard.findById(dashboardID);
  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  const levelsMap = {
    principiante: "starting",
    basico: "basic",
    intermedio: "intermediate",
    avanzado: "advanced",
    experto: "expert" 
  };

  const levelsMapForGraph = {
    starting: "Principiante",
    basic: "Básico",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto"
  };



  // Acumular niveles de preparación
  if (!dashboard.levelOfPreparation[levelsMap[level]]) {
    dashboard.levelOfPreparation[levelsMap[level]] = { total: 0 };
  }
  dashboard.levelOfPreparation[levelsMap[level]].total += 1;

  // Regenerar toda la gráfica desde cero

  dashboard.levelOfPreparation.graphData = [];
  for (const [key, data] of Object.entries(dashboard.levelOfPreparation)) {
    // Saltar si no tiene total válido
    if (typeof data.total !== 'number') continue; 

    dashboard.levelOfPreparation.graphData.push({
      level: levelsMapForGraph[key] || key,
      count: data.total,
    });
  }


  await dashboard.save();
  console.log("Dashboard updated successfully.");
};


export const processTasksEfortvsImpact = async (dashboardID, taskDetails ,mainTasks) => {
  console.log("Processing Tasks Effort vs Impact for Dashboard ID:", dashboardID);

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
    "alto": 75,
    "medio": 50,
    "bajo": 25
  };

  const structureLevelMapping = {
    "no-estructurada": 70,   // Más esfuerzo
    "parcial": 50,
    "estructurada": 30       // Menos esfuerzo
  };

  const dataAvailabilityMapping = {
    "no": 60,                // Más esfuerzo (falta de datos)
    "parcial": 40,
    "si": 20                 // Menos esfuerzo (datos disponibles)
  };

  // Procesar cada tarea en taskDetails
  const processedTasks = taskDetails.map((task, index) => {
    // Calcular Impacto (directo del campo "impact")
    const impact = impactMapping[task.impact] || 50; // Default: 50 (medio)

    // Calcular Esfuerzo (combinando structureLevel + dataAvailability)
    const effortStructure = structureLevelMapping[task.structureLevel] || 50;
    const effortData = dataAvailabilityMapping[task.dataAvailability] || 50;
    const effort = Math.round((effortStructure + effortData) / 2); // Promedio

    return {
      name: mainTasks[index] || `Tarea ${index + 1}`, // Nombre de la tarea
      impact,  // Eje X (Impacto)
      effort,  // Eje Y (Esfuerzo)
      size: 10,  // Tamaño fijo del punto
      frequency: task.frequency // Opcional: para tooltips/filtros
    };
  });

  // Actualizar el dashboard con los datos procesados
  dashboard.matrixImpactEffort.graphData.push(...processedTasks);
  await dashboard.save();

  return { success: true, data: processedTasks };
};