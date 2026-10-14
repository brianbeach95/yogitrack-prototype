import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const dayNumbers = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
};

function getUpcomingClasses(classes) {
    const now = new Date();

    return classes
        .map((classItem) => {
            const [hours, minutes] = classItem.time
                .split(":")
                .map(Number);

            const nextDate = new Date(now);

            const daysUntil =
                (dayNumbers[classItem.day] - now.getDay() + 7) % 7;

            nextDate.setDate(now.getDate() + daysUntil);
            nextDate.setHours(hours, minutes, 0, 0);

            // If today's class has already started,
            // show its next occurrence.
            if (nextDate <= now) {
                nextDate.setDate(nextDate.getDate() + 7);
            }

            return {
                ...classItem,
                nextDate
            };
        })
        .sort((a, b) => a.nextDate - b.nextDate)
        .slice(0, 5);
}

function Dashboard({ user }) {
    const [stats, setStats] = useState({
        customers: 0,
        revenue: 0,
        classes: 0,
        checkIns: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [scheduleError, setScheduleError] = useState("");
    const [instructorNames, setInstructorNames] = useState({});

    useEffect(() => {
        if (user.role !== "Manager") {
            setLoading(false);
            return;
        }

        const loadStats = async () => {
            try {
                const endpoints = [
                    "/api/report/studioPerformance",
                    "/api/report/classAttendance",
                    "/api/report/customerAttendance"
                ];

                const results = await Promise.all(
                    endpoints.map(async (url) => {
                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error("Unable to load dashboard statistics.");
                        }

                        return response.json();
                    })
                );

                const [sales, attendance, customers] = results;

                const classSummary = attendance.classSummary || [];
                const customerSummary = customers.customerSummary || [];

                setStats({
                    customers: customerSummary.length,
                    revenue: sales.totalRevenue || 0,
                    classes: classSummary.length,
                    checkIns: classSummary.reduce(
                        (total, item) => total + Number(item.totalCheckIns || 0),
                        0
                    )
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user.role]);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const response = await fetch("/api/class/getSchedule");

                if (!response.ok) {
                    throw new Error("Unable to load upcoming classes.");
                }

                const data = await response.json();
                setUpcomingClasses(getUpcomingClasses(data));
                if (user.role === "Manager") {
                const response = await fetch("/api/report/instructorPerformance");

                if (response.ok) {
                    const report = await response.json();
                    // console.log("Instructor performance report:", report);

                    const names = Object.fromEntries(
                        (report.instructorSummary || []).map((instructor) => [
                            instructor.instructorId,
                            instructor.instructorName
                        ])
                    );

                    setInstructorNames(names);
                }
            }

            } catch (err) {
                setScheduleError(err.message);
            } finally {
                setScheduleLoading(false);
            }
        };

        loadSchedule();
    }, [user.role]);


    const formatMoney = (amount) =>
        Number(amount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });

    return (
        <div className="studio-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user.username}!</h1>
                    <p>
                        {user.role === "Manager"
                            ? "Here's what's happening at the studio."
                            : "Here's your instructor overview."}
                    </p>
                </div>
            </div>

            {user.role === "Manager" && (
                <>
                    {loading ? (
                        <p>Loading dashboard...</p>
                    ) : error ? (
                        <p className="login-message">{error}</p>
                    ) : (
                        <div className="dashboard-stats">
                            <div className="dashboard-stat-card">
                                <span>Total Customers</span>
                                <h2>{stats.customers}</h2>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Total Revenue</span>
                                <h2>{formatMoney(stats.revenue)}</h2>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Weekly Classes</span>
                                <h2>{stats.classes}</h2>
                            </div>

                            <div className="dashboard-stat-card">
                                <span>Total Check-ins</span>
                                <h2>{stats.checkIns}</h2>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="dashboard-quick-actions">
                <h2>Quick Actions</h2>

                <div className="dashboard-action-grid">
                    {user.role === "Manager" && (
                        <>
                            <Link to="/customers">Manage Customers</Link>
                            <Link to="/sales">Record Sale</Link>
                            <Link to="/reports">View Reports</Link>
                        </>
                    )}

                    <Link to="/schedule">View Schedule</Link>
                    <Link to="/attendance">Record Check-in</Link>
                    <Link to="/attendance/history">Attendance History</Link>
                </div>
            </div>

            <div className="dashboard-upcoming">
                <div className="dashboard-section-header">
                    <h2>Upcoming Classes</h2>
                    <Link to="/schedule">View Full Schedule →</Link>
                </div>

                {scheduleLoading ? (
                    <p>Loading upcoming classes...</p>
                ) : scheduleError ? (
                    <p className="login-message">{scheduleError}</p>
                ) : upcomingClasses.length === 0 ? (
                    <p>No upcoming classes found.</p>
                ) : (
                    <div className="dashboard-class-list">
                        {upcomingClasses.map((classItem) => (
                            <div
                                className="dashboard-class-item"
                                key={classItem.classId}
                            >
                                <div>
                                    <strong>{classItem.classType}</strong>
                                    <p> Instructor:{" "} {instructorNames[classItem.instructorId] || classItem.instructorId}
                                    </p>
                                </div>

                                <div>
                                    <strong>
                                        {classItem.nextDate.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </strong>
                                    <p>
                                        {classItem.nextDate.toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
