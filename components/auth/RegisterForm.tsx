"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/daftar/actions";
import {
  AlertError,
  buttonAmber,
  inputGlass,
  labelGlass,
} from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

/**
 * Form pendaftaran akun (username + email + password).
 */
export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, {});
  const fieldErrors = state?.fieldErrors ?? {};

  function inputCls(field: string) {
    return cn(inputGlass, fieldErrors[field] && "border-rose-400/60");
  }

  function fieldError(field: string) {
    return fieldErrors[field] ? (
      <p className="mt-1 text-xs text-rose-200">{fieldErrors[field]}</p>
    ) : null;
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.error && <AlertError message={state.error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelGlass}>
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Nama kamu"
            className={inputCls("name")}
            required
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="username" className={labelGlass}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="usernamekamu"
            pattern="[A-Za-z0-9_]+"
            className={inputCls("username")}
            required
          />
          {fieldError("username")}
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelGlass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className={inputCls("email")}
          required
        />
        {fieldError("email")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className={labelGlass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="min. 8 karakter"
            minLength={8}
            className={inputCls("password")}
            required
          />
          {fieldError("password")}
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelGlass}>
            Ulangi Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="ulangi password"
            minLength={8}
            className={inputCls("confirmPassword")}
            required
          />
          {fieldError("confirmPassword")}
        </div>
      </div>

      <button type="submit" className={buttonAmber} disabled={isPending}>
        {isPending ? "Membuat akun…" : "Daftar"}
      </button>
    </form>
  );
}
