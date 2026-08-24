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
    Shield,
    Banknote
} from 'lucide-react';
import { Button } from '../ui/button';

export function Sidebar() {
    const { logout } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { path: '/dashboard/proposals', label: 'Proposals', icon: FileText },
        { path: '/dashboard/funding', label: 'Funding', icon: Banknote },
        { path: '/dashboard/funding-history', label: 'Funding History', icon: History },
        { path: '/dashboard/voting', label: 'Voting', icon: Vote },
        { path: '/dashboard/reserve', label: 'Treasury Reserve', icon: Landmark },
        { path: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
        { path: '/dashboard/audit', label: 'Audit Logs', icon: ShieldCheck },
        { path: '/dashboard/history', label: 'Proposal History', icon: History },
    ];

    return (
        <aside className="w-64 border-r border-[#2A2A2A] bg-[#0D0D0D] backdrop-blur-xl h-screen sticky top-0 flex flex-col z-40 select-none">
            <div className="p-6 flex items-center gap-3 border-b border-[#2A2A2A]">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-base font-bold text-[#F5F5F5] tracking-tight">TreasuryChain</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-[#C1121F]/15 text-[#F5F5F5] border border-[#C1121F]/40 shadow-[0_0_15px_rgba(193,18,31,0.2)]'
                                        : 'text-[#A8A8A8] hover:bg-[#171717] hover:text-[#F5F5F5] border border-transparent'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-[#2A2A2A]">
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 border-[#2A2A2A] hover:bg-[#C1121F]/10 hover:text-[#F5F5F5] hover:border-[#C1121F]/30 text-[#A8A8A8]"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
