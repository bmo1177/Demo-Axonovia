import { Fira_Sans, Fira_Code } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vigilo | Audit Logistique IA',
  description: 'Contrôle de facturation transport assisté par Intelligence Artificielle.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${firaSans.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen selection:bg-amber-100 selection:text-amber-900 font-sans">
        {children}
      </body>
    </html>
  )
}