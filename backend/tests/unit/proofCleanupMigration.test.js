const fs = require('fs');
const path = require('path');

const enumSql = fs.readFileSync(
  path.join(__dirname, '../../../supabase/migrations/20261120150100_add_share_screenshot_link_proof_types.sql'),
  'utf8'
);
const cleanupSql = fs.readFileSync(
  path.join(__dirname, '../../../supabase/migrations/20261120150200_nightlife_retag_and_country_normalization.sql'),
  'utf8'
);

describe('proof and country migrations', () => {
  it('adds Share, Screenshot, and Link to mechanic_proof_type without using them yet', () => {
    expect(enumSql).toContain('mechanic_proof_type');
    expect(enumSql).toContain("ADD VALUE IF NOT EXISTS 'Share'");
    expect(enumSql).toContain("ADD VALUE IF NOT EXISTS 'Screenshot'");
    expect(enumSql).toContain("ADD VALUE IF NOT EXISTS 'Link'");
    expect(enumSql).not.toContain('UPDATE public.moments');
  });

  it('retags Capleton and Ladies Throwback and leaves ILHH out', () => {
    expect(cleanupSql).toContain('00000000-0000-0000-0002-000000000052');
    expect(cleanupSql).toContain('encore-live-featuring-capleton');
    expect(cleanupSql).toContain("'Nightlife & Social'");
    expect(cleanupSql).toContain("'multi_modal'");
    expect(cleanupSql).toContain("'Share'");
    expect(cleanupSql).toContain("'venue_qr'");
    expect(cleanupSql).toContain('58fa8801-6f83-40e3-a80b-86d6a67fc1a7');
    expect(cleanupSql).toContain('Encore: Ladies Throwback Playground');
    expect(cleanupSql).not.toContain('faab5899-00a1-4883-95c7-a8487843dcaf');
    expect(cleanupSql).not.toContain('is_active = true');
    expect(cleanupSql).toContain('country_normalization_backup_moments');
    expect(cleanupSql).toContain('country_normalization_backup_venues');
    expect(cleanupSql).toContain('ADD COLUMN IF NOT EXISTS country_code');
  });
});
