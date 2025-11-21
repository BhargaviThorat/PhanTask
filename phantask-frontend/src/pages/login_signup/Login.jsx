import React, { useEffect, useState } from 'react';
import wallpaper from '../../assets/wallpaper-1.jpg';
import Phanpy_Greet from '../../components/login_signup_components/Phanpy_Greet';
import LoginForm from '../../components/login_signup_components/LoginForm';

const Login = () => {


    return (
        <div
            className="max-w-screen min-h-screen overflow-x-hidden bg-cover bg-center bg-no-repeat flex justify-center items-center p-4 sm:p-8"
            style={{ backgroundImage: `url(${wallpaper})` }}
        >
            <main
                className="bg-red-900 bg-opacity-35 w-full rounded-2xl p-4 sm:p-8 backdrop-blur-lg border border-red-600 border-opacity-50 flex shadow-lg flex-col lg:flex-row"
            >
                {/* First Section - Welcome + Phanpy */}
                <section
                    className="w-full lg:w-[50%] rounded-2xl flex flex-col justify-center items-center p-4 sm:p-6 text-[#FFEAEA]"
                    aria-labelledby="welcome-heading"
                >
                    <div className="hover:scale-105 transition-transform duration-300 flex flex-col md:flex-row items-center justify-center gap-1 w-full lg:flex-col">
                        <h1
                            id="welcome-heading"
                            className="text-xl sm:text-2xl md:text-4xl text-center font-extrabold p-1 whitespace-normal overflow-hidden md:border-r-4 lg:border-none font-sans max-w-full md:max-w-[60%] lg:max-w-full"
                            style={{ borderColor: '#FFB6B6' }}
                        >
                            Welcome to PhanTask!
                        </h1>


                        <div className="hidden md:flex md:w-[40%] lg:w-full lg:flex lg:items-center lg:justify-center">
                            <Phanpy_Greet />
                        </div>
                    </div>
                </section>


                {/* Second Section - Aside */}
                <aside
                    className="w-full lg:w-[50%] rounded-2xl  flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto mt-4 lg:mt-0 lg:p-2 lg:ml-4 min-h-[200px] sm:min-h-[300px]"
                    aria-label="Decorative or supplementary content"
                >
                    <LoginForm />
                </aside>
            </main>
        </div>
    );
};

export default Login;