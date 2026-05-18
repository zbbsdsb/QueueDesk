import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueDesk",
  description: "AI-first internal service desk for modern teams",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563eb'/><text y='.9em' font-size='80' x='15'>⚡</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    // silent
  }

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased bg-background text-foreground font-sans">
        <AuthProviderWrapper initialUser={initialUser}>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
