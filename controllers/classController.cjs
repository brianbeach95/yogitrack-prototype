const Class = require("../models/classModel.cjs");
const { validateNonNegativeNumber } = require("../utils/validationUtils.cjs");
const { generateNextId} = require("../utils/idUtils.cjs");

const possibleTimes = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00",
                       "16:00","17:00","18:00","19:00","20:00"];


exports.getClass = async (req, res) => {
    try {
        const classId = req.query.classId;

        const classDetail = await Class.findOne({
            classId: classId
        });

        res.json(classDetail);

    } catch (e) {
        res.status(400).json({
            error: e.message
        });
    }
};

exports.getClassIds = async (req, res) => {
    try {
        const classes = await Class.find(
            {},
            {classId: 1, instructorId: 1, day: 1, time: 1, _id: 0 }
        ).sort();

        res.json(classes);

    } catch (e) {
        res.status(400).json({
            error: e.message
        });
    }
};


exports.add = async (req, res) => {
    try {
        const {
            instructorId,
            day,
            time,
            classType,
            payRate
        } = req.body;

        if (
            !instructorId ||
            !day ||
            !time ||
            !classType ||
            payRate === undefined
        ) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        if (!validateNonNegativeNumber(payRate)) {
            return res.status(400).json({
                message: "Pay rate must be a non-negative number"
            });
        }

        const existingClasses = await Class.find({
            instructorId,
            day
        });

        const [hours, minutes] = time.split(":").map(Number);
        const requestedMinutes = hours * 60 + minutes;

        //make it so can't conflict occurs if addition is within an hour of another schedule class
        const conflict = existingClasses.find(classItem => {
            const [existingHours, existingMinutes] = classItem.time.split(":").map(Number);

            const existingTotalMinutes = existingHours * 60 + existingMinutes;

            const difference = Math.abs(requestedMinutes - existingTotalMinutes);

            return difference <= 60;
        });

        if (conflict) {
            const bookedTimes = new Set(existingClasses.map(classItem => classItem.time));

            const availableTimes = possibleTimes
                .filter(possibleTime => !bookedTimes.has(possibleTime))
                .slice(0, 3);

            return res.status(409).json({
                message:
                    `This instructor already has a class scheduled at ${conflict.time}. ` +
                    `The requested time must be more than one hour away from another class.`,
                alternatives: availableTimes
            });
        }

        const lastClass = await Class.find({
            classId: /^CL\d+$/
        })
        .sort({ classId: -1 })
        .limit(1);

        const classId = generateNextId(lastClass, "classId","CL");

        const newClass = new Class({
            classId,
            instructorId,
            day,
            time,
            classType,
            payRate
        });

        await newClass.save();

        res.status(201).json({
            message: "Class added successfully",
            class: newClass
        });

    } catch (err) {
        console.error("Error adding class:", err.message);

        res.status(500).json({
            message: "Failed to add class",
            error: err.message
        });
    }
};

exports.getNextId = async (req, res) => {
    try {
        const lastClass = await Class.find({classId: /^CL\d+$/})
        .sort({ classId: -1 })
        .limit(1);

        const nextId = generateNextId(lastClass, "classId","CL");  

        res.json({ nextId });

    } catch (e) {
        res.status(400).json({
            error: e.message
        });
    }
};