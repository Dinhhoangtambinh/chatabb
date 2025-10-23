import React, {useEffect, useState} from 'react';
import { Navigate } from 'react-router-dom';

// Pages
import SplashScreen from '../pages/SplashScreen';

// Api
import usersApi from "../services/usersApi";
import authApi from '../services/authentication';

export default function ProtectedRoute({children}) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                setIsAuth(false);
                setLoading(false);
                return;
            }

            try {
                const currentUser = await authApi.getCurrentUser(token);
                localStorage.setItem('userId', currentUser.data.id);
                setIsAuth(true);
            } catch (error) {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <SplashScreen />;
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
}