import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { DollarSign, CreditCard, Banknote, Smartphone, Printer, User } from 'lucide-react';

const CashierDashboard = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Carregar mesas e conectar socket
    useEffect(() => {
        loadTables();
        const socket = io(import.meta.env.VITE_SOCKET_URL);
        
        socket.on('table_updated', () => {
            loadTables();
            // Se a mesa selecionada foi atualizada (ex: garçom lançou mais item), recarrega
            if (selectedTable) {
                // Em um app real, buscaríamos os detalhes novamente aqui
            }
        });

        return () => socket.disconnect();
    }, [selectedTable]);

    const loadTables = async () => {
        try {
            const res = await api.get('/tables');
            setTables(res.data);
        } catch (error) {
            toast.error('Erro ao carregar mesas');
        }
    };

    // Calcular totais
    const subtotal = selectedTable ? Number(selectedTable.current_total || 0) : 0;
    const serviceFee = subtotal * 0.10; // 10% opcional
    const totalToPay = subtotal + serviceFee - discount;

    const handleCloseAccount = async () => {
        if (!selectedTable) return;
        setLoading(true);

        try {
            await api.post('/tables/close', {
                table_id: selectedTable.id,
                payment_method: paymentMethod,
                discount: Number(discount)
            });

            toast.success(`Conta da Mesa ${selectedTable.number} fechada com sucesso!`);
            setSelectedTable(null);
            setDiscount(0);
            loadTables(); // Atualiza o grid
        } catch (error) {
            console.error(error);
            toast.error('Erro ao fechar conta. Verifique se há pedidos abertos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            
            {/* LADO ESQUERDO: Mapa de Mesas */}
            <div className="w-2/3 p-6 overflow-y-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Frente de Caixa</h1>
                    <p className="text-gray-500">Selecione uma mesa para fechar a conta</p>
                </header>

                <div className="grid grid-cols-3 gap-4">
                    {tables.map(table => (
                        <div 
                            key={table.id}
                            onClick={() => table.status === 'OCCUPIED' && setSelectedTable(table)}
                            className={`
                                relative p-6 rounded-xl border-2 transition-all cursor-pointer
                                ${table.status === 'OCCUPIED' 
                                    ? 'bg-white border-blue-500 hover:shadow-lg hover:scale-[1.02]' 
                                    : 'bg-gray-200 border-gray-300 opacity-70 cursor-not-allowed'}
                                ${selectedTable?.id === table.id ? 'ring-4 ring-blue-300' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-2xl font-bold text-gray-700">Mesa {table.number}</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${table.status === 'OCCUPIED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {table.status === 'OCCUPIED' ? 'OCUPADA' : 'LIVRE'}
                                </span>
                            </div>
                            
                            {table.status === 'OCCUPIED' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 text-sm">Consumo Parcial</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        R$ {Number(table.current_total).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* LADO DIREITO: Painel de Pagamento */}
            <div className="w-1/3 bg-white shadow-xl border-l border-gray-200 flex flex-col h-full">
                {selectedTable ? (
                    <>
                        {/* Cabeçalho do Painel */}
                        <div className="p-6 bg-gray-50 border-b">
                            <h2 className="text-2xl font-bold flex items-center">
                                <User className="mr-2" /> Mesa {selectedTable.number}
                            </h2>
                            <p className="text-sm text-gray-500">Fechamento de Conta</p>
                        </div>

                        {/* Detalhes Financeiros */}
                        <div className="p-6 flex-1 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal Consumo</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Taxa de Serviço (10%)</span>
                                <span>R$ {serviceFee.toFixed(2)}</span>
                            </div>
                            
                            {/* Input de Desconto */}
                            <div className="pt-4 border-t">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                                <span className="text-xl font-bold text-gray-800">TOTAL A PAGAR</span>
                                <span className="text-3xl font-bold text-green-600">R$ {totalToPay.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Seleção de Pagamento */}
                        <div className="p-6 bg-gray-50 border-t space-y-3">
                            <p className="text-sm font-bold text-gray-500 uppercase">Forma de Pagamento</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <CreditCard size={20} className="mb-1" /> Crédito
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('DEBIT_CARD')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center ${paymentMethod === 'DEBIT_CARD' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <CreditCard size={20} className="mb-1" /> Débito
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('PIX')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center ${paymentMethod === 'PIX' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <Smartphone size={20} className="mb-1" /> PIX
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`p-3 rounded border flex flex-col items-center justify-center ${paymentMethod === 'CASH' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <Banknote size={20} className="mb-1" /> Dinheiro
                                </button>
                            </div>

                            <button 
                                onClick={handleCloseAccount}
                                disabled={loading}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-transform active:scale-95 flex justify-center items-center"
                            >
                                {loading ? 'Processando...' : (
                                    <>
                                        <Printer className="mr-2" /> FECHAR CONTA & LIBERAR MESA
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <DollarSign size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-600">Nenhuma mesa selecionada</h3>
                        <p>Clique em uma mesa ocupada à esquerda para ver os detalhes e fechar a conta.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashierDashboard;