import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { useAppToast } from "../../components/ui/Toast";
import { useAppDispatch } from "../../states/hooks";
import { acceptInvite } from "../../states/slices/authSlice";
import { AuthButton, PasswordInput, TextInput } from "./AuthFields";
import { AuthCard, AuthLayout } from "./AuthLayout";

type InviteErrors = { name?: string; password?: string; confirm?: string };

export default function AcceptInviteForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useAppToast();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<InviteErrors>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: InviteErrors = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const [firstName, ...rest] = name.trim().split(/\s+/);
    setBusy(true);
    try {
      await dispatch(
        acceptInvite({
          token,
          password,
          firstName,
          lastName: rest.join(" ") || undefined,
        }),
      ).unwrap();
      toast({ title: "Welcome aboard", description: "Your account is ready.", status: "success" });
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ password: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<ShieldCheck size={15} />}
        eyebrow="Invitation"
        title="Accept your invite"
        description="Set your name and password to activate the account your administrator invited."
      >
        {!token && (
          <div className="mb-4 rounded-[6px] border border-danger-line bg-danger-bg px-2.5 py-2 text-2xs text-danger">
            This link is missing its invite token. Ask your administrator for a new invite.
          </div>
        )}
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
          <PasswordInput
            id="password"
            label="Password"
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
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat the password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={errors.confirm}
            icon={<LockKeyhole size={14} />}
          />
          <AuthButton type="submit" loading={busy} disabled={!token}>
            {busy ? (
              "Activating…"
            ) : (
              <>
                Activate account
                <ArrowRight size={14} />
              </>
            )}
          </AuthButton>
        </form>
      </AuthCard>
      <p className="mt-4 text-center text-2xs text-ink-4">
        Already activated?{" "}
        <Link to="/login" className="font-semibold text-accent hover:text-accent-strong">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
