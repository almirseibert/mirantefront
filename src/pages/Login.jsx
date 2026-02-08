import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, Lock, User } from 'lucide-react'; // Ícones
import { toast } from 'react-toastify'; // Notificações (Instalar depois se não tiver)

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn(username, password);

        if (result.success) {
            // Redirecionamento inteligente baseado no cargo (Role)
            const user = JSON.parse(localStorage.getItem('mirante_user'));
            
            switch(user.role) {
                case 'WAITER': navigate('/waiter'); break;
                case 'KITCHEN': navigate('/kitchen'); break;
                case 'BAR': navigate('/bar'); break;
                case 'CASHIER': navigate('/cashier'); break;
                case 'ADMIN':
                case 'MANAGER': navigate('/admin'); break;
                default: navigate('/');
            }
        } else {
            // Se usar react-toastify: toast.error(result.message);
            alert(result.message); // Fallback simples
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                
                {/* Cabeçalho com Logo/Ícone */}
                <div className="bg-primary p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                        <UtensilsCrossed className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Mirante Gastro Pub</h1>
                    <p className="text-blue-200 text-sm mt-2">Acesso Restrito aos Colaboradores</p>
                </div>

                {/* Formulário */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Campo Usuário */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Seu usuário de acesso"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Sua senha secreta"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Botão de Entrar */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Entrando...' : 'Acessar Sistema'}
                        </button>
                    </form>
                </div>
                
                {/* Rodapé */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        &copy; 2026 Digital Plus+ Sistemas - v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;