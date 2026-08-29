import React, { useState } from 'react';
import { X, BookOpen, ChefHat, Sparkles, Clock, Users, ShieldAlert, CheckCircle2, Download, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  title: string;
  application: 'Cook (Hot/Savoury)' | 'Whip (Cold/Dessert)' | 'Beverage / Bonus';
  prepTime: string;
  servings: string;
  description: string;
  highlights: string[];
  conceptIngredients: string[];
  steps: string[];
  image: string;
  tag: string;
}

const ARLA_CONCEPT_RECIPES: Recipe[] = [
  {
    id: 'rasta-pasta',
    title: 'Arla Roadshow Rasta Pasta',
    application: 'Cook (Hot/Savoury)',
    prepTime: '25 mins',
    servings: '4 servings',
    description: 'The hero savoury roadshow application. Penne tossed with colourful bell peppers, Scotch bonnet, scallions, and a rich, velvety Arla Whip & Cook reduction that stays stable under high heat.',
    highlights: ['Heat-stable cream reduction', 'No curdling at boiling temp', 'Smooth, coating texture'],
    conceptIngredients: [
      '1 cup Arla Pro Whip & Cook 28%',
      '300g Penne rigate pasta',
      '1/2 each Red, yellow, and green bell peppers (sliced)',
      '2 cloves Garlic (minced)',
      '1/2 Scotch bonnet pepper (deseeded, finely chopped)',
      '2 stalks Scallion (chopped)',
      '1 tbsp Jamaican jerk seasoning blend',
      '1/4 cup Grated parmesan cheese'
    ],
    steps: [
      'Boil pasta in salted water until al dente; reserve 1/4 cup pasta water.',
      'Sauté minced garlic, sliced peppers, and Scotch bonnet in a pan until fragrant.',
      'Pour in Arla Pro Whip & Cook 28% and stir in jerk seasoning. Simmer gently on medium-high heat until the cream reduces into a rich, silky sauce.',
      'Fold in cooked pasta and parmesan. Toss well to coat every ridge.',
      'Garnish with fresh scallions and serve hot.'
    ],
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800',
    tag: 'Savoury Hero'
  },
  {
    id: 'chocolate-mousse',
    title: 'Arla Whipped Chocolate Chip Mousse',
    application: 'Whip (Cold/Dessert)',
    prepTime: '15 mins + 1 hr chill',
    servings: '6 cups',
    description: 'The cold/dessert roadshow hero. Arla Whip & Cook whips to approx. 3.5× volume with unmatched bowl stability, holding dark cocoa and chocolate chips effortlessly.',
    highlights: ['3.5× whipped volume expansion', 'Holds firm peak structure', 'Mild flavour lets dark cocoa shine'],
    conceptIngredients: [
      '1.5 cups Arla Pro Whip & Cook 28% (chilled below 8°C)',
      '150g Dark chocolate chips (melted and slightly cooled)',
      '3 tbsp Powdered confectioners sugar',
      '1 tsp Pure vanilla extract',
      '2 tbsp Semisweet mini chocolate chips (for folding & garnish)'
    ],
    steps: [
      'Ensure Arla Whip & Cook is chilled to 8°C or below before whipping.',
      'Whip chilled Arla cream on medium-high speed until soft peaks form.',
      'Add powdered sugar and vanilla; continue whipping until firm, luscious peaks form (approx 3.5× volume).',
      'Gently fold 1/3 of the whipped cream into the cooled melted chocolate, then fold chocolate mixture back into remaining whipped cream.',
      'Fold in mini chocolate chips, spoon into serving glasses, and chill for 1 hour before serving.'
    ],
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
    tag: 'Dessert Hero'
  },
  {
    id: 'garlic-chicken',
    title: 'Creamy Garlic & Herb Pan Chicken',
    application: 'Cook (Hot/Savoury)',
    prepTime: '30 mins',
    servings: '4 servings',
    description: 'Golden pan-seared chicken breasts simmered in a rich garlic, thyme, and Arla Whip & Cook cream sauce. Demonstrates everyday dinner versatility.',
    highlights: ['Simmer stable with citrus & herbs', 'Glossy sauce consistency', 'High restaurant-grade finish'],
    conceptIngredients: [
      '1 cup Arla Pro Whip & Cook 28%',
      '4 Chicken breast cutlets (seasoned with garlic, black pepper, thyme)',
      '4 cloves Garlic (smashed)',
      '1/2 cup Chicken stock',
      '1 tbsp Butter + 1 tbsp Olive oil',
      'Fresh thyme sprigs & parsley'
    ],
    steps: [
      'Pan-sear chicken breasts in olive oil and butter until golden brown on both sides; remove to a warm plate.',
      'In the same skillet, sauté smashed garlic and fresh thyme for 1 minute.',
      'Deglaze with chicken stock, then pour in Arla Whip & Cook.',
      'Simmer until the sauce thickens to a velvety nap, return chicken to pan to coat, and serve.'
    ],
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800',
    tag: 'Weeknight Dinner'
  },
  {
    id: 'cheesecake-cups',
    title: 'No-Bake Strawberry Cheesecake Cups',
    application: 'Whip (Cold/Dessert)',
    prepTime: '20 mins',
    servings: '6 individual cups',
    description: 'Layered crushed Graham cracker crumbs, whipped Arla cream cheese mousse, and fresh Jamaican strawberry compote.',
    highlights: ['Quick 20-minute setup', 'Light yet stable mousse layer', 'Perfect for party catering'],
    conceptIngredients: [
      '1 cup Arla Pro Whip & Cook 28%',
      '200g Cream cheese (softened)',
      '1/3 cup Granulated sugar',
      '1 cup Graham cracker crumbs with 2 tbsp melted butter',
      '1 cup Fresh strawberries (diced & lightly sweetened)'
    ],
    steps: [
      'Whip chilled Arla Whip & Cook until medium peaks form; set aside.',
      'Beat softened cream cheese with sugar until smooth and creamy.',
      'Gently fold whipped Arla cream into the cream cheese mixture until homogenous and fluffy.',
      'Layer cups with buttery Graham crumbs, cheesecake mousse, and fresh strawberry topping.'
    ],
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800',
    tag: 'Dessert'
  },
  {
    id: 'strong-back-punch',
    title: 'Jamaican Strong Back Cream Punch',
    application: 'Beverage / Bonus',
    prepTime: '10 mins',
    servings: '4 glasses',
    description: 'The secret activation bonus drop. Arla Whip & Cook blended into a smooth, decadent Jamaican stout and peanut punch with nutmeg and condensed sweetness.',
    highlights: ['Blends smoothly without separation', 'Velvety mouthfeel in cold drinks', 'Jamaican cultural favourite'],
    conceptIngredients: [
      '3/4 cup Arla Pro Whip & Cook 28%',
      '1 bottle (284ml) Dragon Stout or Guinness',
      '1/2 cup Roasted peanut butter or raw peanuts',
      '1/2 cup Condensed milk (to taste)',
      '1/4 tsp Ground nutmeg & 1/2 tsp Vanilla essence',
      'Crushed ice'
    ],
    steps: [
      'Add stout, peanut butter, and condensed milk into a high-speed blender.',
      'Pour in chilled Arla Pro Whip & Cook, nutmeg, and vanilla.',
      'Blend on medium-high until silky, frothy, and fully emulsified.',
      'Pour over crushed ice and dust with fresh nutmeg.'
    ],
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800',
    tag: 'Secret Bonus Drop'
  }
];

interface ArlaRecipePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlocked?: boolean;
}

export const ArlaRecipePackModal: React.FC<ArlaRecipePackModalProps> = ({
  isOpen,
  onClose,
  unlocked = true
}) => {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);

  if (!isOpen) return null;

  const currentRecipe = ARLA_CONCEPT_RECIPES[selectedRecipeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121214] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-6 text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner with Brand Colors */}
        <div className="relative bg-gradient-to-r from-[#8A1538] via-[#5A0C22] to-[#005826] p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white text-[#8A1538] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Arla Pro × Promorang Digital Product
            </span>
            <span className="bg-[#008543] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              5-Recipe Pack
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white">
            5 Ways to Whip & Cook with Arla
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            One product. Hot, cold and everything between. Designed for both cooking and whipping with approximately 3.5× volume expansion.
          </p>

          {/* Product Storage & Guidelines Notice */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/20 text-[11px]">
            <div className="bg-black/30 rounded-xl p-2">
              <span className="text-white/50 block text-[9px] uppercase font-bold">Fat Content</span>
              <strong className="text-white font-black">28% Fat</strong>
            </div>
            <div className="bg-black/30 rounded-xl p-2">
              <span className="text-white/50 block text-[9px] uppercase font-bold">Storage</span>
              <strong className="text-white font-black">Keep ≤ 8°C</strong>
            </div>
            <div className="bg-black/30 rounded-xl p-2">
              <span className="text-white/50 block text-[9px] uppercase font-bold">Shelf Care</span>
              <strong className="text-white font-black">Do Not Freeze</strong>
            </div>
            <div className="bg-black/30 rounded-xl p-2">
              <span className="text-white/50 block text-[9px] uppercase font-bold">Open Life</span>
              <strong className="text-white font-black">Use in ~3 Days</strong>
            </div>
          </div>
        </div>

        {/* Recipe Selector Tabs */}
        <SwipeRail compact fadeFrom="from-black" showDots={false} className="border-b border-white/10 bg-white/[0.02] p-2" scrollerClassName="gap-2">
          {ARLA_CONCEPT_RECIPES.map((recipe, index) => {
            const isSelected = selectedRecipeIndex === index;
            return (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipeIndex(index)}
                aria-selected={isSelected}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 snap-start ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8A1538] to-[#008543] text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{index + 1}.</span>
                <span>{recipe.title}</span>
              </button>
            );
          })}
        </SwipeRail>

        {/* Main Recipe Content */}
        <div className="p-6 sm:p-8 max-h-[55vh] overflow-y-auto space-y-6">
          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            
            {/* Left Column: Details, Ingredients & Steps */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-[#008543] text-[#008543] bg-[#008543]/10 text-[10px] font-black uppercase">
                    {currentRecipe.application}
                  </Badge>
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {currentRecipe.prepTime}
                  </span>
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> {currentRecipe.servings}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-black text-white">{currentRecipe.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{currentRecipe.description}</p>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {currentRecipe.highlights.map((h, i) => (
                  <span key={i} className="text-xs bg-white/5 border border-white/10 text-emerald-300 rounded-full px-3 py-1 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {h}
                  </span>
                ))}
              </div>

              {/* Ingredients List */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4" /> Concept Ingredients (Subject to Culinary Approval)
                </h4>
                <ul className="space-y-2 text-xs text-white/80">
                  {currentRecipe.conceptIngredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparation Steps */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Preparation Method</h4>
                <ol className="space-y-3 text-xs text-white/80">
                  {currentRecipe.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-5 w-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right Column: Recipe Visual & Roadshow Deal Link */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[4/3] bg-black">
                <img
                  src={currentRecipe.image}
                  alt={currentRecipe.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Roadshow Activation Callout */}
              <div className="rounded-2xl border border-[#8A1538]/40 bg-gradient-to-b from-[#8A1538]/20 to-black p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Current PriceSmart Offer
                </span>
                <p className="text-lg font-black text-white">J$1,200 / 1L Carton</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  We've been advised the usual regular price is approx. J$2,700 (approx. 56% difference). Available during the PriceSmart roadshow.
                </p>
                <Button
                  onClick={() => {
                    onClose();
                    window.location.href = '/moments/00000000-0000-0000-0002-000000000060';
                  }}
                  className="w-full rounded-xl bg-primary hover:bg-orange-500 font-bold text-black text-xs"
                >
                  View Roadshow Moment <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Compliance & Approval Notice */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[10px] text-white/40 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Promorang concept formulation. Measurements and steps require brand and culinary sign-off before being cited as official Arla recipes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-white/[0.02] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/50">
            <span className="text-emerald-400 font-bold">● Unlocked via Arla Recipe Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = `Check out the 5 Ways to Whip & Cook with Arla on Promorang: ${window.location.origin}/campaigns/arla-whip-and-cook`;
                navigator.clipboard.writeText(text);
                toast.success('Recipe Pack link copied!');
              }}
              className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs font-bold"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Pack
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success('Recipe Pack saved to your Promorang Vault!');
              }}
              className="rounded-xl bg-primary hover:bg-orange-500 text-black text-xs font-black"
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Save to Vault
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
