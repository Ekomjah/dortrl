import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import CustomBtn from "./Button";
import { SocialAuthButtons } from "./SocialAuth";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth/auth-client";
import { Link } from "react-router";
interface TextInputValueChange {
  target: {
    value: string;
  };
}

interface SignUpFormState {
  email: string;
  password: string;
}

export function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState<SignUpFormState["email"]>("");
  const [password, setPassword] = useState<SignUpFormState["password"]>("");
  const [rememberUser, setRememberUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const changeEmail = (e: TextInputValueChange) => setEmail(e.target.value);
  const changePassword = (e: TextInputValueChange) =>
    setPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email,
        password: password,
        rememberMe: rememberUser,
        callbackURL: `${window.location.origin}/`,
      });
      if (error) {
        setFormError(error.message ?? "Could not create your account");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Sign-up failed:", err);
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-md bg-gray-100 p-8 shadow-lg">
        <SocialAuthButtons />
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>
                Log in to your{" "}
                <Link to="/" className="font-bold underline">
                  Dortrl
                </Link>{" "}
                Account
              </FieldLegend>
              <FieldDescription>Secured with BetterAuth</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={changeEmail}
                    placeholder="evilrabbit@example.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isVisible ? "text" : "password"}
                      required
                      value={password}
                      onChange={changePassword}
                      className="relative"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      className="absolute top-0 right-1 hover:bg-transparent"
                      onClick={() => setIsVisible(!isVisible)}
                    >
                      {isVisible ? <Eye className="w-full" /> : <EyeOff />}
                    </Button>
                  </div>
                </Field>{" "}
                <Field orientation="horizontal">
                  <Checkbox
                    checked={rememberUser}
                    onCheckedChange={(checked) =>
                      setRememberUser(checked === true)
                    }
                    id="remember-me"
                    name="remember-me"
                  />
                  <FieldLabel htmlFor="remember-me">Remember me?</FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />

            <Field orientation="horizontal">
              <CustomBtn
                disabled={loading}
                text={loading ? "Submitting" : "Submit"}
                type="submit"
              />
              <Button
                variant="outline"
                type="reset"
                className="h-9 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 active:translate-y-px"
              >
                Clear
              </Button>
            </Field>
          </FieldGroup>
        </form>
        <p className="text-md mt-4 text-red-500">{formError && formError}</p>

        <div className="flex gap-0.5 text-gray-500">
          <p>Don't have an account?</p>
          <a href="/sign-up" className="underline">
            Create one!
          </a>
        </div>
      </div>
    </div>
  );
}
