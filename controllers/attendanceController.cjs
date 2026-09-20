const Attendance = require("../models/attendanceModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Class = require("../models/classModel.cjs");
const Sale = require("../models/saleModel.cjs");
const Package = require("../models/packageModel.cjs");

const { generateNextId } = require("../utils/idUtils.cjs");

exports.getNextId = async (req, res) => {
    try {
        const lastAttendance = await Attendance.find({
            attendanceId: /^A\d+$/
        })
        .sort({ attendanceId: -1 })
        .limit(1);

        const nextId = generateNextId(
            lastAttendance,
            "attendanceId",
            "A"
        );

        res.json({ nextId });

    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.add = async (req, res) => {
    try {
        const {
            classId,
            customerId,
            attendanceDateTime
        } = req.body;

        if (!classId || !customerId || !attendanceDateTime) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const classItem = await Class.findOne({ classId });

        if (!classItem) {
            return res.status(404).json({
                message: "Class not found"
            });
        }

        const customer = await Customer.findOne({ customerId });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const attendanceDate = new Date(attendanceDateTime);

        if (isNaN(attendanceDate.getTime())) {
            return res.status(400).json({
                message: "Invalid attendance date/time"
            });
        }

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday","Friday","Saturday"];

        const attendanceDay = days[attendanceDate.getDay()];

        if (attendanceDay !== classItem.day) {
            return res.status(400).json({
                message:
                    `This class is scheduled for ${classItem.day}, not ${attendanceDay}.`
            });
        }

        const [scheduledHours, scheduledMinutes] =
            classItem.time.split(":").map(Number);

        const scheduledDateTime = new Date(attendanceDate);

        scheduledDateTime.setHours(
            scheduledHours,
            scheduledMinutes,
            0,
            0
        );

        const twoHours = 2 * 60 * 60 * 1000;

        const difference = Math.abs(
            attendanceDate.getTime() -
            scheduledDateTime.getTime()
        );

        if (difference > twoHours) {
            return res.status(400).json({
                message:
                    `Check-in must be within 2 hours of the scheduled class time (${classItem.time}).`
            });
        }

        const oneHour = 60 * 60 * 1000;

        const startTime = new Date(attendanceDate.getTime() - oneHour);
        const endTime = new Date(attendanceDate.getTime() + oneHour);

        const existingAttendance = await Attendance.findOne({
            classId,
            customerId,
            attendanceDateTime: {
                $gte: startTime,
                $lte: endTime
            }
        });

        if (existingAttendance) {
            return res.status(409).json({
                message:
                    "Customer is already checked in for this class within one hour"
            });
        }

        // Look for an active Unlimited package
        const startOfDay = new Date(attendanceDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(attendanceDate);
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.find({
            customerId,
            validityStartDate: { $lte: endOfDay },
            validityEndDate: { $gte: startOfDay }
        });
        
        let hasUnlimitedPackage = false;

        for (const sale of sales) {
            const packageItem = await Package.findOne({
                packageId: sale.packageId
            });

            if (packageItem && packageItem.numberOfClasses === "Unlimited") {
                hasUnlimitedPackage = true;
                break;
            }
        }

        //don't allow if no class balance
        if (!hasUnlimitedPackage && customer.classBalance <= 0) {
            return res.status(400).json({
                message:
                    "Customer has no remaining class balance. Please purchase a new package before checking in."
            });
        }

        // Generate Attendance ID
        const lastAttendance = await Attendance.find({
            attendanceId: /^A\d+$/
        })
        .sort({ attendanceId: -1 })
        .limit(1);

        const attendanceId = generateNextId(
            lastAttendance,
            "attendanceId",
            "A"
        );

        const newAttendance = new Attendance({
            attendanceId,
            classId,
            customerId,
            attendanceDateTime
        });

        await newAttendance.save();

        // for unlimited customers
        if (!hasUnlimitedPackage) {
            customer.classBalance -= 1;
            await customer.save();
        }

        res.status(201).json({
            message: "Check-in recorded successfully",
            attendance: newAttendance,
            classBalance: customer.classBalance,
            unlimited: hasUnlimitedPackage
        });

    } catch (err) {
        console.error("Error recording check-in:", err.message);

        res.status(500).json({
            message: "Failed to record check-in",
            error: err.message
        });
    }
};