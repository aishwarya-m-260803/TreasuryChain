import React, { useState, useEffect } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { toast } from 'sonner';
import { Toaster } from './components/ui/toast';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table';
import { Modal } from './components/ui/modal';
import { 
  Shield, 
  Plus, 
  Eye, 
  Send, 
  ArrowRight, 
  Lock, 
  Cpu, 
  Shuffle, 
  Coins, 
  ShieldCheck, 
  FileSearch, 
  Users, 
  CheckCircle2,
  Layers,
  Activity,
  FileCode,
  Box,
  Database,
  Network,
  Vote,
  BookOpen
} from 'lucide-react';

// Layout & Animation imports
import { Container } from './components/layout/Container';
import { Section } from './components/layout/Section';
import { SectionHeading } from './components/layout/SectionHeading';
import { Grid } from './components/layout/Grid';
import { Stack } from './components/layout/Stack';
import { PageWrapper } from './components/layout/PageWrapper';
import { AnimatedSection } from './components/layout/AnimatedSection';
import { FlexLayout } from './components/layout/FlexLayout';
import { CursorGlow } from './components/layout/CursorGlow';

// Typography
import { HeroTitle, PageTitle, SectionTitle, SectionSubtitle, BodyText, MutedText, Caption } from './components/typography/Typography';

// Backgrounds
import { AnimatedGradientBlob, GlowBackground, NoiseOverlay, GridBackground, RadialGradient } from './components/background/Backgrounds';

// Animations
import { FadeIn, SlideUp, ScaleIn, RevealOnScroll, StaggerContainer, AnimatedCounter, HoverLift, HoverGlow } from './components/animation/Animations';

// Navigation
import { NavGroup, NavItem, AnimatedUnderline, ActiveIndicator } from './components/navigation/Navigation';

// Card Effects
import { GlassCardHover, GlowCard, FloatingCard, InteractiveCard, HoverBorder } from './components/cards/CardEffects';

// Utilities
import { Divider, GradientDivider, SectionSpacer, StatusIndicator } from './components/utility/Utilities';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState('PLATFORM');
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll positioning to dynamic-resize navbar padding/blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToast = (type) => {
    switch (type) {
      case 'success':
        toast.success('Transaction Completed', {
          description: 'Proposal P003 has been successfully approved.',
        });
        break;
      case 'error':
        toast.error('Transaction Failed', {
          description: '2 UNKNOWN: evaluate call to endorser returned error.',
        });
        break;
      case 'warning':
        toast.warning('Pending Signatures', {
          description: 'Proposal P003 requires 3 more peer approvals.',
        });
        break;
      default:
        toast.info('Audit Log Updated', {
          description: 'View the latest audit transactions in the ledger history.',
        });
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setInputError('Amount cannot be empty');
    } else {
      setInputError('');
      toast.success(`Registered proposal amount: $${inputValue}`);
      setIsModalOpen(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <PageWrapper className="relative overflow-hidden min-h-screen">
      {/* Background layers */}
      <CursorGlow />
      <NoiseOverlay opacity="opacity-[0.015]" />
      <GridBackground opacity="opacity-[0.03]" />
      <RadialGradient stops="85%" />
      
      {/* Three Animated Gradient Blobs */}
      <AnimatedGradientBlob color="rgba(16, 185, 129, 0.06)" size="450px" className="top-10 -left-20" />
      <AnimatedGradientBlob color="rgba(99, 102, 241, 0.08)" size="550px" className="top-[25%] -right-20" delay={4} />
      <AnimatedGradientBlob color="rgba(245, 158, 11, 0.04)" size="400px" className="bottom-[20%] left-[10%]" delay={8} />

      <Toaster />

      {/* 1. Floating Glass Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "py-3 bg-slate-950/60 backdrop-blur-md border-b border-white/5 shadow-glass-md" 
            : "py-5 bg-transparent"
        }`}
      >
        <Container>
          <FlexLayout justify="between" align="center" className="w-full">
            <FlexLayout gap={2.5} align="center" className="select-none">
              <Shield className="h-5 w-5 text-primary" />
              <SectionTitle className="text-base font-bold tracking-tight text-white m-0">
                TreasuryChain
              </SectionTitle>
            </FlexLayout>

            <NavGroup className="border-0 pb-0 hidden md:flex">
              {['PLATFORM', 'ARCHITECTURE', 'FEATURES', 'DOCS'].map((tab) => (
                <NavItem 
                  key={tab} 
                  active={activeTab === tab} 
                  onClick={() => {
                    setActiveTab(tab);
                    const targetEl = document.getElementById(tab.toLowerCase());
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  {tab}
                  {activeTab === tab && <AnimatedUnderline />}
                </NavItem>
              ))}
            </NavGroup>

            <FlexLayout gap={4} align="center">
              <StatusIndicator status="success" label="Active" className="hidden lg:flex" />
              <Button variant="glass" onClick={() => setIsModalOpen(true)} className="h-9 text-xs px-4">
                Sign In
              </Button>
            </FlexLayout>
          </FlexLayout>
        </Container>
      </header>

      {/* 2. Hero Section */}
      <Section id="platform" className="pt-32 pb-24 relative md:pt-40">
        <Container>
          <SlideUp>
            <Stack spacing="lg" align="center" className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-white/5 mb-2 shadow-glow-primary select-none">
                <ShieldCheck className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest text-primary-foreground/80 uppercase">
                  Hyperledger Fabric v2.5 Committed
                </span>
              </div>
              
              <HeroTitle className="max-w-4xl mx-auto tracking-tight select-none">
                Secure Treasury Decisions, <br />
                <span className="text-gradient">Powered by Consensus.</span>
              </HeroTitle>

              <SectionSubtitle className="max-w-2xl mx-auto text-muted-foreground/90 font-normal">
                TreasuryChain enables organizations to collaboratively approve treasury proposals, maintain an immutable audit trail, and securely manage reserve funds using Hyperledger Fabric.
              </SectionSubtitle>

              <FlexLayout gap={4} justify="center">
                <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2 px-5 py-2.5">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="glass" 
                  onClick={() => {
                    const targetEl = document.getElementById('architecture');
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5"
                >
                  Explore Architecture
                </Button>
              </FlexLayout>
            </Stack>
          </SlideUp>
        </Container>
      </Section>

      <GradientDivider />

      {/* 3. Participating Organizations Section */}
      <Section className="bg-slate-950/10">
        <Container>
          <RevealOnScroll>
            <SectionHeading 
              tag="Committee Nodes" 
              title="Participating Organizations" 
              description="Every organization runs network nodes that participate in proposal submission, validation, endorsement, and audit tracking."
            />
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <Grid cols={4} gap="md" colsMd={2} colsSm={1}>
              <GlassCardHover className="p-6 flex flex-col justify-between h-56">
                <FlexLayout justify="between" align="center">
                  <Coins className="h-8 w-8 text-primary" />
                  <Badge variant="default">FinanceMSP</Badge>
                </FlexLayout>
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Finance Department</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">Drafts spending proposals and allocates budget parameters.</BodyText>
                </Stack>
              </GlassCardHover>

              <GlassCardHover className="p-6 flex flex-col justify-between h-56">
                <FlexLayout justify="between" align="center">
                  <ShieldCheck className="h-8 w-8 text-success" />
                  <Badge variant="success">TrusteeMSP</Badge>
                </FlexLayout>
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Trustee Committee</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">Issues final authorization signatures to meet consensus rules.</BodyText>
                </Stack>
              </GlassCardHover>

              <GlassCardHover className="p-6 flex flex-col justify-between h-56">
                <FlexLayout justify="between" align="center">
                  <FileSearch className="h-8 w-8 text-warning" />
                  <Badge variant="warning">AuditMSP</Badge>
                </FlexLayout>
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Audit Authorities</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">Verifies proposal compliance and queries transaction logs.</BodyText>
                </Stack>
              </GlassCardHover>

              <GlassCardHover className="p-6 flex flex-col justify-between h-56">
                <FlexLayout justify="between" align="center">
                  <Users className="h-8 w-8 text-accent" />
                  <Badge variant="secondary">OperationsMSP</Badge>
                </FlexLayout>
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Operations Management</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">Initiates day-to-day asset requests and tracks logs.</BodyText>
                </Stack>
              </GlassCardHover>
            </Grid>
          </RevealOnScroll>
        </Container>
      </Section>

      <Divider />

      {/* 4. Features Section */}
      <Section id="features" className="bg-slate-950/20">
        <Container>
          <RevealOnScroll>
            <SectionHeading 
              tag="Capabilities" 
              title="Product Capabilities" 
              description="A secure framework implementing consensus validation rules directly at the smart contract level."
            />
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <Grid cols={4} gap="md" colsMd={2} colsSm={1}>
              <HoverBorder className="h-full">
                <div className="p-6 h-full flex flex-col justify-between gap-4">
                  <Coins className="h-8 w-8 text-primary shrink-0" />
                  <Stack spacing="xs">
                    <SectionTitle className="text-sm text-white">Proposal Governance</SectionTitle>
                    <BodyText className="text-xs text-muted-foreground">
                      Create, review, and manage treasury proposals through a structured approval workflow.
                    </BodyText>
                  </Stack>
                </div>
              </HoverBorder>

              <HoverBorder className="h-full">
                <div className="p-6 h-full flex flex-col justify-between gap-4">
                  <Shuffle className="h-8 w-8 text-success shrink-0" />
                  <Stack spacing="xs">
                    <SectionTitle className="text-sm text-white">Multi-Organization Consensus</SectionTitle>
                    <BodyText className="text-xs text-muted-foreground">
                      Treasury actions require approval from participating organizations before execution.
                    </BodyText>
                  </Stack>
                </div>
              </HoverBorder>

              <HoverBorder className="h-full">
                <div className="p-6 h-full flex flex-col justify-between gap-4">
                  <Lock className="h-8 w-8 text-warning shrink-0" />
                  <Stack spacing="xs">
                    <SectionTitle className="text-sm text-white">Immutable Audit Trail</SectionTitle>
                    <BodyText className="text-xs text-muted-foreground">
                      Every proposal, vote, and reserve update is permanently recorded on the blockchain.
                    </BodyText>
                  </Stack>
                </div>
              </HoverBorder>

              <HoverBorder className="h-full">
                <div className="p-6 h-full flex flex-col justify-between gap-4">
                  <Cpu className="h-8 w-8 text-accent shrink-0" />
                  <Stack spacing="xs">
                    <SectionTitle className="text-sm text-white">Secure Reserve Management</SectionTitle>
                    <BodyText className="text-xs text-muted-foreground">
                      Maintain treasury reserves with transparent and verifiable fund tracking.
                    </BodyText>
                  </Stack>
                </div>
              </HoverBorder>
            </Grid>
          </RevealOnScroll>
        </Container>
      </Section>

      <Divider />

      {/* 5. Interactive Architecture Section */}
      <Section id="architecture" className="bg-slate-950/10">
        <Container>
          <RevealOnScroll>
            <SectionHeading 
              tag="System Design" 
              title="How TreasuryChain Works" 
              description="User requests flow from the React frontend through an Express.js API server, which connects to the Hyperledger Fabric network via the Fabric Gateway SDK. Approved proposals invoke chaincode that updates the ledger's world state."
            />
          </RevealOnScroll>

          {/* Vertical Timeline Wrapper */}
          <div className="relative max-w-2xl mx-auto flex flex-col gap-12 mt-16 select-none">
            {/* Scroll-animated central line */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-white/5 -translate-x-1/2 -z-10" />
            <m.div 
              className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-primary via-accent to-success -translate-x-1/2 -z-10 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Node 1: React Frontend */}
            <RevealOnScroll className="flex flex-col md:flex-row md:justify-start items-start md:items-center relative w-full pl-16 md:pl-0">
              <div className="absolute left-6 md:left-1/2 top-1.5 md:top-auto h-3.5 w-3.5 rounded-full border-2 border-primary bg-slate-950 -translate-x-1/2 shadow-glow-primary flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <GlassCard className="w-full md:w-[45%] p-6">
                <FlexLayout gap={3} align="center" className="mb-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <SectionTitle className="text-sm font-bold text-white">1. React Frontend</SectionTitle>
                </FlexLayout>
                <BodyText className="text-xs text-muted-foreground">
                  Users submit proposals, cast votes, and view audit logs through a React-based dashboard.
                </BodyText>
              </GlassCard>
            </RevealOnScroll>

            {/* Node 2: Express Backend */}
            <RevealOnScroll className="flex flex-col md:flex-row md:justify-end items-start md:items-center relative w-full pl-16 md:pl-0">
              <div className="absolute left-6 md:left-1/2 top-1.5 md:top-auto h-3.5 w-3.5 rounded-full border-2 border-primary bg-slate-950 -translate-x-1/2 shadow-glow-primary flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <GlassCard className="w-full md:w-[45%] p-6">
                <FlexLayout gap={3} align="center" className="mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <SectionTitle className="text-sm font-bold text-white">2. Express.js API</SectionTitle>
                </FlexLayout>
                <BodyText className="text-xs text-muted-foreground">
                  Validates request parameters and routes API calls to the Fabric network using enrolled identities.
                </BodyText>
              </GlassCard>
            </RevealOnScroll>

            {/* Node 3: Fabric Gateway */}
            <RevealOnScroll className="flex flex-col md:flex-row md:justify-start items-start md:items-center relative w-full pl-16 md:pl-0">
              <div className="absolute left-6 md:left-1/2 top-1.5 md:top-auto h-3.5 w-3.5 rounded-full border-2 border-accent bg-slate-950 -translate-x-1/2 shadow-glow-primary flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <GlassCard className="w-full md:w-[45%] p-6">
                <FlexLayout gap={3} align="center" className="mb-2">
                  <Box className="h-5 w-5 text-accent" />
                  <SectionTitle className="text-sm font-bold text-white">3. Fabric Gateway SDK</SectionTitle>
                </FlexLayout>
                <BodyText className="text-xs text-muted-foreground">
                  Establishes gRPC connections to peer nodes using TLS certificates and submits transactions to the channel.
                </BodyText>
              </GlassCard>
            </RevealOnScroll>

            {/* Node 4: Hyperledger Fabric Chaincode */}
            <RevealOnScroll className="flex flex-col md:flex-row md:justify-end items-start md:items-center relative w-full pl-16 md:pl-0">
              <div className="absolute left-6 md:left-1/2 top-1.5 md:top-auto h-3.5 w-3.5 rounded-full border-2 border-success bg-slate-950 -translate-x-1/2 shadow-glow-success flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
              <GlassCard className="w-full md:w-[45%] p-6">
                <FlexLayout gap={3} align="center" className="mb-2">
                  <FileCode className="h-5 w-5 text-success" />
                  <SectionTitle className="text-sm font-bold text-white">4. Smart Contract (Chaincode)</SectionTitle>
                </FlexLayout>
                <BodyText className="text-xs text-muted-foreground">
                  Executes treasury logic — validates votes, updates reserves, and records expenses on the ledger.
                </BodyText>
              </GlassCard>
            </RevealOnScroll>

            {/* Node 5: Blockchain Ledger */}
            <RevealOnScroll className="flex flex-col md:flex-row md:justify-start items-start md:items-center relative w-full pl-16 md:pl-0">
              <div className="absolute left-6 md:left-1/2 top-1.5 md:top-auto h-3.5 w-3.5 rounded-full border-2 border-success bg-slate-950 -translate-x-1/2 shadow-glow-success flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
              <GlassCard className="w-full md:w-[45%] p-6">
                <FlexLayout gap={3} align="center" className="mb-2">
                  <Database className="h-5 w-5 text-success" />
                  <SectionTitle className="text-sm font-bold text-white">5. Blockchain Ledger</SectionTitle>
                </FlexLayout>
                <BodyText className="text-xs text-muted-foreground">
                  Stores the current world state in CouchDB and maintains an append-only chain of all committed transactions.
                </BodyText>
              </GlassCard>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>

      <GradientDivider />

      {/* 6. Statistics Section */}
      <Section className="bg-slate-950/20">
        <Container>
          <RevealOnScroll>
            <Grid cols={4} gap="lg" colsMd={2} colsSm={1}>
              <GlowCard className="p-8 flex flex-col gap-2">
                <MutedText className="uppercase font-bold tracking-widest text-[9px]">Initial Treasury Reserve</MutedText>
                <div className="text-3xl font-extrabold text-white select-none">
                  $<AnimatedCounter value={1000000} />
                </div>
                <BodyText className="text-xs text-muted-foreground mt-1">Starting reserve balance available for approved proposals.</BodyText>
              </GlowCard>

              <GlowCard className="p-8 flex flex-col gap-2">
                <MutedText className="uppercase font-bold tracking-widest text-[9px]">Participating Organizations</MutedText>
                <div className="text-3xl font-extrabold text-white select-none">
                  <AnimatedCounter value={4} />
                </div>
                <BodyText className="text-xs text-muted-foreground mt-1">Finance, Trustee, Audit, and Operations.</BodyText>
              </GlowCard>

              <GlowCard className="p-8 flex flex-col gap-2">
                <MutedText className="uppercase font-bold tracking-widest text-[9px]">Approval Threshold</MutedText>
                <div className="text-3xl font-extrabold text-white select-none">
                  <AnimatedCounter value={90} />%
                </div>
                <BodyText className="text-xs text-muted-foreground mt-1">Required consensus before a proposal is executed.</BodyText>
              </GlowCard>

              <GlowCard className="p-8 flex flex-col gap-2">
                <MutedText className="uppercase font-bold tracking-widest text-[9px]">Audit History</MutedText>
                <div className="text-3xl font-extrabold text-white select-none">
                  Immutable
                </div>
                <BodyText className="text-xs text-muted-foreground mt-1">Every transaction is permanently recorded on-chain.</BodyText>
              </GlowCard>
            </Grid>
          </RevealOnScroll>
        </Container>
      </Section>

      <Divider />

      {/* 7. Treasury Approval Lifecycle Section */}
      <Section className="bg-slate-950/10">
        <Container>
          <RevealOnScroll>
            <SectionHeading 
              tag="Lifecycle" 
              title="Treasury Approval Lifecycle" 
              description="The complete journey of a treasury proposal — from creation to permanent audit record."
            />
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 mt-12 select-none relative">
              {/* Timeline Horizontal Line (LG screens only) */}
              <div className="absolute top-[34px] left-10 right-10 h-px bg-white/5 -z-10 hidden lg:block" />

              {/* Step 1: Proposal Created */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Proposal Created</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    A treasury proposal is submitted with amount, purpose, and category.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              {/* Step 2: Organizations Review & Vote */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Review & Vote</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    Organizations review the proposal details and cast Approve or Reject votes.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              {/* Step 3: Consensus Reached */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Consensus (90%)</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    Once approvals meet the 90% threshold, the proposal is marked as approved.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              {/* Step 4: Reserve Updated */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Reserve Updated</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    The approved amount is deducted from the treasury reserve balance.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              {/* Step 5: Expense Recorded */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center font-bold text-xs">
                  05
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Expense Recorded</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    A corresponding expense record is written to the ledger.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              {/* Step 6: Audit Log Generated */}
              <GlassCardHover className="p-5 flex flex-col gap-4">
                <div className="h-9 w-9 rounded-full bg-warning/10 border border-warning/20 text-warning flex items-center justify-center font-bold text-xs">
                  06
                </div>
                <Stack spacing="xs">
                  <SectionTitle className="text-xs font-bold text-white uppercase tracking-wider">Audit Log Generated</SectionTitle>
                  <BodyText className="text-[11px] text-muted-foreground leading-relaxed">
                    A permanent, immutable audit entry is committed to the blockchain.
                  </BodyText>
                </Stack>
              </GlassCardHover>
            </div>
          </RevealOnScroll>
        </Container>
      </Section>

      <GradientDivider />

      {/* 8. Why Hyperledger Fabric Section */}
      <Section className="bg-slate-950/20">
        <Container>
          <RevealOnScroll>
            <SectionHeading 
              tag="Technology" 
              title="Why Hyperledger Fabric?" 
              description="TreasuryChain is built on Hyperledger Fabric because treasury governance requires a permissioned, auditable, and consensus-driven infrastructure."
            />
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <Grid cols={3} gap="lg" colsMd={1}>
              <GlassCardHover className="p-8 flex flex-col gap-5">
                <Network className="h-9 w-9 text-primary shrink-0" />
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Permissioned Network</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">
                    Only authorized organizations can participate in treasury governance. No anonymous access.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              <GlassCardHover className="p-8 flex flex-col gap-5">
                <Vote className="h-9 w-9 text-success shrink-0" />
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Consensus-Based Approval</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">
                    Treasury actions require multi-organization agreement before execution on the ledger.
                  </BodyText>
                </Stack>
              </GlassCardHover>

              <GlassCardHover className="p-8 flex flex-col gap-5">
                <BookOpen className="h-9 w-9 text-warning shrink-0" />
                <Stack spacing="xs">
                  <SectionTitle className="text-sm font-bold text-white">Immutable Ledger</SectionTitle>
                  <BodyText className="text-xs text-muted-foreground">
                    Every proposal, vote, and reserve update is permanently recorded and fully traceable.
                  </BodyText>
                </Stack>
              </GlassCardHover>
            </Grid>
          </RevealOnScroll>
        </Container>
      </Section>

      <GradientDivider />

      {/* 9. Final CTA Section */}
      <Section className="py-24 relative overflow-hidden bg-slate-950/20">
        <Container>
          <RevealOnScroll>
            <Stack spacing="md" align="center" className="text-center max-w-2xl mx-auto">
              <SectionTitle className="text-2xl md:text-3xl font-extrabold text-white">
                Start Managing Treasury Proposals
              </SectionTitle>
              <SectionSubtitle className="text-xs text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
                Sign in with your organization credentials to submit proposals, cast votes, and track audit history.
              </SectionSubtitle>
              <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2 px-6 py-2.5 mt-4">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Stack>
          </RevealOnScroll>
        </Container>
      </Section>

      {/* 10. Footer Section */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/60 backdrop-blur-md relative select-none">
        <Container>
          <Stack spacing="sm" align="center" className="text-center">
            <FlexLayout gap={2} align="center">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-white">TreasuryChain</span>
            </FlexLayout>
            <MutedText className="text-[11px] text-muted-foreground/70">
              Enterprise Treasury Governance on Hyperledger Fabric
            </MutedText>
            <MutedText className="text-[10px] text-muted-foreground/40">
              Built with React, Express.js, Hyperledger Fabric
            </MutedText>
            <MutedText className="text-[10px] text-muted-foreground/40">
              &copy; {new Date().getFullYear()} TreasuryChain
            </MutedText>
          </Stack>
        </Container>
      </footer>

      {/* Modal / Dialog Trigger Component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sign In to Treasury Console">
        <form onSubmit={handleInputSubmit} className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Specify your MSP identity private key and certificate file path to authenticate connection.
          </p>
          <Input 
            label="Enrolled MSP Identity" 
            placeholder="e.g. Admin@finance.treasurychain.com"
            required
          />
          <Input 
            label="Local Key Path" 
            placeholder="/organizations/peerOrganizations/..."
            required
          />
          <div className="flex gap-4 justify-end mt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="gap-1.5">
              Authenticate Signer
            </Button>
          </div>
        </form>
      </Modal>
      </PageWrapper>
    </LazyMotion>
  );
}

export default App;
