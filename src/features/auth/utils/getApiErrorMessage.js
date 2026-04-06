export default function getApiErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }

    const firstStringValue = Object.values(data).find(
      (value) => typeof value === 'string' && value.trim(),
    );

    if (firstStringValue) {
      return firstStringValue.trim();
    }
  }

  return fallbackMessage;
}
