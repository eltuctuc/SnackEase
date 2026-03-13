<!--
  FilterChips - Horizontal scrollbare Chip-Leiste für /search (FEAT-19)

  Gruppen (in fester Reihenfolge):
  1. Kategorien: Alle / Obst / Protein / Shakes / Schoki / Nuesse / Getraenke
  2. Verfügbarkeit: "Nur vorrätige"
  3. Preisbereich: "bis 1,00 EUR" / "1,00-2,00 EUR" / "ab 2,00 EUR"
  4. Ernährung: "Vegan" / "Glutenfrei"

  Trennlinien zwischen Gruppen.
  Edge-to-Edge scrollbar via -mx-4 px-4 overflow-x-auto.

  @component
-->

<script setup lang="ts">
import FilterChip from './FilterChip.vue'

// ========================================
// TYPEN
// ========================================

/** Preis-Bucket Definition */
interface PriceBucket {
  label: string
  minPrice: number | null
  maxPrice: number | null
}

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Aktive Kategorie ('' = Alle) */
  selectedCategory: string
  /** Nur vorrätige anzeigen */
  onlyInStock: boolean
  /** Aktive Preis-Untergrenze (null = kein Filter) */
  minPrice: number | null
  /** Aktive Preis-Obergrenze (null = kein Filter) */
  maxPrice: number | null
  /** Nur vegane Produkte */
  isVegan: boolean
  /** Nur glutenfreie Produkte */
  isGlutenFree: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Kategorie-Filter geändert */
  'update:selectedCategory': [value: string]
  /** Verfügbarkeits-Filter geändert */
  'update:onlyInStock': [value: boolean]
  /** Preis-Untergrenze geändert */
  'update:minPrice': [value: number | null]
  /** Preis-Obergrenze geändert */
  'update:maxPrice': [value: number | null]
  /** Vegan-Filter geändert */
  'update:isVegan': [value: boolean]
  /** Glutenfrei-Filter geändert */
  'update:isGlutenFree': [value: boolean]
}>()

// ========================================
// KONSTANTEN
// ========================================

/** Verfügbare Kategorien (fest definiert, REQ-10) */
const CATEGORIES: { id: string; label: string }[] = [
  { id: '', label: 'Alle' },
  { id: 'obst', label: 'Obst' },
  { id: 'proteinriegel', label: 'Protein' },
  { id: 'shakes', label: 'Shakes' },
  { id: 'schokoriegel', label: 'Schoki' },
  { id: 'nuesse', label: 'Nüsse' },
  { id: 'getraenke', label: 'Getränke' },
]

/**
 * Preis-Buckets (UX Expert Review: 3 feste Spannen)
 * Preis-Chips sind mutually exclusive.
 */
const PRICE_BUCKETS: PriceBucket[] = [
  { label: 'bis 1,00 EUR', minPrice: null, maxPrice: 1.00 },
  { label: '1,00 – 2,00 EUR', minPrice: 1.00, maxPrice: 2.00 },
  { label: 'ab 2,00 EUR', minPrice: 2.00, maxPrice: null },
]

// ========================================
// COMPUTED
// ========================================

/**
 * Ermittelt ob ein Preis-Bucket aktiv ist.
 * Vergleicht min/max mit den aktuellen Props.
 */
const activePriceBucket = computed((): PriceBucket | null => {
  return PRICE_BUCKETS.find(b =>
    b.minPrice === props.minPrice && b.maxPrice === props.maxPrice
  ) ?? null
})

// ========================================
// METHODEN
// ========================================

/** Kategorie-Chip geklickt: togglet (RE-16: mutually exclusive) */
const handleCategoryToggle = (categoryId: string) => {
  // Wenn bereits aktive Kategorie geklickt → auf "Alle" zurücksetzen
  if (props.selectedCategory === categoryId && categoryId !== '') {
    emit('update:selectedCategory', '')
  } else {
    emit('update:selectedCategory', categoryId)
  }
}

/** Preis-Chip geklickt: togglet (mutually exclusive) */
const handlePriceBucketToggle = (bucket: PriceBucket) => {
  const isActive = activePriceBucket.value?.label === bucket.label
  if (isActive) {
    // Deaktivieren
    emit('update:minPrice', null)
    emit('update:maxPrice', null)
  } else {
    emit('update:minPrice', bucket.minPrice)
    emit('update:maxPrice', bucket.maxPrice)
  }
}

/** Preis-Chip deaktivieren (x-Icon) */
const handlePriceBucketRemove = () => {
  emit('update:minPrice', null)
  emit('update:maxPrice', null)
}
</script>

<template>
  <!-- Edge-to-Edge scrollbare Chip-Leiste (UX Expert Review) -->
  <div
    class="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
    role="group"
    aria-label="Produkte filtern"
  >

    <!-- Gruppe 1: Kategorien -->
    <FilterChip
      v-for="cat in CATEGORIES"
      :key="cat.id"
      :label="cat.label"
      :active="selectedCategory === cat.id"
      @toggle="handleCategoryToggle(cat.id)"
      @remove="handleCategoryToggle(cat.id)"
    />

    <!-- Trennlinie -->
    <div class="w-px h-5 bg-border mx-1 flex-shrink-0" aria-hidden="true" />

    <!-- Gruppe 2: Verfügbarkeit -->
    <FilterChip
      label="Nur vorrätige"
      :active="onlyInStock"
      @toggle="emit('update:onlyInStock', !onlyInStock)"
      @remove="emit('update:onlyInStock', false)"
    />

    <!-- Trennlinie -->
    <div class="w-px h-5 bg-border mx-1 flex-shrink-0" aria-hidden="true" />

    <!-- Gruppe 3: Preisbereich (mutually exclusive) -->
    <FilterChip
      v-for="bucket in PRICE_BUCKETS"
      :key="bucket.label"
      :label="bucket.label"
      :active="activePriceBucket?.label === bucket.label"
      @toggle="handlePriceBucketToggle(bucket)"
      @remove="handlePriceBucketRemove"
    />

    <!-- Trennlinie -->
    <div class="w-px h-5 bg-border mx-1 flex-shrink-0" aria-hidden="true" />

    <!-- Gruppe 4: Ernährung -->
    <FilterChip
      label="Vegan"
      :active="isVegan"
      @toggle="emit('update:isVegan', !isVegan)"
      @remove="emit('update:isVegan', false)"
    />
    <FilterChip
      label="Glutenfrei"
      :active="isGlutenFree"
      @toggle="emit('update:isGlutenFree', !isGlutenFree)"
      @remove="emit('update:isGlutenFree', false)"
    />

  </div>
</template>
