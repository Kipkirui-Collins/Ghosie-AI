import "./globals.css";
import { ReactNode } from "react";
import Providers from "../components/Providers";

export const metadata = {
  title: "Ghosie AI",
  description: "Futuristic AI chatbox"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
