export const metadata = {
  title: 'Privacy — Munchr',
  description: 'How Munchr handles data: anonymous by design, no personal information.',
};

const wrap = { maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function PrivacyPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Privacy</h1>
      <p style={muted}>Last updated: June 2026</p>

      <p style={{ marginTop: '1.25rem' }}>
        Munchr is <strong>anonymous by design</strong>. The student app does not require an account and
        does not collect your name, email, phone number, or student ID.
      </p>

      <h2 style={h2}>What we collect</h2>
      <ul>
        <li>An <strong>anonymous session id</strong> (a random value stored in your browser for the visit) — not linked to your identity.</li>
        <li>Which products and machines you <strong>search for and tap</strong>, and whether a search found results.</li>
        <li><strong>Approximate context</strong> — the campus and building associated with a result, your device type (mobile/desktop).</li>
      </ul>

      <h2 style={h2}>Location</h2>
      <p>
        If you choose to enable location, it is used <strong>in your browser only</strong> to sort vending
        machines by distance and show how far they are. We do <strong>not store your precise coordinates</strong>
        and we do not track your movement — analytics record at most campus- or building-level context.
        You can use Munchr without sharing location.
      </p>

      <h2 style={h2}>Why we collect it</h2>
      <p>
        Aggregated, anonymous demand data (what students look for, where, and when) helps vending operators
        stock the right products in the right places — fewer empty machines and missing items. Insights are
        reported in aggregate; they are never tied to an individual.
      </p>

      <h2 style={h2}>What we don&apos;t do</h2>
      <ul>
        <li>No advertising or selling of personal data.</li>
        <li>No third-party tracking or behavioral profiling of individuals.</li>
        <li>No personal accounts or identifiers for students.</li>
      </ul>

      <h2 style={h2}>Operator accounts</h2>
      <p style={muted}>
        Vending operators use separate, authenticated accounts to view aggregate analytics. Operator
        access is restricted and protected by row-level security.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={muted}>
        Questions or requests about privacy? Email <a href="mailto:sarthak@atp-data.com">sarthak@atp-data.com</a>.
      </p>
    </div>
  );
}
