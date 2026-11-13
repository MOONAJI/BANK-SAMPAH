"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";

type RegisterFormProps = {
    serverError?: string;
};

export function RegisterForm({ serverError }: RegisterFormProps) {
    return (
        <>
            {serverError && <FormAlert>{serverError}</FormAlert>}

            <form className="flex flex-col gap-[14px] pb-4">
                <Field id="name" label="Nama lengkap" autoComplete="name" required />
                <Field
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                />
                <Field
                    id="phone"
                    label="Nomor HP"
                    hint="opsional"
                    type="tel"
                    autoComplete="tel"
                    placeholder="08123456789"
                />
                <Field
                    id="address"
                    label="Alamat"
                    autoComplete="street-address"
                    placeholder="RT / blok / nomor rumah"
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <Field
                        id="password"
                        label="Kata sandi"
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                    <Field
                        id="confirmPassword"
                        label="Ulangi kata sandi"
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                </div>

                <Button type="submit">Daftar sebagai nasabah</Button>
            </form>
        </>
    );
}