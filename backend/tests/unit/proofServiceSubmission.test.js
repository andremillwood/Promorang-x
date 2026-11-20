function query(result) {
  const builder = {
    select() { return builder; },
    eq() { return builder; },
    order() { return builder; },
    maybeSingle: async () => result.single || { data: null, error: null },
    insert(payload) {
      result.inserts.push(payload);
      return {
        select() {
          return { single: async () => ({ data: { id: 'submission-1', ...payload }, error: null }) };
        },
      };
    },
    then(resolve, reject) {
      return Promise.resolve(result.list || { data: [], error: null }).then(resolve, reject);
    },
  };
  return builder;
}

describe('submitProofSubmission', () => {
  beforeEach(() => {
    jest.resetModules();
    delete global.supabase;
  });

  afterEach(() => {
    delete global.supabase;
  });

  it('stores a share submission when the moment allows Share', async () => {
    const inserts = [];
    global.supabase = {
      from(table) {
        if (table === 'moments') {
          return query({ single: { data: { id: 'moment-1', proof_type: 'Share', proof_mode: 'single' }, error: null } });
        }
        if (table === 'proof_requirements') {
          return query({ list: { data: [], error: null } });
        }
        return query({ inserts });
      },
    };

    const { submitProofSubmission } = require('../../services/proofService');
    const row = await submitProofSubmission({
      momentId: 'moment-1',
      userId: 'user-1',
      proofBundle: { proof_type: 'share', share_url: 'https://example.com/post' },
    });

    expect(row.proof_bundle.proof_type).toBe('Share');
    expect(inserts[0].proof_bundle.proof_type).toBe('Share');
  });

  it('refuses a link submission on a Share-only moment', async () => {
    global.supabase = {
      from(table) {
        if (table === 'moments') {
          return query({ single: { data: { id: 'moment-1', proof_type: 'Share', proof_mode: 'single' }, error: null } });
        }
        return query({ list: { data: [], error: null }, inserts: [] });
      },
    };

    const { submitProofSubmission } = require('../../services/proofService');
    await expect(submitProofSubmission({
      momentId: 'moment-1',
      userId: 'user-1',
      proofBundle: { proof_type: 'Link', proof_url: 'https://example.com' },
    })).rejects.toMatchObject({ code: 'PROOF_TYPE_MISMATCH', statusCode: 422 });
  });
});
