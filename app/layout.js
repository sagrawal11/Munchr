import './globals.css';

export const metadata = {
  title: 'Munchr — Duke Campus Vending',
  description: 'Find snacks and drinks at vending machines across Duke University campus.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <div className="hero-section">
            <div className="container">
              <div className="hero-logo">
                <a href="/">
                  <img
                    src="/munchrlogo.png"
                    alt="Munchr Logo"
                    className="hero-logo-image"
                  />
                </a>
              </div>
              <p className="hero-description">Your Guide to Vending Machines on Campus</p>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
