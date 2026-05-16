import { redirect } from "next/navigation";
import { FileArchive } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { users } from "@/lib/users";
import "./../globals.css";
 

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center p-4 mybg">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#2563eb] text-white shadow-xl shadow-blue-900/20">
            <FileArchive size={28} />
          </div>
          <h1 className="text-3xl font-extrabold">نظام إدارة الأرشيف الإلكترونى</h1>
          <p className="mt-2 font-semibold text-slate-500">أرشفة الوارد والصادر </p>
        </div>
        <LoginForm />
        <div className="mt-4 rounded-lg border border-slate-200 bg-white/80 p-4 text-sm font-semibold text-slate-500 shadow-sm">
          <p className="font-bold text-[#17201b]">حسابات تجريبية:</p>
          <p>مدير: {users[0].username} / {users[0].password}</p>
          <p>وارد: incoming1 / In@123</p>
          <p>صادر: outgoing1 / Out@123</p>
          <p>مشاهدة: viewer1 / View@123</p>
        </div>
      </section>
    </main>
  );
}
