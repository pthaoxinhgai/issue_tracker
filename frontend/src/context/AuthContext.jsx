import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseJwt } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                // Determine role from authorities (assuming structure like { sub: 'email', authorities: [{ authority: 'ROLE_DEVELOPER' }] })
                // Spring Security stores roles with 'ROLE_' prefix or as simple strings depending on configuration.
                // Let's assume the payload has 'role' or we extract from 'authorities'
                let role = 'GUEST';
                if (decoded.role) {
                    role = decoded.role;
                } else if (decoded.roles && decoded.roles.length > 0) {
                    role = decoded.roles[0].replace('ROLE_', '');
                } else if (decoded.authorities && decoded.authorities.length > 0) {
                    role = decoded.authorities[0].authority.replace('ROLE_', '');
                }

                setUser({
                    email: decoded.sub,
                    role: role,
                    // If we encoded id, we get it here. Otherwise backend decides by email.
                });
            } else {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = (token) => {
        const decoded = parseJwt(token);
        if (decoded) {
            let role = 'GUEST';
            if (decoded.role) role = decoded.role;
            else if (decoded.roles && decoded.roles.length > 0) role = decoded.roles[0].replace('ROLE_', '');
            else if (decoded.authorities && decoded.authorities.length > 0) role = decoded.authorities[0].authority.replace('ROLE_', '');
            
            setUser({
                email: decoded.sub,
                role: role,
            });
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, hasRole }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
