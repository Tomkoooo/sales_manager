import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Bejelentkezés",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full my-auto items-center justify-center">
      <Toaster/>
      {children}
    </div>
  );
}