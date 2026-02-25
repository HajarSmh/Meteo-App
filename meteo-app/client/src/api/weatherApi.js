import axios from 'axios';

const BASE_URL = 'http://172.20.10.2:3000/api';

const weatherApi = {

  // Connexion admin
  loginAdmin: async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { username, password });
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Login failed'
      };
    }
  },

  // Récupérer les rapports d'un admin spécifique 
  getAdminReports: async (adminId) => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/reports/${adminId}`);
      return {
        success: true,
        reports: response.data
      };
    } catch (error) {
      console.error('Error fetching admin reports:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Failed to fetch your reports'
      };
    }
  },

  // Ajouter un rapport
  postWeatherReport: async (reportData) => {
    try {
      const response = await axios.post(`${BASE_URL}/reports`, reportData);
      return {
        success: true,
        reportId: response.data.reportId
      };
    } catch (error) {
      console.error('Error posting report:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Failed to post report'
      };
    }
  },

  // Modifier un rapport
  updateReport: async (reportId, newContent) => {
    try {
      const response = await axios.put(`${BASE_URL}/reports/${reportId}`, {
        content: newContent
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating report:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Failed to update report'
      };
    }
  },

  // SUPPRIMER UN RAPPORT 
  deleteReport: async (reportId) => {
    try {
      console.log(`[API] Deleting report ${reportId} via POST`);
      const response = await axios.post(`${BASE_URL}/reports/delete/${reportId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting report:', error);
      return {
        success: false,
        error: error.response?.data.error || error.message || 'Failed to delete report'
      };
    }
  },

  // Récupérer les rapports d'une ville spécifique
  getCityReports: async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/${encodeURIComponent(cityName)}`);
      return {
        success: true,
        reports: response.data.reports
      };
    } catch (error) {
      console.error('Error fetching city reports:', error);
      return {
        success: false,
        reports: [],
        error: 'Failed to fetch reports'
      };
    }
  },

  // --- MÉTÉO ---
  // Récupérer la météo d'une ville
  getWeather: async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/weather/${encodeURIComponent(cityName)}`);
      return {
        success: true,
        data: response.data.data,
        source: response.data.source
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Failed to fetch weather'
      };
    }
  },

  // Récupérer les prévisions météo d'une ville
  getForecast: async (cityName) => {
    try {
      const response = await axios.get(`${BASE_URL}/forecast/${encodeURIComponent(cityName)}`);
      return {
        success: true,
        data: response.data.data,
        source: response.data.source
      };
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return {
        success: false,
        error: error.response?.data.error || 'Failed to fetch forecast'
      };
    }
  },

  // Récupérer la ville à partir de la localisation
  getCityFromLocation: async (latitude, longitude) => {
    try {
      const response = await axios.get(`${BASE_URL}/location/${latitude}/${longitude}`);
      return {
        success: true,
        city: response.data.city,
        country: response.data.country
      };
    } catch (error) {
      console.error('Error in geocoding:', error);
      return {
        success: false,
        error: 'Impossible de déterminer la ville'
      };
    }
  },

  // --- FAVORIS ---

  // Récupérer les favoris
  getFavorites: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/favorites`);
      return {
        success: true,
        favorites: response.data.favorites
      };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return {
        success: false,
        error: 'Failed to fetch favorites',
        favorites: []
      };
    }
  },

  // Ajouter un favori
  addFavorite: async (cityName) => {
    try {
      const response = await axios.post(`${BASE_URL}/favorites`, { cityName });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return { success: false, error: 'City already in favorites' };
      }
      return { success: false, error: 'Failed to add favorite' };
    }
  },

  // Supprimer un favori
  removeFavorite: async (cityName) => {
    try {
      const response = await axios.delete(`${BASE_URL}/favorites/${encodeURIComponent(cityName)}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return { success: false, error: 'Failed to remove favorite' };
    }
  }
};

export default weatherApi;