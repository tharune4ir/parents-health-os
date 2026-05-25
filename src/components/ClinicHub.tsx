"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, MapPin, CheckCircle, CreditCard, Wallet, FileText, Plus, ShieldCheck, ChevronRight, X, User, Clock } from "lucide-react";
import { useToast } from "./ui/Toast";

interface Appointment {
    id: string;
    date: string; // "Feb 10"
    time: string; // "10:00 AM"
    doctor: string;
    type: string;
    status: "Confirmed" | "Completed" | "Pending";
    isPast?: boolean;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        date: "Feb 10",
        time: "10:00 AM",
        doctor: "Dr. Aruna Desai",
        type: "Geriatric Review • Video Consultation",
        status: "Confirmed",
        isPast: false
    },
    {
        id: "2",
        date: "Jan 12",
        time: "09:00 AM",
        doctor: "Annual Lab Panel",
        type: "Home Collection • Thyrocare",
        status: "Completed",
        isPast: true
    }
];

export function ClinicHub() {
    const { showToast } = useToast();

    // --- STATE ---
    const [balance, setBalance] = useState(1250);
    const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Form State
    const [bookForm, setBookForm] = useState({
        specialist: "Dr. Aruna Desai",
        date: "",
        time: ""
    });

    // --- ACTIONS ---

    const handleTopUp = () => {
        showToast("Processing Secure Payment...", "info");
        setTimeout(() => {
            setBalance(prev => prev + 1000);
            showToast("₹1,000 added to Praan Wallet successfully!", "success");
        }, 1500);
    };

    const handleBookAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookForm.date || !bookForm.time) {
            showToast("Please select valid date and time", "error");
            return;
        }

        // Parse date for display (Simplified logic for demo)
        const dateObj = new Date(bookForm.date);
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const day = dateObj.getDate();
        const dateStr = `${month} ${day}`;

        const newAppt: Appointment = {
            id: Date.now().toString(),
            date: dateStr,
            time: bookForm.time,
            doctor: bookForm.specialist,
            type: "Video Consultation",
            status: "Confirmed",
            isPast: false
        };

        // Optimistic UI Update: Add to top
        setAppointments(prev => [newAppt, ...prev]);
        setShowBookingModal(false);
        showToast("Appointment Booked! Dr. Desai notified.", "success");

        // Reset Form
        setBookForm({ specialist: "Dr. Aruna Desai", date: "", time: "" });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 relative">
            {/* HEADER */}
            <div className="px-2">
                <h2 className="text-3xl md:text-2xl md:text-4xl font-black text-[#0E5E5A] tracking-tight uppercase mb-1 font-[family-name:var(--font-outfit)]">Care Hub</h2>
                <p className="text-sm text-slate-500 font-medium tracking-tight">Manage consultations, insurance, and medical records.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">

                {/* LEFT COLUMN: UPCOMING VISITS (Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                        <h3 className="text-xl font-black text-[#0E5E5A] tracking-tighter uppercase flex items-center gap-4 font-[family-name:var(--font-outfit)]">
                            <div className="w-10 h-10 rounded-xl bg-[#0E5E5A]/5 border border-[#0E5E5A]/15 flex items-center justify-center text-[#0E5E5A] shadow-[0_0_20px_rgba(14,94,90,0.05)]">
                                <Calendar size={20} strokeWidth={2.5} />
                            </div>
                            Appointment Schedule
                        </h3>
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="flex items-center gap-3 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md cursor-pointer border-0"
                        >
                            <Plus size={14} strokeWidth={4} /> Book Appointment
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {appointments.map((appt) => (
                                <motion.div
                                    key={appt.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`glass-card p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${appt.isPast
                                        ? "bg-slate-950/20 border-white/5 opacity-60"
                                        : "bg-slate-950/40 border-white/5 shadow-2xl hover:border-cyan-500/20"
                                        }`}
                                >
                                    {/* Ambient Glow for Active */}
                                    {!appt.isPast && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
                                    )}

                                    {/* Status Badge (Only for active) */}
                                    {!appt.isPast && (
                                        <div className="absolute top-8 right-8">
                                            <span className="bg-slate-950 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span> {appt.status}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                                        {/* Date Box */}
                                        <div className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center w-full md:w-28 shrink-0 border shadow-inner ${appt.isPast 
                                            ? "bg-slate-100/50 border-[#e2ded5] text-slate-500" 
                                            : "bg-[#0E5E5A]/5 border-[#0E5E5A]/15"
                                            }`}>
                                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${appt.isPast ? "text-slate-400" : "text-[#0E5E5A]"}`}>{appt.date.split(' ')[0]}</span>
                                            <span className={`text-3xl font-black tracking-tighter ${appt.isPast ? "text-slate-400" : "text-slate-800"}`}>{appt.date.split(' ')[1]}</span>
                                            {!appt.isPast && <span className="text-[10px] font-black text-[#E05E1B] mt-2 uppercase tracking-tighter">{appt.time}</span>}
                                        </div>

                                        <div className="flex-1 w-full text-center md:text-left">
                                            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                                                <div>
                                                    <h4 className={`text-xl font-black tracking-tight mb-2 ${appt.isPast ? "text-slate-400" : "text-slate-800 group-hover:text-[#0E5E5A] transition-colors uppercase font-[family-name:var(--font-outfit)]"}`}>{appt.doctor}</h4>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{appt.type}</p>
                                                </div>
                                                {appt.isPast && (
                                                    <span className="flex items-center gap-2 text-slate-600 text-[9px] font-black uppercase bg-slate-950 border border-white/5 px-3 py-1 rounded-full self-center md:self-start mb-4 md:mb-0 tracking-[0.2em]">
                                                        <CheckCircle size={10} /> Previous
                                                    </span>
                                                )}
                                            </div>

                                            {!appt.isPast && (
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <button className="bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-8 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 cursor-pointer">
                                                        <Video size={14} strokeWidth={3} /> Join Call
                                                    </button>
                                                    <button className="bg-white hover:bg-slate-50 border border-[#e2ded5] text-[#0E5E5A] px-8 py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer">
                                                        Reschedule
                                                    </button>
                                                </div>
                                            )}
                                            {appt.isPast && (
                                                <button className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-[#0E5E5A] transition-colors border-b border-transparent hover:border-[#0E5E5A]/30 pb-1 cursor-pointer">Review Visit Summary</button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN: FINANCE (Span 1) */}
                <div className="lg:col-span-1 space-y-10">
                    <h3 className="text-xl font-black text-[#0E5E5A] tracking-tighter uppercase flex items-center gap-4 px-2 font-[family-name:var(--font-outfit)]">
                        <div className="w-10 h-10 rounded-xl bg-[#0E5E5A]/5 border border-[#0E5E5A]/15 flex items-center justify-center text-[#0E5E5A]">
                            <Wallet size={20} strokeWidth={2.5} />
                        </div>
                        Health Finance
                    </h3>

                    {/* WALLET CARD */}
                    <div className="glass-card bg-slate-950/60 border border-cyan-500/20 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck size={160} />
                        </div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Insurance Coverage</p>
                                <h4 className="font-black text-lg text-slate-800 flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-[#E05E1B]" /> Parents-Health Health Shield
                                </h4>
                            </div>
                            <span className="bg-[#E05E1B]/10 text-[#E05E1B] px-3 py-1 rounded-full text-[9px] font-black border border-[#E05E1B]/20 tracking-widest">
                                ACTIVE
                            </span>
                        </div>

                        <div className="space-y-1 relative z-10 mb-10">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Policy Number</p>
                            <p className="font-mono text-xl tracking-[0.3em] text-slate-800">YUK-8829-X</p>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex justify-between items-end relative z-10">
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Wallet Balance</p>
                                <AnimatePresence mode="popLayout">
                                    <motion.p
                                        key={balance}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl font-black tracking-tighter text-slate-800"
                                    >
                                        ₹{balance.toLocaleString()}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={handleTopUp}
                                className="bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg cursor-pointer"
                            >
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="glass-card bg-slate-950/40 border border-white/5 p-4 rounded-[2rem] space-y-3">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-[#0E5E5A]/5 rounded-2xl transition-all group cursor-pointer border-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#0E5E5A]/5 border border-[#0E5E5A]/15 text-[#0E5E5A] rounded-xl group-hover:border-[#0E5E5A]/30 transition-all">
                                    <FileText size={18} />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 group-hover:text-[#0E5E5A] uppercase tracking-widest transition-colors">Review Claims History</span>
                            </div>
                            <ChevronRight size={14} className="text-[#0E5E5A]/60 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-[#E05E1B]/5 rounded-2xl transition-all group cursor-pointer border-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#E05E1B]/5 border border-[#E05E1B]/15 text-[#E05E1B] rounded-xl group-hover:border-[#E05E1B]/30 transition-all">
                                    <CreditCard size={18} />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 group-hover:text-[#E05E1B] uppercase tracking-widest transition-colors">Manage Payment Cards</span>
                            </div>
                            <ChevronRight size={14} className="text-[#E05E1B]/60 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {showBookingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowBookingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card bg-white border border-[#e2ded5] w-full max-w-lg rounded-[3rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(18,35,33,0.15)] relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                            
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="absolute top-8 right-8 p-3 bg-slate-50 border border-[#e2ded5] text-slate-500 hover:text-[#0E5E5A] hover:bg-slate-100 rounded-full transition-all hover:rotate-90 cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-[#0E5E5A] tracking-tighter uppercase mb-2 font-[family-name:var(--font-outfit)]">Schedule Appointment</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Request a time for a virtual or clinic-based visit.</p>

                            <form onSubmit={handleBookAppointment} className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                        <User size={12} className="text-[#0E5E5A]" /> Select Specialist
                                    </label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl font-black text-slate-800 focus:bg-white focus:border-[#0E5E5A] outline-none appearance-none cursor-pointer transition-all font-[family-name:var(--font-outfit)]"
                                        value={bookForm.specialist}
                                        onChange={(e) => setBookForm({ ...bookForm, specialist: e.target.value })}
                                    >
                                        <option value="Dr. Aruna Desai" className="bg-white text-slate-800 font-[family-name:var(--font-outfit)]">Dr. Aruna Desai (Geriatric Optimization)</option>
                                        <option value="Dr. Esha Solanki" className="bg-white text-slate-800 font-[family-name:var(--font-outfit)]">Dr. Esha Solanki (Cardiovascular)</option>
                                        <option value="Coach Vikram" className="bg-white text-slate-800 font-[family-name:var(--font-outfit)]">Coach Vikram (Physio-Kinetics)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                        <Calendar size={12} className="text-[#0E5E5A]" /> Select Date
                                    </label>
                                        <input
                                            type="date"
                                            className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl font-black text-slate-800 focus:bg-white focus:border-[#0E5E5A] outline-none transition-all text-xs font-[family-name:var(--font-outfit)]"
                                            value={bookForm.date}
                                            onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3 mb-3">
                                            <Clock size={12} className="text-[#0E5E5A]" /> Select Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl font-black text-slate-800 focus:bg-white focus:border-[#0E5E5A] outline-none transition-all text-xs font-[family-name:var(--font-outfit)]"
                                            value={bookForm.time}
                                            onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(14,94,90,0.2)] active:scale-95 cursor-pointer"
                                    >
                                        Confirm Appointment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

