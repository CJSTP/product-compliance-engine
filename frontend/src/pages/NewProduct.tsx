import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const PRODUCT_TYPES = [
  { value: 'bnpl', label: 'Buy Now Pay Later (BNPL)' },
  { value: 'crypto_exchange', label: 'Crypto Exchange' },
  { value: 'prepaid_card', label: 'Prepaid Card' },
  { value: 'money_transfer', label: 'Money Transfer' },
  { value: 'foreign_remittance', label: 'Foreign Remittance' },
  { value: 'personal_lending', label: 'Personal Lending' },
  { value: 'payment_app', label: 'Payment App' },
  { value: 'savings_deposit', label: 'Savings / Deposit' },
];

const SEGMENTS = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'enterprise', label: 'Enterprise' },
];

export default function NewProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    product_type: 'bnpl',
    customer_segment: 'consumer',
    description: '',
    submitted_by: '',
    target_launch_date: '',
    key_features_text: '',
    selected_states: [] as string[],
    select_all: false,
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleState = (s: string) => {
    set('selected_states',
      form.selected_states.includes(s)
        ? form.selected_states.filter(x => x !== s)
        : [...form.selected_states, s]
    );
  };

  const toggleAll = () => {
    if (form.selected_states.length === US_STATES.length) {
      set('selected_states', []);
    } else {
      set('selected_states', [...US_STATES]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.submitted_by || form.selected_states.length === 0) {
      setError('Name, submitter, and at least one state are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const product = await api.createProduct({
        name: form.name,
        product_type: form.product_type,
        customer_segment: form.customer_segment,
        description: form.description || null,
        submitted_by: form.submitted_by,
        target_launch_date: form.target_launch_date || null,
        target_states: form.selected_states,
        key_features: form.key_features_text
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
      });
      navigate(`/products/${product.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error submitting product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16, fontSize: 12 }}>
        ← Back
      </button>
      <h1 className="page-title">Submit New Product for Compliance Review</h1>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Product Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. FlexPay BNPL" required />
            </div>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Product Type *</label>
                <select value={form.product_type} onChange={e => set('product_type', e.target.value)}>
                  {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Customer Segment *</label>
                <select value={form.customer_segment} onChange={e => set('customer_segment', e.target.value)}>
                  {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Brief description of the product and how it works..."
                style={{ height: 80, resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Key Features <span style={{ fontWeight: 400 }}>(one per line — used to identify additional regulatory triggers)</span>
              </label>
              <textarea
                value={form.key_features_text}
                onChange={e => set('key_features_text', e.target.value)}
                placeholder={"e.g.\ninterest-free installments\nsoft credit check\ncrypto payments\ncross-border transfers"}
                style={{ height: 100, resize: 'vertical' }}
              />
            </div>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Submitted By *</label>
                <input value={form.submitted_by} onChange={e => set('submitted_by', e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Target Launch Date</label>
                <input type="date" value={form.target_launch_date} onChange={e => set('target_launch_date', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Target States * ({form.selected_states.length} selected)
            </h3>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={toggleAll}>
              {form.selected_states.length === US_STATES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {US_STATES.map(s => {
              const selected = form.selected_states.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleState(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                    border: '1px solid',
                    borderColor: selected ? 'var(--accent)' : 'var(--border)',
                    background: selected ? 'var(--accent)' : 'var(--surface)',
                    color: selected ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all .1s',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p style={{ color: 'var(--high)', marginBottom: 16, fontSize: 13 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 24px', fontSize: 14 }}>
            {loading ? 'Submitting...' : 'Submit for Compliance Review'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
