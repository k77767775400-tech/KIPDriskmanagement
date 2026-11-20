/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskRegisterDocument, AuditRecord } from '../types/risk';
import { History, Clock, User, ShieldCheck, CheckCircle2, RotateCcw, Send, FileSpreadsheet } from 'lucide-react';

interface AuditLogViewProps {
  document: RiskRegisterDocument;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ document: doc }) => {
  const history = doc.history || [];

  const getActionIcon = (action: string) => {
    if (action.includes('Создание') || action.includes('копированием')) {
      return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
    }
    if (action.includes('Отправка') || action.includes('рассмотрение')) {
      return <Send className="w-4 h-4 text-indigo-600" />;
    }
    if (action.includes('Согласование') || action.includes('Принят')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (action.includes('доработку') || action.includes('Возврат')) {
      return <RotateCcw className="w-4 h-4 text-amber-600" />;
    }
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Журнал аудита и версионности
          </span>
          <h2 className="text-lg font-bold mt-2 text-slate-900">
            История изменений Регистра рисков ({doc.header.department})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Фиксация всех действий: создание проекта, внесение правок, отправка на согласование, замечания риск-менеджера и утверждение.
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-700">
          Текущая версия: <strong>v{doc.version}</strong> • Статус: <strong>{doc.status}</strong>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center space-x-2">
          <History className="w-4 h-4 text-blue-600" />
          <span>Хронология событий документа</span>
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            События еще не зафиксированы.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.slice().reverse().map((record, idx) => (
              <div key={record.id || idx} className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-600 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-2 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{record.author}</span>
                      <span className="text-[11px] font-normal text-slate-400">({record.role})</span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(record.timestamp).toLocaleString('ru-RU')}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-start space-x-2 text-xs">
                    <span className="shrink-0 mt-0.5">{getActionIcon(record.action)}</span>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{record.action}</div>
                      {record.comment && (
                        <div className="mt-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs italic">
                          Замечания: «{record.comment}»
                        </div>
                      )}
                      {record.diffSummary && (
                        <div className="mt-1 text-[11px] text-slate-500 font-mono">
                          {record.diffSummary}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
