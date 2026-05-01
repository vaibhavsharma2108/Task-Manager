
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import { MyContext } from '../App';
import api from '../services/api';

const Home = () => {
    const [typedText, setTypedText] = useState('');
    const [subtitleText, setSubtitleText] = useState('');
    const fullText = 'Cross-Border Collaboration made simple';
    const subtitle = 'Organize your work, boost productivity, achieve your goals';
    const { isAuthenticated } = useContext(MyContext)
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('')
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const createBoard = async (e) => {
        e.preventDefault();
        if (newBoardName.trim() === '') {
            setErrorMessage("Please enter a board name");
            return;
        }
        try {
            const response = await api.post('/api/board/createboard', {
                boardName: newBoardName,
            });

            if (response.data.success) {
                setErrorMessage(null);
                setSuccessMessage("Board created successfully");
                setTimeout(() => {
                    setIsCreatingBoard(false);
                    setSuccessMessage(null);
                }, 3000);
            }
        } catch (error) {
            console.error("Error creating board:", error);
            setErrorMessage(error?.response?.data?.error || "Failed to create board");
        }
    };

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    let subtitleIndex = 0;
                    const subtitleInterval = setInterval(() => {
                        if (subtitleIndex <= subtitle.length) {
                            setSubtitleText(subtitle.slice(0, subtitleIndex));
                            subtitleIndex++;
                        } else {
                            clearInterval(subtitleInterval);
                        }
                    }, 50);
                }, 500);
            }
        }, 80);

        return () => clearInterval(typingInterval);
    }, []);

    return (
        <div>
            <nav className="home-nav">
                <div className="nav-brand">TaskBoard</div>
                <div className="nav-links">
                    <button onClick={() => setIsCreatingBoard(true)} className='nav-link'>+ Create Board</button>
                    <Link to="/login" className="nav-link">Login</Link>
                </div>
            </nav>
            <div className='hero-section'>
                <div className='hero-section-left'>
                    <h1 className="hero-title">
                        {typedText}<span className="cursor">|</span>
                    </h1>
                    <p className="hero-subtitle">
                        {subtitleText}<span className="subtitle-cursor">|</span>
                    </p>

                    <div className="hero-buttons">
                        <Link to={isAuthenticated ? "/todo" : "/login"} className="hero-button primary">
                            Start Managing Tasks
                        </Link>
                        <Link to="/register" className="hero-button secondary">
                            Create Account
                        </Link>
                    </div>
                </div>
                <div className='hero-section-left-bg'></div>
                <div className='hero-image-bg'></div>
                <div className='hero-section-right'>
                    <img className='hero-image' src="/todo.png" alt="Hero Image" />
                </div>
            </div>

            {isCreatingBoard && (<>
                <div className='create-board-modal-overlay' onClick={() => setIsCreatingBoard(false)}></div>
                <form onSubmit={createBoard} className="create-board-modal">
                    <h2 className='create-board-heading'>Create a New Board</h2>
                    <input
                        className='create-board-input'
                        type="text"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)}
                        placeholder="Board Name"
                    />
                    {errorMessage && <p className='error-message'>{errorMessage}</p>}
                    {successMessage && <p className='success-message'>{successMessage}</p>}
                    <div className='create-board-actions'>
                        <button type="submit" className='create-board-button'>Create Board</button>
                        <button className='create-board-cancel-button' onClick={() => setIsCreatingBoard(false)}>Cancel</button>
                    </div>
                </form>
            </>
            )}
        </div>
    );
};

export default Home;
