import Evals from "../models/evalsModel.js";
import axios from "axios";

export const createEval = async (req, res) => {
  const { school_name, grade } = req.body;
  try {
    const newEval = new Evals({ school_name, grade, status: "processing" });
    await newEval.save();
    res.status(201).json(newEval);
  } catch (error) {
    res.status(400).json({ message: "Error creating evaluation", error });
  }
};

export const getEvals = async (req, res) => {
  try {
    const evals = await Evals.find();
    res.status(200).json(evals);
  } catch (error) {
    res.status(400).json({ message: "Error fetching evaluations", error });
  }
}

export const processEval = async (req, res) => {
  
  const { evalID } = req.body;

  try {
    // Verifica que la evaluación exista
    const eval2 = await Evals.findById(evalID);

    if (!eval2) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Enviar respuesta inmediata
    res.status(200).json({ message: "Processing evaluation!" });

    // Continua el procesamiento en "background"

    processInBackground(eval2);

  } catch (error) {
    // Si hay un error antes de enviar respuesta, lo enviamos
    res.status(400).json({ message: "Error processing evaluation", error });
  }
};

// Función que realiza el procesamiento después de enviar la respuesta
const processInBackground = async (eval2) => {

  console.log("Processing evaluation in background...");
  try {

    const examsPopulated = await eval2.populate('exams');

    const exams = examsPopulated.exams;

    if (!exams || exams.length === 0) {
      console.log("No exams found for this evaluation");
      return;
    }

    console.log("Exams fetched successfully", exams);

    for (const exam of exams) {
      // Aquí puedes realizar el procesamiento de cada examen
      // Por ejemplo, enviar los datos a un endpoint externo
      const response = await axios.post("http://examevalmicroservice-env.eba-gtg2c6ge.us-east-2.elasticbeanstalk.com/process-image-from-url", {
        url: exam.exam_file_url,
      });

      const exam_result = response.data.exam_result;
      const  exam_section_1 = response.data.exam_result_section_1;

      exam.exam_answers = exam_result;
      exam.exam_section_1 = exam_section_1;
      exam.is_fully_processed = true ? exam_result != false && exam_section_1 != false : false;

      console.log("Response from external API:", response.data);
      await exam.save();
    }

    // Aquí puedes actualizar el estado de la evaluación
    eval2.status = "ready";

    eval2.number_of_failures = exams.filter(exam => exam.is_fully_processed === false).length;
    eval2.number_of_successes = exams.filter(exam => exam.is_fully_processed === true).length;


    eval2.report_eval_url = "https://example.com/report"; // Cambia esto por la URL real del informe

    await eval2.save();
    console.log("Evaluation processed and saved successfully");


  } catch (err) {
    console.error("Error in background processing:", err);
  }
};

