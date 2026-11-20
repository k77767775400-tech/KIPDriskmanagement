/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RiskRegisterDocument,
  UserProfile,
  HeaderData,
  RiskItem,
  KprItem,
  RealizedClassSection,
  RiskClassId,
} from './types/risk';
import {
  getStoredRegisters,
  saveRegister,
  saveRegisters,
  getStoredUser,
  setStoredUser,
  getAuthSession,
  setAuthSession,
  createNewRegisterForDepartment,
  copyFromPreviousQuarter,
  getNextFreeRiskNumber,
  acquireDocumentLock,
  releaseDocumentLock,
  LockStatus,
} from './utils/storage';
import { downloadRiskRegisterExcel } from './utils/excelExport';
import { validateRegister } from './utils/validation';

// Components
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';
import { Step0Header } from './components/RiskWizard/Step0Header';
import { Step1RegisterPart1 } from './components/RiskWizard/Step1RegisterPart1';
import { Step2RegisterPart2 } from './components/RiskWizard/Step2RegisterPart2';
import { Step3RegisterPart3 } from './components/RiskWizard/Step3RegisterPart3';
import { Step4KprPanel } from './components/RiskWizard/Step4KprPanel';
import { Step5RealizedRisks } from './components/RiskWizard/Step5RealizedRisks';
import { Step6ReviewSubmit } from './components/RiskWizard/Step6ReviewSubmit';
import { RiskManagerDashboard } from './components/RiskManagerDashboard';
import { NomenclatureCatalogView } from './components/NomenclatureCatalogView';
import { CompanyHeatMap } from './components/CompanyHeatMap';
import { UnitTestsRunner } from './components/UnitTestsRunner';
import { AuditLogView } from './components/AuditLogView';
import { ScaleModal } from './components/ScaleModal';
import { QuickAccessNav } from './components/QuickAccessNav';
import { EmployeeGuideModal } from './components/EmployeeGuideModal';

// Icons
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Clock,
  Layers,
  BookOpen,
  FlaskConical,
  Building,
  RotateCcw,
  Lock,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAuthSession());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getAuthSession() || getStoredUser());
  const [registers, setRegisters] = useState<RiskRegisterDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeView, setActiveView] = useState<'wizard' | 'dashboard' | 'heatmap' | 'nomenclature' | 'tests' | 'audit' | 'admin'>('wizard');
  const [isSavedIndicator, setIsSavedIndicator] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [scaleModalTab, setScaleModalTab] = useState<'prob' | 'time' | 'fin' | 'nonfin' | 'goals' | 'wording'>('prob');
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedRiskNumber, setSelectedRiskNumber] = useState<string | undefined>();
  const [selectedClassId, setSelectedClassId] = useState<RiskClassId | undefined>();

  // Concurrency document lock state
  const [docLockStatus, setDocLockStatus] = useState<LockStatus>({ locked: false, canEdit: true });

  // Load registers from storage on mount
  useEffect(() => {
    const list = getStoredRegisters();
    setRegisters(list);

    const session = getAuthSession();
    if (session) {
      setIsAuthenticated(true);
      setCurrentUser(session);
      if (session.role === 'risk_manager') {
        setActiveView('dashboard');
      } else if (session.role === 'admin') {
        setActiveView('admin');
      } else {
        setActiveView('wizard');
      }
    }

    // Find document matching current user's department, or first document
    let targetDoc = list.find((d) => d.header.department === currentUser.department);
    if (!targetDoc && list.length > 0) {
      targetDoc = list[0];
    }
    if (targetDoc) {
      setActiveDocId(targetDoc.id);
    }
  }, []);

  // Heartbeat & lock management when activeDocId or currentUser changes
  useEffect(() => {
    if (!isAuthenticated || !activeDocId || activeView !== 'wizard') return;

    let isSubscribed = true;

    const requestLock = async () => {
      const status = await acquireDocumentLock(activeDocId, currentUser);
      if (isSubscribed) {
        setDocLockStatus(status);
      }
    };

    requestLock();

    // Heartbeat every 25 seconds to retain lock
    const interval = setInterval(requestLock, 25000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      releaseDocumentLock(activeDocId, currentUser.id);
    };
  }, [isAuthenticated, activeDocId, activeView, currentUser]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAuthSession(user);
    setIsAuthenticated(true);

    const list = getStoredRegisters();
    setRegisters(list);

    if (user.role === 'risk_manager') {
      setActiveView('dashboard');
    } else if (user.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('wizard');
      const deptDoc = list.find((d) => d.header.department === user.department);
      if (deptDoc) {
        setActiveDocId(deptDoc.id);
      }
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    setIsAuthenticated(false);
  };

  // When currentUser changes
  const handleUserChange = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    setStoredUser(newUser);

    if (newUser.role === 'department') {
      const list = getStoredRegisters();
      let deptDoc = list.find((d) => d.header.department === newUser.department);
      if (!deptDoc) {
        // Create new draft for department
        deptDoc = createNewRegisterForDepartment(
          newUser.department,
          'IV',
          2026,
          newUser.name,
          newUser.position
        );
        setRegisters(getStoredRegisters());
      }
      setActiveDocId(deptDoc.id);
      setActiveView('wizard');
    } else if (newUser.role === 'risk_manager') {
      setActiveView('dashboard');
    } else if (newUser.role === 'admin') {
      setActiveView('admin');
    }
  };

  const activeDoc = registers.find((r) => r.id === activeDocId) || registers[0];

  // Auto-save handler
  const updateActiveDocument = (updatedDoc: RiskRegisterDocument, actionDescription?: string) => {
    const docToSave: RiskRegisterDocument = {
      ...updatedDoc,
      updatedAt: new Date().toISOString(),
      history: actionDescription
        ? [
            ...(updatedDoc.history || []),
            {
              id: `aud_${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: currentUser.name,
              role: currentUser.position,
              action: actionDescription,
            },
          ]
        : updatedDoc.history,
    };

    setRegisters((prevList) => {
      const idx = prevList.findIndex((r) => r.id === docToSave.id);
      const nextList = idx >= 0
        ? [...prevList.slice(0, idx), docToSave, ...prevList.slice(idx + 1)]
        : [...prevList, docToSave];
      saveRegisters(nextList);
      return nextList;
    });

    setIsSavedIndicator(true);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleManualSave = () => {
    if (!activeDoc) return;
    updateActiveDocument(activeDoc, 'Ручное сохранение черновика пользователем');
  };

  const handleSelectRiskFromNav = (riskNumber: string, classId: RiskClassId) => {
    setSelectedRiskNumber(riskNumber);
    setSelectedClassId(classId);
    if (activeStep !== 1 && activeStep !== 2 && activeStep !== 3) {
      setActiveStep(1);
    }
  };

  const handleAddNewRiskFromNav = () => {
    if (!activeDoc) return;
    const currentNumbers = (activeDoc.risks || []).map((r) => r.riskNumber);
    const targetClass: RiskClassId = selectedClassId || '5-О';
    const nextNum = getNextFreeRiskNumber(targetClass, currentNumbers);

    const newRisk: RiskItem = {
      id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      riskNumber: nextNum,
      classId: targetClass,
      name: '',
      factors: [''],
      consequences: [''],
      ownerUnit: activeDoc.header.department,
      probability: 2,
      timeImpact: 2,
      impact: 2,
      impactType: 'non_financial',
      damageThousandKzt: 0,
      measures: [],
      residualProbability: 2,
      residualTimeImpact: 2,
      residualImpact: 2,
    };

    updateActiveDocument(
      {
        ...activeDoc,
        risks: [...(activeDoc.risks || []), newRisk],
      },
      `Добавлен новый риск ${nextNum}`
    );
    setSelectedRiskNumber(nextNum);
    setSelectedClassId(targetClass);
    setActiveStep(1);
  };

  // Step changes handlers
  const handleHeaderChange = (header: HeaderData) => {
    if (!activeDoc) return;
    updateActiveDocument({ ...activeDoc, header });
  };

  const handleRisksChange = (risks: RiskItem[]) => {
    if (!activeDoc) return;
    updateActiveDocument({ ...activeDoc, risks });
  };

  const handleKprChange = (kprList: KprItem[]) => {
    if (!activeDoc) return;
    updateActiveDocument({ ...activeDoc, kprList });
  };

  const handleRealizedChange = (realizedReport: Record<RiskClassId, RealizedClassSection>) => {
    if (!activeDoc) return;
    updateActiveDocument({ ...activeDoc, realizedReport });
  };

  // Copy from previous quarter
  const handleCopyFromPrevious = () => {
    if (!activeDoc) return;
    const targetQuarter: 'I' | 'II' | 'III' | 'IV' = activeDoc.header.quarter === 'III' ? 'IV' : 'III';
    const targetYear = activeDoc.header.year;

    const copied = copyFromPreviousQuarter(activeDoc, targetQuarter, targetYear, currentUser.name);
    setRegisters(getStoredRegisters());
    setActiveDocId(copied.id);
    alert(`Регистр скопирован на ${targetQuarter} квартал ${targetYear} года. Риски и мероприятия перенесены.`);
  };

  // Submission handler
  const handleSubmitRegister = () => {
    if (!activeDoc) return;
    const val = validateRegister(activeDoc);
    if (!val.isValid) {
      alert(`Невозможно отправить регистр: обнаружено ${val.blockingErrors.length} блокирующих ошибок.`);
      return;
    }

    const newStatus = activeDoc.status === 'returned' ? 'resubmitted' : 'submitted';
    const newVersion = (activeDoc.version || 1) + 1;
    const actionText =
      newStatus === 'resubmitted'
        ? `Повторная отправка после доработки (версия v${newVersion})`
        : `Отправка проекта Регистра менеджеру по рискам (версия v${newVersion})`;

    const submittedDoc: RiskRegisterDocument = {
      ...activeDoc,
      status: newStatus,
      version: newVersion,
      submittedAt: new Date().toISOString(),
      history: [
        ...(activeDoc.history || []),
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: currentUser.name,
          role: currentUser.position,
          action: actionText,
        },
      ],
    };

    saveRegister(submittedDoc, currentUser.name);
    setRegisters(getStoredRegisters());
    alert('Регистр рисков успешно отправлен менеджеру по рискам на согласование!');
  };

  // Risk Manager actions
  const handleAcceptRegister = (docId: string) => {
    const doc = registers.find((r) => r.id === docId);
    if (!doc) return;

    const acceptedDoc: RiskRegisterDocument = {
      ...doc,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      history: [
        ...(doc.history || []),
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: currentUser.name,
          role: 'Главный менеджер по рискам',
          action: 'Согласование Регистра рисков подразделения',
        },
      ],
    };

    saveRegister(acceptedDoc, currentUser.name);
    setRegisters(getStoredRegisters());
    alert(`Регистр подразделения «${doc.header.department}» успешно согласован!`);
  };

  const handleReturnRegister = (docId: string, comment: string) => {
    const doc = registers.find((r) => r.id === docId);
    if (!doc) return;

    const returnedDoc: RiskRegisterDocument = {
      ...doc,
      status: 'returned',
      returnComment: comment,
      history: [
        ...(doc.history || []),
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: currentUser.name,
          role: 'Главный менеджер по рискам',
          action: 'Возврат Регистра на доработку с замечаниями',
          comment,
        },
      ],
    };

    saveRegister(returnedDoc, currentUser.name);
    setRegisters(getStoredRegisters());
    alert(`Регистр возвращен подразделению на доработку с указанием замечаний.`);
  };

  // Quick download of current document
  const handleDownloadActiveDocExcel = async () => {
    if (!activeDoc) return;
    try {
      await downloadRiskRegisterExcel(activeDoc);
    } catch (e: any) {
      alert(`Ошибка экспорта: ${e?.message || e}`);
    }
  };

  const validation = activeDoc ? validateRegister(activeDoc) : { isValid: true, blockingErrors: [], warnings: [] };

  const steps = [
    { num: 0, title: 'Реквизиты', subtitle: 'Инструкция' },
    { num: 1, title: 'Присущий риск', subtitle: 'Регистр Ч.1' },
    { num: 2, title: 'Мероприятия', subtitle: 'Регистр Ч.2' },
    { num: 3, title: 'Остаточный риск', subtitle: 'Регистр Ч.3' },
    { num: 4, title: 'Панель КПР', subtitle: 'Показатели' },
    { num: 5, title: 'Реализованные', subtitle: 'Приложение 3' },
    { num: 6, title: 'Проверка и сдача', subtitle: 'Чек-лист и карта' },
  ];

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Institute Header */}
      <Header
        currentUser={currentUser}
        onChangeUser={handleUserChange}
        onLogout={handleLogout}
        activeView={activeView}
        onSelectView={setActiveView}
        activeDocument={activeDoc}
        onDownloadExcel={handleDownloadActiveDocExcel}
        onOpenGuideModal={() => setGuideModalOpen(true)}
        onOpenScaleModal={() => setScaleModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: Form Wizard */}
        {activeView === 'wizard' && activeDoc && (
          <div className="space-y-6">
            {/* Concurrency Lock Banner */}
            {!docLockStatus.canEdit && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-950 text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-rose-900 block">
                      Регистр заблокирован для одновременного редактирования!
                    </span>
                    <p className="mt-0.5 text-rose-800">
                      Пользователь <strong>{docLockStatus.lockedByUserName}</strong> ({docLockStatus.lockedByUserDepartment}) в данный момент вносит изменения в этот документ. Чтобы избежать потери данных и перезаписи, форма переведена в режим просмотра.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const status = await acquireDocumentLock(activeDocId, currentUser);
                    setDocLockStatus(status);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Проверить снова</span>
                </button>
              </div>
            )}

            {/* Role indicator banner */}
            {currentUser.role === 'risk_manager' && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 text-xs flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>
                    <strong>Режим просмотра риск-менеджера:</strong> Вы просматриваете регистр подразделения «<strong>{activeDoc.header.department}</strong>». Вы можете выгрузить его в Excel (.xlsx) на шаге 6 или согласовать в Дашборде.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                >
                  Вернуться в Дашборд
                </button>
              </div>
            )}

            {currentUser.role === 'admin' && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  <span>
                    <strong>Режим Администратора:</strong> У вас активировано право прямого редактирования полей регистра «<strong>{activeDoc.header.department}</strong>».
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('admin')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                >
                  Управление системой
                </button>
              </div>
            )}

            {/* Quick Access Navigation Panel */}
            <QuickAccessNav
              activeStep={activeStep}
              onSelectStep={(step) => setActiveStep(step)}
              activeDoc={activeDoc}
              validation={validation}
              onOpenScaleModal={(tab) => {
                if (tab) setScaleModalTab(tab);
                setScaleModalOpen(true);
              }}
              onOpenGuideModal={() => setGuideModalOpen(true)}
              onDownloadExcel={handleDownloadActiveDocExcel}
              onSaveNow={handleManualSave}
              isSaved={isSavedIndicator}
              lastSavedTime={lastSavedTime}
              onSelectRisk={handleSelectRiskFromNav}
              onAddNewRisk={handleAddNewRiskFromNav}
            />

            {/* Wizard Step Render */}
            {activeStep === 0 && (
              <Step0Header
                header={activeDoc.header}
                onChange={handleHeaderChange}
                onCopyFromPrevious={handleCopyFromPrevious}
                hasPreviousQuarterAvailable={registers.length > 1}
                status={activeDoc.status}
              />
            )}

            {activeStep === 1 && (
              <Step1RegisterPart1
                risks={activeDoc.risks}
                department={activeDoc.header.department}
                onUpdateRisks={handleRisksChange}
                onOpenScaleModal={(tab) => {
                  if (tab) setScaleModalTab(tab);
                  setScaleModalOpen(true);
                }}
                selectedRiskNumber={selectedRiskNumber}
                selectedClassId={selectedClassId}
              />
            )}

            {activeStep === 2 && (
              <Step2RegisterPart2
                risks={activeDoc.risks}
                department={activeDoc.header.department}
                onUpdateRisks={handleRisksChange}
                onOpenScaleModal={(tab) => {
                  if (tab) setScaleModalTab(tab);
                  setScaleModalOpen(true);
                }}
                selectedRiskNumber={selectedRiskNumber}
              />
            )}

            {activeStep === 3 && (
              <Step3RegisterPart3
                risks={activeDoc.risks}
                onUpdateRisks={handleRisksChange}
                onOpenScaleModal={(tab) => {
                  if (tab) setScaleModalTab(tab);
                  setScaleModalOpen(true);
                }}
                selectedRiskNumber={selectedRiskNumber}
              />
            )}

            {activeStep === 4 && (
              <Step4KprPanel
                risks={activeDoc.risks}
                kprList={activeDoc.kprList}
                onUpdateKpr={handleKprChange}
              />
            )}

            {activeStep === 5 && (
              <Step5RealizedRisks
                realizedReport={activeDoc.realizedReport}
                risks={activeDoc.risks}
                department={activeDoc.header.department}
                onUpdateRealized={handleRealizedChange}
              />
            )}

            {activeStep === 6 && (
              <Step6ReviewSubmit
                document={activeDoc}
                onSubmit={handleSubmitRegister}
                onNavigateStep={(stepIdx) => setActiveStep(stepIdx)}
                isRiskManagerRole={currentUser.role === 'risk_manager'}
              />
            )}

            {/* Stepper Footer Navigation */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold border ${
                  activeStep === 0
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Шаг {activeStep + 1} из {steps.length} • {steps[activeStep].title}
              </div>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Далее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRegister}
                  disabled={!validation.isValid}
                  className={`inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors ${
                    validation.isValid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Отправить менеджеру</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Risk Manager Dashboard */}
        {activeView === 'dashboard' && (
          <RiskManagerDashboard
            registers={registers}
            onOpenRegister={(docId) => {
              setActiveDocId(docId);
              setActiveView('wizard');
            }}
            onAcceptRegister={handleAcceptRegister}
            onReturnRegister={handleReturnRegister}
            selectedQuarter={activeDoc?.header.quarter || 'IV'}
            selectedYear={activeDoc?.header.year || 2026}
          />
        )}

        {/* VIEW 3: Company Heat Map */}
        {activeView === 'heatmap' && (
          <CompanyHeatMap
            registers={registers}
            selectedQuarter={activeDoc?.header.quarter || 'IV'}
            selectedYear={activeDoc?.header.year || 2026}
          />
        )}

        {/* VIEW 4: Nomenclature Catalog */}
        {activeView === 'nomenclature' && <NomenclatureCatalogView />}

        {/* VIEW 5: Acceptance Tests Runner */}
        {activeView === 'tests' && <UnitTestsRunner />}

        {/* VIEW 6: Audit Log */}
        {activeView === 'audit' && activeDoc && <AuditLogView document={activeDoc} />}

        {/* VIEW 7: Admin Panel (Edit everything, passwords, users) */}
        {activeView === 'admin' && (
          <AdminPanel
            registers={registers}
            onSelectRegisterForEdit={(docId) => {
              setActiveDocId(docId);
              setActiveView('wizard');
            }}
            onRefreshRegisters={() => setRegisters(getStoredRegisters())}
          />
        )}
      </main>

      {/* Evaluation Scales & Guidelines Modal */}
      <ScaleModal
        isOpen={scaleModalOpen}
        onClose={() => setScaleModalOpen(false)}
        initialTab={scaleModalTab}
      />

      {/* Employee Interactive Guidance Modal */}
      <EmployeeGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onOpenScales={(tab) => {
          setScaleModalTab(tab);
          setScaleModalOpen(true);
        }}
      />
    </div>
  );
}
