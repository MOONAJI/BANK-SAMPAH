"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";

type LoginFormProps = {
  serverError?: string;
  passwordError?: string;
};

export function LoginForm({ serverError, passwordError }: LoginFormProps) {
    return (
        <>
            {serverError && <FormAlert>{serverError}</FormAlert>}

            <form className="flex flex-col gap-[14px] pb-4">
                <Field
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                />
                <Field
                    id="password"
                    label="Kata sandi"
                    type="password"
                    autoComplete="current-password"
                    error={passwordError}
                    required
                />
                <Button type="submit">Masuk</Button>
            </form>
        </>
    );
}