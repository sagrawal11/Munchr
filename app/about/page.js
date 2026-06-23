export const metadata = {
  title: 'About — Munchr',
  description: 'Munchr helps you find the snacks and drinks you want in vending machines across campus.',
};

const wrap = { maxWidth: 760, margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Quicksand', sans-serif", color: '#1e293b', lineHeight: 1.6 };
const h1 = { color: '#001d4a', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' };
const h2 = { color: '#00539B', fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' };
const muted = { color: '#64748b', fontSize: '0.9rem' };

export default function AboutPage() {
  return (
    <div style={wrap}>
      <h1 style={h1}>About Munchr</h1>
      <p style={muted}>Your guide to vending machines on campus.</p>

      <p style={{ marginTop: '1.25rem' }}>
        It started, like most good ideas, with a craving. It was freshman spring, somewhere in the small hours of a
        finals all-nighter, and I needed a Diet Coke. I walked over to the vending machine in
        Wilkinson, fully expecting a quick win. It wasn&apos;t there. So I tried the next machine. And the next. I ended
        up combing every vending machine down Science Drive, increasingly stubborn and a little delirious, until I
        finally found it tucked away in French Family Sciences.
      </p>

      <p>
        Standing there with my hard-won Diet Coke, I realized how absurd the whole hunt had been — and how many other
        students were running the same fruitless laps every day. That night I made myself a promise: I&apos;d build a
        tool that lets students find exactly what they&apos;re craving, quickly and accurately, so no one else has to
        wander campus on an empty stomach. That tool is Munchr.
      </p>

      <p>
        Munchr helps you find the snack or drink you want without walking to three empty machines first.
        Search a live map of vending machines across campus, see what each one stocks, and get directions to the
        closest one that has it. It&apos;s free and there&apos;s nothing to sign up for.
      </p>

      <h2 style={h2}>How it works</h2>
      <ul>
        <li>Search for a snack, drink, or category — Munchr shows the machines that carry it.</li>
        <li>Sort by distance to find the closest option, and tap for directions.</li>
        <li>Even when a search comes up empty, it quietly signals that students want that item here — which
          helps the people who stock the machines bring in what you&apos;re actually looking for.</li>
      </ul>

      <h2 style={h2}>Using Munchr</h2>
      <p>
        Munchr is provided free and as-is to help you find vending machines — availability and prices can change,
        so treat what you see as a helpful guide rather than a guarantee. Please use it respectfully and don&apos;t
        try to misuse or disrupt the service.
      </p>

      <h2 style={h2}>Your privacy</h2>
      <p>
        Munchr is anonymous by design — no account, and no name, email, or student ID required. See exactly what we
        do and don&apos;t collect on our <a href="/privacy">Privacy</a> page.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={muted}>
        Questions or feedback? Email <a href="mailto:hello@munchr.app">hello@munchr.app</a>.
      </p>
    </div>
  );
}
