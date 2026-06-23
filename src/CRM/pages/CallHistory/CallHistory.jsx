import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBell,
  FiDownload,
  FiEdit,
  FiFilter,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import "./CallHistory.css";

const API_BASE_URL = "https://satin-eastcoast-musky.ngrok-free.dev/api/call-history-api";
const CALL_HISTORY_API = {
  list: `${API_BASE_URL}/get-call-history`,
  byId: (id) => `${API_BASE_URL}/get-call-history-by-id/${id}`,
  add: `${API_BASE_URL}/add-call-history`,
  update: (id) => `${API_BASE_URL}/update-call-history/${id}`,
  delete: (id) => `${API_BASE_URL}/delete-call-history/${id}`,
  search: (keyword) =>
    `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`,
  dashboardSummary: `${API_BASE_URL}/dashboard-summary`,
  exportTemplate: `${API_BASE_URL}/export-template`,
  exportFullData: `${API_BASE_URL}/export-full-data`,
};

const initialFormData = {
  id: "",
  customerName: "",
  phone: "",
  email: "",
  status: "Follow-up",
  lastCall: "",
  notes: "",
  followUpDate: "",
  priority: "Medium",
  qualifiedLead: false,
};

function CallHistory() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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

  const normalizeDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 16);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeCall = useCallback((item) => ({
    id: item.id || item.Id || "",
    customerName: item.customerName || item.CustomerName || "",
    phone: item.phone || item.Phone || "",
    email: item.email || item.Email || "",
    status: item.status || item.Status || "Follow-up",
    lastCall: item.lastCall || item.LastCall || "",
    notes: item.notes || item.Notes || "",
    followUpDate: item.followUpDate || item.FollowUpDate || "",
    priority: item.priority || item.Priority || "Medium",
    qualifiedLead: Boolean(item.qualifiedLead ?? item.QualifiedLead),
  }), []);

  const convertToApiCall = (call) => ({
    id: Number(call.id) || 0,
    customerName: call.customerName,
    phone: call.phone,
    email: call.email || "",
    status: call.status,
    lastCall: call.lastCall ? new Date(call.lastCall).toISOString() : new Date().toISOString(),
    notes: call.notes || "",
    followUpDate: call.followUpDate ? new Date(call.followUpDate).toISOString() : null,
    priority: call.priority,
    qualifiedLead: Boolean(call.qualifiedLead),
  });

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(CALL_HISTORY_API.dashboardSummary, {
        headers: apiHeaders,
      });

      if (!response.ok) return;

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("GET Call History Summary Error:", error);
    }
  }, [apiHeaders]);

  const fetchCallHistory = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setApiError("");

      const requestUrl = keyword.trim()
        ? CALL_HISTORY_API.search(keyword.trim())
        : CALL_HISTORY_API.list;

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch call history");
      }

      const data = await response.json();
      setRows(Array.isArray(data) ? data.map(normalizeCall) : []);
    } catch (error) {
      console.error("GET Call History Error:", error);
      setApiError("Unable to load call history from API.");
    } finally {
      setLoading(false);
    }
  }, [apiHeaders, normalizeCall]);

  const fetchCallById = async (id) => {
    try {
      setApiError("");
      const response = await fetch(CALL_HISTORY_API.byId(id), {
        method: "GET",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch call history record");
      }

      const data = await response.json();
      return normalizeCall(data);
    } catch (error) {
      console.error("GET Call History By ID Error:", error);
      setApiError("Unable to load selected call history record.");
      return null;
    }
  };

  useEffect(() => {
    fetchCallHistory();
    fetchSummary();
  }, [fetchCallHistory, fetchSummary]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      fetchCallHistory(query);
    }, 350);

    return () => clearTimeout(searchTimer);
  }, [fetchCallHistory, query]);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => status === "All" || item.status === status);
  }, [rows, status]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = rows
      .map((item) => item.status)
      .filter(Boolean)
      .filter((value, index, list) => list.indexOf(value) === index);

    return ["All", ...uniqueStatuses];
  }, [rows]);

  const metricTotal =
    summary?.totalCalls ?? summary?.TotalCalls ?? rows.length;
  const metricFollowUps =
    summary?.followUpsDue ??
    summary?.FollowUpsDue ??
    rows.filter((item) => String(item.status).toLowerCase().includes("follow")).length;
  const metricQualified =
    summary?.qualifiedLeads ??
    summary?.QualifiedLeads ??
    rows.filter((item) => item.qualifiedLead).length;

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      ...initialFormData,
      lastCall: normalizeDateForInput(new Date().toISOString()),
    });
    setShowModal(true);
    setApiError("");
  };

  const editCall = async (call) => {
    const latestCall = await fetchCallById(call.id);
    const selectedCall = latestCall || call;

    setIsEditMode(true);
    setFormData({
      ...selectedCall,
      lastCall: normalizeDateForInput(selectedCall.lastCall),
      followUpDate: normalizeDateForInput(selectedCall.followUpDate),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setFormData(initialFormData);
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveCall = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setApiError("");

      const id = formData.id;
      const response = await fetch(
        isEditMode ? CALL_HISTORY_API.update(id) : CALL_HISTORY_API.add,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: apiHeaders,
          body: JSON.stringify(convertToApiCall(formData)),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save call history");
      }

      await fetchCallHistory(query);
      await fetchSummary();
      closeModal();
    } catch (error) {
      console.error("Save Call History Error:", error);
      setApiError("Unable to save call history record.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCall = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this call history record?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setApiError("");

      const response = await fetch(CALL_HISTORY_API.delete(id), {
        method: "DELETE",
        headers: apiHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to delete call history");
      }

      await fetchCallHistory(query);
      await fetchSummary();
    } catch (error) {
      console.error("DELETE Call History Error:", error);
      setApiError("Unable to delete call history record.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFromApi = async (url, fallbackFilename) => {
    try {
      setApiError("");
      const response = await fetch(url, {
        method: "GET",
        headers: apiFileHeaders,
      });

      if (!response.ok) {
        throw new Error("Failed to export call history");
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
      console.error("Call History Export Error:", error);
      setApiError("Unable to export call history file.");
    }
  };

  return (
    <div className="call-history-page">
      <header className="call-history-header-card">
        <div>
          <p className="eyebrow">CRM Workspace</p>
          <h1>Call History & Follow-ups</h1>
          <p className="subtitle">
            Review recent engagements, manage callbacks, and keep the sales team aligned.
          </p>
          {loading && <p className="api-state-text">Loading call history...</p>}
          {apiError && <p className="api-error-text">{apiError}</p>}
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-btn" onClick={() => {
            fetchCallHistory(query);
            fetchSummary();
          }}>
            <FiBell /> Live updates
          </button>
          <button type="button" className="primary-btn" onClick={openAddModal}>
            <FiPlus /> Add Call
          </button>
        </div>
      </header>

      <section className="metric-grid three-up">
        <article className="metric-card accent-blue">
          <span>Total Calls</span>
          <strong>{metricTotal}</strong>
          <small>Synced from dashboard summary</small>
        </article>
        <article className="metric-card accent-green">
          <span>Follow-ups Due</span>
          <strong>{metricFollowUps}</strong>
          <small>Records needing callback</small>
        </article>
        <article className="metric-card accent-purple">
          <span>Qualified Leads</span>
          <strong>{metricQualified}</strong>
          <small>Marked as qualified</small>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-topbar">
          <div>
            <p className="eyebrow">Customer activity</p>
            <h2>Recent call history</h2>
          </div>
          <div className="panel-actions">
            <label className="control-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search customer or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="control-box">
              <FiFilter />
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All statuses" : option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="primary-btn"
              onClick={() => downloadFromApi(CALL_HISTORY_API.exportFullData, "call-history-full-data.xlsx")}
            >
              <FiDownload /> Export
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => downloadFromApi(CALL_HISTORY_API.exportTemplate, "call-history-template.xlsx")}
            >
              Template
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="call-history-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Call</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="customer-cell">
                        <span className="avatar-pill"><FiUser /></span>
                        <div>
                          <strong>{item.customerName || "Unknown Customer"}</strong>
                          <small>{item.priority || "Medium"} priority</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.phone || "-"}</td>
                    <td>{item.email || "-"}</td>
                    <td>
                      <span className={`status-pill ${String(item.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status || "Follow-up"}
                      </span>
                    </td>
                    <td>{formatDateTime(item.lastCall)}</td>
                    <td className="notes-cell">{item.notes || "-"}</td>
                    <td>
                      <div className="action-group">
                        <a href={item.phone ? `tel:${item.phone}` : undefined} className="icon-btn call" aria-label="Call">
                          <FiPhone />
                        </a>
                        <a href={item.phone ? `https://wa.me/${item.phone.replace(/\D/g, "")}` : undefined} className="icon-btn whatsapp" aria-label="WhatsApp">
                          <FiMessageSquare />
                        </a>
                        <a href={item.email ? `mailto:${item.email}` : undefined} className="icon-btn email" aria-label="Email">
                          <FiMail />
                        </a>
                        <button type="button" className="icon-btn edit" aria-label="Edit" onClick={() => editCall(item)}>
                          <FiEdit />
                        </button>
                        <button type="button" className="icon-btn delete" aria-label="Delete" onClick={() => deleteCall(item.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-message">
                    No call history records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="call-modal-overlay">
          <div className="call-modal">
            <div className="call-modal-header">
              <h2>{isEditMode ? "Edit Call History" : "Add Call History"}</h2>
              <button type="button" className="icon-btn" onClick={closeModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form className="call-form" onSubmit={saveCall}>
              <label>
                Customer Name
                <input name="customerName" value={formData.customerName} onChange={handleChange} required />
              </label>
              <label>
                Phone
                <input name="phone" value={formData.phone} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </label>
              <label>
                Status
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Completed">Completed</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>
              <label>
                Last Call
                <input type="datetime-local" name="lastCall" value={formData.lastCall} onChange={handleChange} required />
              </label>
              <label>
                Follow-up Date
                <input type="datetime-local" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
              </label>
              <label>
                Priority
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" name="qualifiedLead" checked={formData.qualifiedLead} onChange={handleChange} />
                Qualified lead
              </label>
              <label className="full-width">
                Notes
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
              </label>

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {isEditMode ? "Update Call" : "Save Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallHistory;
