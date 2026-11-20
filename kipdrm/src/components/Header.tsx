/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, RiskRegisterDocument } from '../types/risk';
import { INITIAL_USERS } from '../utils/acceptanceData';
import {
  FileSpreadsheet,
  Shield,
  Layers,
  BookOpen,
  FlaskConical,
  UserCheck,
  Building2,
  Calendar,
  History,
  Download,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onChangeUser: (user: UserProfile) => void;
  onLogout: () => void;
  activeView: 'wizard' | 'dashboard' | 'heatmap' | 'nomenclature' | 'tests' | 'audit' | 'admin';
  onSelectView: (view: 'wizard' | 'dashboard' | 'heatmap' | 'nomenclature' | 'tests' | 'audit' | 'admin') => void;
  activeDocument?: RiskRegisterDocument;
  onDownloadExcel?: () => void;
  onOpenGuideModal?: () => void;
  onOpenScaleModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onChangeUser,
  onLogout,
  activeView,
  onSelectView,
  activeDocument,
  onDownloadExcel,
  onOpenGuideModal,
  onOpenScaleModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Согласован</span>
          </span>
        );
      case 'submitted':
      case 'resubmitted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>На согласовании</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>На доработке</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Черновик</span>
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-md">
      {/* Top organization bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            Қ
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="font-semibold text-slate-200">
              НАО «Казахстанский институт общественного развития»
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-slate-400 text-[11px]">«КИОР» ҚҚДИ КеАҚ</span>
          </div>
        </div>

        {/* User Role & Logout Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                currentUser.role === 'admin'
                  ? 'bg-amber-900/60 text-amber-300 border-amber-600/50'
                  : currentUser.role === 'risk_manager'
                  ? 'bg-indigo-900/60 text-indigo-300 border-indigo-600/50'
                  : 'bg-blue-900/60 text-blue-300 border-blue-600/50'
              }`}
            >
              {currentUser.role === 'admin'
                ? 'Администратор (редактирование)'
                : currentUser.role === 'risk_manager'
                ? 'Риск-менеджер (выгрузка Excel)'
                : 'Заполнитель (Отдел)'}
            </span>
            <span className="font-semibold text-slate-200 hidden sm:inline">
              {currentUser.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-rose-900/50 hover:text-rose-200 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            title="Выйти из системы (сменить роль/пароль)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h1 className="font-bold text-sm tracking-wide text-white">
                Портал Регистра рисков
              </h1>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex space-x-1">
              <button
                type="button"
                onClick={() => onSelectView('wizard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'wizard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Форма Регистра</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Дашборд риск-менеджера</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('heatmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'heatmap'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Карта рисков</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('nomenclature')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'nomenclature'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Номенклатура</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('tests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'tests'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>Приемочные тесты</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  activeView === 'audit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Аудит</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onSelectView('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    activeView === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Администрирование</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action & Status */}
          <div className="flex items-center space-x-3">
            {activeDocument && (
              <div className="hidden lg:flex items-center space-x-3 text-xs">
                <span className="text-slate-400 font-mono">
                  {activeDocument.header.quarter} кв. {activeDocument.header.year}
                </span>
                {getStatusBadge(activeDocument.status)}
              </div>
            )}

            {/* Quick Guide and Scales buttons */}
            {onOpenGuideModal && (
              <button
                type="button"
                onClick={onOpenGuideModal}
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                title="Памятка сотрудника по заполнению регистра"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Памятка</span>
              </button>
            )}

            {onOpenScaleModal && (
              <button
                type="button"
                onClick={onOpenScaleModal}
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors"
                title="Справочник шкал и критериев оценки"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Шкалы</span>
              </button>
            )}

            {/* Quick Excel download */}
            {onDownloadExcel && (
              <button
                type="button"
                onClick={onDownloadExcel}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                title="Скачать официальный Excel файл Регистра"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать Excel</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1 text-xs">
            <button
              onClick={() => {
                onSelectView('wizard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Форма Регистра</span>
            </button>
            <button
              onClick={() => {
                onSelectView('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Дашборд риск-менеджера</span>
            </button>
            <button
              onClick={() => {
                onSelectView('heatmap');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Карта рисков</span>
            </button>
            <button
              onClick={() => {
                onSelectView('nomenclature');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Номенклатура</span>
            </button>
            <button
              onClick={() => {
                onSelectView('tests');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Приемочные тесты</span>
            </button>
            <button
              onClick={() => {
                onSelectView('audit');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Журнал аудита</span>
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  onSelectView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 flex items-center space-x-2 text-amber-300"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Администрирование</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
