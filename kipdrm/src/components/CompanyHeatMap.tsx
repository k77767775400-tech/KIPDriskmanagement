/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskRegisterDocument, RiskItem } from '../types/risk';
import { calculateRiskScore, getRatingDetails } from '../utils/calculations';
import { HeatMap } from './HeatMap';
import { Layers, Building, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface CompanyHeatMapProps {
  registers: RiskRegisterDocument[];
  selectedQuarter: 'I' | 'II' | 'III' | 'IV';
  selectedYear: number;
}

export const CompanyHeatMap: React.FC<CompanyHeatMapProps> = ({
  registers,
  selectedQuarter,
  selectedYear,
}) => {
  // Filter registers for current period
  const currentRegisters = registers.filter(
    (r) => r.header.quarter === selectedQuarter && r.header.year === selectedYear
  );

  // Collect all risks across all department registers
  const allCompanyRisks: RiskItem[] = [];
  currentRegisters.forEach((doc) => {
    (doc.risks || []).forEach((r) => {
      allCompanyRisks.push({
        ...r,
        ownerUnit: doc.header.department,
      });
    });
  });

  // Calculate statistics across company
  const totalRisks = allCompanyRisks.length;
  const redZoneCount = allCompanyRisks.filter((r) => calculateRiskScore(r.probability, r.timeImpact, r.impact) >= 28).length;
  const orangeZoneCount = allCompanyRisks.filter((r) => {
    const s = calculateRiskScore(r.probability, r.timeImpact, r.impact);
    return s >= 15 && s < 28;
  }).length;
  const yellowZoneCount = allCompanyRisks.filter((r) => {
    const s = calculateRiskScore(r.probability, r.timeImpact, r.impact);
    return s >= 8 && s < 15;
  }).length;
  const greenZoneCount = allCompanyRisks.filter((r) => calculateRiskScore(r.probability, r.timeImpact, r.impact) < 8).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Сводный профиль рисков НАО «КИОР»
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Общеинститутская тепловая карта рисков ({selectedQuarter} квартал {selectedYear} г.)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Консолидированная матрица рисков всех структурных подразделений института в отчетном квартале.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono font-bold bg-slate-900 text-white px-3.5 py-2 rounded-lg">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Подразделений: {currentRegisters.length}</span>
        </div>
      </div>

      {/* Statistics Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Всего рисков:</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{totalRisks}</span>
        </div>

        <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-800 block font-semibold">Красная зона (≥ 28):</span>
          <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">{redZoneCount}</span>
        </div>

        <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200 shadow-xs">
          <span className="text-xs text-orange-800 block font-semibold">Оранжевая зона (≥ 15):</span>
          <span className="text-2xl font-bold font-mono text-orange-700 mt-1 block">{orangeZoneCount}</span>
        </div>

        <div className="bg-yellow-50/80 p-4 rounded-xl border border-yellow-200 shadow-xs">
          <span className="text-xs text-yellow-800 block font-semibold">Жёлтая зона (≥ 8):</span>
          <span className="text-2xl font-bold font-mono text-yellow-700 mt-1 block">{yellowZoneCount}</span>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 block font-semibold">Зелёная зона (1–7):</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">{greenZoneCount}</span>
        </div>
      </div>

      {/* Heat Map Component */}
      <HeatMap
        risks={allCompanyRisks}
        title={`Консолидированная карта рисков института (${selectedQuarter} кв. ${selectedYear})`}
      />
    </div>
  );
};
