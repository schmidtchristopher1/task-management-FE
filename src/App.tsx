import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import EmployeesPage from "./pages/EmployeesPage.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import EmployeeDetailPage from "./pages/EmployeeDetailPage.tsx";
import TaskDetailPage from "./pages/TaskDetailPage.tsx";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/responsive.css";
import React from "react";

function App() {
	return <AppContent />;
}

function AppContent() {
	const [theme, setTheme] = useState(() => {
		const storedTheme = localStorage.getItem("theme");
		const systemPrefersDark =
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches;
		return storedTheme || (systemPrefersDark ? "dark" : "light");
	});

	useEffect(() => {
		localStorage.setItem("theme", theme);
		document.body.className = theme;
	}, [theme]);

	const toggleTheme = () => {
		const nextTheme = theme === "dark" ? "light" : "dark";
		setTheme(nextTheme);
	};

	return (
		<Router>
			<div className='App'>
				<nav>
					<h1>Task Management</h1>
					<ul>
						<li>
							<Link to='/'>Home</Link>
						</li>
						<li>
							<Link to='/employees'>Employees</Link>
						</li>
						<li>
							<Link to='/tasks'>Tasks</Link>
						</li>
					</ul>
					<button onClick={toggleTheme}>Toggle Theme ({theme})</button>
				</nav>

				<main>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/employees' element={<EmployeesPage />} />
						<Route path='/employees/:id' element={<EmployeeDetailPage />} />
						<Route path='/tasks' element={<TasksPage />} />
						<Route path='/tasks/:id' element={<TaskDetailPage />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
