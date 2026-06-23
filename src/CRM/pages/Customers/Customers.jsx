import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiDownload,
  FiEdit,
  FiEye,
  FiMapPin,
  FiPhone,
  FiTrash2,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import "./Customers.css";

const API_BASE_URL = "https://satin-eastcoast-musky.ngrok-free.dev/api/customer-api";
const CUSTOMER_API = {
  list: `${API_BASE_URL}/get-customers`,
  byId: (id) => `${API_BASE_URL}/get-customer-by-id/${id}`,
  add: `${API_BASE_URL}/add-customer`,
  update: (id) => `${API_BASE_URL}/update-customer/${id}`,
  delete: (id) => `${API_BASE_URL}/delete-customer/${id}`,
  search: (keyword) =>
    `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`,
  exportTemplate: `${API_BASE_URL}/export-template`,
  exportFullData: `${API_BASE_URL}/export-full-data`,
  import: `${API_BASE_URL}/import`,
};

const initialFormData = {
  customerName: "",
  mobile: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  totalLandArea: "",
  soilCondition: "",
  cropsCultivated: "",
  status: "Active",
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // New state to view full customer details in a popup
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const customersPerPage = 6;
  const importInputRef = useRef(null);

  const apiHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    }),
    []
  );

  const apiFileHeaders = useMemo(
    () => ({
      "ngrok-skip-browser-warning": "true",
    }),
    []
  );

  const normalizeCustomer = (customer) => {
    return {
      customerId: customer.id || customer.Id || customer.customerId || customer.CustomerId || "",
      customerName: customer.customerName || customer.CustomerName || "",
      mobile: customer.mobileNumber || customer.MobileNumber || customer.mobile || customer.Mobile || "",
      email: customer.email || customer.emailId || customer.Email || customer.EmailId || "",
      address:
        customer.address ||
        customer.Address ||
        [customer.area || customer.Area, customer.city || customer.City, customer.state || customer.State, customer.pincode || customer.Pincode]
          .filter(Boolean)
          .join(", ") ||
        "",
      area: customer.area || customer.Area || "",
      city: customer.city || customer.City || "",
      state: customer.state || customer.State || "",
      pincode: customer.pincode || customer.Pincode || "",
      totalLandArea: customer.totalLandArea || customer.TotalLandArea || "",
      soilCondition: customer.soilCondition || customer.SoilCondition || "",
      cropsCultivated:
        customer.cropsCultivated || customer.CropsCultivated || "",
      status: customer.status || customer.Status || "Active",
    };
  };

  const convertToApiCustomer = (customer) => {
    return {
      id: Number(customer.customerId) || 0,
      customerName: customer.customerName,
      mobileNumber: customer.mobile,
      email: customer.email || "",
      area: customer.area,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      totalLandArea: customer.totalLandArea
        ? parseFloat(customer.totalLandArea)
        : 0,
      soilCondition: customer.soilCondition,
      cropsCultivated: customer.cropsCultivated,
      status: customer.status,
    };
  };

  const downloadFromApi = async (url, fallbackFilename) => {
    try {
      setApiError("");
      const response = await fetch(url, {
        method: "GET",
        headers: apiFileHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to download export file");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filename =
        disposition.match(/filename="?([^"]+)"?/i)?.[1] || fallbackFilename;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Customer Export Error:", error);
      setApiError("Unable to export customer file.");
    }
  };

  const handleExport = async (mode) => {
    setShowExportMenu(false);
    if (mode === "template") {
      await downloadFromApi(CUSTOMER_API.exportTemplate, "customer-template.xlsx");
      return;
    }

    await downloadFromApi(CUSTOMER_API.exportFullData, "customers-full-data.xlsx");
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setLoading(true);
      setApiError("");

      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      const response = await fetch(CUSTOMER_API.import, {
        method: "POST",
        headers: apiFileHeaders,
        body: formDataToUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to import customers");
      }

      await fetchCustomers();
      setCurrentPage(1);
    } catch (error) {
      console.error("Import Error:", error);
      setApiError("Unable to import customer file. Please use the API template.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const fetchCustomers = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setApiError("");

      const requestUrl = keyword.trim()
        ? CUSTOMER_API.search(keyword.trim())
        : CUSTOMER_API.list;

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      const formattedCustomers = Array.isArray(data)
        ? data.map(normalizeCustomer)
        : [];

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error("GET Customers Error:", error);
      setApiError("Unable to load customers from API.");
    } finally {
      setLoading(false);
    }
  }, [apiHeaders]);

  const fetchCustomerById = async (id) => {
    try {
      setApiError("");

      const response = await fetch(CUSTOMER_API.byId(id), {
        method: "GET",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }

      const data = await response.json();

      return normalizeCustomer(data);
    } catch (error) {
      console.error("GET Customer By ID Error:", error);
      setApiError("Unable to load selected customer details.");
      return null;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      fetchCustomers(searchTerm);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(searchTimer);
  }, [fetchCustomers, searchTerm]);

  useEffect(() => {
    if (isEditMode && editingCustomer) {
      setFormData({
        customerId: editingCustomer.customerId,
        customerName: editingCustomer.customerName,
        mobile: editingCustomer.mobile,
        area: editingCustomer.area,
        city: editingCustomer.city,
        state: editingCustomer.state,
        pincode: editingCustomer.pincode,
        totalLandArea: editingCustomer.totalLandArea,
        soilCondition: editingCustomer.soilCondition,
        cropsCultivated: editingCustomer.cropsCultivated,
        status: editingCustomer.status,
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isEditMode, editingCustomer, showModal]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const pendingCustomers = customers.filter(
    (customer) => customer.status === "Pending"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const filteredCustomers =
    searchTerm.trim() === ""
      ? customers
      : customers.filter((customer) => {
          const search = searchTerm.toLowerCase();

          return (
            (customer.customerName || "").toLowerCase().includes(search) ||
            (customer.mobile || "").toLowerCase().includes(search) ||
            (customer.email || "").toLowerCase().includes(search) ||
            (customer.address || "").toLowerCase().includes(search) ||
            (customer.area || "").toLowerCase().includes(search) ||
            (customer.city || "").toLowerCase().includes(search) ||
            (customer.state || "").toLowerCase().includes(search) ||
            (customer.pincode || "").toLowerCase().includes(search) ||
            (customer.soilCondition || "").toLowerCase().includes(search) ||
            (customer.cropsCultivated || "").toLowerCase().includes(search) ||
            (customer.status || "").toLowerCase().includes(search)
          );
        });

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;

  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
    setShowModal(true);
    setErrors({});
    setApiError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingCustomer(null);
    setFormData(initialFormData);
    setErrors({});
  };

  // Handler to open full details view popup
  const handleViewCustomer = async (customer) => {
    const latestCustomer = await fetchCustomerById(customer.customerId);
    setViewingCustomer(latestCustomer || customer);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10 digit mobile number";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6 digit pincode";
    }

    if (!formData.totalLandArea.toString().trim()) {
      newErrors.totalLandArea = "Total land area is required";
    }

    if (!formData.soilCondition.trim()) {
      newErrors.soilCondition = "Soil condition is required";
    }

    if (!formData.cropsCultivated.trim()) {
      newErrors.cropsCultivated = "Crops cultivated is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const addCustomer = async (newCustomer) => {
    try {
      setApiError("");

      const response = await fetch(CUSTOMER_API.add, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(convertToApiCustomer(newCustomer)),
      });

      if (!response.ok) {
        throw new Error("Failed to add customer");
      }

      await fetchCustomers();
      closeModal();
    } catch (error) {
      console.error("POST Customer Error:", error);
      setApiError("Unable to add customer.");
    }
  };

  const editCustomer = async (customer) => {
    const latestCustomer = await fetchCustomerById(customer.customerId);

    setEditingCustomer(latestCustomer || customer);
    setIsEditMode(true);
    setShowModal(true);
    setErrors({});
  };

  const updateCustomer = async (updatedCustomer) => {
    try {
      setApiError("");

      const response = await fetch(CUSTOMER_API.update(updatedCustomer.customerId), {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify(convertToApiCustomer(updatedCustomer)),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      await fetchCustomers();
      closeModal();
    } catch (error) {
      console.error("PUT Customer Error:", error);
      setApiError("Unable to update customer.");
    }
  };

  const deleteCustomer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setApiError("");

      const response = await fetch(CUSTOMER_API.delete(id), {
        method: "DELETE",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      await fetchCustomers();
    } catch (error) {
      console.error("DELETE Customer Error:", error);
      setApiError("Unable to delete customer.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditMode) {
      await updateCustomer(formData);
    } else {
      await addCustomer(formData);
    }
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>Customers</h1>
        <p>
          Manage farmer/customer details, land information, crop details and
          status
        </p>

        {loading && <p>Loading customers...</p>}

        {apiError && (
          <p style={{ color: "#dc2626", marginTop: "8px" }}>{apiError}</p>
        )}
      </div>

      <div className="customer-stats">
        <div className="stats-card">
          <h3>Total Customers</h3>
          <h2>{totalCustomers}</h2>
        </div>

        <div className="stats-card active-card">
          <h3>Active</h3>
          <h2>{activeCustomers}</h2>
        </div>

        <div className="stats-card pending-card">
          <h3>Pending</h3>
          <h2>{pendingCustomers}</h2>
        </div>

        <div className="stats-card inactive-card">
          <h3>Inactive</h3>
          <h2>{inactiveCustomers}</h2>
        </div>
      </div>

      <div className="customer-table-container">
        <div className="table-header">
          <div>
            <h2>Customer Management</h2>
            <p>Track complete customer, address, land and crop details</p>
          </div>
        </div>

        <div className="table-toolbar">
          <input
            type="text"
            placeholder="Search by name, phone, email or address..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="toolbar-actions-group">
            <div className="export-dropdown-wrap">
              <button
                className="secondary-btn"
                onClick={() => setShowExportMenu((prev) => !prev)}
                type="button"
              >
                <FiDownload /> Export <FiChevronDown />
              </button>

              {showExportMenu && (
                <div className="export-dropdown-menu">
                  <button type="button" onClick={() => handleExport("template")}>Template</button>
                  <button type="button" onClick={() => handleExport("full")}>Full data</button>
                </div>
              )}
            </div>

            <button className="secondary-btn" type="button" onClick={() => importInputRef.current?.click()}>
              <FiUpload /> Import
            </button>

            <button className="add-btn" onClick={openAddModal} type="button">
              + Add Customer
            </button>
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </div>

        <div className="customer-table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Phone No.</th>
                <th>Email ID</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer, index) => (
                  <tr key={customer.customerId || index}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{customer.customerId || "—"}</td>
                    <td title="Click to view details">
                      <button
                        type="button"
                        className="customer-name-link-btn"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        {customer.customerName || "Unknown Customer"}
                      </button>
                    </td>
                    <td>{customer.mobile || "—"}</td>
                    <td>{customer.email || "—"}</td>
                    <td title={customer.address || [customer.area, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}>
                      {customer.address || [customer.area, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ") || "—"}
                    </td>

                    <td>
                      <div className="action-chip-group">
                        <button
                          className="customer-action-btn view"
                          title="View"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="customer-action-btn edit"
                          title="Edit"
                          onClick={() => editCustomer(customer)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="customer-action-btn delete"
                          title="Delete"
                          onClick={() => deleteCustomer(customer.customerId)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table-message">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="customer-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {viewingCustomer && (
        <div className="modal-overlay">
          <div className="modal-container customer-modal-wide customer-detail-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Customer profile</p>
                <h2>{viewingCustomer.customerName || "Customer Details"}</h2>
                <p className="subtle-text">A clean view of the customer record, contact details, and farm information.</p>
              </div>
              <button className="close-btn" onClick={() => setViewingCustomer(null)}>&times;</button>
            </div>

            <div className="customer-detail-grid">
              <section className="customer-detail-card highlight-card">
                <div className="profile-chip"><FiUser /> Customer overview</div>
                <div className="detail-stat-row">
                  <span>Customer ID</span>
                  <strong>{viewingCustomer.customerId || "—"}</strong>
                </div>
                <div className="detail-stat-row">
                  <span>Status</span>
                  <strong className={`status-badge ${String(viewingCustomer.status || "Active").toLowerCase()}`}>{viewingCustomer.status || "Active"}</strong>
                </div>
                <div className="detail-stat-row">
                  <span>Phone</span>
                  <strong>{viewingCustomer.mobile || "—"}</strong>
                </div>
                <div className="detail-stat-row">
                  <span>Email</span>
                  <strong>{viewingCustomer.email || "—"}</strong>
                </div>
              </section>

              <section className="customer-detail-card">
                <div className="profile-chip"><FiMapPin /> Address & contact</div>
                <p className="detail-note">{viewingCustomer.address || [viewingCustomer.area, viewingCustomer.city, viewingCustomer.state, viewingCustomer.pincode].filter(Boolean).join(", ") || "No address available"}</p>
                <div className="detail-grid-2 compact-grid">
                  <div><label>Area</label><p>{viewingCustomer.area || "—"}</p></div>
                  <div><label>City / State</label><p>{[viewingCustomer.city, viewingCustomer.state].filter(Boolean).join(" / ") || "—"}</p></div>
                  <div><label>Pincode</label><p>{viewingCustomer.pincode || "—"}</p></div>
                  <div><label>Primary Contact</label><p>{viewingCustomer.mobile || "—"}</p></div>
                </div>
              </section>

              <section className="customer-detail-card full-span-card">
                <div className="profile-chip"><FiPhone /> Farm details</div>
                <div className="detail-grid-2 compact-grid">
                  <div><label>Total Land Area</label><p>{viewingCustomer.totalLandArea || "—"}</p></div>
                  <div><label>Soil Condition</label><p>{viewingCustomer.soilCondition || "—"}</p></div>
                  <div><label>Crops Cultivated</label><p>{viewingCustomer.cropsCultivated || "—"}</p></div>
                  <div><label>Customer Email</label><p>{viewingCustomer.email || "—"}</p></div>
                </div>
              </section>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setViewingCustomer(null)}>Close</button>
              <button type="button" className="save-btn" onClick={() => editCustomer(viewingCustomer)}>Edit customer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Customer Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container customer-modal-wide">
            <div className="modal-header">
              <h2>{isEditMode ? "Edit Customer" : "Add Customer"}</h2>

              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form className="customer-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={errors.customerName ? "error-input" : ""}
                  />
                  {errors.customerName && (
                    <p className="error-text">{errors.customerName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={errors.mobile ? "error-input" : ""}
                  />
                  {errors.mobile && (
                    <p className="error-text">{errors.mobile}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Enter area"
                    value={formData.area}
                    onChange={handleChange}
                    className={errors.area ? "error-input" : ""}
                  />
                  {errors.area && <p className="error-text">{errors.area}</p>}
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "error-input" : ""}
                  />
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? "error-input" : ""}
                  />
                  {errors.state && <p className="error-text">{errors.state}</p>}
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={errors.pincode ? "error-input" : ""}
                  />
                  {errors.pincode && (
                    <p className="error-text">{errors.pincode}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Total Land Area</label>
                  <input
                    type="number"
                    name="totalLandArea"
                    placeholder="Enter total land area"
                    value={formData.totalLandArea}
                    onChange={handleChange}
                    className={errors.totalLandArea ? "error-input" : ""}
                  />
                  {errors.totalLandArea && (
                    <p className="error-text">{errors.totalLandArea}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Soil Condition</label>
                  <input
                    type="text"
                    name="soilCondition"
                    placeholder="Enter soil condition"
                    value={formData.soilCondition}
                    onChange={handleChange}
                    className={errors.soilCondition ? "error-input" : ""}
                  />
                  {errors.soilCondition && (
                    <p className="error-text">{errors.soilCondition}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Crops Cultivated</label>
                  <input
                    type="text"
                    name="cropsCultivated"
                    placeholder="Enter crops cultivated"
                    value={formData.cropsCultivated}
                    onChange={handleChange}
                    className={errors.cropsCultivated ? "error-input" : ""}
                  />
                  {errors.cropsCultivated && (
                    <p className="error-text">{errors.cropsCultivated}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {isEditMode ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
