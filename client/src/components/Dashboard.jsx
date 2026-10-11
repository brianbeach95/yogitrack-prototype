
function Dashboard({ user }) {
    return (
        <div>
            <h1>Welcome, {user.username}</h1>

            {user.role === "Manager" && (
                <h2>Manager Dashboard</h2>
            )}

            {user.role === "Instructor" && (
                <h2>Instructor Dashboard</h2>
            )}
        </div>
    );
}

export default Dashboard;
