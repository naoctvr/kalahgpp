import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Stethoscope,
    MessageSquare,
    Calendar,
    User,
    History,
    Database,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const patientNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Diagnosa', path: '/diagnosa', icon: Stethoscope },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Konsultasi', path: '/konsultasi', icon: Calendar },
    { label: 'Profil', path: '/profile', icon: User },
];

const expertNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Konsultasi', path: '/konsultasi', icon: Calendar },
    { label: 'Riwayat', path: '/expert/history', icon: History },
    { label: 'Pengetahuan', path: '/expert/knowledge', icon: Database },
];

const BottomNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Navigasi utama"
        >
            <div className="flex items-stretch min-h-[56px]" />
        </nav>
    );

    const navItems = user.role === 'expert' ? expertNavItems : patientNavItems;

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Navigasi utama"
        >
            <div className="flex items-stretch min-h-[56px]">
                {navItems.map((item) => {
                    const isActive =
                        item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex flex-1 flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-1 py-2 transition-colors duration-150',
                                isActive
                                    ? 'text-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon
                                className={clsx(
                                    'w-5 h-5 shrink-0',
                                    isActive ? 'text-blue-600' : 'text-slate-400'
                                )}
                            />
                            <span
                                className={clsx(
                                    'text-[10px] font-medium leading-tight truncate max-w-full',
                                    isActive ? 'text-blue-600' : 'text-slate-400'
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
