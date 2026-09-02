import { describe, expect, it } from "vitest";
import { forbiddenMemberWordsIn, isMemberCopyKey } from "@/lib/member-language";
import { translations } from "./translations";

describe("member language", () => {
  it("keeps selected member product copy free of forbidden jargon", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(translations.en)) {
      if (!isMemberCopyKey(key)) continue;
      const hits = forbiddenMemberWordsIn(value);
      if (hits.length) offenders.push(`${key} → ${hits.join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });
});
