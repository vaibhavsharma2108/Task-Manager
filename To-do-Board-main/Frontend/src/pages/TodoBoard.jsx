
import React, { useState, useEffect, useContext } from 'react';
import UserMenu from '../components/UserMenu';
import CreateTaskModal from '../components/CreatetaskModal';
import ActivityLog from '../components/ActivityLog';
import TaskCard from '../components/TaskCard';
import '../styles/TodoBoard.css';
import api from '../services/api';
import { MyContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const TodoBoard = () => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    const [tasks, setTasks] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
    const { boardName } = useContext(MyContext)
    const navigate = useNavigate();

    const [isConflict, setIsConflict] = useState(false);
    const [isMerge, setIsMerge] = useState(false);
    const [isOverwrite, setIsOverwrite] = useState(false);
    const [existingData, setExistingData] = useState(null);
    const [update, setUpdate] = useState(null);

    const updateTask = async (title, updates) => {
        try {
            const response = await api.put("/api/task/edittask", { ...updates, title, boardName, lastUpdated: new Date(Date.now()), isMerge, isOverwrite });

            if (response.data.conflict) {
                setIsConflict(true);
                setUpdate(updates);
                setExistingData(response.data.task);
                return;
            }
        } catch (error) {
            console.log("Eror while editing: ", error)
        }
        setTasks(prev => prev.map(task => {
            if (task.title === title) {
                const updatedTask = { ...task, ...updates, timestamp: new Date() };
                return updatedTask;
            }
            return task;
        }));
    };

    const deleteTask = async (title) => {
        const task = tasks.find(t => t.title === title);
        if (task) {
            setTasks(prev => prev.filter(t => t.title !== title));
        }
        try {
            const response = await api.delete(`/api/task/deletetask?title=${title}&boardName=${boardName}`)

            if (response.data.success) {
                const task = tasks.find(t => t.title === title);
                if (task) {
                    setTasks(prev => prev.filter(t => t.title !== title));
                }
            }
        } catch (error) {
            console.log("error while deleting task: ", error);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const handleDragStart = (e, title) => {
        e.dataTransfer.setData('text/plain', title);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, status) => {
        e.preventDefault();
        const title = e.dataTransfer.getData('text/plain');
        updateTask(title, { status });
    };

    socket.on('newTask', (task) => {
        // console.log("New task received from socket:", task);
        setTasks(prev => [...prev, task]);
    });

    socket.on('updateTask', (task) => {
        console.log("Task updated from socket:", task);
        const updatedTask = tasks.map(t => t._id === task._id ? task : t);
        console.log(updateTask)
        setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    });

    socket.on('deleteTask', (title) => {
        console.log("Task deleted from socket:", title);
        setTasks(prev => prev.filter(t => t.title !== title));
    });

    socket.on('newActivityLog', (activity) => {
        console.log("New activity log received from todo board:", activity)
        setActivityLogs(prev => [activity, ...prev])
    })

    useEffect(() => {

        async function fetchTasks() {
            try {
                const response = await api.get("/api/task/gettasks");

                if (response.data.success) {
                    const existingTasks = response.data?.tasks;
                    setTasks(existingTasks)
                }

                // console.log(response.data.tasks)

            } catch (error) {
                console.log(error.response);
            }
        }

        fetchTasks()

        async function fetchLogs(board_name) {
            try {
                const response = await api.get(`/api/board/activitylogs/${board_name}`)

                setActivityLogs([...response.data.activityLogs])
            } catch (error) {
                console.log("Error fetching logs: ", error)
            }
        }

        if (boardName == null) {
            const boardName = localStorage.getItem("boardName");
            fetchLogs(boardName);
            socket.emit('joinBoard', boardName);
        } else {
            fetchLogs(boardName);
            socket.emit('joinBoard', boardName);
        }

    }, [])

    return (
        <div className="todo-board">
            <header className="board-header">
                <h1 onClick={() => navigate("/")} className="board-title">Todo Board</h1>
                <div className="header-actions">
                    <button
                        className="activity-log-btn"
                        onClick={() => setIsActivityLogOpen(!isActivityLogOpen)}
                    >
                        📊 Activity Log
                    </button>
                    <button
                        className="create-task-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Create New Task
                    </button>
                    <UserMenu />
                </div>
            </header>

            <div className="board-container">
                <div className="board-columns">
                    <div
                        className="column todo-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'todo')}
                    >
                        <div className="column-header">
                            <h2>To Do</h2>
                            <span className="task-count">{getTasksByStatus('todo').length}</span>
                        </div>
                        <div className="tasks-container">
                            {tasks.filter((task) => task.status == "todo").map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onUpdate={updateTask}
                                    onDelete={deleteTask}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                    </div>

                    <div
                        className="column inprogress-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'in-progress')}
                    >
                        <div className="column-header">
                            <h2>In Progress</h2>
                            <span className="task-count">{getTasksByStatus('in-progress').length}</span>
                        </div>
                        <div className="tasks-container">
                            {tasks.filter((task) => task.status == "in-progress").map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onUpdate={updateTask}
                                    onDelete={deleteTask}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                    </div>

                    <div
                        className="column done-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'done')}
                    >
                        <div className="column-header">
                            <h2>Done</h2>
                            <span className="task-count">{getTasksByStatus('done').length}</span>
                        </div>
                        <div className="tasks-container">
                            {tasks.filter((task) => task.status == "done").map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onUpdate={updateTask}
                                    onDelete={deleteTask}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {isActivityLogOpen && (
                    <ActivityLog
                        activityLogs={activityLogs}
                        onClose={() => setIsActivityLogOpen(false)}
                        socket={socket}
                    />
                )}
            </div>

            {isCreateModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {isConflict && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="conflict-header">
                            <h2>Conflict Detected</h2>
                            <p>This Task Was Updated by Another User</p>
                        </div>
                        <TaskCard
                            task={existingData}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                            onDragStart={handleDragStart}
                        />

                        <p className='conflict-message'>What would you like to do?</p>
                        <div className="conflict-actions">
                            <button
                                className="conflict-action-btn"
                                onClick={() => {
                                    setIsConflict(false);
                                    setIsMerge(true);
                                    updateTask(existingData.title, update);
                                }}
                            >
                                Merge
                            </button>
                            <button
                                className="conflict-action-btn"
                                onClick={() => {
                                    setIsConflict(false);
                                    setIsOverwrite(true);
                                    updateTask(existingData.title, update)
                                }}
                            >
                                Overwrite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoBoard;
