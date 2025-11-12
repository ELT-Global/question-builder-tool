import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Question Authoring Tool - Create, Import & Export Exam Questions",
  description: "Professional question authoring tool for creating MCQ exam questions. Import questions from CSV files, Google Sheets, or ZIP archives. Export to ZIP with images. Support for single/multiple choice questions with solution explanations.",
  keywords: [
    "question authoring",
    "exam questions",
    "MCQ creator",
    "multiple choice questions",
    "CSV import",
    "Google Sheets import",
    "ZIP import",
    "question bank",
    "test creation",
    "exam builder",
    "question management",
  ],
  authors: [{ name: "ELT Tech Team" }],
  creator: "ELT Tech Team",
  publisher: "ELT Tech Team",
  generator: "Next.js",
  applicationName: "Question Authoring Tool",
  icons: {
    icon: [
      {
        url: "/question-builder-tool/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/question-builder-tool/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/question-builder-tool/favicon.ico",
        type: "image/x-icon",
      },
    ],
    apple: "/question-builder-tool/apple-icon.png",
  },
  openGraph: {
    title: "Question Authoring Tool - Create, Import & Export Exam Questions",
    description: "Professional question authoring tool for creating MCQ exam questions. Import questions from CSV files, Google Sheets, or ZIP archives. Export to ZIP with images.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Question Authoring Tool - Create, Import & Export Exam Questions",
    description: "Professional question authoring tool for creating MCQ exam questions. Import questions from CSV files, Google Sheets, or ZIP archives.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
