import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarExpert from './SidebarExpert';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

const AppShell = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isChatPage = location.pathname === '/chat';

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-inter">
            {/* Top Navigation — desktop only */}
            <TopNav
                onMenuToggle={() => setIsMobileSidebarOpen(true)}
            />

            {/* Mobile Sidebar Overlay */}
            {user?.role === 'expert' ? (
                <SidebarExpert
                    isOpen={isMobileSidebarOpen}
                    onClose={() => setIsMobileSidebarOpen(false)}
                />
            ) : (
                <Sidebar
                    isOpen={isMobileSidebarOpen}
                    onClose={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {isChatPage ? (
                    <main className="h-full overflow-hidden pb-[72px] md:pb-0">
                        {children}
                    </main>
                ) : (
                    <main className="h-full overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-24 md:pb-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                )}
            </div>

            {/* Bottom Navigation — mobile only */}
            <BottomNav />
        </div>
    );
};

export default AppShell;
