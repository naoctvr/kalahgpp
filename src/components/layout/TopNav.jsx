import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Bell,
    Menu,
    LogOut,
    User,
    ChevronDown,
    Activity,
    LayoutDashboard,
    Stethoscope,
    Newspaper,
    History,
    Calendar,
    MessageSquare,
    Database,
    X,
    Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const patientNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Konsultasi', path: '/konsultasi', icon: Calendar },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Diagnosa', path: '/diagnosa', icon: Stethoscope },
    { label: 'Riwayat', path: '/riwayat', icon: History },
    { label: 'Berita', path: '/news', icon: Newspaper },
    { label: 'Premium', path: '/pricing', icon: Zap },
];

const expertNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Konsultasi', path: '/konsultasi', icon: Calendar },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Riwayat', path: '/expert/history', icon: History },
    { label: 'Pengetahuan', path: '/expert/knowledge', icon: Database },
];

const adminNavItems = [
    { label: 'CRM Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Knowledge Base', path: '/expert/knowledge', icon: Database },
    { label: 'Sistem CRM', path: '/admin', icon: Activity },
];

const TopNav = ({ onMenuToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isExpert = user?.role === 'expert';
    const isAdmin = user?.role === 'admin';
    const navItems = isAdmin ? adminNavItems : (isExpert ? expertNavItems : patientNavItems);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <>
            <header className="h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center gap-3 shadow-sm">
                {/* Left: Logo */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
                        <Activity className="text-white w-5 h-5" />
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-base font-bold text-slate-800 tracking-tight leading-none block">RESPIRA.ID</span>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Expert System</span>
                    </div>
                </div>

        {/* Center: Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-1 overflow-x-auto flex-1 justify-center px-4 min-w-0">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0',
                                    active
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                )}
                            >
                                <item.icon className={clsx('w-4 h-4', active ? 'text-blue-600' : 'text-slate-400')} />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                        >
                            <div className={clsx(
                                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                                isExpert ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                            )}>
                                {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'US')}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                                {user?.name || 'Pengguna'}
                            </span>
                            <ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform hidden sm:block', isDropdownOpen && 'rotate-180')} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 origin-top-right"
                                >
                                    <div className="px-4 py-3 border-b border-slate-50">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { navigate(isExpert ? '/expert/profile' : '/profile'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        Pengaturan Profil
                                    </button>

                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => { navigate('/admin'); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                                        >
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            Panel Admin & CRM
                                        </button>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Buka menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Slide-down Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="fixed top-0 right-0 h-full w-[280px] bg-white z-50 md:hidden flex flex-col shadow-xl"
                            initial={{ x: 280 }}
                            animate={{ x: 0 }}
                            exit={{ x: 280 }}
                            transition={{ type: 'tween', duration: 0.25 }}
                        >
                            <div className="h-[72px] flex items-center justify-between px-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Activity className="text-white w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-800">RESPIRA.ID</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                                        isExpert ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                                    )}>
                                        {user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : 'US')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {user?.role === 'admin' ? 'Administrator' : (user?.role === 'expert' ? 'Dokter Spesialis' : 'Pasien')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={clsx(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                                active
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                            )}
                                        >
                                            <item.icon className={clsx('w-5 h-5', active ? 'text-blue-600' : 'text-slate-400')} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Keluar Sistem
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default TopNav;
