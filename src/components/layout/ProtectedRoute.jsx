import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Este componente envolve as rotas que precisam de proteção
const ProtectedRoute = ({ allowedRoles }) => {
    const { signed, user, loading } = useAuth();

    // 1. Enquanto verifica o token no LocalStorage, mostra um loading simples
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 2. Se não estiver logado, manda para o Login
    if (!signed) {
        return <Navigate to="/login" replace />;
    }

    // 3. Se tiver roles definidas, verifica se o usuário tem permissão
    // Ex: Se a rota exige ['ADMIN'], e o user é 'WAITER', bloqueia.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redireciona para a página inicial padrão ou mostra erro
        // Aqui, mandamos para o login para forçar a troca de usuário, ou para uma pág de erro
        alert("Acesso Negado: Seu perfil não tem permissão para acessar esta área.");
        return <Navigate to="/login" replace />; 
    }

    // 4. Se passou por tudo, renderiza a página solicitada (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;