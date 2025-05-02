import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../services/api';
import { Employee, Department } from '../types/models';

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEmployees = () => {
    setLoading(true);
    api.get<Employee[]>('/employees')
      .then(response => {
        setEmployees(response.data);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching employees:", err);
        setError('Failed to fetch employees. Is the backend running?');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchDepartments = () => {
    api.get<Department[]>('/departments')
      .then(response => {
        setDepartments(response.data);
      })
      .catch(err => {
        console.error("Error fetching departments:", err);
      });
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleCreateEmployee = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const newEmployeeData: Partial<Employee> & { departmentId?: number } = {
        name: newName,
        email: newEmail,
        position: newPosition,
        department: selectedDepartmentId ? departments.find(d => d.id === parseInt(selectedDepartmentId)) : undefined,
    };

    if (!newName || !newEmail || !newPosition) {
        setFormError("Name, Email, and Position are required.");
        setIsSubmitting(false);
        return;
    }

    api.post<Employee>('/employees/create', newEmployeeData)
      .then(response => {
        setEmployees(prevEmployees => [...prevEmployees, response.data]);
        setNewName('');
        setNewEmail('');
        setNewPosition('');
        setSelectedDepartmentId('');
      })
      .catch(err => {
        console.error("Error creating employee:", err);
        setFormError('Failed to create employee. Check console for details.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading && employees.length === 0) return <p>Loading employees...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Employees</h1>
      {loading && <p>Refreshing...</p>}
      {employees.length === 0 && !loading ? (
        <p>No employees found.</p>
      ) : (
        <ul>
          {employees.map(employee => (
            <li key={employee.id}>
              <Link to={`/employees/${employee.id}`}>
                {employee.name}
              </Link> ({employee.position}) - {employee.email}
              {employee.department && ` - Dept: ${employee.department.name}`}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: '2rem 0' }} />
      <h2>Create New Employee</h2>
      <form onSubmit={handleCreateEmployee}>
        <div>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            id="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="position">Position: </label>
          <input
            type="text"
            id="position"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="department">Department: </label>
          <select
            id="department"
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
          >
            <option value="">-- Select Department (Optional) --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Employee'}
        </button>
      </form>
    </div>
  );
};

export default EmployeesPage;
