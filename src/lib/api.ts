import axios from 'axios';

const BASE_URL = 'https://consumet-api-2i1w.onrender.com/';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

export { http };
export default http;
