'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import './Footer.css';

// Operators and students care about different things, so the footer adapts to context.
// Every context links to both a Terms and a Privacy page (legal basics on every page).
const CONTACT = { href: 'mailto:hello@munchr.app', label: 'Contact' };

const CONSUMER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  CONTACT,
];

// Pre-login (prospects, login page): show the marketing About. Once an operator is logged
// in there's no need for it, so it's dropped from the authenticated set.
const OPERATOR_ABOUT = { href: '/operator/about', label: 'About' };
const OPERATOR_BASE = [
  { href: '/operator/privacy', label: 'Privacy' },
  { href: '/operator/terms', label: 'Terms' },
  { href: '/operator/trust', label: 'Trust & Security' },
  { href: '/operator/dpa', label: 'DPA' },
  CONTACT,
];

function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname() || '';
  const isOperator = pathname.startsWith('/operator');
  const [authed, setAuthed] = useState(false);

  // Only the operator side cares about auth state — the student app is fully anonymous,
  // so we never touch Supabase there.
  useEffect(() => {
    if (!isOperator) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(!!data?.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active) setAuthed(!!session);
    });
    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, [isOperator]);

  let links;
  if (!isOperator) {
    links = CONSUMER_LINKS;
  } else {
    links = authed ? OPERATOR_BASE : [OPERATOR_ABOUT, ...OPERATOR_BASE];
  }

  const note = isOperator
    ? `© ${year} Munchr · Demand intelligence for vending`
    : `© ${year} Munchr · Find vending machines on campus`;

  return (
    <footer className="footer">
      <div className="container">
        <nav className="footer-links" aria-label="Footer">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <p className="footer-note">{note}</p>
      </div>
    </footer>
  );
}

export default Footer;
