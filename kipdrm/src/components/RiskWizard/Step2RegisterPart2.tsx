/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskItem, RiskMeasure, MeasureGoal, MeasureStatus, MEASURE_GOALS } from '../../types/risk';
import { calculateRiskScore, getRatingDetails } from '../../utils/calculations';
import { Plus, Trash2, HelpCircle, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Search, Lightbulb } from 'lucide-react';

interface Step2Props {
  risks: RiskItem[];
  department: string;
  onUpdateRisks: (updated: RiskItem[]) => void;
  onOpenScaleModal: (tab?: 'goals' | 'wording') => void;
  selectedRiskNumber?: string;
}

export const Step2RegisterPart2: React.FC<Step2Props> = ({
  risks,
  department,
  onUpdateRisks,
  onOpenScaleModal,
  selectedRiskNumber,
}) => {
  const [filterText, setFilterText] = useState('');
  const handleAddMeasure = (riskId: string) => {
    const newMeasure: RiskMeasure = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      goal: 'Б',
      estimatedCost: 0,
      costBenefitAnalysis: '',
      deadline: 'До конца отчетного периода',
      completionForm: 'Отчет об исполнении / Акт',
      responsibleUnit: department,
      status: 'В процессе исполнения',
    };

    onUpdateRisks(
      risks.map((r) => {
        if (r.id !== riskId) return r;
        return {
          ...r,
          measures: [...(r.measures || []), newMeasure],
        };
      })
    );
  };

  const handleUpdateMeasure = (riskId: string, measureId: string, patch: Partial<RiskMeasure>) => {
    onUpdateRisks(
      risks.map((r) => {
        if (r.id !== riskId) return r;
        return {
          ...r,
          measures: (r.measures || []).map((m) => (m.id === measureId ? { ...m, ...patch } : m)),
        };
      })
    );
  };

  const handleDeleteMeasure = (riskId: string, measureId: string) => {
    onUpdateRisks(
      risks.map((r) => {
        if (r.id !== riskId) return r;
        return {
          ...r,
          measures: (r.measures || []).filter((m) => m.id !== measureId),
        };
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 2 • Мероприятия по управлению риском (Лист «Регистр Ч.2»)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            План реагирования и контрольные процедуры
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Для каждого риска формируются адресные мероприятия. Для рисков со значимостью ≥ 8 (рейтинг ≥ 0,8) наличие мероприятий обязательно.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenScaleModal('goals')}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Легенда целей (А / Б / В / Г)</span>
        </button>
      </div>

      {/* Goal legend banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <span className="text-xs font-bold text-slate-700 block mb-2">
          Классификатор целей мероприятий по управлению риском:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {Object.values(MEASURE_GOALS).map((g) => (
            <div key={g.code} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="font-bold text-blue-700">{g.code})</span>{' '}
              <span className="text-slate-800 font-medium">{g.label.replace(/^[А-Г]\)\s*/, '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Search across risks */}
      {risks.length > 2 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск риска для добавления мероприятий..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Сбросить поиск
            </button>
          )}
        </div>
      )}

      {/* Risks blocks */}
      {risks.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          Сначала добавьте риски на Шаге 1.
        </div>
      ) : (
        <div className="space-y-6">
          {risks
            .filter((r) => {
              if (!filterText.trim()) return true;
              const q = filterText.toLowerCase();
              return r.riskNumber.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
            })
            .map((risk) => {
              const score = calculateRiskScore(risk.probability, risk.timeImpact, risk.impact);
              const rating = getRatingDetails(score);
              const isHigh = score >= 8;
              const measures = risk.measures || [];
              const hasNoMeasures = measures.length === 0;
              const isTargetHighlight = selectedRiskNumber === risk.riskNumber;

              return (
                <div
                  key={risk.id}
                  id={`risk-card-step2-${risk.riskNumber}`}
                  className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                    isTargetHighlight
                      ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-md'
                      : isHigh && hasNoMeasures
                      ? 'border-amber-400 ring-2 ring-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                {/* Risk Title bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      {risk.riskNumber}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm max-w-xl truncate">
                      {risk.name || 'Наименование не указано'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-bold border"
                      style={{
                        backgroundColor: rating.bgHex,
                        color: rating.colorHex,
                        borderColor: `${rating.colorHex}40`,
                      }}
                    >
                      Балл: {score} ({rating.ratingText})
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddMeasure(risk.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Добавить мероприятие</span>
                    </button>
                  </div>
                </div>

                {/* Warning if high score has no measures */}
                {isHigh && hasNoMeasures && (
                  <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Обязательное требование:</strong> Риск находится в зоне {rating.zone} (балл {score} ≥ 8). Необходимо добавить хотя бы одно мероприятие по управлению риском для прохождения валидации.
                    </span>
                  </div>
                )}

                {/* Measures list */}
                <div className="p-4 space-y-4">
                  {measures.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Мероприятия еще не добавлены. Нажмите «Добавить мероприятие» выше.
                    </div>
                  ) : (
                    measures.map((measure, mIdx) => (
                      <div
                        key={measure.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative group hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                            Мероприятие №{mIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMeasure(risk.id, measure.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Удалить мероприятие"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Measure Name */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Наименование мероприятия по управлению риском *
                          </label>
                          <input
                            type="text"
                            value={measure.name ?? ''}
                            onChange={(e) =>
                              handleUpdateMeasure(risk.id, measure.id, { name: e.target.value })
                            }
                            placeholder="Например: Внедрение резервного облачного хранилища и репликация баз данных"
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Goal */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Цель мероприятия *
                            </label>
                            <select
                              value={measure.goal}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, {
                                  goal: e.target.value as MeasureGoal,
                                })
                              }
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            >
                              <option value="А">А) снижение ущерба</option>
                              <option value="Б">Б) снижение вероятности</option>
                              <option value="В">В) предотвращение риска</option>
                              <option value="Г">Г) восстановление потерь</option>
                            </select>
                          </div>

                          {/* Cost */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Оценочная стоимость, тыс. ₸
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={measure.estimatedCost}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, {
                                  estimatedCost: Math.max(0, parseFloat(e.target.value) || 0),
                                })
                              }
                              placeholder="0"
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Факт выполнения *
                            </label>
                            <select
                              value={measure.status}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, {
                                  status: e.target.value as MeasureStatus,
                                })
                              }
                              className={`w-full text-xs font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-hidden ${
                                measure.status === 'Исполнено'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : measure.status === 'В процессе исполнения'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="Исполнено">Исполнено</option>
                              <option value="В процессе исполнения">В процессе исполнения</option>
                              <option value="Не исполнено">Не исполнено</option>
                            </select>
                          </div>
                        </div>

                        {/* Cost Benefit */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Сопоставление затрат с результатами
                          </label>
                          <input
                            type="text"
                            value={measure.costBenefitAnalysis ?? ''}
                            onChange={(e) =>
                              handleUpdateMeasure(risk.id, measure.id, {
                                costBenefitAnalysis: e.target.value,
                              })
                            }
                            placeholder="Например: Затраты 1.2 млн ₸ предотвращают ущерб на сумму свыше 35 млн ₸"
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Deadline */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Срок реализации *
                            </label>
                            <input
                              type="text"
                              value={measure.deadline ?? ''}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, { deadline: e.target.value })
                              }
                              placeholder="Например: До 25.08.2026"
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </div>

                          {/* Completion Form */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Форма завершения *
                            </label>
                            <input
                              type="text"
                              value={measure.completionForm ?? ''}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, {
                                  completionForm: e.target.value,
                                })
                              }
                              placeholder="Например: Акт внедрения / Приказ"
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </div>

                          {/* Responsible Unit */}
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">
                              Ответственное подразделение *
                            </label>
                            <input
                              type="text"
                              value={measure.responsibleUnit ?? ''}
                              onChange={(e) =>
                                handleUpdateMeasure(risk.id, measure.id, {
                                  responsibleUnit: e.target.value,
                                })
                              }
                              placeholder="Например: Отдел данных, цифровых решений и AI"
                              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
