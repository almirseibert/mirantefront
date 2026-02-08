import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { Clock, CheckCheck } from 'lucide-react';

const KitchenKDS = () => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            timeout: 20000
        });
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();

        // Conexão Socket
        const socket = io(import.meta.env.VITE_SOCKET_URL);
        socket.emit('join_kitchen');

        socket.on('new_kds_order', (data) => {
            toast.info(`🔔 Novo pedido Mesa ${data.table_id}!`);
            loadOrders(); // Recarrega a lista
            playNotificationSound();
        });

        return () => socket.disconnect();
    }, []);

    const loadOrders = async () => {
        try {
            // Busca apenas itens destinados à Cozinha (KITCHEN)
            const res = await api.get('/orders/kds/KITCHEN');
            setOrders(res.data);
        } catch (error) {
            console.error("Erro ao carregar KDS", error);
        }
    };

    const markAsReady = async (itemId) => {
        try {
            await api.patch(`/orders/item/${itemId}`, { status: 'READY' });
            // Remove da tela localmente para ser instantâneo
            setOrders(orders.filter(item => item.id !== itemId));
            toast.success('Item marcado como pronto!');
        } catch (error) {
            toast.error('Erro ao atualizar status');
        }
    };

    const playNotificationSound = () => {
        // Um som simples de "Bip" pode ser adicionado aqui depois
        // const audio = new Audio('/assets/alert.mp3');
        // audio.play().catch(e => console.log("Audio play blocked"));
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-bold flex items-center">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded mr-3 text-sm">COZINHA</span>
                    Monitor de Produção
                </h1>
                <div className="text-xl font-mono text-gray-400">
                    {new Date().toLocaleTimeString()}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-600">
                        <p className="text-2xl">Sem pedidos pendentes... 👨‍🍳💤</p>
                    </div>
                ) : (
                    orders.map((item) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg border-l-8 border-yellow-500 overflow-hidden shadow-lg animate-pulse-once">
                            {/* Cabeçalho do Cartão */}
                            <div className="bg-gray-700 p-3 flex justify-between items-center">
                                <span className="text-xl font-bold text-yellow-400">Mesa {item.table_id}</span>
                                <span className="text-xs bg-gray-600 px-2 py-1 rounded flex items-center">
                                    <Clock size={12} className="mr-1" /> 
                                    {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>

                            {/* Corpo do Pedido */}
                            <div className="p-4">
                                <h2 className="text-2xl font-bold mb-2">{item.product_name}</h2>
                                {item.notes && (
                                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-2 rounded text-sm mb-2">
                                        ⚠️ OBS: {item.notes}
                                    </div>
                                )}
                                <div className="text-sm text-gray-400">Garçom: {item.customer_name || 'Balcão'}</div>
                            </div>

                            {/* Ação */}
                            <button 
                                onClick={() => markAsReady(item.id)}
                                className="w-full bg-green-700 hover:bg-green-600 text-white py-4 font-bold text-lg flex justify-center items-center transition-colors"
                            >
                                <CheckCheck className="mr-2" /> PRONTO
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KitchenKDS;