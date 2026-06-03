import axiosClient from '../api/axiosClient';

/**
 * Service to manage user authentication API interactions.
 */
const authService = {
  /**
   * Register a new user account
   * @param {object} payload - { name, email, password, targetRole }
   */
  register: async (payload) => {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Login user credentials
   * @param {object} payload - { email, password }
   */
  login: async (payload) => {
    const response = await axiosClient.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Fetch current authenticated user profile details
   */
  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
