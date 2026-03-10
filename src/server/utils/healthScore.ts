/**
 * Gesundheits-Score-Berechnung (FEAT-20)
 *
 * Dreistufige Gewichtungsformel:
 * - 50% Kalorien (weniger = besser)
 * - 30% Zucker (weniger = besser)
 * - 20% Fett (weniger = besser)
 * - Bonus: +0.5 fuer vegane Produkte, +0.3 fuer glutenfreie Produkte
 *
 * Ergebnis: ganzzahliger Score 1-10 oder null wenn keine gueltigen Daten vorhanden.
 */

export interface HealthItem {
  calories: number | null
  sugar: number | null
  fat: number | null
  isVegan: boolean | null
  isGlutenFree: boolean | null
  quantity: number
}

/**
 * Berechnet den Gesundheits-Score gemaess FEAT-20 Tech-Design.
 *
 * @param items - Liste der Produkte mit Menge und Naehrwerten
 * @returns Ganzzahliger Score 1-10 oder null wenn keine Daten vorhanden
 */
export function calculateHealthScore(items: HealthItem[]): number | null {
  // Nur Items mit mindestens einem Naehrwert einbeziehen
  const validItems = items.filter(
    (item) => item.calories !== null || item.sugar !== null || item.fat !== null,
  )

  if (validItems.length === 0) {
    return null
  }

  const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0)

  if (totalQuantity === 0) {
    return null
  }

  // Gewichtete Durchschnittswerte berechnen
  let weightedCalories = 0
  let weightedSugar = 0
  let weightedFat = 0
  let veganItems = 0
  let glutenFreeItems = 0

  for (const item of validItems) {
    weightedCalories += (item.calories ?? 0) * item.quantity
    weightedSugar += (item.sugar ?? 0) * item.quantity
    weightedFat += (item.fat ?? 0) * item.quantity
    if (item.isVegan) veganItems += item.quantity
    if (item.isGlutenFree) glutenFreeItems += item.quantity
  }

  const avgCalories = weightedCalories / totalQuantity
  const avgSugar = weightedSugar / totalQuantity
  const avgFat = weightedFat / totalQuantity
  const veganRatio = veganItems / totalQuantity
  const glutenRatio = glutenFreeItems / totalQuantity

  // Schritt 2: Teilscores (0-10)
  // 0 kcal = 10 Punkte, 500 kcal = 0 Punkte, linear
  const calorieScore = Math.max(0, Math.min(10, 10 - avgCalories / 50))
  // 0g Zucker = 10 Punkte, 50g = 0 Punkte, linear
  const sugarScore = Math.max(0, Math.min(10, 10 - avgSugar / 5))
  // 0g Fett = 10 Punkte, 50g = 0 Punkte, linear
  const fatScore = Math.max(0, Math.min(10, 10 - avgFat / 5))

  // Schritt 3: Gewichteter Rohscore
  const rawScore = calorieScore * 0.5 + sugarScore * 0.3 + fatScore * 0.2

  // Schritt 4: Boni addieren
  const bonus = veganRatio * 0.5 + glutenRatio * 0.3
  const boostedScore = rawScore + bonus

  // Schritt 5: Auf Integer 1-10 runden und clamp
  return Math.max(1, Math.min(10, Math.round(boostedScore)))
}
