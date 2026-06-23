const API_BASE_URL = "https://satin-eastcoast-musky.ngrok-free.dev/api";

export const INVOICES_API_URL = `${API_BASE_URL}/Invoices`;
export const INVOICE_ACTIONS_API_URL = `${API_BASE_URL}/invoice-actions`;

export const invoiceApiHeaders = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

const readResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

export const invoiceRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...invoiceApiHeaders,
      ...(options.headers || {}),
    },
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    const message = typeof body === "string" ? body : JSON.stringify(body || {});
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return body;
};

export const normalizeInvoiceEnvelope = (record) => {
  if (!record) {
    return {
      invoice: {},
      items: [],
      billing: {},
      shipping: {},
      payment: {},
    };
  }

  return {
    invoice: record.invoice || record,
    items: Array.isArray(record.items) ? record.items : [],
    billing: record.billing || {},
    shipping: record.shipping || {},
    payment: record.payment || {},
  };
};

export const normalizeInvoiceCollection = (data) => {
  const records = Array.isArray(data) ? data : data?.value || data?.invoices || [];
  return Array.isArray(records) ? records.map(normalizeInvoiceEnvelope) : [];
};

export const downloadInvoiceBlob = async (url, fallbackFilename) => {
  const response = await fetch(url, {
    method: "GET",
    headers: invoiceApiHeaders,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : fallbackFilename;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
