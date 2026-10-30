/** Promorang's own illustrative category library. Uploaded artwork always wins. */
export const BRAND_IMAGE_CATEGORIES = ["nightlife","dining","coffee","wellness","outdoors","automotive","arts","shopping","community","creator"] as const;
export type BrandImageCategory = typeof BRAND_IMAGE_CATEGORIES[number];
export type BrandImageContext = {category?: string | null; title?: string | null; description?: string | null; kind?: string | null};
const assets = import.meta.glob("../assets/placeholders/*.webp", {eager:true,query:"?url",import:"default"}) as Record<string,string>;
const rules: Array<[BrandImageCategory,RegExp]> = [
 ["coffee",/\b(coffee|cafe|café|espresso|latte|cappuccino|brunch|cafeteria)\b/],
 ["dining",/\b(food|dining|restaurant|dinner|lunch|jerk|korean|sushi|bites|cocktail|drinks|rum|tasting|comida|comer|cena|bebidas|gastronomia)\b/],
 ["wellness",/\b(wellness|yoga|pilates|fitness|gym|spa|massage|meditation|sound bath|workout|bienestar|saúde|saude|bem estar)\b/],
 ["automotive",/\b(car|cars|automotive|auto|gtr|gtrs|motorsport|motorcycle|driving|pinkslips|carro|carros|cedar valley)\b/],
 ["arts",/\b(art|arts|culture|cultural|pottery|ceramic|ceramics|painting|gallery|museum|theatre|theater|craft|crafts|workshop|arte|cultura|taller)\b/],
 ["shopping",/\b(shopping|retail|boutique|fashion|jewelry|jewellery|clothing|marketplace|store|beauty|skincare|compras|loja|tienda|moda)\b/],
 ["creator",/\b(creator|content|podcast|recording|studio|photography|photo|filming|digital|coding|tech|skill|skills|learning|networking|professional|creador|criador)\b/],
 ["nightlife",/\b(nightlife|nightclub|party|dj|dance|dancehall|music|concert|jazz|reggae|aftrhrs|aftr hrs|after dark|hip hop|música|musica|fiesta|festa)\b/],
 ["outdoors",/\b(outdoor|outdoors|hike|hiking|beach|river|mountain|camping|adventure|surf|kayak|nature|playa|praia|senderismo|aventura)\b/],
 ["nightlife",/\b(night|after dark)\b/],
 ["community",/\b(community|social|meetup|gathering|friends|games|volunteer|comunidad|comunidade)\b/],
];
export function pickBrandImageCategory(context: BrandImageContext = {}): BrandImageCategory {
 const category=(context.category || "").toLowerCase().replace(/[_-]/g," ");
 const exact=BRAND_IMAGE_CATEGORIES.find(key=>key===context.category?.toLowerCase());
 if(exact)return exact;
 const explicit=rules.find(([,pattern])=>pattern.test(category));
 if(explicit)return explicit[0];
 const text=`${context.title || ""} ${context.description || ""}`.toLowerCase().replace(/[_-]/g," ");
 const inferred=rules.find(([,pattern])=>pattern.test(text));
 if(inferred)return inferred[0];
 return context.kind === "offer" ? "shopping" : context.kind === "drop" ? "creator" : "community";
}
export function brandPlaceholder(context: BrandImageContext = {}) {
 const category=pickBrandImageCategory(context);
 const src=assets[`../assets/placeholders/${category}.webp`];
 const small=assets[`../assets/placeholders/${category}-small.webp`];
 return {category,src,srcSet:`${small} 512w, ${src} 1024w`,objectPosition:category === "community" ? "50% center" : "62% center"};
}
export function usableArtwork(src?: string | null): string | null {
 const value=src?.trim();
 return value && /^(https?:\/\/|\/(?!\/)|blob:|data:image\/(png|jpeg|webp|gif);)/i.test(value) ? value : null;
}
