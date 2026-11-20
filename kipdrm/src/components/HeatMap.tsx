/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskItem } from '../types/risk';
import { calculateRiskScore, getRatingDetails } from '../utils/calculations';
import { ArrowRight, Info } from 'lucide-react';

interface HeatMapProps {
  risks: RiskItem[];
  title?: string;
  onSelectRisk?: (risk: RiskItem) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({ risks, title = 'Тепловая карта рисков (Матрица 5×5)', onSelectRisk }) => {
  const [mode, setMode] = useState<'inherent' | 'residual' | 'compare'>('inherent');
  const [selectedHoverRisk, setSelectedHoverRisk] = useState<RiskItem | null>(null);

  // Probability: 5 (top) down to 1 (bottom)
  const probabilities = [5, 4, 3, 2, 1];
  // Impact: 1 (left) to 5 (right)
  const impacts = [1, 2, 3, 4, 5];

  // Helper to determine matrix cell background color based on representative score (p + 2)*i
  const getCellColor = (p: number, i: number) => {
    // representative average time impact = 2
    const score = (p + 2) * i;
    if (score >= 28) return 'bg-red-500/20 border-red-500/40 text-red-900';
    if (score >= 15) return 'bg-orange-500/20 border-orange-500/40 text-orange-900';
    if (score >= 8) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-900';
    return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-900';
  };

  const getCellZoneLabel = (p: number, i: number) => {
    const score = (p + 2) * i;
    if (score >= 28) return 'Красная';
    if (score >= 15) return 'Оранжевая';
    if (score >= 8) return 'Жёлтая';
    return 'Зелёная';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Распределение рисков по шкале вероятности и степени влияния
          </p>
        </div>

        {/* Mode switcher */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
          <button
            onClick={() => setMode('inherent')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'inherent' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Присущие риски
          </button>
          <button
            onClick={() => setMode('residual')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'residual' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Остаточные риски
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'compare' ? 'bg-white shadow-xs text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Динамика снижения (→)
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span>Красная зона (≥ 28, крайне высокая)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          <span>Оранжевая зона (≥ 15, высокая)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
          <span>Жёлтая зона (≥ 8, средняя)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Зелёная зона (1–7, низкая)</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative overflow-x-auto pt-2 pb-4">
        <div className="min-w-[540px]">
          {/* Vertical axis title */}
          <div className="flex">
            <div className="w-10 flex items-center justify-center -rotate-90 text-xs font-semibold text-slate-500 select-none">
              Вероятность
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-5 gap-2">
                {probabilities.map((p) =>
                  impacts.map((i) => {
                    const cellColorClass = getCellColor(p, i);
                    const zone = getCellZoneLabel(p, i);

                    // Filter risks in this cell
                    const matchingRisks = risks.filter((r) => {
                      if (mode === 'inherent') {
                        return (r.probability || 1) === p && (r.impact || 1) === i;
                      } else if (mode === 'residual') {
                        return (r.residualProbability || r.probability || 1) === p && (r.residualImpact || r.impact || 1) === i;
                      } else {
                        // Compare mode shows both or inherent position
                        return (r.probability || 1) === p && (r.impact || 1) === i;
                      }
                    });

                    return (
                      <div
                        key={`cell-${p}-${i}`}
                        className={`min-h-[85px] p-2 rounded-lg border flex flex-col justify-between transition-all ${cellColorClass}`}
                      >
                        <div className="flex justify-between items-start text-[10px] opacity-75 font-mono">
                          <span>
                            P={p}, I={i}
                          </span>
                          <span className="text-[9px] font-sans">{zone}</span>
                        </div>

                        {/* Chips container */}
                        <div className="flex flex-wrap gap-1 my-1">
                          {matchingRisks.map((risk) => {
                            const inhScore = calculateRiskScore(risk.probability, risk.timeImpact, risk.impact);
                            const resScore = calculateRiskScore(
                              risk.residualProbability ?? risk.probability,
                              risk.residualTimeImpact ?? risk.timeImpact,
                              risk.residualImpact ?? risk.impact
                            );

                            return (
                              <button
                                key={risk.id}
                                onClick={() => onSelectRisk?.(risk)}
                                onMouseEnter={() => setSelectedHoverRisk(risk)}
                                onMouseLeave={() => setSelectedHoverRisk(null)}
                                className={`text-[11px] font-bold px-1.5 py-0.5 rounded shadow-xs border transition-transform hover:scale-105 ${
                                  mode === 'residual'
                                    ? 'bg-emerald-700 text-white border-emerald-800'
                                    : mode === 'compare'
                                    ? 'bg-blue-800 text-white border-blue-900'
                                    : 'bg-slate-900 text-white border-slate-950'
                                }`}
                                title={`${risk.riskNumber}: ${risk.name} (Балл: ${inhScore} → ${resScore})`}
                              >
                                {risk.riskNumber}
                                {mode === 'compare' && (
                                  <span className="ml-1 text-[9px] text-blue-200">
                                    → {risk.residualProbability ?? risk.probability}x{risk.residualImpact ?? risk.impact}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-[10px] text-right font-medium opacity-60">
                          {matchingRisks.length > 0 ? `${matchingRisks.length} рисков` : ''}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Horizontal axis labels */}
              <div className="grid grid-cols-5 gap-2 mt-2 text-center text-xs text-slate-500 font-medium">
                <div>1 (Незначительное)</div>
                <div>2 (Умеренное)</div>
                <div>3 (Существенное)</div>
                <div>4 (Крупное)</div>
                <div>5 (Катастрофическое)</div>
              </div>

              <div className="text-center text-xs font-semibold text-slate-500 mt-1 select-none">
                Степень влияния (Размер ущерба) →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Card / Detail */}
      {selectedHoverRisk && (
        <div className="mt-2 p-3 bg-slate-900 text-white rounded-lg text-xs animate-in fade-in duration-100 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-400">{selectedHoverRisk.riskNumber}</span>
              <span className="font-semibold text-slate-100">{selectedHoverRisk.name}</span>
            </div>
            <div className="mt-1 flex items-center space-x-4 text-slate-300">
              <span>Присущий: {calculateRiskScore(selectedHoverRisk.probability, selectedHoverRisk.timeImpact, selectedHoverRisk.impact)} баллов ({getRatingDetails(calculateRiskScore(selectedHoverRisk.probability, selectedHoverRisk.timeImpact, selectedHoverRisk.impact)).ratingText})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Остаточный: {calculateRiskScore(selectedHoverRisk.residualProbability ?? selectedHoverRisk.probability, selectedHoverRisk.residualTimeImpact ?? selectedHoverRisk.timeImpact, selectedHoverRisk.residualImpact ?? selectedHoverRisk.impact)} баллов</span>
            </div>
          </div>
          <span className="text-xs text-blue-300 underline cursor-pointer" onClick={() => onSelectRisk?.(selectedHoverRisk)}>
            Открыть карточку
          </span>
        </div>
      )}
    </div>
  );
};
