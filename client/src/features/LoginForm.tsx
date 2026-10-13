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

export function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="flex justify-center min-h-screen items-center">
      <form className="w-full max-w-md rounded-md bg-gray-100 p-8 shadow-lg">
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
                    className="relative"
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    className="absolute right-1 top-0 hover:bg-transparent"
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
              className="h-9 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 active:translate-y-px"
            >
              Clear
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
