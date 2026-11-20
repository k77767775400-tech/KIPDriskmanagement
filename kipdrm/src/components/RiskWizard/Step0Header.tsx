/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeaderData, RiskRegisterDocument } from '../../types/risk';
import { INITIAL_DEPARTMENTS } from '../../utils/acceptanceData';
import { getQuarterPeriodString, getQuarterSubmissionDeadline } from '../../utils/calculations';
import { Calendar, User, Building, AlertCircle, Copy, Clock } from 'lucide-react';

interface Step0HeaderProps {
  header: HeaderData;
  onChange: (updated: HeaderData) => void;
  onCopyFromPrevious?: () => void;
  hasPreviousQuarterAvailable?: boolean;
  status: string;
}

export const Step0Header: React.FC<Step0HeaderProps> = ({
  header,
  onChange,
  onCopyFromPrevious,
  hasPreviousQuarterAvailable,
  status,
}) => {
  const deadlineInfo = getQuarterSubmissionDeadline(header.quarter, header.year);
  const isOverdue = deadlineInfo.isOverdue();

  const handleQuarterChange = (q: 'I' | 'II' | 'III' | 'IV') => {
    const period = getQuarterPeriodString(q, header.year);
    onChange({
      ...header,
      quarter: q,
      periodString: period,
    });
  };

  const handleYearChange = (y: number) => {
    const period = getQuarterPeriodString(header.quarter, y);
    onChange({
      ...header,
      year: y,
      periodString: period,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Title card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-md border border-blue-700/50">
            Шаг 0 • Общие сведения и реквизиты (Лист «Инструкция»)
          </span>
          <h2 className="text-xl font-bold mt-2 text-white">
            Формирование Регистра рисков подразделения
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Укажите структурное подразделение, отчетный период и ответственного координатора по рискам. Данные автоматически попадут в титульные ячейки C4, C5, C6 официального файла Excel.
          </p>
        </div>

        {/* Copy from previous quarter action */}
        {hasPreviousQuarterAvailable && (
          <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-blue-200">
              <Clock className="w-4 h-4 text-blue-300" />
              <span>Доступен утвержденный регистр за прошлый период.</span>
            </div>
            <button
              type="button"
              onClick={onCopyFromPrevious}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Скопировать риски из прошлого квартала</span>
            </button>
          </div>
        )}
      </div>

      {/* Main form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        {/* Department selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Структурное подразделение (ячейка C4) *</span>
          </label>
          <select
            value={header.department}
            onChange={(e) => onChange({ ...header, department: e.target.value })}
            className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
          >
            {INITIAL_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Подразделение автоматически назначается владельцем всех рисков в Части 1.
          </p>
        </div>

        {/* Reporting Period & Quarter */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Отчетный период (ячейка C5) *</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Квартал:</label>
              <select
                value={header.quarter}
                onChange={(e) => handleQuarterChange(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              >
                <option value="I">I квартал</option>
                <option value="II">II квартал</option>
                <option value="III">III квартал</option>
                <option value="IV">IV квартал</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Год:</label>
              <select
                value={header.year}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              >
                <option value={2025}>2025 год</option>
                <option value={2026}>2026 год</option>
                <option value={2027}>2027 год</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            <span>Календарный диапазон:</span>
            <span className="font-mono font-bold text-blue-700">{header.periodString}</span>
          </div>
        </div>

        {/* Coordinator Name */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>Координатор по управлению рисками (ФИО) *</span>
          </label>
          <input
            type="text"
            value={header.coordinatorName ?? ''}
            onChange={(e) => onChange({ ...header, coordinatorName: e.target.value })}
            placeholder="Например: Алиев Марат"
            className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Coordinator Position */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Должность координатора *
          </label>
          <input
            type="text"
            value={header.coordinatorPosition ?? ''}
            onChange={(e) => onChange({ ...header, coordinatorPosition: e.target.value })}
            placeholder="Например: Руководитель отдела"
            className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Curating Deputy Chairman */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Курирующий заместитель председателя Правления
          </label>
          <input
            type="text"
            value={header.curatingDeputyName || ''}
            onChange={(e) => onChange({ ...header, curatingDeputyName: e.target.value })}
            placeholder="Например: Сапарбаев Е. Б."
            className="w-full text-sm rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
          />
          <p className="text-[11px] text-slate-500">
            После согласования с риск-менеджером утвержденный регистр передается на подпись курирующему зампреду до 3-го декабря.
          </p>
        </div>
      </div>

      {/* Deadline Alert Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
          isOverdue
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <AlertCircle className={`w-5 h-5 shrink-0 ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`} />
        <div>
          <span className="font-bold">
            {isOverdue ? 'Внимание: Срок сдачи истек!' : 'Регламентный срок подачи проекта:'}
          </span>
          <p className="mt-0.5">
            Проект Регистра за {header.quarter} квартал {header.year} г. должен быть направлен менеджеру по рискам не позднее{' '}
            <strong className="underline">{deadlineInfo.deadlineString} (до 23:59)</strong>. Утвержденный оригинал передается до 3-го декабря.
          </p>
        </div>
      </div>
    </div>
  );
};
