import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#121110",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://moments.studioclicked.lk"),
  title: {
    default: "Moments by Studio Click.ed | Luxury Digital Invitations & RSVP Platform",
    template: "%s | Moments by Studio Click.ed",
  },
  description:
    "Couture digital invitations, seamless WhatsApp guest distribution, multi-event itineraries (Poruwa, Church, Reception, Homecoming), and real-time household RSVP management for modern Sri Lankan celebrations.",
  keywords: [
    "Digital wedding invitations Sri Lanka",
    "Online wedding invitations Colombo",
    "Moments by Studio Click.ed",
    "Studio Clicked wedding platform",
    "Poruwa ceremony digital invitations",
    "Kandyan wedding invitation design",
    "WhatsApp wedding invitation sender",
    "Sri Lankan wedding RSVP tracker",
    "Household RSVP guest management",
    "Multi-event wedding itinerary Sri Lanka",
    "Bespoke digital invitations Sri Lanka",
    "Interactive wedding card website",
    "Nakath times wedding card",
    "Wedding catering guest manager",
  ],
  authors: [{ name: "Studio Click.ed", url: "https://studioclicked.lk" }],
  creator: "Studio Click.ed",
  publisher: "Moments by Studio Click.ed",
  applicationName: "Moments",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "https://moments.studioclicked.lk",
    siteName: "Moments by Studio Click.ed",
    title: "Moments by Studio Click.ed | Couture Digital Invitations & RSVP",
    description:
      "Curated digital invitations and effortless guest management engineered for Sri Lanka's most meaningful wedding celebrations.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Moments by Studio Click.ed — Digital Invitations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moments by Studio Click.ed | Luxury Digital Invitations",
    description:
      "Bespoke digital invitations, WhatsApp dispatch, and RSVP guest management tailored for Sri Lankan weddings.",
    images: ["/og-image.jpg"],
    creator: "@studioclicked",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#121110]`}
    >
      <head>
        <link rel="canonical" href="https://moments.studioclicked.lk" />
      </head>
      <body className="min-h-full flex flex-col bg-[#121110] text-zinc-300 selection:bg-[#B8905B]/30 selection:text-[#FDFAF4]">
        {children}
      </body>
    </html>
  );
}