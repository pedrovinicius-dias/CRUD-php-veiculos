import axios from 'axios';

// Em produção na Vercel (com rewrites ou serviço único), '/api' resolve no mesmo domínio.
// Em desenvolvimento local, usa o endereço do Laravel local ou a variável VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;
