import './globals.css';

export const metadata = {
  title: 'AMG VIP // LIVE WIRE — Sports, Anime & OTT Hub',
  description: 'AMG VIP Live Wire: Streamed.pk live sports, Sub/Dub Anime, ATP/WTA Tennis, multi-view player, and 24/7 channels.'
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
