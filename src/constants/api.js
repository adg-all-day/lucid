// api config and helpers
// suggezt: token is hardcoded here... should come from auth/login flow later
import { BASE_URL, BEARER_TOKEN } from '@env';

// default headers for GET requests.. POST uses multipart so no Content-Type
const headers = {
  'Authorization': `Bearer ${BEARER_TOKEN}`,
  'Content-Type': 'application/json',
};

export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`, { headers });
  const json = await res.json();
  return json.data;
}

export async function getTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, { headers });
  const json = await res.json();
  return json.data;
}

// create transaction - MUST be multipart/form-data, json body returns 400
// we read as text first because sometimes the backend returns non-json errors
export async function createTransaction(formData) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`,
    },
    body: formData,
  });
  const text = await res.text();
  console.log('Create transaction raw response:', res.status, text);
  try {
    return JSON.parse(text);
  } catch {
    return { error: text, statusCode: res.status };
  }
}

