import type { Metadata, Viewport } from "next";
import { Noto_Sans, Space_Grotesk, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["latin"],
  variable: "--font-urdu",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "HUJRA 2.0 — Live Voice Rooms for Gen Z",
  description:
    "Tapay Night, Cricket Talk, Late Night Gup. Join as speaker or listener, raise hand, chai & qehwa reactions, Urdu live captions, room recording.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HUJRA",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "HUJRA 2.0 — Live Voice Rooms for Gen Z",
    description:
      "Gup ki raat, live voice rooms. Tapay Night, Cricket Talk, Late Night Gup.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${urdu.variable}`}
    >
      <body className="font-body min-h-screen">
        {children}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-1/4 h-96 w-96 animate-float-y rounded-full bg-[#a3e635]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/5 h-80 w-80 animate-float-y rounded-full bg-violet-500/10 blur-[120px] [animation-delay:2s]" />
          <div className="absolute top-1/3 left-1/2 h-64 w-64 animate-float-y rounded-full bg-cyan-400/10 blur-[100px] [animation-delay:4s]" />
        </div>
      </body>
    </html>
  );
}
