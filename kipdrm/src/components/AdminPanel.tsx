/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, UserRole, RiskRegisterDocument } from '../types/risk';
import {
  getStoredUsers,
  updateUserProfile,
  addUserProfile,
  deleteUserProfile,
  updateUserPassword,
  saveRegister,
} from '../utils/storage';
import { INITIAL_DEPARTMENTS } from '../utils/acceptanceData';
import {
  Settings,
  Users,
  KeyRound,
  ShieldAlert,
  Building,
  CheckCircle2,
  Edit,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  UserPlus,
  X,
  UserCheck,
  Search,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminPanelProps {
  registers: RiskRegisterDocument[];
  onSelectRegisterForEdit: (docId: string) => void;
  onRefreshRegisters: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  registers,
  onSelectRegisterForEdit,
  onRefreshRegisters,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Quick password editing state (inline in table)
  const [inlinePasswordUserId, setInlinePasswordUserId] = useState<string | null>(null);
  const [inlinePasswordValue, setInlinePasswordValue] = useState<string>('');
  const [visiblePasswordUserId, setVisiblePasswordUserId] = useState<string | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addLogin, setAddLogin] = useState('');
  const [addPassword, setAddPassword] = useState('kior2026');
  const [addRole, setAddRole] = useState<UserRole>('department');
  const [addDept, setAddDept] = useState(INITIAL_DEPARTMENTS[0]);
  const [addCustomDept, setAddCustomDept] = useState('');
  const [addPosition, setAddPosition] = useState('Сотрудник подразделения');
  const [addEmail, setAddEmail] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogin, setEditLogin] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('department');
  const [editDept, setEditDept] = useState('');
  const [editCustomDept, setEditCustomDept] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 4000);
  };

  // Open Edit User Modal
  const handleOpenEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditLogin(u.login);
    setEditPassword(u.password || '');
    setEditRole(u.role);
    setEditDept(INITIAL_DEPARTMENTS.includes(u.department) ? u.department : '__custom__');
    setEditCustomDept(INITIAL_DEPARTMENTS.includes(u.department) ? '' : u.department);
    setEditPosition(u.position);
    setEditEmail(u.email || '');
    setShowEditPassword(false);
  };

  // Save Edited User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedName = editName.trim();
    const trimmedLogin = editLogin.trim().toLowerCase();
    const trimmedPassword = editPassword.trim();
    const finalDept = editDept === '__custom__' ? editCustomDept.trim() : editDept.trim();

    if (!trimmedName) {
      showError('ФИО участника не может быть пустым.');
      return;
    }
    if (!trimmedLogin) {
      showError('Логин не может быть пустым.');
      return;
    }
    if (!trimmedPassword) {
      showError('Пароль не может быть пустым.');
      return;
    }

    // Check duplicate login with other users
    const duplicate = users.find((u) => u.id !== editingUser.id && u.login.toLowerCase() === trimmedLogin);
    if (duplicate) {
      showError(`Пользователь с логином «${trimmedLogin}» уже существует.`);
      return;
    }

    updateUserProfile(editingUser.id, {
      name: trimmedName,
      login: trimmedLogin,
      password: trimmedPassword,
      role: editRole,
      department: finalDept || 'НАО «КИОР»',
      position: editPosition.trim() || 'Сотрудник',
      email: editEmail.trim() || `${trimmedLogin}@kior.kz`,
    });

    setUsers(getStoredUsers());
    setEditingUser(null);
    showSuccess(`Данные участника «${trimmedName}» (логин: ${trimmedLogin}) успешно сохранены.`);
  };

  // Create New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = addName.trim();
    const trimmedLogin = addLogin.trim().toLowerCase();
    const trimmedPassword = addPassword.trim();
    const finalDept = addDept === '__custom__' ? addCustomDept.trim() : addDept.trim();

    if (!trimmedName) {
      showError('Укажите ФИО участника.');
      return;
    }
    if (!trimmedLogin) {
      showError('Укажите логин для входа.');
      return;
    }
    if (!trimmedPassword) {
      showError('Укажите пароль для входа.');
      return;
    }

    // Check duplicate login
    if (users.some((u) => u.login.toLowerCase() === trimmedLogin)) {
      showError(`Пользователь с логином «${trimmedLogin}» уже существует в системе.`);
      return;
    }

    addUserProfile({
      name: trimmedName,
      login: trimmedLogin,
      password: trimmedPassword,
      role: addRole,
      department: finalDept || 'НАО «КИОР»',
      position: addPosition.trim() || 'Сотрудник подразделения',
      email: addEmail.trim() || `${trimmedLogin}@kior.kz`,
    });

    setUsers(getStoredUsers());
    setIsAddModalOpen(false);

    // Reset form
    setAddName('');
    setAddLogin('');
    setAddPassword('kior2026');
    setAddRole('department');
    setAddDept(INITIAL_DEPARTMENTS[0]);
    setAddCustomDept('');
    setAddPosition('Сотрудник подразделения');
    setAddEmail('');

    showSuccess(`Новый участник «${trimmedName}» (логин: ${trimmedLogin}) успешно зарегистрирован!`);
  };

  // Delete User
  const handleDeleteUser = (u: UserProfile) => {
    if (confirm(`Вы уверены, что хотите удалить учетную запись «${u.name}» (логин: ${u.login})?`)) {
      try {
        deleteUserProfile(u.id);
        setUsers(getStoredUsers());
        showSuccess(`Учетная запись «${u.name}» удалена.`);
      } catch (err: any) {
        showError(err?.message || 'Не удалось удалить пользователя.');
      }
    }
  };

  // Inline Quick Password Save
  const handleInlinePasswordSave = (userId: string) => {
    if (!inlinePasswordValue.trim()) {
      showError('Пароль не может быть пустым.');
      return;
    }
    updateUserPassword(userId, inlinePasswordValue.trim());
    setUsers(getStoredUsers());
    setInlinePasswordUserId(null);
    setInlinePasswordValue('');
    showSuccess('Пароль учетной записи успешно обновлен.');
  };

  // Change Register Status (Admin Override)
  const handleChangeStatus = (docId: string, newStatus: any) => {
    const doc = registers.find((r) => r.id === docId);
    if (!doc) return;

    const updated: RiskRegisterDocument = {
      ...doc,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      history: [
        ...(doc.history || []),
        {
          id: `aud_admin_${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Администратор системы',
          role: 'Администратор',
          action: `Административное изменение статуса на: ${newStatus}`,
        },
      ],
    };
    saveRegister(updated, 'Администратор');
    onRefreshRegisters();
    showSuccess(`Статус регистра «${doc.header.department}» изменен на «${newStatus}».`);
  };

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.position.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <span className="text-xs uppercase tracking-wider font-semibold text-amber-300 bg-amber-900/60 px-2.5 py-1 rounded-md border border-amber-700/50">
          Панель полного управления (Роль: Администратор)
        </span>
        <h2 className="text-xl font-bold mt-2">
          Управление системой, учетными записями и правами доступа
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Администратор имеет полные права на управление участниками (изменение ФИО, логинов, паролей, ролей и добавление новых сотрудников), а также прямое редактирование и согласование Регистров подразделений института.
        </p>
      </div>

      {/* Alerts */}
      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Grid: 1. User accounts & Full Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Управление учетными записями участников ({users.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Редактирование ФИО, логинов, паролей и добавление новых пользователей
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Поиск по ФИО, логину..."
                className="w-48 sm:w-60 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Добавить участника</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ФИО и должность</th>
                <th className="px-3 py-3">Логин для входа</th>
                <th className="px-3 py-3">Роль (Доступ)</th>
                <th className="px-3 py-3">Подразделение</th>
                <th className="px-3 py-3">Пароль</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    {users.length === 0 ? 'Учетных записей нет' : 'Участники по запросу не найдены'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isInlinePassword = inlinePasswordUserId === u.id;
                  const roleBadge =
                    u.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Администратор
                      </span>
                    ) : u.role === 'risk_manager' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Риск-менеджер
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Заполнитель
                      </span>
                    );

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Position */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span>{u.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{u.position}</div>
                        {u.email && <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>}
                      </td>

                      {/* Login */}
                      <td className="px-3 py-3.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {u.login}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-3 py-3.5">{roleBadge}</td>

                      {/* Department */}
                      <td className="px-3 py-3.5 text-slate-700 max-w-xs truncate" title={u.department}>
                        {u.department}
                      </td>

                      {/* Password */}
                      <td className="px-3 py-3.5 font-mono">
                        {isInlinePassword ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={inlinePasswordValue}
                              onChange={(e) => setInlinePasswordValue(e.target.value)}
                              placeholder="Новый пароль..."
                              className="px-2 py-1 text-xs border border-blue-400 rounded bg-white w-28 focus:outline-hidden"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleInlinePasswordSave(u.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlinePasswordUserId(null)}
                              className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                              {visiblePasswordUserId === u.id ? (u.password || '••••••••') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisiblePasswordUserId(visiblePasswordUserId === u.id ? null : u.id)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                              title={visiblePasswordUserId === u.id ? 'Скрыть пароль' : 'Показать пароль'}
                            >
                              {visiblePasswordUserId === u.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 font-semibold text-xs transition-colors"
                          title="Редактировать ФИО, логин, пароль, роль"
                        >
                          <Edit className="w-3 h-3 text-blue-600" />
                          <span>Изменить</span>
                        </button>

                        {/* Quick Password Change Button */}
                        {!isInlinePassword && (
                          <button
                            type="button"
                            onClick={() => {
                              setInlinePasswordUserId(u.id);
                              setInlinePasswordValue(u.password || '');
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                            title="Сменить только пароль"
                          >
                            <KeyRound className="w-3 h-3 text-amber-600" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="inline-flex items-center p-1 rounded-lg border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Удалить пользователя"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: 2. Direct Editing of Any Department Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Прямое редактирование Регистров подразделений (Admin Override)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Возможность открыть и редактировать форму любого подразделения
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Подразделение</th>
                <th className="px-3 py-3 text-center">Период</th>
                <th className="px-3 py-3 text-center">Текущий статус</th>
                <th className="px-3 py-3 text-center">Рисков в базе</th>
                <th className="px-3 py-3 text-center">Изменить статус</th>
                <th className="px-4 py-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registers.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {doc.header.department}
                  </td>
                  <td className="px-3 py-3 text-center font-mono">
                    {doc.header.quarter} кв. {doc.header.year}
                  </td>
                  <td className="px-3 py-3 text-center font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold">
                    {doc.risks?.length || 0}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <select
                      value={doc.status}
                      onChange={(e) => handleChangeStatus(doc.id, e.target.value)}
                      className="text-xs rounded border border-slate-300 px-2 py-1 bg-white font-medium"
                    >
                      <option value="draft">draft (Черновик)</option>
                      <option value="submitted">submitted (На рассмотрении)</option>
                      <option value="returned">returned (На доработке)</option>
                      <option value="resubmitted">resubmitted (Повторно сдан)</option>
                      <option value="accepted">accepted (Согласован)</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectRegisterForEdit(doc.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Редактировать регистр</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">
                  Регистрация нового участника системы
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  ФИО участника *
                </label>
                <input
                  type="text"
                  required
                  value={addName ?? ''}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Например: Сериков Бауржан"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Login and Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Логин для входа *
                  </label>
                  <input
                    type="text"
                    required
                    value={addLogin ?? ''}
                    onChange={(e) => {
                      const l = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
                      setAddLogin(l);
                      if (!addEmail || addEmail.endsWith('@kior.kz')) {
                        setAddEmail(`${l}@kior.kz`);
                      }
                    }}
                    placeholder="b.serikov"
                    className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">
                      Пароль для входа *
                    </label>
                    <button
                      type="button"
                      onClick={() => setAddPassword(`kior_${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Сгенерировать
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      value={addPassword ?? ''}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="kior2026"
                      className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 pr-8 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showAddPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Роль доступа в портале *
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as UserRole)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden font-semibold"
                >
                  <option value="department">Заполнитель (Отдел) — заполнение регистра своего подразделения</option>
                  <option value="risk_manager">Риск-менеджер — дашборд, согласование и выгрузка Excel</option>
                  <option value="admin">Администратор — полный доступ, управление участниками</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Структурное подразделение
                </label>
                <select
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                >
                  {INITIAL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="__custom__">Другое (ввести вручную)...</option>
                </select>
                {addDept === '__custom__' && (
                  <input
                    type="text"
                    required
                    value={addCustomDept ?? ''}
                    onChange={(e) => setAddCustomDept(e.target.value)}
                    placeholder="Введите название подразделения..."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white mt-1"
                  />
                )}
              </div>

              {/* Position and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Должность</label>
                  <input
                    type="text"
                    value={addPosition ?? ''}
                    onChange={(e) => setAddPosition(e.target.value)}
                    placeholder="Руководитель / Эксперт"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email</label>
                  <input
                    type="email"
                    value={addEmail ?? ''}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="user@kior.kz"
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Создать участника</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXISTING USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  Редактирование профиля: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditUser} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  ФИО участника (Имя) *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Login and Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Логин для входа *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLogin}
                    onChange={(e) => setEditLogin(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Пароль для входа *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 pr-8 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Роль доступа *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden font-semibold"
                >
                  <option value="department">Заполнитель (Отдел)</option>
                  <option value="risk_manager">Риск-менеджер</option>
                  <option value="admin">Администратор системы</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Подразделение
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                >
                  {INITIAL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="__custom__">Другое (ввести вручную)...</option>
                </select>
                {editDept === '__custom__' && (
                  <input
                    type="text"
                    required
                    value={editCustomDept}
                    onChange={(e) => setEditCustomDept(e.target.value)}
                    placeholder="Название подразделения..."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white mt-1"
                  />
                )}
              </div>

              {/* Position and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Должность</label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
