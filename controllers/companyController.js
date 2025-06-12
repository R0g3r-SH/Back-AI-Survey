import Company from "../models/companyModel.js";

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find(); // Populate surveys with specific fields
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).populate('surveys');

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
