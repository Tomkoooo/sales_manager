"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { useUserContext } from '@/components/context/useUser'; // Update the import path if needed
import Link from "next/link";
const LoginPage: React.FC = () => {

    const { user, setUser } = useUserContext();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username || !password) {
            toast.error('Adj meg minden adatot.');
            return;
        }

        try {
            const response = await toast.promise(
                axios.post("/api/authentication/login/", {
                    usernameOrEmail: username,
                    password,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }),
                {
                    loading: ('Bejelentkezés...'),
                    success: ('Sikeres bejelentkezés.'),
                    error: (error) => {
                        if (error.response && error.response.status === 401) {
                            return 'Hibás felhasználónév vagy jelszó.';
                        }
                        setPassword(""); // Clear password on error
                        return error.message;                
                    },
                }
            );

            const { token, ...userData } = response.data;

            if (token) {
                localStorage.setItem("token", token); // Store token in local storage
                setUser(userData); // Set user data in context
                router.push("/"); // Redirect to the home page
            }
        } catch (error) {
            console.error("Error in catch block:", error);
            toast.error('hibás adatok');
        }
    };

    // Redirect to home if user is logged in
    useEffect(() => {
        if (user) {
            router.push("/"); // Redirect to the home page if user exists
        }
    }, [user, router]);

    return (
        <div className="relative w-96 mx-auto mt-10">
            <div className="card h-auto flex flex-col bg-amber-200/25 rounded-xl overflow-hidden shadow-lg nohover">
                <div className="card-body p-4">
                <h2 className="card-title text-xl font-bold text-center mb-4 w-full flex justify-between">
                        <Image
                            src="./image.svg"
                            width={48}
                            height={48}
                            alt="Logo"
                            className=" w-24 h-16 rounded-full bg-white p-2 shadow-lg"
                        />
                        Eladás Figyelő Rendszer
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <label className="input input-bordered flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="h-4 w-4 opacity-70 text-black"
                                >
                                    <path
                                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Felhasználónév"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="h-4 w-4 opacity-70 text-black"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <input
                                    type="password"
                                    className="grow"
                                    placeholder="Jelszó"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="w-full flex justify-center">
                            <button type="submit" className="btn btn-primary mt-4">
                                Bejelentkezés
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;