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

        // Check required fields
        if (!customerId || !packageId || amountPaid === undefined || !paymentMode || !dateTimePaid || !validityStartDate || !validityEndDate ) {
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

        if (Number(amountPaid) !== Number(packageItem.price)) {
            return res.status(400).json({
                message:
                    `Amount paid must equal the package price of $${packageItem.price.toFixed(2)}`
            });
        }

        // Make sure validity dates make sense
        const startDate = new Date(validityStartDate);
        const endDate = new Date(validityEndDate);

        if (endDate < startDate) {
            return res.status(400).json({
                message: "Validity end date cannot be before start date"
            });
        }

        // Generate Sale ID
        const lastSale = await Sale.find({
            saleId: /^S\d+$/
        })
        .sort({ saleId: -1 })
        .limit(1);

        const saleId = generateNextId(lastSale, "saleId", "S");

        const newSale = new Sale({
            saleId,
            customerId,
            packageId,
            amountPaid: Number(amountPaid),
            paymentMode,
            dateTimePaid,
            validityStartDate,
            validityEndDate
        });

        await newSale.save();

        if (packageItem.numberOfClasses !== "Unlimited") {
            const classesPurchased = Number(packageItem.numberOfClasses);
            customer.classBalance += classesPurchased;
            await customer.save();
        }

        res.status(201).json({
            message: "Sale recorded successfully",
            sale: newSale,
            classBalance: customer.classBalance,
            unlimited: packageItem.numberOfClasses === "Unlimited"
        });

    } catch (err) {
        console.error("Error recording sale:", err.message);

        res.status(500).json({
            message: "Failed to record sale",
            error: err.message
        });
    }
};