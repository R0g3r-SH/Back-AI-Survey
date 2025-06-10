
import Grade from "../models/gradeModel.js";

export const createGrade = async (req, res) => {
  const { title, correct_answers } = req.body;

  try {
    const newGrade = new Grade({ title, correct_answers });
    await newGrade.save();
    res.status(201).json(newGrade);
  } catch (error) {
    res.status(400).json({ message: "Error creating grade", error });
  }
};

export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grades", error });
  }
}   

