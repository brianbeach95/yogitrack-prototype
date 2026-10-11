
import { useEffect, useState } from "react";

const emptyForm = {
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    preferredCommunication: "Email"
};

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [customerDetails, setCustomerDetails] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [formMode, setFormMode] = useState("edit");
    const [error, setError] = useState("");

    const fetchCustomers = async () => {
        try {
            const response = await fetch("/api/customer/getCustomerIds");

            if (!response.ok) {
                throw new Error("Failed to load customers");
            }

            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomerDetails = async (customerId) => {
        if (!customerId) {
            setCustomerDetails(null);
            setFormData({ ...emptyForm });
            setError("");
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `/api/customer/getCustomer?customerId=${encodeURIComponent(customerId)}`
            );

            const data = await response.json();

            if (!response.ok || !data) {
                throw new Error("Customer not found.");
            }

            setCustomerDetails(data);

            setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                address: data.address || "",
                phone: data.phone || "",
                email: data.email || "",
                preferredCommunication: data.preferredCommunication || "Email"
            });

        } catch (error) {
            setCustomerDetails(null);
            setError(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAddMode = () => {
        setFormMode("add");
        setSelectedId("");
        setCustomerDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };

    const handleCancel = () => {
        setFormMode("edit");
        setSelectedId("");
        setCustomerDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };


    const validateCustomer = () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError("First and last name are required.");
            return false;
        }

        if (formData.address.trim().length < 5) {
            setError("Address must contain at least 5 characters.");
            return false;
        }

        if (formData.phone.replace(/\D/g, "").length !== 10) {
            setError("Phone number must contain 10 digits.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }

        setError("");
        return true;
    };

    
    const handleAdd = async (allowDuplicate = false) => {
        if (!validateCustomer()) return;
        try {
            setError("");

            const response = await fetch("/api/customer/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    allowDuplicate
                })
            });

            const data = await response.json();

            if (response.status === 409) {
                const confirmed = window.confirm(
                    data.message + ". Do you want to add this customer anyway?"
                );

                if (confirmed) {
                    await handleAdd(true);
                }

                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to add customer.");
            }

            alert("Customer added successfully!");

            await fetchCustomers();
            setFormMode("edit");
            setSelectedId(data.customer.customerId);
            await fetchCustomerDetails(data.customer.customerId);

        } catch (error) {
            setError(error.message);
        }
    };

    
    const handleUpdate = async () => {
        if (!validateCustomer()) return;
        if (!selectedId) return;

        try {
            setError("");

            const response = await fetch("/api/customer/updateCustomer", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customerId: selectedId,
                    ...formData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update customer.");
            }

            alert("Customer updated successfully!");

            await fetchCustomers();
            await fetchCustomerDetails(selectedId);

        } catch (error) {
            setError(error.message);
        }
    };

    
    const handleDelete = async () => {
        if (!selectedId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const response = await fetch(
                `/api/customer/deleteCustomer?customerId=${encodeURIComponent(selectedId)}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete customer.");
            }

            alert("Customer deleted successfully!");

            setSelectedId("");
            setCustomerDetails(null);
            setFormData({ ...emptyForm });

            await fetchCustomers();

        } catch (error) {
            setError(error.message);
        }
    };  




    return (
        <div className="instructors-page">
            <h1>Manage Customers</h1>

            <div className="form-actions">
                {formMode === "edit" ? (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddMode}
                    >
                        Add New Customer
                    </button>
                ) : (
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>

            {formMode === "edit" && (
                <div className="form-group">
                    <label htmlFor="customerSelect">
                        Select Customer
                    </label>

                    <select
                        id="customerSelect"
                        value={selectedId}
                        onChange={(e) => {
                            const customerId = e.target.value;
                            setSelectedId(customerId);
                            fetchCustomerDetails(customerId);
                        }}
                    >
                        <option value="">Select a customer</option>

                        {customers.map((customer) => (
                            <option
                                key={customer.customerId}
                                value={customer.customerId}
                            >
                                {customer.customerId} - {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && <p className="login-message">{error}</p>}

            {(formMode === "add" || customerDetails) && (
                <div className="instructor-details">
                    <h2>
                        {formMode === "add"
                            ? "Add Customer"
                            : "Customer Information"}
                    </h2>

                    <div className="instructor-form-grid">
                        {[
                            ["firstName", "First Name"],
                            ["lastName", "Last Name"],
                            ["address", "Address"],
                            ["phone", "Phone"],
                            ["email", "Email"]
                        ].map(([field, label]) => (
                            <div className="form-group" key={field}>
                                <label htmlFor={field}>{label}</label>
                                <input
                                    id={field}
                                    name={field}
                                    type={field === "email" ? "email" : "text"}
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        ))}

                        <div className="form-group">
                            <label htmlFor="preferredCommunication">
                                Preferred Communication
                            </label>
                            <select
                                id="preferredCommunication"
                                name="preferredCommunication"
                                value={formData.preferredCommunication}
                                onChange={handleInputChange}
                            >
                                <option value="Email">Email</option>
                                <option value="Phone">Phone</option>
                            </select>
                        </div>

                        {formMode === "edit" && customerDetails && (
                            <div className="form-group">
                                <label>Class Balance</label>
                                <input
                                    value={customerDetails.classBalance ?? 0}
                                    readOnly
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        {formMode === "add" ? (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => handleAdd()}
                            >
                                Save Customer
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleUpdate}
                                >
                                    Update Customer
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={handleDelete}
                                >
                                    Delete Customer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
