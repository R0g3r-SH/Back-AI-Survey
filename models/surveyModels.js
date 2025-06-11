import mongoose from "mongoose";
const { Schema } = mongoose;

const taskDetailSchema = new Schema({
  frequency: String,
  structureLevel: String,
  impact: String,
  dataAvailability: String,
}, { _id: false });

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

  // Inventario de tareas
  mainTasks: {
    type: [String], // array of 5 tasks
    default: ["", "", "", "", ""],
  },
  applicationsUsed: {
    type: [String],
    default: [],
  },

  // Viabilidad de automatización para cada tarea
  taskDetails: {
    type: [taskDetailSchema],
    default: [
      { frequency: "", structureLevel: "", impact: "", dataAvailability: "" },
      { frequency: "", structureLevel: "", impact: "", dataAvailability: "" },
      { frequency: "", structureLevel: "", impact: "", dataAvailability: "" },
      { frequency: "", structureLevel: "", impact: "", dataAvailability: "" },
      { frequency: "", structureLevel: "", impact: "", dataAvailability: "" }
    ],
  },

  // Tareas actuales
  dailyTasks: String,
  timeConsumingTasks: String,
  repetitiveTasks: String,

  // Conocimiento en IA
  aiKnowledge: String,
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

  // Roadmap de adopción
  trainingTime: String,
  trainingFormats: {
    type: [String],
    default: [],
  },

  // Created at
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;
