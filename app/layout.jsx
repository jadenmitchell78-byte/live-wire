import './globals.css';

export const metadata = {
  title: 'LIVE WIRE // Sports & Media Hub',
  description: 'Low-latency live sports scoreboard, multi-view player, and 24/7 channel hub.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-gray-100 antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
