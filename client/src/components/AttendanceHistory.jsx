
import { useEffect, useState } from "react";

function AttendanceHistory({ user }) {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [customerFilter, setCustomerFilter] = useState("");
    const [classes, setClasses] = useState([]);
    const [customers, setCustomers] = useState([]);

   useEffect(() => {
        const loadAttendance = async () => {
            try {
                const [attendanceResponse, classResponse, customerResponse] =
                    await Promise.all([
                        fetch("/api/attendance/getAttendance"),
                        fetch("/api/class/getSchedule"),
                        fetch("/api/customer/getCustomerIds")
                    ]);

                if (
                    !attendanceResponse.ok ||
                    !classResponse.ok ||
                    !customerResponse.ok
                ) {
                    throw new Error("Failed to load attendance information.");
                }

                const attendanceData = await attendanceResponse.json();
                const classData = await classResponse.json();
                const customerData = await customerResponse.json();

                setAttendance(attendanceData);
                setClasses(classData);
                setCustomers(customerData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, []);


    const formatDateTime = (value) => {
        return new Date(value).toLocaleString();
    };

    const formatName = (firstName, lastName) => {
        const capitalize = (value) => {
            return (value || "")
                .trim()
                .toLowerCase()
                .replace(/\b\w/g, (letter) => letter.toUpperCase());
        };

        return `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
    };

    const getCustomerName = (customerId) => {
        const customer = customers.find(
            (customer) => customer.customerId === customerId
        );

        if (!customer) return customerId;

        return formatName(customer.firstName, customer.lastName);
    };

    const getClassName = (classId) => {
        const classItem = classes.find(
            (classItem) => classItem.classId === classId
        );

        if (!classItem) return classId;

        return classItem.classType;
    };

    const filteredAttendance = attendance.filter((record) => {
        const className = getClassName(record.classId);
        const customerName = getCustomerName(record.customerId);

        const matchesClass = className
            .toLowerCase()
            .includes(classFilter.toLowerCase());

        const matchesCustomer = customerName
            .toLowerCase()
            .includes(customerFilter.toLowerCase());

        return matchesClass && matchesCustomer;
    });

    return (
        <div className="instructors-page">
            <h1>
                {user.role === "Instructor"
                    ? "My Attendance"
                    : "View Attendance"}
            </h1>

            {error && (
                <p className="login-message">{error}</p>
            )}

            <div className="instructor-details">
                <h2>Attendance History</h2>

                <div className="instructor-form-grid">
                    <div className="form-group">
                    <label htmlFor="customerFilter">
                        Filter by Customer Name
                    </label>
                    <input
                        id="customerFilter"
                        type="text"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        placeholder="e.g. John Smith"
                    />
                    </div>

                    <div className="form-group">
                        <label htmlFor="customerFilter">
                            Filter by Customer ID
                        </label>
                        <input
                            id="customerFilter"
                            type="text"
                            value={customerFilter}
                            onChange={(e) =>
                                setCustomerFilter(e.target.value)
                            }
                            placeholder="e.g. C001"
                        />
                    </div>
                </div>

                {loading ? (
                    <p>Loading attendance...</p>
                ) : filteredAttendance.length === 0 ? (
                    <p>No attendance records found.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Attendance ID</th>
                                    <th>Class</th>
                                    <th>Customer</th>
                                    <th>Date / Time</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAttendance.map((record) => (
                                    <tr key={record.attendanceId}>
                                        <td>{record.attendanceId}</td>
                                        <td>{getClassName(record.classId)}</td>
                                        <td>{getCustomerName(record.customerId)}</td>
                                        <td>
                                            {formatDateTime(
                                                record.attendanceDateTime
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttendanceHistory;
