document.addEventListener("DOMContentLoaded", () => {
    initSaleId();
    initCustomerDropdown();
    initPackageDropdown();
    addPackageDropdownListener();
    initDateTimePaid();
});

async function initSaleId() {
    try {
        const response = await fetch("/api/sale/getNextId");

        if (!response.ok) {
            throw new Error("Failed to generate Sale ID");
        }

        const data = await response.json();

        document.getElementById("saleId").value = data.nextId;
    } catch (error) {
        console.error("Failed to generate Sale ID:", error);
    }
}

async function initCustomerDropdown() {
    const select = document.getElementById("customerId");

    select.innerHTML =
        '<option value="">-- Select Customer --</option>';

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

async function initPackageDropdown() {
    const select = document.getElementById("packageId");

    select.innerHTML =
        '<option value="">-- Select Package --</option>';

    try {
        const response = await fetch("/api/package/getPackageIds");

        if (!response.ok) {
            throw new Error("Failed to load packages");
        }

        const packages = await response.json();

        packages.forEach((packageItem) => {
            const option = document.createElement("option");

            option.value = packageItem.packageId;
            option.textContent =
                `${packageItem.packageId}: ${packageItem.packageName}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Failed to load packages:", error);
    }
}

function addPackageDropdownListener() {
    const select = document.getElementById("packageId");

    select.addEventListener("change", async () => {
        const packageId = select.value;

        if (!packageId) {
            document.getElementById("packagePrice").value = "";
            document.getElementById("amountPaid").value = "";
            return;
        }

        try {
            const response = await fetch(
                `/api/package/getPackage?packageId=${packageId}`
            );

            if (!response.ok) {
                throw new Error("Failed to load package");
            }

            const packageData = await response.json();

            document.getElementById("packagePrice").value =
                packageData.price ?? "";

            document.getElementById("amountPaid").value =
                packageData.price ?? "";

        } catch (error) {
            console.error("Failed to load package:", error);
        }
    });
}

function initDateTimePaid() {
    const now = new Date();

    const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    )
    .toISOString()
    .slice(0, 16);

    document.getElementById("dateTimePaid").value = localDateTime;
}


document.getElementById("saveBtn").addEventListener("click", async () => {
    const form = document.getElementById("saleForm");

    if (!form.checkValidity()) {
        alert("Please complete all required fields correctly.");
        return;
    }

    const saleData = {
        customerId: form.customerId.value,
        packageId: form.packageId.value,
        amountPaid: form.amountPaid.value,
        paymentMode: form.paymentMode.value,
        dateTimePaid: form.dateTimePaid.value,
        validityStartDate: form.validityStartDate.value,
        validityEndDate: form.validityEndDate.value
    };

    try {
        const response = await fetch("/api/sale/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(saleData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to record sale"
            );
        }

        if (result.unlimited) {
            alert(
                `Sale ${result.sale.saleId} recorded successfully!\n` +
                `Customer has an Unlimited package.`
            );
        } else {
            alert(
                `Sale ${result.sale.saleId} recorded successfully!\n` +
                `New class balance: ${result.classBalance}`
            );
        }

        form.reset();

        initSaleId();
        initDateTimePaid();

    } catch (error) {
        alert("Error: " + error.message);
    }
});


document.getElementById("clearBtn").addEventListener("click", () => {
    const form = document.getElementById("saleForm");

    form.reset();

    document.getElementById("packagePrice").value = "";

    initSaleId();
    initDateTimePaid();
});