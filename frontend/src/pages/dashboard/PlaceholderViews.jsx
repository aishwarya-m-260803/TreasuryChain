import React from 'react';
import { GlassCard } from '../../components/ui/card';
import { SectionTitle } from '../../components/typography/Typography';
import { Hammer, FileSearch, ShieldCheck, Landmark, Receipt } from 'lucide-react';

function PlaceholderView({ title, description, icon: Icon }) {
    return (
        <div className="h-full min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
            <GlassCard className="p-12 text-center max-w-lg border-dashed">
                <div className="flex flex-col items-center justify-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-6">
                        <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <SectionTitle className="text-2xl mb-3">{title}</SectionTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                        <br /><br />
                        This module is scheduled for implementation in the next milestone.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}

export function HistoryView() {
    return <PlaceholderView 
        title="Proposal History" 
        description="Trace the complete lifecycle of a proposal from creation to final execution." 
        icon={FileSearch} 
    />;
}
