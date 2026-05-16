"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur">
      <label>
        اسم المستخدم
        <input name="username" autoComplete="username" required />
      </label>
      <label>
        كلمة المرور
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-l from-[#0f766e] to-[#2563eb] px-4 py-3 font-extrabold text-white shadow-lg shadow-blue-900/10 transition hover:brightness-105 disabled:opacity-60"
      >
        <LogIn size={18} />
        {pending ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
