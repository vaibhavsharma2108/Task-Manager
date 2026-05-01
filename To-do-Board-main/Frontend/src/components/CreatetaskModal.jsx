
import React, { useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { MyContext } from '../App';

const CreateTaskModal = ({ onClose }) => {
    const [users, setUsers] = useState([])
    const { boardName } = useContext(MyContext)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedUser: '',
        priority: 'Medium',
        status: 'todo'
    });
    const [errorMessage, setErrorMessage] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.title.trim() === "") {
                setErrorMessage("Title is required")
                return;
            }

            const response = await api.post("/api/task/createtask", {
                title: formData.title,
                boardName,
                description: formData.description,
                assignedUser: formData.assignedUser,
                priority: formData.priority,
                status: formData.status
            })

            if (response.data.success) {
                onClose();
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || error.response?.data.error)
            console.log(error)
        }
    };

    const handleSmartAssign = async (e)=> {
        e.preventDefault()
        try {
            const response = await api.get('/api/auth/getsmartuser');

            if(response.data.success){
                setFormData({...formData, assignedUser: response?.data?.user})
            }
        } catch (error) {
            console.log("Error in smart assign: ", error);
        }
    }

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await api.get(`/api/auth/users/${boardName}`)

                setUsers(response.data.users)
                console.log(response.data)
            } catch (error) {
                console.log("Error fetching users: ", error)
            }
        }

        fetchUsers();
    }, [])

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Task</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label htmlFor="title">Task Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter task description"
                            rows={4}
                        />
                    </div>

                    <div className='form-row'>
                    <div className="form-group">
                        <label htmlFor="assignedUser">Assigned User</label>
                        <select
                            id="assignedUser"
                            value={formData.assignedUser}
                            onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                        >
                            <option value="">Select</option>
                            {users.map((user, index) => (
                                <option key={index} value={user._id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleSmartAssign} className='smart-assign'>Smart Assign</button>
                    </div>
                    <div className="form-row">

                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Initial Status</label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    {errorMessage && <p className='errorMessage'>{errorMessage}</p>}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="create-btn">
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
