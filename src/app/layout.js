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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${changaone.variable} ${poppins.variable} antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
