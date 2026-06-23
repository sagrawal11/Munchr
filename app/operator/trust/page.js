export const metadata = {
  title: 'Trust & Security — Munchr for Operators',
  description: 'How Munchr secures operator data: privacy-by-design, row-level security, per-operator isolation, encryption, and an honest compliance roadmap.',
};

const wrap = { maxWidth: 820, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };
const card = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.25rem', marginTop: '1rem' };
const li = { marginBottom: '0.4rem' };

export default function OperatorTrustPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Trust &amp; Security</h1>
      <p style={muted}>Last updated: June 2026 · Questions: <a href="mailto:security@munchr.app">security@munchr.app</a></p>

      <p style={{ marginTop: '1.25rem' }}>
        Munchr is built privacy-first and secured by default. We collect <strong>no personal information</strong> from
        end consumers, isolate each operator&apos;s data, and enforce database access with row-level security. Our
        controls are verified by automated and adversarial testing and documented in an internal 17-category audit
        with no critical or high findings. This page summarizes our posture honestly — including what we have today
        and what&apos;s still on the roadmap.
      </p>

      <h2 style={h2}>Data we handle</h2>
      <ul>
        <li style={li}><strong>No consumer PII.</strong> Consumer searches are keyed to a random, per-session ID — no names, emails, accounts, or student IDs. Location, if enabled, is used in the browser only and never stored.</li>
        <li style={li}><strong>Your operator data is yours.</strong> Catalog, inventory, and optional sales data are used only to deliver your analytics.</li>
        <li style={li}><strong>Per-operator isolation.</strong> One operator can never see another operator&apos;s data.</li>
        <li style={li}><strong>Integration credentials</strong> (e.g., a Nayax token) are used server-side and not stored — or stored encrypted and scoped to your organization.</li>
      </ul>

      <h2 style={h2}>How we protect it</h2>
      <div style={card}>
        <ul style={{ margin: 0 }}>
          <li style={li}><strong>Access control:</strong> PostgreSQL row-level security on every table; operator allowlist; per-operator isolation.</li>
          <li style={li}><strong>Authentication:</strong> managed auth with salted + hashed passwords; multi-factor authentication for operators.</li>
          <li style={li}><strong>Encryption:</strong> HTTPS/TLS in transit (HSTS enforced); encryption at rest via our managed database provider.</li>
          <li style={li}><strong>Application hardening:</strong> input validation and allowlists, rate limiting, and hardened HTTP security headers (CSP, X-Frame-Options, and more).</li>
          <li style={li}><strong>Secrets:</strong> never committed to source control; privileged keys live only in server-side environment variables.</li>
          <li style={li}><strong>Integration history:</strong> every data import is recorded with counts for traceability.</li>
        </ul>
      </div>

      <h2 style={h2}>Infrastructure &amp; subprocessors</h2>
      <p>
        Munchr runs on <strong>Supabase</strong> (managed Postgres + authentication) and <strong>Vercel</strong>
        (application hosting), both in the United States. If you connect <strong>Nayax</strong>, it acts as a data
        source for your telemetry. These are our subprocessors; details are in our Data Processing Agreement.
      </p>

      <h2 style={h2}>Compliance status</h2>
      <p><strong>In place today:</strong> privacy-by-design, row-level security, internal 17-category security audit
        (all categories pass), and a documented threat model.</p>
      <p><strong>On the roadmap (planned — not yet obtained):</strong> SOC 2 Type II, an independent penetration test,
        globally-durable rate limiting, nonce-based CSP, HTTP-only cookie sessions, and expanded operator-action
        audit logging. We&apos;re happy to share our
        security &amp; compliance roadmap and internal audit summary under NDA.</p>

      <h2 style={h2}>Data processing &amp; your rights</h2>
      <p>
        We act as a data processor for the operator data you entrust to us. We return or delete your data on request
        after termination, support data-deletion requests, and notify you promptly in the unlikely event of a breach.
        Request our <strong>Data Processing Agreement</strong> or <strong>Security Overview</strong> at{' '}
        <a href="mailto:security@munchr.app">security@munchr.app</a>. See also our{' '}
        <a href="/operator/privacy">Privacy Policy</a> and <a href="/operator/terms">Terms of Service</a>.
      </p>

      <h2 style={h2}>Responsible disclosure</h2>
      <p style={muted}>
        Found a vulnerability? Email <a href="mailto:security@munchr.app">security@munchr.app</a> with details and
        steps to reproduce. We acknowledge within 72 hours and ask that you not publicly disclose until we&apos;ve had
        a chance to fix it.
      </p>
    </div>
  );
}
