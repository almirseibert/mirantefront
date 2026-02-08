import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

// Componentes UI (simples) para não complicar o código
const TableCard = ({ table, onClick }) => {
    const statusColor = {
        'AVAILABLE': 'bg-green-100 border-green-500 text-green-700',
        'OCCUPIED': 'bg-red-100 border-red-500 text-red-700',
        'RESERVED': 'bg-yellow-100 border-yellow-500 text-yellow-700'
    };

    return (
        <div 
            onClick={() => onClick(table)}
            className={`p-6 rounded-lg border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${statusColor[table.status] || 'bg-gray-100'}`}
        >
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">Mesa {table.number}</span>
                <span className="text-xs font-semibold uppercase">{table.status === 'AVAILABLE' ? 'Livre' : 'Ocupada'}</span>
            </div>
            {table.current_total > 0 && (
                <div className="mt-2 text-lg font-semibold">R$ {Number(table.current_total).toFixed(2)}</div>
            )}
        </div>
    );
};

const WaiterDashboard = () => {
    const [tables, setTables] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]); // Itens selecionados para o pedido
    const { user } = useAuth();

    // Conexão Socket local para atualização em tempo real
    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL);
        
        socket.emit('join_waiters'); // Entra na sala de garçons

        socket.on('table_updated', () => {
            loadTables(); // Recarrega mesas se alguém fizer pedido
        });

        socket.on('item_ready', (data) => {
            toast.success(`🍽️ Prato da Mesa ${data.table} está pronto!`);
        });

        loadTables();
        loadProducts();

        return () => socket.disconnect();
    }, []);

    const loadTables = async () => {
        const res = await api.get('/tables');
        setTables(res.data);
    };

    const loadProducts = async () => {
        const res = await api.get('/products');
        setProducts(res.data);
    };

    // Adicionar item ao "Carrinho" local antes de enviar
    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product_id === product.id ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCart([...cart, { product_id: product.id, name: product.name, quantity: 1, notes: '' }]);
        }
    };

    // Enviar Pedido para API
    const handleSendOrder = async () => {
        if (cart.length === 0) return;

        try {
            await api.post('/orders', {
                table_id: selectedTable.id,
                items: cart,
                customer_name: "Cliente" // Simplificado por enquanto
            });
            
            toast.success(`Pedido enviado para Mesa ${selectedTable.number}!`);
            setSelectedTable(null); // Fecha modal
            setCart([]); // Limpa carrinho
            loadTables(); // Atualiza visualmente na hora
        } catch (error) {
            toast.error('Erro ao enviar pedido');
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Salão - Mesas</h1>
            
            {/* Grid de Mesas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tables.map(table => (
                    <TableCard key={table.id} table={table} onClick={setSelectedTable} />
                ))}
            </div>

            {/* Modal de Pedido (Simplificado) */}
            {selectedTable && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-primary text-white rounded-t-lg">
                            <h2 className="text-xl font-bold">Pedido - Mesa {selectedTable.number}</h2>
                            <button onClick={() => setSelectedTable(null)} className="text-white hover:text-gray-200">Fechar</button>
                        </div>

                        <div className="flex-1 overflow-hidden flex">
                            {/* Lista de Produtos (Esquerda) */}
                            <div className="w-1/2 p-4 overflow-y-auto border-r">
                                <h3 className="font-bold mb-2">Cardápio</h3>
                                <div className="space-y-2">
                                    {products.map(p => (
                                        <div key={p.id} onClick={() => p.is_available && addToCart(p)} 
                                             className={`p-3 border rounded cursor-pointer hover:bg-blue-50 flex justify-between ${!p.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <span>{p.name}</span>
                                            <span className="font-bold">R$ {Number(p.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resumo do Pedido (Direita) */}
                            <div className="w-1/2 p-4 flex flex-col bg-gray-50">
                                <h3 className="font-bold mb-2">Itens Selecionados</h3>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {cart.length === 0 ? <p className="text-gray-400 text-center mt-10">Nenhum item adicionado</p> : 
                                        cart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                <div>
                                                    <span className="font-bold">{item.quantity}x</span> {item.name}
                                                </div>
                                                <div className="text-xs text-red-500 cursor-pointer" onClick={() => setCart(cart.filter((_, i) => i !== idx))}>Remover</div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <button 
                                        onClick={handleSendOrder}
                                        disabled={cart.length === 0}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300"
                                    >
                                        Enviar para Cozinha
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaiterDashboard;