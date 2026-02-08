import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User } from 'lucide-react';

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
            alert(result.message);
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-800">
                
                {/* Cabeçalho com Logo */}
                <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-32 h-32 mb-6 rounded-full bg-black border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                        {/* Imagem da Logo */}
                        <img 
                            src="/assets/logo.jpg" 
                            alt="Mirante Logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-widest uppercase">Sistema Interno</h2>
                    <div className="h-1 w-16 bg-white/30 mt-4 rounded-full"></div>
                </div>

                {/* Formulário */}
                <div className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Usuário</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                                    placeholder="Digite seu usuário"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-6 flex justify-center py-4 px-4 border border-transparent rounded-lg text-sm font-bold text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all uppercase tracking-widest ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        >
                            {isLoading ? 'Autenticando...' : 'Acessar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;