import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { RightSidebar } from "@/components/app/RightSidebar";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();

  // Redirect unauthenticated users to sign-in
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="app-shell relative min-h-screen bg-[#EEEFF3] text-[#2A2D3A]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgba(79,216,167,0.15),transparent_60%)]" />
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:gap-10 lg:px-10">
        <RightSidebar />
        <main className="min-w-0 flex-1">
          <div className="rounded-[32px] border border-white/60 bg-[#F8F9FC]/80 p-6 shadow-[20px_20px_60px_#CED1D8,-20px_-20px_60px_#FFFFFF] backdrop-blur-sm lg:p-10">
            <div className="space-y-10">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
