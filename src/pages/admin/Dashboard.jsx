import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusCircle, Ban, CheckCircle, DollarSign, Utensils } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category_id: 1, // Default: Bebidas (assumindo ID 1)
        destination: 'KITCHEN',
        description: ''
    });

    // Carregar produtos ao iniciar
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            toast.error('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    // Criar novo produto
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', newProduct);
            toast.success('Produto criado com sucesso!');
            setNewProduct({ name: '', price: '', category_id: 1, destination: 'KITCHEN', description: '' });
            loadProducts(); // Recarrega a lista
        } catch (error) {
            toast.error('Erro ao criar produto');
        }
    };

    // Pausar/Ativar produto (Sem estoque)
    const toggleAvailability = async (id) => {
        try {
            await api.patch(`/products/${id}/toggle`);
            // Atualiza localmente para ser rápido
            setProducts(products.map(p => 
                p.id === id ? { ...p, is_available: !p.is_available } : p
            ));
            toast.info('Disponibilidade atualizada');
        } catch (error) {
            toast.error('Erro ao atualizar');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Painel Gerencial</h1>
                    <p className="text-gray-500">Gestão de Cardápio e Métricas</p>
                </div>
            </header>

            {/* Cards de Métricas (Simulados) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4"><Utensils className="text-blue-600"/></div>
                    <div>
                        <p className="text-sm text-gray-500">Itens no Cardápio</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4"><DollarSign className="text-green-600"/></div>
                    <div>
                        <p className="text-sm text-gray-500">Vendas Hoje</p>
                        <p className="text-2xl font-bold">R$ 0,00</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário de Cadastro */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <PlusCircle className="w-5 h-5 mr-2 text-primary" /> Novo Produto
                    </h2>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                            <input 
                                type="text" 
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
                                value={newProduct.name}
                                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary p-2 border"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary p-2 border"
                                    value={newProduct.category_id}
                                    onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                                >
                                    <option value="1">Bebidas</option>
                                    <option value="2">Lanches</option>
                                    <option value="3">Porções</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destino (Impressão)</label>
                            <select 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary p-2 border"
                                value={newProduct.destination}
                                onChange={e => setNewProduct({...newProduct, destination: e.target.value})}
                            >
                                <option value="KITCHEN">Cozinha</option>
                                <option value="BAR">Bar</option>
                                <option value="READY">Pronta Entrega (Balcão)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-slate-800 transition-colors">
                            Cadastrar Produto
                        </button>
                    </form>
                </div>

                {/* Lista de Produtos */}
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-hidden">
                    <h2 className="text-xl font-semibold mb-4">Cardápio Atual</h2>
                    <div className="overflow-y-auto max-h-[500px]">
                        {loading ? <p>Carregando...</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map(product => (
                                        <tr key={product.id} className={!product.is_available ? 'bg-red-50' : ''}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.name}
                                                {!product.is_available && <span className="ml-2 text-red-600 text-xs">(Esgotado)</span>}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                R$ {Number(product.price).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => toggleAvailability(product.id)}
                                                    className={`p-1 rounded-full ${product.is_available ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                                    title={product.is_available ? "Marcar como esgotado" : "Marcar como disponível"}
                                                >
                                                    {product.is_available ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;