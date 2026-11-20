/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RealizedClassSection, RealizedEvent, RiskClassId, RISK_CLASSES, RiskItem } from '../../types/risk';
import { Plus, Trash2, CheckCircle2, AlertCircle, Calendar, MapPin, DollarSign, ShieldAlert, History } from 'lucide-react';

interface Step5Props {
  realizedReport: Record<RiskClassId, RealizedClassSection>;
  risks: RiskItem[];
  department: string;
  onUpdateRealized: (updated: Record<RiskClassId, RealizedClassSection>) => void;
}

export const Step5RealizedRisks: React.FC<Step5Props> = ({
  realizedReport,
  risks,
  department,
  onUpdateRealized,
}) => {
  const [activeClass, setActiveClass] = useState<RiskClassId>('5-О');
  const classList: RiskClassId[] = ['1-С', '2-Ф', '3-П', '4-К', '5-О'];

  const currentSection = realizedReport[activeClass] || {
    classId: activeClass,
    hasNoEvents: true,
    events: [],
  };

  const handleToggleNoEvents = (checked: boolean) => {
    onUpdateRealized({
      ...realizedReport,
      [activeClass]: {
        ...currentSection,
        hasNoEvents: checked,
      },
    });
  };

  const handleAddEvent = () => {
    const parentRiskNum = risks.find((r) => r.classId === activeClass)?.riskNumber || '';
    const newEvent: RealizedEvent = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      classId: activeClass,
      eventNumber: (currentSection.events?.length || 0) + 1,
      detectionDate: new Date().toISOString().split('T')[0],
      description: parentRiskNum ? `Инцидент по риску ${parentRiskNum}: ` : '',
      occurrenceLocation: `НАО «КИОР», г. Астана`,
      causes: '',
      initialDamage: '',
      finalDamage: 'уточняется',
      takenMeasures: '',
      effectivenessEvaluation: 'В процессе устранения',
      department,
      isCarriedOver: false,
    };

    onUpdateRealized({
      ...realizedReport,
      [activeClass]: {
        ...currentSection,
        hasNoEvents: false,
        events: [...(currentSection.events || []), newEvent],
      },
    });
  };

  const handleUpdateEvent = (eventId: string, patch: Partial<RealizedEvent>) => {
    onUpdateRealized({
      ...realizedReport,
      [activeClass]: {
        ...currentSection,
        events: (currentSection.events || []).map((ev) => (ev.id === eventId ? { ...ev, ...patch } : ev)),
      },
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const filtered = (currentSection.events || []).filter((ev) => ev.id !== eventId);
    onUpdateRealized({
      ...realizedReport,
      [activeClass]: {
        ...currentSection,
        hasNoEvents: filtered.length === 0,
        events: filtered.map((ev, idx) => ({ ...ev, eventNumber: idx + 1 })),
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 5 • Отчет о реализованных рисках (Приложение 3 к Памятке)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Фиксация инцидентов и фактически наступивших событий
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Заполняется по каждому из 5 классов. При отсутствии событий в отчетном квартале обязательно активируется переключатель <strong>«Случаев не было»</strong>.
          </p>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700">
          <div>
            Классов с зафиксированными событиями:{' '}
            <strong>
              {classList.filter((c) => !realizedReport[c]?.hasNoEvents && (realizedReport[c]?.events?.length || 0) > 0).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Class tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {classList.map((cId) => {
          const info = RISK_CLASSES[cId];
          const section = realizedReport[cId];
          const hasEvents = !section?.hasNoEvents && (section?.events?.length || 0) > 0;
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
                {hasEvents ? (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {section.events.length} инцид.
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Нет инцидентов
                  </span>
                )}
              </div>
              <div className="mt-2 font-semibold text-xs text-slate-900 truncate">
                {info.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Class Status & "No events" toggle bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{RISK_CLASSES[activeClass].title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Укажите статус фиксации реализовавшихся рисков для данного класса в отчетном периоде
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentSection.hasNoEvents}
              onChange={(e) => handleToggleNoEvents(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-xs font-bold text-slate-800">
              {currentSection.hasNoEvents ? '✓ Случаев не было' : 'Зафиксированы инциденты'}
            </span>
          </label>

          {!currentSection.hasNoEvents && (
            <button
              type="button"
              onClick={handleAddEvent}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить событие</span>
            </button>
          )}
        </div>
      </div>

      {/* Content depending on toggle */}
      {currentSection.hasNoEvents ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-8 text-center text-emerald-900 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-base">В классе «{RISK_CLASSES[activeClass].title}» случаев не зафиксировано</h4>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            В официальный файл Excel и отчет Приложения 3 будет внесена стандартная запись «Случаев не было».
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleToggleNoEvents(false)}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Зафиксировать реализовавшийся инцидент
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(currentSection.events || []).length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-900 text-xs">
              Переключатель установлен в режим «Зафиксированы инциденты», но событий еще не добавлено. Нажмите «Добавить событие» выше или верните отметку «Случаев не было».
            </div>
          ) : (
            currentSection.events.map((ev, evIdx) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Event header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold font-mono bg-rose-900 text-white px-2.5 py-1 rounded-md">
                      Инцидент #{evIdx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Дата фиксации: <strong className="text-slate-800">{ev.detectionDate || '—'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ev.isCarriedOver || false}
                        onChange={(e) => handleUpdateEvent(ev.id, { isCarriedOver: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Переходящее с прошлого квартала</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                      title="Удалить инцидент"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="p-5 space-y-4">
                  {/* Row 1: Date & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Дата фиксации инцидента *
                      </label>
                      <input
                        type="date"
                        value={ev.detectionDate ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { detectionDate: e.target.value })}
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Место наступления *
                      </label>
                      <input
                        type="text"
                        value={ev.occurrenceLocation ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { occurrenceLocation: e.target.value })}
                        placeholder="Например: Серверное помещение НАО «КИОР», г. Астана"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Description with mandatory risk number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        Детальное описание реализованного события (с обязательным указанием номера риска) *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Пример: «...в результате сбоя по риску 5-О-01...»
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={ev.description ?? ''}
                      onChange={(e) => handleUpdateEvent(ev.id, { description: e.target.value })}
                      placeholder="Детально опишите событие, указав номер риска из Регистра (например: 5-О-01)"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  {/* Causes */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Причины реализации риска *
                    </label>
                    <textarea
                      rows={2}
                      value={ev.causes ?? ''}
                      onChange={(e) => handleUpdateEvent(ev.id, { causes: e.target.value })}
                      placeholder="Например: Выход из строя блока бесперебойного питания при скачке напряжения"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Damages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Ущерб первоначальный *
                      </label>
                      <input
                        type="text"
                        value={ev.initialDamage ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { initialDamage: e.target.value })}
                        placeholder="Например: Простой серверов 3 часа 20 минут"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Ущерб окончательный (допускается число или «уточняется») *
                      </label>
                      <input
                        type="text"
                        value={ev.finalDamage ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { finalDamage: e.target.value })}
                        placeholder="Например: 0 тыс. тенге или «уточняется»"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Measures taken & Effectiveness */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Принятые оперативные меры *
                      </label>
                      <input
                        type="text"
                        value={ev.takenMeasures ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { takenMeasures: e.target.value })}
                        placeholder="Например: Замена аккумуляторов ИБП, ввод резервной линии"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Оценка эффективности принятых мер *
                      </label>
                      <input
                        type="text"
                        value={ev.effectivenessEvaluation ?? ''}
                        onChange={(e) => handleUpdateEvent(ev.id, { effectivenessEvaluation: e.target.value })}
                        placeholder="Например: Высокая: сервисы восстановлены без финансовых потерь"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
