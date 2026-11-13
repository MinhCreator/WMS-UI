import { ArrowRight, CheckCircle2, Mail, UserPlus, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import { errorMessage, fieldErrors } from "../../api/client";
import { useAppToast } from "../../components/ui/Toast";
import { AuthButton, TextInput } from "./AuthFields";
import { AuthCard, AuthLayout } from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestErrors = { name?: string; email?: string; reason?: string };

export default function SignupForm() {
  const toast = useAppToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<RequestErrors>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: RequestErrors = {};

    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid work email.";
    if (reason.trim().length < 10) {
      next.reason = "Tell us which site and duties you need access for.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const [firstName, ...rest] = name.trim().split(/\s+/);
    setBusy(true);
    try {
      await authApi.requestAccess({
        email: email.trim(),
        firstName,
        lastName: rest.join(" ") || undefined,
        reason: reason.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      const details = fieldErrors(error);
      setErrors({
        name: details.firstName,
        email: details.email,
        reason: details.reason,
      });
      toast({ title: "Request not sent", description: errorMessage(error), status: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<UserPlus size={15} />}
        eyebrow="Access request"
        title="Request a workspace account"
        description="Registration is invite-only. Submit your details and an administrator will review the request and send an invite."
      >
        {submitted ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-[6px] border border-line bg-surface-2 px-3 py-3 text-tn text-ink-2">
              <CheckCircle2 size={15} className="mt-px shrink-0 text-ok" />
              <span>
                <span className="font-semibold text-ink">Request received.</span> If the
                request is approved, an invite link will be sent to{" "}
                <span className="font-semibold text-ink">{email.trim()}</span>.
              </span>
            </div>
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-[6px] border border-line-strong bg-surface text-tn font-medium text-ink-2 transition-colors hover:border-ink-4 hover:bg-surface-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
            <TextInput
              id="name"
              label="Full name"
              autoComplete="name"
              placeholder="Alex Morgan"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              icon={<UserRound size={14} />}
            />

            <TextInput
              id="email"
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              icon={<Mail size={14} />}
            />

            <div className="min-w-0">
              <label htmlFor="reason" className="mb-1.5 block text-tn font-medium text-ink">
                Why do you need access?
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Site, shift and the duties you will perform (receiving, picking, planning…)."
                className={`w-full resize-none rounded-[6px] border bg-surface p-2.5 text-tn text-ink outline-none placeholder:text-ink-4 ${
                  errors.reason
                    ? "border-danger!"
                    : "border-line-strong! focus:border-accent! focus:ring-2 focus:ring-accent/20"
                }`}
              />
              {errors.reason && (
                <p role="alert" className="mt-1 text-2xs font-medium text-danger">
                  {errors.reason}
                </p>
              )}
            </div>

            <AuthButton type="submit" loading={busy}>
              {busy ? (
                "Sending request…"
              ) : (
                <>
                  Submit request
                  <ArrowRight size={14} />
                </>
              )}
            </AuthButton>
          </form>
        )}
      </AuthCard>

      <p className="mt-4 text-center text-tn text-ink-3">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent transition-colors hover:text-accent-strong">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
