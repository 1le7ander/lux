/**
 * Environment configuration.
 * Reads from Vite's import.meta.env at build time.
 */

const config = Object.freeze({
  storeName: 'LUXE',
  storeTagline: 'أزياء فاخرة',

  // Backend API URL (FastAPI server)
  apiUrl: import.meta.env.VITE_API_URL ?? '',

  // Firebase (legacy — disabled)
  firebaseApiKey:     import.meta.env.VITE_FIREBASE_API_KEY     ?? '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  firebaseProjectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID  ?? '',

  // EmailJS
  emailjsServiceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '',
  emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '',
  emailjsPublicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '',

  // Google Sheets webhook
  sheetsWebhookUrl: import.meta.env.VITE_APPS_SCRIPT_URL ?? '',

  // Contact
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '213555000000',
  contactEmail:   import.meta.env.VITE_CONTACT_EMAIL   ?? '',

  // Admin auth (SHA-256 — legacy fallback, backend JWT is primary)
  adminUsernameHash: import.meta.env.VITE_ADMIN_USER_HASH ?? '',
  adminPasswordHash: import.meta.env.VITE_ADMIN_PASS_HASH ?? '',

  // Session
  sessionTTL: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes

  // Delivery
  defaultDeliveryFee: 600,
});

export default config;
