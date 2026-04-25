/**
 * Environment configuration.
 * Reads from Vite's import.meta.env at build time.
 */

const config = Object.freeze({
  storeName: 'LUXE',
  storeTagline: 'أزياء فاخرة',

  // Firebase
  firebaseApiKey:     import.meta.env.VITE_FIREBASE_API_KEY     ?? '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  firebaseProjectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID  ?? '',

  // EmailJS
  emailjsServiceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '',
  emailjsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '',
  emailjsPublicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '',

  // Google Sheets webhook
  sheetsWebhookUrl: import.meta.env.VITE_SHEETS_WEBHOOK_URL ?? '',

  // Contact
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '213555000000',
  contactEmail:   import.meta.env.VITE_CONTACT_EMAIL   ?? '',

  // Admin auth (SHA-256 hashed)
  adminUsernameHash: import.meta.env.VITE_ADMIN_USERNAME_HASH ?? '',
  adminPasswordHash: import.meta.env.VITE_ADMIN_PASSWORD_HASH ?? '',

  // Session
  sessionTTL: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes

  // Delivery
  defaultDeliveryFee: 600,
});

export default config;
