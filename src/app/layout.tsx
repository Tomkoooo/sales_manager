import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/context/useUser";
import Sidebar from "@/components/sidebar/sidebar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" data-theme="cupcake">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
