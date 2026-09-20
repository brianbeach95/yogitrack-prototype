let formMode = "search"; // Tracks the current mode of the form

// Fetch all customer IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  setFormForSearch();
  initCustomerDropdown();
  addCustomerDropdownListener();
});


//search functionality section
document.getElementById("searchBtn").addEventListener("click", async () => {
  // clearInstructorForm();
  setFormForSearch();
  initCustomerDropdown();
});

async function initCustomerDropdown() {
  const select = document.getElementById("customerIdSelect");

  select.innerHTML = '<option value=""> -- Select Customer Id --</option>';

  try {
    const response = await fetch("/api/customer/getCustomerIds");
    const customerIds = await response.json();

    customerIds.forEach((customer) =>{
      const option = document.createElement("option");
      option.value = customer.customerId;
      option.textContent = `${customer.customerId}: ${customer.firstName} ${customer.lastName}`;
      select.appendChild(option);
    });
  }catch(error) {
    console.error("Failed to load customer ids: ", error);
  }
}

async function addCustomerDropdownListener() {
  const form = document.getElementById("customerForm");
  const select = document.getElementById("customerIdSelect");
  select.addEventListener("change", async () => {

    var customerId = select.value.split(":")[0];
    if(!customerId) return;

    console.log(customerId);
    try {
      const res = await fetch(
        `/api/customer/getCustomer?customerId=${customerId}`
      );
      if (!res.ok) throw new Error("Customer search failed");

      const data = await res.json();
      console.log(data);

      if (!data || Object.keys(data).length === 0) {
        alert("No customer found");
        return;
      }

      form.firstName.value = data.firstName || "";
      form.lastName.value = data.lastName || "";
      form.address.value = data.address || "";
      form.phone.value = data.phone || "";
      form.email.value = data.email || "";
      form.classBalance.value = data.classBalance ?? 0;

      if (data.preferredCommunication === "Phone") {
        form.pref[0].checked = true;
      } 
      else if (data.preferredCommunication === "Email") {
        form.pref[1].checked = true;
      }
    } catch (err) {
      alert(`Error searching package: ${customerId} - ${err.message}`);
    }
  });
}

//clear form
function clearCustomerForm() {
  document.getElementById("customerForm").reset();
  document.getElementById("customerIdSelect").value = "";
}

function setFormForSearch() {
  formMode = "search";

  document.getElementById("customerIdLabel").style.display = "block";
  document.getElementById("customerIdAddSelection").style.display = "none";
  document.getElementById("customerIdText").value = "";

  document.getElementById("classBalanceLabel").style.display = "block";
}


//add functionality section
document.getElementById("addBtn").addEventListener("click", async () => {
  setFormForAdd();

  const response = await fetch("/api/customer/getNextId");
  const data = await response.json();

  document.getElementById("customerIdText").value = data.nextId;
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  if (formMode === "add") {
    const form = document.getElementById("customerForm");

    const customerData = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      address: form.address.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      preferredCommunication: form.pref[0].checked ? "Phone" : "Email"
    };

    try {
      const response = await fetch("/api/customer/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerData)
      });

      const result = await response.json();

      if (response.status === 409) {
        addDuplicate(result, customerData);
      }
      else if(!response.ok) {
        throw new Error(result.message || "Failed to add customer");
      } else{
        alert(`Customer ${result.customer.customerId} added successfully!`);
        form.reset();
        setFormForSearch();
        initCustomerDropdown();
      }

    } catch (error) {
      alert("Error: " + error.message);
    }
  }
});

async function addDuplicate(result, customerData) {
    const addAnyway = confirm(
      `${result.message}.\n\nDo you want to add this customer anyway?`
    );

    if (!addAnyway) {
      return;
    }


    customerData.allowDuplicate = true;

    const duplicateResponse = await fetch("/api/customer/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    const duplicateResult = await duplicateResponse.json();

    if (!duplicateResponse.ok) {
      throw new Error(
        duplicateResult.message || "Failed to add customer"
      );
    }

    alert(`Customer ${duplicateResult.customer.customerId} added successfully!`);

    form.reset();
    setFormForSearch();
    initCustomerDropdown();
}

function setFormForAdd() {
  formMode = "add";
  document.getElementById("customerIdLabel").style.display = "none";
  document.getElementById("customerIdAddSelection").style.display = "block";
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerForm").reset()
  document.getElementById("classBalanceLabel").style.display = "none";
}


//formatting for phone
document.getElementById("phone").addEventListener("input", function () {
    let digits = this.value.replace(/\D/g, "").slice(0, 10);

    if (digits.length > 6) {
        this.value =
            digits.slice(0, 3) + "-" +
            digits.slice(3, 6) + "-" +
            digits.slice(6);
    } else if (digits.length > 3) {
        this.value =
            digits.slice(0, 3) + "-" +
            digits.slice(3);
    } else {
        this.value = digits;
    }
});

//update button logic
document.getElementById("updateBtn").addEventListener("click", async () => {
  const form = document.getElementById("customerForm");
  const select = document.getElementById("customerIdSelect");

  const customerId = select.value;

  if (!customerId) {
    alert("Please select a customer to update.");
    return;
  }

  if (!form.checkValidity()) {
    alert("Please complete all required fields.");
    return;
  }

  const customerData = {
    customerId,
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    address: form.address.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    preferredCommunication:
      form.pref[0].checked ? "Phone" : "Email"
  };

  try {
    const response = await fetch(
      "/api/customer/updateCustomer",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Customer update failed"
      );
    }

    alert(`Customer ${customerId} successfully updated`);

    clearCustomerForm();
    setFormForSearch();
    initCustomerDropdown();

  } catch (err) {
    alert("Error: " + err.message);
  }
});

//delete button logic
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const select = document.getElementById("customerIdSelect");
  const customerId = select.value;

  if (!customerId) {
    alert("Please select a customer to delete.");
    return;
  }

  try {
    const response = await fetch(
      `/api/customer/deleteCustomer?customerId=${customerId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Customer delete failed");
    }

    alert(
      `Customer with id ${customerId} successfully deleted`
    );

    clearCustomerForm();
    initCustomerDropdown();

  } catch (err) {
    alert("Error: " + err.message);
  }
});