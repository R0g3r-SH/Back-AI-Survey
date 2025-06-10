import AWS from "aws-sdk";
import multer from "multer";

import Exam from "../models/examModel.js";
import Evals from '../models/evalsModel.js';  // Ensure correct relative path and .js extension


// Initialize the S3 service
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Function to upload a file to S3
const uploadToS3 = async (file, evalID) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Formato seguro para nombre de archivo

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `eval_${evalID}/${timestamp}_${file.originalname}`, // Agrega timestamp al nombre
    Body: file.buffer,
    ContentType: 'image/jpeg',
    ResponseContentDisposition: 'inline',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    throw new Error("Error uploading file to S3: " + error.message);
  }
};

const uploadCSVToS3 = async (file, evalID) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `eval_${evalID}/${file.originalname}`, // Use evalID to create a folder structure
    Body: file.buffer,
     ContentType: 'text/csv',
    ResponseContentDisposition: 'inline',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return file URL
  } catch (error) {
    throw new Error("Error uploading file to S3: " + error.message);
  }
};

// File upload handler
export const uploadFileS3 = async (req, res) => {
  const { evalID } = req.body; // evalID comes from body
  const file = req.file; // The file comes from the 'file' field in FormData

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Fetch the evaluation by ID
    const eval2 = await Evals.findById(evalID);
    if (!eval2) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Upload the file to S3 under the folder for the specific evalID
    const fileUrl = await uploadToS3(file, evalID);

    // Save the file URL to the exam model
    const newExam = new Exam({ exam_file_url: fileUrl });
    await newExam.save();

    // Add the exam to the evaluation
    eval2.exams.push(newExam._id);
    await eval2.save();

    res.status(201).json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error uploading file", error: error.message });
  }
};

export const uploadCSVFile = async (req, res) => {
  const { evalID } = req.body; // evalID comes from body
  const file = req.file; // The file comes from the 'file' field in FormData

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Check if the file is a CSV
  if (!file.mimetype.includes("csv")) {
    return res.status(400).json({ message: "File is not a CSV" });
  }

  try {
    // Fetch the evaluation by ID
    const eval2 = await Evals.findById(evalID);
    if (!eval2) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Upload the file to S3 under the folder for the specific evalID
    const fileUrl = await uploadCSVToS3(file, evalID);

    // Save the file URL to the exam model
    const newExam = new Exam({ exam_file_url: fileUrl });
    await newExam.save();

    // Add the exam to the evaluation
    eval2.exams.push(newExam._id);
    await eval2.save();

    res.status(201).json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error uploading file", error: error.message });
  }
};

