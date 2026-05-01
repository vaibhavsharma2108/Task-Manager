import { AtSign, ClipboardList, Eye, EyeClosed, KeyRound, Mail, User } from "lucide-react"
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import axios from "axios";
import { MyContext } from "../App";
import api from "../services/api";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    const {setIsAuthenticated, setBoardName: setGlobalBoard, setUser } = useContext(MyContext)

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [boardName, setBoardName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("");
    const [terms, setTerms] = useState(false);
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;

        switch (name) {
            case "fullName":
                setFullName(value);
                break;
            case "username":
                setUsername(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "confirmPassword":
                setConfirmPassword(value);
                break;
            case "terms":
                setTerms(checked);
                break;
            case "boardName":
                setBoardName(value);
                break;
        }
    }

    const registerUser = async (e) => {
        e.preventDefault();
        const passwordRegEx = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/

        if (fullName.trim() === "" || username.trim() === "" || password.trim() === "" || confirmPassword.trim() === "" || boardName.trim() === "") {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (!passwordRegEx.test(password)) {
            setErrorMessage("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Password and confirm password do not match.");
            return;
        }

        try {
            setErrorMessage(null);

            const response = await api.post("/api/auth/register", {
                name: fullName,
                username: username,
                password: password,
                boardName
            })

            if (response.data.success) {
                setIsAuthenticated(true);
                setGlobalBoard(boardName);
                setUser(response.data.user);
                navigate("/todo")
            }

            console.log(response.data)
        } catch (error) {
            setErrorMessage(error.response.data.message);
            console.log(error)
            return;
        } finally {
            setFullName("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setTerms(false);
            setBoardName("");
        }

    }

    return (
        <div className="signup-container">
            <div className="signup-card">
                {/* Left: Sign-up Form */}
                <div className="form-section">
                    <h2 className="form-title">Join Us Today!</h2>
                    <p className="form-subtitle">Create an account to get started</p>

                    <form className="signup-form" onSubmit={registerUser}>
                        <div className="input-container">
                            <User className="input-icon-user" fill="black" />
                            <input
                                type="text"
                                name="fullName"
                                value={fullName}
                                onChange={handleChange}
                                required
                                placeholder="Your Name"
                                className="form-input"
                            />
                        </div>

                        <div className="input-container">
                            <AtSign className="input-icon" />
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

                        <div className="input-container">
                            <KeyRound className="input-icon-confirm" />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                onChange={handleChange}
                                value={confirmPassword}
                                placeholder="Confirm password"
                                className="form-input"
                            />
                        </div>

                        <div className="input-container">
                            <ClipboardList className="input-icon-user"/>
                            <input
                                type="text"
                                name="boardName"
                                value={boardName}
                                onChange={handleChange}
                                required
                                placeholder="Board Name you want to join"
                                className="form-input"
                            />
                        </div>
                        <div className="checkbox-container">
                            <input type="checkbox" name="terms" id="terms" checked={terms}
                                onChange={handleChange} required className="checkbox-input" />
                            <label htmlFor="terms" className="checkbox-label">
                                I agree to all statements in <a href="#" className="terms-link">Terms of service</a>
                            </label>
                        </div>


                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        <button type="submit" className="submit-button">
                            Register
                        </button>

                    </form>

                    <p className="signin-link-text">
                        I am already a member? <Link to={"/login"} className="signin-link">Sign in</Link>
                    </p>
                </div>

                {/* Right: Image Section */}
                <div className="image-section">
                    <img src="./signup_hero_image.svg" loading="lazy" alt="Signup Illustration" className="hero-image" />
                </div>
            </div>
        </div>
    )
}

export default Register
