import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import {
  employeeService,
  type AddDocumentPayload,
  type AddSalaryPayload,
  type CreateEmployeePayload,
  type Employee,
  type EmployeeDocumentAttachment,
  type EmployeeList,
  type EmployeeQueryParams,
  type SalaryEntry,
  type SalaryHistory,
  type UpdateEmployeePayload,
  type VacationSummary,
} from '../api/employeeService';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Unexpected error';
}

function cloneParams<T extends object | undefined>(params: T): T {
  if (!params) return params;
  return { ...params } as T;
}

interface SalaryHistoryParamsSnapshot {
  employeeId: string;
  params?: { limit?: number; offset?: number };
}

export interface UseEmployeeResult {
  employees: Employee[];
  total: number;
  isLoadingList: boolean;
  listError: string | null;
  listEmployees: (params?: EmployeeQueryParams) => Promise<EmployeeList>;
  refreshEmployees: () => Promise<EmployeeList>;

  employee: Employee | null;
  isLoadingEmployee: boolean;
  employeeError: string | null;
  fetchEmployee: (id: string) => Promise<Employee>;
  clearSelectedEmployee: () => void;

  isSaving: boolean;
  isDeleting: boolean;
  mutationError: string | null;
  createEmployee: (payload: CreateEmployeePayload) => Promise<Employee>;
  updateEmployee: (id: string, payload: UpdateEmployeePayload) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;

  currentSalary: SalaryEntry | null;
  salaryHistory: SalaryHistory | null;
  isLoadingCurrentSalary: boolean;
  isLoadingSalaryHistory: boolean;
  salaryError: string | null;
  fetchCurrentSalary: (id: string) => Promise<SalaryEntry | null>;
  fetchSalaryHistory: (
    id: string,
    params?: { limit?: number; offset?: number },
  ) => Promise<SalaryHistory>;
  refreshSalaryHistory: () => Promise<SalaryHistory> | null;
  addSalary: (id: string, payload: AddSalaryPayload) => Promise<SalaryEntry>;
  clearSalaryState: () => void;

  vacationSummary: VacationSummary | null;
  isLoadingVacation: boolean;
  vacationError: string | null;
  fetchVacationSummary: (id: string) => Promise<VacationSummary>;

  isMutatingDocuments: boolean;
  documentError: string | null;
  addDocument: (
    id: string,
    payload: AddDocumentPayload,
  ) => Promise<EmployeeDocumentAttachment>;
  removeDocument: (employeeId: string, documentId: string) => Promise<void>;
}

export function useEmployee(): UseEmployeeResult {
  const { accessToken } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const [currentSalary, setCurrentSalary] = useState<SalaryEntry | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory | null>(null);
  const [isLoadingCurrentSalary, setIsLoadingCurrentSalary] =
    useState<boolean>(false);
  const [isLoadingSalaryHistory, setIsLoadingSalaryHistory] =
    useState<boolean>(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  const [vacationSummary, setVacationSummary] =
    useState<VacationSummary | null>(null);
  const [isLoadingVacation, setIsLoadingVacation] = useState<boolean>(false);
  const [vacationError, setVacationError] = useState<string | null>(null);

  const [isMutatingDocuments, setIsMutatingDocuments] =
    useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const lastListParamsRef = useRef<EmployeeQueryParams | undefined>(undefined);
  const salaryHistoryParamsRef = useRef<SalaryHistoryParamsSnapshot | null>(
    null,
  );

  const requireToken = useCallback((): string => {
    if (!accessToken) throw new Error('Missing access token');
    return accessToken;
  }, [accessToken]);

  const listEmployees = useCallback(
    async (params?: EmployeeQueryParams): Promise<EmployeeList> => {
      const token = requireToken();
      const finalParams = cloneParams(
        params ?? lastListParamsRef.current ?? undefined,
      );
      lastListParamsRef.current = finalParams;

      setIsLoadingList(true);
      setListError(null);
      try {
        const data = await employeeService.listEmployees(finalParams, token);
        setEmployees(data.items);
        setTotal(data.total);
        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        setListError(message);
        throw error;
      } finally {
        setIsLoadingList(false);
      }
    },
    [requireToken],
  );

  const refreshEmployees = useCallback(() => listEmployees(), [listEmployees]);

  const fetchEmployee = useCallback(
    async (id: string): Promise<Employee> => {
      const token = requireToken();
      setIsLoadingEmployee(true);
      setEmployeeError(null);
      setDocumentError(null);
      try {
        const data = await employeeService.getEmployee(id, token);
        setEmployee(data);
        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        setEmployeeError(message);
        throw error;
      } finally {
        setIsLoadingEmployee(false);
      }
    },
    [requireToken],
  );

  const clearSelectedEmployee = useCallback(() => {
    setEmployee(null);
    setEmployeeError(null);
    setVacationSummary(null);
    setDocumentError(null);
  }, []);

  const createEmployee = useCallback(
    async (payload: CreateEmployeePayload): Promise<Employee> => {
      const token = requireToken();
      setIsSaving(true);
      setMutationError(null);
      try {
        const created = await employeeService.createEmployee(payload, token);
        await listEmployees();
        return created;
      } catch (error) {
        const message = getErrorMessage(error);
        setMutationError(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [listEmployees, requireToken],
  );

  const updateEmployee = useCallback(
    async (
      id: string,
      payload: UpdateEmployeePayload,
    ): Promise<Employee> => {
      const token = requireToken();
      setIsSaving(true);
      setMutationError(null);
      try {
        const updated = await employeeService.updateEmployee(id, payload, token);
        setEmployee(updated);
        await listEmployees();
        return updated;
      } catch (error) {
        const message = getErrorMessage(error);
        setMutationError(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [listEmployees, requireToken],
  );

  const deleteEmployee = useCallback(
    async (id: string): Promise<void> => {
      const token = requireToken();
      setIsDeleting(true);
      setMutationError(null);
      try {
        await employeeService.deleteEmployee(id, token);
        if (employee?.id === id) {
          setEmployee(null);
        }
        await listEmployees();
      } catch (error) {
        const message = getErrorMessage(error);
        setMutationError(message);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [employee?.id, listEmployees, requireToken],
  );

  const fetchCurrentSalary = useCallback(
    async (id: string): Promise<SalaryEntry | null> => {
      const token = requireToken();
      setIsLoadingCurrentSalary(true);
      setSalaryError(null);
      try {
        const data = await employeeService.getCurrentSalary(id, token);
        setCurrentSalary(data);
        return data;
      } catch (error) {
        const message = getErrorMessage(error);
        setSalaryError(message);
        throw error;
      } finally {
        setIsLoadingCurrentSalary(false);
      }
    },
    [requireToken],
  );

  const fetchSalaryHistory = useCallback(
    async (
      id: string,
      params?: { limit?: number; offset?: number },
    ): Promise<SalaryHistory> => {
      const token = requireToken();
      const snapshot: SalaryHistoryParamsSnapshot = {
        employeeId: id,
        params: cloneParams(params),
      };
      salaryHistoryParamsRef.current = snapshot;

      setIsLoadingSalaryHistory(true);
      setSalaryError(null);
      try {
        const history = await employeeService.getSalaryHistory(id, token, params);
        setSalaryHistory(history);
        return history;
      } catch (error) {
        const message = getErrorMessage(error);
        setSalaryError(message);
        throw error;
      } finally {
        setIsLoadingSalaryHistory(false);
      }
    },
    [requireToken],
  );

  const refreshSalaryHistory = useCallback(() => {
    const snapshot = salaryHistoryParamsRef.current;
    if (!snapshot) return null;
    return fetchSalaryHistory(snapshot.employeeId, snapshot.params);
  }, [fetchSalaryHistory]);

  const addSalary = useCallback(
    async (id: string, payload: AddSalaryPayload): Promise<SalaryEntry> => {
      const token = requireToken();
      setIsSaving(true);
      setMutationError(null);
      try {
        const entry = await employeeService.addSalary(id, payload, token);
        await Promise.allSettled([
          fetchCurrentSalary(id),
          refreshSalaryHistory()?.catch(() => undefined) ?? Promise.resolve(),
        ]);
        return entry;
      } catch (error) {
        const message = getErrorMessage(error);
        setMutationError(message);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchCurrentSalary, refreshSalaryHistory, requireToken],
  );

  const clearSalaryState = useCallback(() => {
    setCurrentSalary(null);
    setSalaryHistory(null);
    setSalaryError(null);
    salaryHistoryParamsRef.current = null;
  }, []);

  const fetchVacationSummary = useCallback(
    async (id: string): Promise<VacationSummary> => {
      const token = requireToken();
      setIsLoadingVacation(true);
      setVacationError(null);
      try {
        const summary = await employeeService.getVacationSummary(id, token);
        setVacationSummary(summary);
        return summary;
      } catch (error) {
        const message = getErrorMessage(error);
        setVacationError(message);
        throw error;
      } finally {
        setIsLoadingVacation(false);
      }
    },
    [requireToken],
  );

  const addDocument = useCallback(
    async (
      id: string,
      payload: AddDocumentPayload,
    ): Promise<EmployeeDocumentAttachment> => {
      const token = requireToken();
      setIsMutatingDocuments(true);
      setDocumentError(null);
      try {
        const attachment = await employeeService.addDocument(id, payload, token);
        setEmployee((prev) =>
          prev && prev.id === id
            ? {
                ...prev,
                documents: [...prev.documents, attachment],
              }
            : prev,
        );
        return attachment;
      } catch (error) {
        const message = getErrorMessage(error);
        setDocumentError(message);
        throw error;
      } finally {
        setIsMutatingDocuments(false);
      }
    },
    [requireToken],
  );

  const removeDocument = useCallback(
    async (employeeId: string, documentId: string): Promise<void> => {
      const token = requireToken();
      setIsMutatingDocuments(true);
      setDocumentError(null);
      try {
        await employeeService.removeDocument(employeeId, documentId, token);
        setEmployee((prev) =>
          prev && prev.id === employeeId
            ? {
                ...prev,
                documents: prev.documents.filter((doc) => doc.id !== documentId),
              }
            : prev,
        );
      } catch (error) {
        const message = getErrorMessage(error);
        setDocumentError(message);
        throw error;
      } finally {
        setIsMutatingDocuments(false);
      }
    },
    [requireToken],
  );

  return useMemo<UseEmployeeResult>(
    () => ({
      employees,
      total,
      isLoadingList,
      listError,
      listEmployees,
      refreshEmployees,
      employee,
      isLoadingEmployee,
      employeeError,
      fetchEmployee,
      clearSelectedEmployee,
      isSaving,
      isDeleting,
      mutationError,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      currentSalary,
      salaryHistory,
      isLoadingCurrentSalary,
      isLoadingSalaryHistory,
      salaryError,
      fetchCurrentSalary,
      fetchSalaryHistory,
      refreshSalaryHistory,
      addSalary,
      clearSalaryState,
      vacationSummary,
      isLoadingVacation,
      vacationError,
      fetchVacationSummary,
      isMutatingDocuments,
      documentError,
      addDocument,
      removeDocument,
    }),
    [
      employees,
      total,
      isLoadingList,
      listError,
      listEmployees,
      refreshEmployees,
      employee,
      isLoadingEmployee,
      employeeError,
      fetchEmployee,
      clearSelectedEmployee,
      isSaving,
      isDeleting,
      mutationError,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      currentSalary,
      salaryHistory,
      isLoadingCurrentSalary,
      isLoadingSalaryHistory,
      salaryError,
      fetchCurrentSalary,
      fetchSalaryHistory,
      refreshSalaryHistory,
      addSalary,
      clearSalaryState,
      vacationSummary,
      isLoadingVacation,
      vacationError,
      fetchVacationSummary,
      isMutatingDocuments,
      documentError,
      addDocument,
      removeDocument,
    ],
  );
}

export type {
  Employee,
  EmployeeDocumentAttachment,
  EmployeeQueryParams,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  SalaryEntry,
  SalaryHistory,
  AddSalaryPayload,
  EmployeeStatus,
  VacationSummary,
  AddDocumentPayload,
} from '../api/employeeService';
