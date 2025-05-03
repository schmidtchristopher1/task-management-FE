import React, { useState, useEffect } from "react";
import { getDepartments, createDepartment } from "../services/api.ts";
import { Department } from "../types/models.ts";

const DepartmentsPage: React.FC = () => {
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [newName, setNewName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const fetchDepartments = () => {
		setLoading(true);
		getDepartments()
			.then((data) => {
				setDepartments(data);
				setError(null);
			})
			.catch((err) => {
				console.error("Error fetching departments:", err);
				setError("Failed to fetch departments. Is the backend running?");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchDepartments();
	}, []);

	const handleCreateDepartment = (event: React.FormEvent) => {
		event.preventDefault();
		setFormError(null);
		setIsSubmitting(true);

		if (!newName.trim()) {
			setFormError("Department name cannot be empty.");
			setIsSubmitting(false);
			return;
		}

		createDepartment({ name: newName })
			.then((newDepartment) => {
				setDepartments((prevDepartments) => [
					...prevDepartments,
					newDepartment,
				]);
				setNewName("");
			})
			.catch((err) => {
				console.error("Error creating department:", err);
				setFormError("Failed to create department. Check console for details.");
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	if (loading && departments.length === 0)
		return <p className='loading-indicator'>Loading departments...</p>;
	if (error) return <p className='error-message'>{error}</p>;

	return (
		<div>
			<h1>Departments</h1>
			{loading && <p className='loading-indicator'>Refreshing...</p>}
			{error && <p className='error-message'>{error}</p>}

			{departments.length === 0 && !loading ? (
				<p>No departments found.</p>
			) : (
				<ul className='item-list'>
					{departments.map((dept) => (
						<li key={dept.id}>
							<span>{dept.name}</span>
						</li>
					))}
				</ul>
			)}

			<hr style={{ margin: "2rem 0" }} />
			<h2>Create New Department</h2>
			<form onSubmit={handleCreateDepartment}>
				<div>
					<label htmlFor='name'>Department Name: </label>
					<input
						type='text'
						id='name'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						required
						disabled={isSubmitting}
					/>
				</div>
				{formError && <p className='error-message'>{formError}</p>}
				<button
					type='submit'
					className='button primary'
					disabled={isSubmitting}
				>
					{isSubmitting ? "Creating..." : "Create Department"}
				</button>
			</form>
		</div>
	);
};

export default DepartmentsPage;
