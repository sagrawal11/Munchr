export const metadata = {
  title: 'Privacy — Munchr for Operators',
  description: 'How Munchr handles data: anonymous consumer analytics by design, and operator data owned and isolated per operator.',
};

const wrap = { maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function OperatorPrivacyPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Privacy</h1>
      <p style={muted}>Operator platform · Last updated: June 2026</p>

      <p style={{ marginTop: '1.25rem' }}>
        Munchr is <strong>anonymous by design</strong> on the consumer side and treats your operator data as
        <strong> yours</strong>. The student-facing app does not require an account and does not collect any
        consumer&apos;s name, email, phone number, or student ID.
      </p>

      <h2 style={h2}>Consumer data we collect</h2>
      <ul>
        <li>An <strong>anonymous session id</strong> (a random value stored in the browser for the visit) — not linked to any identity.</li>
        <li>Which products and machines a visitor <strong>searches for and taps</strong>, and whether a search found results.</li>
        <li><strong>Approximate context</strong> — the campus and building associated with a result, and device type (mobile/desktop).</li>
      </ul>
      <p>
        If a visitor enables location, it is used <strong>in their browser only</strong> to sort machines by distance.
        We do <strong>not store precise coordinates</strong>. Consumer insights are reported in aggregate only and are
        never tied to an individual.
      </p>

      <h2 style={h2}>Operator &amp; customer data</h2>
      <p>
        Vending operators use separate, authenticated accounts to view their analytics. For operator customers we
        process: the authorized user&apos;s email and login metadata, and the operator&apos;s own business data
        (machine catalog, inventory, and optional sales data they connect via CSV or the Nayax API). This data is{' '}
        <strong>owned by the operator</strong>, used only to deliver their analytics, and <strong>isolated per
        operator</strong> — one operator cannot see another&apos;s data. Integration credentials (e.g., a Nayax token)
        are used server-side and not stored, or stored encrypted and scoped to that operator. Full detail is on our{' '}
        <a href="/operator/trust">Trust &amp; Security</a> page and in our{' '}
        <a href="/operator/dpa">Data Processing Agreement</a>.
      </p>

      <h2 style={h2}>What we don&apos;t do</h2>
      <ul>
        <li>No advertising or selling of personal data.</li>
        <li>No third-party tracking or behavioral profiling of individuals.</li>
        <li>We never sell your identifiable operator data, and we never share one operator&apos;s data with another.</li>
      </ul>

      <h2 style={h2}>Service providers (subprocessors)</h2>
      <p style={muted}>
        We use <strong>Supabase</strong> (managed database + authentication) and <strong>Vercel</strong> (hosting),
        both in the United States, and <strong>Nayax</strong> as a telemetry source when an operator connects it. We
        do not sell personal data to anyone.
      </p>

      <h2 style={h2}>Retention &amp; your choices</h2>
      <p style={muted}>
        Anonymous interaction events are retained on a rolling basis to power demand analytics. Operator data is
        retained for the term of the agreement and returned or deleted on request after termination. To request
        access or deletion, email <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={muted}>
        Questions or requests about privacy? Email <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>.
      </p>
    </div>
  );
}
