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
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const changeEmail = (e: TextInputValueChange) => setEmail(e.target.value);
  const changePassword = (e: TextInputValueChange) =>
    setPassword(e.target.value);

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setLoading(true)
    try{}
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-md bg-gray-100 p-8 shadow-lg">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Log in to your Dortrl Account</FieldLegend>
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
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />

            <Field orientation="horizontal">
              <CustomBtn text="Submit" type="submit" />
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
      </div>
    </div>
  );
}
