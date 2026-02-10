# Payment Routes Integration Guide

Ce document explique comment intégrer les nouvelles pages de paiement dans le système de routage de l'application.

## Routes à ajouter

Ajoutez les routes suivantes dans `src/router/routes.tsx`:

```typescript
import { PaymentCheckoutPage } from '../pages/PaymentCheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentFailedPage } from '../pages/PaymentFailedPage';

// Ajouter aux routes principales
export const paymentRoutes: RouteConfig[] = [
  {
    path: '/pay',
    element: <PaymentCheckoutPage />,
    protected: false,
    children: [
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
    ],
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

## Structure des Routes

### Route de Groupe d'Offres
- **Path**: `/pay/{groupId}`
- **Description**: Affiche un groupe d'offres, permettant à l'utilisateur de sélectionner une offre
- **Exemple**: `/pay/550e8400-e29b-41d4-a716-446655440000`

### Route de Paiement d'Offre
- **Path**: `/pay/offer/{offerId}`
- **Description**: Formulaire de paiement pour une offre spécifique
- **Exemple**: `/pay/offer/550e8400-e29b-41d4-a716-446655440001`

### Route de Paiement de Produit
- **Path**: `/pay/product/{productId}`
- **Description**: Formulaire de paiement pour un produit spécifique
- **Exemple**: `/pay/product/550e8400-e29b-41d4-a716-446655440002`

### Route de Succès
- **Path**: `/pay/success`
- **Description**: Page de confirmation du paiement réussi
- **Auto-redirection**: Redirige vers `/dashboard/payments` après 5 secondes

### Route d'Erreur
- **Path**: `/pay/failed`
- **Description**: Page d'erreur de paiement
- **Paramètres optionnels**: `?error=message&ref=transaction-ref`

## Utilisation des Composants

### OfferGroupPayment
Affiche les offres d'un groupe:

```typescript
import { OfferGroupPayment } from '../components/Payment/OfferGroupPayment';

<OfferGroupPayment
  groupId="groupe-id"
  onSelectOffer={(offerId) => navigate(`/pay/offer/${offerId}`)}
/>
```

### OfferPaymentForm
Formulaire de paiement pour une offre:

```typescript
import { OfferPaymentForm } from '../components/Payment/OfferPaymentForm';

<OfferPaymentForm
  offerId="offre-id"
  onPaymentInitiated={(data) => console.log('Payment initiated', data)}
  onCancel={() => navigate(-1)}
/>
```

### ProductPaymentForm
Formulaire de paiement pour un produit:

```typescript
import { ProductPaymentForm } from '../components/Payment/ProductPaymentForm';

<ProductPaymentForm
  productId="produit-id"
  onPaymentInitiated={(data) => console.log('Payment initiated', data)}
  onCancel={() => navigate(-1)}
/>
```

### PaymentVerification
Composant de vérification du paiement:

```typescript
import { PaymentVerification } from '../components/Payment/PaymentVerification';

<PaymentVerification
  onSuccess={() => navigate('/pay/success')}
  onError={(error) => navigate(`/pay/failed?error=${error}`)}
  autoVerify={true}
/>
```

## Service API

Utilisez `paymentService` pour les appels API:

```typescript
import { paymentService } from '../services/paymentService';

// Obtenir les informations d'une offre
const offer = await paymentService.getOffer(offerId);

// Obtenir les informations d'un produit
const product = await paymentService.getProduct(productId);

// Obtenir un groupe d'offres
const group = await paymentService.getOfferGroup(groupId);

// Initier un paiement d'offre
const response = await paymentService.initiateOfferPayment({
  offer_id: offerId,
  email: 'user@example.com',
  phone: '+237123456789',
  payment_method: 'card',
});

// Vérifier un paiement
const verification = await paymentService.verifyOfferPayment({
  reference: 'TXN-123456',
  gateway_reference: 'notchpay-ref',
});
```

## Flux de Paiement Complet

1. **Sélection du groupe**: L'utilisateur accède à `/pay/{groupId}`
2. **Sélection de l'offre**: L'utilisateur sélectionne une offre du groupe
3. **Formulaire de paiement**: Redirection vers `/pay/offer/{offerId}`
4. **Initiation du paiement**: Le paiement est initié via l'API
5. **Vérification**: Les données de paiement sont vérifiées
6. **Résultat**: Redirection vers `/pay/success` ou `/pay/failed`

## Notes Importantes

- Les paiements utilisent l'endpoint `offers-payment/initiate/` et `offers-payment/verify/`
- Les informations de paiement sont stockées dans `sessionStorage` pour la vérification
- L'authentification est requise pour les routes protégées
- Le token JWT est stocké dans `localStorage['token']`

## Environnement

Assurez-vous que `VITE_API_URL` est défini dans votre fichier `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

## Types de Paiement Acceptés

- **card**: Carte de crédit/débit
- **mobile_money**: Mobile Money
- **bank_transfer**: Virement bancaire
