/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NomenclatureItem, RiskClassId, RISK_CLASSES } from '../types/risk';
import { getStoredNomenclature, saveNomenclature, getNextFreeRiskNumber } from '../utils/storage';
import { Plus, Download, Upload, Search, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';

export const NomenclatureCatalogView: React.FC = () => {
  const [items, setItems] = useState<NomenclatureItem[]>(getStoredNomenclature());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New item form state
  const [newClassId, setNewClassId] = useState<RiskClassId>('5-О');
  const [newRiskNumber, setNewRiskNumber] = useState(getNextFreeRiskNumber('5-О'));
  const [newName, setNewName] = useState('');
  const [newFactors, setNewFactors] = useState('');
  const [newConsequences, setNewConsequences] = useState('');

  const classList: RiskClassId[] = ['1-С', '2-Ф', '3-П', '4-К', '5-О'];

  const handleClassChangeForNew = (cId: RiskClassId) => {
    setNewClassId(cId);
    setNewRiskNumber(getNextFreeRiskNumber(cId, items.map((i) => i.riskNumber)));
  };

  const handleSaveNewItem = () => {
    if (!newName.trim()) {
      alert('Пожалуйста, укажите наименование риска.');
      return;
    }

    const newItem: NomenclatureItem = {
      id: `nom_custom_${Date.now()}`,
      classId: newClassId,
      riskNumber: newRiskNumber.trim(),
      name: newName.trim(),
      defaultFactors: newFactors
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      defaultConsequences: newConsequences
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveNomenclature(updated);
    setIsAdding(false);
    setNewName('');
    setNewFactors('');
    setNewConsequences('');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Удалить эту позицию из справочника Номенклатуры?')) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      saveNomenclature(updated);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Номер риска', 'Класс', 'Наименование риска', 'Типовые факторы', 'Типовые последствия'];
    const rows = items.map((i) => [
      `"${i.riskNumber}"`,
      `"${i.classId}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.defaultFactors || []).join('; ').replace(/"/g, '""')}"`,
      `"${(i.defaultConsequences || []).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Номенклатура_рисков_КИОР_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) return;

        const imported: NomenclatureItem[] = [];
        // Skip header
        for (let idx = 1; idx < lines.length; idx++) {
          const parts = lines[idx].split(';').map((p) => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 3 && parts[0]) {
            imported.push({
              id: `nom_imp_${Date.now()}_${idx}`,
              riskNumber: parts[0],
              classId: (parts[1] as RiskClassId) || '5-О',
              name: parts[2],
              defaultFactors: parts[3] ? parts[3].split(';').map((s) => s.trim()) : [],
              defaultConsequences: parts[4] ? parts[4].split(';').map((s) => s.trim()) : [],
            });
          }
        }

        if (imported.length > 0) {
          // Merge
          const existingMap = new Map(items.map((i) => [i.riskNumber, i]));
          imported.forEach((item) => existingMap.set(item.riskNumber, item));
          const merged = Array.from(existingMap.values());
          setItems(merged);
          saveNomenclature(merged);
          alert(`Успешно импортировано ${imported.length} позиций Номенклатуры.`);
        }
      } catch (err: any) {
        alert(`Ошибка импорта CSV: ${err?.message || err}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const filteredItems = items.filter((item) => {
    if (selectedClass !== 'all' && item.classId !== selectedClass) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.riskNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Справочник Номенклатуры рисков (Приложение 2 к Памятке)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Общеинститутский каталог и нумерация рисков
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Утвержденный реестр кодов и наименований рисков по 5 классам (1-С, 2-Ф, 3-П, 4-К, 5-О).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Импорт CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Экспорт CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleClassChangeForNew('5-О');
              setIsAdding(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить риск в каталог</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedClass === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Все классы ({items.length})
          </button>
          {classList.map((cId) => (
            <button
              key={cId}
              onClick={() => setSelectedClass(cId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                selectedClass === cId
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cId} ({items.filter((i) => i.classId === cId).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по названию или коду..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Add New Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-base">Добавление позиции в Номенклатуру</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Класс риска *</label>
                  <select
                    value={newClassId}
                    onChange={(e) => handleClassChangeForNew(e.target.value as RiskClassId)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 font-medium"
                  >
                    {classList.map((cId) => (
                      <option key={cId} value={cId}>
                        {RISK_CLASSES[cId].title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Номер риска (сгенерирован) *
                  </label>
                  <input
                    type="text"
                    value={newRiskNumber ?? ''}
                    onChange={(e) => setNewRiskNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Стандартное наименование риска *
                </label>
                <textarea
                  rows={2}
                  value={newName ?? ''}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например: Риск задержки ввода в эксплуатацию аналитического модуля..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Типовые риск-факторы (по одному на строку)
                </label>
                <textarea
                  rows={2}
                  value={newFactors ?? ''}
                  onChange={(e) => setNewFactors(e.target.value)}
                  placeholder="Фактор 1&#10;Фактор 2"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Типовые последствия (по одному на строку)
                </label>
                <textarea
                  rows={2}
                  value={newConsequences ?? ''}
                  onChange={(e) => setNewConsequences(e.target.value)}
                  placeholder="Последствие 1&#10;Последствие 2"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveNewItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Сохранить позицию
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nomenclature Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-28">Номер</th>
                <th className="px-3 py-3 w-36">Класс</th>
                <th className="px-4 py-3">Наименование риска</th>
                <th className="px-4 py-3">Типовые факторы и последствия</th>
                <th className="px-4 py-3 text-right w-20">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {item.riskNumber}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-600">
                    {RISK_CLASSES[item.classId]?.shortTitle || item.classId}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 space-y-1">
                    {item.defaultFactors && item.defaultFactors.length > 0 && (
                      <div className="text-[11px]">
                        <strong className="text-slate-700">Факторы:</strong> {item.defaultFactors.join('; ')}
                      </div>
                    )}
                    {item.defaultConsequences && item.defaultConsequences.length > 0 && (
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-700">Последствия:</strong> {item.defaultConsequences.join('; ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                      title="Удалить позицию"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
