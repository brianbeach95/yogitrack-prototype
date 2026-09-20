let attendanceRecords = [];
let customers = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadCustomers();
    await loadClasses();
    await loadAttendance();

    document
        .getElementById("classFilter")
        .addEventListener("change", filterAttendance);
});

async function loadCustomers() {
    try {
        const response = await fetch(
            "/api/customer/getCustomerIds"
        );

        if (!response.ok) {
            throw new Error("Failed to load customers");
        }

        customers = await response.json();

    } catch (error) {
        console.error("Failed to load customers:", error);
    }
}

async function loadClasses() {
    try {
        const response = await fetch(
            "/api/class/getClassIds"
        );

        if (!response.ok) {
            throw new Error("Failed to load classes");
        }

        const classes = await response.json();

        const select = document.getElementById("classFilter");

        classes.forEach((classItem) => {
            const option = document.createElement("option");

            option.value = classItem.classId;

            option.textContent =
                `${classItem.classId}: ${classItem.day} ${formatTime(classItem.time)}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load classes:", error);
    }
}

async function loadAttendance() {
    try {
        const response = await fetch(
            "/api/attendance/getAttendance"
        );

        if (!response.ok) {
            throw new Error("Failed to load attendance");
        }

        attendanceRecords = await response.json();

        displayAttendance(attendanceRecords);

    } catch (error) {
        console.error("Failed to load attendance:", error);
    }
}

function displayAttendance(records) {
    const tableBody =
        document.getElementById("attendanceTableBody");

    tableBody.innerHTML = "";

    records.forEach((record) => {

        const customer = customers.find(
            (customer) =>
                customer.customerId === record.customerId
        );

        const customerName = customer
            ? `${record.customerId}: ${customer.firstName} ${customer.lastName}`
            : record.customerId;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.attendanceId}</td>
            <td>${record.classId}</td>
            <td>${customerName}</td>
            <td>${formatDateTime(record.attendanceDateTime)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function filterAttendance() {
    const classId =
        document.getElementById("classFilter").value;

    if (!classId) {
        displayAttendance(attendanceRecords);
        return;
    }

    const filteredRecords = attendanceRecords.filter(
        (record) => record.classId === classId
    );

    displayAttendance(filteredRecords);
}

function formatTime(time) {
    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatDateTime(dateTime) {
    const date = new Date(dateTime);

    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}