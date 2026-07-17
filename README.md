# Traenke brauen & Kraeutergarten

Portiert aus Phase 16. Fuer GM und Spieler gleichermassen sichtbar (Sprossen-/Kolben-Icon in der Token-Werkzeugleiste), Zutaten-/Rezeptverwaltung GM-only (Moerser-Icon).

## Nutzung

1. GM klickt "Zutaten & Rezepte" -> "Grunddaten laden" (12 selbst verfasste Zutaten, 10 selbst verfasste Rezepte) oder legt eigene an.
2. **Kraeutergarten**: 6 gemeinsame Beete, jeder mit eigenem Charakter (`game.user.character`) kann eine anbaubare Zutat pflanzen; nach Ablauf der Wachstumszeit erntereif, Ernte landet als Item im Inventar.
3. **Brauen**: Charakter + Rezept waehlen, 3 Runden je eine Fertigkeit waehlen und wuerfeln (`actor.rollSkill`, volle D&D-Bonusrechnung inkl. Uebung/Expertise). Punktesystem: Erfolg = 1 Punkt, natuerliche 20 = 2 Punkte, natuerliche 1 erzwingt einen Zwischenfall. Ergebnis (meisterhaft/gelungen/brauchbar/missglueckt) erscheint im Chat.

## Datenmodell (fuer Erweiterungsmodule)

Die World-Settings `brewing-garden.ingredients`, `.recipes` und `.gardenPlots` sind bewusst als eigenstaendige, offene Datenstruktur gehalten — das Modul `brewing-secrets-shop` (Phase 17) baut direkt darauf auf (Seltenheitsstufe "Legendaer", Zutatenverbrauch, Saatgut-Shops).
