import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TANAMANKU - Coffee Supply Chain",
  description: "TANAMANKU - Coffee Supply Chain Transparency",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="id"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
      <head>
        {/* Disable password manager auto-suggestions */}
        <meta httpEquiv="pragma" content="no-cache" />
        <meta name="description" content="TANAMANKU - Coffee Supply Chain Transparency" />
        {/* Disable password managers */}
        <script
            dangerouslySetInnerHTML={{
              __html: `
              document.addEventListener('beforeunload', () => {
                document.querySelectorAll('input[type="password"]').forEach(input => {
                  input.autocomplete = 'off';
                  input.setAttribute('data-lpignore', 'true');
                });
              });
            `,
            }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
      </html>
  );
}