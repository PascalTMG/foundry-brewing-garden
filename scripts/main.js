/**
 * Traenke brauen & Kraeutergarten
 * Portiert aus Phase 16 (DnD-Programm-Webapp). Datenkeys werden von brewing-secrets-shop weiterverwendet.
 *
 * Traenke-Mechanik (Rarity/DC, Grundrezepte) basiert teils auf dem SRD 5.1 (Potions-Abschnitt),
 * verfuegbar unter CC-BY-4.0: https://dnd.wizards.com/resources/systems-reference-document
 * Zutaten-/Komponentenlisten und das Monster-Ernte-System sind an eine gaengige Harvesting-Hausregel
 * angelehnt (Zutaten/Kosten als reine Spieldaten, Texte selbst formuliert).
 */
const { Application } = foundry.appv1.api;

const MOD = "brewing-garden";

export const RARITY_DC = { gewoehnlich: 10, ungewoehnlich: 13, selten: 16, "sehr selten": 19 };

export const COMPONENT_TAGS = [
  "Gift", "Vitalitaet", "Kaelte", "Unheilig", "Feuer", "Erde", "Luft", "Arkan",
  "Psychisch", "Staerke", "Heimlichkeit", "Wasser", "Blitz", "Saeure", "Pflanzlich"
];

// Ernte-SG nach Kreaturengroesse x Teil-Schwierigkeit. Die Quelle kennt keine eigene
// "Gross"-Spalte, hier per Interpolation zwischen "Mittelgross" und "Riesig" gesetzt.
export const HARVEST_DC = {
  tiny: { easy: 12, medium: 15, hard: 18 },
  sm: { easy: 10, medium: 13, hard: 16 },
  med: { easy: 10, medium: 13, hard: 16 },
  lg: { easy: 11, medium: 14, hard: 17 },
  huge: { easy: 12, medium: 15, hard: 18 },
  grg: { easy: 14, medium: 17, hard: 20 }
};

export const SIZE_LABELS = { tiny: "Winzig", sm: "Klein", med: "Mittelgross", lg: "Gross", huge: "Riesig", grg: "Gigantisch" };
export const PART_LABELS = { easy: "Leicht (Gliedmassen)", medium: "Mittel (Merkmale)", hard: "Schwer (Organe)" };

const SEED_INGREDIENTS = [
  { name: "Mondbluetenblatt", description: "Leuchtet schwach im Dunkeln.", quality: "selten", collectible: true, growHours: 12 },
  { name: "Sumpfwurzel", description: "Zaeh und bitter.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Irrlichtstaub", description: "Feiner, flimmernder Staub.", quality: "selten", collectible: true, growHours: null },
  { name: "Silberdornbeere", description: "Kleine, stachelige Beere.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Nebeltau", description: "Gesammelter Morgentau aus Nebelgebieten.", quality: "normal", collectible: true, growHours: null },
  { name: "Drachenkraut", description: "Scharf riechendes rotes Kraut.", quality: "selten", collectible: true, growHours: 24 },
  { name: "Kristallmoos", description: "Glasiges Moos von feuchten Hoehlenwaenden.", quality: "normal", collectible: true, growHours: 10 },
  { name: "Wolfsbeere", description: "Dunkelviolette Waldbeere.", quality: "schlecht", collectible: true, growHours: 5 },
  { name: "Sternenanis", description: "Sternfoermige Samenkapsel.", quality: "normal", collectible: true, growHours: 9 },
  { name: "Bergquellwasser", description: "Reines Wasser aus einer Hochgebirgsquelle.", quality: "normal", collectible: true, growHours: null },
  { name: "Feueropalsplitter", description: "Warmer, rot schimmernder Splitter.", quality: "selten", collectible: true, growHours: null },
  { name: "Schattenpilz", description: "Waechst nur im Dunkeln.", quality: "schlecht", collectible: true, growHours: 14 },
  // Zutaten aus der erweiterten Traenke-/Gift-Liste (siehe SEED_RECIPES/POISON-Rezepte in brewing-secrets-shop)
  { name: "Phosphoreszierendes Moos", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Baumharz", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Aetherische Essenz", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Terpentinoel", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Platinsplitter", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Quecksilber", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Melasse", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Passionsfrucht", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 10 },
  { name: "Rosenblaetter", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 5 },
  { name: "Essensreste", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Heidelbeeren", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Zitronengras", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 7 },
  { name: "Jasmin", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 7 },
  { name: "Drei Erdarten", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Sechs Speisen", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Mandelwurzel", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: 14 },
  { name: "Pfefferkoerner", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Loewenzahn", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 4 },
  { name: "Feenstaub", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Weihrauch", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Kraeftiger Eintopf", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Granatpulver", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Eiszapfen", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Saphirstaub", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Onyxstaub", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Stalaktit", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Lava", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Rubinstaub", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Diamantstaub", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Feste Wolke", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Koralle", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Aquamarinpulver", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Donnerranke", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: 16 },
  { name: "Bambus", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Drachenfrucht", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 10 },
  { name: "Wunderbeeren", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 4 },
  { name: "Silberpulver", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Goldpulver", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Platinpulver", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Lapislazuli-Pulver", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Destilliertes Wasser", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Lebensessenz dreier Kreaturen", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Kupferpulver", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Quarz", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Eibenbeeren", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 9 },
  { name: "Kreide", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Lauge", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Minze", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 5 },
  { name: "Winterbeere", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Chilischote", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Feuerdorn", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 7 },
  { name: "Salzwasser", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Bernstein", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Pottasche", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Arrowroot", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 9 },
  { name: "Schlangenwurz", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: 12 },
  { name: "Zinnober", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Salbei", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 5 },
  { name: "Elysische Frucht", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: 10 },
  { name: "Weihwasser", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Schwarzpulver", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Kaffeebohnen", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Honig", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Stachelbeeren", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 6 },
  { name: "Dschungelmoos", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 9 },
  { name: "Roter Seetang", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  // Zutaten aus der Giftliste (brewing-secrets-shop)
  { name: "Feinwein", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: null },
  { name: "Oleander", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 10 },
  { name: "Othurmoos", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 11 },
  { name: "Speichel eines Kletterwesens", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Todeskappenpilz", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 13 },
  { name: "Chronolilie", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: 15 },
  { name: "Schwefel", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Calomel", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Traenentropfen", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null },
  { name: "Thymian", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 5 },
  { name: "Vitrioloel", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Taggit-Wurzel", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 13 },
  { name: "Seidenpflanze", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 7 },
  { name: "Blut eines Grabwesens", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Schlangenoel", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: null },
  { name: "Suessholzwurzel", description: "Alchemie-Zutat.", quality: "normal", collectible: true, growHours: 8 },
  { name: "Nachtschatten", description: "Alchemie-Zutat.", quality: "schlecht", collectible: true, growHours: 9 },
  { name: "Drachenblut", description: "Alchemie-Zutat.", quality: "selten", collectible: true, growHours: null }
];

const SEED_RECIPES = [
  { name: "Trank der Kletterkunst", rarity: "gewoehnlich", effectText: "1 Stunde lang Klettertempo = normales Tempo.", requiredIngredients: [], requiredComponents: [] },
  { name: "Balsam der Wundheilung", rarity: "gewoehnlich", effectText: "Heilt 2W4+2 Trefferpunkte.", requiredIngredients: [], requiredComponents: [] },
  { name: "Elixier des Nachtsehens", rarity: "gewoehnlich", effectText: "1 Stunde lang Dunkelsicht 60 ft.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der Wasseratmung", rarity: "ungewoehnlich", effectText: "1 Stunde lang unter Wasser atmen.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der Heldenkraft", rarity: "ungewoehnlich", effectText: "10 temporaere TP, Vorteil auf Rettungswuerfe gegen Furcht fuer 1 Stunde.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der wiederkehrenden Kraft", rarity: "ungewoehnlich", effectText: "Ein verbrauchter Zauberplatz Grad 1 wird zurueckerlangt.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der Verkleinerung", rarity: "selten", effectText: "10 Minuten lang um eine Groessenkategorie verkleinert.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der Gedankenlesung", rarity: "selten", effectText: "5 Minuten lang Oberflaechengedanken einer Kreatur lesen.", requiredIngredients: [], requiredComponents: [] },
  { name: "Nebelform-Essenz", rarity: "selten", effectText: "1 Minute lang in Nebelform, immun gegen nichtmagischen Schaden.", requiredIngredients: [], requiredComponents: [] },
  { name: "Trank der Geschwindigkeit", rarity: "sehr selten", effectText: "1 Minute lang doppeltes Tempo, +2 RK, Vorteil auf Geschicklichkeitsrettungswuerfe.", requiredIngredients: [], requiredComponents: [] },

  // --- Erweiterung: SRD-5.1-Traenke (CC-BY-4.0) + gaengige Zusatz-Traenke, ins Deutsche uebertragen ---
  { name: "Liebestrank", rarity: "ungewoehnlich", effectText: "Die naechste Kreatur, die du innerhalb von 10 Minuten siehst, bezaubert dich 1 Stunde lang (Philter of Love).", requiredIngredients: ["Passionsfrucht", "Rosenblaetter"], requiredComponents: ["Psychisch"] },
  { name: "Trank der Tierfreundschaft", rarity: "ungewoehnlich", effectText: "1 Stunde lang kannst du nach Belieben den Zauber Tierfreundschaft wirken (SG 13).", requiredIngredients: ["Essensreste", "Heidelbeeren"], requiredComponents: ["Psychisch"] },
  { name: "Trank der Hellsicht", rarity: "selten", effectText: "Du erhaeltst den Effekt des Zaubers Hellsicht.", requiredIngredients: ["Zitronengras", "Jasmin"], requiredComponents: ["Psychisch", "Heimlichkeit"] },
  { name: "Trank des Wachstums", rarity: "ungewoehnlich", effectText: "1W4 Stunden lang der Vergroessern-Effekt von Vergroessern/Verkleinern.", requiredIngredients: ["Bambus", "Drachenfrucht"], requiredComponents: ["Staerke"] },
  { name: "Trank des Fliegens", rarity: "sehr selten", effectText: "1 Stunde lang Flugtempo = Lauftempo, inklusive Schweben.", requiredIngredients: ["Loewenzahn", "Feenstaub"], requiredComponents: ["Luft", "Blitz", "Heimlichkeit"] },
  { name: "Trank der Unsichtbarkeit", rarity: "sehr selten", effectText: "1 Stunde lang unsichtbar (samt Ausruestung); Effekt endet bei Angriff oder Zauberwirken.", requiredIngredients: ["Destilliertes Wasser", "Silberpulver"], requiredComponents: ["Saeure", "Arkan", "Heimlichkeit"] },
  { name: "Trank der Nebelform", rarity: "selten", effectText: "1 Stunde lang Effekt des Zaubers Nebelform (keine Konzentration noetig).", requiredIngredients: ["Weihrauch"], requiredComponents: ["Luft", "Unheilig"] },

  { name: "Trank der Saeureresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Saeureschaden.", requiredIngredients: ["Kreide", "Lauge"], requiredComponents: ["Saeure"] },
  { name: "Trank der Kaelteresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Kaelteschaden.", requiredIngredients: ["Minze", "Winterbeere"], requiredComponents: ["Kaelte"] },
  { name: "Trank der Feuerresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Feuerschaden.", requiredIngredients: ["Chilischote", "Feuerdorn"], requiredComponents: ["Feuer"] },
  { name: "Trank der Kraftresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Kraftschaden.", requiredIngredients: ["Granatpulver"], requiredComponents: ["Arkan"] },
  { name: "Trank der Blitzresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Blitzschaden.", requiredIngredients: ["Salzwasser", "Silberpulver"], requiredComponents: ["Blitz"] },
  { name: "Trank der Nekroseresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen nekrotischen Schaden.", requiredIngredients: ["Bernstein", "Pottasche"], requiredComponents: ["Unheilig"] },
  { name: "Trank der Giftresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Giftschaden.", requiredIngredients: ["Arrowroot", "Schlangenwurz"], requiredComponents: ["Gift"] },
  { name: "Trank der psychischen Resistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen psychischen Schaden.", requiredIngredients: ["Zinnober", "Salbei"], requiredComponents: ["Psychisch"] },
  { name: "Trank der Strahlungsresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Strahlungsschaden.", requiredIngredients: ["Elysische Frucht", "Weihwasser"], requiredComponents: ["Vitalitaet"] },
  { name: "Trank der Donnerresistenz", rarity: "ungewoehnlich", effectText: "1 Stunde lang Resistenz gegen Donnerschaden.", requiredIngredients: ["Schwarzpulver"], requiredComponents: ["Luft"] },

  { name: "Elixier der Gesundheit", rarity: "gewoehnlich", effectText: "Heilt jede Krankheit und beendet den Zustand vergiftet.", requiredIngredients: ["Phosphoreszierendes Moos", "Baumharz"], requiredComponents: ["Gift", "Vitalitaet"] },
  { name: "Oel der Aetherwelt", rarity: "selten", effectText: "Reicht fuer eine mittelgrosse Kreatur samt Ausruestung; 10 Minuten auftragen, dann 1 Stunde lang aetherisch (Aetherform-Effekt).", requiredIngredients: ["Aetherische Essenz"], requiredComponents: ["Kaelte", "Unheilig"] },
  { name: "Oel der Schaerfe", rarity: "sehr selten", effectText: "Bestreicht eine Hieb-/Stichwaffe (oder bis zu 5 Munitionsstuecke); 1 Stunde lang +3 auf Angriffs- und Schadenswuerfe.", requiredIngredients: ["Terpentinoel", "Platinsplitter"], requiredComponents: ["Saeure", "Kaelte", "Erde"] },
  { name: "Oel der Glaette", rarity: "ungewoehnlich", effectText: "Bedeckt eine mittelgrosse Kreatur samt Ausruestung, 8 Stunden lang Freiheit der Bewegung; alternativ als Flaeche ausgegossen wie Schmieren.", requiredIngredients: ["Quecksilber", "Melasse"], requiredComponents: ["Wasser"] },

  { name: "Trank der Riesenkraft: Huegelriese", rarity: "ungewoehnlich", effectText: "1 Stunde lang STK 21 (wirkungslos, falls STK bereits hoeher).", requiredIngredients: ["Kraeftiger Eintopf", "Granatpulver"], requiredComponents: ["Staerke"] },
  { name: "Trank der Riesenkraft: Frost-/Steinriese", rarity: "selten", effectText: "1 Stunde lang STK 23 (wirkungslos, falls STK bereits hoeher).", requiredIngredients: ["Eiszapfen", "Saphirstaub"], requiredComponents: ["Kaelte", "Staerke"] },
  { name: "Trank der Riesenkraft: Feuerriese", rarity: "selten", effectText: "1 Stunde lang STK 25 (wirkungslos, falls STK bereits hoeher).", requiredIngredients: ["Lava", "Rubinstaub"], requiredComponents: ["Feuer", "Staerke"] },
  { name: "Trank der Riesenkraft: Wolkenriese", rarity: "sehr selten", effectText: "1 Stunde lang STK 27 (wirkungslos, falls STK bereits hoeher).", requiredIngredients: ["Diamantstaub", "Feste Wolke"], requiredComponents: ["Luft", "Arkan", "Staerke"] },

  { name: "Grosser Heiltrank", rarity: "ungewoehnlich", effectText: "Heilt 4W4+4 Trefferpunkte.", requiredIngredients: ["Wunderbeeren", "Silberpulver"], requiredComponents: ["Pflanzlich"] },
  { name: "Ueberlegener Heiltrank", rarity: "selten", effectText: "Heilt 8W4+8 Trefferpunkte.", requiredIngredients: ["Wunderbeeren", "Goldpulver"], requiredComponents: ["Pflanzlich", "Vitalitaet"] },
  { name: "Hoechster Heiltrank", rarity: "sehr selten", effectText: "Heilt 10W4+20 Trefferpunkte.", requiredIngredients: ["Wunderbeeren", "Platinpulver"], requiredComponents: ["Pflanzlich", "Staerke", "Vitalitaet"] },

  { name: "Trank des Gifts", rarity: "ungewoehnlich", effectText: "Sieht aus wie ein Heiltrank. Wer trinkt: 3W6 Giftschaden (Rettungswurf SG 13 Konstitution, sonst zusaetzlich vergiftet).", requiredIngredients: ["Eibenbeeren"], requiredComponents: ["Gift"] },
  { name: "Trank der Unverwundbarkeit", rarity: "sehr selten", effectText: "1 Minute lang Resistenz gegen jeglichen Schaden.", requiredIngredients: ["Diamantstaub"], requiredComponents: ["Feuer", "Staerke"] },
  { name: "Trank der Langlebigkeit", rarity: "sehr selten", effectText: "Reduziert das wahre Alter um 1W6+6 Jahre (kumulative Chance auf permanente Verjuengung, SL-Ermessen).", requiredIngredients: ["Lebensessenz dreier Kreaturen"], requiredComponents: ["Saeure", "Arkan", "Blitz"] },
  { name: "Trank der Vitalitaet", rarity: "selten", effectText: "Beendet Erschoepfung, heilt jede Krankheit sowie 1 Stufe Verlust von maximalen TP und alle verlorenen Trefferwuerfel.", requiredIngredients: ["Stachelbeeren", "Dschungelmoos"], requiredComponents: ["Pflanzlich", "Gift", "Vitalitaet"] },
  { name: "Trank des Feueratems", rarity: "gewoehnlich", effectText: "1 Minute lang: als Aktion 5-ft-Kegel Feuer, 4W6 Feuerschaden (Rettungswurf SG 13 Geschicklichkeit halbiert), einmal pro Runde.", requiredIngredients: ["Mandelwurzel", "Pfefferkoerner"], requiredComponents: ["Feuer"] }
];

Hooks.once("init", () => {
  game.settings.register(MOD, "ingredients", { scope: "world", config: false, type: Array, default: [] });
  game.settings.register(MOD, "recipes", { scope: "world", config: false, type: Array, default: [] });
  game.settings.register(MOD, "gardenPlots", {
    scope: "world",
    config: false,
    type: Array,
    default: Array.from({ length: 6 }, (_, i) => ({ index: i, ingredientId: null, plantedAt: null }))
  });
});

function id() {
  return foundry.utils.randomID();
}

class BrewingData {
  static ingredients() {
    return game.settings.get(MOD, "ingredients");
  }
  static recipes() {
    return game.settings.get(MOD, "recipes");
  }
  static plots() {
    return game.settings.get(MOD, "gardenPlots");
  }

  static async seed() {
    const ingredients = BrewingData.ingredients();
    const recipes = BrewingData.recipes();
    for (const i of SEED_INGREDIENTS) if (!ingredients.find(x => x.name === i.name)) ingredients.push({ id: id(), ...i });
    for (const r of SEED_RECIPES) if (!recipes.find(x => x.name === r.name)) recipes.push({ id: id(), ...r, dc: RARITY_DC[r.rarity] });
    await game.settings.set(MOD, "ingredients", ingredients);
    await game.settings.set(MOD, "recipes", recipes);
  }

  static async addIngredient(data) {
    const list = BrewingData.ingredients();
    list.push({ id: id(), ...data });
    await game.settings.set(MOD, "ingredients", list);
  }

  static async removeIngredient(ingId) {
    await game.settings.set(MOD, "ingredients", BrewingData.ingredients().filter(i => i.id !== ingId));
  }

  static async addRecipe(data) {
    const list = BrewingData.recipes();
    list.push({ id: id(), ...data, dc: RARITY_DC[data.rarity] });
    await game.settings.set(MOD, "recipes", list);
  }

  static async removeRecipe(recId) {
    await game.settings.set(MOD, "recipes", BrewingData.recipes().filter(r => r.id !== recId));
  }

  static async plant(plotIndex, ingredientId) {
    const plots = BrewingData.plots();
    plots[plotIndex] = { index: plotIndex, ingredientId, plantedAt: Date.now() };
    await game.settings.set(MOD, "gardenPlots", plots);
  }

  static isReady(plot) {
    if (!plot.ingredientId || !plot.plantedAt) return false;
    const ing = BrewingData.ingredients().find(i => i.id === plot.ingredientId);
    if (!ing?.growHours) return false;
    return Date.now() - plot.plantedAt >= ing.growHours * 3600 * 1000;
  }

  static async harvest(plotIndex, actor) {
    const plots = BrewingData.plots();
    const plot = plots[plotIndex];
    const ing = BrewingData.ingredients().find(i => i.id === plot.ingredientId);
    if (!ing || !BrewingData.isReady(plot)) return;
    await actor.createEmbeddedDocuments("Item", [
      { name: ing.name, type: "loot", system: { quantity: 1, description: { value: ing.description } } }
    ]);
    plots[plotIndex] = { index: plotIndex, ingredientId: null, plantedAt: null };
    await game.settings.set(MOD, "gardenPlots", plots);
    ui.notifications.info(`${ing.name} geerntet.`);
  }

  // --- Monster-Komponenten (siehe HarvestApp) ---
  static findIngredientQty(actor, name) {
    return actor.items.filter(i => i.name === name).reduce((sum, i) => sum + (i.system.quantity ?? 1), 0);
  }

  static findComponentQty(actor, tag) {
    return actor.items.filter(i => i.getFlag(MOD, "componentTags")?.includes(tag)).length;
  }

  static async consumeIngredient(actor, name, qty = 1) {
    let remaining = qty;
    for (const item of actor.items.filter(i => i.name === name)) {
      if (remaining <= 0) break;
      const have = item.system.quantity ?? 1;
      if (have <= remaining) {
        remaining -= have;
        await item.delete();
      } else {
        await item.update({ "system.quantity": have - remaining });
        remaining = 0;
      }
    }
  }

  static async consumeComponent(actor, tag) {
    const item = actor.items.find(i => i.getFlag(MOD, "componentTags")?.includes(tag));
    if (item) await item.delete();
  }

  static hasRequirements(actor, recipe) {
    if (!actor) return false;
    for (const name of recipe.requiredIngredients ?? []) {
      if (BrewingData.findIngredientQty(actor, name) < 1) return false;
    }
    for (const tag of recipe.requiredComponents ?? []) {
      if (BrewingData.findComponentQty(actor, tag) < 1) return false;
    }
    return true;
  }

  static async consumeRequirements(actor, recipe) {
    for (const name of recipe.requiredIngredients ?? []) await BrewingData.consumeIngredient(actor, name, 1);
    for (const tag of recipe.requiredComponents ?? []) await BrewingData.consumeComponent(actor, tag);
  }

  static async harvestComponent(actor, { partName, tags }) {
    await actor.createEmbeddedDocuments("Item", [
      {
        name: partName,
        type: "loot",
        system: { quantity: 1, description: { value: `Monster-Komponente (${tags.join(", ")}).` } },
        flags: { [MOD]: { componentTags: tags } }
      }
    ]);
  }
}

class GardenApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, { id: "brewing-garden-garden", title: "Kraeutergarten", width: 480, height: "auto" });
  }

  async _renderInner() {
    const plots = BrewingData.plots();
    const growable = BrewingData.ingredients().filter(i => i.growHours);
    const actor = game.user.character;
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="brewing-garden-app">
        ${actor ? "" : `<p class="notice">Kein eigener Charakter zugewiesen - Ernte kann nicht ins Inventar gelegt werden.</p>`}
        <div class="plots">
          ${plots
            .map(p => {
              if (!p.ingredientId) {
                return `<div class="plot empty" data-plot="${p.index}">
                  <select class="plant-select">${growable.map(i => `<option value="${i.id}">${i.name}</option>`).join("")}</select>
                  <button type="button" data-plant="${p.index}">Pflanzen</button>
                </div>`;
              }
              const ing = BrewingData.ingredients().find(i => i.id === p.ingredientId);
              const ready = BrewingData.isReady(p);
              return `<div class="plot ${ready ? "ready" : "growing"}" data-plot="${p.index}">
                <div>${ing?.name ?? "?"}</div>
                <div>${ready ? "erntereif" : "waechst..."}</div>
                ${ready ? `<button type="button" data-harvest="${p.index}">Ernten</button>` : ""}
              </div>`;
            })
            .join("")}
        </div>
      </div>
    `;
    const html = $(el.firstElementChild);
    html.find("[data-plant]").on("click", ev => {
      const idx = Number(ev.currentTarget.dataset.plant);
      const ingId = html.find(`.plot[data-plot="${idx}"] .plant-select`).val();
      BrewingData.plant(idx, ingId).then(() => this.render(true));
    });
    html.find("[data-harvest]").on("click", ev => {
      if (!actor) return ui.notifications.warn("Kein eigener Charakter.");
      BrewingData.harvest(Number(ev.currentTarget.dataset.harvest), actor).then(() => this.render(true));
    });
    return html;
  }
}

class BrewSessionApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, { id: "brewing-garden-brew", title: "Brauen", width: 460, height: "auto", resizable: true });
  }

  constructor(...args) {
    super(...args);
    this.round = 0;
    this.points = 0;
    this.incident = false;
    this.rounds = [];
    this.started = false;
  }

  async _renderInner() {
    const actors = game.actors.filter(a => a.isOwner && a.type === "character");
    const recipes = BrewingData.recipes();
    const skills = Object.entries(CONFIG.DND5E.skills).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="brewing-garden-app">
        <div class="form-group"><label>Charakter</label><select name="actorId" ${this.started ? "disabled" : ""}>${actors.map(a => `<option value="${a.id}">${a.name}</option>`).join("")}</select></div>
        <div class="form-group"><label>Rezept</label><select name="recipeId" ${this.started ? "disabled" : ""}>${recipes.map(r => `<option value="${r.id}">${r.name} (${r.rarity}, SG ${r.dc})</option>`).join("")}</select></div>
        <div class="requirements" data-requirements></div>
        <div class="form-group"><label>Runde ${this.round + 1}/3 - Fertigkeit</label><select name="skill">${skills}</select></div>
        <button type="button" data-action="roll">Wuerfeln</button>
        <div class="log" data-log></div>
      </div>
    `;
    const html = $(el.firstElementChild);
    const updateRequirements = () => {
      const actor = game.actors.get(html.find("[name=actorId]").val());
      const recipe = recipes.find(r => r.id === html.find("[name=recipeId]").val());
      const box = html.find("[data-requirements]");
      if (!recipe || (!recipe.requiredIngredients?.length && !recipe.requiredComponents?.length)) {
        box.html("");
        return;
      }
      const lines = [
        ...(recipe.requiredIngredients ?? []).map(n => `<li>${n}: ${actor ? BrewingData.findIngredientQty(actor, n) : 0}/1</li>`),
        ...(recipe.requiredComponents ?? []).map(t => `<li>Komponente (${t}): ${actor ? BrewingData.findComponentQty(actor, t) : 0}/1</li>`)
      ];
      box.html(`<div class="notice">Benoetigte Zutaten/Komponenten:</div><ul>${lines.join("")}</ul>`);
    };
    updateRequirements();
    html.find("[name=actorId], [name=recipeId]").on("change", updateRequirements);
    html.find("[data-action=roll]").on("click", () => this._onRoll(html));
    return html;
  }

  async _onRoll(html) {
    if (this.round >= 3) return;
    const actor = game.actors.get(html.find("[name=actorId]").val());
    const recipe = BrewingData.recipes().find(r => r.id === html.find("[name=recipeId]").val());
    const skill = html.find("[name=skill]").val();
    if (!actor || !recipe) return;
    if (!this.started) {
      if (!BrewingData.hasRequirements(actor, recipe)) {
        return ui.notifications.warn("Nicht alle benoetigten Zutaten/Komponenten im Inventar vorhanden.");
      }
      await BrewingData.consumeRequirements(actor, recipe);
      this.started = true;
    }
    const rolls = await actor.rollSkill({ skill }, { configure: false }, { create: false });
    const roll = rolls?.[0];
    if (!roll) return;
    const total = roll.total;
    const natural = roll.dice?.[0]?.total ?? roll.terms?.[0]?.total;
    let points = 0;
    if (natural === 20) points = 2;
    else if (total >= recipe.dc) points = 1;
    if (natural === 1) this.incident = true;
    this.points += points;
    this.round += 1;
    this.rounds.push({ skill, total, points });
    html.find("[data-log]").prepend(`<div>Runde ${this.round}: ${CONFIG.DND5E.skills[skill].label} = ${total} (${points} Punkt/e)</div>`);
    if (this.round >= 3) this._finish(html, actor, recipe);
    else this.render(true);
  }

  _finish(html, actor, recipe) {
    let tier;
    if (this.incident) tier = "missglueckt";
    else if (this.points >= 5) tier = "meisterhaft";
    else if (this.points >= 3) tier = "gelungen";
    else if (this.points >= 1) tier = "brauchbar";
    else tier = "missglueckt";
    const tierText = {
      meisterhaft: `Meisterhaft gelungen! ${recipe.effectText} (zusaetzlicher Bonuseffekt nach GM-Ermessen)`,
      gelungen: `Gelungen. ${recipe.effectText}`,
      brauchbar: `Brauchbar, aber mit Nachteil (nach GM-Ermessen abgeschwaecht). ${recipe.effectText}`,
      missglueckt: "Missglueckt - der Trank ist unbrauchbar (moeglicher Zwischenfall nach GM-Ermessen)."
    }[tier];
    ChatMessage.create({
      content: `<strong>${actor.name} braut "${recipe.name}"</strong><br/>Ergebnis: <strong>${tier}</strong><br/>${tierText}`
    });
    this.close();
  }
}

class HarvestApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, { id: "brewing-garden-harvest", title: "Monster ernten", width: 460, height: "auto", resizable: true });
  }

  async _renderInner() {
    const actors = game.actors.filter(a => a.isOwner && a.type === "character");
    const sizeOptions = Object.entries(SIZE_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
    const partOptions = Object.entries(PART_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
    const tagOptions = COMPONENT_TAGS.map(t => `<label class="tag"><input type="checkbox" value="${t}"/> ${t}</label>`).join("");
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="brewing-garden-app">
        <p class="notice">Erst wenn eine Kreatur besiegt ist: Groesse und Teil waehlen, Faehigkeit wuerfeln (SL entscheidet STK oder GES), bei Erfolg wird die Komponente ins Inventar gelegt.</p>
        <div class="form-group"><label>Charakter (erntet &amp; erhaelt die Komponente)</label><select name="actorId">${actors.map(a => `<option value="${a.id}">${a.name}</option>`).join("")}</select></div>
        <div class="form-group"><label>Name des Teils</label><input type="text" name="partName" placeholder="z.B. Federn (Aarakocra)"/></div>
        <div class="form-group"><label>Kreaturengroesse</label><select name="size">${sizeOptions}</select></div>
        <div class="form-group"><label>Teil-Schwierigkeit</label><select name="part">${partOptions}</select></div>
        <div class="form-group"><label>Faehigkeit</label><select name="ability"><option value="str">Staerke</option><option value="dex">Geschicklichkeit</option></select></div>
        <div data-dc></div>
        <div class="form-group tags"><label>Komponenten-Art (1-3 waehlen)</label><div class="tag-list">${tagOptions}</div></div>
        <button type="button" data-action="roll">Wuerfeln</button>
        <div class="log" data-log></div>
      </div>
    `;
    const html = $(el.firstElementChild);
    const updateDc = () => {
      const size = html.find("[name=size]").val();
      const part = html.find("[name=part]").val();
      const dc = HARVEST_DC[size][part];
      html.find("[data-dc]").html(`<div class="notice">Schwierigkeitsgrad: ${dc}</div>`);
    };
    updateDc();
    html.find("[name=size], [name=part]").on("change", updateDc);
    html.find("[data-action=roll]").on("click", () => this._onRoll(html));
    return html;
  }

  async _onRoll(html) {
    const actor = game.actors.get(html.find("[name=actorId]").val());
    const partName = html.find("[name=partName]").val()?.trim();
    const size = html.find("[name=size]").val();
    const part = html.find("[name=part]").val();
    const ability = html.find("[name=ability]").val();
    const tags = html.find(".tag-list input:checked").map((_, el) => el.value).get();
    if (!actor) return ui.notifications.warn("Kein Charakter gewaehlt.");
    if (!partName) return ui.notifications.warn("Bitte einen Namen fuer das Teil eingeben.");
    if (!tags.length) return ui.notifications.warn("Bitte mindestens eine Komponenten-Art waehlen.");
    const dc = HARVEST_DC[size][part];
    const rolls = await actor.rollAbilityCheck({ ability }, { configure: false }, { create: false });
    const roll = rolls?.[0];
    if (!roll) return;
    const success = roll.total >= dc;
    html.find("[data-log]").prepend(`<div>${ability === "str" ? "STK" : "GES"}-Probe: ${roll.total} gegen SG ${dc} - ${success ? "Erfolg" : "Fehlschlag"}</div>`);
    if (success) {
      await BrewingData.harvestComponent(actor, { partName, tags });
      ui.notifications.info(`"${partName}" (${tags.join(", ")}) geerntet und ${actor.name} ins Inventar gelegt.`);
    }
  }
}

class BrewingAdminApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, { id: "brewing-garden-admin", title: "Zutaten & Rezepte verwalten", width: 520, height: 560, resizable: true });
  }

  async _renderInner() {
    const ingredients = BrewingData.ingredients();
    const recipes = BrewingData.recipes();
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="brewing-garden-app">
        <button type="button" data-action="seed">Grunddaten laden (${SEED_INGREDIENTS.length} Zutaten + ${SEED_RECIPES.length} Rezepte)</button>
        <h3>Zutaten</h3>
        <ul>${ingredients.map(i => `<li>${i.name} (${i.quality}${i.growHours ? `, ${i.growHours}h` : ""}) <a data-remove-ing="${i.id}">entfernen</a></li>`).join("")}</ul>
        <h3>Rezepte</h3>
        <ul>${recipes.map(r => `<li>${r.name} (${r.rarity}, SG ${r.dc}) <a data-remove-rec="${r.id}">entfernen</a></li>`).join("")}</ul>
      </div>
    `;
    const html = $(el.firstElementChild);
    html.find("[data-action=seed]").on("click", () => BrewingData.seed().then(() => this.render(true)));
    html.find("[data-remove-ing]").on("click", ev => BrewingData.removeIngredient(ev.currentTarget.dataset.removeIng).then(() => this.render(true)));
    html.find("[data-remove-rec]").on("click", ev => BrewingData.removeRecipe(ev.currentTarget.dataset.removeRec).then(() => this.render(true)));
    return html;
  }
}

Hooks.once("ready", () => {
  const hub = game.modules.get("toolbox-hub")?.api;
  const group = "Traenke brauen & Kraeutergarten";
  hub?.registerTool({ id: "brewing-garden-garden", title: "Kraeutergarten", icon: "fa-solid fa-seedling", group, gmOnly: false, onClick: () => new GardenApp().render(true) });
  hub?.registerTool({ id: "brewing-garden-brew", title: "Brauen", icon: "fa-solid fa-flask", group, gmOnly: false, onClick: () => new BrewSessionApp().render(true) });
  hub?.registerTool({ id: "brewing-garden-harvest", title: "Monster ernten", icon: "fa-solid fa-paw", group, gmOnly: true, onClick: () => new HarvestApp().render(true) });
  hub?.registerTool({ id: "brewing-garden-admin", title: "Zutaten & Rezepte", icon: "fa-solid fa-mortar-pestle", group, gmOnly: true, onClick: () => new BrewingAdminApp().render(true) });
});

export { BrewingData };
