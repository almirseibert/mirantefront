import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Cria o contexto
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ao carregar a página, verifica se já tem login salvo
        const recoveredUser = localStorage.getItem('mirante_user');
        const token = localStorage.getItem('mirante_token');

        if (recoveredUser && token) {
            setUser(JSON.parse(recoveredUser));
            // Opcional: Validar token no backend aqui (rota /auth/me)
        }
        
        setLoading(false);
    }, []);

    // Função de Login
    const signIn = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            
            const { token, user: userData } = response.data;

            // Salva no LocalStorage para persistir após refresh
            localStorage.setItem('mirante_token', token);
            localStorage.setItem('mirante_user', JSON.stringify(userData));

            setUser(userData); // Atualiza estado global
            return { success: true };
            
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.error || 'Erro ao conectar no servidor'
            };
        }
    };

    // Função de Logout
    const signOut = () => {
        localStorage.removeItem('mirante_token');
        localStorage.removeItem('mirante_user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar o contexto mais fácil
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}