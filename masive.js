import axios from 'axios';
import { promises as fs } from 'fs';

const API_URL = 'http://localhost:3000/api/surveys/create-survey';
const COMPANY_ID = '688ac963b4919621313ceb3e';
const DELAY_MS = 5000; // 1 segundo

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendSurveys() {
  try {
    const rawData = await fs.readFile('./surveys.json', 'utf-8');
    const surveyArray = JSON.parse(rawData);

    for (const originalSurvey of surveyArray) {
      // Agregar campos requeridos
      const survey = {
        ...originalSurvey,
        companyName: COMPANY_ID,
        companySlug: COMPANY_ID
      };

      const payload = {
        survey,
        company_id: COMPANY_ID
      };

      try {
        const response = await axios.post(API_URL, payload);
        console.log(`✅ Survey sent for ${survey.name} - Status: ${response.status}`);
      } catch (error) {
        console.error(`❌ Error sending survey for ${survey.name}:`, error.response?.data || error.message);
      }

      await sleep(DELAY_MS); // Delay entre cada envío
    }
  } catch (err) {
    console.error('💥 Error reading or parsing surveys.json:', err.message);
  }
}

sendSurveys();
