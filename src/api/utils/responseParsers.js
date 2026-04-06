export function extractPayload(response) {
  return response?.data ?? response;
}

export function extractCollection(response) {
  const payload = extractPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}
