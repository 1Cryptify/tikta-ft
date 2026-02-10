# Payment Page Integration Checklist

## Fichiers créés

### Pages
- ✓ `src/pages/PaymentPage.tsx` - Page principale de paiement
- ✓ `src/pages/PaymentCheckoutPage.tsx` - Page de checkout complète
- ✓ `src/pages/PaymentSuccessPage.tsx` - Page de confirmation succès
- ✓ `src/pages/PaymentFailedPage.tsx` - Page d'erreur de paiement

### Composants de Paiement
- ✓ `src/components/Payment/OfferGroupPayment.tsx` - Affichage groupe d'offres
- ✓ `src/components/Payment/OfferPaymentForm.tsx` - Formulaire paiement offre
- ✓ `src/components/Payment/ProductPaymentForm.tsx` - Formulaire paiement produit
- ✓ `src/components/Payment/PaymentVerification.tsx` - Vérification paiement
- ✓ `src/components/Payment/index.ts` - Exports des composants

### Services
- ✓ `src/services/paymentService.ts` - Service API pour paiements

### Documentation
- ✓ `src/pages/PAYMENT_ROUTES_GUIDE.md` - Guide d'intégration routes
- ✓ `ft/PAYMENT_INTEGRATION_CHECKLIST.md` - Ce fichier

## Étapes d'Intégration

### 1. Ajouter les routes au router

Modifiez `src/router/routes.tsx`:

```typescript
// Imports
import { PaymentCheckoutPage } from '../pages/PaymentCheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/PaymentFailedPage';

// Ajouter aux routes de votre application
const paymentRoutes: RouteConfig[] = [
  {
    path: '/pay/:groupId',
    element: <PaymentCheckoutPage />,
    protected: false,
  },
  {
    path: '/pay/offer/:offerId',
    element: <PaymentCheckoutPage />,
    protected: false,
  },
  {
    path: '/pay/product/:productId',
    element: <PaymentCheckoutPage />,
    protected: false,
  },
  {
    path: '/pay/success',
    element: <PaymentSuccessPage />,
    protected: false,
  },
  {
    path: '/pay/failed',
    element: <PaymentFailedPage />,
    protected: false,
  },
];
```

### 2. Vérifier la configuration .env

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Mettre à jour le routeur principal

Fusionnez les `paymentRoutes` avec votre array de routes principale.

### 4. Tester les routes

#### Groupe d'offres
```
http://localhost:5173/pay/550e8400-e29b-41d4-a716-446655440000
```

#### Offre unique
```
http://localhost:5173/pay/offer/550e8400-e29b-41d4-a716-446655440001
```

#### Produit unique
```
http://localhost:5173/pay/product/550e8400-e29b-41d4-a716-446655440002
```

## URLs Backend attendues

### Endpoints utilisés par le frontend

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/payments/offer-groups/{id}/` | GET | Obtenir un groupe d'offres |
| `/payments/offers/{id}/` | GET | Obtenir une offre |
| `/payments/products/{id}/` | GET | Obtenir un produit |
| `/payments/offers-payment/initiate/` | POST | Initier le paiement d'une offre |
| `/payments/offers-payment/verify/` | POST | Vérifier le paiement d'une offre |
| `/payments/product-payment/initiate/` | POST | Initier le paiement d'un produit |
| `/payments/product-payment/verify/` | POST | Vérifier le paiement d'un produit |

**Note**: Les endpoints `product-payment/initiate/` et `product-payment/verify/` doivent être créés dans le backend Django si nécessaire.

## Flux de paiement complet

```
[Groupe d'offres] 
    ↓ (sélection d'offre)
[Formulaire paiement offre] 
    ↓ (soumission)
[Vérification paiement] 
    ↓ (résultat)
[Succès] ou [Erreur]
```

## Types et interfaces

### OfferData
```typescript
interface OfferData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}
```

### ProductData
```typescript
interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}
```

### OfferGroupData
```typescript
interface OfferGroupData {
  id: string;
  name: string;
  description: string;
  offers: OfferData[];
}
```

## Variables d'environnement requises

```env
# URL de l'API backend
VITE_API_URL=http://localhost:8000/api

# (Optionnel) Token d'authentification initial
# Stocké dans localStorage['token'] après login
```

## Sécurité

- ✓ Authentification JWT via header Authorization
- ✓ CORS géré par le backend Django
- ✓ Validation des champs requis
- ✓ Gestion des erreurs API

## Points à vérifier

### Backend Django

- [ ] Endpoint `offers-payment/initiate/` fonctionne
- [ ] Endpoint `offers-payment/verify/` fonctionne
- [ ] Endpoints `product-payment/*` créés (si nécessaire)
- [ ] CORS configuré pour accepter les requêtes du frontend
- [ ] JWT middleware configuré

### Frontend

- [ ] Fichier `.env` configuré avec `VITE_API_URL`
- [ ] Routes ajoutées au router
- [ ] Authentification (JWT token) stockée correctement
- [ ] ThemeProvider configuré avec `colors` et `spacing`

## Couleurs utilisées

Les composants de paiement utilisent les couleurs du thème défini dans `src/config/theme`:

```typescript
colors: {
  primary: '#667eea',
  textPrimary: '#333',
  textSecondary: '#666',
  border: '#ddd',
  background: '#fff',
  disabled: '#ccc',
}
```

Assurez-vous que `colors` est correctement exporté depuis `src/config/theme`.

## Troubleshooting

### Erreur: "Cannot find module"
- Vérifier que les fichiers sont créés dans les bons répertoires
- Vérifier les imports de chemin

### Erreur: "API request failed"
- Vérifier que `VITE_API_URL` est correctement configuré
- Vérifier que le token JWT est stocké dans `localStorage['token']`
- Vérifier les endpoints CORS du backend

### Erreur: "Not authenticated"
- Assurez-vous que l'utilisateur est connecté
- Vérifier que le token JWT est valide
- Les routes peuvent être protégées ou non (voir `protected` dans la config)

## Prochaines étapes

1. Implémenter les endpoints produit dans le backend (si nécessaire)
2. Tester le flux complet de paiement
3. Ajouter des animations et des transitions supplémentaires
4. Implémenter une page de facturation/reçu
5. Ajouter des notifications (toast/snackbar)
6. Intégrer avec le système de passerelle de paiement externe
