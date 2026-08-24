import React, { useState, useEffect } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { Shield, ArrowRight } from 'lucide-react';

import { Container } from '../components/layout/Container';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FlexLayout } from '../components/layout/FlexLayout';
import { CursorGlow } from '../components/layout/CursorGlow';
import { GridBackground, RadialGradient } from '../components/background/Backgrounds';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organization, setOrganization] = useState('finance');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Username and password are required');
      return;
    }

    const result = await login(organization, username, password);
    if (result.success) {
      toast.success('Authentication successful');
      setIsModalOpen(false);
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <PageWrapper className="relative overflow-hidden min-h-screen bg-[#0D0D0D] text-[#F5F5F5] font-sans">
        {/* Ambient background */}
        <CursorGlow />
        <GridBackground opacity="opacity-[0.02]" />
        <RadialGradient from="rgba(193, 18, 31, 0.05)" to="#0D0D0D" stop="65%" />

        <Toaster />

        {/* ── Navbar ──────────────────────────────────────────── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
              ? 'py-3 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1A1A1A] shadow-2xl'
              : 'py-5 bg-transparent'
          }`}
        >
          <Container>
            <FlexLayout justify="between" align="center" className="w-full">
              <FlexLayout gap={3} align="center" className="select-none">
                <div className="p-2 rounded-lg bg-[#C1121F]/10 border border-[#C1121F]/20">
                  <Shield className="h-5 w-5 text-[#C1121F]" />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-[#F5F5F5]">
                  TreasuryChain
                </span>
              </FlexLayout>

              <Button
                variant="glass"
                onClick={() => setIsModalOpen(true)}
                className="h-9 text-xs px-5 border-[#2A2A2A] text-[#F5F5F5] hover:border-[#E5383B]/40"
              >
                Sign In
              </Button>
            </FlexLayout>
          </Container>
        </header>

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">

            {/* Title */}
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1] text-[#F5F5F5] select-none"
            >
              TreasuryChain
            </m.h1>

            {/* Decorative thin line */}
            <m.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="w-16 h-px bg-gradient-to-r from-transparent via-[#C1121F] to-transparent mt-8 mb-8"
            />

            {/* Subtitle */}
            <m.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#F5F5F5] tracking-tight leading-snug"
            >
              Enterprise Treasury Management
            </m.p>

            {/* Powered by line */}
            <m.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
              className="text-base sm:text-lg md:text-xl font-medium text-[#E5383B] tracking-tight mt-3"
            >
              Powered by Hyperledger Fabric.
            </m.p>

            {/* Description */}
            <m.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
              className="text-sm sm:text-base text-[#888888] max-w-lg mt-6 leading-relaxed"
            >
              Secure, transparent and controlled financial operations for organizations.
            </m.p>

            {/* CTA */}
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: 'easeOut' }}
              className="mt-10"
            >
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="gap-2.5 px-8 py-3 text-sm font-semibold shadow-glow-primary"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </m.div>
          </div>

          {/* Bottom tagline — pinned to bottom of viewport */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-10 left-0 right-0 text-center text-[11px] sm:text-xs text-[#555555] tracking-[0.2em] uppercase font-medium select-none"
          >
            Permissioned Blockchain &nbsp;&bull;&nbsp; Smart Contracts &nbsp;&bull;&nbsp; Multi-Organization Governance
          </m.p>
        </section>

        {/* ── Authentication Modal ────────────────────────────── */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sign In to Treasury Console">
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 mt-2">
            <p className="text-xs text-[#A8A8A8] leading-relaxed">
              Select your organization MSP identity and enter credentials to access the console.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#A8A8A8] uppercase tracking-wider">Organization</label>
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3.5 py-2 text-sm text-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1121F]/50 focus-visible:border-[#C1121F]"
              >
                <option value="finance">Finance MSP</option>
                <option value="audit">Audit MSP</option>
                <option value="trustee">Trustee MSP</option>
                <option value="management">Management MSP</option>
              </select>
            </div>

            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading} className="gap-1.5">
                {isLoading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Modal>
      </PageWrapper>
    </LazyMotion>
  );
}
