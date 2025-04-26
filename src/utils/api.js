import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API endpoints for tools
export const toolsAPI = {
  getAllTools: () => api.get('/api/tools'),
  getToolBySlug: (slug) => api.get(`/api/tools/${slug}`),
};

// API endpoints for PDF operations
export const pdfAPI = {
  // PDF merger API
  mergePDFs: (formData) => {
    return api.post('/api/pdf/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // PDF editor API
  editPDF: (formData) => {
    return api.post('/api/pdf/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Word to PDF conversion API
  wordToPDF: (formData) => {
    return api.post('/api/pdf/word-to-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// API endpoints for media operations
export const mediaAPI = {
  // Image compression API
  compressImage: (formData) => {
    return api.post('/api/media/compress-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Audio compression API
  compressAudio: (formData) => {
    return api.post('/api/media/compress-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Video compression API
  compressVideo: (formData) => {
    return api.post('/api/media/compress-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Image background removal API
  removeImageBackground: (formData) => {
    return api.post('/api/media/remove-bg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// API endpoints for converter operations
export const converterAPI = {
  // HTML to React conversion API
  htmlToReact: (data) => {
    return api.post('/api/converter/html-to-react', data);
  }
};

export default api;
