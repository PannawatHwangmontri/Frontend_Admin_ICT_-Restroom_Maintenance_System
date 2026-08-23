export type LoginStep =
  | "account"
  | "email"
  | "loading"
  | "loading-email"
  | "email-error"
  | "password"
  | "password-error"
  | "loading-authenticator"
  | "authenticator-loading"
  | "authenticator"
  | "verification"
  | "verification-error"
  | "verifying"
  | "stay-signed-in";

export interface RememberedAccount {
  email: string;
  lastLogin?: string;
}