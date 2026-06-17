import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onMenuToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isExpert = user?.role === 'expert';

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
            <div className="flex items-center">
                <button
                    className="md:hidden mr-4 text-slate-500 p-2 hover:bg-slate-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                    onClick={onMenuToggle}
                    aria-label="Buka menu navigasi"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <nav className="hidden sm:flex text-sm text-slate-500">
                    <span className="hover:text-slate-900 cursor-pointer">Beranda</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-slate-900 capitalize">
                        {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').replace('-', ' ')}
                    </span>
                </nav>
            </div>

            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative pl-4 border-l border-slate-200" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center focus:outline-none group"
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105",
                            isExpert ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                        )}>
                            {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'US')}
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-700 hidden sm:block group-hover:text-slate-900">
                            {user?.name || 'Pengguna'}
                        </span>
                        <ChevronDown className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>

                                <button
                                    onClick={() => { navigate(isExpert ? '/expert/profile' : '/profile'); setIsDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                >
                                    <User className="w-4 h-4 mr-2 text-slate-400" />
                                    Pengaturan Profil
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Keluar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
