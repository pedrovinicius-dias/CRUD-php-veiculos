import React, { useState, useEffect } from 'react';
import { X, Car } from 'lucide-react';

export default function ModelModal({ isOpen, onClose, onSave, model = null, brands = [], isSubmitting = false }) {
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (model) {
      setName(model.name || '');
      setBrandId(model.brand_id ? String(model.brand_id) : '');
    } else {
      setName('');
      setBrandId(brands.length > 0 ? String(brands[0].id) : '');
    }
    setErrors({});
  }, [model, brands, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const cleanName = name.trim();
    if (!cleanName) {
      newErrors.name = 'O nome do modelo é obrigatório.';
    }

    if (!brandId) {
      newErrors.brand_id = 'A seleção de uma marca é obrigatória.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({
      name: cleanName,
      brand_id: Number(brandId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {model ? 'Editar Modelo' : 'Cadastrar Novo Modelo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Marca do Veículo <span className="text-rose-500">*</span>
            </label>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                if (errors.brand_id) setErrors({ ...errors, brand_id: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 bg-white focus:outline-hidden focus:ring-2 transition ${
                errors.brand_id
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            >
              <option value="">Selecione uma marca cadastrada...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brand_id && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.brand_id}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nome do Modelo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              placeholder="Ex: X1, Corolla, A3, Golf..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : model ? 'Salvar Alterações' : 'Cadastrar Modelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

