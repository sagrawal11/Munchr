'use client';

// Public, no-auth "request what you want" landing — the capture mechanism for low-traffic
// sites (offices/breakrooms) where there isn't enough crowd for in-app search to generate
// signal. Put a QR code on the machine pointing at /request?machine=<id> (optionally
// &building=&campus=). Each submission becomes a product_requested analytics event — the
// strongest, building-attributable demand signal an operator can get.

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { vendingMachines } from '../../src/data/vendingMachines';
import { track } from '../../lib/analytics';
import './request.css';

function RequestForm() {
  const params = useSearchParams();
  const machineParam = params.get('machine');
  const buildingParam = params.get('building');
  const campusParam = params.get('campus');

  // Resolve the machine from the QR param (by id, then by name) so we can show context
  // and attribute the request to a building.
  const machine = useMemo(() => {
    if (!machineParam) return null;
    return (
      vendingMachines.find(m => String(m.id) === String(machineParam)) ||
      vendingMachines.find(m => m.name === machineParam) ||
      null
    );
  }, [machineParam]);

  const building = buildingParam || machine?.building || null;
  const machineId = machine ? String(machine.id) : (machineParam || null);

  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done

  const submit = async (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || status === 'sending') return;
    setStatus('sending');
    await track.productRequested(q, building, machineId, campusParam || null);
    setStatus('done');
    setValue('');
  };

  return (
    <div className="req-card">
      <div className="req-brand">Munchr</div>

      {status === 'done' ? (
        <div className="req-done">
          <div className="req-check">✓</div>
          <h1>Thanks — got it!</h1>
          <p>Your request was sent to the operator. The more people ask, the more likely it gets stocked.</p>
          <button className="req-again" onClick={() => setStatus('idle')}>Request another item</button>
        </div>
      ) : (
        <>
          <h1>Can&apos;t find what you want?</h1>
          <p className="req-sub">
            Tell us what you wish this machine had{building ? <> at <strong>{building}</strong></> : null}.
            It helps the operator stock what people actually want.
          </p>
          <form onSubmit={submit}>
            <input
              className="req-input"
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. Celsius, Takis, Muscle Milk…"
              maxLength={80}
              autoFocus
              enterKeyHint="send"
            />
            <button className="req-submit" type="submit" disabled={!value.trim() || status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send request'}
            </button>
          </form>
          <p className="req-privacy">Anonymous — we never collect your name or personal info.</p>
        </>
      )}
    </div>
  );
}

export default function RequestPage() {
  return (
    <div className="req-page">
      <Suspense fallback={<div className="req-card"><div className="req-brand">Munchr</div></div>}>
        <RequestForm />
      </Suspense>
    </div>
  );
}
