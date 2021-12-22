import axios from 'axios';

// ----------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: 'https://mainserver.kilatus.com/api',
  headers: {
    'Content-Type': 'application/json',
    tenantKey: 'root'
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
