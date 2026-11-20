import type { CountryMarket } from "@promorang/shared";
import type { CityOption } from "./city-hubs";
import { slugifySegment } from "./discovery";

const jamaicaParishes = ["Kingston", "Saint Andrew", "Saint Thomas", "Portland", "Saint Mary", "Saint Ann", "Trelawny", "Saint James", "Hanover", "Westmoreland", "Saint Elizabeth", "Manchester", "Clarendon", "Saint Catherine"];
const hubParishes: Record<string, string[]> = {
  kingston: ["Kingston", "Saint Andrew"],
  "montego-bay": ["Saint James"],
  "ocho-rios": ["Saint Ann"],
  negril: ["Westmoreland", "Hanover"],
  "port-antonio": ["Portland"],
  "treasure-beach": ["Saint Elizabeth"],
  portmore: ["Saint Catherine"],
  mandeville: ["Manchester"],
  falmouth: ["Trelawny"],
  "blue-mountains": ["Saint Andrew", "Portland"],
};
const cityAliases: Record<string, string[]> = {
  "new-york": ["new-york-city", "nyc", "brooklyn", "manhattan", "queens", "bronx", "staten-island"],
  "port-antonio": ["boston-bay"],
  "treasure-beach": ["black-river"],
  portmore: ["hellshire"],
  "blue-mountains": ["holywell", "irish-town"],
};

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
// Values come from the fixed market catalog; quoting also keeps spaces and
// punctuation inside PostgREST's list syntax rather than its filter grammar.
const list = (values: string[]) => `(${values.map((value) => JSON.stringify(value)).join(",")})`;

export function venueDirectoryMarket(country: Pick<CountryMarket, "code" | "slug">, city: CityOption) {
  const countrySlugs = unique([
    country.code === city.countryCode ? country.slug : "",
    slugifySegment(city.countryName),
    city.countryCode.toLowerCase(),
  ]);
  const isJamaica = city.countryCode === "JM";
  const parishes = isJamaica ? (city.id === "all-jamaica" ? jamaicaParishes : hubParishes[city.id] || []) : [];
  const citySlugs = unique([city.id, slugifySegment(city.name.split(/[,&/(]/)[0]), ...(cityAliases[city.id] || [])]);
  let placeFilter: string | null = null;

  if (city.scope === "state") {
    const states = unique([city.region || "", city.stateCode || "", city.stateCode?.split("-").at(-1) || ""]);
    placeFilter = `market_key.eq.${city.id},state.in.${list(states)}`;
  } else if (city.id !== "all-jamaica") {
    const clauses = [`city_slug.in.${list(citySlugs)}`];
    if (parishes.length) clauses.push(`parish.in.${list(parishes)}`);
    if (city.id === "london" && city.countryCode === "GB") clauses.push("market_key.eq.gb-london");
    placeFilter = clauses.join(",");
  }

  return { countrySlugs, placeFilter, parishes, isJamaica };
}
