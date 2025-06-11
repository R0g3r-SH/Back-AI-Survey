import mongoose from "mongoose";
import Survey from "./surveyModels.js"; // Importing Survey model to reference in Company model
const { Schema } = mongoose;

const companySchema = new Schema({
    name: {
        type: String,
        required: false, // Optional for now, can be set later
    },
    surveys: [{
        type: Schema.Types.ObjectId,
        ref: "Survey"
    }],
    survey_url: {
        type: String,
        required: false,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

const Company = mongoose.model("Company", companySchema);
export default Company;
