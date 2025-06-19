import { randomBytes } from "crypto";

export const generateSurveyUrl = (companyID) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  return `${baseUrl}/cuestionario/${companyID}/${randomBytes(16).toString(
    "hex"
  )}`;
};
