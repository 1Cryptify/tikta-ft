/**
 * Conditions Générales d'Utilisation (CGU) — achat de tickets WiFi / produits
 * numériques via la plateforme Tikta.
 *
 * NOTE JURIDIQUE : ceci est un modèle fonctionnel. Il doit être relu et adapté
 * par un conseil juridique selon la loi applicable (Cameroon / autres
 * juridictions) et mentionner les informations légales exactes de l'éditeur.
 */

export const TERMS_VERSION = '1.0';
export const TERMS_LAST_UPDATED = '25 septembre 2026';

export type TermsBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export interface TermsSection {
  title: string;
  blocks: TermsBlock[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "Objet et champ d'application",
    blocks: [
      { type: 'p', text: "Les présentes Conditions Générales d'Utilisation (les « Conditions ») régissent l'accès et l'utilisation de la plateforme Tikta (la « Plateforme »), ainsi que l'achat et l'utilisation de tickets d'accès WiFi et de tout produit ou service numérique proposé par l'intermédiaire d'un opérateur partenaire (l'« Opérateur »)." },
      { type: 'p', text: "Toute commande passée sur la Plateforme emporte acceptation pleine, entière et sans réserve des présentes Conditions par l'utilisateur (le « Client » ou « vous »). Si vous n'acceptez pas ces Conditions, vous devez renoncer à toute commande." },
      { type: 'p', text: "Les Conditions s'appliquent quel que soit le moyen d'accès à la Plateforme (navigateur mobile, ordinateur, tablette) et quel que soit le canal de paiement utilisé." },
    ],
  },
  {
    title: 'Définitions',
    blocks: [
      { type: 'ul', items: [
        "« Plateforme » : le site, l'application et les services en ligne édités par Tikta et permettant l'achat de tickets ou de produits numériques.",
        "« Opérateur » : la personne morale ou physique proposant la connexion WiFi ou le service et dont les offres sont vendues via la Plateforme.",
        "« Ticket » : l'ensemble des identifiants (identifiant et mot de passe) permettant l'accès au service proposé, transmis au Client après confirmation du paiement.",
        "« Offre » : la description d'un service, d'un produit numérique ou d'un ticket publiée sur la Plateforme, incluant le prix et les conditions d'utilisation.",
        "« Zone » : une aire géographique d'accès associée à un Opérateur, à laquelle un paiement peut être rattaché.",
        "« Paiement Mobile Money » : le paiement effectué via un portefeuille électronique (par exemple MTN Mobile Money ou Orange Money) par l'intermédiaire d'un prestataire de paiement tiers.",
        "« Prestataire de paiement » : le prestataire technique chargé du traitement des transactions Mobile Money (par exemple CamPay).",
      ] },
    ],
  },
  {
    title: 'Capacité et acceptation',
    blocks: [
      { type: 'p', text: "Le Client déclare être une personne physique majeure et juridiquement capable, ou, s'il est mineur, disposer de l'autorisation préalable d'un représentant légal. Le Client est seul responsable de l'exactitude des informations qu'il communique." },
      { type: 'p', text: "L'acceptation des présentes Conditions au moment du paiement vaut signature électronique et preuve de l'accord du Client, conformément aux règles applicables en matière de preuve électronique." },
    ],
  },
  {
    title: 'Description du service',
    blocks: [
      { type: 'p', text: "La Plateforme met en relation les Opérateurs et les Clients en vue de la vente de tickets d'accès à un réseau WiFi ou de produits numériques. Tikta agit en qualité d'intermédiaire technique et n'est pas l'Opérateur du service d'accès." },
      { type: 'p', text: "Les caractéristiques essentielles des Offres (prix, durée, débit éventuel, conditions techniques) sont celles décrites sur la page de paiement et/ou par l'Opérateur. Le Client reconnaît avoir pris connaissance de ces caractéristiques avant de commander." },
      { type: 'p', text: "Des modifications techniques peuvent être apportées sans que la responsabilité de Tikta ne puisse être engagée, dès lors qu'elles ne réduisent pas substantiellement les caractéristiques essentielles annoncées." },
    ],
  },
  {
    title: 'Commande et formation du contrat',
    blocks: [
      { type: 'p', text: "La commande est réputée formée lorsque le Client a : (i) sélectionné l'Offre, (ii) choisi un moyen de paiement, (iii) validé sa demande de paiement, et (iv) que le paiement a été confirmé par le Prestataire de paiement." },
      { type: 'p', text: "Tikta se réserve le droit de refuser, suspendre ou annuler toute commande en cas de suspicion de fraude, d'utilisation abusive, d'incident technique, de rupture de stock de tickets ou d'informations inexactes fournies par le Client." },
      { type: 'p', text: "Le Client est seul responsable de l'exactitude du numéro de téléphone fourni. Un numéro erroné peut entraîner l'impossibilité de recevoir les identifiants et n'ouvre pas droit à remboursement lorsque le paiement a été correctement débité." },
    ],
  },
  {
    title: 'Prix, devise et frais',
    blocks: [
      { type: 'p', text: "Les prix sont indiqués sur la Plateforme dans la devise affichée au moment de la commande, TVA éventuellement incluse. Les prix peuvent être modifiés à tout moment avant la validation de la commande." },
      { type: 'p', text: "Des frais de transaction, frais réseau ou commissions du Prestataire de paiement peuvent s'ajouter. Ils sont, le cas échéant, indiqués avant validation." },
      { type: 'p', text: "Le prix applicable est celui affiché au moment de la confirmation du paiement. Les erreurs manifestes de prix n'engagent pas Tikta, qui pourra annuler la commande et rembourser le montant effectivement payé." },
    ],
  },
  {
    title: 'Paiement Mobile Money',
    blocks: [
      { type: 'p', text: "Le paiement s'effectue exclusivement par portefeuille Mobile Money via un Prestataire de paiement tiers. Tikta ne stocke ni ne traite directement les données de votre portefeuille électronique." },
      { type: 'ul', items: [
        "Le Client autorise le débit du montant correspondant à la commande sur son portefeuille Mobile Money.",
        "Le Client doit confirmer la transaction sur son téléphone (saisie du code PIN) dans le délai imparti par le Prestataire.",
        "Le Client est responsable de la confidentialité de son code PIN et de l'usage de son téléphone.",
        "Tikta n'est pas responsable des délais, indisponibilités, erreurs ou frais imputables au Prestataire de paiement, à l'opérateur télécom ou au réseau.",
      ] },
      { type: 'p', text: "Un paiement n'est réputé reçu qu'après confirmation définitive par le Prestataire de paiement. Les statuts « en attente » ou « en cours » ne valent pas confirmation." },
    ],
  },
  {
    title: 'Confirmation, délais et preuve',
    blocks: [
      { type: 'p', text: "Après confirmation du paiement, la Plateforme traite la commande et met à disposition les identifiants du Ticket. Les délais de traitement sont indicatifs et peuvent varier selon les conditions du réseau et du Prestataire." },
      { type: 'p', text: "Les enregistrements électroniques de Tikta et du Prestataire de paiement (références de transaction, horodatages, journaux techniques) constituent, sauf preuve contraire, la preuve des opérations effectuées." },
      { type: 'p', text: "En cas de double paiement ou d'erreur de traitement, le Client doit contacter le support en fournissant les références de transaction. Après vérification, la somme indûment encaissée pourra être remboursée ou créditée." },
    ],
  },
  {
    title: 'Livraison des identifiants',
    blocks: [
      { type: 'p', text: "Les identifiants du Ticket sont transmis par SMS et/ou par email, selon les options disponibles et les informations fournies par le Client. Ils peuvent également être affichés sur la page de confirmation." },
      { type: 'p', text: "Le Client s'engage à conserver ces identifiants de manière confidentielle et à ne pas les partager avec des tiers non autorisés." },
      { type: 'p', text: "En cas de non-réception, le Client doit contacter le support dans les meilleurs délais. Tikta pourra régénérer ou renvoyer les identifiants, sans que cela ne constitue une reconnaissance d'une quelconque défaillance de service." },
    ],
  },
  {
    title: 'Validité et utilisation des tickets',
    blocks: [
      { type: 'ul', items: [
        "Le Ticket est strictement personnel, non cessible et ne peut être revendu sans l'accord écrit préalable de Tikta et de l'Opérateur.",
        "Le Ticket est valable pendant la durée indiquée sur l'Offre, à compter de son activation ou de sa première utilisation, selon les modalités annoncées.",
        "Toute utilisation non conforme, tentative de contournement, partage massif, automatisation ou revente frauduleuse peut entraîner la suspension immédiate du Ticket sans remboursement.",
        "La qualité, la couverture et le débit du réseau relèvent de l'Opérateur et peuvent varier selon la zone, le matériel et la saturation du réseau.",
      ] },
    ],
  },
  {
    title: 'Géolocalisation et attribution des zones',
    blocks: [
      { type: 'p', text: "Pour attribuer un paiement à une Zone, la Plateforme peut demander l'accès à la localisation du Client. Le Client accepte ce partage lorsqu'il valide sa commande." },
      { type: 'p', text: "La localisation est utilisée uniquement aux fins d'attribution de zone et de fonctionnement du service. L'absence de localisation ou une localisation imprécise peut empêcher la finalisation de la commande." },
    ],
  },
  {
    title: 'Droit de rétractation et remboursements',
    blocks: [
      { type: 'p', text: "Les Tickets et produits numériques sont fournis immédiatement après confirmation du paiement. Le Client reconnaît que l'exécution du service commence dès la confirmation et renonce, dans les limites permises par la loi, à tout droit de rétractation." },
      { type: 'p', text: "Sauf disposition légale impérative contraire ou erreur imputable à Tikta, les Tickets déjà délivrés ne sont ni échangeables ni remboursables." },
      { type: 'p', text: "Peut donner lieu à remboursement, après vérification : (i) un paiement débité sans délivrance d'un Ticket utilisable, (ii) un double paiement, ou (iii) une indisponibilité totale et durable du service imputable à l'Opérateur. Les demandes doivent être adressées au support avec les références de transaction." },
      { type: 'p', text: "Les remboursements éventuels sont effectués par les mêmes moyens de paiement que ceux utilisés, dans un délai raisonnable dépendant du Prestataire de paiement." },
    ],
  },
  {
    title: 'Annulation, échec ou expiration du paiement',
    blocks: [
      { type: 'p', text: "Un paiement peut échouer, être annulé ou expirer (solde insuffisant, refus, délai dépassé, indisponibilité). En cas d'échec avant confirmation, aucun Ticket n'est délivré et aucun montant n'est dû, sous réserve des délais de régularisation du Prestataire." },
      { type: 'p', text: "Tikta se réserve le droit de libérer les réservations de stock non confirmées dans un délai raisonnable, sans indemnité." },
    ],
  },
  {
    title: 'Obligations et usage acceptable',
    blocks: [
      { type: 'ul', items: [
        "Ne pas utiliser la Plateforme à des fins illicites, frauduleuses ou contraires à l'ordre public.",
        "Ne pas tenter d'accéder de manière non autorisée aux systèmes, données ou comptes de Tikta ou de tiers.",
        "Ne pas perturber, surcharger ou contourner le fonctionnement de la Plateforme.",
        "Ne pas usurper l'identité d'un tiers ni fournir de fausses informations.",
        "Respecter les droits de propriété intellectuelle et la réglementation applicable.",
      ] },
      { type: 'p', text: "Tout manquement peut entraîner la suspension ou la suppression de l'accès et, le cas échéant, des poursuites." },
    ],
  },
  {
    title: 'Disponibilité et maintenance',
    blocks: [
      { type: 'p', text: "La Plateforme est accessible sous réserve des opérations de maintenance, mises à jour et aléas techniques. Tikta ne garantit pas une disponibilité ininterrompue ou exempte d'erreurs." },
      { type: 'p', text: "Tikta peut suspendre temporairement tout ou partie du service sans que cela n'ouvre droit à indemnité." },
    ],
  },
  {
    title: 'Propriété intellectuelle',
    blocks: [
      { type: 'p', text: "L'ensemble des éléments de la Plateforme (marques, logos, textes, interfaces, bases de données, code) est protégé par les droits de propriété intellectuelle et demeure la propriété exclusive de Tikta ou de ses partenaires." },
      { type: 'p', text: "Toute reproduction, représentation, extraction ou réutilisation, totale ou partielle, sans autorisation écrite préalable, est interdite." },
    ],
  },
  {
    title: 'Données personnelles et confidentialité',
    blocks: [
      { type: 'p', text: "Tikta collecte et traite les données nécessaires à l'exécution des commandes (numéro de téléphone, email, localisation, références de transaction). Ces données sont traitées conformément à la réglementation applicable en matière de protection des données." },
      { type: 'ul', items: [
        "Les données sont utilisées pour traiter les paiements, délivrer les Tickets, assurer le support et prévenir la fraude.",
        "Les données peuvent être transmises au Prestataire de paiement et à l'Opérateur dans la mesure nécessaire à l'exécution du service.",
        "Le Client dispose, dans les conditions prévues par la loi, de droits d'accès, de rectification et d'opposition, exerçables via le support.",
      ] },
    ],
  },
  {
    title: 'Responsabilité et limitations',
    blocks: [
      { type: 'p', text: "Tikta met en œuvre les moyens raisonnables pour assurer le bon fonctionnement de la Plateforme. Sa responsabilité ne saurait être engagée pour les dommages indirects, pertes de données, pertes d'exploitation ou manques à gagner." },
      { type: 'p', text: "Tikta n'est pas responsable des défaillances du réseau télécom, du Prestataire de paiement, du réseau WiFi de l'Opérateur, ni des faits d'un tiers." },
      { type: 'p', text: "Dans les limites permises par la loi, la responsabilité totale de Tikta au titre d'une commande est plafonnée au montant effectivement payé par le Client pour cette commande." },
      { type: 'p', text: "Aucune stipulation des présentes ne limite les droits que la loi reconnaît impérativement au consommateur." },
    ],
  },
  {
    title: 'Force majeure',
    blocks: [
      { type: 'p', text: "Tikta ne pourra être tenue responsable d'un manquement résultant d'un événement de force majeure ou d'un cas fortuit, incluant notamment les pannes d'infrastructure, coupures d'électricité, catastrophes, actes de l'autorité publique ou défaillances généralisées des réseaux." },
    ],
  },
  {
    title: 'Modification des Conditions',
    blocks: [
      { type: 'p', text: "Tikta peut modifier les présentes Conditions à tout moment. La version applicable est celle en vigueur au moment de la commande. Les modifications substantielles seront portées à la connaissance des Clients par tout moyen approprié." },
      { type: 'p', text: "La poursuite de l'utilisation de la Plateforme après une mise à jour vaut acceptation des Conditions révisées." },
    ],
  },
  {
    title: 'Suspension et résiliation',
    blocks: [
      { type: 'p', text: "Tikta peut suspendre ou résilier l'accès à la Plateforme, sans préavis ni indemnité, en cas de manquement aux présentes Conditions, de fraude, d'usage abusif ou de demande d'une autorité compétente." },
    ],
  },
  {
    title: 'Droit applicable et règlement des litiges',
    blocks: [
      { type: 'p', text: "Les présentes Conditions sont soumises au droit camerounais, sous réserve des règles impératives protégeant les consommateurs." },
      { type: 'p', text: "En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera porté devant les juridictions compétentes." },
    ],
  },
  {
    title: 'Contact et réclamations',
    blocks: [
      { type: 'p', text: "Pour toute question ou réclamation, le Client peut contacter le support via l'adresse contact@tikta.xyz, en précisant la référence de la transaction, la date et l'objet de la demande." },
    ],
  },
  {
    title: 'Dispositions diverses',
    blocks: [
      { type: 'ul', items: [
        "Si une clause des présentes est jugée nulle ou inapplicable, les autres clauses demeurent en vigueur.",
        "Le fait pour Tikta de ne pas se prévaloir d'un manquement ne vaut pas renonciation à s'en prévaloir ultérieurement.",
        "Les présentes Conditions et la page de commande constituent l'intégralité de l'accord relatif à leur objet.",
      ] },
    ],
  },
];
