import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { promisify } from "util";
import Company from "../models/companyModel.js";

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(
      `File received: ${req.file.originalname}, Size: ${req.file.size} bytes`
    );

    if (req.file.size > 5 * 1024 * 1024) {
      await unlink(req.file.path);
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }

    const companyId = req.body.companyId;
    if (!companyId) {
      await unlink(req.file.path);
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Get company details from database
    const company = await Company.findById(companyId);
    if (!company) {
      await unlink(req.file.path);
      return res.status(404).json({ error: "Company not found" });
    }

    // Immediately respond that processing has started
    res.status(202).json({
      message: "CSV processing started",
      processingId: req.file.filename,
    });

    // Process CSV in background
    processCSV(req.file.path, company)
      .then(() => console.log("Processing completed successfully"))
      .catch(async (err) => {
        console.error("Processing error:", err);
        await unlink(req.file.path).catch((e) =>
          console.error("Error deleting file:", e)
        );
      });
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file) {
      await unlink(req.file.path).catch((e) =>
        console.error("Error deleting file:", e)
      );
    }
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

async function processCSV(filePath, company) {
  return new Promise((resolve, reject) => {
    const results = [];
    const batchSize = 50;
    let currentBatch = [];

    console.log(`Starting CSV processing for file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found at path: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        try {
          // Normalize keys to lowercase for case-insensitive matching
          const normalizedData = {};
          Object.keys(data).forEach((key) => {
            normalizedData[key.toLowerCase()] = data[key];
          });

          if (normalizedData.email && normalizedData.nombre) {
            results.push(normalizedData);
            currentBatch.push(normalizedData);

            if (currentBatch.length >= batchSize) {
              sendBatchEmails([...currentBatch], company).catch((err) =>
                console.error("Error in batch email sending:", err)
              );
              currentBatch = [];
            }
          } else {
            console.warn("Skipping row - missing required fields:", data);
          }
        } catch (parseError) {
          console.error("Error parsing row:", data, parseError);
        }
      })
      .on("end", async () => {
        try {
          // Process remaining emails in the last batch
          if (currentBatch.length > 0) {
            await sendBatchEmails(currentBatch, company);
          }

          console.log(`Successfully processed ${results.length} records`);
          await unlink(filePath);

          // Notify responsible user if contact_email exists
          if (company.contact_email) {
            await sendCompletionNotification(company, results.length);
          }

          resolve(results);
        } catch (endError) {
          reject(endError);
        }
      })
      .on("error", async (error) => {
        console.error("CSV processing stream error:", error);
        try {
          await unlink(filePath);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
        reject(error);
      });
  });
}

async function sendCompletionNotification(company, totalSent) {
  const mailOptions = {
    from: `"Survey System" <${process.env.EMAIL_USER}>`,
    to: company.contact_email,
    subject: `Envío masivo de encuestas completado para ${company.name}`,
    html: `
        <p>Hola,</p>
        <p>El envío masivo de encuestas para la empresa ${
          company.name
        } ha sido completado exitosamente.</p>
        <p>Total de encuestas enviadas: ${totalSent}</p>
        <p>Fecha de finalización: ${new Date().toLocaleString()}</p>
        <p>Este es un mensaje automático, por favor no responder.</p>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Completion notification sent to ${company.contact_email}`,
      info.messageId
    );
    return { success: true, email: company.contact_email };
  } catch (error) {
    console.error(
      `Failed to send completion notification to ${company.contact_email}:`,
      error
    );
    throw {
      success: false,
      email: company.contact_email,
      error: error.message,
    };
  }
}

async function sendBatchEmails(batch, company) {
  try {
    const results = await Promise.allSettled(
      batch.map((contact) => sendEmail(contact, company))
    );

    // Log failed emails
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to send email to ${result.reason.email}:`,
          result.reason.error
        );
      }
    });

    return results;
  } catch (error) {
    console.error("Batch email error:", error);
    throw error;
  }
}

async function sendEmail(contact, company) {

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("es-ES", options);
  };

  const formattedDate = formatDate(company.invitationDate);

  const mailOptions = {
    from: `"Survey System" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: `¡Tu opinión cuenta! ‒ Completa el Cuestionario de Automatización de tareas y conocimiento de IA antes del ${formattedDate}`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 20px; border-radius: 0.5rem 0.5rem 0 0; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 1.5rem; font-weight: 600; margin: 0;">¡Tu opinión cuenta!</h1>
          <p style="font-size: 1rem; opacity: 0.9; margin: 8px 0 0;">Completa el Cuestionario de Automatización antes del ${formattedDate}</p>
        </div>
        
        <p style="font-size: 1rem; color: #374151; margin-bottom: 16px;">Hola ${contact.nombre},</p>
        
        <p style="font-size: 1rem; color: #374151; margin-bottom: 16px;">En ${company.name} estamos diseñando un plan integral para:</p>
        
        <ol style="font-size: 1rem; color: #374151; margin-bottom: 16px; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Detectar las tareas rutinarias que hoy consumen más tiempo y</li>
          <li style="margin-bottom: 8px;">Entender nuestro nivel de conocimiento y uso de herramientas de Inteligencia Artificial (IA) que podrían automatizarlas.</li>
        </ol>
        
        <p style="font-size: 1rem; color: #374151; margin-bottom: 16px;">Para lograrlo, necesitamos tu perspectiva. Te pedimos que completes el siguiente cuestionario confidencial antes del <strong style="color: #7C3AED;">${formattedDate}</strong>:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${company.survey_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 12px 24px; border-radius: 0.5rem; text-decoration: none; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);">👉 Enlace al cuestionario</a>
        </div>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 0.5rem; margin-bottom: 20px; border-left: 4px solid #8B5CF6;">
          <h2 style="font-size: 1.125rem; font-weight: 600; color: #7C3AED; margin-top: 0; margin-bottom: 12px;">¿Por qué es importante?</h2>
          <ul style="font-size: 1rem; color: #374151; margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">No es una evaluación de desempeño. Buscamos un "estado de salud" realista de nuestros procesos y habilidades.</li>
            <li style="margin-bottom: 8px;">Con tus respuestas diseñaremos rutas de capacitación personalizadas, seleccionaremos las tareas con mayor beneficio de automatización y definiremos un roadmap de IA que facilite tu trabajo diario.</li>
            <li style="margin-bottom: 0;">Sólo tomará 10-12 minutos y tus datos se analizarán de forma agregada.</li>
          </ul>
        </div>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 0.5rem; margin-bottom: 20px; border-left: 4px solid #8B5CF6;">
          <h2 style="font-size: 1.125rem; font-weight: 600; color: #7C3AED; margin-top: 0; margin-bottom: 12px;">¿Cómo responder?</h2>
          <ol style="font-size: 1rem; color: #374151; margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Sé sincero: la precisión de las próximas iniciativas depende de ello.</li>
            <li style="margin-bottom: 8px;">Marca "No aplica" o "No sé" cuando corresponda; evitar suposiciones mejora el análisis.</li>
            <li style="margin-bottom: 0;">Si surgen dudas, escribe a <a href="mailto:${company.contact_email}" style="color: #7C3AED; text-decoration: underline;">${company.contact_email}</a>.</li>
          </ol>
        </div>
        
        <p style="font-size: 1rem; color: #374151; margin-bottom: 16px;">Agradecemos de antemano tu tiempo y colaboración para construir una empresa más eficiente e innovadora. ¡Contamos contigo!</p>
        
        <p style="font-size: 1rem; color: #374151; margin-bottom: 0;">Saludos cordiales.</p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 0.875rem; color: #6b7280;">
          <p style="margin: 0;">Equipo de ${company.name}</p>
        </div>
      </div>
    `,
};

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${contact.email}`, info.messageId);
    return { success: true, email: contact.email };
  } catch (error) {
    console.error(`Failed to send email to ${contact.email}:`, error);
    throw { success: false, email: contact.email, error: error.message };
  }
}
