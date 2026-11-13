import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import { errorMessage } from "../../api/client";
import { useAppToast } from "../../components/ui/Toast";
import { AuthButton, TextInput } from "./AuthFields";
import { AuthCard, AuthLayout } from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const location = useLocation();
  const toast = useAppToast();
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? "");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid work email.");
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      toast({ title: "Request failed", description: errorMessage(err), status: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<KeyRound size={15} />}
        eyebrow="Account recovery"
        title="Reset your password"
        description="Enter your work email and we will send a single-use reset link. The link expires after 60 minutes."
      >
        {sent ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-[6px] border border-line bg-surface-2 px-3 py-3 text-tn text-ink-2">
              <CheckCircle2 size={15} className="mt-px shrink-0 text-ok" />
              <span>
                If an account exists for <span className="font-semibold text-ink">{email.trim()}</span>,
                a reset link is on its way.
              </span>
            </div>
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] border border-line-strong bg-surface text-tn font-medium text-ink-2 transition-colors hover:border-ink-4 hover:bg-surface-2"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
            <TextInput
              id="email"
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={error}
              icon={<Mail size={14} />}
            />
            <AuthButton type="submit" loading={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
