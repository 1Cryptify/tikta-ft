# BusinessPage Component

Une page complète pour afficher et gérer les entreprises (business) de l'utilisateur.

## Fonctionnalités

✅ **Affichage responsive** des entreprises en grille responsive
✅ **Cartes sélectionnables** avec sélection visuelle
✅ **Indicateur d'entreprise active** (badge "Actif")
✅ **Changement dynamique du header** (remplace "Tikta" par le nom de l'entreprise)
✅ **Gestion des erreurs** et états de chargement
✅ **Design moderne** avec styled-components
✅ **Responsive complète** (mobile, tablet, desktop)

## Structure

```
business/
├── BusinessPage.tsx          # Composant principal
├── BusinessPageExample.tsx   # Exemple d'intégration
└── README.md                 # Documentation
```

## Installation

Le composant est prêt à l'emploi. Il utilise :
- `useCompany` hook pour les données
- `styled-components` pour le style
- Theme config standard de l'application

## Utilisation

### Intégration basique

```tsx
import { BusinessPage } from './pages/UserDashboard/business/BusinessPage';

export const App = () => {
  const [headerTitle, setHeaderTitle] = useState('Tikta');

  return (
    <MainLayout
      headerTitle={headerTitle}
      // ... autres props
    >
      <BusinessPage
        onHeaderTitleChange={setHeaderTitle}
      />
    </MainLayout>
  );
};
```

### Avec callback de sélection

```tsx
<BusinessPage
  onCompanySelect={(company) => {
    console.log('Entreprise sélectionnée:', company.name);
    // Naviguer ou charger les données
  }}
  onHeaderTitleChange={(title) => {
    setHeaderTitle(title);
  }}
/>
```

## Props

| Prop | Type | Requis | Description |
|------|------|--------|------------|
| `onCompanySelect` | `(company: Company) => void` | Non | Callback quand une entreprise est sélectionnée |
| `onHeaderTitleChange` | `(title: string) => void` | Non | Callback pour changer le titre du header |

## Styles responsive

### Points de rupture

- **Desktop** (> 768px): Grille 3+ colonnes
- **Tablet** (481px - 768px): Grille 2 colonnes
- **Mobile** (≤ 480px): 1 colonne, cartes optimisées

### Adjustements mobiles

- Padding réduit
- Fonts plus petites
- Espacements minimisés
- Touches plus grandes pour l'interaction

## Structure des données

Le composant utilise le hook `useCompany` qui retourne:

```tsx
{
  companies: Company[],
  currentCompany: Company | null,
  isLoading: boolean,
  error: string | null,
  listCompanies: () => Promise<...>,
  getCompanyDetail: (id: string) => Promise<...>,
  // ... autres méthodes
}
```

Chaque `Company` a:

```tsx
{
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

## Comportement

### À l'ouverture

1. Les entreprises sont chargées via `listCompanies()`
2. Affichage en grille responsive
3. Header affiche "Tikta" par défaut

### À la sélection

1. La carte se met en surbrillance (bordure + ombre)
2. Un badge "Actif" s'affiche
3. Détails de l'entreprise chargés via `getCompanyDetail()`
4. Header change pour afficher le nom de l'entreprise
5. Callback `onCompanySelect` est appelé (si fourni)

### États

- **Chargement**: Message "Chargement de vos entreprises..."
- **Vide**: Message "Aucune entreprise trouvée"
- **Erreur**: Message d'erreur de l'API

## Customization

### Changement de couleurs

Les couleurs sont définies dans `/src/config/theme.ts`:

```ts
export const colors = {
  primary: '#1e3a5f',      // Couleur principale
  success: '#059669',      // Couleur du badge actif
  // ...
};
```

### Changement du layout

Modifiez `CardsGrid` pour ajuster l'espacement ou le nombre de colonnes:

```tsx
const CardsGrid = styled.div`
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${spacing.xl};
`;
```

## Exemples d'intégration

Voir `BusinessPageExample.tsx` pour:
- Intégration avec MainLayout
- Gestion du header dynamique
- Gestion des callbacks
- Navigation après sélection

## Notes

- Le composant gère automatiquement le chargement des données
- La sélection persiste jusqu'à changement
- Le header se met à jour en temps réel
- Tous les states sont gérés localement via le hook `useCompany`

## Responsive Testing

Pour tester la responsivité:

```
Mobile (portrait): 375px
Tablet (portrait): 768px
Desktop: 1200px+
```

Utilisez les DevTools du navigateur (F12) pour tester les différentes résolutions.
