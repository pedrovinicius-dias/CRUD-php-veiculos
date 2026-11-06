import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Car, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import ModelModal from '../../components/ModelModal';
import ConfirmModal from '../../components/ConfirmModal';
import FeedbackMessage from '../../components/FeedbackMessage';

export default function ModelsView({ refreshTrigger, onDataChange }) {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  const [feedback, setFeedback] = useState({ message: '', type: 'success' });

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar marcas para seleção:', err);
    }
  };

  const fetchModels = async (searchTerm = '', brandFilter = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (brandFilter) params.brand_id = brandFilter;

      const res = await api.get('/models', { params });
      setModels(res.data.data || []);
    } catch (err) {
      setFeedback({
        message: 'Erro ao carregar a lista de modelos do servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchModels(search, selectedBrandFilter);
  }, [search, selectedBrandFilter, refreshTrigger]);

  const handleOpenCreate = () => {
    if (brands.length === 0) {
      setFeedback({
        message: 'Você precisa ter pelo menos uma marca cadastrada para poder criar um modelo.',
        type: 'error',
      });
      return;
    }
    setCurrentModel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model) => {
    setCurrentModel(model);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      setIsSubmitting(true);
      if (currentModel) {
        const res = await api.put(`/models/${currentModel.id}`, payload);
        setFeedback({ message: res.data.message || 'Modelo atualizado com sucesso!', type: 'success' });
      } else {
        const res = await api.post('/models', payload);
        setFeedback({ message: res.data.message || 'Modelo cadastrado com sucesso!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchModels(search, selectedBrandFilter);
      if (onDataChange) onDataChange();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Ocorreu um erro ao salvar o modelo.';
      setFeedback({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (model) => {
    setModelToDelete(model);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    try {
      const res = await api.delete(`/models/${modelToDelete.id}`);
      setFeedback({ message: res.data.message || 'Modelo excluído com sucesso!', type: 'success' });
      setIsConfirmOpen(false);
      setModelToDelete(null);
      fetchModels(search, selectedBrandFilter);
      if (onDataChange) onDataChange();
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao excluir o modelo.';
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
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por modelo ou marca..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer"
          >
            <option value="">Todas as Marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Modelo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-sm">Carregando modelos...</span>
          </div>
        ) : models.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Car className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-700">Nenhum modelo cadastrado</h4>
            <p className="text-xs text-slate-500 mt-1">
              {search || selectedBrandFilter
                ? 'Nenhum resultado com os filtros selecionados.'
                : 'Cadastre um novo modelo vinculado a uma marca para começar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Marca Associada</th>
                  <th className="py-3.5 px-6">Nome do Modelo</th>
                  <th className="py-3.5 px-6">Data de Criação</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">#{m.id}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {m.brand ? m.brand.name : `ID: ${m.brand_id}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(m.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Editar modelo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(m)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Excluir modelo"
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

      <ModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        model={currentModel}
        brands={brands}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Excluir Modelo"
        message={`Deseja realmente excluir o modelo "${modelToDelete?.name}"? Esta ação removerá o registro do sistema.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
