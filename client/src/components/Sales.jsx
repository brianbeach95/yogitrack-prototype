
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
    customerId: "",
    packageId: "",
    amountPaid: "",
    paymentMode: "Credit Card",
    dateTimePaid: "",
    validityStartDate: "",
    validityEndDate: ""
};

function Sales() {
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [customerResponse, packageResponse] =
                    await Promise.all([
                        fetch("/api/customer/getCustomerIds"),
                        fetch("/api/package/getPackageIds")
                    ]);

                if (!customerResponse.ok || !packageResponse.ok) {
                    throw new Error("Failed to load customers or packages.");
                }

                setCustomers(await customerResponse.json());
                setPackages(await packageResponse.json());

            } catch (err) {
                setError(err.message);
                toast.error(error.message);
            }
        };

        loadOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handlePackageChange = async (e) => {
        const packageId = e.target.value;

        setFormData((previous) => ({
            ...previous,
            packageId,
            amountPaid: ""
        }));

        setSelectedPackage(null);
        setError("");

        if (!packageId) return;

        try {
            const response = await fetch(
                `/api/package/getPackage?packageId=${encodeURIComponent(packageId)}`
            );

            const data = await response.json();

            if (!response.ok || !data) {
                throw new Error("Failed to load package details.");
            }

            setSelectedPackage(data);

            setFormData((previous) => ({
                ...previous,
                amountPaid: data.price,
                validityStartDate: data.startDate?.slice(0, 10) || "",
                validityEndDate: data.endDate?.slice(0, 10) || ""
            }));

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleRecordSale = async () => {
        if (
            !formData.customerId ||
            !formData.packageId ||
            formData.amountPaid === "" ||
            !formData.dateTimePaid ||
            !formData.validityStartDate ||
            !formData.validityEndDate
        ) {
            setError("Please complete all sale fields.");
            return;
        }

        if (
            !Number.isFinite(Number(formData.amountPaid)) ||
            Number(formData.amountPaid) < 0
        ) {
            setError("Amount paid must be a non-negative number.");
            return;
        }

        if (formData.validityEndDate < formData.validityStartDate) {
            setError("Validity end date cannot be before the start date.");
            return;
        }

        const confirmed = window.confirm(
            "Record this purchase and add the package classes to the customer's balance?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const response = await fetch("/api/sale/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    amountPaid: Number(formData.amountPaid)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to record sale.");
            }

            toast.success("Sale recorded successfully!");

            setFormData({ ...emptyForm });
            setSelectedPackage(null);

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    return (
        <div className="instructors-page">
            <h1>Record Sale</h1>

            {error && <p className="login-message">{error}</p>}

            <div className="instructor-details">
                <h2>New Package Purchase</h2>

                <div className="instructor-form-grid">
                    <div className="form-group">
                        <label htmlFor="customerId">Customer</label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a customer</option>

                            {customers.map((customer) => (
                                <option
                                    key={customer.customerId}
                                    value={customer.customerId}
                                >
                                    {customer.customerId} - {customer.firstName} {customer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="packageId">Package</label>
                        <select
                            id="packageId"
                            name="packageId"
                            value={formData.packageId}
                            onChange={handlePackageChange}
                            required
                        >
                            <option value="">Select a package</option>

                            {packages.map((pkg) => (
                                <option
                                    key={pkg.packageId}
                                    value={pkg.packageId}
                                >
                                    {pkg.packageId} - {pkg.packageName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedPackage && (
                        <div className="form-group">
                            <label>Classes Included</label>
                            <input
                                value={selectedPackage.numberOfClasses}
                                readOnly
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="amountPaid">Amount Paid ($)</label>
                        <input
                            id="amountPaid"
                            name="amountPaid"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amountPaid}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="paymentMode">Payment Method</label>
                        <select
                            id="paymentMode"
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleInputChange}
                        >
                            <option value="Credit Card">Credit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Debit Card">Debit Card</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateTimePaid">Payment Date/Time</label>
                        <input
                            id="dateTimePaid"
                            name="dateTimePaid"
                            type="datetime-local"
                            value={formData.dateTimePaid}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="validityStartDate">Validity Start</label>
                        <input
                            id="validityStartDate"
                            name="validityStartDate"
                            type="date"
                            value={formData.validityStartDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="validityEndDate">Validity End</label>
                        <input
                            id="validityEndDate"
                            name="validityEndDate"
                            type="date"
                            value={formData.validityEndDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleRecordSale}
                    >
                        Record Sale
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sales;
