const Instructor = require("../models/instructorModel.cjs");
const { generateNextId } = require("../utils/idUtils.cjs");
const {formatName, formatPhone, validateEmail } = require("../utils/validationUtils.cjs")

exports.search = async (req, res) => {
  try {
    const searchString = req.query.firstName;
    const instructor = await Instructor.find({
      firstName: { $regex: searchString, $options: "i" },
    });

    if (!instructor || instructor.length == 0) {
      return res.status(404).json({ message: "No instructor found" });
    } else {
      res.json(instructor[0]);
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

//Find the package selected in the dropdown
exports.getInstructor = async (req, res) => {
  try {
    const instructorId = req.query.instructorId;
    const instructorDetail = await Instructor.findOne({ instructorId: instructorId });

    res.json(instructorDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      instructorId,
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredCommunication
    } = req.body;

    // Basic validation
    if (!instructorId || !firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
        return res.status(400).json({
            message: "All instructor fields are required."
        });
    }

    if (address.trim().length < 5) {
        return res.status(400).json({
            message: "Address must contain at least 5 characters."
        });
    }

    if (!validateEmail(email.trim())) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);

    if (phone.replace(/\D/g, "").length !== 10) {
      return res.status(400).json({
          message: "Phone number must contain 10 digits."
    });
}
    const formattedPhone = formatPhone(phone);

    const existingInstructor = await Instructor.findOne({
        firstName: {
            $regex: `^${firstName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
        },
        lastName: {
            $regex: `^${lastName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
        }
    });

    if (existingInstructor && req.body.confirmDuplicate !== true) {
        return res.status(409).json({
            message: "An instructor with this name already exists.",
            duplicate: true,
            existingInstructorId: existingInstructor.instructorId
        });
    }

    // Create a new instructor document
    const newInstructor = new Instructor({
      instructorId,
      firstName: formattedFirstName,
      lastName: formattedLastName,
      address: address.trim(),
      phone: formattedPhone,
      email: email.trim(),
      preferredCommunication
    });

    // Save to database
    await newInstructor.save();
    res.status(201).json({ message: "Instructor added successfully", instructor: newInstructor });
  } catch (err) {
    console.error("Error adding instructor:", err.message);
    res.status(500).json({ message: "Failed to add instructor", error: err.message });
  }
};

//Populate the instructorId dropdown
exports.getInstructorIds = async (req, res) => {
  try {
    const instructors = await Instructor.find(
      {},
      { instructorId: 1, firstName: 1, lastName: 1, _id: 0 }
    ).sort();

    res.json(instructors);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getNextId = async (req, res) => {
    try {
        const lastInstructor = await Instructor.find({
            instructorId: /^I\d+$/
        })
            .sort({ instructorId: -1 })
            .limit(1);

        const nextId = generateNextId(
            lastInstructor,
            "instructorId",
            "I"
        );

        res.json({ nextId });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate instructor ID",
            error: error.message
        });
    }
};

exports.deleteInstructor = async (req, res) => {
  try {
     const { instructorId } = req.body;
     const result = await Instructor.findOneAndDelete({ instructorId });
     if (!result) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.json({ message: "Instructor deleted", instructorId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//update/modify
exports.updateInstructor = async (req, res) => {
  try {
    const {
      instructorId,
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredCommunication
    } = req.body;

    // Basic validation
    if (!instructorId || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const updatedInstructor = await Instructor.findOneAndUpdate(
      { instructorId },
      {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        address: address.trim(),
        phone: formattedPhone,
        email: email.trim(),
        preferredCommunication
      },
      { new: true, runValidators: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({
        message: "Instructor not found"
      });
    }

    res.json({
      message: "Instructor updated successfully",
      instructor: updatedInstructor
    });

  } catch (err) {
    console.error("Error updating instructor:", err.message);

    res.status(500).json({
      message: "Failed to update instructor",
      error: err.message
    });
  }
};