const ORDERS_LIST_URL = 'https://wildlife-unwieldy-devotee.ngrok-free.dev/api/Orders';
const ORDER_ITEM_URL = 'https://wildlife-unwieldy-devotee.ngrok-free.dev/api/Order';
const DEFAULT_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'Content-Type': 'application/json',
};

export const getOrders = async () => {
  const response = await fetch(ORDERS_LIST_URL, { headers: DEFAULT_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getOrder = async (id) => {
  const response = await fetch(`${ORDERS_LIST_URL}/${id}`, { headers: DEFAULT_HEADERS });
  if (!response.ok) throw new Error(`Failed to fetch order ${id}`);
  return response.json();
};

export const createOrder = async (payload) => {
  const response = await fetch(ORDERS_LIST_URL, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
};

export const updateOrderStatus = async (id, status) => {
  const response = await fetch(`${ORDER_ITEM_URL}/${id}/status`, {
    method: 'PUT',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`Failed to update status for order ${id}`);
  return response.json();
};

export const deleteOrder = async (id) => {
  const response = await fetch(`${ORDER_ITEM_URL}/${id}`, {
    method: 'DELETE',
    headers: DEFAULT_HEADERS,
  });
  if (!response.ok) throw new Error(`Failed to delete order ${id}`);
  return response.json();
};
