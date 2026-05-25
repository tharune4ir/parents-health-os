"use client";

import { motion } from "framer-motion";
import { Sparkles, Stethoscope, Phone, ArrowRight, Activity, Utensils, Moon } from "lucide-react";
import { useState } from "react";

import { useToast } from "./ui/Toast";

export function CareTeam() {
    const { showToast } = useToast();

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-2">
            {/* HEADER */}
            <div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">Care Team</h2>
                <p className="text-sm text-slate-600 font-normal font-[family-name:var(--font-inter)] tracking-wide mt-2">Personal health support team and automated assistant.</p>
            </div>

            {/* 6-MEMBER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. PARENTS-HEALTH AI */}
                <TeamCard
                    icon={<Sparkles size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#0E5E5A]/30 text-[#0E5E5A] shadow-md shadow-[#0E5E5A]/5"
                    name="Anaya"
                    role="AI Care Assistant"
                    status={
                        <span className="flex items-center gap-3 text-[#0E5E5A] font-black text-[9px] uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0E5E5A] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0E5E5A]"></span>
                            </span>
                            Active
                        </span>
                    }
                    bio="Demonstration of automated health record synthesis and daily routine check-ins."
                    actionLabel="View Insights"
                    onAction={() => {
                        const btn = document.querySelector('button[label*="Reports"]') as HTMLButtonElement || document.querySelector('nav button:nth-child(2)') as HTMLButtonElement;
                        if (btn) btn.click();
                    }}
                    isAI
                />

                {/* 2. DR. ARUNA DESAI */}
                <TeamCard
                    icon={<Stethoscope size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#e2ded5] text-slate-500"
                    name="Dr. Aruna Desai"
                    role="Senior Geriatrician"
                    status={<span className="text-slate-655 text-[9px] font-black uppercase tracking-widest">Medical Oversight</span>}
                    bio="Senior medical advisor with 20+ years of geriatric specialization. Oversees health routine reviews."
                    actionLabel="Request Consultation"
                    onAction={() => showToast("Request sent to Dr. Aruna for a call slot.", "success")}
                />

                {/* 3. MS. SANYA KAPOOR */}
                <TeamCard
                    icon={<Utensils size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#e2ded5] text-slate-500"
                    name="Ms. Sanya Kapoor"
                    role="Clinical Nutritionist"
                    status={<span className="text-slate-655 text-[9px] font-black uppercase tracking-widest">Nutrition Support</span>}
                    bio="Specialist focused on diet synchronization, diabetic-sensitive meals, and digestive wellness."
                    actionLabel="Reconfigure Diet"
                    onAction={() => showToast("Diet review request logged for Sanya Kapoor.", "success")}
                />

                {/* 4. COACH VIKRAM SINGH */}
                <TeamCard
                    icon={<Activity size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#e2ded5] text-slate-500"
                    name="Coach Vikram Singh"
                    role="Mobility Specialist"
                    status={<span className="text-slate-655 text-[9px] font-black uppercase tracking-widest">Movement Support</span>}
                    bio="Assists with daily movement routine, strength checks, and fall-prevention through safe mobility demos."
                    actionLabel="Audit Exercises"
                    onAction={() => showToast("Accessing Kinetic Module... [Awaiting Deployment]", "info")}
                />

                {/* 5. AMIT VERMA */}
                <TeamCard
                    icon={<Phone size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#e2ded5] text-slate-500"
                    name="Amit Verma"
                    role="Care Operations"
                    status={<span className="text-slate-655 text-[9px] font-black uppercase tracking-widest">Support Operations</span>}
                    bio="Primary contact for laboratory scheduling, medicine delivery support, and general assistance."
                    actionLabel="Establish Audio Link"
                    onAction={() => showToast("Connecting to Amit Verma's office...", "info")}
                />

                {/* 6. DR. ESHA SETHI */}
                <TeamCard
                    icon={<Moon size={28} strokeWidth={2.5} />}
                    iconColor="bg-white border-[#e2ded5] text-slate-500"
                    name="Dr. Esha Sethi"
                    role="Sleep Architect"
                    status={<span className="text-slate-655 text-[9px] font-black uppercase tracking-widest">Sleep Wellness</span>}
                    bio="Specialist in sleep habits, daily routine timing, and cognitive stress management for seniors."
                    actionLabel="Book Therapy"
                    onAction={() => showToast("Requesting a wellness slot with Dr. Esha.", "success")}
                />

            </div>

            {/* DISCLAIMER FOOTER */}
            <div className="text-center pt-16 border-t border-[#e2ded5]">
                <p className="data-label !text-slate-500 !tracking-[0.2em] leading-relaxed">
                    * Team configurations are representative of the Parents Health OS dashboard. Specialist allocation is determined by user health requirements.
                </p>
            </div>
        </div>
    );
}

function TeamCard({ icon, iconColor, name, role, status, bio, actionLabel, onAction, isAI = false }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-card p-6 md:p-10 rounded-[3rem] border transition-all flex flex-col h-full relative overflow-hidden group ${
                isAI 
                    ? 'border-[#0E5E5A]/30 bg-teal-50/50 shadow-md shadow-teal-900/5' 
                    : 'border-[#e2ded5] bg-white hover:border-[#0E5E5A]/20 hover:bg-slate-50/30'
            }`}
        >
            {/* Accent Glow */}
            <div className={`absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full -mr-20 -mt-20 transition-all duration-300 ${
                isAI ? 'bg-[#0E5E5A]/5 group-hover:bg-[#E05E1B]/5' : 'bg-slate-50'
            }`} />

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center border shadow-sm ${iconColor}`}>
                    {/* Standardize icon stroke width */}
                    {Object.assign({}, icon, { props: { ...icon.props, strokeWidth: 1.5 } })}
                </div>
                <div className="bg-slate-50 px-6 py-2.5 rounded-full border border-[#e2ded5] shadow-inner">
                    {status}
                </div>
            </div>

            <div className="mb-6 relative z-10">
                <h3 className={`text-2xl font-bold tracking-tight mb-2 uppercase transition-all font-[family-name:var(--font-outfit)] ${isAI ? 'text-[#0E5E5A]' : 'text-slate-800 group-hover:text-[#0E5E5A]'}`}>{name}</h3>
                <p className="data-label !text-[#E05E1B]/90 !tracking-[0.2em]">{role}</p>
            </div>

            <p className="text-slate-600 text-sm font-light leading-relaxed mb-12 flex-1 relative z-10 font-[family-name:var(--font-inter)]">
                {bio}
            </p>

            <button
                onClick={onAction}
                className={`w-full py-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.98] relative z-10 font-[family-name:var(--font-outfit)] cursor-pointer ${
                    isAI
                        ? "bg-[#0E5E5A] text-white hover:bg-[#0c4e4b] shadow-md hover:scale-[1.01]"
                        : "bg-teal-50/50 text-[#0E5E5A] hover:bg-[#0E5E5A] hover:text-white border border-[#0E5E5A]/20 hover:border-transparent hover:shadow-md"
                }`}
            >
                {actionLabel}
                {!isAI && <ArrowRight size={14} strokeWidth={1.5} className="text-slate-700 group-hover:text-white transition-colors" />}
            </button>
        </motion.div>
    )
}
