// Scénario « Session disciplinaire » : le joueur est le Lieutenant D.R. du livret, agent de la C.R.F. infiltré sur Nostromo II.
// L'écran montre l'e-mail chiffré qu'il a envoyé à sa base secrète, le QG terrestre de la C.R.F. Il a été intercepté :
// la direction de la W.Y.C. le transfère au Coordinateur, avec un bandeau qui envoie l'expéditeur à l'entraînement.
// Viennent ensuite les règles, puis la partie.
import { Overlay } from "../components/Overlay";
import { Monitor } from "../components/Monitor";
import { IconButton } from "../components/Icon";
import { Redact } from "../components/Redacted";
import { briefing } from "../state/ui";
import { byLang, tr } from "../i18n";

/** E-mail du Lieutenant D.R. à la C.R.F. : en-têtes, puis corps ([[…]] = passage censuré). */
const EMAIL_FR = {
  from: "Lieutenant D.R. · canal chiffré C.R.F.-7",
  to: "QG terrestre de la Civil Resistance Force",
  date: "22/10/2184 · 23:47",
  subject: "Nostromo II – rapport d'infiltration",
  attachments: ["protocoles_AIP_1-4.enc", "plan_NOSTROMO_II.enc"],
  body: [
    "QG,",
    "J'ai infiltré la base lunaire secrète Nostromo II. La Weyland-Yutani y entraîne des Psychic Agents à ressentir la présence des Aliens.",
    "Son projet de contrôle des xénomorphes continue, malgré les échecs et les morts. Des spécimens adultes sont confinés sous le plancher. [[Les hôtes seraient des condamnés à mort.]]",
    "Je joins le plan de la base et la copie des protocoles d'intrusion : l'ordre dans lequel ils ferment les salles pendant les entraînements. S'ils me surprennent avec ces documents, la compagnie me jettera en pâture à ses créatures.",
    "Je tiens grâce au NS-X III. Prévoyez l'exfiltration.",
    "— Lieutenant D.R.",
  ],
};

/** Bandeau de la direction, en tête de la copie transférée au Coordinateur. */
const INTERCEPT_FR = {
  stamp: "INTERCEPTÉ",
  forwardedBy: "Direction de la sécurité W.Y.C.",
  to: "Coordinateur, base lunaire Nostromo II",
  notes: [
    "Message intercepté et décrypté.",
    "Expéditeur identifié : Dominique RASK, Psychic Agent en formation, matricule PA-2184-[[0417]], base lunaire Nostromo II.",
    "L'expéditeur participera à la prochaine session d'entraînement, sans dérogation. NS-X III retiré.",
    "Aucune autre sanction ne sera notifiée. [[En cas de survie, procédure 7-B.]]",
  ],
  footer: "Transmis au Coordinateur pour exécution.",
};

const EMAIL_EN: typeof EMAIL_FR = {
  from: "Lieutenant D.R. · encrypted channel C.R.F.-7",
  to: "Civil Resistance Force Earth HQ",
  date: "10/22/2184 · 23:47",
  subject: "Nostromo II – infiltration report",
  attachments: EMAIL_FR.attachments,
  body: [
    "HQ,",
    "I have infiltrated the secret lunar base Nostromo II. Weyland-Yutani is training Psychic Agents there to sense the presence of Aliens.",
    "Its xenomorph control project goes on, despite the failures and the deaths. Adult specimens are confined beneath the floor. [[The hosts are said to be death-row convicts.]]",
    "I am attaching the base map and a copy of the intrusion protocols: the order in which they seal the rooms during training. If they catch me with these documents, the company will feed me to its creatures.",
    "The NS-X III keeps me going. Prepare the extraction.",
    "— Lieutenant D.R.",
  ],
};

const INTERCEPT_EN: typeof INTERCEPT_FR = {
  stamp: "INTERCEPTED",
  forwardedBy: "W.Y.C. Security Directorate",
  to: "Coordinator, Nostromo II lunar base",
  notes: [
    "Message intercepted and decrypted.",
    "Sender identified: Dominique RASK, Psychic Agent in training, serial no. PA-2184-[[0417]], Nostromo II lunar base.",
    "The sender will take part in the next training session, no exemptions. NS-X III withdrawn.",
    "No other sanction will be notified. [[If the sender survives, procedure 7-B.]]",
  ],
  footer: "Forwarded to the Coordinator for execution.",
};

/** E-mail et bandeau de la direction, par langue. */
const EMAIL = { fr: EMAIL_FR, en: EMAIL_EN };
const INTERCEPT = { fr: INTERCEPT_FR, en: INTERCEPT_EN };

export function Infiltrated() {
  const panel = briefing.value;
  const email = byLang(EMAIL), intercept = byLang(INTERCEPT);
  return (
    <Overlay id="email" show={panel === "email"} class="briefing">
      <Monitor label={tr("TERMINAL DU COORDINATEUR · COPIE INTERCEPTÉE", "COORDINATOR'S TERMINAL · INTERCEPTED COPY")}
        status={tr("IMPRIMER / TRANSMETTRE : INTERDIT", "PRINT / FORWARD: FORBIDDEN")}>
        <div class="panel briefing-panel email-panel">
          {/* Une seule zone qui défile : bandeau de la direction, en-têtes et corps ; les boutons restent au pied */}
          <div class="email-scroll" id="emailScroll" tabIndex={0} aria-label={tr("E-mail intercepté", "Intercepted e-mail")}>
          <div class="email-intercept" id="emailIntercepted">
            <span class="email-stamp">{intercept.stamp}</span>
            <div class="email-intercept-head">{tr("TRANSFÉRÉ PAR :", "FORWARDED BY:")} {intercept.forwardedBy} · {tr("À :", "TO:")} {intercept.to}</div>
            {intercept.notes.map((note, i) => <div key={i} class="email-intercept-note"><Redact text={note} /></div>)}
          </div>
          <div class="briefing-corp">{tr("MESSAGE ORIGINAL · CANAL C.R.F. · CHIFFREMENT NIVEAU 5", "ORIGINAL MESSAGE · C.R.F. CHANNEL · LEVEL 5 ENCRYPTION")}</div>
          <dl class="email-head">
            <dt>{tr("DE", "FROM")}</dt><dd>{email.from}</dd>
            <dt>{tr("À", "TO")}</dt><dd>{email.to}</dd>
            <dt>DATE</dt><dd>{email.date}</dd>
            <dt>{tr("OBJET", "SUBJECT")}</dt><dd class="email-subject" id="emailSubject">{email.subject}</dd>
            <dt>{tr("P.J.", "ATT.")}</dt><dd>{email.attachments.map(a => <span key={a} class="email-attachment">▤ {a}</span>)}</dd>
          </dl>
          <div class="contract-scroll email-body" id="emailBody">
            {email.body.map((p, i) => <p key={i}><Redact text={p} /></p>)}
          </div>
          <div class="email-foot">{intercept.footer}</div>
          </div>
          <div class="row icon-row briefing-actions">
            <IconButton id="emailNext" icon="continuer" label={tr("Continuer", "Continue")} primary onClick={() => { briefing.value = 1; }} />
          </div>
        </div>
      </Monitor>
    </Overlay>
  );
}
