/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/risk';
import { authenticateUser, authenticateUserAsync, getStoredUsers } from '../utils/storage';
import {
  Shield,
  KeyRound,
  User,
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('department');
  const [loginInput, setLoginInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const users = getStoredUsers();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'department') {
      setLoginInput('user');
    } else if (role === 'risk_manager') {
      setLoginInput('risk');
    } else if (role === 'admin') {
      setLoginInput('admin');
    }
    setPasswordInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await authenticateUserAsync(loginInput, passwordInput);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage(
          'Неверный логин или пароль. Пожалуйста, проверьте введённые данные.'
        );
      }
    } catch (err) {
      setErrorMessage('Ошибка проверки учетных данных.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole, login: string, pass: string) => {
    setSelectedRole(role);
    setLoginInput(login);
    setPasswordInput(pass);
    const user = authenticateUser(login, pass);
    if (user) {
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-200">
        {/* Emblem & Portal Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-900/40 font-bold text-2xl ring-4 ring-blue-500/20">
            Қ
          </div>
          <div className="text-xs uppercase tracking-widest font-semibold text-blue-300">
            НАО «Казахстанский институт общественного развития»
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Портал Регистра рисков
          </h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Автоматизированная система сбора, согласования и формирования Регистров рисков института
          </p>
        </div>

        {/* Access Role Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Заполнитель */}
          <button
            type="button"
            onClick={() => handleRoleSelect('department')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'department'
                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-400 text-white shadow-md'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </span>
              {selectedRole === 'department' && (
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div className="mt-2.5 font-bold text-xs">Заполнитель</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Ввод рисков и мероприятий отдела
            </div>
          </button>

          {/* Card 2: Риск-менеджер */}
          <button
            type="button"
            onClick={() => handleRoleSelect('risk_manager')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'risk_manager'
                ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-400 text-white shadow-md'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              {selectedRole === 'risk_manager' && (
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <div className="mt-2.5 font-bold text-xs">Риск-менеджер</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Просмотр и выгрузка в Excel
            </div>
          </button>

          {/* Card 3: Администратор */}
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedRole === 'admin'
                ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-400 text-white shadow-md'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </span>
              {selectedRole === 'admin' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="mt-2.5 font-bold text-xs">Администратор</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Полное редактирование и настройки
            </div>
          </button>
        </div>

        {/* Main Login Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 border border-slate-200 text-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>
                  Авторизация:{' '}
                  {selectedRole === 'department'
                    ? 'Заполнитель (Отдел)'
                    : selectedRole === 'risk_manager'
                    ? 'Риск-менеджер'
                    : 'Администратор'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedRole === 'department' &&
                  'Доступ к заполнению и редактированию ежеквартального регистра своего подразделения.'}
                {selectedRole === 'risk_manager' &&
                  'Доступ ко всем подразделениям: просмотр, согласование, замечания и выгрузка в Excel.'}
                {selectedRole === 'admin' &&
                  'Полный доступ с возможностью редактирования всех регистров, структуры и паролей.'}
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Логин учетной записи
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Введите логин..."
                  className="w-full text-xs font-medium rounded-lg border border-slate-300 pl-9 pr-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Пароль
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль..."
                  className="w-full text-xs font-medium rounded-lg border border-slate-300 pl-9 pr-10 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isLoading ? 'Проверка пароля...' : 'Войти в систему'}</span>
            </button>
          </form>

          {/* Quick Demo Login Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Быстрый вход для проверки ролей (1 клик):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('department', 'user', 'user2026')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-800 rounded-lg text-[11px] font-semibold text-center transition-colors"
              >
                1. Заполнитель
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('risk_manager', 'risk', 'risk2026')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-800 rounded-lg text-[11px] font-semibold text-center transition-colors"
              >
                2. Риск-менеджер
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin', 'admin2026')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 text-slate-700 hover:text-amber-800 rounded-lg text-[11px] font-semibold text-center transition-colors"
              >
                3. Администратор
              </button>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality footer note */}
        <div className="text-center text-xs text-slate-400">
          Данные защищены в соответствии с политикой информационной безопасности НАО «КИОР».
        </div>
      </div>
    </div>
  );
};
