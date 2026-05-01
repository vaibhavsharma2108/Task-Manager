
import React, { useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { MyContext } from '../App';

const TaskCard = ({ task, onUpdate, onDelete, onDragStart }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([])
  const { boardName } = useContext(MyContext)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    assignedUser: task.assignedUser,
    priority: task.priority
  });

  const priorityColors = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444'
  };

  const handleEdit = () => {
    if (isEditing) {
      onUpdate(task.title, editData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      assignedUser: task.assignedUser,
      priority: task.priority
    });
    setIsEditing(false);
  };

  const formatTime = (date) => {

    const nd = new Date(date)
    return nd.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }, { hour: '2-digit', minute: '2-digit' });
  };

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
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.title)}
    >
      <div className="task-header">
        <div
          className="priority-indicator"
          style={{ backgroundColor: priorityColors[task.priority] }}
        >
          {task.priority?.toUpperCase()}
        </div>
        <div className="task-actions">
          <button
            className="edit-btn"
            onClick={handleEdit}
          >
            {isEditing ? '✓' : '✏️'}
          </button>
          {isEditing && (
            <button
              className="cancel-btn"
              onClick={handleCancel}
            >
              ✕
            </button>
          )}
          <button
            className="delete-btn"
            onClick={() => onDelete(task.title)}
          >
            🗑️
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editData.title}
            disabled
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="edit-title"
            placeholder="Task title"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="edit-description"
            placeholder="Task description"
            rows={3}
          />
          <select
            id="assignedUser"
            value={editData.assignedUser}
            onChange={(e) => setEditData({ ...editData, assignedUser: e.target.value })}
            className="edit-user"
            placeholder="Assigned user"
          >
            {users.map((user, index) => (
              <option key={index} value={user._id}>{user.name}</option>
            ))}
          </select>
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
            className="edit-priority"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>
      ) : (
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          <p className="task-description">{task.description}</p>
          <div className="task-meta">
            <div className="assigned-user">
              <span className="user-icon">👤</span>
              {task.assignedUser.name}
            </div>
            <div className="task-status">{task.status.replace('inprogress', 'In Progress')}</div>
          </div>
          <div className="task-timestamp">
            <span className="timestamp-icon">🕒</span>
            <span className="timestamp-text">{formatTime(task.createdAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
