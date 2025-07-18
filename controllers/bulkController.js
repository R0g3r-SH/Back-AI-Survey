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
  const mailOptions = {
    from: `"Survey System" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: `Encuesta para ${company.name}`,
    html: `
      <p>Hola ${contact.nombre},</p>
      <p>Por favor completa nuestra encuesta:</p>
      <p><a href="${company.survey_url}">Haz clic aquí para acceder a la encuesta</a></p>
      <p>Gracias por tu participación.</p>
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
