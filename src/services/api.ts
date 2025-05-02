import axios from 'axios';
import { Assignment, AssignmentStatus, Employee, Task } from '../types/models';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get('/employees');
  return response.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

interface EmployeeData {
  name: string;
  email: string;
  position: string;
  departmentId?: number;
}

export const createEmployee = async (employeeData: EmployeeData): Promise<Employee> => {
  const response = await api.post('/employees/create', employeeData);
  return response.data;
};

export const updateEmployee = async (id: number, employeeData: Partial<EmployeeData>): Promise<Employee> => {
  const response = await api.put(`/employees/update/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/employees/delete/${id}`);
};

interface TaskData {
  title: string;
  description: string;
  deadline?: string | null;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData: TaskData): Promise<Task> => {
  const response = await api.post('/tasks/create', taskData);
  return response.data;
};

export const updateTask = async (id: number, taskData: Partial<TaskData>): Promise<Task> => {
  const response = await api.put(`/tasks/update/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/delete/${id}`);
};

export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await api.get('/assignments');
  return response.data;
};

export const getAssignmentById = async (id: number): Promise<Assignment> => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const getAssignmentsByTaskId = async (taskId: number): Promise<Assignment[]> => {
  const allAssignments = await getAssignments();
  return allAssignments.filter(a => a.task && a.task.id === taskId && a.employee);
};

export const getAssignmentsByEmployeeId = async (employeeId: number): Promise<Assignment[]> => {
  const allAssignments = await getAssignments();
  return allAssignments.filter(a => a.employee && a.employee.id === employeeId && a.task);
};

interface CreateAssignmentData {
  employeeId: number;
  taskId: number;
  status: AssignmentStatus;
}

export const createAssignment = async (assignmentData: CreateAssignmentData): Promise<Assignment> => {
  const response = await api.post('/assignments/create', assignmentData);
  return response.data;
};

interface UpdateAssignmentStatusData {
  status: AssignmentStatus;
}

export const updateAssignmentStatus = async (id: number, statusUpdateData: UpdateAssignmentStatusData): Promise<Assignment> => {
  const response = await api.put(`/assignments/update/${id}`, statusUpdateData);
  return response.data;
};

export const deleteAssignment = async (id: number): Promise<void> => {
  await api.delete(`/assignments/delete/${id}`);
};

export default api;
