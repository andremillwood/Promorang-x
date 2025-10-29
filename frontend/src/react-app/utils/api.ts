export const buildAuthHeaders = (headers: Record<string, string> = {}) => {
  if (typeof window === 'undefined') {
    return { ...headers };
  }

  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    return {
      ...headers,
      Authorization: `Bearer ${authToken}`
    };
  }

  return { ...headers };
};
