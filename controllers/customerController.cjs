const Customer = require("../models/customerModel.cjs");
const { formatName, formatPhone, validateEmail } = require("../utils/validationUtils.cjs");
const { generateNextId } = require("../utils/idUtils.cjs");
const Sale = require("../models/saleModel.cjs");
const Attendance = require("../models/attendanceModel.cjs");

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

    if (!customerDetail) {
        return res.status(404).json({
            message: "Customer not found."
        });
    }

    res.json(customerDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredCommunication
    } = req.body;

    // Basic validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !address?.trim()) {
        return res.status(400).json({
            message: "All customer contact fields are required."
        });
    }

    if (address.trim().length < 5) {
        return res.status(400).json({
            message: "Address must contain at least 5 characters."
        });
    }

    if (phone.replace(/\D/g, "").length !== 10) {
        return res.status(400).json({
            message: "Phone number must contain 10 digits."
        });
    }

    if (!validateEmail(email.trim())) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    const formattedPhone = formatPhone(phone);

    const escapeRegex = (value) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existingCustomer = await Customer.findOne({
        firstName: {
            $regex: `^${escapeRegex(formattedFirstName)}$`,
            $options: "i"
        },
        lastName: {
            $regex: `^${escapeRegex(formattedLastName)}$`,
            $options: "i"
        }
    });

    if (existingCustomer  && !req.body.allowDuplicate) {
        return res.status(409).json({
            message: "A customer with this name already exists",
            customer: existingCustomer
        })
    };

    const lastCustomer = await Customer.find({
        customerId: /^C\d+$/
    })
    .sort({ customerId: -1 })
    .limit(1);

    const customerId = generateNextId(lastCustomer, "customerId", "C");

    // Create a new customer document
    const newCustomer = new Customer({
      customerId,
      firstName: formattedFirstName,
      lastName: formattedLastName,
      address: address.trim(),
      phone: formattedPhone,
      email: email.trim(),
      preferredCommunication,
      classBalance: 0
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
    ).sort({ customerId: 1 });

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
     if (!customerId) {
        return res.status(400).json({
            message: "Customer ID is required."
        });
    }

    const [existingSale, existingAttendance] = await Promise.all([
        Sale.exists({ customerId }),
        Attendance.exists({ customerId })
    ]);

    if (existingSale || existingAttendance) {
        return res.status(409).json({
            message:
                "Cannot delete this customer because they have existing sales or attendance records."
        });
    }
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

    if (!customerId?.trim()) {
        return res.status(400).json({
            message: "Customer ID is required."
        });
    }

      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !address?.trim()) {
        return res.status(400).json({
            message: "All customer contact fields are required."
        });
    }

    if (address.trim().length < 5) {
        return res.status(400).json({
            message: "Address must contain at least 5 characters."
        });
    }

    if (phone.replace(/\D/g, "").length !== 10) {
        return res.status(400).json({
            message: "Phone number must contain 10 digits."
        });
    }

    if (!validateEmail(email.trim())) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    const formattedPhone = formatPhone(phone);

    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId },
      {
        firstName: formattedFirstName,
        lastName: formattedLastName,
        address: address.trim(),
        phone: formattedPhone,
        email: email.trim(),
        preferredCommunication
      },
      { 
        returnDocument: "after",
        runValidators: true
      }
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