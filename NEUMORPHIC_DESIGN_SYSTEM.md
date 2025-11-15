# Design System Neumorphique - FinanceBro

## Vue d'ensemble

Ce design system neumorphique offre une refonte complète du style visuel de FinanceBro dans un style moderne, sobre et premium inspiré d'Apple et des interfaces Fintech.

**Caractéristiques principales :**
- Palette monochrome claire (#EEEFF3, #E3E6EC, #D9DDE3)
- Soft shadows neumorphiques (claire haut-gauche, foncée bas-droite)
- Composants extrudés avec border-radius 16-24px
- Typographie Inter
- Design minimaliste avec beaucoup d'espace
- Aucun effet glass, neon ou gradient flashy

---

## 🎨 Palette de couleurs

### Couleurs de base
```css
--neu-base: #EEEFF3     /* Fond principal */
--neu-light: #E3E6EC    /* Fond clair */
--neu-dark: #D9DDE3     /* Fond foncé */
```

### Couleurs de texte
```css
--neu-text-primary: #2A2D3A    /* Texte principal */
--neu-text-secondary: #6B7280  /* Texte secondaire */
--neu-text-tertiary: #9CA3AF   /* Texte tertiaire */
```

### Couleurs d'accent
```css
--neu-accent: #4F46E5         /* Accent principal (indigo) */
--neu-accent-hover: #4338CA   /* Accent hover */
```

---

## 🌑 Ombres neumorphiques

Les ombres sont la caractéristique principale du design neumorphique. Elles créent un effet de relief subtil.

### Ombres soft (par défaut)
```css
box-shadow: 6px 6px 12px #D1D4D9, -6px -6px 12px #FFFFFF;
```

### Ombres medium
```css
box-shadow: 8px 8px 16px #D1D4D9, -8px -8px 16px #FFFFFF;
```

### Ombres strong
```css
box-shadow: 12px 12px 24px #D1D4D9, -12px -12px 24px #FFFFFF;
```

### Ombres inset (inputs, zones pressées)
```css
box-shadow: inset 4px 4px 8px #D1D4D9, inset -4px -4px 8px #FFFFFF;
```

---

## 📐 Border Radius

```css
--neu-radius-sm: 16px
--neu-radius-md: 20px
--neu-radius-lg: 24px
--neu-radius-xl: 32px
```

---

## 🔤 Typographie

**Font family :** Inter
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Font weights :**
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 🧩 Composants

### NeuButton

Bouton neumorphique avec 3 variantes.

```tsx
import { NeuButton } from '@/components/neumorphic/NeuButton';

// Variante primary (par défaut)
<NeuButton variant="primary" size="md">
  Cliquez-moi
</NeuButton>

// Variante accent
<NeuButton variant="accent" size="lg">
  Action principale
</NeuButton>

// Variante ghost
<NeuButton variant="ghost" size="sm">
  Action secondaire
</NeuButton>
```

**Props :**
- `variant`: "primary" | "accent" | "ghost"
- `size`: "sm" | "md" | "lg"

---

### NeuCard

Carte neumorphique avec ombres configurables.

```tsx
import { NeuCard } from '@/components/neumorphic/NeuCard';

<NeuCard
  shadowVariant="soft"
  radiusSize="md"
  hoverEffect={true}
  className="p-6"
>
  Contenu de la carte
</NeuCard>
```

**Props :**
- `shadowVariant`: "soft" | "medium" | "strong" | "inset"
- `radiusSize`: "sm" | "md" | "lg" | "xl"
- `hoverEffect`: boolean

---

### NeuInput

Input neumorphique avec effet inset.

```tsx
import { NeuInput } from '@/components/neumorphic/NeuInput';

<NeuInput
  label="Nom complet"
  placeholder="John Doe"
  type="text"
/>
```

**Props :**
- `label`: string (optionnel)
- `error`: string (optionnel)
- Tous les props HTML input standard

---

### NeuTextarea

Textarea neumorphique.

```tsx
import { NeuTextarea } from '@/components/neumorphic/NeuTextarea';

<NeuTextarea
  label="Message"
  placeholder="Votre message..."
  rows={4}
/>
```

**Props :**
- `label`: string (optionnel)
- `error`: string (optionnel)
- Tous les props HTML textarea standard

---

### NeuIconCard

Carte avec icône et contenu.

```tsx
import { NeuIconCard } from '@/components/neumorphic/NeuIconCard';
import { Sparkles } from 'lucide-react';

<NeuIconCard
  icon={Sparkles}
  title="Titre de la carte"
  description="Description de la fonctionnalité"
  iconSize="md"
/>
```

**Props :**
- `icon`: LucideIcon (composant d'icône)
- `title`: string
- `description`: string
- `iconSize`: "sm" | "md" | "lg"

---

### NeuSection

Section de page avec header configurablerst.

```tsx
import { NeuSection } from '@/components/neumorphic/NeuSection';

<NeuSection
  eyebrow="Section"
  title="Titre de la section"
  description="Description de la section"
  centered={true}
  maxWidth="xl"
>
  {/* Contenu de la section */}
</NeuSection>
```

**Props :**
- `eyebrow`: string (optionnel) - Petit texte au-dessus du titre
- `title`: string (optionnel)
- `description`: string (optionnel)
- `centered`: boolean (default: true)
- `maxWidth`: "sm" | "md" | "lg" | "xl" | "2xl" | "full"

---

## 📄 Landing Page Neumorphique

### Utilisation

La landing page neumorphique est disponible dans :
```
app/(public)/page-neumorphic.tsx
```

Pour l'activer, remplacez le contenu de `app/(public)/page.tsx` par :

```tsx
export { default } from './page-neumorphic';
```

Ou renommez simplement `page-neumorphic.tsx` en `page.tsx`.

### Sections incluses

1. **Hero** - Section hero avec CTA et image abstraite
2. **Story** - Comment ça marche (3 étapes)
3. **Value** - Pourquoi FinanceBro (4 propositions de valeur)
4. **Team** - Équipe (3 membres)
5. **Pricing** - Plans tarifaires (3 offres)
6. **Contact** - Formulaire de contact
7. **CTA Final** - Call-to-action final

**Tout le contenu a été conservé à l'identique.** Seul le design a changé.

---

## 🖼️ Images abstraites

Les images abstraites doivent être générées avec DALL·E en utilisant ce prompt :

```
DALL·E prompt: Abstract digital illustration in modern neumorphic style, soft rounded shapes, monochromatic light grey palette, smooth gradients, subtle depth, soft extruded forms, 16:9, no text
```

Ces images peuvent être ajoutées dans :
- Le hero (déjà prévu avec placeholder)
- Les sections de contenu si besoin

---

## 🎯 Classes utilitaires CSS

Des classes CSS utilitaires sont disponibles dans `globals.css` :

```css
.neu-card          /* Carte neumorphique de base */
.neu-card-hover    /* Carte avec effet hover */
.neu-pressed       /* Effet pressé/actif */
.neu-input         /* Input neumorphique */
.neu-button        /* Bouton neumorphique */
.neu-icon-container /* Conteneur d'icône circulaire */
```

---

## 📦 Installation des dépendances

Assurez-vous d'avoir installé les dépendances suivantes :

```bash
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react framer-motion
```

---

## ♿ Accessibilité

Le design system respecte les bonnes pratiques d'accessibilité :
- Support de `prefers-reduced-motion`
- Contraste de couleurs conforme WCAG AA
- Focus states visibles
- Support du clavier complet

---

## 🚀 Démarrage rapide

1. **Installer les dépendances** (si ce n'est pas déjà fait)
   ```bash
   npm install clsx tailwind-merge class-variance-authority
   ```

2. **Activer la landing page neumorphique**
   ```bash
   # Renommer le fichier
   mv app/(public)/page.tsx app/(public)/page-original.tsx
   mv app/(public)/page-neumorphic.tsx app/(public)/page.tsx
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Visiter** http://localhost:3000

---

## 📚 Ressources

- **Design system config** : `/lib/design-system/neumorphic.ts`
- **Composants de base** : `/components/neumorphic/`
- **Composants marketing** : `/components/neumorphic-marketing/`
- **Styles globaux** : `/app/globals.css`
- **Utilitaires** : `/lib/utils.ts`

---

## 🎨 Exemples visuels

### Carte neumorphique
Une carte avec effet extrudé subtil, créant une impression de relief sur le fond.

### Bouton neumorphique
Bouton avec ombres douces qui se transforme en effet "pressé" au clic.

### Input neumorphique
Input avec effet inset donnant l'impression d'être enfoncé dans la surface.

---

## ✨ Philosophie du design

Le style neumorphique vise à créer une expérience visuelle **sobre, moderne et premium** :

- **Minimalisme** : Espaces généreux, peu d'éléments visuels
- **Subtilité** : Effets d'ombres doux et naturels
- **Cohérence** : Même style appliqué à tous les composants
- **Professionnalisme** : Inspiré des interfaces Apple et Fintech
- **Lisibilité** : Contraste de texte optimal pour une lecture facile

---

## 📝 Notes importantes

1. **Contenu préservé** : Aucun texte, titre ou wording n'a été modifié
2. **Structure identique** : Toutes les sections originales sont présentes
3. **Fonctionnalités intactes** : Tous les liens et interactions fonctionnent
4. **Design uniquement** : Seule la présentation visuelle a changé
5. **Performance** : Les animations respectent `prefers-reduced-motion`

---

**Version** : 1.0.0
**Dernière mise à jour** : 2024
