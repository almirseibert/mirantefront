import axios from 'axios';

// Cria a instância do Axios
const api = axios.create({
    // Em produção, a variável de ambiente define o endereço
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de Requisição: Injeta o Token JWT se existir
api.interceptors.request.use(config => {
    const token = localStorage.getItem('mirante_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor de Resposta: Trata erros globais (ex: Token expirado)
api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        // Se der erro 401 (Não autorizado), limpa o token e redireciona pro login
        // Mas evitamos loop infinito verificando se já não estamos no login
        if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('mirante_token');
            localStorage.removeItem('mirante_user');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;