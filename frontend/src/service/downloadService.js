import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expires_at');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export leads in various formats
export async function exportLeads({ format, fields, listName }) {
  try {
    const response = await api.post('/download/export', {
      format,
      fields,
      listName
    }, {
      responseType: 'blob' // Important for file downloads
    });

    // Create download link
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const contentDisposition = response.headers['content-disposition'];
    let fileName = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `leads_${Date.now()}.${format.toLowerCase()}`;
    
    // Decode URI encoded filename if needed
    fileName = decodeURIComponent(fileName);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Clean up
    window.URL.revokeObjectURL(url);

    return { success: true, fileName };

  } catch (error) {
    console.error('Export leads error:', error);
    
    // Try to read error message from blob if available
    if (error.response?.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Download failed');
      } catch {
        throw new Error('Download failed');
      }
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Download failed');
  }
}

// Get download history
export async function getDownloadHistory() {
  try {
    const response = await api.get('/download/history');
    return response.data;
  } catch (error) {
    console.error('Get download history error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch download history');
  }
}

// Get available industry-location lists from database
export async function getAvailableLists() {
  try {
    const response = await api.get('/download/lists');
    return response.data;
  } catch (error) {
    console.error('Get available lists error:', error);
    // Return default options if API fails
    return {
      success: true,
      data: [
        'Dentists — NYC',
        'IT Services - CA',
        'Law Firms - Florida',
        'Restaurants - Texas'
      ]
    };
  }
}
