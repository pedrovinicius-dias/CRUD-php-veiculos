import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Layers, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import BrandModal from '../../components/BrandModal';
import ConfirmModal from '../../components/ConfirmModal';
import FeedbackMessage from '../../components/FeedbackMessage';

export default function BrandsView({ onDataChange }) {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const [feedback, setFeedback] = useState({ message: '', type: 'success' });

  const fetchBrands = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get('/brands', {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setBrands(res.data.data || []);
    } catch (err) {
      setFeedback({
        message: 'Erro ao carregar a lista de marcas do servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(search);
  }, [search]);

  const handleOpenCreate = () => {
    setCurrentBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setCurrentBrand(brand);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      setIsSubmitting(true);
      if (currentBrand) {
        const res = await api.put(`/brands/${currentBrand.id}`, payload);
        setFeedback({ message: res.data.message || 'Marca atualizada com sucesso!', type: 'success' });
      } else {
        const res = await api.post('/brands', payload);
        setFeedback({ message: res.data.message || 'Marca cadastrada com sucesso!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchBrands(search);
      if (onDataChange) onDataChange();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Ocorreu um erro ao salvar a marca.';
      setFeedback({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (brand) => {
    if (brand.models_count > 0) {
      setFeedback({
        message: 'Não é possível excluir esta marca, pois existem modelos de veículos vinculados a ela. Exclua ou desvincule os modelos antes de continuar.',
        type: 'error',
      });
      return;
    }
    setBrandToDelete(brand);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      const res = await api.delete(`/brands/${brandToDelete.id}`);
      setFeedback({ message: res.data.message || 'Marca excluída com sucesso!', type: 'success' });
      setIsConfirmOpen(false);
      setBrandToDelete(null);
      fetchBrands(search);
      if (onDataChange) onDataChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao excluir a marca.';
      setFeedback({ message: msg, type: 'error' });
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <FeedbackMessage
        message={feedback.message}
        type={feedback.type}
        onClose={() => setFeedback({ message: '', type: 'success' })}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar marcas..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Marca
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-sm">Carregando marcas...</span>
          </div>
        ) : brands.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-700">Nenhuma marca encontrada</h4>
            <p className="text-xs text-slate-500 mt-1">
              {search ? 'Tente buscar por outro termo.' : 'Cadastre sua primeira marca para começar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Nome da Marca</th>
                  <th className="py-3.5 px-6 text-center">Modelos Vinculados</th>
                  <th className="py-3.5 px-6">Data de Criação</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">#{b.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{b.name}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.models_count > 0
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.models_count} {b.models_count === 1 ? 'modelo' : 'modelos'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(b.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Editar marca"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(b)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          b.models_count > 0
                            ? 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir marca"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        brand={currentBrand}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Excluir Marca"
        message={`Tem certeza que deseja excluir a marca "${brandToDelete?.name}"? Esta ação não poderá ser desfeita.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
