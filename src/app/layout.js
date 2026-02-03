import { Changa_One, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const changaone = Changa_One({
  variable: "--font-changa-one",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "JoinUp",
  description: "Game night, made easy.",
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JoinUp",
  },
};

export const viewport = {
  themeColor: "#fa5c00",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fa5c00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="JoinUp" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `,
          }}
        />
      </head>
      <body
        className={`${changaone.variable} ${poppins.variable} antialiased `}
      >
        <Toaster position="bottom-center" richColors theme="dark" />
        {children}
      </body>
    </html>
  );
}
