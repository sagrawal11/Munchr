export const metadata = {
  title: 'Terms of Service — Munchr for Operators',
  description: 'Terms governing use of the Munchr operator platform.',
};

const wrap = { maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.15rem', fontWeight: 700, marginTop: '1.75rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function OperatorTermsPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>Terms of Service</h1>
      <p style={muted}>Operator platform · Last updated: June 2026 · <a href="mailto:legal@munchr.app">legal@munchr.app</a></p>

      <p style={{ marginTop: '1.25rem' }}>
        These Terms govern access to and use of the Munchr operator platform and related services (the
        &quot;Service&quot;) by a vending operator or business customer (&quot;you&quot;). By using the Service or
        signing an agreement that references these Terms, you agree to them.
      </p>

      <h2 style={h2}>1. The Service</h2>
      <p>Munchr provides demand-intelligence software for vending and unattended retail — ingesting catalog,
        inventory, and optional sales data and surfacing analytics such as unmet demand, search trends, and stocking
        recommendations. Features may evolve over time.</p>

      <h2 style={h2}>2. Accounts &amp; access</h2>
      <p>We provision operator accounts for users you authorize. You are responsible for safeguarding credentials and
        for activity under your accounts, and must enable multi-factor authentication where offered. Report suspected
        unauthorized access to <a href="mailto:security@munchr.app">security@munchr.app</a>.</p>

      <h2 style={h2}>3. Your data &amp; ownership</h2>
      <p>You own your data (catalog, inventory, sales, and analytics derived for you). You grant us a limited license
        to process it solely to provide and improve the Service for you, as described in our{' '}
        <a href="/operator/dpa">Data Processing Agreement</a>. We may use aggregated, de-identified data to operate and improve
        the Service, and we never sell your identifiable data.</p>

      <h2 style={h2}>4. Acceptable use</h2>
      <p>Use is subject to our Acceptable Use Policy: don&apos;t misuse, attack, reverse-engineer, or resell the
        Service, and don&apos;t upload data you aren&apos;t authorized to share.</p>

      <h2 style={h2}>5. Third-party integrations</h2>
      <p>The Service integrates with systems you choose to connect (e.g., Nayax, your VMS via CSV). You represent you
        are authorized to connect them and to share the resulting data with us.</p>

      <h2 style={h2}>6. Fees</h2>
      <p>During a pilot, the Service is provided free of charge. Paid use is governed by a signed Order Form.</p>

      <h2 style={h2}>7. Warranties &amp; disclaimer</h2>
      <p>We provide the Service with reasonable skill and care. Except as expressly stated, the Service is provided
        &quot;as is.&quot; Analytics and recommendations are directional estimates, not guarantees of sales or
        outcomes; you are responsible for your business decisions.</p>

      <h2 style={h2}>8. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, neither party is liable for indirect, incidental, special, or
        consequential damages, and each party&apos;s aggregate liability is capped as set out in the applicable
        agreement. Nothing limits liability where it would be unlawful to do so.</p>

      <h2 style={h2}>9. Term &amp; termination</h2>
      <p>Either party may terminate a pilot at any time on written notice. On termination we will, on request, return
        or delete your data per the DPA. Provisions that should survive (ownership, confidentiality, liability,
        disclaimers) survive termination.</p>

      <h2 style={h2}>10. Governing law &amp; changes</h2>
      <p>These Terms are governed by the laws of the State of North Carolina. We may update these Terms; material
        changes will be communicated to active customers with reasonable notice.</p>

      <p style={muted}>Contact: <a href="mailto:legal@munchr.app">legal@munchr.app</a></p>
    </div>
  );
}
