# Guide de Test des URLs de Paiement

## URLs de test

Remplacez les `{ID}` par de vrais IDs d'offres/groupes/produits de votre système.

### 1. Test de Groupe d'Offres

**URL de test:**
```
http://localhost:5173/pay/550e8400-e29b-41d4-a716-446655440000
```

**Ce qui se passe:**
1. La page charge le groupe d'offres avec l'ID fourni
2. Affiche une liste de toutes les offres du groupe
3. L'utilisateur peut cliquer sur une offre pour la sélectionner

**Réponse attendue de l'API:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nom du Groupe",
  "description": "Description du groupe",
  "offers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Offre 1",
      "description": "Description offre 1",
      "price": 100.00,
      "currency": "XAF"
    }
  ]
}
```

### 2. Test de Paiement d'Offre

**URL de test:**
```
http://localhost:5173/pay/offer/550e8400-e29b-41d4-a716-446655440001
```

**Ce qui se passe:**
1. La page charge l'offre spécifique
2. Affiche le résumé de la commande
3. Affiche les options de paiement
4. Formulaire pour email et téléphone
5. Bouton pour procéder au paiement

**Test du formulaire:**
- Email: `test@example.com`
- Téléphone: `+237123456789`
- Méthode: Sélectionner une option (Card, Mobile Money, Bank Transfer)
- Cliquer "Proceed to Payment"

**Réponse attendue de l'API initiate:**
```json
{
  "status": "success",
  "message": "Payment initiated successfully",
  "payment_id": "550e8400-e29b-41d4-a716-446655440050",
  "transaction_id": "550e8400-e29b-41d4-a716-446655440051",
  "reference": "TXN-A1B2C3D4E5F6",
  "gateway_reference": "notchpay-abc123",
  "amount": "100.00",
  "currency": "XAF",
  "payment_url": "https://payment-gateway.com/pay?ref=abc123"
}
```

### 3. Test de Paiement de Produit

**URL de test:**
```
http://localhost:5173/pay/product/550e8400-e29b-41d4-a716-446655440002
```

**Ce qui se passe:**
- Même que le paiement d'offre, mais pour un produit

### 4. Test de Vérification de Paiement

**URL de test:**
```
http://localhost:5173/pay/success
```

**Ce qui se passe:**
1. Affiche une page de confirmation
2. Auto-redirection après 5 secondes vers `/dashboard/payments`

### 5. Test d'Erreur de Paiement

**URL de test:**
```
http://localhost:5173/pay/failed
```

**Avec paramètres (optionnel):**
```
http://localhost:5173/pay/failed?error=Payment%20declined&ref=TXN-XYZ
```

## Étapes de test complètes

### Scénario 1: Test groupe → offre → paiement → vérification

```
1. Accéder à: http://localhost:5173/pay/GROUP-ID
   ✓ Page affiche le groupe avec ses offres

2. Cliquer sur une offre
   ✓ Redirection vers: http://localhost:5173/pay/offer/OFFER-ID

3. Remplir le formulaire:
   - Email: test@example.com
   - Téléphone: +237123456789
   - Méthode: Card

4. Cliquer "Proceed to Payment"
   ✓ Affichage page de vérification: http://localhost:5173/pay/success

5. Vérification automatique du paiement
   ✓ Succès ou erreur affiché
   ✓ Redirection après 5 secondes
```

### Scénario 2: Test paiement direct (sans groupe)

```
1. Accéder directement à: http://localhost:5173/pay/offer/OFFER-ID
   ✓ Page affiche directement le formulaire

2. Remplir et soumettre
   ✓ Même flux que scénario 1
```

## Points de contrôle

### API Backend (Django)

- [ ] `/payments/offer-groups/{id}/` retourne les données correctes
- [ ] `/payments/offers/{id}/` retourne une offre
- [ ] `/payments/products/{id}/` retourne un produit
- [ ] `/payments/offers-payment/initiate/` accepte POST et retourne reference
- [ ] `/payments/offers-payment/verify/` accepte POST et retourne status
- [ ] CORS autorise les requêtes depuis localhost:5173

### Frontend (React)

- [ ] Les pages se chargent sans erreur console
- [ ] Le thème s'applique correctement
- [ ] Les formulaires sont remplis et validés
- [ ] Les appels API réussissent
- [ ] Les redirections fonctionnent
- [ ] Le responsive design s'affiche bien sur mobile

### Stockage Session

- [ ] `sessionStorage` contient `paymentInfo` après initiation
- [ ] `paymentInfo` est supprimé après vérification

## Logs et Debugging

### Console du navigateur

Vérifiez les logs:
```javascript
// Vérifier le token JWT
console.log(localStorage.getItem('token'));

// Vérifier les infos de paiement
console.log(sessionStorage.getItem('paymentInfo'));

// Vérifier l'URL d'API
console.log(import.meta.env.VITE_API_URL);
```

### Network (DevTools)

Vérifiez les requêtes:
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Network
3. Effectuer un paiement
4. Vérifier les requêtes:
   - ✓ GET pour charger les données
   - ✓ POST pour initiate
   - ✓ POST pour verify

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 404 Not Found | Endpoint n'existe pas | Vérifier l'URL backend |
| 401 Unauthorized | Token JWT invalide | Se reconnecter |
| CORS error | Backend n'accepte pas frontend | Vérifier CORS Django |
| "No payment info found" | sessionStorage vide | Vérifier l'initiate |

## Tests API avec cURL

### Test GET groupe

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/payments/offer-groups/GROUP-ID/
```

### Test POST initiate

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "offer_id": "OFFER-ID",
    "email": "test@example.com",
    "phone": "+237123456789",
    "payment_method": "card"
  }' \
  http://localhost:8000/api/payments/offers-payment/initiate/
```

### Test POST verify

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TXN-ABC123",
    "gateway_reference": "notchpay-ref"
  }' \
  http://localhost:8000/api/payments/offers-payment/verify/
```

## Données de test recommandées

### Groupe d'offres
- ID UUID valide d'un groupe existant
- Au moins 2-3 offres dans le groupe

### Offre
- ID UUID valide
- Prix > 0
- Devise valide (XAF, USD, EUR, etc.)

### Produit
- ID UUID valide
- Même format que offre

### Utilisateur
- Email valide pour les tests
- Téléphone au format +XXX

## Checklist post-déploiement

- [ ] Routes ajoutées et accessibles
- [ ] CORS configuré correctement
- [ ] Token JWT valide stocké
- [ ] API endpoints tous fonctionnels
- [ ] Pages s'affichent sans erreur
- [ ] Paiements peuvent être initiés
- [ ] Vérification fonctionne
- [ ] Redirection post-paiement OK
- [ ] Mobile responsive fonctionne
