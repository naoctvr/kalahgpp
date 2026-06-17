import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardUser from './DashboardUser';
import DashboardExpert from './DashboardExpert';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="relative">
            {/* Render Dashboard based on Role */}
            {user?.role === 'expert' ? <DashboardExpert /> : <DashboardUser />}
        </div>
    );
};

export default Dashboard;
