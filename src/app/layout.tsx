import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cleit Admin - Vivekananda Institute of Professional Studies - TC",
  description: "A unified platform for all the societies of Vivekananda Institute of Professional Studies — explore, wishlist, track events, set reminders, and never miss an opportunity to participate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
