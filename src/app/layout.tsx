import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueDesk",
  description: "AI-first internal service desk for modern teams",
};

type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 服务端获取当前登录用户，注入 AuthProvider
  let initialUser: AppUser | null = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const { data } = await supabase
        .from("app_user")
        .select("*")
        .eq("id", authUser.id)
        .single();
      initialUser = data;
    }
  } catch {
    // 未登录或服务端查询失败，initialUser 为 null
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProviderWrapper initialUser={initialUser}>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
