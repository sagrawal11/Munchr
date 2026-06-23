export const metadata = {
  title: 'Data Processing Agreement — Munchr for Operators',
  description: 'How Munchr processes operator data as a service provider: roles, security, subprocessors, retention, and breach notification.',
};

const wrap = { maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.75rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '0.92rem' };
const cell = { border: '1px solid #e2e8f0', padding: '0.5rem 0.6rem', textAlign: 'left', verticalAlign: 'top' };

export default function OperatorDpaPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Data Processing Agreement</h1>
      <p style={muted}>Summary for review · Last updated: June 2026 · <a href="mailto:privacy@munchr.app">privacy@munchr.app</a></p>

      <p style={{ marginTop: '1.25rem' }}>
        This summarizes how Munchr (&quot;Processor&quot;) processes data on behalf of an operator customer
        (&quot;Controller&quot;). A countersigned copy is available for your records — request one at{' '}
        <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>.
      </p>

      <h2 style={h2}>Roles &amp; instructions</h2>
      <p>You are the controller; Munchr is the processor. We process your data only on your documented instructions
        and to provide the Service — not for our own purposes (except aggregated, de-identified analytics that cannot
        identify you, your locations, or any individual).</p>

      <h2 style={h2}>Data &amp; subjects</h2>
      <table style={table}>
        <tbody>
          <tr><td style={cell}>Operator account data</td><td style={cell}>Authorized-user email, login metadata</td></tr>
          <tr><td style={cell}>Catalog &amp; inventory</td><td style={cell}>Machines, locations, products, availability, prices</td></tr>
          <tr><td style={cell}>Sales data (optional)</td><td style={cell}>Transaction quantities, prices, timestamps via CSV/Nayax</td></tr>
          <tr><td style={cell}>Consumer interactions</td><td style={cell}><strong>Anonymous</strong> search/tap events keyed by a random session ID — no PII</td></tr>
        </tbody>
      </table>

      <h2 style={h2}>Security measures</h2>
      <p>Row-level security and per-operator isolation; managed authentication with MFA; TLS in transit and encryption
        at rest; input validation, rate limiting, and hardened headers; secrets kept server-side; and integration-import
        history for traceability. Full detail on our <a href="/operator/trust">Trust &amp; Security</a> page.</p>

      <h2 style={h2}>Subprocessors</h2>
      <p>Supabase (managed database + authentication, USA), Vercel (hosting, USA), and Nayax (telemetry source, only if
        you connect it). We give reasonable notice of changes and remain responsible for their compliance.</p>

      <h2 style={h2}>Retention &amp; deletion</h2>
      <p>We retain your data for the term of our agreement and, on termination, return or delete it within 30 days on
        request (except where retention is legally required). You may request deletion of specified data at any time
        via <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>.</p>

      <h2 style={h2}>Breach notification</h2>
      <p>We notify affected customers without undue delay and within 72 hours of confirming a breach affecting your
        data, and cooperate on remediation.</p>

      <h2 style={h2}>Audit</h2>
      <p>On reasonable request (up to once per year, absent a breach), we provide our then-current security
        documentation and any certifications once obtained.</p>
    </div>
  );
}
