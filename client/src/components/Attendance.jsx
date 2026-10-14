
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
    classId: "",
    customerId: "",
    attendanceDateTime: ""
};

function Attendance() {
    const [classes, setClasses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [classResponse, customerResponse] =
                    await Promise.all([
                        fetch("/api/class/getSchedule"),
                        fetch("/api/customer/getCustomerIds")
                    ]);

                if (!classResponse.ok || !customerResponse.ok) {
                    throw new Error(
                        "Failed to load classes or customers."
                    );
                }

                const classData = await classResponse.json();
                const customerData = await customerResponse.json();

                setClasses(classData);
                setCustomers(customerData);

            } catch (err) {
                setError(err.message);
                toast.error(error.message);
            }
        };

        loadOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    
    const handleRecordAttendance = async () => {
        if (
            !formData.classId ||
            !formData.customerId ||
            !formData.attendanceDateTime
        ) {
            setError("Please complete all attendance fields.");
            return;
        }

        if (saving) return;

        setSaving(true);
        setError("");

        try {
            const submitAttendance = async (allowNegativeBalance = false) => {
                const response = await fetch("/api/attendance/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...formData,
                        allowNegativeBalance
                    })
                });

                const data = await response.json();

                return { response, data };
            };

            let { response, data } = await submitAttendance();

            // Customer has no remaining classes
            if (response.status === 409 && data.requiresConfirmation) {
                const confirmed = window.confirm(
                    data.message ||
                    "Customer has no remaining classes. Continue?"
                );

                if (!confirmed) return;

                ({ response, data } = await submitAttendance(true));
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to record attendance."
                );
            }

            toast.success(`Check-in recorded successfully! Remaining classes: ${data.classBalance}`);

            setFormData((previous) => ({
                ...previous,
                customerId: ""
            }));

        } catch (err) {
            setError(err.message);
            toast.error(error.message);

        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="instructors-page">
            <h1>Attendance Management</h1>

            {error && (
                <p className="login-message">{error}</p>
            )}

            <div className="instructor-details">
                <h2>Record Class Attendance</h2>

                <div className="instructor-form-grid">
                    <div className="form-group">
                        <label htmlFor="classId">
                            Scheduled Class
                        </label>

                        <select
                            id="classId"
                            name="classId"
                            value={formData.classId}
                            onChange={handleInputChange}
                        >
                            <option value="">
                                Select a class
                            </option>

                            {classes.map((classItem) => (
                                <option
                                    key={classItem.classId}
                                    value={classItem.classId}
                                >
                                    {classItem.classId} - {classItem.classType} -
                                    {" "}{classItem.day} at {classItem.time}
                                    {" "}({classItem.instructorId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="customerId">
                            Customer
                        </label>

                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                        >
                            <option value="">
                                Select a customer
                            </option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.customerId}
                                    value={customer.customerId}
                                >
                                    {customer.customerId} -
                                    {" "}{customer.firstName} {customer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="attendanceDateTime">
                            Attendance Date/Time
                        </label>

                        <input
                            id="attendanceDateTime"
                            name="attendanceDateTime"
                            type="datetime-local"
                            value={formData.attendanceDateTime}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                <button
                    type="button"
                    className="primary-button"
                    onClick={handleRecordAttendance}
                    disabled={saving}
                >
                    {saving ? "Recording..." : "Record Attendance"}
                </button>
                </div>
            </div>
        </div>
    );
}

export default Attendance;
