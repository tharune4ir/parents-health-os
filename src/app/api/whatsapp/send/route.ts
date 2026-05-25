import { NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import { renderTemplate } from "@/lib/whatsapp/templates";
import { createDirectServerClient, sendWhatsAppMessage } from "@/lib/whatsapp/service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentId, templateKey, customBody, placeholders = {} } = body;

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: "Missing parentId parameter." },
        { status: 400 }
      );
    }

    const config = getWhatsAppConfig();
    const supabase = createDirectServerClient() as any;

    let parentName = "Parent";
    let parentPhone = "";
    let parentLanguage = "English";

    // 1. Fetch parent details and verify DPDP Consent if Supabase is connected
    if (supabase) {
      const { data: parentData, error: parentErr } = await supabase
        .from("parents")
        .select("*")
        .eq("id", parentId)
        .single();

      const parent = parentData as any;

      if (parentErr || !parent) {
        return NextResponse.json(
          { success: false, error: `Parent profile not found: ${parentErr?.message || "Invalid ID"}` },
          { status: 404 }
        );
      }

      parentName = parent.name;
      parentPhone = parent.phone || "";
      parentLanguage = parent.language || "English";

      // Query active consent record under DPDP Act 2023
      const { data: consents, error: consentErr } = await supabase
        .from("consents")
        .select("*")
        .eq("parent_id", parentId)
        .eq("is_granted", true);

      const hasConsent = consents && consents.length > 0;

      if (!hasConsent) {
        return NextResponse.json(
          { 
            success: false, 
            consentRequired: true,
            error: `WhatsApp dispatch blocked: Explicit consent under Indian DPDP Act 2023 is not registered for ${parentName}.` 
          },
          { status: 403 }
        );
      }
    } else {
      // Sandbox fallback defaults
      parentPhone = "+919848022338";
      parentName = "Sandbox Parent";
    }

    // 2. Resolve Message Body (using Template or Custom string)
    let messageText = "";
    if (templateKey) {
      // Merge context variables with user-provided placeholders
      const mergedPlaceholders = {
        parentName,
        ...placeholders
      };
      messageText = renderTemplate(templateKey, mergedPlaceholders);
    } else if (customBody) {
      messageText = customBody;
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide either a templateKey or customBody." },
        { status: 400 }
      );
    }

    if (!parentPhone) {
      return NextResponse.json(
        { success: false, error: "Parent does not have a registered phone number." },
        { status: 400 }
      );
    }

    // 3. Dispatch Message
    const result = await sendWhatsAppMessage(
      parentId,
      parentPhone,
      messageText,
      templateKey ? templateKey.split("_")[0] : undefined // Meta expects registered template names (without _en/_hi)
    );

    return NextResponse.json({
      success: true,
      messageText,
      recipient: parentName,
      phone: parentPhone,
      dryRun: result.dryRun,
      data: result.data
    });

  } catch (err: any) {
    console.error("[WhatsApp Send API] Internal Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process WhatsApp request." },
      { status: 500 }
    );
  }
}
