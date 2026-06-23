import React, {
  useState,
  useEffect,
  useCallback
} from "react";

import axios from "axios";

import "./AddStaff.css";

// ---------------- API BASE URL ----------------
const BASE_URL =
  "https://excretory-powdering-mocker.ngrok-free.dev/api";

// ---------------- API FUNCTIONS ----------------

// GET STAFF
const getStaff = async () => {

  try {

    const response = await axios.get(
      `${BASE_URL}/staff`
    );

    return response.data;

  } catch (error) {

    console.log("GET ERROR:", error);

    throw error;
  }
};

// ADD STAFF
const addStaff = async (staffData) => {

  try {

    console.log("PAYLOAD:", staffData);

    const response = await axios.post(
      `${BASE_URL}/Staff`,
      staffData
    );

    return response.data;

  } catch (error) {

    console.log("POST ERROR:", error);

    throw error;
  }
};

// ---------------- MAIN COMPONENT ----------------
function AddStaff() {

  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    employeeId: "",
    role: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const [permissions, setPermissions] = useState({
    catalog: false,
    customers: false,
    orders: false,
    marketing: false,
    inbox: false,
    chat: false,
    fileManager: false,
    calendar: false,
    analytics: false
  });

  const addStaffUser = async (data) => {

    try {

      await addStaff(data);

    } catch (error) {

      console.log(error);

      throw error;
    }
  };

  const fetchStaff = useCallback(async () => {

    try {

      await getStaff();

    } catch (error) {

      console.log(error);

    }
  }, []);

  // LOAD STAFF
  useEffect(() => {

    fetchStaff();

  }, [fetchStaff]);

  // INPUT CHANGE
  const handleChange = (e) => {

    let { name, value } = e.target;

    // MOBILE VALIDATION
    if (name === "mobile") {

      value = value.replace(/\D/g, "");
      value = value.slice(0, 10);

    }

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors({
      ...errors,
      [name]: ""
    });

    setSuccessMsg("");
  };

  // VALIDATION
  const validateForm = () => {

    let newErrors = {};

    // REQUIRED FIELDS
    Object.keys(formData).forEach((key) => {

      if (formData[key].toString().trim() === "") {

        newErrors[key] = "This field is required";

      }

    });

    // EMAIL VALIDATION
    if (
      formData.email &&
      !formData.email.endsWith("@gmail.com")
    ) {

      newErrors.email =
        "Email must be @gmail.com";

    }

    // MOBILE VALIDATION
    if (
      formData.mobile &&
      formData.mobile.length !== 10
    ) {

      newErrors.mobile =
        "Mobile number must be exactly 10 digits";

    }

    // EMPLOYEE ID
    const empRegex = /^[A-Za-z]{1}[0-9]+$/;

    if (
      formData.employeeId &&
      !empRegex.test(formData.employeeId)
    ) {

      newErrors.employeeId =
        "Format: A123";

    }

    // PASSWORD
    const passRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{7,}$/;
    if (
      formData.password &&
      !passRegex.test(formData.password)
    ) {

      newErrors.password =
        "Min 7 chars, 1 uppercase letter, 1 special character";

    }

    // CONFIRM PASSWORD
    if (
      formData.password !==
      formData.confirmPassword
    ) {

      newErrors.confirmPassword =
        "Passwords do not match";

    }

    // PERMISSION VALIDATION
    const hasPermission =
      Object.values(permissions).some(
        (permission) => permission === true
      );

    if (!hasPermission) {

      newErrors.permissions =
        "Please enable at least one permission";

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    // ENABLED PERMISSIONS
    const enabledPermissions =
      Object.keys(permissions).filter(
        (key) => permissions[key]
      );

    // PAYLOAD
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      employeeId: formData.employeeId,
      role: formData.role,
      password: formData.password,
      permissions: enabledPermissions
    };

    try {

      await addStaffUser(payload);

      setSuccessMsg(
        "Staff Created Successfully"
      );

      // RESET FORM
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        employeeId: "",
        role: "",
        password: "",
        confirmPassword: ""
      });

      // RESET PERMISSIONS
      setPermissions({
        catalog: false,
        customers: false,
        orders: false,
        marketing: false,
        inbox: false,
        chat: false,
        fileManager: false,
        calendar: false,
        analytics: false
      });

    } catch (error) {

      console.log(error);

    }
  };

  // TOGGLE PERMISSION
  const togglePermission = (key) => {

    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });

    setErrors({
      ...errors,
      permissions: ""
    });
  };

  return (
    <div className="container">

      {/* HEADER */}
      <div className="header">

        <h2>Add Staff</h2>

        {successMsg && (
          <span className="success">
            {successMsg}
          </span>
        )}

      </div>

      <form onSubmit={handleSubmit}>

        {/* FIRST NAME + LAST NAME */}
        <div className="row">

          <div className="field">

            <label>First Name</label>

            <input
              name="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleChange}
            />

            {errors.firstName && (
              <span className="error">
                {errors.firstName}
              </span>
            )}

          </div>

          <div className="field">

            <label>Last Name</label>

            <input
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
            />

            {errors.lastName && (
              <span className="error">
                {errors.lastName}
              </span>
            )}

          </div>

        </div>

        {/* EMAIL + MOBILE */}
        <div className="row">

          <div className="field">

            <label>Email</label>

            <input
              name="email"
              placeholder="Enter Email address"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <span className="error">
                {errors.email}
              </span>
            )}

          </div>

          <div className="field">

            <label>Mobile</label>

            <div className="mobile-field">

              <span className="country-code">
                +91
              </span>

              <input
                name="mobile"
                value={formData.mobile}
                placeholder="Enter mobile number"
                onChange={handleChange}
              />

            </div>

            {errors.mobile && (
              <span className="error">
                {errors.mobile}
              </span>
            )}

          </div>

        </div>

        {/* EMPLOYEE ID + ROLE */}
        <div className="row">

          <div className="field">

            <label>Employee ID</label>

            <input
              name="employeeId"
              placeholder="Enter Employee ID"
              value={formData.employeeId}
              onChange={handleChange}
            />

            {errors.employeeId && (
              <span className="error">
                {errors.employeeId}
              </span>
            )}

          </div>

          <div className="field">

            <label>Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">
                Select Role
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="staff">
                Staff
              </option>

            </select>

            {errors.role && (
              <span className="error">
                {errors.role}
              </span>
            )}

          </div>

        </div>

        {/* PASSWORD */}
        <div className="row">

          <div className="field">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && (
              <span className="error">
                {errors.password}
              </span>
            )}

          </div>

          <div className="field">

            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {errors.confirmPassword && (
              <span className="error">
                {errors.confirmPassword}
              </span>
            )}

          </div>

        </div>

        {/* PERMISSIONS */}
        <h3>Permissions</h3>

        <div className="permission-grid">

          {Object.keys(permissions).map(
            (key) => (

              <div
                className={`permission-item ${
                  permissions[key]
                    ? "active"
                    : ""
                }`}
                key={key}
              >

                <span className="perm-label">
                  {key}
                </span>

                <label className="toggle">

                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={() =>
                      togglePermission(key)
                    }
                  />

                  <span className="track"></span>

                </label>

              </div>

            )
          )}

        </div>

        {errors.permissions && (
          <span className="error permission-error">
            {errors.permissions}
          </span>
        )}

        {/* BUTTON */}
        <div className="btn-container">

          <button
            className="btn"
            type="submit"
          >
            Add Staff
          </button>

        </div>

      </form>

      

    </div>
  );
}

export default AddStaff;

