import React from 'react';
import styled from 'styled-components';
import {
  FiBookOpen,
  FiBriefcase,
  FiMapPin,
  FiTag,
  FiFolder,
  FiCreditCard,
  FiWifi,
  FiBarChart2,
  FiFileText,
  FiLink,
  FiCheckCircle,
  FiMessageSquare,
} from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows } from '../config/theme';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: ${spacing.xl};
`;

const Hero = styled.div`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight});
  color: #fff;
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.md};

  h1 { margin: 0 0 ${spacing.sm}; font-size: 1.5rem; display: flex; align-items: center; gap: 0.6rem; }
  p { margin: 0; line-height: 1.6; opacity: 0.95; font-size: 0.92rem; }
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};

  h2 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.08rem;
    color: ${colors.textPrimary};
    margin: 0 0 ${spacing.md};
  }
  p { color: ${colors.textPrimary}; line-height: 1.65; font-size: 0.9rem; margin: 0 0 0.7rem; }
  ul { margin: 0 0 0.6rem; padding-left: 1.2rem; }
  li { color: ${colors.textPrimary}; line-height: 1.6; font-size: 0.9rem; margin-bottom: 0.35rem; }
  strong { color: ${colors.textPrimary}; }
`;

const Step = styled.li`
  margin-bottom: 0.5rem;
`;

const Code = styled.code`
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82rem;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  word-break: break-all;
`;

const CodeBlock = styled.pre`
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.8rem;
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  overflow-x: auto;
  margin: 0.5rem 0 0.8rem;
`;

const Note = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  border-radius: ${borderRadius.md};
  padding: 0.75rem 0.9rem;
  font-size: 0.85rem;
  line-height: 1.55;
  margin-top: 0.6rem;

  svg { flex-shrink: 0; margin-top: 2px; }
`;

export const GuidePage: React.FC = () => {
  return (
    <Wrap>
      <Hero>
        <h1><FiBookOpen /> Guide d'utilisation Tikta</h1>
        <p>
          Comment vendre des tickets WiFi avec Tikta, de la création de l'entreprise jusqu'à la
          connexion du client — et comment intégrer le <strong>statut du portail captif</strong>
          {' '}qui connaît le vrai moment d'utilisation d'un ticket.
        </p>
      </Hero>

      <Card>
        <h2><FiBriefcase /> 1. Créer et faire vérifier votre entreprise</h2>
        <p>
          Depuis <strong>Businesses</strong>, créez votre entreprise, renseignez sa description et
          téléversez le <strong>contrat Tikta signé</strong>. La vérification de l'entreprise est
          nécessaire avant de pouvoir créer des offres.
        </p>
        <ul>
          <li>Une entreprise non vérifiée ne peut pas vendre.</li>
          <li>La description et le contrat sont obligatoires pour un compte client.</li>
        </ul>
      </Card>

      <Card>
        <h2><FiMapPin /> 2. Définir vos zones (optionnel)</h2>
        <p>
          Une <strong>zone</strong> est une aire géographique (ex. un supermarché, une école) tracée
          sur la carte. Si votre entreprise définit des zones, la <strong>localisation est demandée
          au client</strong> lors du paiement et le paiement est rattaché à la zone la plus proche.
        </p>
        <ul>
          <li>Sans zone définie : le paiement se déroule <strong>sans localisation</strong>.</li>
          <li>Avec zones : la page de paiement demande activement la localisation du client.</li>
        </ul>
      </Card>

      <Card>
        <h2><FiTag /> 3. Créer vos offres (tickets WiFi)</h2>
        <p>Depuis <strong>Offers &amp; Groups → Offers</strong>, créez une offre :</p>
        <ul>
          <li><strong>Prix</strong> et devise (XAF recommandé pour CamPay).</li>
          <li><strong>Réduction</strong> éventuelle (pourcentage ou montant fixe) : elle est
            automatiquement appliquée au paiement et visible sur la page de vente.</li>
          <li><strong>Durée de validité</strong> du ticket (jours + heures + minutes), ex. 2 jours,
            1 heure et 30 minutes. C'est cette durée qui détermine l'expiration réelle du ticket.</li>
          <li><strong>Callback URL</strong> : l'adresse du portail de connexion vers laquelle le
            client sera redirigé automatiquement après paiement (bouton CONNECT ME). Exemples :
            <Code>http://192.168.1.1/login</Code> (IP locale) ou <Code>http://portail.local/login</Code>.</li>
          <li><strong>Image</strong> de l'offre.</li>
        </ul>
        <Note>
          <FiCheckCircle />
          <span>
            Ajoutez et gérez votre <strong>stock de tickets</strong> (codes identifiant + mot de
            passe) depuis le menu <strong>Tickets</strong> : import CSV, création unitaire, etc.
          </span>
        </Note>
      </Card>

      <Card>
        <h2><FiFolder /> 4. Regrouper les offres (Groups)</h2>
        <p>
          Un <strong>groupe</strong> rassemble plusieurs offres sur une même page de vente. Il peut
          être un simple catalogue, ou un <strong>package payable</strong> (achat du lot en une fois).
        </p>
        <ul>
          <li>Définissez un <strong>header HTML</strong> (uniquement des <Code>&lt;div&gt;</Code> avec
            <Code>style</Code> inline) pour habiller la page de vente à la place de l'image de couverture.</li>
          <li>Ajoutez les offres à inclure dans le groupe.</li>
        </ul>
      </Card>

      <Card>
        <h2><FiCreditCard /> 5. Paiement Mobile Money</h2>
        <p>
          Les clients paient par <strong>MTN Mobile Money</strong> ou <strong>Orange Money</strong>
          {' '}via CamPay. Si l'invite USSD n'apparaît pas automatiquement, la page de paiement
          affiche le code à composer :
        </p>
        <ul>
          <li><strong>MTN</strong> : <Code>*126#</Code> pour valider la transaction.</li>
          <li><strong>Orange</strong> : <Code>#150*50#</Code> pour continuer le paiement.</li>
        </ul>
        <p>
          Le client accepte les conditions d'utilisation et, le cas échéant, le partage de sa
          localisation avant de payer.
        </p>
      </Card>

      <Card>
        <h2><FiWifi /> 6. Après le paiement : CONNECT ME</h2>
        <p>
          Une fois le paiement confirmé, le client dispose d'un bouton <strong>CONNECT ME</strong>
          {' '}qui l'<strong>redirige automatiquement</strong> vers le portail indiqué dans la
          <strong> Callback URL</strong> de l'offre, en y ajoutant ses identifiants :
        </p>
        <CodeBlock>{`<callback_url>?login=<ticket_id>&password=<mot_de_passe>`}</CodeBlock>
        <p>
          Le client peut aussi <strong>télécharger son ticket</strong> (PDF). S'il a fermé la page,
          il peut retrouver ses identifiants via la page publique <Code>/recover</Code> à partir de
          l'identifiant de transaction reçu par SMS.
        </p>
      </Card>

      <Card>
        <h2><FiLink /> 7. Statut du portail captif : la vraie date d'expiration</h2>
        <p>
          Le portail captif (la page qui s'affiche avant la connexion WiFi) doit interroger ce lien
          pour connaître l'état réel d'un ticket :
        </p>
        <CodeBlock>{`GET /api/payments/ticket-expiry/?ticket_id=<CODE_DU_TICKET>`}</CodeBlock>
        <p>Fonctionnement :</p>
        <ul>
          <li>Si le ticket a bien été <strong>acheté</strong> et qu'il <strong>n'a pas encore de date
            d'expiration</strong>, celle-ci est calculée à partir de la <strong>durée de l'offre</strong>
            et enregistrée : c'est le <strong>premier appel qui marque l'utilisation réelle</strong> du ticket.</li>
          <li>Si une date d'expiration existe déjà, elle est simplement renvoyée (aucune modification).</li>
          <li>La réponse est une <strong>date ISO 8601</strong> en texte brut, directement affichable
            (ex. <Code>2026-10-08T14:30:00+01:00</Code>).</li>
        </ul>
        <Note>
          <FiCheckCircle />
          <span>
            C'est ce mécanisme qui capte la <strong>première connexion sans ambiguïté</strong> et qui
            permet d'afficher la <strong>date d'expiration réelle</strong> sur le portail — et non une
            date de génération du ticket.
          </span>
        </Note>
      </Card>

      <Card>
        <h2><FiBarChart2 /> 8. Statistiques et taux d'activation</h2>
        <p>
          Dans <strong>Offers &amp; Groups → Stats</strong>, suivez les ventes par offre et le
          <strong> taux d'activation</strong> : la comparaison entre les <strong>tickets achetés</strong>
          {' '}(paiement confirmé) et les <strong>tickets réellement activés</strong> (interrogés via
          le lien d'expiration ci-dessus). Filtrez par tout, par année ou par mois.
        </p>
        <p>
          L'onglet <strong>Tickets activés</strong> liste, avec filtres et pagination, les tickets
          ayant une date d'activation : code, activation, expiration, offre et montant.
        </p>
      </Card>

      <Card>
        <h2><FiFileText /> 9. Contrat Tikta</h2>
        <p>
          Téléchargez la souche de contrat depuis votre espace, signez-la et re-téléversez-la. Si
          Tikta publie une nouvelle version, vous serez invité à la re-signer.
        </p>
      </Card>

      <Card>
        <h2><FiMessageSquare /> 10. Support</h2>
        <p>
          Un problème ? Ouvrez un ticket depuis le menu <strong>Support</strong>, ou écrivez à
          <Code>contact@tikta.xyz</Code> en précisant la référence de la transaction concernée.
        </p>
      </Card>
    </Wrap>
  );
};

export default GuidePage;
