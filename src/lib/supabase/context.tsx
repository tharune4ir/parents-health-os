"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "./client";
import { Database } from "./types";
import { loadDemoData } from "../../utils/demoData";

type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

interface OnboardData {
  familyName: string;
  parentName: string;
  relationship: string;
  parentPhone: string;
  language: string;
}

interface ParentsAuthContextType {
  isSupabaseEnabled: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profile: TableRow<"profiles"> | null;
  family: TableRow<"families"> | null;
  parents: TableRow<"parents">[];
  activeParent: TableRow<"parents"> | null;
  vitals: TableRow<"vitals">[];
  medications: TableRow<"medications">[];
  medicationLogs: TableRow<"medication_logs">[];
  labReports: TableRow<"lab_reports">[];
  aiConversations: TableRow<"ai_conversations">[];
  whatsappMessages: TableRow<"whatsapp_messages">[];
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  onboard: (data: OnboardData) => Promise<{ error: any }>;
  
  // Data Mutators
  addVital: (data: { bp_sys: number; bp_dia: number; sugar: number; weight: number; source?: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  addMedication: (data: { name: string; dosage: string; timing: string; instructions: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  toggleMedicationLog: (medicationId: string, taken: boolean, logDate: string) => Promise<{ success: boolean; error?: any }>;
  addLabReport: (data: { report_date: string; report_type: string; summary: string; biomarkers: any; full_analysis_markdown: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  deleteLabReport: (reportId: string) => Promise<{ success: boolean; error?: any }>;
  addAiConversation: (userMessage: string, aiResponse: string) => Promise<{ success: boolean; error?: any }>;
  addWhatsappMessage: (direction: "incoming" | "outgoing", body: string, mediaUrl?: string) => Promise<{ success: boolean; error?: any }>;
  updateScorecard: (answers: any, scores: any) => Promise<{ success: boolean; error?: any }>;
  resetScorecard: () => Promise<{ success: boolean; error?: any }>;
  
  
  // UI Helpers
  selectActiveParent: (parentId: string) => void;
  refreshData: () => Promise<void>;
}

const ParentsAuthContext = createContext<ParentsAuthContextType | undefined>(undefined);

export function ParentsAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  
  // Core Domain State
  const [profile, setProfile] = useState<TableRow<"profiles"> | null>(null);
  const [family, setFamily] = useState<TableRow<"families"> | null>(null);
  const [parents, setParents] = useState<TableRow<"parents">[]>([]);
  const [activeParent, setActiveParent] = useState<TableRow<"parents"> | null>(null);
  
  // Health & Care Logs State
  const [vitals, setVitals] = useState<TableRow<"vitals">[]>([]);
  const [medications, setMedications] = useState<TableRow<"medications">[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<TableRow<"medication_logs">[]>([]);
  const [labReports, setLabReports] = useState<TableRow<"lab_reports">[]>([]);
  const [aiConversations, setAiConversations] = useState<TableRow<"ai_conversations">[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<TableRow<"whatsapp_messages">[]>([]);

  const supabase = createClient();

  useEffect(() => {
    // Check if Supabase keys exist in process.env
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (url && key && supabase) {
      setIsSupabaseEnabled(true);
      
      // Track session changes
      supabase.auth.getSession().then((res: any) => {
        const session = res?.data?.session;
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchSupabaseData(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchSupabaseData(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setProfile(null);
          setFamily(null);
          setParents([]);
          setActiveParent(null);
          setIsLoading(false);
        }
      });

      return () => {
        if (data?.subscription) {
          data.subscription.unsubscribe();
        }
      };
    } else {
      // Sandboxed LocalStorage Mode
      setIsSupabaseEnabled(false);
      loadLocalSandboxData();
    }
  }, []);

  // --- SUPABASE DATA HANDLERS ---
  const fetchSupabaseData = async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileErr && profileErr.code !== "PGRST116") {
        console.error("Error reading profile:", profileErr);
      }
      
      if (profileData) {
        setProfile(profileData);
      } else {
        // If profile doesn't exist, create one lazily
        const { data: newProfile, error: createProfileErr } = await supabase
          .from("profiles")
          .insert({ id: userId, role: "child" })
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
      }

      // 2. Fetch Family Membership
      const { data: memberData, error: memberErr } = await supabase
        .from("family_members")
        .select("*, families(*)")
        .eq("profile_id", userId);

      if (memberData && memberData.length > 0) {
        const primaryMember = memberData[0];
        setFamily(primaryMember.families as any);

        // 3. Fetch Family Parents
        const { data: parentList } = await supabase
          .from("parents")
          .select("*")
          .eq("family_id", primaryMember.family_id);

        if (parentList && parentList.length > 0) {
          setParents(parentList);
          
          // Default to first parent
          const cachedParentId = localStorage.getItem("parents_health_active_parent_id");
          const found = parentList.find((p: any) => p.id === cachedParentId);
          const active = found || parentList[0];
          setActiveParent(active);
          
          // 4. Fetch Health Metrics & Records for Active Parent
          fetchParentRecords(active.id);
        }
      }
    } catch (e) {
      console.error("Failed to populate dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParentRecords = async (parentId: string) => {
    if (!supabase) return;
    try {
      // Vitals
      const { data: vitalsList } = await supabase
        .from("vitals")
        .select("*")
        .eq("parent_id", parentId)
        .order("measured_at", { ascending: false });
      if (vitalsList) setVitals(vitalsList);

      // Medications
      const { data: meds } = await supabase
        .from("medications")
        .select("*")
        .eq("parent_id", parentId)
        .eq("is_active", true);
      if (meds) setMedications(meds);

      // Medication compliance logs
      const { data: medLogs } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("parent_id", parentId);
      if (medLogs) setMedicationLogs(medLogs);

      // Lab Reports
      const { data: reports } = await supabase
        .from("lab_reports")
        .select("*")
        .eq("parent_id", parentId)
        .order("report_date", { ascending: false });
      if (reports) setLabReports(reports);

      // AI Conversations
      const { data: aiConvs } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (aiConvs) setAiConversations(aiConvs);

      // WhatsApp Dialogue Sim
      const { data: whatsappMsgs } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (whatsappMsgs) setWhatsappMessages(whatsappMsgs);

    } catch (e) {
      console.error("Failed to load parent metrics:", e);
    }
  };

  const refreshData = async () => {
    if (isSupabaseEnabled && user) {
      await fetchSupabaseData(user.id);
    } else {
      loadLocalSandboxData();
    }
  };

  // --- LOCAL SANDBOX MODE (LocalStorage Backup) ---
  const loadLocalSandboxData = () => {
    const auth = localStorage.getItem("parents_health_auth_v2") === "true";
    setIsAuthenticated(auth);
    
    if (auth) {
      // Mock user & profile
      setUser({ id: "sandbox-child-id", email: "child@sahara.in" });
      setProfile({
        id: "sandbox-child-id",
        full_name: "Sahara User",
        phone: "+91 99999 99999",
        role: "child",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setFamily({
        id: "sandbox-family-id",
        name: "Sahara Family",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Handle Parent Load from LocalStorage
      const mockParentName = localStorage.getItem("parents_health_user_name") || "Gajula Senior";
      const mockParentAge = localStorage.getItem("parents_health_user_age") || "72";
      const mockParentRelationship = "Father";
      const mockScorecard = localStorage.getItem("parents_health_assessment_data_v2");
      
      const mockParent: TableRow<"parents"> = {
        id: "sandbox-parent-id",
        family_id: "sandbox-family-id",
        name: mockParentName,
        relationship: mockParentRelationship,
        phone: "+91 98480 22338",
        language: "Telugu",
        primary_conditions: ["Diabetes Type 2", "Mild Hypertension"],
        risk_level: "Healthy Baseline",
        health_index: 85,
        scorecard_answers: mockScorecard ? JSON.parse(mockScorecard) : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setParents([mockParent]);
      setActiveParent(mockParent);

      // Load Vitals from local storage
      const vitalLogsStr = localStorage.getItem("parents_health_history");
      if (vitalLogsStr) {
        const parsed = JSON.parse(vitalLogsStr);
        // Map history entries to Vitals structure
        const mappedVitals: TableRow<"vitals">[] = parsed.map((item: any, idx: number) => ({
          id: `sandbox-vital-${idx}`,
          parent_id: "sandbox-parent-id",
          measured_at: item.date || new Date().toISOString(),
          bp_sys: item.systolic || 122,
          bp_dia: item.diastolic || 80,
          sugar: item.sugar || 110,
          weight: item.weight || 68,
          logged_by: "sandbox-child-id",
          source: "manual",
          created_at: new Date().toISOString()
        }));
        setVitals(mappedVitals);
      }

      // Load Medications
      const activeMedsStr = localStorage.getItem("parents_health_active_meds");
      const defaultMeds = [
        { id: "med-1", name: "Metformin", dosage: "500mg", timing: "Morning, Night", instructions: "Post Meals" },
        { id: "med-2", name: "Amlodipine", dosage: "5mg", timing: "Evening", instructions: "Pre Meals" },
        { id: "med-3", name: "Multi-Vitamin", dosage: "1 Tab", timing: "Morning", instructions: "Post breakfast" }
      ];
      const parsedMeds = activeMedsStr ? JSON.parse(activeMedsStr) : defaultMeds;
      setMedications(parsedMeds.map((m: any) => ({
        id: m.id || `sandbox-med-${Math.random()}`,
        parent_id: "sandbox-parent-id",
        name: m.name,
        dosage: m.dosage,
        timing: m.timing,
        instructions: m.instructions || "",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

      // Load Daily Checklists
      const checklistLogs: TableRow<"medication_logs">[] = [];
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("parents_health_med_log_")) {
          const dateStr = key.replace("parents_health_med_log_", "");
          try {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            list.forEach((logItem: any) => {
              checklistLogs.push({
                id: `sandbox-log-${logItem.id}-${dateStr}`,
                parent_id: "sandbox-parent-id",
                medication_id: logItem.id,
                log_date: dateStr,
                taken: logItem.taken,
                taken_at: logItem.taken ? new Date().toISOString() : null,
                source: "web_dashboard",
                created_at: new Date().toISOString()
              });
            });
          } catch (e) {}
        }
      });
      setMedicationLogs(checklistLogs);

      // Setup Simulated Conversations & Messages
      const mockWhatsAppFeed: TableRow<"whatsapp_messages">[] = [
        { id: "msg-1", parent_id: "sandbox-parent-id", direction: "incoming", message_sid: "sandbox-sid-1", message_type: "text", body: "Anaya, I completed walking today.", media_url: null, status: "read", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: "msg-2", parent_id: "sandbox-parent-id", direction: "outgoing", message_sid: "sandbox-sid-2", message_type: "text", body: "Wonderful dad! Did you take Metformin 500mg?", media_url: null, status: "read", created_at: new Date(Date.now() - 3500000).toISOString() },
        { id: "msg-3", parent_id: "sandbox-parent-id", direction: "incoming", message_sid: "sandbox-sid-3", message_type: "text", body: "Yes, just after my breakfast.", media_url: null, status: "read", created_at: new Date(Date.now() - 3400000).toISOString() }
      ];
      setWhatsappMessages(mockWhatsAppFeed);

      const mockAiFeed = [
        { id: "ai-1", parent_id: "sandbox-parent-id", user_message: "Fasting blood sugar measured at 145 mg/dL", ai_response: "Your blood sugar is slightly elevated today. Please make sure to stick to the diabetic diet and take your morning Metformin after meal. Let's record your next reading before dinner.", source: "whatsapp", token_count: 85, created_at: new Date().toISOString() }
      ];
      setAiConversations(mockAiFeed);
    }
    setIsLoading(false);
  };

  // --- ACTIONS ---
  const signIn = async (email: string, password: string) => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      return { error };
    } else {
      // Local Auth Bypass
      localStorage.setItem("parents_health_auth_v2", "true");
      setIsAuthenticated(true);
      loadLocalSandboxData();
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      if (data.user) {
        // Explicitly create profile to map auth metadata
        await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            role: "child"
          });
      }
      setIsLoading(false);
      return { error };
    } else {
      localStorage.setItem("parents_health_auth_v2", "true");
      localStorage.setItem("parents_health_user_name", fullName);
      setIsAuthenticated(true);
      loadLocalSandboxData();
      return { error: null };
    }
  };

  const signOut = async () => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("parents_health_auth_v2");
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      setFamily(null);
      setParents([]);
      setActiveParent(null);
    }
    setIsLoading(false);
  };

  const onboard = async (data: OnboardData) => {
    if (isSupabaseEnabled && supabase && user) {
      setIsLoading(true);
      try {
        // 1. Create family container
        const { data: familyObj, error: famErr } = await supabase
          .from("families")
          .insert({ name: data.familyName })
          .select()
          .single();

        if (famErr) throw famErr;

        // 2. Map current child user as Family Member Owner
        await supabase
          .from("family_members")
          .insert({
            family_id: familyObj.id,
            profile_id: user.id,
            role: "owner"
          });

        // 3. Register first Elder Parent
        const { data: parentObj, error: parentErr } = await supabase
          .from("parents")
          .insert({
            family_id: familyObj.id,
            name: data.parentName,
            relationship: data.relationship,
            phone: data.parentPhone,
            language: data.language,
            risk_level: "Healthy Baseline",
            health_index: 90
          })
          .select()
          .single();

        if (parentErr) throw parentErr;

        // 4. Create explicit consent record under DPDP Act 2023
        await supabase
          .from("consents")
          .insert({
            parent_id: parentObj.id,
            granted_by_profile_id: user.id,
            consent_type: "geriatric_health_data_processing",
            consent_version: "Sahara_v1.0",
            ip_address: "127.0.0.1",
            is_granted: true
          });

        // Pre-initialize default baseline metrics to seed the dashboard beautifully
        await supabase
          .from("vitals")
          .insert({
            parent_id: parentObj.id,
            bp_sys: 120,
            bp_dia: 80,
            sugar: 105,
            weight: 65,
            logged_by: user.id,
            source: "manual"
          });

        await supabase
          .from("medications")
          .insert([
            { parent_id: parentObj.id, name: "Metformin", dosage: "500mg", timing: "Morning, Night", instructions: "Take after food" },
            { parent_id: parentObj.id, name: "Amlodipine", dosage: "5mg", timing: "Evening", instructions: "Pre meals" }
          ]);

        // Refresh fully loaded states
        await fetchSupabaseData(user.id);
      } catch (err) {
        console.error("Onboarding failed:", err);
        setIsLoading(false);
        return { error: err };
      }
      return { error: null };
    } else {
      // Local Bypass Simulation
      localStorage.setItem("parents_health_user_name", data.parentName);
      localStorage.setItem("parents_health_user_age", "70");
      
      // Seed standard diagnostic trends
      const mockHistory = [
        { date: "2026-05-20", systolic: 122, diastolic: 81, sugar: 108, weight: 65.2 },
        { date: "2026-05-22", systolic: 121, diastolic: 80, sugar: 106, weight: 65.0 },
        { date: "2026-05-25", systolic: 120, diastolic: 80, sugar: 105, weight: 64.9 }
      ];
      localStorage.setItem("parents_health_history", JSON.stringify(mockHistory));
      
      loadLocalSandboxData();
      return { error: null };
    }
  };

  // --- MUTATORS ---
  const addVital = async (data: { bp_sys: number; bp_dia: number; sugar: number; weight: number; source?: string }) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const { data: newVital, error } = await supabase
        .from("vitals")
        .insert({
          parent_id: activeParent.id,
          bp_sys: data.bp_sys,
          bp_dia: data.bp_dia,
          sugar: data.sugar,
          weight: data.weight,
          logged_by: user.id,
          source: data.source || "manual"
        })
        .select()
        .single();
      
      if (newVital) {
        setVitals(prev => [newVital, ...prev]);
        // Trigger simple Audit Log
        await supabase.from("audit_log").insert({
          actor_id: user.id,
          action: "log_health_vitals",
          entity_type: "vital",
          entity_id: newVital.id
        });
        return { success: true, data: newVital };
      }
      return { success: false, error };
    } else {
      // Sandbox Mutation
      const newMockVital: TableRow<"vitals"> = {
        id: `sandbox-vital-${Date.now()}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        measured_at: new Date().toISOString(),
        bp_sys: data.bp_sys,
        bp_dia: data.bp_dia,
        sugar: data.sugar,
        weight: data.weight,
        logged_by: user?.id || "sandbox-child-id",
        source: data.source || "manual",
        created_at: new Date().toISOString()
      };
      
      const newHistoryList = [...vitals, newMockVital];
      setVitals(newHistoryList);

      // Save to mock storage
      const rawHistory = newHistoryList.map(v => ({
        date: v.measured_at?.split("T")[0],
        systolic: v.bp_sys,
        diastolic: v.bp_dia,
        sugar: v.sugar,
        weight: v.weight
      }));
      localStorage.setItem("parents_health_history", JSON.stringify(rawHistory));

      return { success: true, data: newMockVital };
    }
  };

  const addMedication = async (data: { name: string; dosage: string; timing: string; instructions: string }) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const { data: newMed, error } = await supabase
        .from("medications")
        .insert({
          parent_id: activeParent.id,
          name: data.name,
          dosage: data.dosage,
          timing: data.timing,
          instructions: data.instructions,
          is_active: true
        })
        .select()
        .single();

      if (newMed) {
        setMedications(prev => [...prev, newMed]);
        await supabase.from("audit_log").insert({
          actor_id: user.id,
          action: "add_medication",
          entity_type: "medication",
          entity_id: newMed.id
        });
        return { success: true, data: newMed };
      }
      return { success: false, error };
    } else {
      const newMockMed: TableRow<"medications"> = {
        id: `sandbox-med-${Date.now()}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        name: data.name,
        dosage: data.dosage,
        timing: data.timing,
        instructions: data.instructions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updated = [...medications, newMockMed];
      setMedications(updated);
      localStorage.setItem("parents_health_active_meds", JSON.stringify(updated));
      return { success: true, data: newMockMed };
    }
  };

  const toggleMedicationLog = async (medicationId: string, taken: boolean, logDate: string) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const existing = medicationLogs.find(l => l.medication_id === medicationId && l.log_date === logDate);
      
      if (existing) {
        const { error } = await supabase
          .from("medication_logs")
          .update({ taken, taken_at: taken ? new Date().toISOString() : null })
          .eq("id", existing.id);
        
        if (!error) {
          setMedicationLogs(prev => prev.map(l => l.id === existing.id ? { ...l, taken, taken_at: taken ? new Date().toISOString() : null } : l));
          return { success: true };
        }
        return { success: false, error };
      } else {
        const { data: newLog, error } = await supabase
          .from("medication_logs")
          .insert({
            parent_id: activeParent.id,
            medication_id: medicationId,
            log_date: logDate,
            taken,
            taken_at: taken ? new Date().toISOString() : null,
            source: "web_dashboard"
          })
          .select()
          .single();
        
        if (newLog) {
          setMedicationLogs(prev => [...prev, newLog]);
          return { success: true };
        }
        return { success: false, error };
      }
    } else {
      // Local Checklist checklist log
      const logKey = `parents_health_med_log_${logDate}`;
      const cached = JSON.parse(localStorage.getItem(logKey) || "[]");
      
      const idx = cached.findIndex((c: any) => c.id === medicationId);
      if (idx > -1) {
        cached[idx].taken = taken;
      } else {
        cached.push({ id: medicationId, taken });
      }
      localStorage.setItem(logKey, JSON.stringify(cached));

      // Re-map internal checklist
      const mappedLogs: TableRow<"medication_logs">[] = medicationLogs.filter(l => !(l.medication_id === medicationId && l.log_date === logDate));
      mappedLogs.push({
        id: `sandbox-log-${medicationId}-${logDate}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        medication_id: medicationId,
        log_date: logDate,
        taken,
        taken_at: taken ? new Date().toISOString() : null,
        source: "web_dashboard",
        created_at: new Date().toISOString()
      });
      
      setMedicationLogs(mappedLogs);
      return { success: true };
    }
  };

  const addLabReport = async (data: { report_date: string; report_type: string; summary: string; biomarkers: any; full_analysis_markdown: string }) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const { data: report, error } = await supabase
        .from("lab_reports")
        .insert({
          parent_id: activeParent.id,
          report_date: data.report_date,
          report_type: data.report_type,
          storage_path: "lab-reports-bucket/fallback.pdf",
          summary: data.summary,
          biomarkers: data.biomarkers,
          full_analysis_markdown: data.full_analysis_markdown,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (report) {
        setLabReports(prev => [report, ...prev]);
        await supabase.from("audit_log").insert({
          actor_id: user.id,
          action: "upload_lab_report",
          entity_type: "lab_report",
          entity_id: report.id
        });
        return { success: true, data: report };
      }
      return { success: false, error };
    } else {
      const mockReport: TableRow<"lab_reports"> = {
        id: `sandbox-report-${Date.now()}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        report_date: data.report_date,
        report_type: data.report_type,
        storage_path: "sandbox/local-attachment.pdf",
        summary: data.summary,
        biomarkers: data.biomarkers,
        full_analysis_markdown: data.full_analysis_markdown,
        uploaded_by: user?.id || "sandbox-child-id",
        created_at: new Date().toISOString()
      };
      
      setLabReports(prev => [mockReport, ...prev]);
      localStorage.setItem("parents_health_latest_summary", data.summary);
      return { success: true, data: mockReport };
    }
  };

  const deleteLabReport = async (reportId: string) => {
    if (isSupabaseEnabled && supabase && user) {
      const { error } = await supabase
        .from("lab_reports")
        .delete()
        .eq("id", reportId);
      
      if (!error) {
        setLabReports(prev => prev.filter(r => r.id !== reportId));
        await supabase.from("audit_log").insert({
          actor_id: user.id,
          action: "delete_lab_report",
          entity_type: "lab_report",
          entity_id: reportId
        });
        return { success: true };
      }
      return { success: false, error };
    } else {
      setLabReports(prev => prev.filter(r => r.id !== reportId));
      return { success: true };
    }
  };

  const addAiConversation = async (userMessage: string, aiResponse: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("ai_conversations")
        .insert({
          parent_id: activeParent.id,
          user_message: userMessage,
          ai_response: aiResponse,
          source: "dashboard"
        });
      if (!error) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error };
    } else {
      const newConv: TableRow<"ai_conversations"> = {
        id: `sandbox-ai-${Date.now()}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        user_message: userMessage,
        ai_response: aiResponse,
        source: "dashboard",
        token_count: 100,
        created_at: new Date().toISOString()
      };
      setAiConversations(prev => [...prev, newConv]);
      return { success: true };
    }
  };

  const updateScorecard = async (answers: any, scores: any) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      try {
        const scorecard_answers = { answers, scores };
        const risk_level = scores.riskLevel || "Healthy Baseline";
        const health_index = Math.max(0, 100 - (scores.total || 0));

        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update({
            scorecard_answers,
            risk_level,
            health_index
          })
          .eq("id", activeParent.id)
          .select()
          .single();

        if (error) throw error;

        if (updatedParent) {
          setParents(prev => prev.map(p => p.id === activeParent.id ? updatedParent : p));
          setActiveParent(updatedParent);

          await supabase.from("audit_log").insert({
            actor_id: user.id,
            action: "update_health_profile",
            entity_type: "parent",
            entity_id: activeParent.id
          });
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to update scorecard:", err);
        return { success: false, error: err };
      }
    } else {
      localStorage.setItem("parents_health_assessment_data_v2", JSON.stringify({ answers, scores }));
      if (activeParent) {
        const updated = {
          ...activeParent,
          scorecard_answers: { answers, scores } as any,
          risk_level: scores.riskLevel,
          health_index: 100 - scores.total
        };
        setParents(prev => prev.map(p => p.id === activeParent.id ? updated : p));
        setActiveParent(updated);
      }
      return { success: true };
    }
  };

  const resetScorecard = async () => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      try {
        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update({
            scorecard_answers: null,
            risk_level: "Healthy Baseline",
            health_index: 90
          })
          .eq("id", activeParent.id)
          .select()
          .single();

        if (error) throw error;

        if (updatedParent) {
          setParents(prev => prev.map(p => p.id === activeParent.id ? updatedParent : p));
          setActiveParent(updatedParent);

          await supabase.from("audit_log").insert({
            actor_id: user.id,
            action: "reset_health_profile",
            entity_type: "parent",
            entity_id: activeParent.id
          });
        }
        return { success: true };
      } catch (err) {
        console.error("Failed to reset scorecard:", err);
        return { success: false, error: err };
      }
    } else {
      localStorage.removeItem("parents_health_assessment_data_v2");
      if (activeParent) {
        const updated = {
          ...activeParent,
          scorecard_answers: null,
          risk_level: "Healthy Baseline",
          health_index: 90
        };
        setParents(prev => prev.map(p => p.id === activeParent.id ? updated : p));
        setActiveParent(updated);
      }
      return { success: true };
    }
  };

  const addWhatsappMessage = async (direction: "incoming" | "outgoing", body: string, mediaUrl?: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("whatsapp_messages")
        .insert({
          parent_id: activeParent.id,
          direction,
          body,
          media_url: mediaUrl || null,
          message_type: mediaUrl ? "media" : "text",
          status: "sent"
        });
      if (!error) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error };
    } else {
      const newMsg: TableRow<"whatsapp_messages"> = {
        id: `sandbox-msg-${Date.now()}`,
        parent_id: activeParent?.id || "sandbox-parent-id",
        direction,
        body,
        media_url: mediaUrl || null,
        message_type: mediaUrl ? "media" : "text",
        message_sid: `sandbox-sid-${Date.now()}`,
        status: "read",
        created_at: new Date().toISOString()
      };
      setWhatsappMessages(prev => [...prev, newMsg]);
      return { success: true };
    }
  };

  const selectActiveParent = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      setActiveParent(parent);
      localStorage.setItem("parents_health_active_parent_id", parentId);
      if (isSupabaseEnabled) {
        fetchParentRecords(parentId);
      }
    }
  };

  return (
    <ParentsAuthContext.Provider
      value={{
        isSupabaseEnabled,
        isAuthenticated,
        isLoading,
        user,
        profile,
        family,
        parents,
        activeParent,
        vitals,
        medications,
        medicationLogs,
        labReports,
        aiConversations,
        whatsappMessages,
        
        signIn,
        signUp,
        signOut,
        onboard,
        
        addVital,
        addMedication,
        toggleMedicationLog,
        addLabReport,
        deleteLabReport,
        addAiConversation,
        addWhatsappMessage,
        updateScorecard,
        resetScorecard,
        
        selectActiveParent,
        refreshData
      }}
    >
      {children}
    </ParentsAuthContext.Provider>
  );
}

export function useParentsAuth() {
  const context = useContext(ParentsAuthContext);
  if (context === undefined) {
    throw new Error("useParentsAuth must be used within a ParentsAuthProvider");
  }
  return context;
}
