export const metadata = {
  title: 'Privacy — Munchr',
  description: 'How Munchr handles your data: anonymous by design, no personal information, no tracking.',
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
        Munchr is <strong>anonymous by design</strong>. There is no account and no login. We do not ask for, collect,
        or store your name, email, phone number, or student ID — and we have <strong>no way to identify you</strong>.
        Because we never collect anything that could point back to a person, nothing we record can be tied to you.
      </p>

      <h2 style={h2}>The little we do record (all anonymous)</h2>
      <ul>
        <li>A <strong>random session tag</strong> created fresh in your browser — it exists only for your current
          visit and is discarded the moment you close the tab. It&apos;s not a profile, not an account, and isn&apos;t
          linked to your identity, your device, or anything else.</li>
        <li>Which products and machines are <strong>searched for and tapped</strong>, and whether a search found results.</li>
        <li><strong>Approximate context</strong> — the campus and building associated with a result, and device type (mobile/desktop). No precise location, ever.</li>
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
        Knowing what students look for — and when a search comes up empty — helps the people who stock the machines
        bring in the right products in the right places, so you find what you want more often. These insights are
        only ever looked at in aggregate; they are never tied to you as an individual.
      </p>

      <h2 style={h2}>What we don&apos;t do</h2>
      <ul>
        <li>No advertising or selling of personal data.</li>
        <li>No third-party tracking or behavioral profiling of individuals.</li>
        <li>No personal accounts or identifiers for students.</li>
      </ul>

      <h2 style={h2}>Is my data safe?</h2>
      <p>
        Yes — and the strongest protection is that there&apos;s almost nothing to protect. Because Munchr never collects
        personal information and has no way to identify you, there is no profile, no account, and nothing about
        <em> who you are</em> for anyone to lose, leak, or misuse. The connection to Munchr is encrypted (HTTPS), and
        the limited anonymous activity above is stored with trusted U.S. hosting providers (Supabase and Vercel). We
        never sell data to anyone, and we never share it with anyone who could tie it to a person — because we
        couldn&apos;t either.
      </p>

      <h2 style={h2}>Retention &amp; your choices</h2>
      <p style={muted}>
        Anonymous interaction events are retained on a rolling basis to power demand trends. Questions or requests
        about privacy? Email <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>.
      </p>
    </div>
  );
}
