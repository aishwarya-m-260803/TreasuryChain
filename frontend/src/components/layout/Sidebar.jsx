import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    Vote, 
    Landmark, 
    Receipt, 
    ShieldCheck, 
    History,
    LogOut,
    Shield
} from 'lucide-react';
import { Button } from '../ui/button';

export function Sidebar() {
    const { logout } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { path: '/dashboard/proposals', label: 'Proposals', icon: FileText },
        { path: '/dashboard/voting', label: 'Voting', icon: Vote },
        { path: '/dashboard/reserve', label: 'Treasury Reserve', icon: Landmark },
        { path: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
        { path: '/dashboard/audit', label: 'Audit Logs', icon: ShieldCheck },
        { path: '/dashboard/history', label: 'Proposal History', icon: History },
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-slate-950/60 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-40">
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-sm font-bold text-white tracking-wide">TreasuryChain</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary/20 text-primary font-medium border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]'
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-white/5">
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 border-white/10 hover:bg-white/5 hover:text-white text-muted-foreground"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
