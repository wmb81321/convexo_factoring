import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Convexo Wallet - Next-Generation Smart Web3 Wallet",
  description: "Experience the future of Web3 with Convexo's smart wallet. Gasless transactions, social login, " +
    "and seamless onchain interactions on Ethereum mainnet.",
  keywords: [
    "Web3 wallet",
    "Smart wallet", 
    "Gasless transactions",
    "Account abstraction",
    "Ethereum",
    "DeFi",
    "Social login",
    "Convexo"
  ],
  authors: [{ name: "Convexo Team" }],
  creator: "Convexo",
  publisher: "Convexo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://convexus.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Convexo Wallet - Smart Web3 Wallet",
    description: "Next-generation smart wallet with gasless transactions and social authentication",
    url: "https://convexus.vercel.app",
    siteName: "Convexo Wallet",
    images: [
      {
        url: "/convexo-logo.png",
        width: 1200,
        height: 630,
        alt: "Convexo Wallet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convexo Wallet - Smart Web3 Wallet",
    description: "Next-generation smart wallet with gasless transactions",
    images: ["/convexo-logo.png"],
    creator: "@ConvexoFinance",
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
  verification: {
    google: "your-google-verification-code",
  },
  manifest: "/manifest.json",
  themeColor: "#4B66F3",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Convexo",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Convexo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/convexo-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Convexo" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4B66F3" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered: ', registration))
                    .catch(registrationError => console.log('SW registration failed: ', registrationError));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
