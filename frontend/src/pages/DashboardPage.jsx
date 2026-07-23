import React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { GlowBackground, NoiseOverlay } from '../components/background/Backgrounds';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <LazyMotion features={domAnimation}>
            <PageWrapper>
                <GlowBackground />
                <NoiseOverlay />
                
                <div className="flex min-h-screen">
                    <Sidebar />
                    
                    <main className="flex-1 overflow-x-hidden relative">
                        {/* Nested routes will render here */}
                        <div className="p-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </PageWrapper>
        </LazyMotion>
    );
}
