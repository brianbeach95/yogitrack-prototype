document.addEventListener("DOMContentLoaded", () => {
    initAttendanceId();
    initClassDropdown();
    initCustomerDropdown();
    addCustomerDropdownListener();
    initAttendanceDateTime();
});

async function initAttendanceId() {
    try {
        const response = await fetch("/api/attendance/getNextId");

        if (!response.ok) {
            throw new Error("Failed to generate Attendance ID");
        }

        const data = await response.json();

        document.getElementById("attendanceId").value = data.nextId;

    } catch (error) {
        console.error("Failed to generate Attendance ID:", error);
    }
}

async function initClassDropdown() {
    const select = document.getElementById("classId");

    select.innerHTML = '<option value="">-- Select Class --</option>';

    try {
        const response = await fetch("/api/class/getClassIds");

        if (!response.ok) {
            throw new Error("Failed to load classes");
        }

        const classes = await response.json();

        classes.forEach((classItem) => {
            const option = document.createElement("option");

            option.value = classItem.classId;

            option.textContent =
                `${classItem.classId}: ${classItem.day} ${classItem.time} - ${classItem.instructorId}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load classes:", error);
    }
}

async function initCustomerDropdown() {
    const select = document.getElementById("customerId");

    select.innerHTML = '<option value="">-- Select Customer --</option>';

    try {
        const response = await fetch("/api/customer/getCustomerIds");

        if (!response.ok) {
            throw new Error("Failed to load customers");
        }

        const customers = await response.json();

        customers.forEach((customer) => {
            const option = document.createElement("option");

            option.value = customer.customerId;

            option.textContent =
                `${customer.customerId}: ${customer.firstName} ${customer.lastName}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load customers:", error);
    }
}

function addCustomerDropdownListener() {
    const select = document.getElementById("customerId");

    select.addEventListener("change", async () => {
        const customerId = select.value;

        if (!customerId) {
            document.getElementById("classBalance").value = "";
            return;
        }

        try {
            const response = await fetch(`/api/customer/getCustomer?customerId=${customerId}`);

            if (!response.ok) {
                throw new Error("Failed to load customer");
            }

            const customer = await response.json();

            document.getElementById("classBalance").value =
                customer.classBalance ?? 0;

        } catch (error) {
            console.error("Failed to load customer:", error);
        }
    });
}

function initAttendanceDateTime() {
    const now = new Date();

    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

    document.getElementById("attendanceDateTime").value = localDateTime;
}


//check in button
document.getElementById("checkInBtn").addEventListener("click", async () => {
    const form = document.getElementById("attendanceForm");

    if (!form.checkValidity()) {
        alert("Please complete all required fields.");
        return;
    }

    const attendanceData = {
        classId: form.classId.value,
        customerId: form.customerId.value,
        attendanceDateTime: form.attendanceDateTime.value
    };

    try {
        const response = await fetch("/api/attendance/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(attendanceData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        if (result.unlimited) {
            alert(
                `Check-in recorded successfully!\n` +
                `Attendance ID: ${result.attendance.attendanceId}\n` +
                `Unlimited package - class balance unchanged.`
            );
        } else {
            alert(
                `Check-in recorded successfully!\n` +
                `Attendance ID: ${result.attendance.attendanceId}\n` +
                `New class balance: ${result.classBalance}`
            );
        }

        form.reset();
        document.getElementById("classBalance").value = "";

        initAttendanceId();
        initAttendanceDateTime();


    } catch (error) {
        alert("Error: " + error.message);
    }
});


document.getElementById("clearBtn").addEventListener("click", () => {
    const form = document.getElementById("attendanceForm");

    form.reset();

    document.getElementById("classBalance").value = "";

    initAttendanceId();
    initAttendanceDateTime();
});