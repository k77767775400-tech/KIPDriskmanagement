/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RiskItem, RiskClassId, RISK_CLASSES, NomenclatureItem } from '../../types/risk';
import { calculateRiskScore, getRatingDetails } from '../../utils/calculations';
import { PROBABILITY_SCALE, TIME_IMPACT_SCALE, FINANCIAL_IMPACT_SCALE, NON_FINANCIAL_IMPACT_SCALE } from '../../utils/scales';
import { getStoredNomenclature, getNextFreeRiskNumber } from '../../utils/storage';
import { Plus, Trash2, HelpCircle, BookOpen, AlertCircle, Sparkles, ChevronRight, Check, Search, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface Step1Props {
  risks: RiskItem[];
  department: string;
  onUpdateRisks: (updated: RiskItem[]) => void;
  onOpenScaleModal: (tab?: 'prob' | 'time' | 'fin' | 'nonfin' | 'wording') => void;
  selectedRiskNumber?: string;
  selectedClassId?: RiskClassId;
}

export const Step1RegisterPart1: React.FC<Step1Props> = ({
  risks,
  department,
  onUpdateRisks,
  onOpenScaleModal,
  selectedRiskNumber,
  selectedClassId,
}) => {
  const [activeClass, setActiveClass] = useState<RiskClassId>(selectedClassId || '5-О');
  const [showNomenclatureModal, setShowNomenclatureModal] = useState(false);
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);
  const [riskFilterText, setRiskFilterText] = useState('');
  const classList: RiskClassId[] = ['1-С', '2-Ф', '3-П', '4-К', '5-О'];

  useEffect(() => {
    if (selectedClassId) {
      setActiveClass(selectedClassId);
    }
  }, [selectedClassId]);

  const risksInActiveClass = risks
    .filter((r) => r.classId === activeClass)
    .filter((r) => {
      if (!riskFilterText.trim()) return true;
      const q = riskFilterText.toLowerCase();
      return (
        (r.riskNumber || '').toLowerCase().includes(q) ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.factors || []).some((f) => (f || '').toLowerCase().includes(q)) ||
        (r.consequences || []).some((c) => (c || '').toLowerCase().includes(q))
      );
    });

  // Add new risk from scratch
  const handleAddNewRisk = () => {
    setRiskFilterText('');
    const currentNumbers = risks.map((r) => r.riskNumber);
    const nextNum = getNextFreeRiskNumber(activeClass, currentNumbers);

    const newRisk: RiskItem = {
      id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      riskNumber: nextNum,
      classId: activeClass,
      name: '',
      factors: [''],
      consequences: [''],
      ownerUnit: department,
      probability: 2,
      timeImpact: 2,
      impact: 2,
      impactType: 'non_financial',
      damageThousandKzt: 0,
      measures: [],
      residualProbability: 2,
      residualTimeImpact: 2,
      residualImpact: 2,
    };

    onUpdateRisks([...risks, newRisk]);
  };

  // Add risk from nomenclature
  const handleSelectFromNomenclature = (nom: NomenclatureItem) => {
    // Check if already in risks
    if (risks.some((r) => r.riskNumber === nom.riskNumber)) {
      alert(`Риск с номером ${nom.riskNumber} уже добавлен в регистр.`);
      return;
    }

    const newRisk: RiskItem = {
      id: `r_nom_${Date.now()}_${nom.riskNumber}`,
      riskNumber: nom.riskNumber,
      classId: nom.classId,
      name: nom.name,
      factors: nom.defaultFactors && nom.defaultFactors.length > 0 ? [...nom.defaultFactors] : [''],
      consequences: nom.defaultConsequences && nom.defaultConsequences.length > 0 ? [...nom.defaultConsequences] : [''],
      ownerUnit: department,
      probability: 2,
      timeImpact: 2,
      impact: 2,
      impactType: 'non_financial',
      damageThousandKzt: 0,
      measures: [],
      residualProbability: 2,
      residualTimeImpact: 2,
      residualImpact: 2,
    };

    onUpdateRisks([...risks, newRisk]);
    setShowNomenclatureModal(false);
  };

  const handleUpdateRisk = (riskId: string, patch: Partial<RiskItem>) => {
    onUpdateRisks(
      risks.map((r) => {
        if (r.id !== riskId) return r;
        const updated = { ...r, ...patch };
        // If inherent scores changed, update defaults if residual wasn't manually altered
        if (patch.probability && !patch.residualProbability) {
          updated.residualProbability = Math.min(updated.residualProbability, patch.probability) as 1 | 2 | 3 | 4 | 5;
        }
        return updated;
      })
    );
  };

  const handleDeleteRisk = (riskId: string) => {
    if (confirm('Удалить данный риск из Регистра? Это также удалит связанные мероприятия и КПР.')) {
      onUpdateRisks(risks.filter((r) => r.id !== riskId));
    }
  };

  // Factor item operations
  const handleFactorChange = (riskId: string, index: number, value: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    const newFactors = [...risk.factors];
    newFactors[index] = value;
    handleUpdateRisk(riskId, { factors: newFactors });
  };

  const handleAddFactor = (riskId: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    handleUpdateRisk(riskId, { factors: [...risk.factors, ''] });
  };

  const handleRemoveFactor = (riskId: string, index: number) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk || risk.factors.length <= 1) return;
    handleUpdateRisk(riskId, { factors: risk.factors.filter((_, i) => i !== index) });
  };

  // Consequence item operations
  const handleConsequenceChange = (riskId: string, index: number, value: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    const newConsequences = [...risk.consequences];
    newConsequences[index] = value;
    handleUpdateRisk(riskId, { consequences: newConsequences });
  };

  const handleAddConsequence = (riskId: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    handleUpdateRisk(riskId, { consequences: [...risk.consequences, ''] });
  };

  const handleRemoveConsequence = (riskId: string, index: number) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk || risk.consequences.length <= 1) return;
    handleUpdateRisk(riskId, { consequences: risk.consequences.filter((_, i) => i !== index) });
  };

  const nomenclatureList = getStoredNomenclature();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 1 • Идентификация и оценка присущего риска (Лист «Регистр Ч.1»)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Реестр рисков по 5 утвержденным классам
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Балл значимости рассчитывается по утвержденной формуле: <strong>(Вероятность + Время влияния) × Влияние</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onOpenScaleModal('prob')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Шкалы оценки (Табл. 1–4)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNomenclatureModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Выбрать из Номенклатуры</span>
          </button>
        </div>
      </div>

      {/* 5 Classes Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {classList.map((cId) => {
          const info = RISK_CLASSES[cId];
          const count = risks.filter((r) => r.classId === cId).length;
          const isActive = activeClass === cId;

          return (
            <button
              key={cId}
              type="button"
              onClick={() => setActiveClass(cId)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {cId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {count}
                </span>
              </div>
              <div className="mt-2 font-semibold text-xs text-slate-900 truncate">
                {info.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Class description & Action */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900">{RISK_CLASSES[activeClass].title}:</span>{' '}
          <span className="text-slate-600">{RISK_CLASSES[activeClass].description}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowFormulaHelper(!showFormulaHelper)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Шпаргалка по формулировке</span>
          </button>
          <button
            type="button"
            onClick={handleAddNewRisk}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 self-start sm:self-auto transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить риск в класс {activeClass}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Employee Formula Helper */}
      {showFormulaHelper && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Правило формулировки риска КИОР (избегайте возвратов от риск-менеджера):</span>
            </span>
            <button
              type="button"
              onClick={() => onOpenScaleModal('wording')}
              className="text-[11px] text-blue-700 hover:underline font-semibold"
            >
              Смотреть все примеры ➔
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2 bg-white rounded-lg border border-amber-200/80">
              <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">1. Причина (Фактор)</span>
              В связи с [задержкой/сбоем]...
            </div>
            <div className="p-2 bg-white rounded-lg border border-amber-200/80">
              <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">2. Событие (Риск)</span>
              может произойти [срыв/ошибка]...
            </div>
            <div className="p-2 bg-white rounded-lg border border-amber-200/80">
              <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">3. Ущерб (Последствие)</span>
              что приведет к [убыткам/штрафу]...
            </div>
          </div>
        </div>
      )}

      {/* Quick Search bar across class risks */}
      {risks.filter((r) => r.classId === activeClass).length > 2 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Фильтр по рискам класса ${activeClass}...`}
              value={riskFilterText}
              onChange={(e) => setRiskFilterText(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          {riskFilterText && (
            <button
              type="button"
              onClick={() => setRiskFilterText('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Сбросить фильтр
            </button>
          )}
        </div>
      )}

      {/* Risks list in active class */}
      {risksInActiveClass.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            {riskFilterText
              ? `По запросу «${riskFilterText}» рисков не найдено`
              : `В классе «${RISK_CLASSES[activeClass].title}» пока нет рисков`}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {riskFilterText
              ? 'Попробуйте изменить поисковый запрос или очистить фильтр.'
              : 'Добавьте новый риск вручную или выберите утвержденную типовую позицию из Номенклатуры рисков института.'}
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            {riskFilterText ? (
              <button
                onClick={() => setRiskFilterText('')}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Сбросить поиск
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddNewRisk}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  + Создать новый риск
                </button>
                <button
                  onClick={() => setShowNomenclatureModal(true)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg hover:bg-indigo-100"
                >
                  Выбрать из Номенклатуры
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {risksInActiveClass.map((risk, riskIdx) => {
            const p = risk.probability || 1;
            const t = risk.timeImpact || 1;
            const i = risk.impact || 1;
            const score = calculateRiskScore(p, t, i);
            const ratingDetails = getRatingDetails(score);
            const isTargetHighlight = selectedRiskNumber === risk.riskNumber;

            return (
              <div
                key={risk.id}
                id={`risk-card-${risk.riskNumber}`}
                className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                  isTargetHighlight
                    ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Risk Card Header */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      {risk.riskNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Подразделение-владелец: <strong className="text-slate-800">{risk.ownerUnit || department}</strong>
                    </span>
                  </div>

                  {/* Calculated Score Pills */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs">
                      <span className="text-slate-500">Балл:</span>
                      <span className="font-bold font-mono text-slate-900 text-sm">{score}</span>
                      <span className="text-[10px] text-slate-400">({p}+{t})×{i}</span>
                    </div>

                    <div
                      className="px-3 py-1 rounded-md text-xs font-bold border"
                      style={{
                        backgroundColor: ratingDetails.bgHex,
                        color: ratingDetails.colorHex,
                        borderColor: `${ratingDetails.colorHex}40`,
                      }}
                    >
                      {ratingDetails.ratingText} ({ratingDetails.zone} зона)
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRisk(risk.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Удалить риск"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="p-5 space-y-5">
                  {/* Risk Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Наименование риска *
                      </label>
                      <button
                        type="button"
                        onClick={() => onOpenScaleModal('wording')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1 font-medium"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Как правильно сформулировать?</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={risk.name ?? ''}
                      onChange={(e) => handleUpdateRisk(risk.id, { name: e.target.value })}
                      placeholder="Например: Риск сбоя серверной инфраструктуры и потери баз данных социологических исследований"
                      className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  {/* Factors & Consequences repeatable lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Factors */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Риск-факторы (причины и источники) *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddFactor(risk.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить причину</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {risk.factors.map((factor, fIdx) => (
                          <div key={fIdx} className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-semibold text-slate-500 w-5 shrink-0 text-right">
                              {fIdx + 1})
                            </span>
                            <input
                              type="text"
                              value={factor ?? ''}
                              onChange={(e) => handleFactorChange(risk.id, fIdx, e.target.value)}
                              placeholder={`Фактор ${fIdx + 1}...`}
                              className="flex-1 text-xs rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                            />
                            {risk.factors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFactor(risk.id, fIdx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        В Excel файл экспортируется списком: «1) причина; 2) причина.»
                      </p>
                    </div>

                    {/* Consequences */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Описание возможных последствий *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddConsequence(risk.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить последствие</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {risk.consequences.map((consequence, cIdx) => (
                          <div key={cIdx} className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-semibold text-slate-500 w-5 shrink-0 text-right">
                              {cIdx + 1})
                            </span>
                            <input
                              type="text"
                              value={consequence ?? ''}
                              onChange={(e) => handleConsequenceChange(risk.id, cIdx, e.target.value)}
                              placeholder={`Последствие ${cIdx + 1}...`}
                              className="flex-1 text-xs rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                            />
                            {risk.consequences.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveConsequence(risk.id, cIdx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Описывает ущерб репутации, срыв сроков или материальные убытки.
                      </p>
                    </div>
                  </div>

                  {/* Scoring Selectors */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-800 block mb-3 uppercase tracking-wider">
                      Оценка присущего риска по утвержденным шкалам
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Probability (1-5) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Вероятность (1–5):</span>
                          <button
                            type="button"
                            onClick={() => onOpenScaleModal('prob')}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Табл. 1
                          </button>
                        </label>
                        <select
                          value={risk.probability}
                          onChange={(e) =>
                            handleUpdateRisk(risk.id, {
                              probability: parseInt(e.target.value, 10) as any,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {PROBABILITY_SCALE.map((lvl) => (
                            <option key={lvl.score} value={lvl.score}>
                              {lvl.score} — {lvl.title} ({lvl.description})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Time Impact (1-3) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Время влияния (1–3):</span>
                          <button
                            type="button"
                            onClick={() => onOpenScaleModal('time')}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Табл. 2
                          </button>
                        </label>
                        <select
                          value={risk.timeImpact}
                          onChange={(e) =>
                            handleUpdateRisk(risk.id, {
                              timeImpact: parseInt(e.target.value, 10) as any,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {TIME_IMPACT_SCALE.map((lvl) => (
                            <option key={lvl.score} value={lvl.score}>
                              {lvl.score} — {lvl.title} ({lvl.description})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Impact (1-5) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>Степень влияния (1–5):</span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => onOpenScaleModal('fin')}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Табл. 3
                            </button>
                            <span>/</span>
                            <button
                              type="button"
                              onClick={() => onOpenScaleModal('nonfin')}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Табл. 4
                            </button>
                          </div>
                        </label>
                        <select
                          value={risk.impact}
                          onChange={(e) =>
                            handleUpdateRisk(risk.id, {
                              impact: parseInt(e.target.value, 10) as any,
                            })
                          }
                          className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        >
                          {NON_FINANCIAL_IMPACT_SCALE.map((lvl) => (
                            <option key={lvl.score} value={lvl.score}>
                              {lvl.score} — {lvl.title} ({lvl.description})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Damage amount */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Размер ущерба, тыс. ₸:
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={risk.damageThousandKzt || 0}
                          onChange={(e) =>
                            handleUpdateRisk(risk.id, {
                              damageThousandKzt: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          placeholder="0"
                          className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nomenclature Selection Modal */}
      {showNomenclatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Номенклатура рисков НАО «КИОР»</h3>
                <p className="text-xs text-slate-400">
                  Выберите стандартный риск для добавления в форму Регистра
                </p>
              </div>
              <button
                onClick={() => setShowNomenclatureModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Фильтр по классу: <strong>{RISK_CLASSES[activeClass].title}</strong>
              </span>
              <span className="text-slate-500">
                Всего позиций: {nomenclatureList.filter((n) => n.classId === activeClass).length}
              </span>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-2">
              {nomenclatureList
                .filter((n) => n.classId === activeClass)
                .map((nom) => {
                  const alreadyAdded = risks.some((r) => r.riskNumber === nom.riskNumber);
                  return (
                    <div
                      key={nom.id}
                      className="p-3 rounded-lg hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            {nom.riskNumber}
                          </span>
                          <span className="font-semibold text-slate-900 text-xs">{nom.name}</span>
                        </div>
                        {nom.defaultFactors && nom.defaultFactors.length > 0 && (
                          <div className="mt-1 text-[11px] text-slate-500">
                            <strong>Типовые факторы:</strong> {nom.defaultFactors.join('; ')}
                          </div>
                        )}
                      </div>

                      {alreadyAdded ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>В регистре</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectFromNomenclature(nom)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                        >
                          Выбрать
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowNomenclatureModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
