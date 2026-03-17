import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Product, RequirementCategory, RequirementStatus, WorkflowStage } from '../types';
import RiskBadge from '../components/RiskBadge';
import StageBadge from '../components/StageBadge';
import CategoryBadge from '../components/CategoryBadge';

const TYPE_LABELS: Record<string, string> = {
  bnpl: 'BNPL', crypto_exchange: 'Crypto Exchange', prepaid_card: 'Prepaid Card',
  money_transfer: 'Money Transfer', personal_lending: 'Personal Lending',
  payment_app: 'Payment App', savings_deposit: 'Savings / Deposit',
  foreign_remittance: 'Foreign Remittance',
};

const STAGE_LABELS: Record<WorkflowStage, string> = {
  intake: 'Intake', regulatory_assessment: 'Regulatory Assessment',
  legal_review: 'Legal Review', compliance_signoff: 'Compliance Sign-off',
  approved: 'Approved', rejected: 'Rejected',
};

const CAT_ORDER: RequirementCategory[] = [
  'aml_bsa', 'federal_regulation', 'state_licensing',
  'consumer_disclosure', 'data_privacy', 'prohibited_practices',
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [actor, setActor] = useState('');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () =>
    api.getProduct(Number(id)).then(setProduct).catch(e => setError(e.message));

  useEffect(() => { load(); }, [id]);

  if (error) return <div className="page"><p style={{ color: 'var(--high)' }}>{error}</p></div>;
  if (!product) return <div className="page"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;

  const isTerminal = product.current_stage === 'approved' || product.current_stage === 'rejected';
  const blockingPending = product.requirements.filter(r => r.is_blocking && r.status === 'pending').length;

  const byCategory = CAT_ORDER.reduce((acc, cat) => {
    const items = product.requirements.filter(r => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<RequirementCategory, typeof product.requirements>);

  const handleRequirement = async (reqId: number, status: RequirementStatus) => {
    if (!actor.trim()) { alert('Enter your name first (Actor field above).'); return; }
    await api.updateRequirement(reqId, status, actor);
    load();
  };

  const handleAdvance = async () => {
    if (!actor.trim()) { alert('Enter your name.'); return; }
    setLoading(true);
    try {
      await api.advanceStage(product.id, actor, advanceNotes);
      setShowAdvance(false);
      setAdvanceNotes('');
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!actor.trim() || !rejectNotes.trim()) { alert('Enter your name and reason.'); return; }
    setLoading(true);
    try {
      await api.rejectProduct(product.id, actor, rejectNotes);
      setShowReject(false);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally { setLoading(false); }
  };

  const nextStage = () => {
    const order: WorkflowStage[] = ['intake', 'regulatory_assessment', 'legal_review', 'compliance_signoff', 'approved'];
    const idx = order.indexOf(product.current_stage as WorkflowStage);
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 12, fontSize: 12 }}>
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>{product.name}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{product.product_id}</span>
              <StageBadge stage={product.current_stage as WorkflowStage} />
              <RiskBadge level={product.risk_level} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Score: {product.risk_score}</span>
            </div>
          </div>
          {!isTerminal && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Your name (Actor)"
                value={actor}
                onChange={e => setActor(e.target.value)}
                style={{ width: 180 }}
              />
              <button className="btn btn-danger" onClick={() => setShowReject(!showReject)}>Reject</button>
              <button
                className="btn btn-primary"
                onClick={() => setShowAdvance(!showAdvance)}
                disabled={blockingPending > 0}
                title={blockingPending > 0 ? `${blockingPending} blocking requirements pending` : ''}
              >
                Advance to {nextStage() ? STAGE_LABELS[nextStage()!] : '—'}
              </button>
            </div>
          )}
        </div>

        {blockingPending > 0 && !isTerminal && (
          <div style={{ marginTop: 10, padding: '8px 14px', background: '#fef3c7', borderRadius: 6, fontSize: 13, color: 'var(--medium)' }}>
            ⚠️ {blockingPending} blocking requirement{blockingPending > 1 ? 's' : ''} must be completed before advancing.
          </div>
        )}

        {showAdvance && (
          <div style={{ marginTop: 12, padding: 16, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <textarea
              placeholder="Notes (optional)..."
              value={advanceNotes}
              onChange={e => setAdvanceNotes(e.target.value)}
              style={{ height: 80, marginBottom: 10, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleAdvance} disabled={loading}>Confirm Advance</button>
              <button className="btn btn-ghost" onClick={() => setShowAdvance(false)}>Cancel</button>
            </div>
          </div>
        )}
        {showReject && (
          <div style={{ marginTop: 12, padding: 16, background: '#fff5f5', borderRadius: 8, border: '1px solid #fca5a5' }}>
            <textarea
              placeholder="Rejection reason (required)..."
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              style={{ height: 80, marginBottom: 10, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger" onClick={handleReject} disabled={loading}>Confirm Reject</button>
              <button className="btn btn-ghost" onClick={() => setShowReject(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: requirements */}
        <div>
          {/* Product info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Product Details</h3>
            <div className="grid-2" style={{ gap: 12 }}>
              <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Type</span><div style={{ fontWeight: 600 }}>{TYPE_LABELS[product.product_type]}</div></div>
              <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Segment</span><div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{product.customer_segment.replace('_', ' ')}</div></div>
              <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Submitted By</span><div style={{ fontWeight: 600 }}>{product.submitted_by}</div></div>
              <div><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Launch</span><div style={{ fontWeight: 600 }}>{product.target_launch_date || '—'}</div></div>
            </div>
            {product.description && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{product.description}</p>}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target States</span>
              <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {product.target_states.split(', ').map(s => (
                  <span key={s} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance requirements */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
                Compliance Requirements ({product.requirements.length})
              </h3>
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--low)', fontWeight: 700 }}>
                  {product.requirements.filter(r => r.status === 'complete' || r.status === 'waived').length}
                </span>
                <span style={{ color: 'var(--text-muted)' }}> / {product.requirements.length} cleared</span>
              </div>
            </div>

            {Object.entries(byCategory).map(([cat, reqs]) => (
              <div key={cat}>
                <div style={{ padding: '10px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <CategoryBadge category={cat as RequirementCategory} />
                </div>
                {reqs.map(req => (
                  <div key={req.id} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: req.status === 'complete' ? '#f0fdf4' : req.status === 'waived' ? '#f8fafc' : req.status === 'blocked' ? '#fff5f5' : '',
                    opacity: req.status === 'complete' || req.status === 'waived' ? .8 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{req.title}</span>
                          {req.is_blocking && req.status === 'pending' && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--high)', background: '#fee2e2', padding: '1px 6px', borderRadius: 3 }}>BLOCKING</span>
                          )}
                          {req.status === 'complete' && <span style={{ fontSize: 11, color: 'var(--low)' }}>✓ Complete</span>}
                          {req.status === 'waived' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>◌ Waived</span>}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 4 }}>{req.description}</p>
                        {req.regulation_ref && (
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--navy-light)', background: '#eff6ff', padding: '1px 6px', borderRadius: 3 }}>
                            {req.regulation_ref}
                          </span>
                        )}
                        {req.applies_to_states && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>States: {req.applies_to_states}</div>
                        )}
                        {req.completed_by && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Cleared by {req.completed_by} on {new Date(req.completed_at!).toLocaleDateString()}
                          </div>
                        )}
                        {req.notes && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic', color: 'var(--text-muted)' }}>{req.notes}</div>}
                      </div>
                      {!isTerminal && req.status === 'pending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                          <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => handleRequirement(req.id, 'complete')}>Mark Complete</button>
                          <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => handleRequirement(req.id, 'waived')}>Waive</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: workflow timeline */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Workflow Timeline
            </h3>
            <div style={{ position: 'relative' }}>
              {product.stage_history.slice().reverse().map((ev, i) => (
                <div key={ev.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 3,
                      background: ev.to_stage === 'approved' ? 'var(--low)' :
                        ev.to_stage === 'rejected' ? 'var(--high)' : 'var(--accent)',
                    }} />
                    {i < product.stage_history.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 16, marginTop: 2 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <StageBadge stage={ev.to_stage as WorkflowStage} />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      by {ev.actor} · {new Date(ev.created_at).toLocaleDateString()}
                    </div>
                    {ev.notes && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>{ev.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Risk Score
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `conic-gradient(var(--${product.risk_level === 'low' ? 'low' : product.risk_level === 'medium' ? 'medium' : product.risk_level === 'critical' ? 'critical' : 'high'}) ${product.risk_score * 3.6}deg, var(--border) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: 'var(--navy)' }}>
                  {product.risk_score}
                </div>
              </div>
              <div>
                <RiskBadge level={product.risk_level} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Launch risk level</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Score based on product type complexity, state footprint ({product.target_states.split(', ').length} states), regulatory requirement volume, and feature risk factors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
