import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import { errorMessage } from "../../api/client";
import { useAppToast } from "../../components/ui/Toast";
import { AuthButton, PasswordInput } from "./AuthFields";
import { AuthCard, AuthLayout } from "./AuthLayout";

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: { password?: string; confirm?: string } = {};
    if (!token) next.password = "This reset link is missing its token. Request a new link.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast({ title: "Password updated", description: "Sign in with your new password.", status: "success" });
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setErrors({ password: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<LockKeyhole size={15} />}
        eyebrow="Account recovery"
        title="Choose a new password"
        description="Pick a password you have not used before. All other sessions stay signed in."
      >
        {done ? (
          <div className="flex items-start gap-2 rounded-[6px] border border-line bg-surface-2 px-3 py-3 text-tn text-ink-2">
            <CheckCircle2 size={15} className="mt-px shrink-0 text-ok" />
            <span>Password updated. Redirecting to sign in…</span>
          </div>
        ) : (
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
            <PasswordInput
              id="password"
              label="New password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              icon={<LockKeyhole size={14} />}
            />
            <PasswordInput
              id="confirm"
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Repeat the password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              error={errors.confirm}
              icon={<LockKeyhole size={14} />}
            />
            <AuthButton type="submit" loading={busy}>
              {busy ? "Updating…" : "Update password"}
            </AuthButton>
          </form>
        )}
      </AuthCard>
      <p className="mt-4 text-center text-tn text-ink-3">
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-strong">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
