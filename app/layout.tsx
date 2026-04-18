import './globals.css'
import GlobalNav from '@/components/GlobalNav'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className="bg-[#0D0D0D] text-[#F5F3EE]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <GlobalNav />
        {children}
      </body>
    </html>
  )
}
