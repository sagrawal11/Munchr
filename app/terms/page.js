export const metadata = {
  title: 'Terms of Use — Munchr',
  description: 'The simple terms for using the Munchr campus vending app. No account, no personal data.',
};

const wrap = { maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function TermsPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Terms of Use</h1>
      <p style={muted}>For the Munchr student app · Last updated: June 2026</p>

      <p style={{ marginTop: '1.25rem' }}>
        Munchr is a free app that helps you find snacks and drinks in vending machines across campus. By using it,
        you agree to these simple terms. If you don&apos;t agree, please don&apos;t use the app.
      </p>

      <h2 style={h2}>No account, no personal data</h2>
      <p>
        There is nothing to sign up for. Munchr does <strong>not</strong> ask for, collect, or store any personal
        information about you — no name, email, phone number, or student ID — and there is <strong>no way for us to
        identify you</strong>. Exactly what limited, anonymous information the app records is described in our{' '}
        <a href="/privacy">Privacy Policy</a>, which forms part of these terms.
      </p>

      <h2 style={h2}>Using the app</h2>
      <p>
        Munchr is provided for your personal, non-commercial use to help you locate vending machines. Please use it
        respectfully: don&apos;t attempt to disrupt, overload, hack, scrape, reverse-engineer, or misuse the service,
        and don&apos;t use it for any unlawful purpose.
      </p>

      <h2 style={h2}>Accuracy &amp; availability</h2>
      <p>
        Munchr shows vending machine locations and what they&apos;re likely to stock, but machines are restocked and
        priced by third parties and change constantly. We can&apos;t guarantee that an item, price, or machine shown in
        the app is currently available. Treat Munchr as a helpful guide, not a guarantee, and confirm at the machine.
      </p>

      <h2 style={h2}>&quot;As is,&quot; no warranties</h2>
      <p>
        The app is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available,&quot;</strong> without
        warranties of any kind. We don&apos;t promise the app will always be available, accurate, or error-free.
      </p>

      <h2 style={h2}>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Munchr is not liable for any indirect, incidental, or consequential
        damages arising from your use of the app — including a machine being out of an item you expected. The app is
        free, and your use of it is at your own discretion and risk.
      </p>

      <h2 style={h2}>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the app after an update means you accept the
        revised terms. The &quot;last updated&quot; date above will always reflect the current version.
      </p>

      <h2 style={h2}>Governing law &amp; contact</h2>
      <p style={muted}>
        These terms are governed by the laws of the State of North Carolina. Questions? Email{' '}
        <a href="mailto:hello@munchr.app">hello@munchr.app</a>.
      </p>
    </div>
  );
}
