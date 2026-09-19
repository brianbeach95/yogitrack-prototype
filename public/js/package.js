let formMode = "search";

//package drop down search functionality
document.addEventListener("DOMContentLoaded", () => {
    setFormForSearch();
    initPackageDropdown();
    addPackageDropdownListener();
});
function setFormForSearch() {
    formMode = "search";
    document.getElementById("packageIdLabel").style.display = "block";
    document.getElementById("packageIdAddSelection").style.display = "none";
    document.getElementById("packageIdText").value = "";
}

async function initPackageDropdown() {
    const select = document.getElementById("packageIdSelect");

    select.innerHTML =
        '<option value=""> -- Select Package Id --</option>';

    try {
        const response = await fetch("/api/package/getPackageIds");

        if (!response.ok) {
            throw new Error("Failed to load packages");
        }

        const packages = await response.json();

        packages.forEach((pkg) => {
            const option = document.createElement("option");

            option.value = pkg.packageId;
            option.textContent =
                `${pkg.packageId}: ${pkg.packageName}`;

            select.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load packages:", error);
    }
}

async function addPackageDropdownListener() {
    const form = document.getElementById("packageForm");
    const select = document.getElementById("packageIdSelect");

    select.addEventListener("change", async () => {
        const packageId = select.value;

        if (!packageId) {
            return;
        }

        try {
            const response = await fetch(
                `/api/package/getPackage?packageId=${packageId}`
            );

            if (!response.ok) {
                throw new Error("Package search failed");
            }

            const data = await response.json();

            if (!data || Object.keys(data).length === 0) {
                alert("No package found");
                return;
            }

            form.packageName.value = data.packageName || "";
            form.packageCategory.value = data.packageCategory || "";
            form.numberOfClasses.value = data.numberOfClasses || "";
            form.classType.value = data.classType || "";
            form.price.value = data.price ?? "";
            form.startDate.value = data.startDate
                ? data.startDate.substring(0, 10)
                : "";
            form.endDate.value = data.endDate
                ? data.endDate.substring(0, 10)
                : "";

        } catch (error) {
            alert(
                `Error searching package: ${packageId} - ${error.message}`
            );
        }
    });
}


//add functionality
document.getElementById("addBtn").addEventListener("click", async () => {
    setFormForAdd();
    try {
        const response = await fetch("/api/package/getNextId");
        if (!response.ok) throw new Error("Failed to make Package Id");

        const data = await response.json();

        document.getElementById("packageIdText").value = data.nextId;
    }catch(error) {
        alert("Error making Package ID: ", error);
    }

});

function setFormForAdd() {
    formMode = "add";
    document.getElementById("packageIdLabel").style.display = "none";
    document.getElementById("packageIdAddSelection").style.display = "block";

    document.getElementById("packageIdText").value = "";
    document.getElementById("packageForm").reset();
}

document.getElementById("saveBtn").addEventListener("click", async () => {
    console.log("Save clicked");
    console.log("Current form mode:", formMode);

    if (formMode === "add") {
        const form = document.getElementById("packageForm");

        const packageData = {
            packageName: form.packageName.value.trim(),
            packageCategory: form.packageCategory.value,
            numberOfClasses: form.numberOfClasses.value,
            classType: form.classType.value,
            startDate: form.startDate.value,
            endDate: form.endDate.value,
            price: form.price.value
        };

        try {
            const response = await fetch("/api/package/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(packageData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to add package");
            }

            alert(
                `Package ${result.package.packageId} added successfully!`
            );

            form.reset();
            setFormForSearch();
            initPackageDropdown();

        } catch (error) {
            alert("Error: " + error.message);
        }
    }
});


//clear form
document.getElementById("clearBtn").addEventListener("click", () => {
    clearPackageForm();
});

function clearPackageForm() {
    document.getElementById("packageForm").reset();
    setFormForSearch();
}