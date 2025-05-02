export enum AssignmentStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export interface Department {
    id: number;
    name: string;
}

export interface Employee {
    id: number;
    name: string;
    email: string;
    position: string;
    department?: Department;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline: string;
}

export interface Assignment {
    id: number;
    employee: Employee;
    task: Task;
    status: AssignmentStatus;
}

export interface Comment {
    id: number;
    task: Task;
    employee: Employee;
    content: string;
    createdAt: string;
}
