import { describe, expect, it } from "vitest";

import {
  GEM_LANGUAGE,
  GEM_USD_VALUE,
  PARTICIPANT_ECONOMY,
  PROMOSHARE_DRAW_FAMILIES,
  VALUE_INSTRUMENTS,
  VALUE_INSTRUMENT_RATES,
  VALUE_LAYERS,
  VALUE_STORY,
  describeValueInstrument,
  getValueInstrument,
  getValueInstrumentsByLayer,
  listValueInstruments,
} from "../src/index";

describe("value instrument language", () => {
  it("stays aligned with the Gem and participant economy rates", () => {
    expect(VALUE_INSTRUMENT_RATES.gemUsd).toBe(GEM_USD_VALUE);
    expect(VALUE_INSTRUMENT_RATES.pointsPerKey).toBe(PARTICIPANT_ECONOMY.pointsPerPromoKey);
    expect(VALUE_INSTRUMENT_RATES.maxDailyKeys).toBe(PARTICIPANT_ECONOMY.maxDailyPromoKeyConversions);
    expect(VALUE_INSTRUMENT_RATES.masterKeyProofs.starter).toBe(PARTICIPANT_ECONOMY.tiers.starter.dailyMasterKeyProofs);
    expect(VALUE_INSTRUMENT_RATES.masterKeyProofs.professional).toBe(PARTICIPANT_ECONOMY.tiers.professional.dailyMasterKeyProofs);
    expect(VALUE_INSTRUMENT_RATES.masterKeyProofs.power_user).toBe(PARTICIPANT_ECONOMY.tiers.power_user.dailyMasterKeyProofs);
    expect(VALUE_INSTRUMENTS.gems.is).toContain(GEM_LANGUAGE.valueStatement.replace("1 USD", `${GEM_USD_VALUE} USD`));
  });

  it("gives every instrument one job, a not-this line, and a way to get it", () => {
    for (const instrument of listValueInstruments()) {
      expect(instrument.job.length).toBeGreaterThan(12);
      expect(instrument.isNot.toLowerCase()).toMatch(/not /);
      expect(instrument.getIt.length).toBeGreaterThan(0);
      expect(instrument.useIt.length).toBeGreaterThan(0);
      expect(instrument.href).toMatch(/^\/economy\//);
    }
  });

  it("keeps Gems as money that can be bought, earned, and spent for extras", () => {
    const gems = getValueInstrument("gems");
    expect(gems.is).toMatch(/1 Gem = 1 USD/i);
    expect(gems.getIt.join(" ")).toMatch(/Buy/i);
    expect(gems.getIt.join(" ")).toMatch(/Earn/i);
    expect(gems.isNot).toMatch(/holding/i);
    expect(VALUE_STORY.gemsBuyBenefits).toMatch(/better than paying cash/i);
    expect(VALUE_STORY.gemsEarn).toMatch(/not only bought/i);
    expect(VALUE_STORY.gemsEarn).toMatch(/Holding Gems still earns nothing/i);
  });

  it("keeps Points, Keys, and tickets from pretending to be money", () => {
    expect(VALUE_INSTRUMENTS.points.isNot).toMatch(/not money/i);
    expect(VALUE_INSTRUMENTS.promokeys.isNot).toMatch(/not payment/i);
    expect(VALUE_INSTRUMENTS["promoshare-tickets"].isNot).toMatch(/not a guarantee/i);
    expect(VALUE_INSTRUMENTS["promoshare-tickets"].is).toMatch(/named draw/i);
    expect(VALUE_STORY.ticketsChance).toMatch(/not a guarantee/i);
    expect(VALUE_STORY.namedDrawPays).toMatch(/Save & Win pays extra Gems/i);
    expect(PROMOSHARE_DRAW_FAMILIES.perk.doesNotPay).toMatch(/cash/i);
    expect(PROMOSHARE_DRAW_FAMILIES["save-and-win"].pays).toMatch(/Extra Gems/i);
  });

  it("treats Master Key as today's contribution gate, not a streak you buy", () => {
    const master = getValueInstrument("master-key");
    expect(master.isNot).toMatch(/not a streak/i);
    expect(master.isNot).toMatch(/not a point purchase/i);
    expect(master.marketKnows).toMatch(/does not skip/i);
    expect(VALUE_STORY.keysUnlock).toMatch(/both/i);
  });

  it("treats Save & Win as PromoShare's no-loss money draw", () => {
    const pot = getValueInstrument("save-and-win");
    expect(pot.layer).toBe("chances");
    expect(pot.is).toMatch(/PromoShare/i);
    expect(pot.is).toMatch(/extra Gems/i);
    expect(pot.is).toMatch(/100%/);
    expect(pot.isNot).toMatch(/not a perk draw/i);
    expect(VALUE_STORY.saveAndWin).toMatch(/money draw/i);
  });

  it("walks the layers in the story people need to hear", () => {
    const layers = getValueInstrumentsByLayer();
    expect(layers.map((layer) => layer.id)).toEqual(["everyday", "value", "access", "chances"]);
    expect(layers[0].instruments.map((item) => item.id)).toEqual(["promocard"]);
    expect(layers[1].instruments.map((item) => item.id)).toEqual(["points", "gems", "pieces"]);
    expect(layers[2].instruments.map((item) => item.id)).toEqual(["promokeys", "master-key"]);
    expect(layers[3].instruments.map((item) => item.id)).toEqual(["promoshare-tickets", "save-and-win"]);
    expect(VALUE_LAYERS).toHaveLength(4);
    expect(describeValueInstrument("promocard")).toContain("PromoCard");
  });
});
