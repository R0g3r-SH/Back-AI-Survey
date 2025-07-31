import mongoose from "mongoose";
const { Schema } = mongoose;


const taskDetailSchema = new Schema(
  {
    frequency: String,
    structureLevel: String,
    impact: String,
    dataAvailability: String,
    kpiImpact: String,
    severityImpact: String,
    automationPriority: String,
    timeSaved: String,
    implementationComplexity: String,

  },
  { _id: false }
);

const surveySchema = new Schema({
  // Información de empresa (nuevo)
  companyName: {
    type: String,
    default: "",
  },
  companySlug: {
    type: String,
    default: "",
  },

  // Información personal
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  department: String,
  role: String,
  experience: String,
  totalExperience: String,

  // Inventario de tareas
  mainTasks: {
    type: [String], // array of 5 tasks
    default: ["", "", "", "", ""],
  },
  applicationsUsed: {
    type: [String],
    default: [],
  },

  otherToolText: String,

  // Viabilidad de automatización para cada tarea
  taskDetails: {
    type: [taskDetailSchema],
    default: [
      {
        frequency: "",
        structureLevel: "",
        impact: "",
        dataAvailability: "",
        kpiImpact: "",
        severityImpact: "",
        automationPriority: "",
        timeSaved: "",
        implementationComplexity: "",
      },
      {
        frequency: "",
        structureLevel: "",
        impact: "",
        dataAvailability: "",
        kpiImpact: "",
        severityImpact: "",
        automationPriority: "",
        timeSaved: "",
        implementationComplexity: "",
      },
      {
        frequency: "",
        structureLevel: "",
        impact: "",
        dataAvailability: "",
        kpiImpact: "",
        severityImpact: "",
        automationPriority: "",
        timeSaved: "",
        implementationComplexity: "",
      },
      {
        frequency: "",
        structureLevel: "",
        impact: "",
        dataAvailability: "",
        kpiImpact: "",
        severityImpact: "",
        automationPriority: "",
        timeSaved: "",
        implementationComplexity: "",
      },
      {
        frequency: "",
        structureLevel: "",
        impact: "",
        dataAvailability: "",
        kpiImpact: "",
        severityImpact: "",
        automationPriority: "",
        timeSaved: "",
        implementationComplexity: "",
      },
    ],
  },

  trainingTime: String,
  trainingFormats: {
    type: [String],
    default: [],
  },

  aiCuriosity: Number,
  aiResistance: Number,
  aiBasicKnowledge: Number,
  aiKnowledgePromptDesign: Number,
  aiKnowledgeIntegration: Number,
  aiKnowledgeRiskAssessment: Number,
  aiKnowledgeUsageFrequency: Number,
  aiPolicy: Number,
  aiDataGovernance: Number,
  aiCaution: Number,
  aiSecurityPrivacy: Number,
  AI_learning_motivation: Number,
  AI_learning_motivation_other: String,
  AI_learning_leader_support: Number,
  
  toolsUsed: {
    type: [String],
    default: [],
  },

  // Casos de uso específicos
  documentTasks: {
    type: [String],
    default: [],
  },
  communicationTasks: {
    type: [String],
    default: [],
  },
  analysisTasks: {
    type: [String],
    default: [],
  },
  creativeTasks: {
    type: [String],
    default: [],
  },

  // Evaluación de impacto
  taskPriority: String,
  automationBenefit: String,
  implementationComplexity: String,

  // Created at
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;
