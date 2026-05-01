
import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../App';

const UserMenu = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const {setIsAuthenticated, setUser, user} = useContext(MyContext)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const response = await api.get('/api/auth/logout')

            if(response.data.success){
                localStorage.clear();
                setIsAuthenticated(false);
                setUser(null)
                navigate("/")
            }
        } catch (error) {
            console.log("Error while logging out: ", error);
        }
    }

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-icon-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="user-avatar">
                    {user?.name.charAt(0).toUpperCase()}
                </div>
            </button>

            {isOpen && (
                <div className="user-dropdown">
                    <div className="user-info">
                        <div className="user-avatar-large">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-email">@{user?.username}</span>
                        </div>
                    </div>
                    <div className="menu-divider"></div>
                    <ul className="menu-items">
                        <li><a onClick={handleLogout} href="#" className="logout-item">🚪 Logout</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
