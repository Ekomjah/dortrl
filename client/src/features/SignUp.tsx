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
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useNavigate } from "react-router";

interface TextInputValueChange {
  target: {
    value: string;
  };
}

interface SignUpFormState {
  email: string;
  password: string;
  name: string;
}

export function SignUpForm() {
  const [email, setEmail] = useState<SignUpFormState["email"]>("");
  const [password, setPassword] = useState<SignUpFormState["password"]>("");
  const [name, setName] = useState<SignUpFormState["name"]>("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  function changePassword(e: TextInputValueChange): void {
    setPassword(e.target.value);
  }

  function changeName(e: TextInputValueChange): void {
    setName(e.target.value);
  }

  function changeEmail(e: TextInputValueChange): void {
    setEmail(e.target.value);
  }

  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name,
        email: email,
        password: password,
        image: `https://api.dicebear.com/10.x/avataaars/svg?seed=${crypto.randomUUID()}`,
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
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create an Dortrl Account</FieldLegend>
              <FieldDescription>Secured with BetterAuth</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    Your Name (First + Last Name)
                  </FieldLabel>
                  <Input
                    type="name"
                    id="name"
                    value={name}
                    onChange={changeName}
                    placeholder="John Doe"
                    required
                  />
                </Field>
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
                      value={password}
                      onChange={changePassword}
                      min={8}
                      max={128}
                      required
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
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />

            <Field orientation="horizontal">
              <CustomBtn
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
        <p className="text-md mt-8 text-red-500">{formError && formError}</p>
      </div>
    </div>
  );
}
