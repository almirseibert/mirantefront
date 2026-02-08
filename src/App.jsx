import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Componentes de Layout
import ProtectedRoute from './components/layout/ProtectedRoute';

// Páginas (Vamos criar estas páginas em seguida)
import Login from './pages/Login';

// Admin / Gerência
import AdminDashboard from './pages/admin/Dashboard';

// Operacional
import WaiterDashboard from './pages/waiter/Dashboard';
import KitchenKDS from './pages/kitchen/KDS';
import BarKDS from './pages/bar/KDS';
import CashierDashboard from './pages/cashier/Dashboard';

const App = () => {
    return (
        <BrowserRouter>
            {/* O AuthProvider envolve tudo para que o 'user' seja acessível em qualquer tela */}
            <AuthProvider>
                <Routes>
                    {/* Rota Pública */}
                    <Route path="/login" element={<Login />} />

                    {/* Rotas Protegidas */}
                    
                    {/* 1. Rotas de Garçom (WAITER) */}
                    <Route element={<ProtectedRoute allowedRoles={['WAITER', 'ADMIN', 'MANAGER']} />}>
                        <Route path="/waiter" element={<WaiterDashboard />} />
                    </Route>

                    {/* 2. Rotas de Cozinha (KITCHEN) */}
                    <Route element={<ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN', 'MANAGER']} />}>
                        <Route path="/kitchen" element={<KitchenKDS />} />
                    </Route>

                    {/* 3. Rotas de Bar (BAR) */}
                    <Route element={<ProtectedRoute allowedRoles={['BAR', 'ADMIN', 'MANAGER']} />}>
                        <Route path="/bar" element={<BarKDS />} />
                    </Route>

                    {/* 4. Rotas de Caixa (CASHIER) */}
                    <Route element={<ProtectedRoute allowedRoles={['CASHIER', 'ADMIN', 'MANAGER']} />}>
                        <Route path="/cashier" element={<CashierDashboard />} />
                    </Route>

                    {/* 5. Rotas Administrativas (ADMIN, MANAGER) */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        {/* Aqui adicionaremos rotas filhas depois, ex: /admin/products */}
                    </Route>

                    {/* Rota Padrão: Se acessar a raiz '/', vai para login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Rota 404: Página não encontrada */}
                    <Route path="*" element={<div className="p-10 text-center"><h1>404 - Página não encontrada</h1></div>} />

                </Routes>
                
                {/* Container para notificações flutuantes (Toasts) */}
                <ToastContainer autoClose={3000} position="bottom-right" />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;