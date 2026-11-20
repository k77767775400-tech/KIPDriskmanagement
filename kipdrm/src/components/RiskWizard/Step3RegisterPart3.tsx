/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskItem } from '../../types/risk';
import { calculateRiskScore, getRatingDetails, calculateEffectiveness } from '../../utils/calculations';
import { PROBABILITY_SCALE, TIME_IMPACT_SCALE, NON_FINANCIAL_IMPACT_SCALE } from '../../utils/scales';
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle, RotateCcw, Search } from 'lucide-react';

interface Step3Props {
  risks: RiskItem[];
  onUpdateRisks: (updated: RiskItem[]) => void;
  onOpenScaleModal: (tab?: 'prob' | 'time' | 'fin' | 'nonfin') => void;
  selectedRiskNumber?: string;
}

export const Step3RegisterPart3: React.FC<Step3Props> = ({
  risks,
  onUpdateRisks,
  onOpenScaleModal,
  selectedRiskNumber,
}) => {
  const [filterText, setFilterText] = useState('');
  const handleUpdateResidual = (riskId: string, patch: Partial<RiskItem>) => {
    onUpdateRisks(
      risks.map((r) => {
        if (r.id !== riskId) return r;
        return { ...r, ...patch };
      })
    );
  };

  const handleResetToInherent = (riskId: string) => {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    handleUpdateResidual(riskId, {
      residualProbability: risk.probability,
      residualTimeImpact: risk.timeImpact,
      residualImpact: risk.impact,
      residualDamageThousandKzt: risk.damageThousandKzt,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 3 • Оценка остаточного риска и эффективности мер (Лист «Регистр Ч.3»)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Остаточный риск после применения контрольных процедур
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Показывает, насколько реализованные мероприятия снизили вероятность, время влияния или размер возможного ущерба.
          </p>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700">
          <strong>Формула эффективности:</strong>
          <div className="mt-0.5 text-slate-500">
            Остаточный &lt; Присущий → <span className="text-emerald-700 font-bold">Эффективно</span>;
            Превышение → <span className="text-rose-700 font-bold">Ошибка блокировки</span>
          </div>
        </div>
      </div>

      {/* Quick Search across risks */}
      {risks.length > 2 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск риска для оценки остаточного балла..."
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

      {/* Risks table / cards */}
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
              const inhScore = calculateRiskScore(risk.probability, risk.timeImpact, risk.impact);
              const inhRating = getRatingDetails(inhScore);

              const resProb = risk.residualProbability ?? risk.probability ?? 1;
              const resTime = risk.residualTimeImpact ?? risk.timeImpact ?? 1;
              const resImp = risk.residualImpact ?? risk.impact ?? 1;
              const resScore = calculateRiskScore(resProb, resTime, resImp);
              const resRating = getRatingDetails(resScore);

              const eff = calculateEffectiveness(inhScore, resScore);
              const isTargetHighlight = selectedRiskNumber === risk.riskNumber;

              return (
                <div
                  key={risk.id}
                  id={`risk-card-step3-${risk.riskNumber}`}
                  className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                    isTargetHighlight
                      ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-md'
                      : eff.isError
                      ? 'border-rose-400 ring-2 ring-rose-300'
                      : eff.isEffective
                      ? 'border-emerald-300'
                      : 'border-slate-200'
                  }`}
                >
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      {risk.riskNumber}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm max-w-lg truncate">
                      {risk.name}
                    </span>
                  </div>

                  {/* Effectiveness Badge */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border ${
                        eff.isError
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : eff.isEffective
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {eff.isError ? (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      ) : eff.isEffective ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>{eff.text}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResetToInherent(risk.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs transition-colors"
                      title="Сбросить остаточные значения к присущим"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Сбросить</span>
                    </button>
                  </div>
                </div>

                {/* Blocking alert if residual > inherent */}
                {eff.isError && (
                  <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Блокирующая ошибка:</strong> Остаточный балл значимости ({resScore}) превышает присущий балл ({inhScore}). Это противоречит логике управления рисками (контрольные процедуры не могут повышать риск). Измените остаточные оценки.
                    </span>
                  </div>
                )}

                {/* Score Comparison Box */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Left: Inherent Score (read only) */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                        <span>Присущий риск (до мер)</span>
                        <span className="font-mono">({risk.probability}+{risk.timeImpact})×{risk.impact}</span>
                      </div>
                      <div className="flex items-baseline space-x-3">
                        <span className="text-3xl font-extrabold text-slate-900 font-mono">
                          {inhScore}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold border"
                          style={{
                            backgroundColor: inhRating.bgHex,
                            color: inhRating.colorHex,
                            borderColor: `${inhRating.colorHex}40`,
                          }}
                        >
                          {inhRating.ratingText} ({inhRating.zone})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 pt-1 border-t border-slate-200 flex justify-between">
                        <span>Вероятность: <strong>{risk.probability}</strong></span>
                        <span>Время: <strong>{risk.timeImpact}</strong></span>
                        <span>Влияние: <strong>{risk.impact}</strong></span>
                        <span>Ущерб: <strong>{risk.damageThousandKzt || 0} тыс. ₸</strong></span>
                      </div>
                    </div>

                    {/* Right: Residual Score Inputs */}
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                      <div className="flex items-center justify-between text-xs text-blue-900 font-semibold uppercase">
                        <span>Остаточный риск (после мер)</span>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-extrabold text-blue-950 font-mono">
                            {resScore}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-bold border"
                            style={{
                              backgroundColor: resRating.bgHex,
                              color: resRating.colorHex,
                              borderColor: `${resRating.colorHex}40`,
                            }}
                          >
                            {resRating.ratingText}
                          </span>
                        </div>
                      </div>

                      {/* Selectors for residual */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Остат. вер. (1–5):
                          </label>
                          <select
                            value={resProb}
                            onChange={(e) =>
                              handleUpdateResidual(risk.id, {
                                residualProbability: parseInt(e.target.value, 10) as any,
                              })
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus:border-blue-600 focus:outline-hidden"
                          >
                            {PROBABILITY_SCALE.map((lvl) => (
                              <option key={lvl.score} value={lvl.score}>
                                {lvl.score} ({lvl.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Остат. время (1–3):
                          </label>
                          <select
                            value={resTime}
                            onChange={(e) =>
                              handleUpdateResidual(risk.id, {
                                residualTimeImpact: parseInt(e.target.value, 10) as any,
                              })
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus:border-blue-600 focus:outline-hidden"
                          >
                            {TIME_IMPACT_SCALE.map((lvl) => (
                              <option key={lvl.score} value={lvl.score}>
                                {lvl.score} ({lvl.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Остат. влиян. (1–5):
                          </label>
                          <select
                            value={resImp}
                            onChange={(e) =>
                              handleUpdateResidual(risk.id, {
                                residualImpact: parseInt(e.target.value, 10) as any,
                              })
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus:border-blue-600 focus:outline-hidden"
                          >
                            {NON_FINANCIAL_IMPACT_SCALE.map((lvl) => (
                              <option key={lvl.score} value={lvl.score}>
                                {lvl.score} ({lvl.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Остат. ущерб (тыс ₸):
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={risk.residualDamageThousandKzt || 0}
                            onChange={(e) =>
                              handleUpdateResidual(risk.id, {
                                residualDamageThousandKzt: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
