// Scénario « Session disciplinaire » : le joueur est le Lieutenant D.R. du livret, agent de la C.R.F. infiltré sur Nostromo II.
// L'écran montre l'e-mail chiffré qu'il a envoyé à sa base secrète, le QG terrestre de la C.R.F. Il a été intercepté :
// la direction de la W.Y.C. le transfère au Coordinateur, avec un bandeau qui envoie l'expéditeur à l'entraînement.
// Viennent ensuite les règles, puis la partie.
import { Overlay } from "../components/Overlay";
import { Monitor } from "../components/Monitor";
import { IconButton } from "../components/Icon";
import { Redact } from "../components/Redacted";
import { briefing } from "../state/ui";

/** E-mail du Lieutenant D.R. à la C.R.F. : en-têtes, puis corps ([[…]] = passage censuré). */
export const EMAIL = {
  from: "Lieutenant D.R. · canal chiffré C.R.F.-7",
  to: "QG terrestre de la Civil Resistance Force",
  date: "22/10/2184 · 23:47",
  subject: "Nostromo II – rapport d'infiltration",
  attachments: ["protocoles_AIP_1-4.enc", "plan_NOSTROMO_II.enc"],
  body: [
    "QG,",
    "J'ai infiltré la base lunaire secrète Nostromo II. La Weyland-Yutani y entraîne des Psychic Agents à ressentir la présence des Aliens.",
    "Son projet de contrôle des xénomorphes continue, malgré les échecs et les morts. Des spécimens adultes sont confinés sous le plancher. [[Les hôtes seraient des condamnés à mort.]]",
    "Je joins le plan de la base et la copie de quatre protocoles d'intrusion : l'ordre dans lequel ils ferment les salles pendant les entraînements. S'ils me surprennent avec ces documents, la compagnie me jettera en pâture à ses créatures.",
    "Je tiens grâce au NS-X III. Prévoyez l'exfiltration.",
    "— Lieutenant D.R.",
  ],
};

/** Bandeau de la direction, en tête de la copie transférée au Coordinateur. */
export const INTERCEPT = {
  stamp: "INTERCEPTÉ",
  forwardedBy: "Direction de la sécurité W.Y.C.",
  to: "Coordinateur, base lunaire Nostromo II",
  notes: [
    "Message intercepté et décrypté.",
    "L'expéditeur participera à la prochaine session d'entraînement, sans dérogation. NS-X III retiré.",
    "Aucune autre sanction ne sera notifiée. [[En cas de survie, procédure 7-B.]]",
  ],
  footer: "Transmis au Coordinateur pour exécution.",
};

export function Infiltrated() {
  const panel = briefing.value;
  return (
    <Overlay id="email" show={panel === "email"} class="briefing">
      <Monitor label="TERMINAL DU COORDINATEUR · COPIE INTERCEPTÉE" status="IMPRIMER / TRANSMETTRE : INTERDIT">
        <div class="panel briefing-panel email-panel">
          <div class="email-intercept" id="emailIntercepted">
            <span class="email-stamp">{INTERCEPT.stamp}</span>
            <div class="email-intercept-head">TRANSFÉRÉ PAR : {INTERCEPT.forwardedBy} · À : {INTERCEPT.to}</div>
            {INTERCEPT.notes.map((note, i) => <div key={i} class="email-intercept-note"><Redact text={note} /></div>)}
          </div>
          <div class="briefing-corp">MESSAGE ORIGINAL · CANAL C.R.F. · CHIFFREMENT NIVEAU 5</div>
          <dl class="email-head">
            <dt>DE</dt><dd>{EMAIL.from}</dd>
            <dt>À</dt><dd>{EMAIL.to}</dd>
            <dt>DATE</dt><dd>{EMAIL.date}</dd>
            <dt>OBJET</dt><dd class="email-subject" id="emailSubject">{EMAIL.subject}</dd>
            <dt>P.J.</dt><dd>{EMAIL.attachments.map(a => <span key={a} class="email-attachment">▤ {a}</span>)}</dd>
          </dl>
          <div class="contract-scroll email-body" id="emailBody" tabIndex={0} aria-label="Corps de l'e-mail">
            {EMAIL.body.map((p, i) => <p key={i}><Redact text={p} /></p>)}
          </div>
          <div class="email-foot">{INTERCEPT.footer}</div>
          <div class="row icon-row briefing-actions">
            <IconButton id="emailNext" icon="continuer" label="Continuer" primary onClick={() => { briefing.value = 1; }} />
          </div>
        </div>
      </Monitor>
    </Overlay>
  );
}
