const { evaluateProofSubmission, allowedProofTypes } = require('../../services/proofTypePolicy');

describe('proof type policy', () => {
  it('allows Share plus presence proof on a multi-modal moment', () => {
    const moment = { proof_type: 'Share', proof_mode: 'multi_modal' };
    const requirements = [{ requirement_type: 'venue_qr', is_required: true }];
    expect([...allowedProofTypes(moment, requirements)].sort()).toEqual(['QR', 'Share']);
    expect(evaluateProofSubmission(moment, requirements, { proof_type: 'Share' }).ok).toBe(true);
    expect(evaluateProofSubmission(moment, requirements, { proof_code: 'DOOR-1' }).ok).toBe(true);
    expect(evaluateProofSubmission(moment, requirements, { proof_type: 'Photo' }).ok).toBe(false);
  });

  it('rejects a submission that does not match a single proof type', () => {
    const moment = { proof_type: 'QR', proof_mode: 'single' };
    const decision = evaluateProofSubmission(moment, [], { proof_type: 'Link', proof_url: 'https://example.com' });
    expect(decision.ok).toBe(false);
    expect(decision.code).toBe('PROOF_TYPE_MISMATCH');
    expect(evaluateProofSubmission(moment, [], { proof_code: '1234' }).matchedType).toBe('QR');
  });

  it('leaves moments with no proof type unrestricted', () => {
    const decision = evaluateProofSubmission({ proof_type: null, proof_mode: 'single' }, [], { evidence_url: 'https://cdn.example/a.jpg' });
    expect(decision.ok).toBe(true);
  });
});
