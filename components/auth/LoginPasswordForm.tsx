"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/masuk/actions";
import {
  AlertError,
  buttonAmber,
  inputGlass,
  labelGlass,
} from "@/components/auth/auth-ui";

/**
 * Form email + password (dipakai di halaman /masuk).
 * callbackUrl disimpan sebagai hidden input agar tetap dipertahankan.
 */
export default function LoginPasswordForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  const showError = !!state?.error;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}
      {showError && <AlertError message={state.error!} />}

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
          className={inputGlass}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={labelGlass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          className={inputGlass}
          required
        />
      </div>

      <button type="submit" className={buttonAmber} disabled={isPending}>
        {isPending ? "Memproses…" : "Masuk"}
      </button>

      <p className="text-center text-xs text-white/50">
        Lupa password? Untuk sekarang silakan masuk lewat{" "}
        <Link href="/masuk" className="font-semibold text-amber-brand underline-offset-2 hover:underline">
          Google
        </Link>{" "}
        atau daftar ulang dengan email lain.
      </p>
    </form>
  );
}
