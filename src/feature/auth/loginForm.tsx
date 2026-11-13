import {
  AlertCircle,
  ArrowRight,
  Building2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fieldErrors } from "../../api/client";
import { useAppToast } from "../../components/ui/Toast";
import { useAppDispatch, useAppSelector } from "../../states/hooks";
import { login, selectAuthError } from "../../states/slices/authSlice";
import {
  AuthButton,
  AuthDivider,
  PasswordInput,
  TextInput,
} from "./AuthFields";
import { AuthCard, AuthLayout } from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginErrors = { email?: string; password?: string };

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const toast = useAppToast();
  const authError = useAppSelector(selectAuthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: LoginErrors = {};

    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid work email.";
    }
    if (password.length < 1) {
      next.password = "Enter your password.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
      toast({ title: "Signed in", description: "Welcome back.", status: "success" });
      navigate(from ?? "/", { replace: true });
    } catch (error) {
      const details = fieldErrors(error);
      setErrors({
        email: details.email,
        password: details.password,
      });
    } finally {
      setBusy(false);
    }
  }

  function handleSso() {
    toast({
      title: "SSO is workspace-managed",
      description: "SAML is configured per site. Use email and password for this environment.",
      status: "info",
    });
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<LogIn size={15} />}
        eyebrow="Operator access"
        title="Sign in to your workspace"
        description="Enter your operator credentials to open the floor console. Sessions expire after 4 hours idle."
      >
        <div className="mb-4 flex items-start gap-2 rounded-[6px] border border-accent-line! bg-accent-soft px-2.5 py-2 text-2xs text-ink-2">
          <ShieldCheck size={13} className="mt-px shrink-0 text-accent" />
          <span>
            <span className="font-semibold text-ink">Invite-only access.</span> Accounts are
            created by an administrator. Need access?{" "}
            <Link to="/signup" className="font-semibold text-accent hover:text-accent-strong">
              Request it here
            </Link>
            .
          </span>
        </div>

        {authError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-[6px] border border-danger-line bg-danger-bg px-2.5 py-2 text-2xs text-danger"
          >
            <AlertCircle size={13} className="mt-px shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
          <TextInput
            id="email"
            label="Work email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
            icon={<Mail size={14} />}
          />

          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            icon={<LockKeyhole size={14} />}
            action={
              <Link
                to="/forgot-password"
                state={{ email }}
                className="text-2xs font-semibold text-accent transition-colors hover:text-accent-strong"
              >
                Forgot password?
              </Link>
            }
          />

          <AuthButton type="submit" loading={busy}>
            {busy ? (
              "Signing in…"
            ) : (
              <>
                Sign in
                <ArrowRight size={14} />
              </>
            )}
          </AuthButton>
        </form>

        <AuthDivider />

        <button
          type="button"
          onClick={handleSso}
          className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-line-strong bg-surface text-tn font-medium text-ink-2 transition-colors hover:border-ink-4 hover:bg-surface-2"
        >
          <Building2 size={14} />
          Continue with SSO
        </button>
      </AuthCard>

      <p className="mt-4 text-center text-tn text-ink-3">
        New to WarehouseOS?{" "}
        <Link
          to="/signup"
          className="font-semibold text-accent transition-colors hover:text-accent-strong"
        >
          Request access
        </Link>
      </p>
      <p className="mt-2 text-center text-2xs text-ink-4">
        Access is limited to authorized warehouse staff.
      </p>
    </AuthLayout>
  );
}
