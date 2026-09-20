const Customer = require("../models/customerModel.cjs");
const { formatName, formatPhone, validateEmail } = require("../utils/validationUtils.cjs");
const { generateNextId } = require("../utils/idUtils.cjs");

exports.search = async (req, res) => {
  try {
    const searchString = req.query.firstName;
    const customer = await Customer.find({
      firstName: { $regex: searchString, $options: "i" },
    });

    if (!customer || customer.length == 0) {
      return res.status(404).json({ message: "No customer found" });
    } else {
      res.json(customer[0]);
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

//Find the package selected in the dropdown
exports.getCustomer = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const customerDetail = await Customer.findOne({ customerId: customerId });

    res.json(customerDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      email,
      phone,
      address,
      preferredCommunication
    } = req.body;

    const firstName = formatName(req.body.firstName);
    const lastName = formatName(req.body.lastName);
    const formattedPhone = formatPhone(phone);

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    const existingCustomer = await Customer.findOne({
        firstName: firstName,
        lastName: lastName
    });

    if (existingCustomer  && !req.body.allowDuplicate) {
        return res.status(409).json({
            message: "A customer with this name already exists",
            customer: existingCustomer
        })
    };

    const lastCustomer = await Customer.findOne({
      customerId: /^C\d+$/
    }).sort({ customerId: -1 });


    const customerId = generateNextId(lastCustomer, "customerId", "C");

    // Create a new customer document
    const newCustomer = new Customer({
      customerId,
      firstName,
      lastName,
      address,
      phone: formattedPhone,
      email,
      preferredCommunication
    });

    // Save to database
    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).json({ message: "Failed to add customer", error: err.message });
  }
};

//Populate the customerId dropdown
exports.getCustomerIds = async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      { customerId: 1, firstName: 1, lastName: 1, _id: 0 }
    ).sort();

    res.json(customers);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getNextId = async (req, res) => {
  const lastCustomer = await Customer.find({})
    .sort({ customerId: -1 })
    .limit(1);

  const nextId = generateNextId(lastCustomer, "customerId", "C");
  res.json({ nextId });
};

//delete
exports.deleteCustomer = async (req, res) => {
  try {
     const {customerId} = req.query;
     const result = await Customer.findOneAndDelete({ customerId });
     if (!result) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted", customerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//update
exports.updateCustomer = async (req, res) => {
  try {
    const {
      customerId,
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredCommunication
    } = req.body;

    if (!customerId || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId },
      {
        firstName,
        lastName,
        email,
        phone,
        address,
        preferredCommunication
      },
      { returnDocument: "after" }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer: updatedCustomer
    });

  } catch (err) {
    console.error("Error updating customer:", err.message);

    res.status(500).json({
      message: "Failed to update customer",
      error: err.message
    });
  }
};