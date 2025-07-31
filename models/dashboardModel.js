import mongoose, { Mongoose } from "mongoose";
const { Schema } = mongoose;

const dashboardSchema = new Schema(
  {
    // Información de empresa
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    section1: {
      totalAnswers: { type: Number, required: true, default: 0 },
      automationPotential: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      numberUseCases: { type: Number, required: true, default: 0 },
      ROI: { type: Number, required: false },
    },
    totalAIMaturitySection: {
      aiknowledge: {
        basicKnowledge: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        promts: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        integration: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        riskAssessment: {
          data: [{ type: Number }], // specify the type of elements in the array
          
          mean: { type: Number, required: true, default: 0 },
        },
        frequency: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },

        mean: { type: Number, required: true, default: 0 },
      },
      culture: {
        curiosity: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        caution: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        resistance: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        mean: { type: Number, required: true, default: 0 },
      },
      aiEthichsandGovernance: {
        poltics: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        dataGovernance: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        security: {
          data: [{ type: Number }], // specify the type of elements in the array
          mean: { type: Number, required: true, default: 0 },
        },
        mean: { type: Number, required: true, default: 0 },
      },
    },

    participationByDepartment: {
      rh: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      finanzas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      marketing: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      ventas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      it: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      operaciones: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      legal: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      compras: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      atencionclientes: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      otro: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
        total: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    totalAIMaturityByDepartment: {
      rh: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      finanzas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      marketing: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      ventas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      it: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      operaciones: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      legal: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      compras: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      atencionclientes: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      otro: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] },
    },

    taskTypeData: {
      documentation: {
        total: { type: Number, required: true, default: 0 },
      },
      communication: {
        total: { type: Number, required: true, default: 0 },
      },
      analysis: {
        total: { type: Number, required: true, default: 0 },
      },
      creativity: {
        total: { type: Number, required: true, default: 0 },
      },
      management: {
        total: { type: Number, required: true, default: 0 },
      },
      reports: {
        total: { type: Number, required: true, default: 0 },
      },

      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    participationClusters: {
      //Analistas de Datos e Información
      analistasDeDatosEInformacion: {
        count: { type: Number, required: true, default: 0 },
        departments: [{ type: String }],
      },
      ///Constructores de Documentos y Contenido
      constructoresDeDocumentosYContenido: {
        count: { type: Number, required: true, default: 0 },
        departments: [{ type: String }],
      },
      //Integradores y Optimizadores de Procesos
      integradoresYOptimizadoresDeProcesos: {
        count: { type: Number, required: true, default: 0 },
        departments: [{ type: String }],
      },
      //Comunicadores y Difusores de Información
      comunicadoresYDifusoresDeInformacion: {
        count: { type: Number, required: true, default: 0 },
        departments: [{ type: String }],
      },
      //Gestores de Estrategia y Decisión
      gestoresDeEstrategiaYDecision: {
        count: { type: Number, required: true, default: 0 },
        departments: [{ type: String }],
      },
    },

    totalAIMaturityByClusters: {
      analistasDeDatosEInformacion: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      ///Constructores de Documentos y Contenido
      constructoresDeDocumentosYContenido: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      //Integradores y Optimizadores de Procesos
      integradoresYOptimizadoresDeProcesos: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      //Comunicadores y Difusores de Información
      comunicadoresYDifusoresDeInformacion: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      //Gestores de Estrategia y Decisión
      gestoresDeEstrategiaYDecision: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },

      heatmapGraph: {
        type: Array,
        default: [], // Forma más clara para un array vacío
      }, // Accepts any structure (object, array, primitive)
    },

    aiCultureByDepartment: {
      rh: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      finanzas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      marketing: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      ventas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      it: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      operaciones: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      legal: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      compras: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      atencionclientes: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      otro: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    aiknowledgeByDepartment: {
      rh: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      finanzas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      marketing: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      ventas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      it: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      operaciones: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      legal: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      compras: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      atencionclientes: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      otro: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    aiEthichsandGovernanceByDepartment: {
      rh: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      finanzas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      marketing: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      ventas: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      it: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      operaciones: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      legal: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      compras: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      atencionclientes: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      otro: {
        data: [{ type: Number }], // specify the type of elements in the array
        mean: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    levelOfPreparation: {
      starting: {
        total: { type: Number, required: true, default: 0 },
      },
      basic: {
        total: { type: Number, required: true, default: 0 },
      },
      intermediate: {
        total: { type: Number, required: true, default: 0 },
      },
      advanced: {
        total: { type: Number, required: true, default: 0 },
      },
      expert: {
        total: { type: Number, required: true, default: 0 },
      },
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    matrixImpactEffort: {
      graphData: { type: Array, default: [] }, // Forma más clara para un array vacío
    },

    analysisAndClustering: {
      report: {
        main_recommendation: { type: String, required: false, default: "" },
        expected_impact: { type: String, required: false, default: "" },
      },
    },

    recomendations: {
      roadmap: {
        type: mongoose.Schema.Types.Mixed, // Accepts any structure (object, array, primitive)
        default: {}, // Optional: starts as an empty object
      },
      training: {
        type: mongoose.Schema.Types.Mixed, // Accepts any structure (object, array, primitive)
        default: {}, // Optional: starts as an empty object
      },
      techStack: {
        type: mongoose.Schema.Types.Mixed, // Accepts any structure (object, array, primitive)
        default: {}, // Optional: starts as an empty object
      },
    },
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
