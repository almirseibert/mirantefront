import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { Beer, CheckCircle, Clock } from 'lucide-react';

const BarKDS = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();

        // Conexão Socket
        const socket = io(import.meta.env.VITE_SOCKET_URL);
        
        // Entra na sala 'bar'
        socket.emit('join_bar');

        // Escuta novos pedidos de bebida
        socket.on('new_bar_order', (data) => {
            toast.info(`🍸 Novo pedido Mesa ${data.table_id}!`);
            loadOrders(); 
            // playNotificationSound(); // Opcional: som de gelo caindo? :)
        });

        return () => socket.disconnect();
    }, []);

    const loadOrders = async () => {
        try {
            // Endpoint específico para o BAR
            const res = await api.get('/orders/kds/BAR');
            setOrders(res.data);
        } catch (error) {
            console.error("Erro ao carregar Bar KDS", error);
        }
    };

    const markAsReady = async (itemId) => {
        try {
            await api.patch(`/orders/item/${itemId}`, { status: 'READY' });
            setOrders(orders.filter(item => item.id !== itemId));
            toast.success('Bebida pronta! Garçom avisado.');
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <div className="flex items-center">
                    <div className="bg-blue-600 p-3 rounded-full mr-4">
                        <Beer className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Bar & Drinks</h1>
                        <p className="text-slate-400">Gerenciamento de Pedidos</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-mono">{new Date().toLocaleTimeString()}</p>
                    <p className="text-sm text-slate-500">{orders.length} pedidos na fila</p>
                </div>
            </header>

            {/* Grid de Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 opacity-50">
                        <Beer size={64} className="mb-4" />
                        <p className="text-2xl">Nenhum pedido de bebida no momento.</p>
                    </div>
                ) : (
                    orders.map((item) => (
                        <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col h-full animate-fade-in">
                            
                            {/* Cabeçalho do Card */}
                            <div className="bg-blue-900/50 p-4 border-b border-blue-800/50 flex justify-between items-center">
                                <span className="text-2xl font-bold text-blue-200">Mesa {item.table_id}</span>
                                <span className="flex items-center text-xs text-blue-300 bg-blue-900/80 px-2 py-1 rounded">
                                    <Clock size={12} className="mr-1" />
                                    {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>

                            {/* Conteúdo */}
                            <div className="p-5 flex-1">
                                <h2 className="text-2xl font-bold text-white mb-2">{item.product_name}</h2>
                                <p className="text-slate-400 text-sm mb-4">Qtd: {item.quantity}</p>
                                
                                {item.notes && (
                                    <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 p-3 rounded-lg text-sm">
                                        📝 {item.notes}
                                    </div>
                                )}
                            </div>

                            {/* Botão de Ação */}
                            <button 
                                onClick={() => markAsReady(item.id)}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg flex justify-center items-center transition-all active:scale-95"
                            >
                                <CheckCircle className="mr-2" /> PRONTO
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BarKDS;