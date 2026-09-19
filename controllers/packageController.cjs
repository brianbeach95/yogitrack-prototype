const Package = require("../models/packageModel.cjs");
const { validateNonNegativeNumber, validateDateRange } = require("../utils/validationUtils.cjs");

const { generateNextId } = require("../utils/idUtils.cjs");

exports.getPackage = async (req, res) => {
  try {
    const packageId = req.query.packageId;

    const packageDetail = await Package.findOne({
      packageId: packageId
    });

    res.json(packageDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getPackageIds = async (req, res) => {
  try {
    const packages = await Package.find(
      {},
      {
        packageId: 1,
        packageName: 1,
        _id: 0
      }
    ).sort();

    res.json(packages);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getNextId = async (req, res) => {
  try {
    const lastPackage = await Package.find({packageId: /^P\d+$/})
    .sort({packageId: -1})
    .limit(1);

    const nextId = generateNextId(lastPackage, "packageId", "P");

    res.json({ nextId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      packageName,
      packageCategory,
      numberOfClasses,
      classType,
      startDate,
      endDate,
      price
    } = req.body;

    if (!packageName || !packageCategory || !numberOfClasses || !classType || !startDate || !endDate || price === undefined) {
        return res.status(400).json({message: "Missing required fields"});
    }

    if (!validateNonNegativeNumber(price)) {
        return res.status(400).json({message: "Price must be a non-negative number"});
    }
    if (!validateDateRange(startDate, endDate)) {
        return res.status(400).json({message: "End date must be on or after start date"});
    }

    const lastPackage = await Package.find({packageId: /^P\d+$/})
        .sort({ packageId: -1 })
        .limit(1);
        
    const packageId = generateNextId(lastPackage, "packageId", "P");

    const newPackage = new Package({
      packageId,
      packageName,
      packageCategory,
      numberOfClasses,
      classType,
      startDate,
      endDate,
      price
    });

    await newPackage.save();

    res.status(201).json({
      message: "Package added successfully",
      package: newPackage
    });
  } catch (err) {
    console.error("Error adding package:", err.message);

    res.status(500).json({
      message: "Failed to add package",
      error: err.message
    });
  }
};

