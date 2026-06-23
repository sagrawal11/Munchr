import './globals.css';
import Footer from '../src/components/Footer';

export const metadata = {
  title: 'Munchr — Duke Campus Vending',
  description: 'Find snacks and drinks at vending machines across Duke University campus.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Munchr', statusBarStyle: 'default' },
  icons: { icon: '/favicon.png', apple: '/munchrlogo.png' },
};

export const viewport = {
  themeColor: '#00539B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Fonts via preconnect + <link> (parallel-fetched, not a render-blocking @import). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div className="app">
          <div className="hero-section">
            <div className="container">
              <div className="hero-logo">
                <a href="/">
                  <img
                    src="/munchrlogo.png"
                    alt="Munchr Logo"
                    className="hero-logo-image"
                    width="500"
                    height="116"
                    fetchPriority="high"
                  />
                </a>
              </div>
              <p className="hero-description">Your Guide to Vending Machines on Campus</p>
            </div>
          </div>
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
