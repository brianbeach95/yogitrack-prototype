
import { useEffect, useState } from "react";

const emptyForm = {
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    preferredCommunication: "Email"
};

function Instructors() {
    const [instructors, setInstructors] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [instructorDetails, setInstructorDetails] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [formMode, setFormMode] = useState("edit");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Retrieve all instructors for the dropdown
    const fetchInstructors = async () => {
        try {
            const response = await fetch("/api/instructor/getInstructorIds");

            if (!response.ok) {
                throw new Error("Failed to load instructors");
            }

            const data = await response.json();
            setInstructors(data);

        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    // Retrieve the selected instructor's details
    const fetchInstructorDetails = async (instructorId) => {
        if (!instructorId) {
            setInstructorDetails(null);
            setFormData({ ...emptyForm });
            setError("");
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const response = await fetch(
                `/api/instructor/getInstructor?instructorId=${encodeURIComponent(instructorId)}`
            );

            const data = await response.json();

            if (!response.ok || !data) {
                throw new Error("Instructor not found or missing an instructor ID.");
            }

            setInstructorDetails(data);

            setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                address: data.address || "",
                phone: data.phone || "",
                email: data.email || "",
                preferredCommunication: data.preferredCommunication || "Email"
            });

        } catch (error) {
            setInstructorDetails(null);
            setError(error.message);
        }
    };

    // Update a form field
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Switch to Add mode
    const handleAddMode = () => {
        setFormMode("add");
        setSelectedId("");
        setInstructorDetails(null);
        setFormData({ ...emptyForm });
        setError("");
        setSuccessMessage("");
    };

    const handleCancel = () => {
        setFormMode("edit");
        setSelectedId("");
        setInstructorDetails(null);
        setFormData({ ...emptyForm });
        setError("");
        setSuccessMessage("");
    };

    const validateInstructor = () => {
        const { firstName, lastName, address, phone, email } = formData;

        if (!firstName.trim() || !lastName.trim()) {
            return "First name and last name are required.";
        }

        if (!address.trim() || address.trim().length < 5) {
            return "Please enter a valid address (at least 5 characters).";
        }

        const phoneDigits = phone.replace(/\D/g, "");

        if (phoneDigits.length !== 10) {
            return "Phone number must contain 10 digits.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return "Please enter a valid email address.";
        }

        return null;
    };

    
    
    const handleAdd = async () => {
        setError("");
        setSuccessMessage("");

        const validationError = validateInstructor();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            // Generate the next instructor ID
            const idResponse = await fetch("/api/instructor/getNextId");
            const idData = await idResponse.json();

            if (!idResponse.ok) {
                throw new Error(idData.message || "Failed to generate instructor ID");
            }

            const instructorId = idData.nextId;

            if (!instructorId) {
                throw new Error("No instructor ID was generated.");
            }

            // Helper to submit the instructor
            const saveInstructor = async (confirmDuplicate = false) => {
                const response = await fetch("/api/instructor/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        instructorId,
                        ...formData,
                        confirmDuplicate
                    })
                });

                const data = await response.json();

                return { response, data };
            };

            let { response, data } = await saveInstructor();

            // Ask for confirmation if the name already exists
            if (response.status === 409 && data.duplicate) {
                const confirmed = window.confirm(
                    `An instructor with this name already exists (${data.existingInstructorId}). Do you want to add another?`
                );

                if (!confirmed) {
                    return;
                }

                ({ response, data } = await saveInstructor(true));
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to add instructor");
            }

            await fetchInstructors();

            setFormData({ ...emptyForm });
            setFormMode("edit");
            setSelectedId("");
            setInstructorDetails(null);
            setSuccessMessage("Instructor added successfully.");

        } catch (error) {
            setError(error.message);
        }
    };



    // Update an existing instructor
    const handleUpdate = async () => {
        if (!selectedId) return;

        setError("");
        setSuccessMessage("");

        const validationError = validateInstructor();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const response = await fetch(
                "/api/instructor/updateInstructor",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        instructorId: selectedId,
                        ...formData
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update instructor");
            }

            setInstructorDetails(data.instructor || {
                instructorId: selectedId,
                ...formData
            });

            await fetchInstructors();

            setSuccessMessage("Instructor updated successfully.");

        } catch (error) {
            setError(error.message);
        }
    };


    const handleDelete = async () => {
        if (!selectedId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this instructor?"
        );

        if (!confirmed) return;

        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                "/api/instructor/deleteInstructor",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        instructorId: selectedId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete instructor");
            }

            setSelectedId("");
            setInstructorDetails(null);
            setFormData({ ...emptyForm });

            await fetchInstructors();

            setSuccessMessage("Instructor deleted successfully.");

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="instructors-page">
            <h1>Manage Instructors</h1>

            <div className="form-actions">
                {formMode === "edit" && (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddMode}
                    >
                        Add New Instructor
                    </button>
                )}

                {formMode === "add" && (
                    <button
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Instructor dropdown */}
            {formMode === "edit" && (
                <div className="form-group">
                    <label htmlFor="instructorSelect">
                        Select Instructor
                    </label>

                    <select
                        id="instructorSelect"
                        value={selectedId}
                        onChange={(e) => {
                            const instructorId = e.target.value;
                            setSelectedId(instructorId);
                            fetchInstructorDetails(instructorId);
                        }}
                    >
                        <option value="">Select an instructor</option>

                        {instructors.map((instructor) => (
                            <option
                                key={instructor.instructorId}
                                value={instructor.instructorId}
                            >
                                {instructor.instructorId} - {instructor.firstName} {instructor.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
                <p className="login-message">{error}</p>
            )}

            {(formMode === "add" || instructorDetails) && (
                <div className="instructor-details">
                    <h2>
                        {formMode === "add"
                            ? "Add Instructor"
                            : "Instructor Information"}
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
                    </div>

                    <div className="form-actions">
                        {formMode === "edit" && (
                            <>
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleUpdate}
                                >
                                    Update Instructor
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={handleDelete}
                                >
                                    Delete Instructor
                                </button>
                            </>
                        )}

                        {formMode === "add" && (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleAdd}
                            >
                                Save Instructor
                            </button>
                        )}
                    </div>

                    {successMessage && (
                        <p className="success-message">
                            {successMessage}
                        </p>
                    )}
                </div>
            )}

            {successMessage && !instructorDetails && formMode === "edit" && (
                <p className="success-message">
                    {successMessage}
                </p>
            )}
        </div>
    );
}

export default Instructors;
