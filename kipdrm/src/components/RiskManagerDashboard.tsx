/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskRegisterDocument } from '../types/risk';
import { INITIAL_DEPARTMENTS } from '../utils/acceptanceData';
import { getQuarterSubmissionDeadline, calculateRiskScore } from '../utils/calculations';
import { downloadRiskRegisterExcel } from '../utils/excelExport';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Eye,
  Download,
  Building,
  Filter,
  Search,
  MessageSquare,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface RiskManagerDashboardProps {
  registers: RiskRegisterDocument[];
  onOpenRegister: (docId: string) => void;
  onAcceptRegister: (docId: string) => void;
  onReturnRegister: (docId: string, comment: string) => void;
  selectedQuarter: 'I' | 'II' | 'III' | 'IV';
  selectedYear: number;
}

export const RiskManagerDashboard: React.FC<RiskManagerDashboardProps> = ({
  registers,
  onOpenRegister,
  onAcceptRegister,
  onReturnRegister,
  selectedQuarter,
  selectedYear,
}) => {
  const [returnModalDocId, setReturnModalDocId] = useState<string | null>(null);
  const [returnCommentText, setReturnCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExportingId, setIsExportingId] = useState<string | null>(null);

  const quarters: Array<'I' | 'II' | 'III' | 'IV'> = ['I', 'II', 'III', 'IV'];
  const deadlineInfo = getQuarterSubmissionDeadline(selectedQuarter, selectedYear);
  const isPeriodOverdue = deadlineInfo.isOverdue();

  // Filter registers for current quarter & year
  const currentRegisters = registers.filter(
    (r) => r.header.quarter === selectedQuarter && r.header.year === selectedYear
  );

  // Status statistics
  const totalDepts = INITIAL_DEPARTMENTS.length;
  const submittedCount = currentRegisters.filter((r) => r.status === 'submitted' || r.status === 'resubmitted').length;
  const acceptedCount = currentRegisters.filter((r) => r.status === 'accepted').length;
  const returnedCount = currentRegisters.filter((r) => r.status === 'returned').length;
  const draftCount = currentRegisters.filter((r) => r.status === 'draft').length;
  const notStartedCount = Math.max(0, totalDepts - currentRegisters.length);

  // Find cross-departmental risks ("Сквозные риски")
  const crossRiskMap = new Map<string, { riskNumber: string; name: string; depts: string[] }>();
  currentRegisters.forEach((doc) => {
    doc.risks.forEach((r) => {
      const existing = crossRiskMap.get(r.riskNumber);
      if (existing) {
        if (!existing.depts.includes(doc.header.department)) {
          existing.depts.push(doc.header.department);
        }
      } else {
        crossRiskMap.set(r.riskNumber, {
          riskNumber: r.riskNumber,
          name: r.name,
          depts: [doc.header.department],
        });
      }
    });
  });

  const crossRisks = Array.from(crossRiskMap.values()).filter((cr) => cr.depts.length > 1);

  const handleDownloadExcel = async (doc: RiskRegisterDocument) => {
    try {
      setIsExportingId(doc.id);
      await downloadRiskRegisterExcel(doc);
    } catch (e: any) {
      alert(`Ошибка экспорта: ${e?.message || e}`);
    } finally {
      setIsExportingId(null);
    }
  };

  const handleConfirmReturn = () => {
    if (!returnModalDocId || !returnCommentText.trim()) {
      alert('Пожалуйста, введите текст замечаний для возврата на доработку.');
      return;
    }
    onReturnRegister(returnModalDocId, returnCommentText.trim());
    setReturnModalDocId(null);
    setReturnCommentText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
        <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-md border border-indigo-700/50">
          Служба управления рисками НАО «КИОР»
        </span>
        <h2 className="text-xl font-bold mt-2">
          Панель мониторинга и согласования Регистров рисков
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Ежеквартальный мониторинг предоставления регистров структурными подразделениями института, контроль сроков (дедлайн: 5-е число), согласование и выгрузка официальных файлов Excel.
        </p>

        {/* Top metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">Всего подразделений:</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{totalDepts}</span>
          </div>

          <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-700/50">
            <span className="text-blue-300 block">На согласовании:</span>
            <span className="text-xl font-bold text-blue-200 mt-0.5 block">{submittedCount}</span>
          </div>

          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/50">
            <span className="text-emerald-300 block">Согласовано:</span>
            <span className="text-xl font-bold text-emerald-200 mt-0.5 block">{acceptedCount}</span>
          </div>

          <div className="bg-amber-900/40 p-3 rounded-xl border border-amber-700/50">
            <span className="text-amber-300 block">На доработке:</span>
            <span className="text-xl font-bold text-amber-200 mt-0.5 block">{returnedCount}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">В работе / черновики:</span>
            <span className="text-xl font-bold text-slate-300 mt-0.5 block">{draftCount + notStartedCount}</span>
          </div>
        </div>
      </div>

      {/* Deadline tracker notification */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
          isPeriodOverdue
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Clock className={`w-5 h-5 shrink-0 ${isPeriodOverdue ? 'text-rose-600' : 'text-indigo-600'}`} />
          <div>
            <strong>Срок сдачи за {selectedQuarter} квартал {selectedYear} года: </strong>
            <span>
              не позднее <strong>{deadlineInfo.deadlineString} (до 23:59)</strong>.
            </span>
            {isPeriodOverdue && (
              <span className="ml-2 font-bold text-rose-700">
                [Регламентный дедлайн 30 ноября просрочен!]
              </span>
            )}
          </div>
        </div>
        <div className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white border border-current/20">
          Период: {selectedQuarter} кв. {selectedYear}
        </div>
      </div>

      {/* Cross-Departmental Risks Alert ("Сквозные риски") */}
      {crossRisks.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 space-y-2 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-sm text-purple-900">
            <Layers className="w-4 h-4 text-purple-700" />
            <span>Идентифицированы сквозные риски института (п. 5.3 Памятки):</span>
          </div>
          <p className="text-slate-600">
            Один и тот же риск заявлен несколькими подразделениями одновременно. Это требует консолидации и сквозного мониторинга:
          </p>
          <div className="space-y-1.5 pt-1">
            {crossRisks.map((cr) => (
              <div
                key={cr.riskNumber}
                className="bg-white p-2.5 rounded-lg border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs bg-purple-900 text-white px-2 py-0.5 rounded">
                    {cr.riskNumber}
                  </span>
                  <span className="font-medium text-slate-800">{cr.name}</span>
                </div>
                <div className="text-[11px] text-purple-800 font-semibold shrink-0">
                  Владельцы ({cr.depts.length}): {cr.depts.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table: Matrix of Departments for Current Quarter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Матрица сдачи Регистров рисков подразделений ({selectedQuarter} кв. {selectedYear})
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Поиск по названию отдела..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Все статусы</option>
              <option value="submitted">На согласовании</option>
              <option value="accepted">Согласованы</option>
              <option value="returned">На доработке</option>
              <option value="draft">Черновики</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Подразделение</th>
                <th className="px-3 py-3">Координатор</th>
                <th className="px-3 py-3 text-center">Рисков всего</th>
                <th className="px-3 py-3 text-center">Высоких (КПР)</th>
                <th className="px-3 py-3 text-center">Статус сдачи</th>
                <th className="px-3 py-3 text-center">Время подачи</th>
                <th className="px-4 py-3 text-right">Действия риск-менеджера</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_DEPARTMENTS.filter((d) =>
                d.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((dept) => {
                const doc = currentRegisters.find((r) => r.header.department === dept);

                // Filter check
                if (statusFilter !== 'all') {
                  if (statusFilter === 'draft' && doc?.status !== 'draft') return null;
                  if (statusFilter === 'submitted' && doc?.status !== 'submitted' && doc?.status !== 'resubmitted')
                    return null;
                  if (statusFilter === 'accepted' && doc?.status !== 'accepted') return null;
                  if (statusFilter === 'returned' && doc?.status !== 'returned') return null;
                }

                const totalRisks = doc?.risks?.length || 0;
                const highRisksCount =
                  doc?.risks?.filter((r) => {
                    const s = calculateRiskScore(r.probability, r.timeImpact, r.impact);
                    return s >= 15;
                  }).length || 0;

                const status = doc?.status || 'not_created';

                // Check if submitted after the 5th
                let isLate = false;
                if (doc?.submittedAt) {
                  const subDate = new Date(doc.submittedAt);
                  isLate = subDate > deadlineInfo.deadlineDate;
                }

                return (
                  <tr key={dept} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {dept}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">
                      {doc?.header.coordinatorName ? (
                        <div>
                          <div className="font-medium text-slate-800">{doc.header.coordinatorName}</div>
                          <div className="text-[10px] text-slate-400">{doc.header.coordinatorPosition}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Не назначен</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-800">
                      {totalRisks}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {highRisksCount > 0 ? (
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          {highRisksCount}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {status === 'accepted' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Согласован</span>
                        </span>
                      )}
                      {(status === 'submitted' || status === 'resubmitted') && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{status === 'resubmitted' ? 'Повторно сдан' : 'На рассмотрении'}</span>
                        </span>
                      )}
                      {status === 'returned' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>На доработке</span>
                        </span>
                      )}
                      {status === 'draft' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Черновик</span>
                        </span>
                      )}
                      {status === 'not_created' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-400">
                          <span>Не начат</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-500">
                      {doc?.submittedAt ? (
                        <div>
                          <div>{new Date(doc.submittedAt).toLocaleDateString('ru-RU')}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(doc.submittedAt).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {isLate && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                              Просрочено
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {doc ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenRegister(doc.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                            title="Открыть регистр для детального просмотра"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Просмотр</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadExcel(doc)}
                            disabled={isExportingId === doc.id}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                            title="Скачать официальный файл Excel (.xlsx)"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Excel</span>
                          </button>

                          {(doc.status === 'submitted' || doc.status === 'resubmitted') && (
                            <>
                              <button
                                type="button"
                                onClick={() => onAcceptRegister(doc.id)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                title="Согласовать проект регистра"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Принять</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReturnModalDocId(doc.id);
                                  setReturnCommentText('');
                                }}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                                title="Вернуть на доработку с замечаниями"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Вернуть</span>
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Ожидается создание</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return for Revision Modal */}
      {returnModalDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-base">Возврат Регистра рисков на доработку</h3>
              </div>
              <button
                onClick={() => setReturnModalDocId(null)}
                className="text-amber-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Укажите конкретные замечания и требования по корректировке регистра. Координатор подразделения увидит их на странице проверки и сможет внести исправления.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Текст замечаний риск-менеджера *
                </label>
                <textarea
                  rows={4}
                  value={returnCommentText}
                  onChange={(e) => setReturnCommentText(e.target.value)}
                  placeholder="Например: По риску 5-О-01 не указано пороговое значение в Панели КПР. По риску 1-С-01 наименование сформулировано как причина, просьба переформулировать."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-slate-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setReturnModalDocId(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Отправить на доработку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
