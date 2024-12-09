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
      <link rel="shortcut icon" href="./image.svg" type="image/x-icon" />
      <title>Sales Manager</title>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
