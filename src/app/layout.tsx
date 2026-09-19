import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { TasksProvider } from "@/context/TasksContext";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAHAARA — Your Digital Companion",
  description: "Simple help for everyday digital life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SettingsProvider>
          <TasksProvider>
            <Navigation />
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
              {children}
            </main>
          </TasksProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
