#!/bin/bash

# Script de validation du système de paiement
# Utilisation: bash VALIDATE_PAYMENT_SETUP.sh

echo "🔍 Validation du système de paiement..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/"
        return 1
    fi
}

# Compteurs
PASSED=0
FAILED=0

# En-tête
echo "📦 Vérification des fichiers de page..."
check_file "src/pages/PaymentPage.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/pages/PaymentCheckoutPage.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/pages/PaymentSuccessPage.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/pages/PaymentFailedPage.tsx" && ((PASSED++)) || ((FAILED++))

echo ""
echo "🧩 Vérification des composants..."
check_dir "src/components/Payment" && ((PASSED++)) || ((FAILED++))
check_file "src/components/Payment/OfferGroupPayment.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/components/Payment/OfferPaymentForm.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/components/Payment/ProductPaymentForm.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/components/Payment/PaymentVerification.tsx" && ((PASSED++)) || ((FAILED++))
check_file "src/components/Payment/index.ts" && ((PASSED++)) || ((FAILED++))

echo ""
echo "🔌 Vérification du service..."
check_file "src/services/paymentService.ts" && ((PASSED++)) || ((FAILED++))

echo ""
echo "📚 Vérification de la documentation..."
check_file "PAYMENT_SYSTEM_README.md" && ((PASSED++)) || ((FAILED++))
check_file "PAYMENT_INTEGRATION_CHECKLIST.md" && ((PASSED++)) || ((FAILED++))
check_file "ROUTES_UPDATE_EXAMPLE.tsx" && ((PASSED++)) || ((FAILED++))
check_file "TESTING_PAYMENT_URLS.md" && ((PASSED++)) || ((FAILED++))
check_file "src/pages/PAYMENT_ROUTES_GUIDE.md" && ((PASSED++)) || ((FAILED++))

echo ""
echo "⚙️  Vérification de la configuration..."

# Vérifier .env
if grep -q "VITE_API_URL" .env 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env contient VITE_API_URL"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .env ne contient pas VITE_API_URL"
    echo "   Ajoutez: VITE_API_URL=http://localhost:8000/api"
    ((FAILED++))
fi

# Vérifier le thème
if grep -q "colors" "src/config/theme.ts" 2>/dev/null || grep -q "colors" "src/config/theme.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Thème configuré"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Thème non trouvé"
    ((FAILED++))
fi

echo ""
echo "🛣️  Vérification du routeur..."

# Vérifier si routes.tsx existe
if [ -f "src/router/routes.tsx" ]; then
    echo -e "${GREEN}✓${NC} src/router/routes.tsx existe"
    
    # Vérifier les imports
    if grep -q "PaymentCheckoutPage" "src/router/routes.tsx" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} PaymentCheckoutPage importé"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} PaymentCheckoutPage non importé dans routes.tsx"
        echo "   À faire: Ajouter l'import et les routes"
        ((FAILED++))
    fi
    
    # Vérifier les routes
    if grep -q "'/pay/'" "src/router/routes.tsx" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Routes /pay/* configurées"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Routes /pay/* non trouvées"
        echo "   À faire: Ajouter les routes de paiement"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} src/router/routes.tsx non trouvé"
    ((FAILED++))
fi

echo ""
echo "📋 Vérification des dépendances..."

# Vérifier React
if grep -q '"react"' "package.json"; then
    echo -e "${GREEN}✓${NC} React installé"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} React non trouvé"
    ((FAILED++))
fi

# Vérifier styled-components
if grep -q '"styled-components"' "package.json"; then
    echo -e "${GREEN}✓${NC} styled-components installé"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} styled-components non trouvé"
    echo "   À faire: npm install styled-components"
    ((FAILED++))
fi

# Vérifier react-router-dom
if grep -q '"react-router-dom"' "package.json"; then
    echo -e "${GREEN}✓${NC} react-router-dom installé"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} react-router-dom non trouvé"
    ((FAILED++))
fi

echo ""
echo "======================================"
echo "📊 Résumé"
echo "======================================"
echo -e "${GREEN}Réussi: $PASSED${NC}"
echo -e "${RED}Échoué: $FAILED${NC}"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo "Complétion: $PERCENTAGE%"

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les fichiers sont en place!${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Vérifier que les routes sont ajoutées au router"
    echo "2. Vérifier que .env est configuré"
    echo "3. Vérifier que le thème est présent"
    echo "4. Lancer 'npm run dev'"
    echo "5. Consulter PAYMENT_SYSTEM_README.md pour plus de détails"
    exit 0
else
    echo -e "${RED}✗ Certains fichiers ou configurations manquent${NC}"
    echo ""
    echo "Consultez PAYMENT_INTEGRATION_CHECKLIST.md pour l'intégration"
    exit 1
fi
