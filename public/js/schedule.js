let schedule = [];
let instructors = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadInstructors();
    await loadSchedule();

    document
        .getElementById("instructorFilter")
        .addEventListener("change", filterSchedule);
});

async function loadInstructors() {
    try {
        const response = await fetch("/api/instructor/getInstructorIds");

        if (!response.ok) {
            throw new Error("Failed to load instructors");
        }

        instructors = await response.json();

        const select =
            document.getElementById("instructorFilter");

        instructors.forEach(instructor => {
            const option = document.createElement("option");

            option.value = instructor.instructorId;
            option.textContent =
                `${instructor.instructorId}: ` +
                `${instructor.firstName} ${instructor.lastName}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load instructors:", error);
    }
}

async function loadSchedule() {
    try {
        const response = await fetch("/api/class/getSchedule");

        if (!response.ok) {
            throw new Error("Failed to load class schedule");
        }

        schedule = await response.json();

        displaySchedule(schedule);

    } catch (error) {
        console.error("Failed to load schedule:", error);
    }
}

function displaySchedule(classes) {
    const tableBody = document.getElementById("scheduleTableBody");

    tableBody.innerHTML = "";

    classes.forEach(classItem => {
        const instructor = instructors.find(instructor => instructor.instructorId === classItem.instructorId);

        const instructorName = instructor
            ? `${instructor.firstName} ${instructor.lastName}`
            : classItem.instructorId;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${classItem.classId}</td>
            <td>${instructorName}</td>
            <td>${classItem.day}</td>
            <td>${formatTime(classItem.time)}</td>
            <td>${classItem.classType}</td>
        `;

        tableBody.appendChild(row);
    });
}

function filterSchedule() {
    const instructorId =
        document.getElementById("instructorFilter").value;

    if (!instructorId) {
        displaySchedule(schedule);
        return;
    }

    const filteredClasses = schedule.filter(
        classItem =>
            classItem.instructorId === instructorId
    );

    displaySchedule(filteredClasses);
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