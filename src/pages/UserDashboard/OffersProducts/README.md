# Offres et Produits (Offers & Products)

Une interface complète pour gérer les offres et les produits dans le tableau de bord utilisateur.

## Structure

```
OffersProducts/
├── offers/
│   ├── OffersPanel.tsx       # Composant principal pour afficher la liste des offres
│   └── OffersModal.tsx       # Modal pour créer/éditer les offres
├── products/
│   ├── ProductsPanel.tsx     # Composant principal pour afficher la liste des produits
│   └── ProductsModal.tsx     # Modal pour créer/éditer les produits
├── OffersProductsPage.tsx    # Page principale avec les deux panels côte à côte
└── index.ts                  # Exports centralisés
```

## Composants

### OffersProductsPage
Page principale qui affiche les deux panneaux (Offres et Produits) dans une grille responsive.

**Props:**
- `companyId?: string` - ID de l'entreprise (optionnel)

```tsx
<OffersProductsPage companyId="company-123" />
```

### OffersPanel
Affiche la liste des offres avec options pour ajouter, éditer et supprimer.

**Fonctionnalités:**
- ✅ Liste paginée des offres
- ✅ Ajouter une nouvelle offre
- ✅ Éditer une offre existante
- ✅ Supprimer une offre
- ✅ État de chargement et d'erreur
- ✅ Message vide quand aucune offre

**Props:**
- `companyId?: string` - ID de l'entreprise

### ProductsPanel
Affiche la liste des produits avec options pour ajouter, éditer et supprimer.

**Fonctionnalités:**
- ✅ Liste paginée des produits
- ✅ Ajouter un nouveau produit
- ✅ Éditer un produit existant
- ✅ Supprimer un produit
- ✅ État de chargement et d'erreur
- ✅ Message vide quand aucun produit

**Props:**
- `companyId?: string` - ID de l'entreprise

### OffersModal
Modal pour créer ou éditer une offre.

**Props:**
- `isOpen: boolean` - Contrôle l'ouverture/fermeture du modal
- `onClose: () => void` - Fonction appelée au fermeture
- `offer?: Offer | null` - Offre à éditer (si undefined = créer)
- `companyId: string` - ID de l'entreprise

**Champs du formulaire:**
- Nom (obligatoire)
- Description
- Prix (obligatoire)
- Devise (XAF, USD, EUR, GBP)
- Statut (actif/inactif)

### ProductsModal
Modal pour créer ou éditer un produit.

**Props:**
- `isOpen: boolean` - Contrôle l'ouverture/fermeture du modal
- `onClose: () => void` - Fonction appelée au fermeture
- `product?: Product | null` - Produit à éditer (si undefined = créer)
- `companyId: string` - ID de l'entreprise

**Champs du formulaire:**
- Nom (obligatoire)
- Description
- Prix (obligatoire)
- Devise (XAF, USD, EUR, GBP)
- SKU (numéro de stock unique)
- Statut (actif/inactif)

## Hooks utilisés

- **useOffer**: Gestion des offres (CRUD)
- **useProduct**: Gestion des produits (CRUD)
- **useCompany**: Récupération des données de l'entreprise

## Intégration avec UserDashboard

Dans `UserDashboard.tsx`, le menu "Offres et produits" affiche la page:

```tsx
{activeNav === 'offres_produits' && (
  <OffersProductsPage companyId={user.company_id} />
)}
```

## Styling

Tous les composants utilisent `styled-components` avec le système de thème défini dans `config/theme.ts`:

- **Couleurs**: Primary, Secondary, Success, Error, Warning, Info
- **Espacement**: xs, sm, md, lg, xl, xxl
- **Ombres**: sm, md, lg
- **Transitions**: fast, base, slow

## États et animations

- **Chargement**: Spinner animé
- **Erreur**: Message d'erreur avec fond rouge
- **Vide**: Message vide avec suggestions
- **Animations**: 
  - Modal slide-in
  - Fade-in overlay
  - Hover effects sur les boutons
  - Spinner 360° continu

## Responsive Design

- **Desktop**: Grille 2 colonnes (offres | produits)
- **Tablette**: Grille 1 colonne (adaptatif)
- **Mobile**: Stack vertical avec scroll

## Points clés

1. **Validation**: Les champs obligatoires sont validés au submit
2. **Gestion des erreurs**: Affichage des messages d'erreur API
3. **États de loading**: Désactivation des boutons pendant les appels API
4. **Suppression**: Confirmation avant suppression
5. **Rafraîchissement**: Auto-refresh après création/modification
