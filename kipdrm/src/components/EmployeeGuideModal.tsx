/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Info,
  Check,
  Copy,
} from 'lucide-react';

interface EmployeeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScales?: (tab: 'prob' | 'time' | 'fin' | 'nonfin' | 'goals' | 'wording') => void;
}

export const EmployeeGuideModal: React.FC<EmployeeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenScales,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'formula' | 'scales' | 'residual' | 'faq'>('steps');
  const [copiedExample, setCopiedExample] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedExample(idx);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  Памятка сотрудника по заполнению Регистра рисков КИОР
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Помощник
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Понятное руководство: как безошибочно составить регистр и сдать его с первого раза
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'steps'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>5 шагов до сдачи</span>
          </button>

          <button
            onClick={() => setActiveTab('formula')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'formula'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Формула риска (Фактор ➔ Риск ➔ Последствие)</span>
          </button>

          <button
            onClick={() => setActiveTab('scales')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'scales'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Как выбирать баллы (1–5)</span>
          </button>

          <button
            onClick={() => setActiveTab('residual')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'residual'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Мероприятия и остаточный риск</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'faq'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Частые вопросы (FAQ)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed flex-1">
          {/* TAB 1: 5 STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong className="font-bold">Цель сотрудника подразделения:</strong> вовремя и качественно заполнить Регистр рисков за отчетный квартал, указать актуальные риски своего направления и сформировать план мероприятий по их снижению.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs relative pl-12">
                  <span className="absolute left-4 top-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Шаг 0: Проверьте реквизиты</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Убедитесь, что правильно выбрано ваше подразделение, квартал, год и указаны ваши ФИО и должность. Если вы уже сдавали регистр ранее, воспользуйтесь кнопкой <strong>«Скопировать риски из прошлого квартала»</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs relative pl-12">
                  <span className="absolute left-4 top-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Шаг 1: Опишите присущие риски</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Добавьте риски из утвержденного <strong>Каталога номенклатуры КИОР</strong> или сформулируйте свои. Укажите факторы (причины), последствия и оцените вероятность и ущерб по шкале 1–5.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs relative pl-12">
                  <span className="absolute left-4 top-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Шаг 2: Назначьте мероприятия</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Для рисков с оценкой значимости ≥ 8 обязательно укажите конкретное упреждающее мероприятие, срок его завершения и форму подтверждения (акт, отчет, служебная записка).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs relative pl-12">
                  <span className="absolute left-4 top-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Шаг 3 & 4: Остаточный риск и КПР</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Оцените, как мероприятия снизят риск. <strong>Внимание:</strong> остаточный риск не может быть выше присущего! На шаге 4 укажите ключевые индикаторы риска (если применимо).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs relative pl-12 md:col-span-2">
                  <span className="absolute left-4 top-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Шаг 5 & 6: Реализованные риски и отправка на согласование</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Если за квартал произошли нештатные события или инциденты — зафиксируйте их на шаге 5 (или отметьте галочкой «Рисков не зафиксировано»). На шаге 6 проверьте чек-лист готовности и нажмите <strong>«Отправить менеджеру по рискам»</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMULA */}
          {activeTab === 'formula' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                <span className="text-xs uppercase tracking-wider font-bold text-blue-400">
                  Правило формулировки КИОР
                </span>
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-sm font-mono text-blue-200 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/40 font-sans font-bold text-xs">
                    В связи с [Фактор / Причина]
                  </span>
                  <span className="text-white">➔</span>
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/40 font-sans font-bold text-xs">
                    может произойти [Риск / Событие]
                  </span>
                  <span className="text-white">➔</span>
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/40 font-sans font-bold text-xs">
                    что приведет к [Последствие / Ущерб]
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Не путайте причину и последствие! Например, «Нехватка бюджета» — это не риск, а фактор. «Штраф» — это не риск, а последствие. Риск — это неопределенное событие, которое может произойти.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span>Примеры для подразделений КИОР (нажмите для копирования):</span>
                </h4>

                <div className="space-y-2.5">
                  {[
                    {
                      class: '5-О (Операционные)',
                      name: 'Риск срыва сроков проведения социологического исследования',
                      factor: 'Задержка поставки оборудования или срыв графика полевых работ подрядчиком',
                      consequence: 'Срыв сроков отчета перед государственным органом, штрафные санкции, репутационные издержки',
                    },
                    {
                      class: '4-К (Комплаенс)',
                      name: 'Риск нарушения законодательства о государственных закупках',
                      factor: 'Несвоевременное обновление технической спецификации и процедурные ошибки конкурсной комиссии',
                      consequence: 'Отмена итогов конкурса, предписания контролирующих органов, задержка реализации проектов',
                    },
                    {
                      class: '3-П (Правовые)',
                      name: 'Риск ненадлежащего оформления договоров с соисполнителями',
                      factor: 'Отсутствие типовых антикоррупционных и штрафных оговорок в договорах',
                      consequence: 'Судебные разбирательства, невозможность взыскания неустойки с недобросовестного поставщика',
                    },
                  ].map((ex, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 hover:bg-blue-50/50 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                          {ex.class}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${ex.name}. Причина: ${ex.factor}. Последствия: ${ex.consequence}`, idx)}
                          className="inline-flex items-center space-x-1 text-slate-500 hover:text-blue-600 text-[11px] font-semibold"
                        >
                          {copiedExample === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Скопировано!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Скопировать пример</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-semibold text-slate-900">{ex.name}</div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-700">Фактор:</span> {ex.factor}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-700">Последствие:</span> {ex.consequence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCALES GUIDANCE */}
          {activeTab === 'scales' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-center justify-between gap-3">
                <div>
                  <strong className="font-bold">Как система считает оценку значимости:</strong>
                  <div className="mt-1 font-mono text-[11px] text-indigo-800">
                    Оценка риска = Вероятность × (Время влияния + Ущерб)
                  </div>
                </div>
                {onOpenScales && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenScales('prob');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                  >
                    Открыть полный справочник шкал
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>1. Вероятность (Табл. 1)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li><strong className="text-slate-800">1 — Крайне маловероятно:</strong> случается раз в 5+ лет или практически невозможно.</li>
                    <li><strong className="text-slate-800">2 — Маловероятно:</strong> может произойти раз в 2–3 года.</li>
                    <li><strong className="text-slate-800">3 — Средняя:</strong> возможно раз в год при неблагоприятных факторах.</li>
                    <li><strong className="text-slate-800">4 — Высокая:</strong> случается раз в полугодие или квартал.</li>
                    <li><strong className="text-slate-800">5 — Очень высокая:</strong> ежемесячно или постоянное проявление.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>2. Время влияния (Табл. 2)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li><strong className="text-slate-800">1 — Краткосрочное:</strong> устраняется в течение до 1 недели, не срывает общий график.</li>
                    <li><strong className="text-slate-800">2 — Среднесрочное:</strong> задержка от 1 недели до 1 месяца, требует корректировки планов.</li>
                    <li><strong className="text-slate-800">3 — Долгосрочное:</strong> сбой более 1 месяца или срыв годового KPI Института.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3 md:col-span-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>3. Ущерб: Финансовый или Нефинансовый? (Табл. 3 и 4)</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Если последствие риска можно точно оценить в деньгах (штраф, потеря гранта, непредвиденные расходы) — выбирайте <strong>Финансовый ущерб</strong> и укажите сумму в тыс. тенге. Если риск нематериальный (репутация КИОР, качество исследований, кадровая утечка, срыв нормативов) — выбирайте <strong>Нефинансовый ущерб</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <strong className="text-slate-800 block mb-0.5">1–2: Низкий / Незначительный</strong>
                      Внутренние замечания, незначительные отклонения, решаемые на уровне отдела.
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
                      <strong className="text-amber-900 block mb-0.5">3: Умеренный</strong>
                      Замечания вышестоящих инстанций, единичные негативные публикации, локальный сбой.
                    </div>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950">
                      <strong className="text-rose-900 block mb-0.5">4–5: Критический / Катастрофический</strong>
                      Проверки прокуратуры, аннулирование лицензий, дискредитация института на нац. уровне.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESIDUAL RISK */}
          {activeTab === 'residual' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 text-emerald-950 text-xs space-y-2">
                <div className="font-bold text-sm text-emerald-900 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Главное правило остаточного риска:</span>
                </div>
                <p>
                  Остаточный риск — это риск, который остается <strong>после</strong> выполнения запланированных вами контрольных мероприятий. Он отражает качество защиты.
                </p>
                <div className="font-semibold text-emerald-800">
                  ⚠️ Валидатор не позволит сдать регистр, если остаточная вероятность или ущерб превышают присущий! Мероприятия не могут ухудшать ситуацию.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900">Цели мероприятий (Классификация КИОР):</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li><strong className="text-blue-700">Цель А:</strong> Избежание риска (полный отказ от рискованной операции).</li>
                    <li><strong className="text-blue-700">Цель Б:</strong> Снижение вероятности или ущерба (самое частое — регламенты, инструкции, обучение).</li>
                    <li><strong className="text-blue-700">Цель В:</strong> Передача риска (страхование, привлечение подрядчика с фин. гарантией).</li>
                    <li><strong className="text-blue-700">Цель Г:</strong> Принятие риска (при низком уровне, когда затраты на меры выше возможного ущерба).</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900">Что проверяет Риск-менеджер в мероприятиях:</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>✓ Конкретность срока (например, «до 25 октября 2026 г.», а не «постоянно»).</li>
                    <li>✓ Наличие четкой формы завершения (служебная записка, приказ, чек-лист, акт приемки).</li>
                    <li>✓ Реалистичность снижения остаточного рейтинга.</li>
                    <li>✓ Назначение ответственного исполнителя из числа сотрудников отдела.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              {[
                {
                  q: 'Что делать, если в моем отделе за квартал не было никаких реализовавшихся инцидентов?',
                  a: 'На Шаге 5 («Реализованные риски») просто отметьте галочкой переключатель «Фактов реализации рисков не зафиксировано». Это стандартная штатная ситуация.',
                },
                {
                  q: 'Как быстро перенести данные из прошлого квартала, чтобы не вводить все заново?',
                  a: 'На Шаге 0 нажмите синюю кнопку «Скопировать риски из прошлого квартала». Все риски, формулировки и мероприятия будут автоматически перенесены, и вам останется только актуализировать статусы и оценки.',
                },
                {
                  q: 'Что делать, если при отправке пишет «Невозможно отправить: обнаружены ошибки»?',
                  a: 'Перейдите на Шаг 6 («Проверка и сдача») или откройте блок «Ошибки» на панели навигации быстрого доступа. Каждая ошибка содержит подсказку с указанием шага и конкретного поля, которое необходимо дозаполнить.',
                },
                {
                  q: 'Где скачать официальный утвержденный Excel (.xlsx)?',
                  a: 'Кнопка «Скачать Excel» всегда доступна в правом верхнем углу шапки, на панели быстрого доступа и на Шаге 6. Файл генерируется со всеми утвержденными формулами, цветами и титульными ячейками согласно регламенту КИОР.',
                },
                {
                  q: 'Что делать, если регистр вернулся со статусом «На доработке»?',
                  a: 'В желтом блоке замечаний на Шаге 6 (или в баннере на главной странице) ознакомьтесь с комментариями Главного риск-менеджера, внесите требуемые изменения в формулировки или оценки и нажмите «Отправить повторно».',
                },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-slate-600 pl-5.5 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Горячие клавиши: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-mono">Esc</kbd> — закрыть окно
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Понятно, вернуться к заполнению
          </button>
        </div>
      </div>
    </div>
  );
};
