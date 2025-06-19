import mongoose from "mongoose";
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

    participationByDepartment: {
      requestAnimationFrameecursosHumanos: {
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
      graphData: { type: Array, default: [] } // Forma más clara para un array vacío
    },
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
