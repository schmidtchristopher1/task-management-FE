import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Employee, Department } from "../types/models";

const EmployeeDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [editName, setEditName] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editPosition, setEditPosition] = useState("");
	const [editDepartmentId, setEditDepartmentId] = useState<string>("");

	useEffect(() => {
		if (!id) return;
		setLoading(true);
		api
			.get<Employee>(`/employees/${id}`)
			.then((response) => {
				setEmployee(response.data);
				setEditName(response.data.name);
				setEditEmail(response.data.email);
				setEditPosition(response.data.position);
				setEditDepartmentId(response.data.department?.id?.toString() || "");
				setError(null);
			})
			.catch((err) => {
				console.error("Error fetching employee:", err);
				setError("Failed to fetch employee details.");
			})
			.finally(() => {
				setLoading(false);
			});

		api
			.get<Department[]>("/departments")
			.then((response) => {
				setDepartments(response.data);
			})
			.catch((err) => {
				console.error("Error fetching departments:", err);
			});
	}, [id]);

	const handleUpdateEmployee = (event: React.FormEvent) => {
		event.preventDefault();
		if (!employee) return;
		setFormError(null);
		setIsEditing(true);

		const updatedEmployeeData: Partial<Employee> & { departmentId?: number } = {
			name: editName,
			email: editEmail,
			position: editPosition,
			department: editDepartmentId
				? departments.find((d) => d.id === parseInt(editDepartmentId))
				: undefined,
		};

		if (!editName || !editEmail || !editPosition) {
			setFormError("Name, Email, and Position are required.");
			return;
		}

		api
			.put<Employee>(`/employees/update/${employee.id}`, updatedEmployeeData)
			.then((response) => {
				setEmployee(response.data);
				setIsEditing(false);
				setFormError(null);
			})
			.catch((err) => {
				console.error("Error updating employee:", err);
				setFormError("Failed to update employee. Check console for details.");
			});
	};

	const handleDeleteEmployee = () => {
		if (
			!employee ||
			!window.confirm(`Are you sure you want to delete ${employee.name}?`)
		) {
			return;
		}
		setIsDeleting(true);
		setError(null);

		api
			.delete(`/employees/delete/${employee.id}`)
			.then(() => {
				navigate("/employees");
			})
			.catch((err) => {
				console.error("Error deleting employee:", err);
				setError(
					"Failed to delete employee. It might be assigned to tasks or comments."
				);
				setIsDeleting(false);
			});
	};

	if (loading) return <p>Loading employee details...</p>;
	if (error) return <p style={{ color: "red" }}>{error}</p>;
	if (!employee) return <p>Employee not found.</p>;

	return (
		<div>
			<Link to='/employees'>← Back to Employees</Link>

			{isEditing ? (
				<>
					{" "}
					<h1>Edit Employee: {employee.name}</h1>
					<form onSubmit={handleUpdateEmployee}>
						<div>
							<label htmlFor='editName'>Name: </label>
							<input
								type='text'
								id='editName'
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								required
							/>
						</div>
						<div>
							<label htmlFor='editEmail'>Email: </label>
							<input
								type='email'
								id='editEmail'
								value={editEmail}
								onChange={(e) => setEditEmail(e.target.value)}
								required
							/>
						</div>
						<div>
							<label htmlFor='editPosition'>Position: </label>
							<input
								type='text'
								id='editPosition'
								value={editPosition}
								onChange={(e) => setEditPosition(e.target.value)}
								required
							/>
						</div>
						<div>
							<label htmlFor='editDepartment'>Department: </label>
							<select
								id='editDepartment'
								value={editDepartmentId}
								onChange={(e) => setEditDepartmentId(e.target.value)}
							>
								<option value=''>-- Select Department (Optional) --</option>
								{departments.map((dept) => (
									<option key={dept.id} value={dept.id}>
										{dept.name}
									</option>
								))}
							</select>
						</div>
						{formError && <p style={{ color: "red" }}>{formError}</p>}
						<button type='submit' disabled={!isEditing}>
							Save Changes
						</button>
						<button type='button' onClick={() => setIsEditing(false)}>
							Cancel
						</button>
					</form>
				</>
			) : (
				<>
					<h1>{employee.name}</h1>
					<p>
						<strong>ID:</strong> {employee.id}
					</p>
					<p>
						<strong>Email:</strong> {employee.email}
					</p>
					<p>
						<strong>Position:</strong> {employee.position}
					</p>
					<p>
						<strong>Department:</strong>{" "}
						{employee.department ? employee.department.name : "N/A"}
					</p>

					<button onClick={() => setIsEditing(true)}>Edit</button>
					<button
						onClick={handleDeleteEmployee}
						disabled={isDeleting}
						style={{
							marginLeft: "10px",
							backgroundColor: "red",
							color: "white",
						}}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</>
			)}
		</div>
	);
};

export default EmployeeDetailPage;
