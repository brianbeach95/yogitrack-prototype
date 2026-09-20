const Sale = require("../models/saleModel.cjs");
const Package = require("../models/packageModel.cjs");
const Instructor = require("../models/instructorModel.cjs");
const Class = require("../models/classModel.cjs");
const Attendance = require("../models/attendanceModel.cjs");
const Customer = require("../models/customerModel.cjs");

exports.getStudioPerformance = async (req, res) => {
    try {
        const sales = await Sale.find({});
        const packages = await Package.find({});

        let totalRevenue = 0;

        const packageSummary = packages.map((packageItem) => {

            const packageSales = sales.filter((sale) => sale.packageId === packageItem.packageId);

            const revenue = packageSales.reduce((total, sale) => total + sale.amountPaid, 0);

            totalRevenue += revenue;

            return {
                packageId: packageItem.packageId,
                packageName: packageItem.packageName,
                packagesSold: packageSales.length,
                revenue: revenue
            };
        });

        res.json({
            totalSales: sales.length,
            totalRevenue,
            packageSummary
        });

    } catch (err) {
        console.error(
            "Error generating studio performance report:",
            err.message
        );

        res.status(500).json({
            message: "Failed to generate studio performance report",
            error: err.message
        });
    }
};

exports.getInstructorPerformance = async (req, res) => {
    try {
        const instructors = await Instructor.find({});
        const classes = await Class.find({});
        const attendance = await Attendance.find({});

        const instructorSummary = instructors.map((instructor) => {
                const instructorClasses = classes.filter((classItem) =>classItem.instructorId === instructor.instructorId);

                const classIds = instructorClasses.map((classItem) => classItem.classId);

                const instructorAttendance = attendance.filter((attendanceItem) => classIds.includes(attendanceItem.classId));

                return {
                    instructorId: instructor.instructorId,
                    instructorName:
                        `${instructor.firstName} ${instructor.lastName}`,
                    classes: classIds,
                    totalCheckIns: instructorAttendance.length
                };
        });

        res.json({
            instructorSummary
        });

    } catch (err) {
        console.error(
            "Error generating instructor performance report:",
            err.message
        );

        res.status(500).json({
            message: "Failed to generate instructor performance report",
            error: err.message
        });
    }
};


exports.getCustomerAttendance = async (req, res) => {
    try {
        const customers = await Customer.find({});
        const attendance = await Attendance.find({});

        const customerSummary = customers.map((customer) => {

            const customerAttendance = attendance.filter((attendanceItem) =>attendanceItem.customerId === customer.customerId);

            return {
                customerId: customer.customerId,
                customerName:
                    `${customer.firstName} ${customer.lastName}`,
                classBalance: customer.classBalance,
                totalCheckIns: customerAttendance.length
            };
        });

        res.json({
            customerSummary
        });

    } catch (err) {
        console.error(
            "Error generating customer attendance report:",
            err.message
        );

        res.status(500).json({
            message: "Failed to generate customer attendance report",
            error: err.message
        });
    }
};

exports.getClassAttendance = async (req, res) => {
    try {
        const classes = await Class.find({});
        const attendance = await Attendance.find({});

        const classSummary = classes.map((classItem) => {

            const classAttendance = attendance.filter((attendanceItem) =>attendanceItem.classId === classItem.classId);

            return {
                classId: classItem.classId,
                instructorId: classItem.instructorId,
                day: classItem.day,
                time: classItem.time,
                classType: classItem.classType,
                totalCheckIns: classAttendance.length
            };
        });

        res.json({
            classSummary
        });

    } catch (err) {
        console.error(
            "Error generating class attendance report:",
            err.message
        );

        res.status(500).json({
            message: "Failed to generate class attendance report",
            error: err.message
        });
    }
};


exports.getCustomerPackages = async (req, res) => {
    try {
        const customers = await Customer.find({});
        const sales = await Sale.find({});
        const packages = await Package.find({});

        const today = new Date();

        const customerSummary = customers.map((customer) => {

            const customerSales = sales.filter(
                (sale) =>
                    sale.customerId === customer.customerId
            );

            const customerPackages = customerSales.map((sale) => {

                const packageItem = packages.find(
                    (packageItem) =>
                        packageItem.packageId === sale.packageId
                );

                const startDate =
                    new Date(sale.validityStartDate);

                const endDate =
                    new Date(sale.validityEndDate);

                let status = "Active";

                if (today < startDate) {
                    status = "Future";
                } else if (today > endDate) {
                    status = "Expired";
                }

                return {
                    packageId: sale.packageId,
                    packageName:
                        packageItem?.packageName || "Unknown Package",
                    validityStartDate: sale.validityStartDate,
                    validityEndDate: sale.validityEndDate,
                    status
                };
            });

            return {
                customerId: customer.customerId,
                customerName:
                    `${customer.firstName} ${customer.lastName}`,
                packages: customerPackages
            };
        });

        res.json({
            customerSummary
        });

    } catch (err) {
        console.error(
            "Error generating customer package report:",
            err.message
        );

        res.status(500).json({
            message: "Failed to generate customer package report",
            error: err.message
        });
    }
};