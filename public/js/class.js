let formMode = "search";

//make it so drop downs are either enabled or disabled
document.getElementById("searchBtn").addEventListener("click", () => {
    setFormForSearch();
});

function setClassFieldsEditable(editable) {
    document.getElementById("instructorId").disabled = !editable;
    document.getElementById("day").disabled = !editable;
    document.getElementById("time").readOnly = !editable;
    document.getElementById("classType").disabled = !editable;
    document.getElementById("payRate").readOnly = !editable;
}

//drop down
document.addEventListener("DOMContentLoaded", () => {
    setFormForSearch();
    initInstructorDropdown();
    initClassDropdown();
    addClassDropdownListener();
});

function setFormForSearch() {
    formMode = "search";
    document.getElementById("classForm").reset();

    document.getElementById("classIdSearchSelection").style.display = "block";
    document.getElementById("classIdAddSelection").style.display = "none";
    document.getElementById("classIdText").value = "";

    setClassFieldsEditable(false);
}


async function initInstructorDropdown() {
    const select = document.getElementById("instructorId");

    select.innerHTML =
        '<option value=""> -- Select Instructor --</option>';
    try {
        const response = await fetch("/api/instructor/getInstructorIds");

        if (!response.ok) {
            throw new Error("Failed to load instructors");
        }

        const instructors = await response.json();

        instructors.forEach((instructor) => {
            const option = document.createElement("option");

            option.value = instructor.instructorId;
            option.textContent =
                `${instructor.instructorId}: ${instructor.firstName} ${instructor.lastName}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load instructors:", error);
    }
}


async function initClassDropdown() {
    const select = document.getElementById("classIdSelect");

    select.innerHTML =
        '<option value=""> -- Select Class Id --</option>';

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
                `${classItem.classId}: ${classItem.instructorId} - ${classItem.day} ${classItem.time}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load classes:", error);
    }
}


//add functionality
document.getElementById("addBtn").addEventListener("click", async () => {
    setFormForAdd();
    try {
        const response = await fetch("/api/class/getNextId");
        if (!response.ok) throw new Error("Failed to make Class Id");

        const data = await response.json();

        document.getElementById("classIdText").value = data.nextId;
    }catch(error) {
        alert("Error making Class ID: ", error.message);
    }

});

function setFormForAdd() {
    formMode = "add";

    document.getElementById("classIdSearchSelection").style.display = "none";
    document.getElementById("classIdAddSelection").style.display = "block";

    document.getElementById("classIdText").value = "";

    document.getElementById("classForm").reset();

    setClassFieldsEditable(true);
}

async function addClassDropdownListener() {
    const form = document.getElementById("classForm");
    const select = document.getElementById("classIdSelect");


    select.addEventListener("change", async () => {
        const classId = select.value;

        if (!classId) {
            return;
        }

        try {
            const response = await fetch(`/api/class/getClass?classId=${classId}`);

            if (!response.ok) {
                throw new Error("Class search failed");
            }

            const data = await response.json();

            if (!data || Object.keys(data).length === 0) {
                alert("No class found");
                return;
            }

            form.instructorId.value = data.instructorId || "";
            form.day.value = data.day || "";
            form.time.value = data.time || "";
            form.classType.value = data.classType || "";
            form.payRate.value = data.payRate ?? "";

        } catch (error) {
            alert(
                `Error searching class: ${classId} - ${error.message}`
            );
        }
    });
}

document.getElementById("saveBtn").addEventListener("click", async () => {
    console.log("Save clicked");
    console.log("Current form mode:", formMode);

    if (formMode === "add") {
        const form = document.getElementById("classForm");

        if (!form.checkValidity()) {
            alert("Please fill in all required fields.");
            return;
        }

        const classData = {
            instructorId: form.instructorId.value,
            day: form.day.value,
            time: form.time.value,
            classType: form.classType.value,
            payRate: form.payRate.value
        };

        try {
            const response = await fetch("/api/class/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(classData)
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409 && result.alternatives) {
                    const alternatives = result.alternatives
                        .map(time => {
                            const [hours, minutes] = time.split(":");
                            const date = new Date();
                            date.setHours(hours, minutes);
                            return date.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit"
                            });
                        }).join(", ");

                    alert( `${result.message}\n\nAvailable times: ${alternatives}`);

                    return;
                }

                throw new Error(result.message || "Failed to add class");
            }

            alert(
                `Class ${result.class.classId} added successfully!`
            );

            form.reset();
            setFormForSearch();
            initClassDropdown();

        } catch (error) {
            alert("Error: " + error.message);
        }
    }
});


//clear form
document.getElementById("clearBtn").addEventListener("click", () => {
    if (formMode === "add") {
        const classId = document.getElementById("classIdText").value;
        document.getElementById("classForm").reset();
        document.getElementById("classIdText").value = classId;
    } else {
        setFormForSearch();
    }
});


//update functionality
document.getElementById("updateBtn").addEventListener("click", async () => {
    const form = document.getElementById("classForm");
    const select = document.getElementById("classIdSelect");

    const classId = select.value;

    if (!classId) {
        alert("Please select a class to update.");
        return;
    }

    // put into update mode
    if (formMode !== "update") {
        formMode = "update";
        setClassFieldsEditable(true);

        alert("Class fields are now editable. Make your changes and click Update again to save.");
        return;
    }

    // saves changes
    if (!form.checkValidity()) {
        alert("Please fill in all required fields.");
        return;
    }

    const classData = {
        classId: classId,
        instructorId: form.instructorId.value,
        day: form.day.value,
        time: form.time.value,
        classType: form.classType.value,
        payRate: form.payRate.value
    };

    try {
        const response = await fetch("/api/class/updateClass", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(classData)
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 409 && result.alternatives) {
                const alternatives = result.alternatives
                    .map(time => {
                        const [hours, minutes] = time.split(":");
                        const date = new Date();
                        date.setHours(hours, minutes);

                        return date.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit"
                        });
                    })
                    .join(", ");

                alert(`${result.message}\n\nAvailable times: ${alternatives}`);
                return;
            }

            throw new Error(result.message || "Class update failed");
        }

        alert(`Class ${classId} successfully updated`);

        setFormForSearch();
        initClassDropdown();

    } catch (error) {
        alert("Error: " + error.message);
    }
});

//delete logic
document.getElementById("deleteBtn").addEventListener("click", async () => {
    const select = document.getElementById("classIdSelect");
    const classId = select.value;

    if (!classId) {
        alert("Please select a class to delete.");
        return;
    }

    try {
        const response = await fetch(
            `/api/class/deleteClass?classId=${classId}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Class delete failed"
            );
        }

        alert(`Class ${classId} successfully deleted`);

        setFormForSearch();
        initClassDropdown();

    } catch (error) {
        alert("Error: " + error.message);
    }
});