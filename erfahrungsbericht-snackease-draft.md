# Von der UX-Konzeption zur laufenden App – mit KI als Entwicklungspartner

*Ein Erfahrungsbericht über das SnackEase-Projekt*

---

## Der Ausgangspunkt: Eine Bewerbungsaufgabe als Experiment

Eigentlich war es eine ganz klassische Situation: Bewerbungsaufgabe bekommen, UX-Konzept erarbeiten, abgeben, hoffen. Die Aufgabe von Anwalt.de lautete, eine Mitarbeiter-App für einen Snack-Kiosk an den Standorten Nürnberg und Berlin zu konzipieren. Eine Employee-Benefit-App, die nicht nur einkaufen ermöglicht, sondern auch motivieren, vergleichen und gesunde Ernährung fördern soll.

Ich habe mich durch Personas gearbeitet, User Flows entworfen, Wireframes skizziert und schließlich High-Fidelity-Screens in Figma gebaut. Das Ergebnis ist als Case Study auf [re-design.de](https://re-design.de) dokumentiert.

Aber dann kam mir ein Gedanke: Was wäre, wenn ich die App auch wirklich bauen würde?

---

## Die Idee: UX-Konzept trifft KI-Entwicklung

Als UX-Designer lebe ich im Konzeptionellen. Ich denke in User Flows, Interaktionen, Bedürfnissen. Code ist dabei klassischerweise nicht mein Terrain. Und genau das macht dieses Experiment so interessant: Mit Claude Code wollte ich testen, ob eine KI meinen UX-Entwurf in eine tatsächlich funktionierende Web-App übersetzen kann – und was dabei auf der Strecke bleibt.

Das war kein Auftrag. Kein Team. Kein Budget. Nur ich, mein Konzept und ein KI-Werkzeug.

---

## Der Plan: Strukturiertes Arbeiten mit 5 spezialisierten Agenten

Vom ersten Tag an war mir klar: Einfach drauflospromptien wird nicht funktionieren. Ich wollte echten Softwareentwicklungsprozess nachbilden – strukturiert, nachvollziehbar, iterativ.

Also habe ich eine Projektstruktur mit einem 7-Phasen-Workflow aufgebaut, der von spezialisierten Agenten durchlaufen wird:

1. **Requirements Engineer** – erhebt Anforderungen, schreibt Feature Specs
2. **UX Expert** – validiert Designs gegen Personas, erstellt User Flows
3. **Solution Architect** – plant die technische Umsetzung, bevor Code entsteht
4. **Developer** – implementiert Frontend und Backend
5. **QA Engineer** – testet, dokumentiert Bugs, schreibt Testberichte
6. *(optional)* **UX Expert – nochmals** bei Empfehlung durch QA
7. **Deployment** – GitHub Push und Vercel-Veröffentlichung

Jedes neue Feature durchläuft alle Phasen. Kein Schritt überspringen. Kein Code ohne vorherige Spec.

Was zunächst nach Overhead klingt, war tatsächlich der Kern des Projekts. Nicht die Implementierung war die eigentliche Arbeit – sondern diese Struktur aufzubauen und konsequent einzuhalten.

---

## Der Ablauf: Neun Tage, 50 Commits

Das Projekt startete am 24. Februar 2026 mit einem „Initial Commit: SnackEase project setup with 7-phase workflow". Neun Tage später, am 4. März, war die erste sinnvolle Demo-Version fertig.

**Was in dieser Zeit entstand:**

- **FEAT-0: Splashscreen** – der erste Bildschirm mit Ladeanimation und Weiterleitung
- **FEAT-1 & 2: Authentication** – Admin- und Demo-User-Login mit eigenem Cookie-System
- **FEAT-3: User Switcher** – Persona-Karten auf der Loginseite für einfaches Wechseln zwischen sechs Demo-Nutzern
- **FEAT-4: Guthaben-System** – Anzeige, simuliertes Aufladen, monatliche Pauschale
- **FEAT-5: Admin-Bereich** – System-Reset, Nutzerverwaltung
- **FEAT-6: Produktkatalog** – Produktgrid mit Kategorien, Suche und Detailansicht
- **FEAT-9: Admin ohne Guthaben** – Differenzierung der Admin-Rolle

Nicht alles aus dem ursprünglichen UX-Konzept wurde umgesetzt. One-Touch-Kauf, Leaderboard, Kaufhistorie und detaillierte Statistiken sind geplant, aber noch nicht implementiert. Das ist kein Scheitern – das ist Priorisierung.

---

## Was mich überraschte: Die Geschwindigkeit

Das größte positive Aha-Erlebnis war, wie schnell aus UX-Konzepten echter, funktionierender Code wird. Ich hatte eine Feature Spec geschrieben, einen User Flow skizziert, die Accessibility-Anforderungen notiert – und der Developer-Agent hat daraus in kurzer Zeit eine laufende Seite gebaut.

Diese Übersetzungsgeschwindigkeit ist für UX-Designer bemerkenswert. Der traditionelle Weg – Handoff an Entwicklung, Abstimmung, Iteration, wieder Abstimmung – komprimiert sich auf einen Bruchteil der Zeit. Man sieht fast sofort, ob eine Designentscheidung im Echten hält.

---

## Was mich frustrierte: Der Kontext-Verlust zwischen den Phasen

Wo das Experiment seine Grenzen zeigt: die Agenten vergessen. Jeder Agent startet mit dem, was ich ihm mitgebe – und was ich möglicherweise vergessen habe mitzugeben, existiert für ihn nicht.

Das klingt banal, ist in der Praxis aber eine echte Herausforderung. Der QA Engineer findet einen Bug – den Developer Agent kenne ich nun, wenn er das nächste Feature umsetzt, ohne diesen Bug zu kennen, es sei denn, ich stelle den Kontext explizit her.

In einem echten Team gibt es Meetings, Backlog-Systeme, gemeinsames Gedächtnis. Beim Arbeiten mit Agenten bin ich dieses gemeinsame Gedächtnis. Das erfordert mehr Sorgfalt und Dokumentationsdisziplin, als ich anfangs erwartet hatte.

Auch der Tech-Stack hat sich mitten im Projekt zweimal verändert: erst von Vite zu Nuxt 3, dann von Supabase zu Neon mit Drizzle ORM. Als UX-Designer kann ich solche Entscheidungen kaum selbst bewerten – ich vertraue dem Agenten, der sie empfiehlt, und lerne dabei, dass es gut wäre, mehr technisches Grundverständnis mitzubringen.

---

## Ergebnis: Eine echte Demo-App

Was steht, ist eine funktionierende Web-App mit echter Datenbankanbindung (PostgreSQL über Neon), serverseitiger Authentifizierung und einem soliden Frontend auf Basis von Nuxt 3, Vue.js und TypeScript. Die App läuft auf Vercel und kann über Demo-Zugänge erkundet werden.

Der QA-Bericht vom 4. März dokumentiert offen: 9.9% Test-Coverage, vier offene Bugs, einige übersprungene Store-Tests. Das ist honest. Kein perfektes Produkt – aber ein reales, lauffähiges Ergebnis eines UX-Designers ohne Programmierhintergrund.

---

## Meine Meinung: KI ist Werkzeug, nicht Ersatz

Nach diesem Experiment bin ich überzeugt: KI macht mich nicht zum Entwickler. Aber sie gibt mir die Möglichkeit, meine UX-Arbeit auf eine Weise zu validieren, die vorher schlicht nicht realistisch war.

Der UX-Blick bleibt entscheidend. Ein guter Prompt setzt gutes Designverständnis voraus. Wer keine klaren User Flows denken kann, wird auch keine guten Feature Specs schreiben – und damit keine guten Ergebnisse bekommen. Die Qualität meiner UX-Konzepte war direkt proportional zur Qualität des erzeugten Codes.

Was mich beschäftigt: Wie valide ist ein KI-generiertes Ergebnis, wenn man selbst nicht tief genug in der Technologie ist, um es kritisch zu beurteilen? Ich kann Bugs erkennen, wenn die App sichtbar nicht funktioniert. Aber ob der Code dahinter wartbar, sicher oder skalierbar ist – das ist eine andere Frage.

Das bedeutet nicht, es zu lassen. Es bedeutet, mit gesundem Skeptizismus vorzugehen.

---

## Fazit

SnackEase begann als Bewerbungsaufgabe. Es wurde zu einem persönlichen Experiment darüber, was heute zwischen UX-Design und Code-Realität möglich ist.

Ich habe gelernt, dass die Struktur wichtiger ist als das Werkzeug. Dass Geschwindigkeit und Qualität auseinanderfallen können. Und dass ein guter UX-Prozess auch dann wertvoll ist, wenn kein Mensch den Code schreibt – weil er die KI zwingt, in Nutzerbedürfnissen zu denken.

Das Projekt ist nicht fertig. Und das ist in Ordnung.

---

*Der vollständige UX-Prozess ist als Case Study unter [re-design.de](https://re-design.de) dokumentiert. Der Code liegt auf GitHub.*
