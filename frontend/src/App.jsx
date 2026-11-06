import React, { useState } from 'react';
import { Layers, Car } from 'lucide-react';
import BrandsView from './views/Brands/BrandsView';
import ModelsView from './views/Models/ModelsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('brands');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChange = () => {
    // Quando marcas ou modelos mudarem, avisa a outra aba para reconsultar
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  AutoGestão <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 ml-1">CRUD</span>
                </h1>
                <p className="text-xs text-slate-500">Módulo de Cadastro de Marcas e Modelos de Veículos</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('brands')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === 'brands'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                Marcas
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === 'models'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-4 h-4" />
                Modelos
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'brands' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gerenciamento de Marcas</h2>
              <p className="text-sm text-slate-500 mt-1">
                Cadastre e mantenha as montadoras de veículos. A exclusão de marcas com modelos vinculados é bloqueada por segurança (RN01).
              </p>
            </div>
            <BrandsView onDataChange={handleDataChange} />
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gerenciamento de Modelos</h2>
              <p className="text-sm text-slate-500 mt-1">
                Cadastre e consulte os modelos de veículos vinculados às marcas existentes no sistema.
              </p>
            </div>
            <ModelsView refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />
          </div>
        )}
      </main>
    </div>
  );
}
