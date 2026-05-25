export interface QuickBaseline {
    relation: string;
    age: string;
    language: string;
    conditions: string[];
    mobility: string;
    allergies: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    doctor_contact_name?: string;
    doctor_contact_phone?: string;
}

export interface FunctionalADLs {
    bathing: string;
    dressing: string;
    toileting: string;
    transferring: string;
    walking: string;
    eating: string;
}

export interface RiskSignals {
    falls_12m: string;
    dizziness: string;
    breathlessness: string;
    forgetfulness: string;
    low_mood: string;
    poor_sleep: string;
    appetite_loss: string;
    constipation: string;
    severe_pain: string;
}

export interface RoutinePreferences {
    wake_up_time: string;
    bp_frequency: string;
    sugar_frequency: string;
    hydration_target: number;
    exercise_reminder: string;
    whatsapp_language: string;
}

export interface ParentAssessmentAnswers {
    relation?: string;
    age?: string;
    language?: string;
    conditions?: string[];
    mobility?: string;
    allergies?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    doctor_contact_name?: string;
    doctor_contact_phone?: string;
    
    // ADLs
    bathing?: string;
    dressing?: string;
    toileting?: string;
    transferring?: string;
    walking?: string;
    eating?: string;

    // Risk Signals
    falls_12m?: string;
    dizziness?: string;
    breathlessness?: string;
    forgetfulness?: string;
    low_mood?: string;
    poor_sleep?: string;
    appetite_loss?: string;
    constipation?: string;
    severe_pain?: string;

    // Routine Preferences
    wake_up_time?: string;
    bp_frequency?: string;
    sugar_frequency?: string;
    hydration_target?: number;
    exercise_reminder?: string;
    whatsapp_language?: string;
    
    // stage trackers
    stageA_completed?: boolean;
    stageB_completed?: boolean;
    stageC_completed?: boolean;
    stageD_completed?: boolean;
}

export interface CarePlanTask {
    id: string;
    label: string;
    category: "medicine" | "vitals" | "lifestyle" | "emotional";
    timeOfDay?: "Morning" | "Afternoon" | "Evening" | "Night";
    instructions?: string;
}

export interface GeneratedCarePlan {
    careStatus: "Stable routine" | "Needs attention" | "Needs family review" | "Discuss with doctor";
    careStatusExplanation: string;
    dailyTasks: CarePlanTask[];
    vitalsTracking: { name: string; frequency: string; instruction: string }[];
    nutritionWatch: string[];
    mobilityGuidelines: string;
    whatsappPrompts: { period: string; message: string }[];
    doctorAgenda: string[];
}

export function generateCarePlan(
    answers: ParentAssessmentAnswers,
    confirmedMeds: any[]
): GeneratedCarePlan {
    const isDiabetes = answers.conditions?.includes("Diabetes") || false;
    const isHypertension = answers.conditions?.includes("Hypertension") || false;
    const isHeart = answers.conditions?.includes("Heart Issues") || false;

    // 1. Determine Care Status (Rules-based)
    let careStatus: GeneratedCarePlan["careStatus"] = "Stable routine";
    let careStatusExplanation = "All active signals indicate a stable daily routine. Continue baseline maintenance.";

    if (
        answers.falls_12m === "Yes" || 
        answers.dizziness === "Yes" || 
        answers.breathlessness === "Yes"
    ) {
        careStatus = "Discuss with doctor";
        careStatusExplanation = "Active physiological risk signals (e.g. falls, dizziness, or breathlessness) require targeted review with a medical professional.";
    } else if (
        answers.forgetfulness === "Yes" || 
        answers.severe_pain === "Yes" || 
        answers.low_mood === "Yes"
    ) {
        careStatus = "Needs attention";
        careStatusExplanation = "Elevated signal values detected for daily comfort (e.g., forgetfulness, chronic pain, or low mood). Standard supportive action recommended.";
    } else if (
        answers.mobility === "Uses stick/walker" || 
        answers.mobility === "Bedridden" || 
        answers.bathing === "Needs help" || 
        answers.dressing === "Needs help" || 
        answers.toileting === "Needs help" ||
        answers.transferring === "Needs help"
    ) {
        careStatus = "Needs family review";
        careStatusExplanation = "Functional support limits reached. Parent requires partial family/caregiver physical support with daily ADLs.";
    }

    // 2. Daily Tasks Creation
    const dailyTasks: CarePlanTask[] = [];

    // Add Vitals Checks
    if (isHypertension || answers.bp_frequency === "Daily") {
        dailyTasks.push({
            id: "vital-bp",
            label: "Check Blood Pressure",
            category: "vitals",
            timeOfDay: "Morning",
            instructions: "Take sitting down, after morning tea. Target: 120-135 mmHg systolic."
        });
    } else if (answers.bp_frequency === "Weekly") {
        dailyTasks.push({
            id: "vital-bp",
            label: "Weekly Blood Pressure Check",
            category: "vitals",
            timeOfDay: "Morning",
            instructions: "Log weekly baseline stats to maintain health record."
        });
    }

    if (isDiabetes || answers.sugar_frequency === "Daily") {
        dailyTasks.push({
            id: "vital-sugar",
            label: "Measure Blood Sugar",
            category: "vitals",
            timeOfDay: "Morning",
            instructions: "Measure Fasting. Target fasting glucose: < 125 mg/dL."
        });
    } else if (answers.sugar_frequency === "Weekly") {
        dailyTasks.push({
            id: "vital-sugar",
            label: "Check Fasting Glucose (Weekly)",
            category: "vitals",
            timeOfDay: "Morning",
            instructions: "Record sugar reading on empty stomach."
        });
    }

    // Add Lifestyle Habits
    const hydrationTarget = answers.hydration_target || 8;
    dailyTasks.push({
        id: "habit-water",
        label: `Track Hydration Target (${hydrationTarget} glasses)`,
        category: "lifestyle",
        timeOfDay: "Afternoon",
        instructions: `Keep a bottled container near the parent to track active water intake.`
    });

    if (answers.exercise_reminder === "Yes" || answers.mobility !== "Bedridden") {
        const mobInstr = answers.mobility === "Uses stick/walker" 
            ? "Gentle stretching and 10 mins assisted hallway walk." 
            : "30-minute evening walk or light chair exercises.";
        dailyTasks.push({
            id: "habit-exercise",
            label: "Daily Guided Movement",
            category: "lifestyle",
            timeOfDay: "Evening",
            instructions: mobInstr
        });
    }

    if (answers.poor_sleep === "Yes") {
        dailyTasks.push({
            id: "lifestyle-sleep",
            label: "Log Sleep Patterns & Sleep Quality",
            category: "lifestyle",
            timeOfDay: "Evening",
            instructions: "Note down overnight sleep disturbances or excessive snoring."
        });
    }

    if (answers.low_mood === "Yes") {
        dailyTasks.push({
            id: "emotional-mood",
            label: "Daily Mood Check-in",
            category: "emotional",
            timeOfDay: "Evening",
            instructions: "Anaya will automatically prompt a supportive check-in chat via WhatsApp."
        });
    }

    // Add Confirmed Meds
    confirmedMeds.forEach((m: any) => {
        if (!m.status || m.status === "Active") {
            const listSlots = m.slots && m.slots.length > 0 
                ? m.slots 
                : [m.timing || "Morning"];
            
            listSlots.forEach((slot: string) => {
                dailyTasks.push({
                    id: `med-${m.name}-${slot}`.toLowerCase().replace(/\s+/g, '-'),
                    label: `Take ${m.name} (${m.dosage})`,
                    category: "medicine",
                    timeOfDay: slot as any,
                    instructions: `${m.remarks || m.instructions || "Standard formulation instructions."}`
                });
            });
        }
    });

    // 3. Vitals Tracking Plan
    const vitalsTracking: GeneratedCarePlan["vitalsTracking"] = [];
    if (isHypertension || answers.bp_frequency === "Daily" || answers.bp_frequency === "Weekly") {
        vitalsTracking.push({
            name: "Blood Pressure (Sys/Dia)",
            frequency: answers.bp_frequency === "Daily" ? "Daily" : "Weekly",
            instruction: "Check sitting down, arm at heart height. Ideal target: <130/80 mmHg."
        });
    }
    if (isDiabetes || answers.sugar_frequency === "Daily" || answers.sugar_frequency === "Weekly") {
        vitalsTracking.push({
            name: "Blood Glucose (Fasting)",
            frequency: answers.sugar_frequency === "Daily" ? "Daily" : "Weekly",
            instruction: "Fasting check first thing in the morning before food. Target: <120 mg/dL."
        });
    }
    vitalsTracking.push({
        name: "Body Weight (kg)",
        frequency: "Monthly",
        instruction: "Track weight once a month to check fluid retention and nutrition status."
    });

    // 4. Nutrition Watch Points
    const nutritionWatch: string[] = [];
    if (isDiabetes) {
        nutritionWatch.push("Prioritize high-fiber complex carbohydrates (whole grains, raw vegetables). Limit refined sugars, fruit juices, and white rice.");
    }
    if (isHypertension || isHeart) {
        nutritionWatch.push("Sodium restricted diet. Avoid canned pickles, papads, packaged snacks, and table salt additions.");
    }
    if (answers.constipation === "Yes") {
        nutritionWatch.push("Add fiber-rich foods like oats, papaya, and boiled flax seeds. Ensure adequate warm water intake throughout the morning.");
    } else {
        nutritionWatch.push("Regular home-cooked meals with balanced fiber, lean protein, and healthy fats.");
    }

    // 5. Mobility Guidelines
    let mobilityGuidelines = "Keep active with regular, light walks. Set up anti-skid mats in the washroom.";
    if (answers.mobility === "Uses stick/walker") {
        mobilityGuidelines = "Provide continuous support when climbing stairs. Clear all loose carpets, clutter, and electrical wires to prevent fall hazards.";
    } else if (answers.mobility === "Bedridden") {
        mobilityGuidelines = "Ensure routine posture transitions every 2 hours to avoid bed sores. Perform mild passive joint rotations.";
    } else if (answers.falls_12m === "Yes") {
        mobilityGuidelines = "Fall risk active. Keep rooms well-lit at night. Install grab-bars in the toilet. Perform assisted balance training exercises.";
    }

    // 6. WhatsApp Prompts Simulator Preview
    const lang = answers.whatsapp_language || answers.language || "English";
    const name = answers.relation || "Parent";
    
    const whatsappPrompts: GeneratedCarePlan["whatsappPrompts"] = [
        {
            period: "Morning Check-in (8:00 AM)",
            message: lang.toLowerCase() === "hindi"
                ? `प्रणाम ${name}जी, आशा है आपकी नींद अच्छी रही। क्या आपने सुबह की दवाइयां ले ली हैं? यदि ब्लड प्रेशर मापा हो, तो मुझे अवश्य बताएं!`
                : `Good morning ${name}, hope you slept well. Did you take your morning medicines? Let me know if you recorded your blood pressure or sugar fasting too.`
        },
        {
            period: "Mid-Day Hydration & Activity (2:00 PM)",
            message: lang.toLowerCase() === "hindi"
                ? `${name}जी, कृपया पानी पीना न भूलें। दोपहर की सैर या हल्की स्ट्रेचिंग कर ली हो तो मुझे सूचित करें!`
                : `Hi ${name}, just checking in on your hydration! Remember to take a few sips of water. Have you done your light walking today?`
        },
        {
            period: "Night Wellness Log (9:00 PM)",
            message: lang.toLowerCase() === "hindi"
                ? `शुभ रात्रि ${name}जी, सोने से पहले रात की दवाइयां ले लें। आज आपका स्वास्थ्य और मनोदशा कैसी रही?`
                : `Good evening ${name}. Please take your night medication before bed. Let me know how your mood was today so we can log it safely.`
        }
    ];

    // 7. Doctor Agenda Checklist
    const doctorAgenda: string[] = [];
    if (answers.falls_12m === "Yes") {
        doctorAgenda.push("Ask doctor to review fall risks, gait/balance issues, and potential side effects of medications.");
    }
    if (answers.dizziness === "Yes") {
        doctorAgenda.push("Discuss orthostatic hypotension (blood pressure drops on standing up).");
    }
    if (answers.breathlessness === "Yes") {
        doctorAgenda.push("Report breathlessness or low exertion threshold for cardiac review.");
    }
    if (answers.forgetfulness === "Yes") {
        doctorAgenda.push("Discuss mild cognitive signs or forgetfulness to rule out deficiency or progressive conditions.");
    }
    if (confirmedMeds.length >= 5) {
        doctorAgenda.push("Request polypharmacy audit (reviewing clashes, dosage reductions for kidney/liver health).");
    }
    if (doctorAgenda.length === 0) {
        doctorAgenda.push("Present baseline physiological tracking logs to keep doctor updated on stable routine.");
    }

    return {
        careStatus,
        careStatusExplanation,
        dailyTasks,
        vitalsTracking,
        nutritionWatch,
        mobilityGuidelines,
        whatsappPrompts,
        doctorAgenda
    };
}
