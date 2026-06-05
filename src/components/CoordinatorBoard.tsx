"use client";

import { useState, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { motion } from "framer-motion";
import { Briefcase, AlertOctagon, Heart, Check, Users, MessageSquare, Send, CheckCircle, RefreshCw } from "lucide-react";

interface EscalationItem {
  id: string;
  parentName: string;
  parentId: string;
  sponsorName: string;
  triggerReason: string;
  priority: "Urgent Follow-up" | "Watch" | "Stable";
  timeElapsed: string;
  unansweredHours: number;
}

export function CoordinatorBoard() {
  const { parents, activeParent, updateParentProfile, addWhatsappMessage, refreshData } = useParentsAuth();
  
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatTarget, setChatTarget] = useState<"parent" | "sponsor">("parent");
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize mock escalations based on parents list
  useEffect(() => {
    if (parents && parents.length > 0) {
      const list: EscalationItem[] = parents.map((p, idx) => {
        let priority = (p.risk_level as any) || (idx === 0 ? "Watch" : "Stable");
        if (priority === "Critical") {
          priority = "Urgent Follow-up";
        }
        let reason = "Routine Baseline Monitoring";
        if (priority === "Watch") {
          reason = "Vitals deviation detected (BP > 140)";
        } else if (priority === "Urgent Follow-up") {
          reason = "No reply to WhatsApp alert for 4+ hours";
        }
        
        return {
          id: `esc-${p.id}`,
          parentId: p.id,
          parentName: p.name,
          sponsorName: (p.scorecard_answers as any)?.answers?.relation === "son" ? "Ramesh Dev" : "Sponsor Dev",
          triggerReason: reason,
          priority: priority as any,
          timeElapsed: idx === 0 ? "45m ago" : "2h ago",
          unansweredHours: idx === 0 ? 3 : 0
        };
      });
      setEscalations(list);
      if (parents[0]) {
        setSelectedParentId(parents[0].id);
      }
    }
  }, [parents]);

  const handlePriorityOverride = async (parentId: string, newPriority: "Urgent Follow-up" | "Watch" | "Stable") => {
    // Update local context
    await updateParentProfile(parentId, { risk_level: newPriority });
    
    // Update local state
    setEscalations(prev =>
      prev.map(e => (e.parentId === parentId ? { ...e, priority: newPriority } : e))
    );

    setNotification(`Priority manual override saved: ${newPriority}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendTemplate = async (templateType: string) => {
    const parentObj = parents.find(p => p.id === selectedParentId);
    if (!parentObj) return;

    let body = "";
    if (templateType === "vital_ping") {
      body = `Hi ${parentObj.name}, Anaya here. It is time to record your morning vitals (BP and blood sugar). Please reply with your readings.`;
    } else if (templateType === "sponsor_alert") {
      body = `Hi Sponsor, Kamala's BP was slightly elevated (142/92) during today's remote reading. We are monitoring this closely.`;
    } else {
      body = `Hi ${parentObj.name}, checking in to see if you have taken your afternoon medications. Please reply with "Taken" or "Need help".`;
    }

    if (chatTarget === "parent") {
      // Add simulated WhatsApp message
      await addWhatsappMessage("outgoing", body);
      setNotification(`Simulated WhatsApp template dispatched to parent: "${body.substring(0, 30)}..."`);
    } else {
      setNotification(`Simulated Sponsor Alert Dispatched via SMS/WhatsApp: "${body.substring(0, 30)}..."`);
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const activeEscalation = escalations.find(e => e.parentId === selectedParentId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tight uppercase">Care Operations Board</h2>
          <p className="text-xs md:text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">
            Centralized hub for active follow-ups, triage alerts, and manual priority overrides.
          </p>
        </div>
        <div className="flex items-center gap-4 data-label !text-[#E05E1B] bg-orange-50 px-6 py-4 rounded-2xl border border-orange-100 shadow-sm font-[family-name:var(--font-outfit)]">
          <AlertOctagon size={20} className="text-[#E05E1B]" />
          <span>Active Alerts: {escalations.filter(e => e.priority !== "Stable").length} Escalations</span>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-3"
        >
          <CheckCircle size={18} className="text-emerald-600" />
          {notification}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Escalation Queue List */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-6">
            <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Operations Queue</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 text-xs font-[family-name:var(--font-inter)]">
              {escalations.map(e => {
                const isCritical = e.priority === "Urgent Follow-up";
                const isWatch = e.priority === "Watch";
                return (
                  <div 
                    key={e.id}
                    onClick={() => setSelectedParentId(e.parentId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      selectedParentId === e.parentId
                        ? "bg-[#0E5E5A]/5 border-[#0E5E5A] shadow-md"
                        : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm font-[family-name:var(--font-outfit)]">{e.parentName}</span>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase">Sponsor: {e.sponsorName}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">{e.triggerReason}</p>
                      <div className="text-[9px] text-slate-400 font-medium">Logged {e.timeElapsed}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Priority Badges */}
                      <span className={`text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                        isCritical 
                          ? "bg-red-100 text-red-700 border border-red-200" 
                          : isWatch 
                            ? "bg-amber-100 text-amber-700 border border-amber-200" 
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {e.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Override & Action Console */}
        <div className="lg:col-span-5 space-y-6">
          {activeEscalation && (
            <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-6">
              <div className="border-b border-[#e2ded5] pb-4">
                <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Priority Override</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-[family-name:var(--font-inter)]">
                  Override risk level for: <strong>{activeEscalation.parentName}</strong>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-bold font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => handlePriorityOverride(activeEscalation.parentId, "Stable")}
                  className={`py-3.5 rounded-xl border text-center transition-all ${
                    activeEscalation.priority === "Stable"
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-md"
                      : "bg-white text-slate-600 border-[#e2ded5] hover:bg-slate-50"
                  }`}
                >
                  Stable
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityOverride(activeEscalation.parentId, "Watch")}
                  className={`py-3.5 rounded-xl border text-center transition-all ${
                    activeEscalation.priority === "Watch"
                      ? "bg-amber-500 text-white border-amber-600 shadow-md"
                      : "bg-white text-slate-600 border-[#e2ded5] hover:bg-slate-50"
                  }`}
                >
                  Watch
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityOverride(activeEscalation.parentId, "Urgent Follow-up")}
                  className={`py-3.5 rounded-xl border text-center transition-all ${
                    activeEscalation.priority === "Urgent Follow-up"
                      ? "bg-red-500 text-white border-red-600 shadow-md"
                      : "bg-white text-slate-600 border-[#e2ded5] hover:bg-slate-50"
                  }`}
                >
                  Urgent Follow-up
                </button>
              </div>

              <div className="border-t border-[#e2ded5] pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Simulated Dispatch Template</h4>
                
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={chatTarget === "parent"} 
                      onChange={() => setChatTarget("parent")} 
                      className="text-[#0E5E5A] focus:ring-[#0E5E5A]"
                    />
                    Simulated Parent WhatsApp
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={chatTarget === "sponsor"} 
                      onChange={() => setChatTarget("sponsor")} 
                      className="text-[#0E5E5A] focus:ring-[#0E5E5A]"
                    />
                    Simulated Sponsor SMS
                  </label>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSendTemplate("vital_ping")}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] rounded-xl text-left px-4 flex items-center justify-between"
                  >
                    <span>Request Vitals Verification (Morning)</span>
                    <Send size={11} className="text-[#0E5E5A]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendTemplate("med_check")}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] rounded-xl text-left px-4 flex items-center justify-between"
                  >
                    <span>Remind Medications (Afternoon)</span>
                    <Send size={11} className="text-[#0E5E5A]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendTemplate("sponsor_alert")}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] rounded-xl text-left px-4 flex items-center justify-between"
                  >
                    <span>Alert Sponsor regarding Vitals</span>
                    <Send size={11} className="text-[#E05E1B]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Panel */}
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Operations Assignments</h3>
            
            <div className="space-y-3 text-xs font-[family-name:var(--font-inter)] text-slate-600">
              <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Anaya Care Automation</div>
                  <div className="text-[10px] text-slate-500">Check-in Automation & Alert Routing</div>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Dr. Amit Verma</div>
                  <div className="text-[10px] text-slate-500">Lead Telehealth Practitioner</div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">STANDBY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
