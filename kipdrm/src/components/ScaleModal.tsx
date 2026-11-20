/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PROBABILITY_SCALE, TIME_IMPACT_SCALE, FINANCIAL_IMPACT_SCALE, NON_FINANCIAL_IMPACT_SCALE, MEASURE_GOALS, WORDING_EXAMPLES } from '../utils/scales';
import { X, HelpCircle, CheckCircle2, AlertTriangle, BookOpen, Layers } from 'lucide-react';

interface ScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'prob' | 'time' | 'fin' | 'nonfin' | 'goals' | 'wording';
}

export const ScaleModal: React.FC<ScaleModalProps> = ({ isOpen, onClose, initialTab = 'prob' }) => {
  const [activeTab, setActiveTab] = useState<'prob' | 'time' | 'fin' | 'nonfin' | 'goals' | 'wording'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Справочник критериев и шкал оценки рисков
              </h3>
              <p className="text-xs text-slate-400">
                Памятка по заполнению Регистра рисков НАО «КИОР»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('prob')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'prob'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Табл. 1: Вероятность (1–5)
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'time'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Табл. 2: Время влияния (1–3)
          </button>
          <button
            onClick={() => setActiveTab('fin')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'fin'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Табл. 3: Фин. ущерб (1–5)
          </button>
          <button
            onClick={() => setActiveTab('nonfin')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'nonfin'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Табл. 4: Нефин. влияние (1–5)
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'goals'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Цели мер (А/Б/В/Г)
          </button>
          <button
            onClick={() => setActiveTab('wording')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wording'
                ? 'border-blue-600 text-blue-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Примеры формулировок
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 space-y-4">
          {activeTab === 'prob' && (
            <div>
              <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-xs flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Таблица 1.</strong> Оценка вероятности наступления события по шкале от 1 до 5 на основе статистических наблюдений и экспертной оценки.
                </span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {PROBABILITY_SCALE.map((lvl) => (
                  <div key={lvl.score} className="p-4 bg-white hover:bg-slate-50 flex items-start space-x-4">
                    <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-base">
                      {lvl.score}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{lvl.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {lvl.description}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{lvl.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div>
              <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-xs flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Таблица 2.</strong> Оценка продолжительности времени влияния последствий риска на операционные процессы и деятельность института.
                </span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {TIME_IMPACT_SCALE.map((lvl) => (
                  <div key={lvl.score} className="p-4 bg-white hover:bg-slate-50 flex items-start space-x-4">
                    <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-base">
                      {lvl.score}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{lvl.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {lvl.description}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{lvl.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fin' && (
            <div>
              <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-xs flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Таблица 3.</strong> Оценка размера возможного материального ущерба (прямые финансовые потери, штрафы, непредвиденные издержки).
                </span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {FINANCIAL_IMPACT_SCALE.map((lvl) => (
                  <div key={lvl.score} className="p-4 bg-white hover:bg-slate-50 flex items-start space-x-4">
                    <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-base">
                      {lvl.score}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{lvl.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {lvl.description}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{lvl.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nonfin' && (
            <div>
              <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-xs flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Таблица 4.</strong> Оценка нефинансового влияния: репутационный ущерб, неисполнение госзадания, санкции госорганов, судебные иски.
                </span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {NON_FINANCIAL_IMPACT_SCALE.map((lvl) => (
                  <div key={lvl.score} className="p-4 bg-white hover:bg-slate-50 flex items-start space-x-4">
                    <span className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-base">
                      {lvl.score}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{lvl.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {lvl.description}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{lvl.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="mb-4 bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-indigo-900 text-xs">
                При заполнении Части 2 Регистра для каждого мероприятия обязательно указывается одна из четырех стандартных целей:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.values(MEASURE_GOALS) as Array<{ code: 'А' | 'Б' | 'В' | 'Г'; label: string }>).map((g) => (
                  <div key={g.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                      {g.code}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{g.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {g.code === 'А' && 'Меры направлены на минимизацию потерь, если риск все же наступит.'}
                        {g.code === 'Б' && 'Меры направлены на устранение предпосылок и снижение частоты риска.'}
                        {g.code === 'В' && 'Превентивное исключение риска путем изменения регламентов или технологий.'}
                        {g.code === 'Г' && 'Компенсационные механизмы, резервы и страхование для восстановления.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wording' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-xs">
                Типичные ошибки при формулировании рисков согласно разделу 3 Памятки:
              </div>
              <div className="space-y-3">
                {WORDING_EXAMPLES.map((ex, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs">
                    <div className="flex items-start space-x-2 text-rose-700 mb-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Неправильно:</span>
                        <p className="text-sm font-medium line-through text-slate-500">{ex.bad}</p>
                        <p className="text-xs text-rose-600 italic mt-0.5">Причина: {ex.badReason}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 text-emerald-800 pt-2 border-t border-slate-100">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Рекомендуемый вариант:</span>
                        <p className="text-sm font-semibold text-slate-900">{ex.good}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
