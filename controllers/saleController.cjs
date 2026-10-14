const Sale = require("../models/saleModel.cjs");
const { generateNextId } = require("../utils/idUtils.cjs");
const Customer = require("../models/customerModel.cjs");
const Package = require("../models/packageModel.cjs");

exports.getNextId = async (req, res) => {
    try {
        const lastSale = await Sale.find({
            saleId: /^S\d+$/
        })
        .sort({ saleId: -1 })
        .limit(1);

        const nextId = generateNextId(lastSale, "saleId", "S");

        res.json({ nextId });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};



exports.add = async (req, res) => {
    try {
        const {
            customerId,
            packageId,
            amountPaid,
            paymentMode,
            dateTimePaid,
            validityStartDate,
            validityEndDate
        } = req.body;

        if (
            !customerId || !packageId ||
            amountPaid === undefined || amountPaid === null ||
            amountPaid === "" || !paymentMode || !dateTimePaid ||
            !validityStartDate || !validityEndDate
        ) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const customer = await Customer.findOne({ customerId });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const packageItem = await Package.findOne({ packageId });

        if (!packageItem) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        if (
            !Number.isFinite(Number(amountPaid)) ||
            Number(amountPaid) !== Number(packageItem.price)
        ) {
            return res.status(400).json({
                message: `Amount paid must equal the package price of $${Number(packageItem.price).toFixed(2)}`
            });
        }

        const startDate = new Date(validityStartDate);
        const endDate = new Date(validityEndDate);
        const paymentDate = new Date(dateTimePaid);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            Number.isNaN(paymentDate.getTime())
        ) {
            return res.status(400).json({
                message: "Invalid payment or validity date"
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                message: "Validity end date cannot be before start date"
            });
        }

        const classesPurchased = Number(packageItem.numberOfClasses);

        if (
            !Number.isInteger(classesPurchased) ||
            classesPurchased <= 0
        ) {
            return res.status(400).json({
                message: "Package must contain a positive number of classes"
            });
        }

        // Generate next Sale ID
        const lastSale = await Sale.find({
            saleId: /^S\d+$/
        })
            .sort({ saleId: -1 })
            .limit(1);

        const saleId = generateNextId(
            lastSale,
            "saleId",
            "S"
        );

        const newSale = new Sale({
            saleId,
            customerId,
            packageId,
            amountPaid: Number(amountPaid),
            paymentMode,
            dateTimePaid: paymentDate,
            validityStartDate: startDate,
            validityEndDate: endDate
        });

        // Save the sale first
        await newSale.save();

        let updatedCustomer;

        try {
            // Increment balance directly in MongoDB
            updatedCustomer = await Customer.findOneAndUpdate(
                { customerId },
                { $inc: { classBalance: classesPurchased } },
                { new: true }
            );

            if (!updatedCustomer) {
                throw new Error("Customer no longer exists");
            }

        } catch (balanceError) {
            // Attempt to undo the sale if balance update fails
            try {
                await Sale.deleteOne({ _id: newSale._id });
            } catch (rollbackError) {
                console.error(
                    "Failed to undo sale after balance update error:",
                    rollbackError
                );
            }

            throw balanceError;
        }

        return res.status(201).json({
            message: "Sale recorded successfully",
            sale: newSale,
            classBalance: updatedCustomer.classBalance,
            unlimited: false
        });

    } catch (err) {
        console.error("Error recording sale:", err);

        return res.status(500).json({
            message: "Failed to record sale",
            error: err.message
        });
    }
};

