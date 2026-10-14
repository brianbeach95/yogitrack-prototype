
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyForm = {
    packageName: "",
    packageCategory: "",
    numberOfClasses: "",
    classType: "",
    startDate: "",
    endDate: "",
    price: ""
};

function Packages() {
    const [packages, setPackages] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [packageDetails, setPackageDetails] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [formMode, setFormMode] = useState("edit");
    const [error, setError] = useState("");

    const fetchPackages = async () => {
        try {
            const response = await fetch("/api/package/getPackageIds");

            if (!response.ok) {
                throw new Error("Failed to load packages.");
            }

            setPackages(await response.json());
        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackageDetails = async (packageId) => {
        if (!packageId) {
            setPackageDetails(null);
            setFormData({ ...emptyForm });
            setError("");
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `/api/package/getPackage?packageId=${encodeURIComponent(packageId)}`
            );

            const data = await response.json();

            if (!response.ok || !data) {
                throw new Error("Package not found.");
            }

            setPackageDetails(data);

            setFormData({
                packageName: data.packageName || "",
                packageCategory: data.packageCategory || "",
                numberOfClasses: data.numberOfClasses ?? "",
                classType: data.classType || "",
                startDate: data.startDate?.slice(0, 10) || "",
                endDate: data.endDate?.slice(0, 10) || "",
                price: data.price ?? ""
            });
        } catch (err) {
            setPackageDetails(null);
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAddMode = () => {
        setFormMode("add");
        setSelectedId("");
        setPackageDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };

    const handleCancel = () => {
        setFormMode("edit");
        setSelectedId("");
        setPackageDetails(null);
        setFormData({ ...emptyForm });
        setError("");
    };

    const handleAdd = async () => {
        if (
            !formData.packageName.trim() ||
            !formData.packageCategory.trim() ||
            !formData.classType.trim() ||
            !formData.startDate ||
            !formData.endDate
        ) {
            setError("Please complete all package fields.");
            return;
        }

        const numberOfClasses = Number(formData.numberOfClasses);
        const price = Number(formData.price);

        if (
            formData.numberOfClasses === "" ||
            !Number.isInteger(numberOfClasses) ||
            numberOfClasses <= 0
        ) {
            setError("Number of classes must be a positive whole number.");
            return;
        }

        if (
            formData.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setError("Price must be a non-negative number.");
            return;
        }

        if (formData.endDate < formData.startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        try {
            setError("");

            const response = await fetch("/api/package/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    numberOfClasses,
                    price
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add package.");
            }

            toast.success("Package added successfully!");

            await fetchPackages();

            const newPackageId = data.package?.packageId;

            if (newPackageId) {
                setFormMode("edit");
                setSelectedId(newPackageId);
                await fetchPackageDetails(newPackageId);
            } else {
                setFormMode("edit");
                setSelectedId("");
                setPackageDetails(null);
                setFormData({ ...emptyForm });
            }

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };


    const handleUpdate = async () => {
        if (!selectedId) return;

        if (
            !formData.packageName.trim() ||
            !formData.packageCategory.trim() ||
            !formData.classType.trim() ||
            !formData.startDate ||
            !formData.endDate
        ) {
            setError("Please complete all package fields.");
            return;
        }

        const numberOfClasses = Number(formData.numberOfClasses);
        const price = Number(formData.price);

        if (
            formData.numberOfClasses === "" ||
            !Number.isInteger(numberOfClasses) ||
            numberOfClasses <= 0
        ) {
            setError("Number of classes must be a positive whole number.");
            return;
        }

        if (
            formData.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setError("Price must be a non-negative number.");
            return;
        }

        if (formData.endDate < formData.startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        try {
            setError("");

            const response = await fetch("/api/package/updatePackage", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    packageId: selectedId,
                    ...formData,
                    numberOfClasses,
                    price
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update package.");
            }

            toast.success("Package updated successfully!");

            await fetchPackages();
            await fetchPackageDetails(selectedId);

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this package?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const response = await fetch(
                `/api/package/deletePackage?packageId=${encodeURIComponent(selectedId)}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete package.");
            }

            toast.success("Package deleted successfully!");

            setSelectedId("");
            setPackageDetails(null);
            setFormData({ ...emptyForm });

            await fetchPackages();

        } catch (err) {
            setError(err.message);
            toast.error(error.message);
        }
    };

    return (
        <div className="instructors-page">
            <h1>Manage Packages</h1>

            <div className="form-actions">
                {formMode === "edit" ? (
                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleAddMode}
                    >
                        Add New Package
                    </button>
                ) : (
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                )}
            </div>

            {formMode === "edit" && (
                <div className="form-group">
                    <label htmlFor="packageSelect">
                        Select Package
                    </label>

                    <select
                        id="packageSelect"
                        value={selectedId}
                        onChange={(e) => {
                            const packageId = e.target.value;
                            setSelectedId(packageId);
                            fetchPackageDetails(packageId);
                        }}
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
            )}

            {error && <p className="login-message">{error}</p>}

            {(formMode === "add" || packageDetails) && (
                <div className="instructor-details">
                    <h2>
                        {formMode === "add"
                            ? "Add Package"
                            : "Package Information"}
                    </h2>

                    <div className="instructor-form-grid">
                        {[
                            ["packageName", "Package Name", "text"],
                            ["packageCategory", "Package Category", "text"],
                            ["numberOfClasses", "Number of Classes", "number"],
                            ["classType", "Class Type", "text"],
                            ["startDate", "Start Date", "date"],
                            ["endDate", "End Date", "date"],
                            ["price", "Price", "number"]
                        ].map(([field, label, type]) => (
                            <div className="form-group" key={field}>
                                <label htmlFor={field}>{label}</label>

                                <input
                                    id={field}
                                    name={field}
                                    type={type}
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    min={
                                        field === "numberOfClasses"
                                            ? "1"
                                            : field === "price"
                                                ? "0"
                                                : undefined
                                    }
                                    step={
                                        field === "price"
                                            ? "0.01"
                                            : undefined
                                    }
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        {formMode === "add" ? (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleAdd}
                            >
                                Save Package
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleUpdate}
                                >
                                    Update Package
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={handleDelete}
                                >
                                    Delete Package
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Packages;
