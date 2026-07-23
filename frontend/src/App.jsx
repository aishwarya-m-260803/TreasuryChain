import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { ProposalsView } from './pages/dashboard/ProposalsView';
import { ProposalDetails } from './pages/dashboard/ProposalDetails';
import { VotingView } from './pages/dashboard/VotingView';
import { VotingDetails } from './pages/dashboard/VotingDetails';
import { ReserveView } from './pages/dashboard/ReserveView';
import { ExpensesView } from './pages/dashboard/ExpensesView';
import { ExpenseDetails } from './pages/dashboard/ExpenseDetails';
import { AuditLogsView } from './pages/dashboard/AuditLogsView';
import { AuditLogDetails } from './pages/dashboard/AuditLogDetails';
import { 
    HistoryView 
} from './pages/dashboard/PlaceholderViews';
import { useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toast';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

function App() {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                
                {/* Dashboard Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardOverview />} />
                    <Route path="proposals" element={<ProposalsView />} />
                    <Route path="proposals/:id" element={<ProposalDetails />} />
                    <Route path="voting" element={<VotingView />} />
                    <Route path="voting/:id" element={<VotingDetails />} />
                    <Route path="reserve" element={<ReserveView />} />
                    <Route path="expenses" element={<ExpensesView />} />
                    <Route path="expenses/:id" element={<ExpenseDetails />} />
                    <Route path="audit" element={<AuditLogsView />} />
                    <Route path="audit/:id" element={<AuditLogDetails />} />
                    <Route path="history" element={<HistoryView />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
