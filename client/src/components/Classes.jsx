
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
    instructorId: "",
    day: "Monday",
    time: "09:00",
    classType: "",
    payRate: ""
};

function Classes() {
    const [classes, setClasses] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [classDetails, setClassDetails] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [formMode, setFormMode] = useState("edit");
    const [error, setError] = useState("");
    const [instructors, setInstructors] = useState([]);
    const [availability, setAvailability] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch("/api/class/getClassIds");

                if (!response.ok) {
                    throw new Error("Failed to load classes.");
                }

                setClasses(await response.json());
            } catch (err) {
                setError(err.message);
                toast.error(error.message);
            }
        };

        fetchClasses();
    }, []);


    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await fetch("/api/instructor/getInstructorIds");

                if (!response.ok) {
                    throw new Error("Failed to load instructors.");
                }

                const data = await response.json();
                setInstructors(data);
            } catch (err) {
                setError(err.message);
                toast.error(error.message);
            }
        };

        fetchInstructors();
    }, []);


    useEffect(() => {
        if (
            !formData.instructorId ||
            !formData.day ||
            !formData.time
        ) {
            setAvailability(null);
            return;
        }

        let cancelled = false;

        const checkAvailability = async () => {
            try {
                setAvailability(null);

                const response = await fetch("/api/class/getSchedule");

                if (!response.ok) {
                    throw new Error("Unable to check availability.");
                }

                const schedule = await response.json();

                const selectedMinutes = (time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    return hours * 60 + minutes;
                };

                const conflict = schedule.find((classItem) => {
                    if (
                        formMode === "edit" &&
                        classItem.classId === selectedId
                    ) {
                        return false;
                    }

                    return (
                        classItem.instructorId === formData.instructorId &&
                        classItem.day === formData.day &&
                        Math.abs(
                            selectedMinutes(String(classItem.time)) -
                            selectedMinutes(formData.time)
                        ) < 60
                    );
                });

                if (!cancelled) {
                    setAvailability(
                        conflict
                            ? {
                                available: false,
                                message: `Scheduling conflict with ${conflict.classId} at ${conflict.time}.`
                            }
                            : {
                                available: true,
                                message: "Instructor is available at the selected time."
                            }
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setAvailability({
                        available: null,
                        message: err.message
                    });
                }
            }
        };

        checkAvailability();

        return () => {
            cancelled = true;
        };
    }, [
        formData.instructorId,
        formData.day,
        formData.time,
        formMode,
        selectedId
    ]);                         

    const fetchClassDetails = async (classId) => {
        if (!classId) {
            setClassDetails(null);
            setFormData({ ...emptyForm });
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `/api/class/getClass?classId=${encodeURIComponent(classId)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load class.");
            }

            setClassDetails(data);

            setFormData({
                instructorId: data.instructorId || "",
                day: data.day || "Monday",
                time: data.time || "09:00",
                classType: data.classType || "",
                payRate: data.payRate ?? ""
            });
        } catch (err) {
            setClassDetails(null);
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAdd = async () => {
        if (
            !formData.instructorId ||
            !formData.day ||
            !formData.time ||
            !formData.classType.trim() ||
            formData.payRate === ""
        ) {
            setError("Please complete all class fields.");
            return;
        }

        if (!Number.isFinite(Number(formData.payRate)) ||
            Number(formData.payRate) < 0) {
            setError("Pay rate must be a non-negative number.");
            return;
        }

        try {
            setError("");

            const response = await fetch("/api/class/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    payRate: Number(formData.payRate)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add class."
                );
            }

            toast.success("Class added successfully!");

            setFormMode("edit");
            setSelectedId(data.class?.classId || "");
            setClassDetails(data.class || null);

            // Refresh the class dropdown
            const classesResponse = await fetch("/api/class/getClassIds");

            if (classesResponse.ok) {
                setClasses(await classesResponse.json());
            }

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleUpdate = async () => {
        if (!selectedId) return;

        if (
            !formData.instructorId ||
            !formData.day ||
            !formData.time ||
            !formData.classType.trim() ||
            formData.payRate === ""
        ) {
            setError("Please complete all class fields.");
            return;
        }

        if (
            !Number.isFinite(Number(formData.payRate)) ||
            Number(formData.payRate) < 0
        ) {
            setError("Pay rate must be a non-negative number.");
            return;
        }

        try {
            setError("");

            const response = await fetch("/api/class/updateClass", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    classId: selectedId,
                    ...formData,
                    payRate: Number(formData.payRate)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update class."
                );
            }

            toast.success("Class updated successfully!");

            await fetchClassDetails(selectedId);

            const classesResponse = await fetch("/api/class/getClassIds");

            if (classesResponse.ok) {
                setClasses(await classesResponse.json());
            }

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this class?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const response = await fetch(
                `/api/class/deleteClass?classId=${encodeURIComponent(selectedId)}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete class.");
            }

            toast.success("Class deleted successfully!");

            setSelectedId("");
            setClassDetails(null);
            setFormData({ ...emptyForm });

            const classesResponse = await fetch("/api/class/getClassIds");

            if (classesResponse.ok) {
                setClasses(await classesResponse.json());
            }

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleAddMode = () => {
        setFormMode("add");
        setSelectedId("");
        setClassDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };



    const handleCancel = () => {
        setFormMode("edit");
        setSelectedId("");
        setClassDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };


    const filteredClasses = classes.filter((classItem) => {
        const search = searchTerm.trim().toLowerCase();

        const instructor = instructors.find(
            (item) => item.instructorId === classItem.instructorId
        );

        const searchableText = [
            classItem.classId,
            classItem.day,
            classItem.time,
            classItem.classType,
            classItem.instructorId,
            instructor?.firstName,
            instructor?.lastName,
            `${instructor?.firstName || ""} ${instructor?.lastName || ""}`
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(search);
    });

    return (
        <div className="instructors-page">
            <h1>Manage Classes</h1>

            <div className="form-actions">
                {formMode === "edit" ? (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddMode}
                    >
                        Add New Class
                    </button>
                ) : (
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>

            {formMode === "edit" && (
                <div className="form-group">
                    <label htmlFor="classSearch">Search Classes</label>

                    <input
                        id="classSearch"
                        type="search"
                        placeholder="Search by class, instructor, or day..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm.trim() !== "" && (
                        <div className="customer-search-results">
                            {filteredClasses.length === 0 ? (
                                <p>No matching classes found.</p>
                            ) : (
                                filteredClasses.map((classItem) => (
                                    <button
                                        key={classItem.classId}
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(classItem.classId);
                                            fetchClassDetails(classItem.classId);
                                            setSearchTerm("");
                                        }}
                                    >
                                        {classItem.classId} - {classItem.day} at {classItem.time}
                                        {classItem.classType ? ` - ${classItem.classType}` : ""}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                    <label htmlFor="classSelect">Select Class</label>

                    <select
                        id="classSelect"
                        value={selectedId}
                        onChange={(e) => {
                            const classId = e.target.value;
                            setSelectedId(classId);
                            fetchClassDetails(classId);
                        }}
                    >
                        <option value="">Select a class</option>

                        {filteredClasses.map((classItem) => (
                            <option
                                key={classItem.classId}
                                value={classItem.classId}
                            >
                                {classItem.classId} - {classItem.day} at {classItem.time}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && <p className="login-message">{error}</p>}

            {(formMode === "add" || classDetails) && (
                <div className="instructor-details">
                    <h2>
                        {formMode === "add"
                            ? "Add Class"
                            : "Class Information"}
                    </h2>

                    <div className="instructor-form-grid">
                        <div className="form-group">
                            <label htmlFor="instructorId">Instructor</label>

                            <select
                                id="instructorId"
                                name="instructorId"
                                value={formData.instructorId}
                                onChange={handleInputChange}
                                required
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

                        <div className="form-group">
                            <label htmlFor="day">Day</label>
                            <select
                                id="day"
                                name="day"
                                value={formData.day}
                                onChange={handleInputChange}
                            >
                                {[
                                    "Monday", "Tuesday", "Wednesday",
                                    "Thursday", "Friday", "Saturday", "Sunday"
                                ].map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="time">Time</label>
                            <input
                                id="time"
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={handleInputChange}
                            />
                            {availability && (
                            <p
                                style={{
                                    color: availability.available === true
                                        ? "#2e7d32"
                                        : availability.available === false
                                            ? "#c62828"
                                            : "#777",
                                    fontSize: "0.85rem",
                                    marginTop: "6px"
                                }}
                            >
                                {availability.message}
                            </p>
                        )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="classType">Class Type</label>
                            <input
                                id="classType"
                                name="classType"
                                value={formData.classType}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payRate">Pay Rate</label>
                            <input
                                id="payRate"
                                name="payRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.payRate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        {formMode === "add" ? (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleAdd}
                            >
                                Save Class
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleUpdate}
                                >
                                    Update Class
                                </button>
                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={handleDelete}
                                >
                                    Delete Class
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Classes;
