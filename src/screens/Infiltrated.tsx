// Scénario « Infiltré » : le joueur est le Lieutenant D.R. du livret, agent de la C.R.F. infiltré sur Nostromo II.
// Archives de la C.R.F. (son message), puis l'e-mail de la direction trouvé sur le terminal du Coordinateur :
// la compagnie sait tout et l'envoie à l'entraînement pour le punir. Viennent ensuite les règles, puis la partie.
import { Overlay } from "../components/Overlay";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { Redact } from "../components/Redacted";
import { briefing } from "../state/ui";

/** E-mail interne : en-têtes, puis corps ([[…]] = passage censuré). */
export const EMAIL = {
  from: "Direction de la sécurité, Weyland-Yutani Corp.",
  to: "Coordinateur, base lunaire Nostromo II",
  cc: "Direction générale ; [[Division des armes biologiques]]",
  date: "23/10/2184 · 06:12",
  subject: "Agent infiltré – Lieutenant D.R. – affectation disciplinaire",
  attachments: ["transcription_CRF_221084.enc", "copie_protocoles_AIP_1-4.pdf", "plan_NOSTROMO_II.pdf"],
  body: [
    "Coordinateur,",
    "Nos services ont intercepté les messages adressés au QG terrestre de la Civil Resistance Force par l'individu se faisant appeler « Lieutenant D.R. ». Nous savons qu'il a copié quatre protocoles d'entraînement et le plan de la base. Transcriptions et copies en pièces jointes.",
    "Aucune sanction officielle ne sera prise, afin de ne pas alerter la C.R.F. : ni arrestation, ni interrogatoire. L'individu ignore que nous savons.",
    "Il participera à la prochaine session d'entraînement en qualité de Psychic Agent, sans dérogation. Son neuro-stimulant NS-X III lui sera retiré avant la session. [[Hôte de remplacement prévu en cas d'échec.]]",
    "Vous appliquerez le protocole comme pour tout autre agent. Le résultat de la session tiendra lieu de décision disciplinaire.",
    "[[En cas de survie, procédure 7-B.]]",
    "— Direction de la sécurité",
  ],
};

export function Infiltrated() {
  const panel = briefing.value;
  return (
    <>
      <Overlay id="archives" show={panel === "archives"} class="briefing">
        <div class="panel briefing-panel archives-panel">
          <div class="briefing-corp">ARCHIVES SECRÈTES DE LA C.R.F. · CIVIL RESISTANCE FORCE</div>
          <div class="doc-ref">NIVEAU DE CONFIDENTIALITÉ : 5 · 22/10/2184 · EXTRAIT DÉCRYPTÉ</div>
          <h2>MESSAGE DU LIEUTENANT D.R.</h2>
          <p>J'ai infiltré la base lunaire secrète Nostromo II. La Weyland-Yutani y entraîne des Psychic Agents à ressentir la présence des Aliens.</p>
          <p>Son projet de contrôle des xénomorphes continue, malgré les échecs et les morts. Huit spécimens adultes de génération IV sont confinés sous le plancher. <Redact text="[[Les hôtes seraient des condamnés à mort.]]" /></p>
          <p>J'ai copié quatre protocoles et le plan de la base. S'ils me surprennent avec ces documents, la compagnie me jettera en pâture à ses créatures.</p>
          <p class="briefing-sign">— Lieutenant D.R.</p>
          <div class="row icon-row briefing-actions">
            <IconButton id="archivesNext" icon="continuer" label="Continuer" primary onClick={() => { briefing.value = "email"; }} />
          </div>
        </div>
      </Overlay>

      <Overlay id="email" show={panel === "email"} class="briefing">
        <div class="panel briefing-panel welcome-panel email-panel">
          <WeylandLogo class="logo-watermark logo-in-panel" />
          <div class="briefing-corp">MU/TH/UR 6000 · MESSAGERIE INTERNE W.Y.C. · TERMINAL DU COORDINATEUR</div>
          <div class="email-alert">MESSAGE NON LU · CHIFFREMENT NIVEAU 5</div>
          <dl class="email-head">
            <dt>DE</dt><dd>{EMAIL.from}</dd>
            <dt>À</dt><dd>{EMAIL.to}</dd>
            <dt>CC</dt><dd><Redact text={EMAIL.cc} /></dd>
            <dt>DATE</dt><dd>{EMAIL.date}</dd>
            <dt>OBJET</dt><dd class="email-subject" id="emailSubject">{EMAIL.subject}</dd>
            <dt>P.J.</dt><dd>{EMAIL.attachments.map(a => <span key={a} class="email-attachment">▤ {a}</span>)}</dd>
          </dl>
          <div class="contract-scroll email-body" id="emailBody" tabIndex={0} aria-label="Corps de l'e-mail">
            {EMAIL.body.map((p, i) => <p key={i}><Redact text={p} /></p>)}
          </div>
          <div class="email-foot">IMPRIMER / TRANSMETTRE : INTERDIT</div>
          <div class="row icon-row briefing-actions">
            <IconButton id="emailBack" icon="retour" label="Retour" onClick={() => { briefing.value = "archives"; }} />
            <IconButton id="emailNext" icon="continuer" label="Continuer" primary onClick={() => { briefing.value = 1; }} />
          </div>
        </div>
      </Overlay>
    </>
  );
}
