
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout({ user, handleLogout }) {
    return (
        <div className="app-layout">
            <Sidebar
                user={user}
                handleLogout={handleLogout}
            />

            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
