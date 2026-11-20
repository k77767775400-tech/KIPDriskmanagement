/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RiskRegisterDocument, NomenclatureItem, UserProfile } from '../types/risk';
import { createAcceptanceRegister, DEFAULT_NOMENCLATURE, INITIAL_USERS } from './acceptanceData';
import { getQuarterPeriodString } from './calculations';

const STORAGE_KEY_REGISTERS = 'kior_risk_registers_v1';
const STORAGE_KEY_NOMENCLATURE = 'kior_nomenclature_v1';
const STORAGE_KEY_USERS = 'kior_users_accounts_v1';
const STORAGE_KEY_AUTH_SESSION = 'kior_auth_session_v1';

// Synchronous cached state for instant rendering
let cachedRegisters: RiskRegisterDocument[] = [];
let cachedUsers: UserProfile[] = [];
let isRegistersInitialized = false;
let isUsersInitialized = false;

// ==========================================
// REGISTERS
// ==========================================

export function getStoredRegisters(): RiskRegisterDocument[] {
  if (isRegistersInitialized && cachedRegisters.length > 0) {
    return [...cachedRegisters];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRegisters = parsed;
        isRegistersInitialized = true;
        return [...cachedRegisters];
      }
    }
  } catch (e) {
    console.error('Failed to parse registers from localStorage:', e);
  }

  const initial = [createAcceptanceRegister()];
  cachedRegisters = [...initial];
  isRegistersInitialized = true;
  saveRegisters(initial);
  return [...initial];
}

export function saveRegisters(registersList: RiskRegisterDocument[]): void {
  cachedRegisters = [...registersList];
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERS, JSON.stringify(registersList));
  } catch (e) {
    console.error('Failed to save registers to storage:', e);
  }
}

export function saveRegister(doc: RiskRegisterDocument, _authorName = 'Пользователь'): RiskRegisterDocument {
  const list = getStoredRegisters();
  const updatedDoc: RiskRegisterDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };

  const existingIdx = list.findIndex((item) => item.id === doc.id);
  const nextList = existingIdx >= 0
    ? [...list.slice(0, existingIdx), updatedDoc, ...list.slice(existingIdx + 1)]
    : [...list, updatedDoc];

  saveRegisters(nextList);
  return updatedDoc;
}

export function getRegisterById(id: string): RiskRegisterDocument | undefined {
  const list = getStoredRegisters();
  return list.find((item) => item.id === id);
}

export function getRegisterForDepartmentAndPeriod(
  dept: string,
  quarter: 'I' | 'II' | 'III' | 'IV',
  year: number
): RiskRegisterDocument | undefined {
  const list = getStoredRegisters();
  return list.find(
    (item) => item.header.department === dept && item.header.quarter === quarter && item.header.year === year
  );
}

export function createNewRegisterForDepartment(
  dept: string,
  quarter: 'I' | 'II' | 'III' | 'IV',
  year: number,
  coordinatorName: string,
  coordinatorPosition: string
): RiskRegisterDocument {
  const now = new Date().toISOString();
  const periodString = getQuarterPeriodString(quarter, year);
  const id = `reg_${encodeURIComponent(dept)}_${quarter}_${year}_${Date.now()}`;

  const newDoc: RiskRegisterDocument = {
    id,
    header: {
      department: dept,
      quarter,
      year,
      periodString,
      coordinatorName,
      coordinatorPosition,
      curatingDeputyName: 'Сапарбаев Е. Б.',
    },
    risks: [],
    kprList: [],
    realizedReport: {
      '1-С': { classId: '1-С', hasNoEvents: true, events: [] },
      '2-Ф': { classId: '2-Ф', hasNoEvents: true, events: [] },
      '3-П': { classId: '3-П', hasNoEvents: true, events: [] },
      '4-К': { classId: '4-К', hasNoEvents: true, events: [] },
      '5-О': { classId: '5-О', hasNoEvents: true, events: [] },
    },
    status: 'draft',
    version: 1,
    history: [
      {
        id: `aud_${Date.now()}`,
        timestamp: now,
        author: coordinatorName || 'Координатор',
        role: 'Координатор рисков',
        action: `Создание проекта регистра за ${quarter} квартал ${year} г.`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  saveRegister(newDoc);
  return newDoc;
}

export function copyFromPreviousQuarter(
  sourceDoc: RiskRegisterDocument,
  targetQuarter: 'I' | 'II' | 'III' | 'IV',
  targetYear: number,
  authorName: string
): RiskRegisterDocument {
  const now = new Date().toISOString();
  const newPeriodString = getQuarterPeriodString(targetQuarter, targetYear);
  const newId = `reg_${encodeURIComponent(sourceDoc.header.department)}_${targetQuarter}_${targetYear}_${Date.now()}`;

  const clonedRisks = sourceDoc.risks.map((risk) => ({
    ...risk,
    id: `r_copied_${risk.riskNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    measures: (risk.measures || []).map((m) => ({
      ...m,
      id: `m_copied_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: m.status === 'Исполнено' ? ('Исполнено' as const) : ('В процессе исполнения' as const),
    })),
  }));

  const clonedKpr = (sourceDoc.kprList || []).map((k) => ({
    ...k,
    id: `kpr_copied_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  }));

  const copiedDoc: RiskRegisterDocument = {
    id: newId,
    header: {
      ...sourceDoc.header,
      quarter: targetQuarter,
      year: targetYear,
      periodString: newPeriodString,
    },
    risks: clonedRisks,
    kprList: clonedKpr,
    realizedReport: {
      '1-С': { classId: '1-С', hasNoEvents: true, events: [] },
      '2-Ф': { classId: '2-Ф', hasNoEvents: true, events: [] },
      '3-П': { classId: '3-П', hasNoEvents: true, events: [] },
      '4-К': { classId: '4-К', hasNoEvents: true, events: [] },
      '5-О': { classId: '5-О', hasNoEvents: true, events: [] },
    },
    status: 'draft',
    version: 1,
    history: [
      {
        id: `aud_${Date.now()}`,
        timestamp: now,
        author: authorName,
        role: 'Координатор рисков',
        action: `Создано копированием из ${sourceDoc.header.quarter} квартала ${sourceDoc.header.year} г. (${clonedRisks.length} рисков перенесено)`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  saveRegister(copiedDoc);
  return copiedDoc;
}

// ==========================================
// NOMENCLATURE
// ==========================================
export function getStoredNomenclature(): NomenclatureItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOMENCLATURE);
    if (!raw) {
      saveNomenclature(DEFAULT_NOMENCLATURE);
      return DEFAULT_NOMENCLATURE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOMENCLATURE;
  } catch (e) {
    return DEFAULT_NOMENCLATURE;
  }
}

export function saveNomenclature(items: NomenclatureItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOMENCLATURE, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save nomenclature:', e);
  }
}

export function addNomenclatureItem(item: NomenclatureItem): NomenclatureItem[] {
  const current = getStoredNomenclature();
  const exists = current.find((i) => i.riskNumber === item.riskNumber);
  let updated: NomenclatureItem[];
  if (exists) {
    updated = current.map((i) => (i.riskNumber === item.riskNumber ? item : i));
  } else {
    updated = [...current, item];
  }
  saveNomenclature(updated);
  return updated;
}

export function getNextFreeRiskNumber(classId: string, currentRisksInDoc: string[] = []): string {
  const nom = getStoredNomenclature();
  const allKnown = new Set<string>();
  nom.forEach((n) => allKnown.add(n.riskNumber));
  currentRisksInDoc.forEach((r) => allKnown.add(r));

  let maxSeq = 0;
  allKnown.forEach((rNum) => {
    if (rNum.startsWith(classId)) {
      const match = rNum.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(2, '0');
  return `${classId}-${nextSeq}`;
}

// ==========================================
// USER ACCOUNTS & AUTHENTICATION
// ==========================================

export function getStoredUsers(): UserProfile[] {
  if (isUsersInitialized && cachedUsers.length > 0) {
    return cachedUsers;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedUsers = parsed;
        isUsersInitialized = true;
        return cachedUsers;
      }
    }
  } catch (e) {
    console.error('Failed to parse users:', e);
  }

  cachedUsers = INITIAL_USERS;
  isUsersInitialized = true;
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function saveStoredUsers(usersList: UserProfile[]): void {
  cachedUsers = usersList;
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usersList));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export async function authenticateUserAsync(loginOrEmail: string, passwordAttempt: string): Promise<UserProfile | null> {
  return authenticateUser(loginOrEmail, passwordAttempt);
}

export interface LockStatus {
  locked: boolean;
  canEdit: boolean;
  lockedByUserId?: string;
  lockedByUserName?: string;
  lockedByUserDepartment?: string;
  lockedAt?: string;
  message?: string;
}

export async function acquireDocumentLock(
  _docId: string,
  _user: UserProfile
): Promise<LockStatus> {
  return { locked: false, canEdit: true };
}

export async function releaseDocumentLock(_docId: string, _userId: string): Promise<void> {
  // Lock released cleanly
}

export function authenticateUser(loginOrEmail: string, passwordAttempt: string): UserProfile | null {
  const usersList = getStoredUsers();
  const cleanLogin = loginOrEmail.trim().toLowerCase();
  const found = usersList.find(
    (u) =>
      u.login?.toLowerCase() === cleanLogin ||
      u.email?.toLowerCase() === cleanLogin ||
      u.role?.toLowerCase() === cleanLogin
  );

  if (!found) return null;

  const expectedPassword = found.password || 'kior2026';
  if (passwordAttempt === expectedPassword) {
    setAuthSession(found);
    return found;
  }
  return null;
}

export function getAuthSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return null;
}

export function setAuthSession(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
    }
  } catch (e) {
    console.error('Failed to save auth session:', e);
  }
}

export function updateUserPassword(userId: string, newPassword: string): boolean {
  return updateUserProfile(userId, { password: newPassword });
}

export function updateUserProfile(userId: string, patch: Partial<UserProfile>): boolean {
  const usersList = getStoredUsers();
  const updated = usersList.map((u) => (u.id === userId ? { ...u, ...patch } : u));
  saveStoredUsers(updated);

  const current = getAuthSession();
  if (current && current.id === userId) {
    setAuthSession({ ...current, ...patch });
  }

  return true;
}

export function addUserProfile(newUser: Omit<UserProfile, 'id'> & { id?: string }): UserProfile {
  const usersList = getStoredUsers();
  const id = newUser.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullUser: UserProfile = {
    ...newUser,
    id,
    password: newUser.password || 'kior2026',
  };
  const updated = [...usersList, fullUser];
  saveStoredUsers(updated);

  return fullUser;
}

export function deleteUserProfile(userId: string): boolean {
  const usersList = getStoredUsers();
  const target = usersList.find((u) => u.id === userId);
  if (!target) return false;
  if (target.role === 'admin') {
    const adminCount = usersList.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      throw new Error('Нельзя удалить единственного администратора системы.');
    }
  }
  const updated = usersList.filter((u) => u.id !== userId);
  saveStoredUsers(updated);

  return true;
}

export function getStoredUser(): UserProfile {
  const session = getAuthSession();
  if (session) return session;
  return INITIAL_USERS[0];
}

export function setStoredUser(user: UserProfile): void {
  setAuthSession(user);
}
