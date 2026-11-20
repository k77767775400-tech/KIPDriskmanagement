/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskItem, KprItem } from '../../types/risk';
import { calculateRiskScore, getRatingDetails, formatNumberedList } from '../../utils/calculations';
import { AlertCircle, CheckCircle2, Plus, Trash2, Key, Target, TrendingUp, Info } from 'lucide-react';

interface Step4Props {
  risks: RiskItem[];
  kprList: KprItem[];
  onUpdateKpr: (updated: KprItem[]) => void;
}

export const Step4KprPanel: React.FC<Step4Props> = ({ risks, kprList, onUpdateKpr }) => {
  // Find all risks that qualify for mandatory KPR: score >= 15 (ratings 0.9 and 1.0)
  const highRisks = risks.filter((r) => {
    const s = calculateRiskScore(r.probability, r.timeImpact, r.impact);
    return s >= 15;
  });

  const highRiskNumbers = highRisks.map((r) => r.riskNumber);

  // Missing KPRs
  const missingKprRisks = highRisks.filter((hr) => !kprList.some((k) => k.riskNumber === hr.riskNumber));

  const handleAddKprForRisk = (riskNumber: string) => {
    const parentRisk = risks.find((r) => r.riskNumber === riskNumber);
    const firstMeasure = parentRisk?.measures?.[0]?.name || '';

    const newKpr: KprItem = {
      id: `kpr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      riskNumber,
      leadingKpr: '',
      laggingKpr: '',
      thresholdValue: '',
      managementMeasure: firstMeasure,
    };

    onUpdateKpr([...kprList, newKpr]);
  };

  const handleUpdateKprItem = (kprId: string, patch: Partial<KprItem>) => {
    onUpdateKpr(kprList.map((k) => (k.id === kprId ? { ...k, ...patch } : k)));
  };

  const handleDeleteKprItem = (kprId: string) => {
    onUpdateKpr(kprList.filter((k) => k.id !== kprId));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 4 • Панель ключевых показателей риска (Лист «Панель КПР»)
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Панель КПР (Ключевые показатели риска / KRI)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Заполняется <strong>в обязательном порядке</strong> для всех рисков с рейтингом <strong>0,9 (высокая)</strong> и <strong>1,0 (крайне высокая)</strong>.
          </p>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700 space-y-1">
          <div>
            Высоких рисков в регистре: <strong>{highRisks.length}</strong>
          </div>
          <div>
            Заполнено карточек КПР: <strong>{kprList.length}</strong>
          </div>
        </div>
      </div>

      {/* Explanatory Guidance Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Методические указания по заполнению показателей КПР:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-800 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Опережающий КПР (Leading)</span>
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Индикатор раннего предупреждения. Фиксирует симптомы и приближение риска до наступления ущерба (напр. «Доля успешных бэкапов &lt; 99%»).
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-800 flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>Итоговый КПР (Lagging)</span>
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Фактический результат реализации риска (напр. «Длительность простоя сервисов RTO», «Сумма штрафных санкций»).
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <span className="font-bold text-blue-800 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Пороговое значение КПР</span>
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Критический лимит (толерантность), превышение которого требует немедленного доклада руководству института.
            </p>
          </div>
        </div>
      </div>

      {/* Missing KPR alert */}
      {missingKprRisks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm">
                Требуется заполнить Панель КПР для следующих рисков:
              </span>
              <p className="mt-1 text-slate-700">
                Следующие риски имеют балл ≥ 15 (рейтинг 0,9 или 1,0), но еще не добавлены в Панель КПР. Без этого отправка Регистра будет заблокирована:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {missingKprRisks.map((hr) => (
                  <button
                    key={hr.id}
                    type="button"
                    onClick={() => handleAddKprForRisk(hr.riskNumber)}
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить КПР для {hr.riskNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If no high risks at all in register */}
      {highRisks.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center text-emerald-900 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-base">Риски высокой зоны отсутствуют</h4>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            В текущем регистре нет рисков с рейтингом 0,9 или 1,0 (балл значимости &lt; 15). Заполнение вкладки «Панель КПР» не является обязательным.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {kprList.map((kpr, kIdx) => {
            const parentRisk = risks.find((r) => r.riskNumber === kpr.riskNumber);
            const score = parentRisk
              ? calculateRiskScore(parentRisk.probability, parentRisk.timeImpact, parentRisk.impact)
              : 0;
            const rating = getRatingDetails(score);

            return (
              <div
                key={kpr.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold font-mono bg-indigo-900 text-white px-2.5 py-1 rounded-md">
                      КПР #{kIdx + 1}
                    </span>
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                      {kpr.riskNumber}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm max-w-md truncate">
                      {parentRisk?.name || 'Риск не найден в Части 1'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-bold border"
                      style={{
                        backgroundColor: rating.bgHex,
                        color: rating.colorHex,
                        borderColor: `${rating.colorHex}40`,
                      }}
                    >
                      {rating.ratingText} ({rating.zone} зона, балл: {score})
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteKprItem(kpr.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                      title="Удалить карточку КПР"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Auto-filled details from Part 1 */}
                {parentRisk && (
                  <div className="p-4 bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-slate-700 block mb-1">Риск-факторы (авто):</strong>
                      <div className="whitespace-pre-line font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                        {formatNumberedList(parentRisk.factors) || '—'}
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-700 block mb-1">Возможные последствия (авто):</strong>
                      <div className="whitespace-pre-line font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                        {formatNumberedList(parentRisk.consequences) || '—'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual KPR inputs */}
                <div className="p-5 space-y-4">
                  {/* Eligible risk selector if user wants to change risk association */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Привязка к риску высокой зоны *
                      </label>
                      <select
                        value={kpr.riskNumber}
                        onChange={(e) => handleUpdateKprItem(kpr.id, { riskNumber: e.target.value })}
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      >
                        {highRisks.map((hr) => (
                          <option key={hr.id} value={hr.riskNumber}>
                            {hr.riskNumber} — {hr.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Пороговое значение КПР (Tolerance) *
                      </label>
                      <input
                        type="text"
                        value={kpr.thresholdValue ?? ''}
                        onChange={(e) => handleUpdateKprItem(kpr.id, { thresholdValue: e.target.value })}
                        placeholder="Например: RPO ≤ 24 ч., доступность 99.9%, сбоев 0"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Leading */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        КПР опережающий (Leading Indicator) *
                      </label>
                      <textarea
                        rows={2}
                        value={kpr.leadingKpr ?? ''}
                        onChange={(e) => handleUpdateKprItem(kpr.id, { leadingKpr: e.target.value })}
                        placeholder="Например: Доля успешно завершенных автоматических ежедневных бэкапов в резервный ЦОД"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Lagging */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        КПР итоговый (Lagging Indicator) *
                      </label>
                      <textarea
                        rows={2}
                        value={kpr.laggingKpr ?? ''}
                        onChange={(e) => handleUpdateKprItem(kpr.id, { laggingKpr: e.target.value })}
                        placeholder="Например: Время простоя сервисов и потери данных (RTO / RPO) при инцидентах"
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Management measure */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Мероприятие по управлению риском (для мониторинга КПР) *
                    </label>
                    <input
                      type="text"
                      value={kpr.managementMeasure ?? ''}
                      onChange={(e) => handleUpdateKprItem(kpr.id, { managementMeasure: e.target.value })}
                      placeholder="Например: Еженедельное тестовое восстановление баз данных из бэкапа на изолированном тестовом стенде"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    />
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
