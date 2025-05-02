import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.ts";
import { Task } from "../types/models.ts";

const TasksPage: React.FC = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newDeadline, setNewDeadline] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const fetchTasks = () => {
		setLoading(true);
		api
			.get<Task[]>("/tasks")
			.then((response) => {
				setTasks(response.data);
				setError(null);
			})
			.catch((err) => {
				console.error("Error fetching tasks:", err);
				setError("Failed to fetch tasks. Is the backend running?");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchTasks();
	}, []);

	const handleCreateTask = (event: React.FormEvent) => {
		event.preventDefault();
		setFormError(null);
		setIsSubmitting(true);

		if (!newTitle || !newDeadline) {
			setFormError("Title and Deadline are required.");
			setIsSubmitting(false);
			return;
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(newDeadline)) {
			setFormError("Deadline must be in YYYY-MM-DD format.");
			setIsSubmitting(false);
			return;
		}

		const newTaskData: Partial<Task> = {
			title: newTitle,
			description: newDescription || undefined, // Send undefined if empty
			deadline: newDeadline,
		};

		api
			.post<Task>("/tasks/create", newTaskData)
			.then((response) => {
				setTasks((prevTasks) => [...prevTasks, response.data]);
				setNewTitle("");
				setNewDescription("");
				setNewDeadline("");
			})
			.catch((err) => {
				console.error("Error creating task:", err);
				setFormError("Failed to create task. Check console for details.");
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
	if (error) return <p style={{ color: "red" }}>{error}</p>;

	return (
		<div>
			<h1>Tasks</h1>
			{loading && <p>Refreshing...</p>}
			{tasks.length === 0 && !loading ? (
				<p>No tasks found.</p>
			) : (
				<ul>
					{tasks.map((task) => (
						<li key={task.id}>
							<Link to={`/tasks/${task.id}`}>
								<strong>{task.title}</strong>
							</Link>{" "}
							(Due: {task.deadline})
							{task.description && <p>{task.description}</p>}
						</li>
					))}
				</ul>
			)}
			<hr style={{ margin: "2rem 0" }} />
			<h2>Create New Task</h2>
			<form onSubmit={handleCreateTask}>
				<div>
					<label htmlFor='title'>Title: </label>
					<input
						type='text'
						id='title'
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor='description'>Description: </label>
					<textarea
						id='description'
						value={newDescription}
						onChange={(e) => setNewDescription(e.target.value)}
					/>
				</div>
				<div>
					<label htmlFor='deadline'>Deadline (YYYY-MM-DD): </label>
					<input
						type='date'
						id='deadline'
						value={newDeadline}
						onChange={(e) => setNewDeadline(e.target.value)}
						required
					/>
				</div>
				{formError && <p style={{ color: "red" }}>{formError}</p>}
				<button type='submit' disabled={isSubmitting}>
					{isSubmitting ? "Creating..." : "Create Task"}
				</button>
			</form>
		</div>
	);
};

export default TasksPage;
