document.addEventListener("DOMContentLoaded", () => {
    addReportDropdownListener();
});

function addReportDropdownListener() {
    const select = document.getElementById("reportType");

    select.addEventListener("change", async () => {
        const reportType = select.value;

        if (!reportType) {
            document.getElementById("reportContent").innerHTML =
                '<p class="text--center">Select a report to view results.</p>';

            return;
        }

        if (reportType === "studio") {
            await loadStudioPerformance();
        }

        if (reportType === "instructor") {
            await loadInstructorPerformance();
        }

        if (reportType === "customer") {
            await loadCustomerAttendance();
        }

        if (reportType === "class") {
            await loadClassAttendance();
        }

        if (reportType === "customerPackages") {
            await loadCustomerPackages();
        }
    });
}

//studio performance
async function loadStudioPerformance() {
    try {
        const response = await fetch(
            "/api/report/studioPerformance"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load studio performance report"
            );
        }

        const data = await response.json();

        displayStudioPerformance(data);

    } catch (error) {
        console.error(
            "Failed to load studio performance report:",
            error
        );
    }
}

function displayStudioPerformance(data) {
    const reportContent =
        document.getElementById("reportContent");

    let tableRows = "";

    data.packageSummary.forEach((packageItem) => {
        tableRows += `
            <tr>
                <td>${packageItem.packageId}</td>
                <td>${packageItem.packageName}</td>
                <td>${packageItem.packagesSold}</td>
                <td>$${packageItem.revenue.toFixed(2)}</td>
            </tr>
        `;
    });

    reportContent.innerHTML = `
        <h2 class="text--center">
            Studio Performance Report
        </h2>

        <p>
            <strong>Total Sales:</strong>
            ${data.totalSales}
        </p>

        <p>
            <strong>Total Revenue:</strong>
            $${data.totalRevenue.toFixed(2)}
        </p>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Package ID</th>
                    <th>Package</th>
                    <th>Packages Sold</th>
                    <th>Revenue</th>
                </tr>
            </thead>

            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}




//instructor performance
async function loadInstructorPerformance() {
    try {
        const response = await fetch(
            "/api/report/instructorPerformance"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load instructor performance report"
            );
        }

        const data = await response.json();

        displayInstructorPerformance(data);

    } catch (error) {
        console.error(
            "Failed to load instructor performance report:",
            error
        );
    }
}

function displayInstructorPerformance(data) {
    const reportContent =
        document.getElementById("reportContent");

    let tableRows = "";

    data.instructorSummary.forEach((instructor) => {
        tableRows += `
            <tr>
                <td>${instructor.instructorId}</td>
                <td>${instructor.instructorName}</td>
                <td>${instructor.classes.join(", ") || "None"}</td>
                <td>${instructor.totalCheckIns}</td>
            </tr>
        `;
    });

    reportContent.innerHTML = `
        <h2 class="text--center">
            Instructor Performance Report
        </h2>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Instructor ID</th>
                    <th>Instructor</th>
                    <th>Classes</th>
                    <th>Total Check-ins</th>
                </tr>
            </thead>

            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}


//customer attendance
async function loadCustomerAttendance() {
    try {
        const response = await fetch(
            "/api/report/customerAttendance"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load customer attendance report"
            );
        }

        const data = await response.json();

        displayCustomerAttendance(data);

    } catch (error) {
        console.error(
            "Failed to load customer attendance report:",
            error
        );
    }
}

function displayCustomerAttendance(data) {
    const reportContent =
        document.getElementById("reportContent");

    let tableRows = "";

    data.customerSummary.forEach((customer) => {
        tableRows += `
            <tr>
                <td>${customer.customerId}</td>
                <td>${customer.customerName}</td>
                <td>${customer.classBalance}</td>
                <td>${customer.totalCheckIns}</td>
            </tr>
        `;
    });

    reportContent.innerHTML = `
        <h2 class="text--center">
            Customer Attendance Report
        </h2>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Customer</th>
                    <th>Class Balance</th>
                    <th>Total Check-ins</th>
                </tr>
            </thead>

            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

//class attendance
async function loadClassAttendance() {
    try {
        const response = await fetch(
            "/api/report/classAttendance"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load class attendance report"
            );
        }

        const data = await response.json();

        displayClassAttendance(data);

    } catch (error) {
        console.error(
            "Failed to load class attendance report:",
            error
        );
    }
}

function displayClassAttendance(data) {
    const reportContent =
        document.getElementById("reportContent");

    let tableRows = "";

    data.classSummary.forEach((classItem) => {
        tableRows += `
            <tr>
                <td>${classItem.classId}</td>
                <td>${classItem.instructorId}</td>
                <td>${classItem.day}</td>
                <td>${formatTime(classItem.time)}</td>
                <td>${classItem.classType}</td>
                <td>${classItem.totalCheckIns}</td>
            </tr>
        `;
    });

    reportContent.innerHTML = `
        <h2 class="text--center">
            Class Attendance Report
        </h2>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Class ID</th>
                    <th>Instructor ID</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Class Type</th>
                    <th>Total Check-ins</th>
                </tr>
            </thead>

            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}



//customer packages
async function loadCustomerPackages() {
    try {
        const response = await fetch(
            "/api/report/customerPackages"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load customer package report"
            );
        }

        const data = await response.json();

        displayCustomerPackages(data);

    } catch (error) {
        console.error(
            "Failed to load customer package report:",
            error
        );
    }
}

function displayCustomerPackages(data) {
    const reportContent =
        document.getElementById("reportContent");

    let tableRows = "";

    data.customerSummary.forEach((customer) => {

        if (customer.packages.length === 0) {
            tableRows += `
                <tr>
                    <td>${customer.customerId}</td>
                    <td>${customer.customerName}</td>
                    <td>None</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            `;

            return;
        }

        customer.packages.forEach((packageItem) => {
            tableRows += `
                <tr>
                    <td>${customer.customerId}</td>
                    <td>${customer.customerName}</td>
                    <td>
                        ${packageItem.packageId}: 
                        ${packageItem.packageName}
                    </td>
                    <td>
                        ${formatDate(packageItem.validityStartDate)}
                    </td>
                    <td>
                        ${formatDate(packageItem.validityEndDate)}
                    </td>
                    <td>${packageItem.status}</td>
                </tr>
            `;
        });
    });

    reportContent.innerHTML = `
        <h2 class="text--center">
            Customer Package Report
        </h2>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}


//formatting functions
function formatTime(time) {
    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}