"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Brain,
  Zap,
  Shield,
  BarChart,
  Cloud,
  Lock,
  ChevronDown,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  PlayCircle,
  Users,
  FolderKanban,
  CheckSquare
} from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "glass border-b border-white/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:neon-glow transition-all">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexTask <span className="text-blue-400">Enterprise</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>

            <div className="hidden md:flex items-center gap-4">
            <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </button>
            <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Open Workspace
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 pt-24 px-6 md:hidden glass"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-gray-300">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
              <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <div className="h-px w-full bg-white/10 my-4" />
              <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="w-full text-center py-3 rounded-lg border border-white/20">Log in</button>
              <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="w-full text-center py-3 rounded-lg bg-white text-black font-bold">Open Workspace</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-blue-300 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              NexTask Enterprise 2.0 is now live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight"
            >
              The Modern Standard for <span className="text-gradient">Team Productivity</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Unify your organization's workflow with powerful task management, seamless collaboration, and robust enterprise-grade security.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center justify-center gap-2">
                Open Workspace <ArrowRight className="h-5 w-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full glass font-medium text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                <PlayCircle className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors" /> Watch Demo
              </button>
            </motion.div>

            {/* Mockup Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 rounded-xl pointer-events-none" />
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl p-2 md:p-4 neon-glow">
                <div className="rounded-lg overflow-hidden border border-white/5 bg-[#111] flex flex-col h-[300px] md:h-[500px]">
                  {/* Mockup Header */}
                  <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-[#1a1a1a]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="mx-auto w-1/3 h-4 bg-white/5 rounded-full"></div>
                  </div>
                  {/* Mockup Body */}
                  <div className="flex-1 p-6 flex gap-6">
                    <div className="hidden md:flex w-48 flex-col gap-4">
                      <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                      <div className="h-4 w-full bg-white/5 rounded mt-4"></div>
                      <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                      <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                      <div className="h-4 w-full bg-white/5 rounded"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                      <div className="flex gap-4">
                        <div className="flex-1 h-24 bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/30 rounded-xl p-4 flex flex-col justify-between">
                           <div className="h-3 w-20 bg-blue-400/50 rounded"></div>
                           <div className="h-6 w-12 bg-white/80 rounded"></div>
                        </div>
                        <div className="flex-1 h-24 bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between">
                           <div className="h-3 w-20 bg-indigo-400/50 rounded"></div>
                           <div className="h-6 w-12 bg-white/80 rounded"></div>
                        </div>
                        <div className="hidden sm:flex flex-1 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
                           <div className="h-3 w-20 bg-emerald-400/50 rounded"></div>
                           <div className="h-6 w-12 bg-white/80 rounded"></div>
                        </div>
                      </div>
                      <div className="flex-1 border border-white/5 bg-white/[0.02] rounded-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between gap-2 h-48">
                          {[40, 70, 45, 90, 65, 85, 100, 60].map((h, i) => (
                            <motion.div 
                              key={i} 
                              className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-sm"
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative z-10 border-t border-white/5 bg-[#050505]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Engineered for <span className="text-gradient">Scale</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Everything your organization needs to manage complex projects effortlessly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <FolderKanban className="h-6 w-6 text-blue-400" />, title: "Project Portfolios", desc: "Organize tasks into hierarchical projects with clear ownership and timelines." },
                { icon: <Users className="h-6 w-6 text-indigo-400" />, title: "Team Collaboration", desc: "Assign tasks, share context, and keep everyone aligned on a single platform." },
                { icon: <BarChart className="h-6 w-6 text-emerald-400" />, title: "Advanced Reporting", desc: "Gain deep insights into team productivity, bottlenecks, and project health." },
                { icon: <Lock className="h-6 w-6 text-red-400" />, title: "Enterprise Security", desc: "Bank-grade encryption, secure session management, and robust access controls." },
                { icon: <Cloud className="h-6 w-6 text-cyan-400" />, title: "Cloud Native", desc: "Access your workspace from anywhere with reliable, high-performance syncing." },
                { icon: <Shield className="h-6 w-6 text-yellow-400" />, title: "Granular Permissions", desc: "Define precise access levels for team members across different workspaces." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 rounded-2xl glass hover:bg-white/[0.08] transition-colors border border-white/10 hover:border-blue-500/30 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-black relative">
           <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10 transform -translate-y-1/2" />
           
           <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How it <span className="text-gradient">Works</span></h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Three simple steps to bring order to the chaos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-12 relative">
               <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2 z-0" />

               {[
                 { step: "01", icon: <Users />, title: "Create Your Team", desc: "Set up a secure workspace and invite your colleagues with role-based access." },
                 { step: "02", icon: <FolderKanban />, title: "Plan Projects", desc: "Break down large goals into actionable tasks with due dates and priorities." },
                 { step: "03", icon: <Zap />, title: "Execute Faster", desc: "Track progress through lists, boards, and timelines, ensuring nothing falls through the cracks." },
               ].map((item, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: i * 0.2 }}
                   className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-black border border-white/10"
                 >
                   <div className="absolute -top-4 -right-4 text-6xl font-black text-white/5">{item.step}</div>
                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                     {React.cloneElement(
                        item.icon as React.ReactElement<{ className?: string }>,
                        {
                          className: "h-8 w-8 text-white",
                        }
                      )}
                   </div>
                   <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                   <p className="text-gray-400">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
           </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-[#050505] border-t border-b border-white/5">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Trusted by <span className="text-gradient">Leaders</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sarah Jenkins", role: "VP of Engineering at TechFlow", text: "NexTask has completely transformed how our development teams coordinate. The UI is incredibly fast, and the data grid performance is unmatched." },
                { name: "David Chen", role: "Product Manager", text: "Finally, a project management tool that gets out of the way. It's clean, intuitive, and handles thousands of tasks without breaking a sweat." },
                { name: "Elena Rodriguez", role: "Operations Director", text: "The transition was seamless. We migrated our entire company workspace in days, and team adoption has been universally positive." }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-2xl glass flex flex-col justify-between"
                >
                  <p className="text-gray-300 italic mb-8">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-[#050505] border-t border-white/5">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Frequently Asked <span className="text-gradient">Questions</span></h2>
            
            <div className="space-y-4">
              {[
                { q: "How secure is my organization's data?", a: "Security is our top priority. All data is encrypted at rest and in transit. We implement secure JWT-based authentication, strict cross-origin resource sharing policies, and rigorous authorization checks at both the database and API layers." },
                { q: "Is this suitable for large enterprise teams?", a: "Yes. NexTask Enterprise is built on a scalable Node.js backend with MongoDB, designed specifically to handle large volumes of tasks, attachments, and simultaneous users without performance degradation." },
                { q: "How do I manage user permissions?", a: "Organizations can group users into teams, and projects can be securely scoped to specific teams or users. This ensures data privacy and strict access control across the entire platform." },
                { q: "Do you offer technical support?", a: "Yes, our platform is actively maintained with regular updates to address performance, security, and feature enhancements to support enterprise workflows." },
              ].map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="relative rounded-3xl overflow-hidden glass p-12 md:p-24 text-center border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-blue-900/50 -z-10 bg-[length:200%_auto] animate-gradient" />
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to align your team?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Create your secure enterprise workspace today and bring clarity to your organization's projects.</p>
              
              <button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/home` })} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                Open Workspace <ArrowRight className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <CheckSquare className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold tracking-tight">NexTask Enterprise</span>
              </Link>
              <p className="text-gray-400 text-sm max-w-xs mb-6">Empowering teams to achieve more with robust, secure, and intuitive project management.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Overview</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} NexTask Enterprise Inc. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Built for scale.</p>
          </div>
        </div>
      </footer>

      {/* Global styles specifically for gradient animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
      `}} />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="text-lg font-medium">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0 text-gray-400">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
