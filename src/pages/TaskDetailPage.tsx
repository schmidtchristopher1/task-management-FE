import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	getTaskById,
	getAssignmentsByTaskId,
	getEmployees,
	createAssignment,
	updateAssignmentStatus,
	deleteAssignment,
} from "../services/api";
import { Task, Assignment, Employee, AssignmentStatus } from "../types/models";

function TaskDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [task, setTask] = useState<Task | null>(null);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
	const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
		null
	);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		if (!id) {
			setError("Task ID is missing.");
			setLoading(false);
			navigate("/tasks");
			return;
		}
		try {
			const [taskData, assignmentsData, employeesData] = await Promise.all([
				getTaskById(Number(id)),
				getAssignmentsByTaskId(Number(id)),
				getEmployees(),
			]);
			setTask(taskData);
			setAssignments(assignmentsData);
			setAvailableEmployees(employeesData);
		} catch (err: any) {
			console.error("Error fetching task details or assignments:", err);
			setError(
				`Failed to fetch task details: ${err.message || "Unknown error"}`
			);
		} finally {
			setLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleAddAssignment = useCallback(async () => {
		if (!selectedEmployeeId || !task) {
			setError("Please select an employee.");
			return;
		}
		setError(null);
		setLoading(true);
		try {
			const newAssignmentData = {
				employeeId: Number(selectedEmployeeId),
				taskId: task.id,
				status: AssignmentStatus.PENDING,
			};
			await createAssignment(newAssignmentData);
			setSelectedEmployeeId(null);
			setAddModalOpen(false);
			await fetchData();
		} catch (err: any) {
			console.error("Error creating assignment:", err);
			setError(
				`Failed to create assignment: ${err.message || "Unknown error"}`
			);
		} finally {
			setLoading(false);
		}
	}, [selectedEmployeeId, task, fetchData]);

	const handleStatusChange = useCallback(
		async (assignmentId: number, newStatus: AssignmentStatus) => {
			setError(null);
			setLoading(true);
			try {
				await updateAssignmentStatus(assignmentId, { status: newStatus });
				await fetchData();
			} catch (err: any) {
				console.error("Error updating assignment status:", err);
				setError(`Failed to update status: ${err.message || "Unknown error"}`);
			} finally {
				setLoading(false);
			}
		},
		[fetchData]
	);

	const handleDeleteAssignment = useCallback(
		async (assignmentId: number) => {
			setError(null);
			if (window.confirm("Are you sure you want to remove this assignment?")) {
				setLoading(true);
				try {
					await deleteAssignment(assignmentId);
					await fetchData();
				} catch (err: any) {
					console.error("Error deleting assignment:", err);
					setError(
						`Failed to delete assignment: ${err.message || "Unknown error"}`
					);
				} finally {
					setLoading(false);
				}
			}
		},
		[fetchData]
	);

	const assignedEmployeeIds = assignments.map((a) => a.employee.id);
	const employeesForDropdown = availableEmployees
		.filter((emp) => !assignedEmployeeIds.includes(emp.id))
		.map((emp) => ({
			value: emp.id.toString(),
			label: `${emp.name} (${emp.position})`,
		}));

	if (loading && !task) {
		return <p className='loading-indicator'>Loading task details...</p>;
	}

	if (!loading && !task) {
		return (
			<div className='container'>
				<div className='error-message'>{error || "Task not found."}</div>
				<button className='button' onClick={() => navigate("/tasks")}>
					Back to Tasks
				</button>
			</div>
		);
	}

	const currentTask = task!;

	return (
		<div className='container'>
			{loading && <p className='loading-indicator'>Loading...</p>}
			{error && (
				<div className='error-message'>
					{error}
					<button
						onClick={() => setError(null)}
						style={{
							marginLeft: "1rem",
							background: "none",
							border: "none",
							color: "inherit",
							cursor: "pointer",
						}}
					>
						&times;
					</button>
				</div>
			)}

			<div className='detail-section'>
				<h2>{currentTask.title}</h2>
				<p>
					<strong>ID:</strong> {currentTask.id}
				</p>
				<p>
					<strong>Description:</strong> {currentTask.description || "N/A"}
				</p>
				<p>
					<strong>Deadline:</strong>{" "}
					{currentTask.deadline
						? new Date(currentTask.deadline).toLocaleDateString()
						: "Not set"}
				</p>
			</div>

			<div className='detail-section'>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "1rem",
					}}
				>
					<h3>Assignments</h3>
					<button
						className='button primary'
						onClick={() => setAddModalOpen(true)}
						disabled={loading}
					>
						Assign Employee
					</button>
				</div>

				{assignments.length === 0 ? (
					<p>No employees assigned to this task yet.</p>
				) : (
					<ul className='item-list'>
						{assignments.map((assignment) => (
							<li key={assignment.id}>
								<div style={{ flexGrow: 1, marginRight: "1rem" }}>
									<span>
										{assignment.employee.name} ({assignment.employee.position})
									</span>
									<span
										style={{
											marginLeft: "0.5rem",
											fontSize: "0.9em",
											color: "var(--muted-foreground)",
										}}
									>
										({assignment.status})
									</span>
								</div>
								<div
									style={{
										display: "flex",
										gap: "0.5rem",
										alignItems: "center",
									}}
								>
									<select
										value={assignment.status}
										onChange={(e) =>
											handleStatusChange(
												assignment.id,
												e.target.value as AssignmentStatus
											)
										}
										disabled={loading}
										style={{ padding: "0.3rem 0.5rem", fontSize: "0.9em" }}
									>
										<option value={AssignmentStatus.PENDING}>Pending</option>
										<option value={AssignmentStatus.IN_PROGRESS}>
											In Progress
										</option>
										<option value={AssignmentStatus.COMPLETED}>
											Completed
										</option>
									</select>
									<button
										className='button destructive small'
										onClick={() => handleDeleteAssignment(assignment.id)}
										disabled={loading}
										style={{ padding: "0.3rem 0.6rem", fontSize: "0.9em" }}
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>

			{addModalOpen && (
				<div className='modal-backdrop'>
					<div className='modal-content'>
						<h4>Assign Employee to Task</h4>
						<select
							value={selectedEmployeeId || ""}
							onChange={(e) => setSelectedEmployeeId(e.target.value || null)}
							disabled={loading}
							style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
						>
							<option value=''>-- Select Employee --</option>
							{employeesForDropdown.map((emp) => (
								<option key={emp.value} value={emp.value}>
									{emp.label}
								</option>
							))}
						</select>
						{employeesForDropdown.length === 0 && (
							<p>No available employees found.</p>
						)}

						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								gap: "1rem",
								marginTop: "1rem",
							}}
						>
							<button
								className='button'
								onClick={() => setAddModalOpen(false)}
								disabled={loading}
							>
								Cancel
							</button>
							<button
								className='button primary'
								onClick={handleAddAssignment}
								disabled={!selectedEmployeeId || loading}
							>
								Assign
							</button>
						</div>
					</div>
				</div>
			)}
			<Link
				to='/tasks'
				style={{ display: "inline-block", marginTop: "1.5rem" }}
			>
				← Back to Tasks
			</Link>
		</div>
	);
}

export default TaskDetailPage;
