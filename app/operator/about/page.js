export const metadata = {
  title: 'About — Munchr for Operators',
  description: 'Munchr is demand intelligence for vending — what customers wanted but couldn’t find.',
};

const wrap = { maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function OperatorAboutPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>About Munchr</h1>
      <p style={muted}>Demand intelligence for vending and unattended retail.</p>

      <p style={{ marginTop: '1.25rem' }}>
        Munchr started with a craving. Freshman spring, deep into a finals all-nighter, our founder wanted a single
        Diet Coke — walked to the Wilkinson vending machine, and it wasn&apos;t there. So he tried the next machine,
        and the next, combing every machine down Science Drive until he finally found it in French Family Sciences.
        Standing there with that hard-won Diet Coke, he realized something: every one of those empty trips was a sale
        the operator never made, and a signal no one was capturing.
      </p>

      <p>
        That&apos;s the gap Munchr fills. Sales data shows operators what people <em>bought</em>. Munchr shows what
        they <strong>searched for and couldn&apos;t find</strong> — the unmet demand that never becomes a sale. We turn
        that signal into clear stocking decisions: what to add, where demand concentrates, and when it peaks.
      </p>

      <h2 style={h2}>How it works</h2>
      <p>
        Customers search a live map for the snack or drink they want. Every search — including the empty ones —
        becomes a demand signal for the operator, surfaced in a dashboard alongside direct on-machine requests,
        per-location demand, and stocking recommendations. Munchr connects to an operator&apos;s existing stack via
        CSV import or the Nayax Lynx API.
      </p>

      <h2 style={h2}>Where we are</h2>
      <p>
        Munchr started on a university campus and is expanding to vending and micro-market operators. We take data
        protection seriously — see our <a href="/operator/trust">Trust &amp; Security</a> page.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={muted}>
        General: <a href="mailto:hello@munchr.app">hello@munchr.app</a><br />
        Security: <a href="mailto:security@munchr.app">security@munchr.app</a><br />
        Privacy: <a href="mailto:privacy@munchr.app">privacy@munchr.app</a>
      </p>
    </div>
  );
}
