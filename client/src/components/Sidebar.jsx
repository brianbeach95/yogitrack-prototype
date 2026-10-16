import { NavLink } from "react-router-dom";

function Sidebar({ user, handleLogout }) {

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <img
                    src="/images/Logo.png"
                    alt="YogiTrack Logo"
                    className="sidebar-logo"
                />
            </div>

            <nav className="sidebar-nav">

                <NavLink to="/">Dashboard</NavLink>

                {user.role === "Manager" && (
                    <>
                        <NavLink to="/customers">Customers</NavLink>
                        <NavLink to="/instructors">Instructors</NavLink>
                        <NavLink to="/classes">Classes</NavLink>
                        <NavLink to="/schedule">Class Schedule</NavLink>
                        <NavLink to="/packages">Packages</NavLink>
                        <NavLink to="/sales">Sales</NavLink>
                        <NavLink to="/attendance" end>Check-ins</NavLink>
                        <NavLink to="/attendance/history">View Attendance</NavLink>
                        <NavLink to="/reports">Reports</NavLink>
                    </>
                )}
        

                {user.role === "Instructor" && (
                    <>
                        <NavLink to="/schedule">My Schedule</NavLink>
                        <NavLink to="/attendance" end>Check-ins</NavLink>
                        <NavLink to="/attendance/history">My Attendance</NavLink>
                        <NavLink to="/my-performance">My Performance</NavLink>
                    </>
                )}

            </nav>

            <div className="sidebar-footer">
                <p>{user.username}</p>
                <small>{user.role}</small>

                <button onClick={handleLogout}>
                    Log Out
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;
