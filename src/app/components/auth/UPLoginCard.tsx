"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import {
  ArrowLeft,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { AUTH_CONFIG } from "@/config/auth";
import type { LoginStep, RememberedAccount } from "@/types/auth";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const readRememberedAccount = (): RememberedAccount | null => {
  try {
    const saved = localStorage.getItem(
      AUTH_CONFIG.rememberedAccountKey
    );

    if (saved) {
      const account = JSON.parse(saved) as RememberedAccount;

      if (account.email) {
        return account;
      }
    }
  } catch {
    localStorage.removeItem(AUTH_CONFIG.rememberedAccountKey);
  }

  return null;
};

export default function UPLoginCard() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>("account");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const rememberedAccount = useSyncExternalStore(
    subscribe,
    readRememberedAccount,
    () => null
  );

  const [showPassword, setShowPassword] = useState(false);

  const [verificationNumber, setVerificationNumber] = useState("");
  const [verificationInput, setVerificationInput] = useState("");

  const [staySignedIn, setStaySignedIn] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const notifyRememberedAccount = () => {
    window.dispatchEvent(new Event("storage"));
  };

  const generateVerificationNumber = () => {
    return String(Math.floor(Math.random() * 90) + 10);
  };

  const goToStep = (nextStep: LoginStep) => {
    setStep(nextStep);
  };

  const handleRememberedAccount = () => {
    if (!rememberedAccount) return;

    setEmail(rememberedAccount.email);
    setErrorMessage("");

    goToStep("loading-email");

    setTimeout(() => {
      goToStep("password");
    }, 1000);
  };

  const handleUseAnotherAccount = () => {
    setEmail("");
    setPassword("");
    setErrorMessage("");
    setShowAccountMenu(false);

    goToStep("email");
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("กรุณากรอกอีเมล");
      goToStep("email-error");
      return;
    }

    if (normalizedEmail !== AUTH_CONFIG.adminEmail.toLowerCase()) {
      setErrorMessage(
        "ไม่พบบัญชีนี้ในระบบ UP Office 365 กรุณาตรวจสอบอีเมลของคุณแล้วลองอีกครั้ง"
      );

      goToStep("email-error");
      return;
    }

    setEmail(normalizedEmail);
    setErrorMessage("");

    goToStep("loading-email");

    setTimeout(() => {
      goToStep("password");
    }, 1200);
  };

  const handlePasswordSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!password) {
      setErrorMessage("กรุณากรอกรหัสผ่าน");
      goToStep("password-error");
      return;
    }

    const trimmedPassword = password.trim();

    if (
      !AUTH_CONFIG.adminPasswords.includes(
        trimmedPassword
      )
    ) {
      setPassword("");

      setErrorMessage(
        "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
      );

      goToStep("password-error");
      return;
    }

    setErrorMessage("");

    goToStep("loading-authenticator");

    setTimeout(() => {
      const code = generateVerificationNumber();

      setVerificationNumber(code);
      setVerificationInput("");

      goToStep("authenticator");
    }, 1400);
  };

  const handleContinueAuthenticator = () => {
    setVerificationInput("");
    setErrorMessage("");

    goToStep("verification");
  };

  const handleVerificationSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      verificationInput.trim() !== verificationNumber
    ) {
      setErrorMessage(
        "หมายเลขที่กรอกไม่ถูกต้อง กรุณาตรวจสอบหมายเลขใน Authenticator แล้วลองอีกครั้ง"
      );

      goToStep("verification-error");
      return;
    }

    setErrorMessage("");

    goToStep("verifying");

    setTimeout(() => {
      goToStep("stay-signed-in");
    }, 1000);
  };

  const handleStaySignedIn = (
    remember: boolean
  ) => {
    if (remember || staySignedIn) {
      const account: RememberedAccount = {
        email,
      };

      localStorage.setItem(
        AUTH_CONFIG.rememberedAccountKey,
        JSON.stringify(account)
      );

      notifyRememberedAccount();
    }

    localStorage.setItem(
      AUTH_CONFIG.sessionKey,
      JSON.stringify({
        email,
        authenticated: true,
      })
    );

    router.push("/Admin/Dashboard");
  };

  const handleRemoveAccount = () => {
    localStorage.removeItem(
      AUTH_CONFIG.rememberedAccountKey
    );

    notifyRememberedAccount();
    setShowAccountMenu(false);
    setEmail("");

    goToStep("account");
  };

  const handleBack = () => {
    setErrorMessage("");

    if (
      step === "email" ||
      step === "email-error"
    ) {
      goToStep("account");
      return;
    }

    if (
      step === "password" ||
      step === "password-error"
    ) {
      goToStep("email");
      return;
    }

    if (step === "verification") {
      goToStep("authenticator");
      return;
    }

    if (step === "verification-error") {
      goToStep("verification");
      return;
    }
  };

  const canGoBack =
    step === "email" ||
    step === "email-error" ||
    step === "password" ||
    step === "password-error" ||
    step === "verification" ||
    step === "verification-error";

  return (
    <main className="login-page">
      <div className="background-overlay" />

      <div className="up-brand">
        <Image
          src="/photo/ict-logo.png"
          alt="University of Phayao"
          width={82}
          height={100}
          priority
        />
      </div>

      <section className="login-container">
        <div className="login-card login-card-animation">
          {canGoBack && (
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {step === "account" && (
            <div className="step-content">
              <Logo />

              <h1>Pick an account</h1>

              <p className="subtitle">
                Choose an account to continue to
                UP Office 365
              </p>

              {rememberedAccount && (
                <div className="account-wrapper">
                  <button
                    type="button"
                    className="account-item"
                    onClick={handleRememberedAccount}
                  >
                    <div className="account-avatar">
                      {rememberedAccount.email
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="account-information">
                      <strong>
                        {rememberedAccount.email}
                      </strong>

                      <span>
                        UP Office 365
                      </span>
                    </div>

                    <div className="account-menu-container">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setShowAccountMenu(
                            !showAccountMenu
                          );
                        }}
                        aria-label="Account menu"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showAccountMenu && (
                        <div className="account-menu">
                          <button
                            type="button"
                            onClick={handleRemoveAccount}
                          >
                            <Trash2 size={15} />
                            Remove account
                          </button>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )}

              <button
                type="button"
                className="secondary-button"
                onClick={handleUseAnotherAccount}
              >
                <Plus size={17} />
                Use another account
              </button>
            </div>
          )}

          {(step === "email" ||
            step === "email-error") && (
              <div className="step-content">
                <Logo />

                <h1>Sign in</h1>

                <p className="account-hint">
                  Use your UP Office 365 account
                </p>

                <form
                  onSubmit={handleEmailSubmit}
                  noValidate
                >
                  <div className="input-group">
                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (
                          step === "email-error"
                        ) {
                          setErrorMessage("");
                          goToStep("email");
                        }
                      }}
                      placeholder="admin@up.ac.th"
                      autoComplete="username"
                      autoFocus
                      className={
                        step === "email-error"
                          ? "input error-input"
                          : "input"
                      }
                    />

                    {step === "email-error" && (
                      <div
                        className="error-message"
                        aria-live="polite"
                      >
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Next
                  </button>
                </form>
              </div>
            )}

          {step === "loading-email" && (
            <LoadingContent
              text="กำลังตรวจสอบบัญชี..."
            />
          )}

          {(step === "password" ||
            step === "password-error") && (
              <div className="step-content">
                <Logo />

                <div className="small-account">
                  <div className="mini-avatar">
                    {email.charAt(0).toUpperCase()}
                  </div>

                  <span>{email}</span>
                </div>

                <h1>Enter password</h1>

                <form
                  onSubmit={handlePasswordSubmit}
                  noValidate
                >
                  <div className="input-group">
                    <label htmlFor="password">
                      Password
                    </label>

                    <div className="password-wrapper">
                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) => {
                          setPassword(
                            event.target.value
                          );

                          if (
                            step ===
                            "password-error"
                          ) {
                            setErrorMessage("");
                            goToStep("password");
                          }
                        }}
                        autoComplete="current-password"
                        autoFocus
                        className={
                          step ===
                            "password-error"
                            ? "input error-input password-input"
                            : "input password-input"
                        }
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {step === "password-error" && (
                      <div
                        className="error-message"
                        aria-live="polite"
                      >
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="forgot-button"
                  >
                    Forgot my password
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Sign in
                  </button>
                </form>
              </div>
            )}

          {step ===
            "loading-authenticator" && (
              <LoadingContent
                text="กำลังเตรียมการยืนยันตัวตน..."
                icon={<ShieldCheck size={34} />}
              />
            )}

          {step === "authenticator" && (
            <div className="step-content authenticator-content">
              <Logo />

              <h1>
                Approve sign in request
              </h1>

              <p className="subtitle">
                Open your UP Authenticator app
                and enter the number shown below.
              </p>

              <div className="verification-number">
                {verificationNumber}
              </div>

              <div className="authenticator-info">
                <ShieldCheck size={18} />

                <span>
                  This is a simulated
                  Authenticator verification
                  for the UP Office 365 demo.
                </span>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleContinueAuthenticator
                }
              >
                Continue
              </button>
            </div>
          )}

          {(step === "verification" ||
            step === "verification-error") && (
              <div className="step-content">
                <Logo />

                <h1>
                  Verify your identity
                </h1>

                <p className="subtitle">
                  Enter the number shown in your
                  Authenticator app.
                </p>

                <div className="code-display">
                  {verificationNumber}
                </div>

                <form
                  onSubmit={
                    handleVerificationSubmit
                  }
                  noValidate
                >
                  <div className="input-group">
                    <label htmlFor="verification">
                      Verification number
                    </label>

                    <input
                      id="verification"
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={verificationInput}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setVerificationInput(
                          value
                        );

                        if (
                          step ===
                          "verification-error"
                        ) {
                          setErrorMessage("");
                          goToStep(
                            "verification"
                          );
                        }
                      }}
                      autoFocus
                      placeholder="00"
                      className={
                        step ===
                          "verification-error"
                          ? "input code-input error-input"
                          : "input code-input"
                      }
                    />

                    {step ===
                      "verification-error" && (
                        <div
                          className="error-message"
                          aria-live="polite"
                        >
                          {errorMessage}
                        </div>
                      )}
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Verify
                  </button>
                </form>
              </div>
            )}

          {step === "verifying" && (
            <LoadingContent
              text="กำลังยืนยันตัวตน..."
              icon={<ShieldCheck size={34} />}
            />
          )}

          {step === "stay-signed-in" && (
            <div className="step-content">
              <Logo />

              <div className="small-account">
                <div className="mini-avatar">
                  {email.charAt(0).toUpperCase()}
                </div>

                <span>{email}</span>
              </div>

              <h1>Stay signed in?</h1>

              <p className="subtitle">
                Do this to reduce the number of
                times you are asked to sign in.
              </p>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(event) =>
                    setStaySignedIn(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Don&apos;t show this again
                </span>
              </label>

              <div className="stay-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleStaySignedIn(false)
                  }
                >
                  No
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    handleStaySignedIn(true)
                  }
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          <div className="card-footer">
            <span>
              UP Office 365
            </span>

            <span>University of Phayao</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <div className="login-logo">
      <Image
        src="/photo/ict-logo.png"
        alt="UP Office 365"
        width={82}
        height={100}
      />

      <span>UP Office 365</span>
    </div>
  );
}

function LoadingContent({
  text,
  icon,
}: {
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="loading-content">
      {icon ? (
        <div className="loading-icon">
          {icon}
        </div>
      ) : (
        <div className="spinner" />
      )}

      <div className="loading-logo">
        UP Office 365
      </div>

      <p>{text}</p>

      <div className="loading-line">
        <span />
      </div>
    </div>
  );
}