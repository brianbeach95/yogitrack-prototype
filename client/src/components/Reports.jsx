
import { useEffect, useState } from "react";

const reportEndpoints = {
    sales: "/api/report/studioPerformance",
    classes: "/api/report/classAttendance",
    instructors: "/api/report/instructorPerformance",
    customers: "/api/report/customerAttendance",
    packages: "/api/report/customerPackages"
};

const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });

const formatName = (name) =>
    (name || "").trim().toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) =>
    value ? String(value).slice(0, 10) : "—";

function Reports() {
    const [activeTab, setActiveTab] = useState("sales");
    const [reports, setReports] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReports = async () => {
            try {
                const entries = await Promise.all(
                    Object.entries(reportEndpoints).map(async ([key, url]) => {
                        const response = await fetch(url);
                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                data.message || `Failed to load ${key} report.`
                            );
                        }

                        return [key, data];
                    })
                );

                setReports(Object.fromEntries(entries));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const sales = reports.sales || {};
    const classSummary = reports.classes?.classSummary || [];
    const instructorSummary = reports.instructors?.instructorSummary || [];
    const instructorNames = Object.fromEntries(
    instructorSummary.map((instructor) => [
            instructor.instructorId,
            instructor.instructorName
        ])
    );
    const customerSummary = reports.customers?.customerSummary || [];
    const customerPackages = reports.packages?.customerSummary || [];

    const totalCheckIns = classSummary.reduce(
        (sum, item) => sum + item.totalCheckIns, 0
    );

    const lowBalanceCount = customerSummary.filter(
        (customer) => customer.classBalance <= 0
    ).length;

    const renderMetric = (label, value) => (
        <div className="report-metric">
            <p>{label}</p>
            <h2>{value}</h2>
        </div>
    );

    return (
        <div className="instructors-page">
            <h1>Studio Reports</h1>

            <div className="report-tabs">
                <button
                    type="button"
                    className={activeTab === "sales" ? "active" : ""}
                    onClick={() => setActiveTab("sales")}
                >
                    Sales
                </button>

                <button
                    type="button"
                    className={activeTab === "attendance" ? "active" : ""}
                    onClick={() => setActiveTab("attendance")}
                >
                    Attendance
                </button>

                <button
                    type="button"
                    className={activeTab === "customers" ? "active" : ""}
                    onClick={() => setActiveTab("customers")}
                >
                    Customers
                </button>
            </div>

            {error && <p className="login-message">{error}</p>}

            {loading ? (
                <p>Loading reports...</p>
            ) : error ? null : (
                <div className="instructor-details">

                    {activeTab === "sales" && (
                        <>
                            <h2>Sales Report</h2>

                            <div className="report-metrics">
                                {renderMetric(
                                    "Total Revenue",
                                    formatMoney(sales.totalRevenue)
                                )}
                                {renderMetric(
                                    "Total Sales",
                                    sales.totalSales || 0
                                )}
                                {renderMetric(
                                    "Average Sale",
                                    formatMoney(
                                        sales.totalSales
                                            ? sales.totalRevenue / sales.totalSales
                                            : 0
                                    )
                                )}
                            </div>

                            <h3>Sales by Package</h3>

                            <div className="report-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Package</th>
                                            <th>Packages Sold</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(sales.packageSummary || []).map((pkg) => (
                                            <tr key={pkg.packageId}>
                                                <td>{pkg.packageName}</td>
                                                <td>{pkg.packagesSold}</td>
                                                <td>{formatMoney(pkg.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === "attendance" && (
                        <>
                            <h2>Attendance Report</h2>

                            <div className="report-metrics">
                                {renderMetric("Total Check-ins", totalCheckIns)}
                                {renderMetric("Scheduled Classes", classSummary.length)}
                                {renderMetric("Instructors", instructorSummary.length)}
                            </div>

                            <h3>Attendance by Class</h3>

                            <div className="report-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Class</th>
                                            <th>Day</th>
                                            <th>Time</th>
                                            <th>Instructor</th>
                                            <th>Check-ins</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classSummary.map((item) => (
                                            <tr key={item.classId}>
                                                <td>{item.classType}</td>
                                                <td>{item.day}</td>
                                                <td>{item.time}</td>
                                                <td>
                                                    {formatName(instructorNames[item.instructorId] || item.instructorId)}
                                                </td>
                                                <td>{item.totalCheckIns}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3>Attendance by Instructor</h3>

                            <div className="report-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Instructor</th>
                                            <th>Assigned Classes</th>
                                            <th>Check-ins</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {instructorSummary.map((item) => (
                                            <tr key={item.instructorId}>
                                                <td>{formatName(item.instructorName)}</td>
                                                <td>{item.classes.length}</td>
                                                <td>{item.totalCheckIns}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === "customers" && (
                        <>
                            <h2>Customer Report</h2>

                            <div className="report-metrics">
                                {renderMetric("Total Customers", customerSummary.length)}
                                {renderMetric("Zero / Negative Balance", lowBalanceCount)}
                                {renderMetric(
                                    "Total Customer Check-ins",
                                    customerSummary.reduce(
                                        (sum, item) => sum + item.totalCheckIns, 0
                                    )
                                )}
                            </div>

                            <h3>Customer Attendance and Balances</h3>

                            <div className="report-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Class Balance</th>
                                            <th>Total Check-ins</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerSummary.map((item) => (
                                            <tr key={item.customerId}>
                                                <td>{formatName(item.customerName)}</td>
                                                <td>{item.classBalance}</td>
                                                <td>{item.totalCheckIns}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3>Customer Package Purchases</h3>

                            <div className="report-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Package</th>
                                            <th>Start</th>
                                            <th>End</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerPackages.flatMap((customer) =>
                                            customer.packages.map((pkg, index) => (
                                                <tr key={`${customer.customerId}-${index}`}>
                                                    <td>{formatName(customer.customerName)}</td>
                                                    <td>{pkg.packageName}</td>
                                                    <td>{formatDate(pkg.validityStartDate)}</td>
                                                    <td>{formatDate(pkg.validityEndDate)}</td>
                                                    <td>{pkg.status}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Reports;
