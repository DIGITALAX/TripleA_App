import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Modals from "@/components/Modals/modules/Modals";
import Header from "@/components/Common/modules/Header";
import Footer from "@/components/Common/modules/Footer";
import Animation from "./animation";

export const metadata: Metadata = {
  metadataBase: new URL("https://triplea.agentmeme.xyz"),
  title: "TripleA",
  robots: {
    googleBot: {
      index: true,
      follow: true,
    },
  },
  description: "",

  twitter: {
    card: "summary_large_image",
    title: "TripleA",
    description: "Everyone wins in this agent-to-earn story.",
    images: [
      "https://thedial.infura-ipfs.io/ipfs/QmNQ5fe9Ruyy8LDMgJbxCnM8upSus1eNriqnKda31Wcsut",
    ],
  },

  openGraph: {
    title: "TripleA",
    description: "Everyone wins in this agent-to-earn story.",
    images:
      "https://thedial.infura-ipfs.io/ipfs/QmNQ5fe9Ruyy8LDMgJbxCnM8upSus1eNriqnKda31Wcsut",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Providers>
          <Animation>
            <div className="relative w-full h-full flex flex-col items-start justify-start overflow-x-hidden min-h-96">
              <Header />
              {children}
            </div>
            <Footer />
            <Modals />
          </Animation>
        </Providers>
      </body>
    </html>
  );
}
