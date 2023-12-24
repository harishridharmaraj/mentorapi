import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import mentorModel from "./modals/mentor.js";
import studentModel from "./modals/student.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hii");
});
app.get("/mentors", async (req, res) => {
  try {
    const mentor = await mentorModel.find({}, { name: 1, student: 1, _id: 0 });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/students", async (req, res) => {
  try {
    const student = await studentModel.find({});
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------ Write API to Assign a student to Mentor
app.put("/addstudents/:mentorName", async (req, res) => {
  const { mentorName } = req.params;
  const { students } = req.body;

  try {
    const mentor = await mentorModel.findOne({ name: mentorName });

    if (mentor) {
      const studentsToAdd = students.filter(
        (studentName) => !studentName.mentor
      );

      const updatedMentor = await mentorModel.findOneAndUpdate(
        { name: mentorName },
        {
          $push: { student: { $each: studentsToAdd } },
        }
      );

      const updatedStudents = await studentModel.updateMany(
        { name: { $in: studentsToAdd } },
        { mentor: mentorName }
      );

      res.json({ mentor: updatedMentor, students: updatedStudents });
    } else {
      res.status(404).json({ error: "Mentor not found" });
    }
  } catch (error) {
    console.error("Error adding students:", error);
    res.status(500).json({ error: "Error adding students" });
  }
});

// ------------------ Write API to Assign or Change Mentor for particular Student
app.put("/changementor/:name", async (req, res) => {
  const { name } = req.params;
  const { mentor } = req.body;
  const student = await studentModel.find({ name: name });
  const currentMentor = student[0].mentor;
  const mentors = await mentorModel.find({ name: mentor });
  const newMentor = mentors[0];
  if (newMentor) {
    if (currentMentor) {
      const updatedStudent = await studentModel.findOneAndUpdate(
        { name: name },
        {
          previousmentor: currentMentor,
          mentor: mentor,
        }
      );
      const removeStudent = await mentorModel.findOneAndUpdate(
        { name: currentMentor },
        {
          $pull: { student: name },
        }
      );
      const addStudent = await mentorModel.findOneAndUpdate(
        { name: mentor },
        {
          $push: { student: name },
        }
      );
      res.send(student);
    } else {
      const updatedStudent = await studentModel.findOneAndUpdate(
        { name: name },
        {
          mentor: mentor,
        }
      );
      const addStudent = await mentorModel.findOneAndUpdate(
        { name: mentor },
        {
          $push: { student: name },
        }
      );

      res.send(student);
    }
  } else {
    res.send("Create a Mentor, then assign it to student");
  }
});

// ---------- Write an API to show the previously assigned mentor for a particular student.
app.get("/students/:name", async (req, res) => {
  const { name } = req.params;
  const student = await studentModel.findOne(
    { name: name },
    { name: 1, previousmentor: 1, _id: 0 }
  );
  if (student.previousmentor) {
    res.json(student);
  } else {
    res.send("Previous Mentor is not Found");
  }
});

// -------- Write API to show all students for a particular mentor
app.get("/mentors/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const mentor = await mentorModel.findOne({ name: name });
    if (mentor.name == name) {
      res.json(mentor);
    } else {
      res.send("Mentor Not Found");
    }
  } catch (error) {
    res.status(500).json({ error: "Error Fetching Mentor Details" });
  }
});
// ------------ Write API to create Mentor
app.post("/creatementor", async (req, res) => {
  try {
    const mentor = await mentorModel.create(req.body);
    res.json(mentor);
  } catch (error) {
    console.error("Error in creating Mentor Data:", error);
    res.status(500).json({ error: "Error in creating Mentor Data" });
  }
});
// ------------ Write API to create Student
app.post("/createstudent", async (req, res) => {
  try {
    const student = await studentModel.create(req.body);
    res.json(student);
  } catch (error) {
    console.error("Error in creating Student Data:", error);
    res.status(500).json({ error: "Error in creating Student Data" });
  }
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO DB is Connected");
  })
  .catch((error) => {
    console.log("Mongo Connection Error", error);
  });

app.listen(3000, () => {
  console.log("Port is started on 3000");
});
