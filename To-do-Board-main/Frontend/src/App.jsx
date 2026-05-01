import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TodoBoard from './pages/TodoBoard'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

export const MyContext = createContext();

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [boardName, setBoardName] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(()=>{
    let boardName = localStorage.getItem("boardName");
    let user = localStorage.getItem("user");

    setBoardName(boardName)
    setUser(JSON.parse(user))
  }, [])

  return (
    <MyContext.Provider value={{isAuthenticated, setIsAuthenticated, boardName, setBoardName, user, setUser}}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todo" element={<TodoBoard />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>
    </MyContext.Provider>
  )
}

export default App