/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskRegisterDocument } from '../../types/risk';
import { validateRegister } from '../../utils/validation';
import { downloadRiskRegisterExcel } from '../../utils/excelExport';
import { MEMO_CHECKLIST } from '../../utils/scales';
import { HeatMap } from '../HeatMap';
import { PrintReportModal } from '../PrintReportModal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Send,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  MessageSquare,
  Sparkles,
  Printer,
} from 'lucide-react';

interface Step6Props {
  document: RiskRegisterDocument;
  onSubmit: () => void;
  onNavigateStep: (stepIndex: number) => void;
  isRiskManagerRole: boolean;
}

export const Step6ReviewSubmit: React.FC<Step6Props> = ({
  document: doc,
  onSubmit,
  onNavigateStep,
  isRiskManagerRole,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const validation = validateRegister(doc);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadRiskRegisterExcel(doc);
    } catch (e: any) {
      alert(`Ошибка при формировании Excel: ${e?.message || e}`);
    } finally {
      setIsExporting(false);
    }
  };

  const isSubmittedOrAccepted = doc.status === 'submitted' || doc.status === 'accepted';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Шаг 6 • Проверка, валидация и отправка менеджеру по рискам
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            Итоговая верификация и формирование регистра
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Проверьте автоматический чек-лист раздела 9 Памятки, карту рисков и отправьте согласованную версию.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPrintOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Печать / HTML-отчет</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{isExporting ? 'Формирование Excel...' : 'Скачать Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Return comments notice if returned */}
      {doc.status === 'returned' && doc.returnComment && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-amber-950 space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
            <MessageSquare className="w-5 h-5 text-amber-700" />
            <span>Замечания риск-менеджера по предыдущей версии Регистра:</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs font-medium text-slate-800 leading-relaxed">
            {doc.returnComment}
          </div>
          <p className="text-[11px] text-amber-800">
            Пожалуйста, устраните указанные замечания перед повторной отправкой на согласование.
          </p>
        </div>
      )}

      {/* Validation Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blocking errors card */}
        <div
          className={`p-5 rounded-xl border ${
            validation.blockingErrors.length > 0
              ? 'bg-rose-50/70 border-rose-300 text-rose-950'
              : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/20">
            <div className="flex items-center space-x-2 font-bold text-sm">
              {validation.blockingErrors.length > 0 ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span>
                {validation.blockingErrors.length > 0
                  ? `Блокирующие ошибки (${validation.blockingErrors.length})`
                  : 'Блокирующие ошибки отсутствуют (0)'}
              </span>
            </div>
            {validation.blockingErrors.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold">
                Отправка заблокирована
              </span>
            )}
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {validation.blockingErrors.length === 0 ? (
              <p className="text-emerald-800 leading-relaxed">
                Все обязательные поля заполнены корректно. Ограничения по классам, формулам и шкалам соблюдены. Регистр готов к отправке риск-менеджеру.
              </p>
            ) : (
              validation.blockingErrors.map((err) => (
                <div
                  key={err.id}
                  className="p-2.5 rounded-lg bg-white border border-rose-200 text-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                      [{err.section}] {err.riskNumber ? `Риск ${err.riskNumber}` : ''}
                    </span>
                    <p className="mt-0.5 font-medium">{err.message}</p>
                    {err.recommendation && (
                      <p className="mt-1 text-[11px] text-slate-500 italic">
                        Подсказка: {err.recommendation}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateStep(err.step)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                  >
                    Перейти →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warnings Card */}
        <div className="p-5 rounded-xl border bg-amber-50/60 border-amber-300 text-amber-950">
          <div className="flex items-center justify-between pb-3 border-b border-amber-300/40">
            <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {validation.warnings.length > 0
                  ? `Методические замечания (${validation.warnings.length})`
                  : 'Методические замечания отсутствуют (0)'}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">
              Рекомендации
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {validation.warnings.length === 0 ? (
              <p className="text-amber-900 leading-relaxed">
                Формулировки рисков и мероприятий соответствуют рекомендациям Памятки НАО «КИОР».
              </p>
            ) : (
              validation.warnings.map((warn) => (
                <div
                  key={warn.id}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 text-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      [{warn.section}] {warn.riskNumber ? `Риск ${warn.riskNumber}` : ''}
                    </span>
                    <p className="mt-0.5 font-medium">{warn.message}</p>
                    {warn.recommendation && (
                      <p className="mt-1 text-[11px] text-slate-500 italic">
                        {warn.recommendation}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateStep(warn.step)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                  >
                    Перейти →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Auto Checklist from Section 9 of the Memo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Чек-лист раздела 9 Памятки по заполнению Регистра рисков</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Автоматическая сверка 10 контрольных критериев перед передачей менеджеру по рискам:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {MEMO_CHECKLIST.map((item, idx) => {
            const isPassed = validation.checklistStatus[item.autoKey];
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border flex items-start space-x-2.5 transition-colors ${
                  isPassed
                    ? 'bg-slate-50/70 border-slate-200 text-slate-800'
                    : 'bg-rose-50/50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </span>
                <div>
                  <span className="font-bold mr-1">{idx + 1}.</span>
                  <span className={isPassed ? 'text-slate-700' : 'font-medium'}>{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Risk Heat Map */}
      <HeatMap risks={doc.risks} title="Тепловая карта рисков подразделения (Матрица 5×5)" />

      {/* Submission Card & Final Action */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-300">
            Статус версии: {doc.status.toUpperCase()} (версия v{doc.version})
          </span>
          <h3 className="text-xl font-bold">
            {isSubmittedOrAccepted
              ? 'Регистр отправлен на согласование'
              : 'Готовность к отправке менеджеру по рискам'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {isSubmittedOrAccepted
              ? `Отправлено: ${doc.submittedAt ? new Date(doc.submittedAt).toLocaleString('ru-RU') : 'недавно'}. Документ передан менеджеру по рискам.`
              : 'После нажатия кнопки «Отправить» проект регистра рисков фиксируется, генерируется официальный файл Excel и направляется менеджеру по рискам.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Скачать .xlsx</span>
          </button>

          {!isSubmittedOrAccepted ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!validation.isValid}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                validation.isValid
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:shadow-blue-500/25'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Отправить на согласование</span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Отправлено успешно</span>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        document={doc}
      />
    </div>
  );
};
