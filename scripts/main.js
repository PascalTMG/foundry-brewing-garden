/**
 * Traenke brauen & Kraeutergarten
 * Portiert aus Phase 16 (DnD-Programm-Webapp). Datenkeys werden von brewing-secrets-shop weiterverwendet.
 */
const { Application } = foundry.appv1.api;

const MOD = "brewing-garden";

export const RARITY_DC = { gewoehnlich: 10, ungewoehnlich: 13, selten: 16, "sehr selten": 19 };

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
  { name: "Schattenpilz", description: "Waechst nur im Dunkeln.", quality: "schlecht", collectible: true, growHours: 14 }
];

const SEED_RECIPES = [
  { name: "Trank der Kletterkunst", rarity: "gewoehnlich", effectText: "1 Stunde lang Klettertempo = normales Tempo.", requiredIngredients: [] },
  { name: "Balsam der Wundheilung", rarity: "gewoehnlich", effectText: "Heilt 2W4+2 Trefferpunkte.", requiredIngredients: [] },
  { name: "Elixier des Nachtsehens", rarity: "gewoehnlich", effectText: "1 Stunde lang Dunkelsicht 60 ft.", requiredIngredients: [] },
  { name: "Trank der Wasseratmung", rarity: "ungewoehnlich", effectText: "1 Stunde lang unter Wasser atmen.", requiredIngredients: [] },
  { name: "Trank der Heldenkraft", rarity: "ungewoehnlich", effectText: "10 temporaere TP, Vorteil auf Rettungswuerfe gegen Furcht fuer 1 Stunde.", requiredIngredients: [] },
  { name: "Trank der wiederkehrenden Kraft", rarity: "ungewoehnlich", effectText: "Ein verbrauchter Zauberplatz Grad 1 wird zurueckerlangt.", requiredIngredients: [] },
  { name: "Trank der Verkleinerung", rarity: "selten", effectText: "10 Minuten lang um eine Groessenkategorie verkleinert.", requiredIngredients: [] },
  { name: "Trank der Gedankenlesung", rarity: "selten", effectText: "5 Minuten lang Oberflaechengedanken einer Kreatur lesen.", requiredIngredients: [] },
  { name: "Nebelform-Essenz", rarity: "selten", effectText: "1 Minute lang in Nebelform, immun gegen nichtmagischen Schaden.", requiredIngredients: [] },
  { name: "Trank der Geschwindigkeit", rarity: "sehr selten", effectText: "1 Minute lang doppeltes Tempo, +2 RK, Vorteil auf Geschicklichkeitsrettungswuerfe.", requiredIngredients: [] }
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
    return foundry.utils.mergeObject(super.defaultOptions, { id: "brewing-garden-brew", title: "Brauen", width: 460, height: "auto" });
  }

  constructor(...args) {
    super(...args);
    this.round = 0;
    this.points = 0;
    this.incident = false;
    this.rounds = [];
  }

  async _renderInner() {
    const actors = game.actors.filter(a => a.isOwner && a.type === "character");
    const recipes = BrewingData.recipes();
    const skills = Object.entries(CONFIG.DND5E.skills).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="brewing-garden-app">
        <div class="form-group"><label>Charakter</label><select name="actorId">${actors.map(a => `<option value="${a.id}">${a.name}</option>`).join("")}</select></div>
        <div class="form-group"><label>Rezept</label><select name="recipeId">${recipes.map(r => `<option value="${r.id}">${r.name} (${r.rarity}, SG ${r.dc})</option>`).join("")}</select></div>
        <div class="form-group"><label>Runde ${this.round + 1}/3 - Fertigkeit</label><select name="skill">${skills}</select></div>
        <button type="button" data-action="roll">Wuerfeln</button>
        <div class="log" data-log></div>
      </div>
    `;
    const html = $(el.firstElementChild);
    html.find("[data-action=roll]").on("click", () => this._onRoll(html));
    return html;
  }

  async _onRoll(html) {
    if (this.round >= 3) return;
    const actor = game.actors.get(html.find("[name=actorId]").val());
    const recipe = BrewingData.recipes().find(r => r.id === html.find("[name=recipeId]").val());
    const skill = html.find("[name=skill]").val();
    if (!actor || !recipe) return;
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
        <button type="button" data-action="seed">Grunddaten laden (12 Zutaten + 10 Rezepte)</button>
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

Hooks.on("getSceneControlButtons", controls => {
  const tools = controls.tokens.tools;
  tools["brewing-garden-garden"] = { name: "brewing-garden-garden", title: "Kraeutergarten", icon: "fa-solid fa-seedling", button: true, order: Object.keys(tools).length, onChange: () => new GardenApp().render(true) };
  tools["brewing-garden-brew"] = { name: "brewing-garden-brew", title: "Brauen", icon: "fa-solid fa-flask", button: true, order: Object.keys(tools).length, onChange: () => new BrewSessionApp().render(true) };
  if (game.user.isGM) {
    tools["brewing-garden-admin"] = { name: "brewing-garden-admin", title: "Zutaten & Rezepte", icon: "fa-solid fa-mortar-pestle", button: true, order: Object.keys(tools).length, onChange: () => new BrewingAdminApp().render(true) };
  }
});

export { BrewingData };
