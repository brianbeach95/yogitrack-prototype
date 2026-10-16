import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Schedule from "./components/Schedule";
import "./App.css"
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Instructors from "./components/Instructors";
import Customers from "./components/Customers";
import Classes from "./components/Classes";
import Packages from "./components/Packages";
import Sales from "./components/Sales";
import Attendance from "./components/Attendance";
import AttendanceHistory from "./components/AttendanceHistory";
import Reports from "./components/Reports";
import MyPerformance from "./components/MyPerformance";
import { Toaster } from "react-hot-toast";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");


    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("/api/user/me");

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Session check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [])

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data.user);
      setMessage("");
    } else {
      setMessage(data.message);
    }
  };

  const handleLogout = async () => {
    const response = await fetch("/api/user/logout", {
      method: "POST",
    });

    if (response.ok) {
      setUser(null);
      setUsername("");
      setPassword("");
      setMessage("");
    }
  };

    if (loading) {
        return <div className="loading-screen">Loading YogiTrack...</div>;
    }


    if (user) {
        return (
            <>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#ffffff",
                            color: "#34473c",
                            border: "1px solid #e2e9e1",
                            borderRadius: "10px",
                            padding: "14px 18px"
                        }
                    }}
                />
                <Routes>
                    <Route
                        element={
                            <AppLayout
                                user={user}
                                handleLogout={handleLogout}
                            />
                        }
                    >
                        <Route
                            path="/"
                            element={<Dashboard user={user} />}
                        />

                        <Route
                            path="/schedule"
                            element={<Schedule />}
                        />

                        <Route
                            path="/instructors"
                            element={
                                user.role === "Manager"
                                    ? <Instructors />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="/customers"
                            element={
                                user.role === "Manager"
                                    ? <Customers />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="/classes"
                            element={
                                user.role === "Manager"
                                    ? <Classes />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="/packages"
                            element={
                                user.role === "Manager"
                                    ? <Packages />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="/sales"
                            element={
                                user.role === "Manager"
                                    ? <Sales />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route path="attendance" element={<Attendance />} />

                        <Route
                            path="attendance/history"
                            element={<AttendanceHistory user={user} />}
                        />

                        <Route
                            path="/reports"
                            element={
                                user.role === "Manager"
                                    ? <Reports />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="/my-performance"
                            element={
                                user.role === "Instructor"
                                    ? <MyPerformance />
                                    : <Navigate to="/" replace />
                            }
                        />

                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Route>
                </Routes>
            </>
        );
    }


    return (
        <Login
            username={username}
            password={password}
            message={message}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
        />
    )
}

export default App;
