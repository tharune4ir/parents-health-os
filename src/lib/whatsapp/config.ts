export interface WhatsAppConfig {
  phoneNumberId: string | null;
  businessAccountId: string | null;
  accessToken: string | null;
  verifyToken: string | null;
  appSecret: string | null;
  isDryRun: boolean;
  isConfigured: boolean;
}

export const getWhatsAppConfig = (): WhatsAppConfig => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || null;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || null;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || null;
  const appSecret = process.env.WHATSAPP_APP_SECRET || null;

  // Dry run is true by default unless explicitly set to 'false'
  const isDryRun = process.env.WHATSAPP_DRY_RUN !== "false";

  // Check if minimum parameters are provided for live API execution
  const isConfigured = !!(phoneNumberId && accessToken);

  return {
    phoneNumberId,
    businessAccountId,
    accessToken,
    verifyToken,
    appSecret,
    isDryRun,
    isConfigured: isConfigured && !isDryRun,
  };
};
