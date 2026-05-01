#  Todo Board

A collaborative task management web application designed for teams to organize, assign, and track tasks in real-time. Built with a modern tech stack, Todo Board supports cross-border collaboration, smart user assignment, and robust conflict handling for seamless teamwork.

---

## Project Overview

Todo Board enables users to:
- Register and join boards
- Create, edit, and delete tasks
- Assign tasks to users
- Track activity logs
- Collaborate in real-time with live updates
- Handle concurrent edits with conflict resolution
- Use "Smart Assign" to balance workload among users

---

## Tech Stack

**Frontend:**
- React
- Vite
- Axios
- React Router DOM
- Lucide React (icons)
- Socket.io-client

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- cookie-parser

---

##  Setup & Installation

### 1. Clone the Repository

```sh
git clone https://github.com/jayant-dixit/To-do-Board.git
cd todo-board
```

### 2. Backend Setup
```
cd Backend
```
**Create your .env file inside Backend directory with** 
- FRONTEND_URL
- PORT = 3000
- MONGO_URI 
- JWT_SECRET, 
- FRONTEND_URL

```
npm install
npm run dev
```
#### Starts backend on http://localhost:3000

### 3. Frontend Setup
In a new Terminal
```
cd Frontend
```

**Create your .env file inside Frontend directory with** 
- VITE_BACKEND_URL

```
npm install
npm run dev
```
#### Starts frontend on http://localhost:5173

## Features & Usage Guide

### User Authentication

- Register: Create an account and join a board.
- Login: Access your board and tasks.
---
### Board & Task Management
- Create Board: From the home page, create a new board for your team.
- Create Task: Add tasks, assign users, set priority and status.
- Edit/Delete Task: Update or remove tasks as needed.
- Drag & Drop: Move tasks between columns (To Do, In Progress, Done).

---
### Real-Time Collaboration
- All changes (task creation, updates, deletions) are instantly reflected for all users on the same board via **Socket.io**.
---

### Activity Log
- View a chronological log of all actions performed on the board.

---
### Smart Assign

- Assigns a new task to the user with the least active (To Do/In Progress) tasks, balancing workload automatically.

---
### Conflict Handling
- If two users edit the same task simultaneously, the app detects the conflict and prompts the user to Merge (combine descriptions) or Overwrite (replace with your changes).
---
### Smart Assign Logic
Implemented in getSmartUser:

- Fetches all users and their assigned tasks.
- Counts only active tasks (todo or in-progress).
- Returns the user with the fewest active tasks for assignment.

**Usage:**

When creating a task, click "Smart Assign" to auto-select the optimal user.

---
### Conflict Handling Logic
Implemented in editTask:

- When editing a task, the backend checks if the task was updated after the user's last fetch.
- If a conflict is detected:
  - The frontend displays a modal with options:
    - **Merge**: Combines both users' descriptions using resolveConflict.
    - **Overwrite**: Applies your changes, replacing the other user's edits.


- Ensures no data is lost and users are aware of concurrent modifications.

---

## Live Demo

- Website : https://todoboard-phi.vercel.app/
- Demo Video: https://drive.google.com/file/d/1ifYvFi_3B3LZnU4JB_BaOkpr-OacoiAb/view?usp=sharing

