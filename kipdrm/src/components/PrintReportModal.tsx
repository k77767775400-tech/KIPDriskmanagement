/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskRegisterDocument, RISK_CLASSES, RiskClassId } from '../types/risk';
import { calculateRiskScore, getRatingDetails, formatNumberedList } from '../utils/calculations';
import { Printer, Download, X } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: RiskRegisterDocument;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose, document: doc }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const classOrder: RiskClassId[] = ['1-С', '2-Ф', '3-П', '4-К', '5-О'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Modal Controls - hidden in print */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">
              Печатная форма / HTML-отчет: Регистр рисков НАО «КИОР»
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Распечатать / Сохранить в PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto flex-1 font-serif text-slate-900 space-y-8 text-xs leading-normal print:p-0">
          {/* Official Institute Title */}
          <div className="text-center space-y-1 border-b pb-4 border-slate-300">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-sans font-bold">
              Некоммерческое акционерное общество
            </div>
            <h1 className="text-base font-bold uppercase text-slate-900">
              «Казахстанский институт общественного развития»
            </h1>
            <h2 className="text-sm font-bold text-slate-800">
              РЕГИСТР РИСКОВ И ОТЧЕТ О РЕАЛИЗОВАННЫХ РИСКАХ
            </h2>
          </div>

          {/* Header Metadata Grid */}
          <div className="border border-slate-400 p-4 rounded-sm grid grid-cols-2 gap-4 text-xs">
            <div>
              <p>
                <strong>Структурное подразделение:</strong> {doc.header.department}
              </p>
              <p className="mt-1">
                <strong>Отчетный период:</strong> {doc.header.periodString} ({doc.header.quarter} квартал {doc.header.year} г.)
              </p>
            </div>
            <div>
              <p>
                <strong>Координатор по управлению рисками:</strong> {doc.header.coordinatorName}, {doc.header.coordinatorPosition}
              </p>
              <p className="mt-1">
                <strong>Курирующий зам. председателя:</strong> {doc.header.curatingDeputyName || 'Сапарбаев Е. Б.'}
              </p>
            </div>
          </div>

          {/* Section 1: Register Part 1 */}
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
              1. Часть 1. Оценка присущих рисков
            </h3>
            <table className="w-full border-collapse border border-slate-400 text-[10px]">
              <thead className="bg-slate-100 font-sans font-bold">
                <tr>
                  <th className="border border-slate-400 p-1.5 w-14 text-center">№ риска</th>
                  <th className="border border-slate-400 p-1.5 text-left">Наименование риска</th>
                  <th className="border border-slate-400 p-1.5 text-left">Риск-факторы (причины)</th>
                  <th className="border border-slate-400 p-1.5 text-left">Возможные последствия</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">P (1-5)</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">T (1-3)</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">I (1-5)</th>
                  <th className="border border-slate-400 p-1.5 text-center w-14">Балл (P+T)*I</th>
                  <th className="border border-slate-400 p-1.5 text-center w-24">Рейтинг риска</th>
                </tr>
              </thead>
              <tbody>
                {doc.risks.map((risk) => {
                  const score = calculateRiskScore(risk.probability, risk.timeImpact, risk.impact);
                  const rating = getRatingDetails(score);
                  return (
                    <tr key={risk.id}>
                      <td className="border border-slate-400 p-1.5 font-bold font-mono text-center">
                        {risk.riskNumber}
                      </td>
                      <td className="border border-slate-400 p-1.5 font-semibold">{risk.name}</td>
                      <td className="border border-slate-400 p-1.5 whitespace-pre-line">
                        {formatNumberedList(risk.factors)}
                      </td>
                      <td className="border border-slate-400 p-1.5 whitespace-pre-line">
                        {formatNumberedList(risk.consequences)}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center">{risk.probability}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{risk.timeImpact}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{risk.impact}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold font-mono">
                        {score}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold">
                        {rating.ratingText} ({rating.zone})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Register Part 2 */}
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
              2. Часть 2. Мероприятия по управлению рисками
            </h3>
            <table className="w-full border-collapse border border-slate-400 text-[10px]">
              <thead className="bg-slate-100 font-sans font-bold">
                <tr>
                  <th className="border border-slate-400 p-1.5 w-14 text-center">№ риска</th>
                  <th className="border border-slate-400 p-1.5 text-left">Наименование мероприятия</th>
                  <th className="border border-slate-400 p-1.5 text-center w-12">Цель</th>
                  <th className="border border-slate-400 p-1.5 text-right w-16">Стоимость, тыс ₸</th>
                  <th className="border border-slate-400 p-1.5 text-left">Срок реализации</th>
                  <th className="border border-slate-400 p-1.5 text-left">Форма завершения</th>
                  <th className="border border-slate-400 p-1.5 text-center w-24">Статус выполнения</th>
                </tr>
              </thead>
              <tbody>
                {doc.risks.map((risk) => (
                  <React.Fragment key={risk.id}>
                    {(risk.measures || []).map((m, mIdx) => (
                      <tr key={m.id}>
                        {mIdx === 0 && (
                          <td
                            rowSpan={risk.measures.length || 1}
                            className="border border-slate-400 p-1.5 font-bold font-mono text-center align-top"
                          >
                            {risk.riskNumber}
                          </td>
                        )}
                        <td className="border border-slate-400 p-1.5">{m.name}</td>
                        <td className="border border-slate-400 p-1.5 text-center font-bold">{m.goal}</td>
                        <td className="border border-slate-400 p-1.5 text-right font-mono">
                          {m.estimatedCost || 0}
                        </td>
                        <td className="border border-slate-400 p-1.5">{m.deadline}</td>
                        <td className="border border-slate-400 p-1.5">{m.completionForm}</td>
                        <td className="border border-slate-400 p-1.5 text-center font-bold">{m.status}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Register Part 3 */}
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
              3. Часть 3. Остаточный риск и эффективность мероприятий
            </h3>
            <table className="w-full border-collapse border border-slate-400 text-[10px]">
              <thead className="bg-slate-100 font-sans font-bold">
                <tr>
                  <th className="border border-slate-400 p-1.5 w-14 text-center">№ риска</th>
                  <th className="border border-slate-400 p-1.5 text-center w-16">Присущий балл</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">Ост. P</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">Ост. T</th>
                  <th className="border border-slate-400 p-1.5 text-center w-10">Ост. I</th>
                  <th className="border border-slate-400 p-1.5 text-center w-16">Остаточный балл</th>
                  <th className="border border-slate-400 p-1.5 text-center">Оценка эффективности мер</th>
                </tr>
              </thead>
              <tbody>
                {doc.risks.map((risk) => {
                  const inhScore = calculateRiskScore(risk.probability, risk.timeImpact, risk.impact);
                  const resProb = risk.residualProbability ?? risk.probability;
                  const resTime = risk.residualTimeImpact ?? risk.timeImpact;
                  const resImp = risk.residualImpact ?? risk.impact;
                  const resScore = calculateRiskScore(resProb, resTime, resImp);
                  const effText =
                    resScore < inhScore ? `Эффективно: ${inhScore} → ${resScore}` : 'Риск не снижен';

                  return (
                    <tr key={risk.id}>
                      <td className="border border-slate-400 p-1.5 font-bold font-mono text-center">
                        {risk.riskNumber}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{inhScore}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{resProb}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{resTime}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{resImp}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold font-mono">
                        {resScore}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-semibold">{effText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4: KPR Panel */}
          {doc.kprList && doc.kprList.length > 0 && (
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                4. Панель ключевых показателей риска (КПР)
              </h3>
              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead className="bg-slate-100 font-sans font-bold">
                  <tr>
                    <th className="border border-slate-400 p-1.5 w-14 text-center">№ риска</th>
                    <th className="border border-slate-400 p-1.5 text-left">Опережающий показатель (Leading)</th>
                    <th className="border border-slate-400 p-1.5 text-left">Итоговый показатель (Lagging)</th>
                    <th className="border border-slate-400 p-1.5 text-left">Пороговое значение</th>
                    <th className="border border-slate-400 p-1.5 text-left">Мероприятие по управлению</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.kprList.map((kpr) => (
                    <tr key={kpr.id}>
                      <td className="border border-slate-400 p-1.5 font-bold font-mono text-center">
                        {kpr.riskNumber}
                      </td>
                      <td className="border border-slate-400 p-1.5">{kpr.leadingKpr}</td>
                      <td className="border border-slate-400 p-1.5">{kpr.laggingKpr}</td>
                      <td className="border border-slate-400 p-1.5 font-bold">{kpr.thresholdValue}</td>
                      <td className="border border-slate-400 p-1.5">{kpr.managementMeasure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-400 grid grid-cols-2 gap-8 text-xs font-sans">
            <div>
              <p>Координатор по управлению рисками:</p>
              <div className="mt-6 border-b border-slate-800 w-48"></div>
              <p className="mt-1 text-[11px] text-slate-600">
                {doc.header.coordinatorName} ({doc.header.coordinatorPosition})
              </p>
            </div>
            <div>
              <p>Главный менеджер по управлению рисками:</p>
              <div className="mt-6 border-b border-slate-800 w-48"></div>
              <p className="mt-1 text-[11px] text-slate-600">
                Омаров К. К.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
