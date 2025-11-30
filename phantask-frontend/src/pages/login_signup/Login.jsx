import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wallpaper from '../../assets/wallpaper-1.jpg';
import Phanpy_Greet from '../../components/login_signup_components/Phanpy_Greet';
import LoginForm from '../../components/login_signup_components/LoginForm';
import ChangePassword from '../../components/login_signup_components/ChangePassword';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth()

    // State for first-login flow
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');

    // Handle successful login from LoginForm
    const handleLoginSuccess = (data, username, requirePasswordChange) => {
        // console.log("handleLoginSuccess:", { data, username, requirePasswordChange });
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("userRole", JSON.stringify(data.role));

        setUser({
            username,
            roles: data.role,
            enabled: true,
            firstLogin: requirePasswordChange,
        });

        if (requirePasswordChange) {
            setShowChangePassword(true);
            setCurrentUsername(username);
        } else {
            navigate('/');
        }
    };

    // Handle successful password change
    const handlePasswordChanged = () => {
        setShowChangePassword(false);
        navigate('/'); // Go to dashboard
    };

    return (
        <div className="max-w-screen min-h-screen overflow-x-hidden bg-cover bg-center bg-no-repeat flex justify-center items-center p-4 sm:p-8"
            style={{ backgroundImage: `url(${wallpaper})` }}>

            <main className="bg-red-900 bg-opacity-30 w-full rounded-2xl p-4 sm:p-8 backdrop-blur-sm border border-red-600 border-opacity-50 flex shadow-lg flex-col lg:flex-row lg:min-h-[90vh] gap-4 xl:gap-12">

                {/* Left Side - Welcome + Phanpy */}
                <section className="hover:scale-105 transition-transform duration-300 w-full md:max-h-44 lg:max-h-full lg:w-50 rounded-2xl flex flex-col justify-center lg:items-end p-4 sm:p-6 text-[#FFEAEA]"
                    aria-labelledby="welcome-heading">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-1 lg:flex-col">
                        <h1 id="welcome-heading"
                            className="text-4xl text-center font-extrabold p-1 md:p-2rem lg:p-r-0 whitespace-normal overflow-hidden md:border-r-4 lg:border-none font-sans max-w-full md:max-w-60 lg:max-w-full"
                            style={{ borderColor: '#FFB6B6' }}>
                            Welcome to PhanTask!
                        </h1>
                        <div className="hidden md:flex md:w-40 lg:w-full lg:flex lg:items-center lg:justify-center">
                            <Phanpy_Greet />
                        </div>
                    </div>
                </section>

                {/* Right Side - Login/ChangePassword Form */}
                <aside className="hover:scale-105 transition-transform duration-300 w-full lg:w-50 rounded-2xl flex flex-col items-center justify-center lg:items-start p-4 sm:p-6 overflow-y-auto mt-4 lg:mt-0 lg:p-2 lg:ml-4 min-h-[200px] sm:min-h-[300px]"
                    aria-label="Decorative or supplementary content">

                    {showChangePassword ? (
                        <ChangePassword
                            onPasswordChanged={handlePasswordChanged}
                            username={currentUsername}
                        />
                    ) : (
                        <LoginForm
                            onLoginSuccess={handleLoginSuccess}
                        />
                    )}
                </aside>
            </main>
        </div>
    );
};

export default Login;
