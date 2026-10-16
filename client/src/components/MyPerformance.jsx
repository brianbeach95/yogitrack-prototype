
import { useEffect, useState } from "react";

function MyPerformance() {
    const [instructor, setInstructor] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPerformance = async () => {
            try {
                const [instructorResponse, classResponse] = await Promise.all([
                    fetch("/api/report/instructorPerformance"),
                    fetch("/api/report/classAttendance")
                ]);

                const instructorData = await instructorResponse.json();
                const classData = await classResponse.json();

                if (!instructorResponse.ok || !classResponse.ok) {
                    throw new Error(
                        instructorData.message ||
                        classData.message ||
                        "Failed to load performance."
                    );
                }

                const summary = instructorData.instructorSummary || [];
                setInstructor(summary[0] || null);
                setClasses(classData.classSummary || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPerformance();
    }, []);

    const assignedClasses = instructor?.classes?.length || 0;
    const totalCheckIns = instructor?.totalCheckIns || 0;
    const averageAttendance = assignedClasses
        ? (totalCheckIns / assignedClasses).toFixed(1)
        : "0.0";

    const renderMetric = (label, value) => (
        <div className="report-metric">
            <p>{label}</p>
            <h2>{value}</h2>
        </div>
    );

    return (
        <div className="instructors-page">
            <h1>My Performance</h1>

            {error && <p className="login-message">{error}</p>}

            {loading ? (
                <p>Loading performance...</p>
            ) : error ? null : (
                <div className="instructor-details">
                    <h2>Performance Overview</h2>

                    <div className="report-metrics">
                        {renderMetric("Assigned Classes", assignedClasses)}
                        {renderMetric("Total Check-ins", totalCheckIns)}
                        {renderMetric("Check-ins per Assigned Class", averageAttendance)}
                    </div>

                    <h3>Attendance by Class</h3>

                    <div className="report-table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Check-ins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">No assigned classes found.</td>
                                    </tr>
                                ) : (
                                    classes.map((item) => (
                                        <tr key={item.classId}>
                                            <td>{item.classType}</td>
                                            <td>{item.day}</td>
                                            <td>{item.time}</td>
                                            <td>{item.totalCheckIns}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyPerformance;
