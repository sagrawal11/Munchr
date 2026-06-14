'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import {
  updateMachine,
  addMachine,
  setProductAvailability,
  removeInventoryItem,
  addProductToMachine,
  nextMachineId,
} from '../../../lib/catalogAdmin';
import '../operator.css';
import './inventory.css';

const BLANK_MACHINE = { name: '', building: '', floor: '', notes: '', latitude: '', longitude: '', credit_card_only: false, status: 'active' };

export default function InventoryEditor() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/operator/login');
      else { setSession(session); setLoading(false); }
    });
  }, [router]);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('id,name,building,floor,notes,latitude,longitude,credit_card_only,status, machine_inventory(id, available, products(id,name,label))')
      .order('id');
    if (error) { setMsg({ type: 'error', text: `Load failed: ${error.message}` }); return; }
    const mapped = (data || []).map(m => ({
      ...m,
      inventory: (m.machine_inventory || [])
        .filter(inv => inv.products)
        .map(inv => ({ invId: inv.id, available: inv.available, productId: inv.products.id, name: inv.products.name, label: inv.products.label }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
    setMachines(mapped);
    const names = await supabase.from('products').select('name').order('name');
    if (names.data) setProductNames(names.data.map(p => p.name));
  }, []);

  useEffect(() => { if (session) reload(); }, [session, reload]);

  if (loading) return <div className="inv-center">Loading…</div>;

  const selected = machines.find(m => m.id === selectedId) || null;
  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000); };

  return (
    <div className="operator-dashboard">
      <div className="operator-header">
        <div>
          <h1>Inventory Editor</h1>
          <p className="operator-subtitle">Edit machines and product availability — changes go live immediately</p>
        </div>
        <div className="operator-header-right">
          <button className="report-link-btn" onClick={() => router.push('/operator')}>← Dashboard</button>
        </div>
      </div>

      {msg && <div className={`inv-flash ${msg.type}`}>{msg.text}</div>}

      <div className="inv-layout">
        {/* Machine list */}
        <div className="inv-list">
          <button className="inv-new-btn" onClick={() => { setCreating(true); setSelectedId(null); }}>+ New machine</button>
          {machines.map(m => {
            const unavailable = m.inventory.filter(i => i.available === false).length;
            return (
              <button
                key={m.id}
                className={`inv-list-item ${m.id === selectedId && !creating ? 'active' : ''}`}
                onClick={() => { setSelectedId(m.id); setCreating(false); }}
              >
                <span className="inv-list-name">{m.name}</span>
                <span className="inv-list-meta">{m.building} · {m.inventory.length} items{unavailable ? ` · ${unavailable} off` : ''}</span>
              </button>
            );
          })}
        </div>

        {/* Editor pane */}
        <div className="inv-editor">
          {creating ? (
            <NewMachineForm
              onCancel={() => setCreating(false)}
              onCreate={async fields => {
                const id = nextMachineId(machines);
                const payload = {
                  id, name: fields.name, building: fields.building, floor: fields.floor || null,
                  notes: fields.notes || null, latitude: Number(fields.latitude), longitude: Number(fields.longitude),
                  credit_card_only: fields.credit_card_only, status: fields.status,
                };
                const { error } = await addMachine(supabase, payload);
                if (error) { flash('error', `Create failed: ${error.message}`); return; }
                await reload(); setCreating(false); setSelectedId(id); flash('success', `Created "${fields.name}"`);
              }}
            />
          ) : selected ? (
            <MachineEditor
              key={selected.id}
              machine={selected}
              productNames={productNames}
              onSaveFields={async fields => {
                const { error } = await updateMachine(supabase, selected.id, fields);
                if (error) { flash('error', `Save failed: ${error.message}`); return; }
                await reload(); flash('success', 'Machine details saved');
              }}
              onToggle={async item => {
                // currently-available (available !== false) → flip to unavailable, and vice-versa
                const { error } = await setProductAvailability(supabase, item.invId, item.available === false);
                if (error) { flash('error', `Update failed: ${error.message}`); return; }
                await reload();
              }}
              onRemove={async item => {
                const { error } = await removeInventoryItem(supabase, item.invId);
                if (error) { flash('error', `Remove failed: ${error.message}`); return; }
                await reload(); flash('success', `Removed ${item.name}`);
              }}
              onAdd={async name => {
                const { error } = await addProductToMachine(supabase, selected.id, name);
                if (error) { flash('error', `Add failed: ${error.message}`); return; }
                await reload(); flash('success', `Added ${name}`);
              }}
            />
          ) : (
            <div className="inv-center">Select a machine to edit, or add a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MachineEditor({ machine, productNames, onSaveFields, onToggle, onRemove, onAdd }) {
  const [fields, setFields] = useState({
    name: machine.name, building: machine.building, floor: machine.floor || '',
    notes: machine.notes || '', credit_card_only: !!machine.credit_card_only, status: machine.status || 'active',
  });
  const [newProduct, setNewProduct] = useState('');
  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  return (
    <div>
      <h2 className="inv-section-title">Machine details</h2>
      <div className="inv-form">
        <label>Name<input value={fields.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Building<input value={fields.building} onChange={e => set('building', e.target.value)} /></label>
        <label>Floor<input value={fields.floor} onChange={e => set('floor', e.target.value)} /></label>
        <label className="inv-wide">Notes<input value={fields.notes} onChange={e => set('notes', e.target.value)} /></label>
        <label>Status
          <select value={fields.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="inv-check"><input type="checkbox" checked={fields.credit_card_only} onChange={e => set('credit_card_only', e.target.checked)} /> Credit card only</label>
      </div>
      <button className="inv-save-btn" onClick={() => onSaveFields(fields)}>Save details</button>

      <h2 className="inv-section-title">Products ({machine.inventory.length})</h2>
      <div className="inv-add-row">
        <input
          list="product-names"
          placeholder="Add a product (e.g. Celsius)"
          value={newProduct}
          onChange={e => setNewProduct(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newProduct.trim()) { onAdd(newProduct.trim()); setNewProduct(''); } }}
        />
        <datalist id="product-names">{productNames.map(n => <option key={n} value={n} />)}</datalist>
        <button onClick={() => { if (newProduct.trim()) { onAdd(newProduct.trim()); setNewProduct(''); } }}>Add</button>
      </div>
      <div className="inv-products">
        {machine.inventory.map(item => (
          <div key={item.invId} className={`inv-product ${item.available === false ? 'off' : ''}`}>
            <span className="inv-product-name">{item.name}</span>
            <span className="inv-product-label">{item.label}</span>
            <button className="inv-toggle" onClick={() => onToggle(item)}>
              {item.available === false ? 'Unavailable' : 'Available'}
            </button>
            <button className="inv-remove" onClick={() => onRemove(item)} aria-label="Remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewMachineForm({ onCreate, onCancel }) {
  const [fields, setFields] = useState(BLANK_MACHINE);
  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));
  const valid = fields.name && fields.building && fields.latitude !== '' && fields.longitude !== '';

  return (
    <div>
      <h2 className="inv-section-title">New machine</h2>
      <div className="inv-form">
        <label>Name*<input value={fields.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Building*<input value={fields.building} onChange={e => set('building', e.target.value)} /></label>
        <label>Floor<input value={fields.floor} onChange={e => set('floor', e.target.value)} /></label>
        <label>Latitude*<input type="number" step="any" value={fields.latitude} onChange={e => set('latitude', e.target.value)} /></label>
        <label>Longitude*<input type="number" step="any" value={fields.longitude} onChange={e => set('longitude', e.target.value)} /></label>
        <label className="inv-wide">Notes<input value={fields.notes} onChange={e => set('notes', e.target.value)} /></label>
        <label className="inv-check"><input type="checkbox" checked={fields.credit_card_only} onChange={e => set('credit_card_only', e.target.checked)} /> Credit card only</label>
      </div>
      <div className="inv-form-actions">
        <button className="inv-save-btn" disabled={!valid} onClick={() => onCreate(fields)}>Create machine</button>
        <button className="inv-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
