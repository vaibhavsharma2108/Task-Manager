import { Eye, EyeClosed, KeyRound, User2 } from "lucide-react"
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import axios from "axios";
import { MyContext } from "../App";
import api from "../services/api";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const { setIsAuthenticated, setBoardName, setUser } = useContext(MyContext)

    const [errorMessage, setErrorMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;

        switch (name) {
            case "username":
                setUsername(value);
                break;
            case "password":
                setPassword(value);
                break;
        }
    }

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            if(!username || !password){
                setErrorMessage("All fields are required!");
                return;
            }

            const response = await api.post("/api/auth/login", {
                username, 
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if(response.data.success){
                localStorage.setItem("boardName", response?.data?.user.board.boardName)
                localStorage.setItem("user", JSON.stringify(response?.data?.user))
                setIsAuthenticated(true);
                setBoardName(response?.data?.user?.board?.boardName)
                setUser(response?.data?.user)
                navigate("/todo")
            }

            console.log(response?.data)

        } catch (error) {
            setErrorMessage(error.response?.data.message);
            console.log(error)
        }
    }

    return (
        <div className="signin-container">
            <div className="signin-card">
                {/* Left: Image Section */}
                <div className="image-section">
                    <img src="./signin_hero_image.svg" loading="lazy" alt="SignIn Illustration" className="hero-image" />
                </div>

                {/* Right: Sign-up Form */}
                <div className="form-section">
                    <h2 className="form-title">Welcome Back!</h2>
                    <p className="form-subtitle">Login to continue your journey </p>

                    <form className="signin-form" onSubmit={loginUser}>
                        <div className="input-container">
                            <User2 className="input-icon" fill="black" color="white" />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={handleChange}
                                required
                                placeholder="Your Username"
                                className="form-input"
                            />
                        </div>

                        <div className="input-container">
                            <KeyRound className="input-icon-password" color="white" fill="black" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                required
                                onChange={handleChange}
                                value={password}
                                className="form-input"
                            />
                            {showPassword ? (
                                <Eye className="eye-icon" onClick={() => setShowPassword(false)} />
                            ) : (
                                <EyeClosed className="eye-icon" onClick={() => setShowPassword(true)} />
                            )}
                        </div>

                        {errorMessage && <p className="error-message">{errorMessage}</p>}


                        <button type="submit" className="submit-button">
                            Login
                        </button>

                    </form>

                    <p className="signup-link-text">
                        New here? <Link to={"/register"} className="signup-link">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login

