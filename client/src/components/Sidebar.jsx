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
                        <a href="#">Classes</a>
                        <NavLink to="/schedule">Class Schedule</NavLink>
                        <a href="#">Packages</a>
                        <a href="#">Sales</a>
                        <a href="#">Check-ins</a>
                        <a href="#">View Attendance</a>
                        <a href="#">Reports</a>
                    </>
                )}
        

                {user.role === "Instructor" && (
                    <>
                        <NavLink to="/schedule">My Schedule</NavLink>
                        <a href="#">Check-ins</a>
                        <a href="#">My Performance</a>
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
