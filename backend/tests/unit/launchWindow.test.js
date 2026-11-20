const fs = require('fs');
const path = require('path');
const { LAUNCH_WINDOW_END, DEFAULT_CAPPED_DROP_CAP } = require('../../lib/launchWindow');

describe('launch window config stays in one place', () => {
  it('matches the shared package and the capped-drop migration', () => {
    const shared = fs.readFileSync(
      path.join(__dirname, '../../../packages/shared/src/launch-window.ts'),
      'utf8'
    );
    const migration = fs.readFileSync(
      path.join(__dirname, '../../../supabase/migrations/20261120150000_capped_drops.sql'),
      'utf8'
    );
    expect(LAUNCH_WINDOW_END).toBe('2027-01-31');
    expect(DEFAULT_CAPPED_DROP_CAP).toBe(100);
    expect(shared).toContain(`export const LAUNCH_WINDOW_END = "${LAUNCH_WINDOW_END}"`);
    expect(shared).toContain(`export const DEFAULT_CAPPED_DROP_CAP = ${DEFAULT_CAPPED_DROP_CAP}`);
    expect(migration).toContain(`jsonb_build_object('date', '${LAUNCH_WINDOW_END}')`);
    expect(migration).toContain('cap integer NOT NULL DEFAULT 100');
  });
});
