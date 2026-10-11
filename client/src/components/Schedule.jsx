
import { useEffect, useState } from "react";

function Schedule() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch("/api/class/getSchedule");

                if (!response.ok) {
                    throw new Error("Failed to load class schedule");
                }

                const data = await response.json();
                setClasses(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    if (loading) {
        return <p>Loading class schedule...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="schedule-page">
            <h1>Class Schedule</h1>

            {classes.length === 0 ? (
                <p>No classes are currently scheduled.</p>
            ) : (
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Class ID</th>
                            <th>Instructor</th>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Class Type</th>
                        </tr>
                    </thead>

                    <tbody>
                        {classes.map((classItem) => (
                            <tr key={classItem.classId}>
                                <td>{classItem.classId}</td>
                                <td>{classItem.instructorId}</td>
                                <td>{classItem.day}</td>
                                <td>{classItem.time}</td>
                                <td>{classItem.classType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Schedule;
