import "server-only";

/**
 * Server-side environment accessor. Throws early & loudly when a required
 * variable is missing so misconfiguration fails at startup, not at runtime.
 */

function required(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env var: ${name}`);
}

export const env = {
  APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL ?? "",
  ADMIN_KEY: process.env.ADMIN_KEY ?? "",
  ADMIN_USER_HASH: process.env.ADMIN_USER_HASH ?? "",
  ADMIN_PASS_HASH: process.env.ADMIN_PASS_HASH ?? "",
  DRIVE_FOLDER_ID:
    process.env.DRIVE_FOLDER_ID ?? "1viIogXrZm2dpdf3kKO-ohrO_2Ejsgss6",
  SHEETS_ID:
    process.env.SHEETS_ID ?? "1mkPF4ObtuS3wmjLjmG5UE18lq6dpW_1LWuT15r08dM0",
};

export function assertAppsScriptConfigured(): void {
  required("APPS_SCRIPT_URL");
  required("ADMIN_KEY");
}
