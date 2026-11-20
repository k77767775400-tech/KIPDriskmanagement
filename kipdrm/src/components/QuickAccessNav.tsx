/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskRegisterDocument, RiskClassId, ValidationItem } from '../types/risk';
import { calculateRiskScore, getRatingDetails } from '../utils/calculations';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Download,
  Save,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Building,
  Calendar,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface QuickAccessNavProps {
  activeStep: number;
  onSelectStep: (step: number) => void;
  activeDoc: RiskRegisterDocument;
  validation: {
    isValid: boolean;
    blockingErrors: ValidationItem[];
    warnings: ValidationItem[];
  };
  onOpenScaleModal: (tab?: 'prob' | 'time' | 'fin' | 'nonfin' | 'goals' | 'wording') => void;
  onOpenGuideModal: () => void;
  onDownloadExcel: () => void;
  onSaveNow: () => void;
  isSaved: boolean;
  lastSavedTime: string;
  onSelectRisk?: (riskNumber: string, classId: RiskClassId) => void;
  onAddNewRisk?: () => void;
}

export const QuickAccessNav: React.FC<QuickAccessNavProps> = ({
  activeStep,
  onSelectStep,
  activeDoc,
  validation,
  onOpenScaleModal,
  onOpenGuideModal,
  onDownloadExcel,
  onSaveNow,
  isSaved,
  lastSavedTime,
  onSelectRisk,
  onAddNewRisk,
}) => {
  const [riskDropdownOpen, setRiskDropdownOpen] = useState(false);
  const [errorsDrawerOpen, setErrorsDrawerOpen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [riskSearchQuery, setRiskSearchQuery] = useState('');

  const steps = [
    { num: 0, title: 'Реквизиты', subtitle: 'Инструкция', short: '0. Реквизиты' },
    { num: 1, title: 'Присущий риск', subtitle: 'Регистр Ч.1', short: '1. Присущий' },
    { num: 2, title: 'Мероприятия', subtitle: 'Регистр Ч.2', short: '2. Мероприятия' },
    { num: 3, title: 'Остаточный риск', subtitle: 'Регистр Ч.3', short: '3. Остаточный' },
    { num: 4, title: 'Панель КПР', subtitle: 'Показатели', short: '4. КПР' },
    { num: 5, title: 'Реализованные', subtitle: 'Приложение 3', short: '5. Реализованные' },
    { num: 6, title: 'Проверка и сдача', subtitle: 'Итоги', short: '6. Сдача' },
  ];

  // Calculate completion percentage
  const totalChecks = 6;
  let passedChecks = 0;
  if (activeDoc.header.department && activeDoc.header.coordinatorName) passedChecks++;
  if (activeDoc.risks && activeDoc.risks.length > 0) passedChecks++;
  if (activeDoc.risks.some((r) => r.measures && r.measures.length > 0)) passedChecks++;
  if (activeDoc.risks.some((r) => r.residualProbability && r.residualImpact)) passedChecks++;
  if (activeDoc.kprList !== undefined) passedChecks++;
  if (activeDoc.realizedReport !== undefined) passedChecks++;
  const progressPercent = Math.min(100, Math.round((passedChecks / totalChecks) * 100));

  // Filter risks for dropdown
  const filteredRisks = (activeDoc.risks || []).filter((r) => {
    if (!riskSearchQuery.trim()) return true;
    const q = riskSearchQuery.toLowerCase();
    return (
      (r.riskNumber || '').toLowerCase().includes(q) ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.classId || '').toLowerCase().includes(q)
    );
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToRisk = (riskNumber: string, classId: RiskClassId) => {
    setRiskDropdownOpen(false);
    // Switch to step 1 (or stay if on 1, 2, 3)
    if (activeStep !== 1 && activeStep !== 2 && activeStep !== 3) {
      onSelectStep(1);
    }
    if (onSelectRisk) {
      onSelectRisk(riskNumber, classId);
    }
    // Attempt smooth scroll to element
    setTimeout(() => {
      const el = document.getElementById(`risk-card-${riskNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 2500);
      }
    }, 150);
  };

  const handleJumpToError = (error: ValidationItem) => {
    setErrorsDrawerOpen(false);
    onSelectStep(error.step);
    if (error.riskNumber && onSelectRisk) {
      const parentRisk = activeDoc.risks.find((r) => r.riskNumber === error.riskNumber);
      if (parentRisk) {
        onSelectRisk(parentRisk.riskNumber, parentRisk.classId);
      }
    }
    scrollToTop();
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP QUICK NAVIGATION BAR (Enhanced for intuitive workflow) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 space-y-3">
        {/* Top Info & Quick Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          {/* Department, Quarter & Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{activeDoc.header.department}</span>
            </div>

            <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{activeDoc.header.quarter} кв. {activeDoc.header.year}</span>
            </div>

            {/* Auto-save & Manual save */}
            <button
              type="button"
              onClick={onSaveNow}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="Нажмите для принудительного сохранения"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSaved ? `Сохранено (${lastSavedTime})` : 'Сохранить черновик'}</span>
            </button>
          </div>

          {/* Quick Shortcuts: Scales, Guide, Risk Finder, Excel */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Guide Button */}
            <button
              type="button"
              onClick={onOpenGuideModal}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Памятка сотруднику</span>
            </button>

            {/* Quick Scales Dropdown/Button */}
            <button
              type="button"
              onClick={() => onOpenScaleModal('prob')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Шкалы оценки</span>
            </button>

            {/* Quick Risk Navigator Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRiskDropdownOpen(!riskDropdownOpen)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold transition-colors shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Риски ({activeDoc.risks?.length || 0})</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {riskDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 space-y-2 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
                    <span className="font-bold text-slate-800 text-xs">Быстрый переход к риску:</span>
                    <button
                      type="button"
                      onClick={() => setRiskDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Поиск по номеру или названию..."
                      value={riskSearchQuery}
                      onChange={(e) => setRiskSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* List of risks */}
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredRisks.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">
                        {activeDoc.risks?.length === 0 ? 'В регистре пока нет рисков' : 'Риски не найдены'}
                      </div>
                    ) : (
                      filteredRisks.map((r) => {
                        const score = calculateRiskScore(r.probability, r.timeImpact, r.impact);
                        const rating = getRatingDetails(score);

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleJumpToRisk(r.riskNumber, r.classId)}
                            className="w-full text-left p-2 rounded-lg hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-colors flex items-start space-x-2 text-xs"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                              style={{ backgroundColor: rating.colorHex }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-mono font-bold text-slate-900 flex items-center justify-between">
                                <span>{r.riskNumber}</span>
                                <span className="text-[10px] text-slate-500 font-sans">
                                  {rating.ratingText}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {r.name || 'Название еще не заполнено...'}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Add risk button in dropdown */}
                  {onAddNewRisk && (
                    <div className="pt-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setRiskDropdownOpen(false);
                          if (activeStep !== 1) onSelectStep(1);
                          onAddNewRisk();
                        }}
                        className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить новый риск</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error badge button */}
            <button
              type="button"
              onClick={() => setErrorsDrawerOpen(true)}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors shadow-2xs ${
                validation.blockingErrors.length > 0
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="Нажмите для просмотра ошибок и проверки готовности к сдаче"
            >
              {validation.blockingErrors.length > 0 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>Ошибок: {validation.blockingErrors.length}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Готов к сдаче</span>
                </>
              )}
            </button>

            {/* Excel Download button */}
            <button
              type="button"
              onClick={onDownloadExcel}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
              title="Скачать официальный Excel файл (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Stepper Navigation Pills with Progress Status */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Пошаговый мастер заполнения (Шаг {activeStep + 1} из {steps.length})
            </span>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
              <span>Готовность:</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent === 100
                      ? 'bg-emerald-500'
                      : progressPercent >= 60
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-bold text-slate-700">{progressPercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {steps.map((st) => {
              const isActive = activeStep === st.num;
              const isCompleted = activeStep > st.num;
              const stepErrors = validation.blockingErrors.filter((e) => e.step === st.num).length;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => onSelectStep(st.num)}
                  className={`flex flex-col p-2 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-600/20'
                      : stepErrors > 0
                      ? 'bg-rose-50/70 border-rose-200 text-slate-800 hover:bg-rose-100/70'
                      : isCompleted
                      ? 'bg-slate-50/90 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : stepErrors > 0
                          ? 'bg-rose-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stepErrors > 0 ? '!' : isCompleted && !isActive ? '✓' : st.num}
                    </span>

                    {stepErrors > 0 && !isActive && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded-full">
                        {stepErrors} {stepErrors === 1 ? 'ош.' : 'ош.'}
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs leading-tight truncate">
                    {st.title}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {st.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. ERROR INSPECTOR MODAL / DRAWER */}
      {errorsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm text-white">
                  Проверка готовности к сдаче Регистра ({validation.blockingErrors.length} замечаний)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setErrorsDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {validation.blockingErrors.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Все обязательные поля заполнены корректно!
                  </h4>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Блокирующих ошибок не обнаружено. Вы можете перейти на Шаг 6 («Проверка и сдача») и отправить регистр менеджеру по рискам.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorsDrawerOpen(false);
                      onSelectStep(6);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    Перейти к отправке на Шаг 6
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 font-medium">
                    Для отправки регистра менеджеру по рискам необходимо устранить указанные ниже блокирующие замечания:
                  </div>

                  <div className="space-y-2">
                    {validation.blockingErrors.map((err) => (
                      <div
                        key={err.id}
                        className="p-3 bg-white border border-rose-200 rounded-xl shadow-2xs hover:border-blue-400 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono text-[10px]">
                              Шаг {err.step}: {steps[err.step]?.title || err.section}
                            </span>
                            {err.riskNumber && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                                {err.riskNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700">{err.message}</p>
                          {err.recommendation && (
                            <p className="text-slate-500 italic">💡 {err.recommendation}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJumpToError(err)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shrink-0 shadow-2xs transition-colors flex items-center space-x-1"
                        >
                          <span>Исправить</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setErrorsDrawerOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLOATING QUICK-ACCESS DOCK (Always accessible while scrolling long risk lists) */}
      <div className="fixed bottom-4 left-4 z-40 print:hidden">
        {isDockCollapsed ? (
          <button
            type="button"
            onClick={() => setIsDockCollapsed(false)}
            className="w-12 h-12 rounded-full bg-slate-900 hover:bg-blue-600 text-white shadow-xl flex items-center justify-center transition-all hover:scale-105"
            title="Развернуть панель быстрого доступа"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>
        ) : (
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs">
            {/* Step navigation & prev/next */}
            <button
              type="button"
              onClick={() => onSelectStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className={`p-2 rounded-xl transition-colors ${
                activeStep === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Предыдущий шаг"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="px-2 py-1 text-center font-bold">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                Шаг {activeStep + 1} / {steps.length}
              </div>
              <div className="text-white text-xs font-semibold max-w-[100px] truncate">
                {steps[activeStep].title}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
              className={`p-2 rounded-xl transition-colors ${
                activeStep === steps.length - 1
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Следующий шаг"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-700 mx-1" />

            {/* Quick scale button */}
            <button
              type="button"
              onClick={() => onOpenScaleModal('prob')}
              className="p-2 rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
              title="Справочник критериев и шкал"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Quick guide button */}
            <button
              type="button"
              onClick={onOpenGuideModal}
              className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors"
              title="Памятка сотрудника по сдаче"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Scroll to top */}
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Прокрутить страницу наверх"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsDockCollapsed(true)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors ml-1"
              title="Свернуть док"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
