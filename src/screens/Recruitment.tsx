// Scénario « Une simple formalité » (jeu de rôle) : panneau du RH, puis contrat à faire défiler et à signer
// par empreinte digitale. Viennent ensuite les panneaux du Coordinateur (règles), puis la partie.
import { signal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { Overlay } from "../components/Overlay";
import { Monitor } from "../components/Monitor";
import { IconButton } from "../components/Icon";
import { WeylandLogo } from "../components/WeylandLogo";
import { Redact } from "../components/Redacted";
import { audio } from "../audio/audio";
import { CONTRACT_ARTICLES, CONTRACT_ARTICLES_EN, CONTRACT_PREAMBLE, CONTRACT_PREAMBLE_EN, CONTRACT_REF } from "../data/contract";
import { briefing } from "../state/ui";
import { lang, tr } from "../i18n";

/** Durée d'appui sur le lecteur d'empreinte pour signer. */
const HOLD_MS = 1500;

/** Contrat signé pour cette partie (remis à zéro à chaque « Démarrer »). */
export const contractSigned = signal(false);

export function Recruitment() {
  const panel = briefing.value;
  return (
    <>
      <Overlay id="hr" show={panel === "hr"} class="briefing">
        <Monitor label={tr("BUREAU DU RECRUTEMENT · TERMINAL RH", "RECRUITMENT OFFICE · HR TERMINAL")}>
        <div class="panel briefing-panel welcome-panel">
          <WeylandLogo class="logo-watermark logo-in-panel" />
          <div class="briefing-corp">WEYLAND-YUTANI CORP · {tr("SERVICE DES RESSOURCES HUMAINES", "HUMAN RESOURCES DEPARTMENT")} · NOSTROMO II</div>
          <div class="briefing-motto">« Building Better Worlds »</div>
          {lang.value === "en" ? (
            <>
              <h2>WELCOME ABOARD, CANDIDATE.</h2>
              <p>Thank you for answering our offer. The position we are offering you is one of the best paid in the company: 48,000 credits a month, company housing, an assignment bonus and full medical coverage.</p>
              <p>Before your assignment, you will take a short aptitude test aboard the Nostromo II base ship, supervised by our Coordinator <Redact text="[[and the Science Division]]" />. Just a formality: stay calm and follow his instructions.</p>
              <p>All that remains is for you to read your contract and sign it.</p>
            </>
          ) : (
            <>
              <h2>BIENVENUE PARMI NOUS, CANDIDAT.</h2>
              <p>Merci d'avoir répondu à notre offre. Le poste que nous vous proposons est l'un des mieux rémunérés de la compagnie : 48 000 crédits par mois, logement de fonction, prime d'affectation et couverture médicale complète.</p>
              <p>Avant votre affectation, vous passerez un court examen d'aptitude à bord du vaisseau-base Nostromo II, sous la supervision de notre Coordinateur <Redact text="[[et de la Division scientifique]]" />. Une simple formalité : restez calme et suivez ses instructions.</p>
              <p>Il ne vous reste qu'à prendre connaissance de votre contrat et à le signer.</p>
            </>
          )}
          <div class="row icon-row briefing-actions">
            <IconButton id="hrNext" icon="continuer" label={tr("Continuer", "Continue")} primary onClick={() => { briefing.value = "contract"; }} />
          </div>
        </div>
        </Monitor>
      </Overlay>

      <Overlay id="contract" show={panel === "contract"} class="briefing">
        {panel === "contract" && <Monitor label={tr("BUREAU DU RECRUTEMENT · LECTEUR BIOMÉTRIQUE", "RECRUITMENT OFFICE · BIOMETRIC READER")} status={tr("EN ATTENTE DE SIGNATURE", "AWAITING SIGNATURE")}><Contract /></Monitor>}
      </Overlay>
    </>
  );
}

function Contract() {
  const scroller = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(contractSigned.value);
  const signed = contractSigned.value;
  const en = lang.value === "en";
  const preamble = en ? CONTRACT_PREAMBLE_EN : CONTRACT_PREAMBLE;
  const articles = en ? CONTRACT_ARTICLES_EN : CONTRACT_ARTICLES;

  const check = () => {
    const el = scroller.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReadToEnd(true);
  };
  useEffect(check, []);

  return (
    <div class="panel briefing-panel contract-panel">
      <div class="briefing-corp">WEYLAND-YUTANI CORP · {tr("SERVICE DES RESSOURCES HUMAINES", "HUMAN RESOURCES DEPARTMENT")}</div>
      <h2 class="contract-title">{tr("CONTRAT DE TRAVAIL N°", "EMPLOYMENT CONTRACT NO.")} {CONTRACT_REF}</h2>
      <div class="contract-scroll" id="contractScroll" ref={scroller} onScroll={check} tabIndex={0}
        aria-label={tr("Contrat de travail, à lire jusqu'en bas", "Employment contract, read it to the end")}>
        {preamble.map((p, i) => <p key={i} class={i % 2 === 0 && i !== 1 ? "contract-lead" : undefined}><Redact text={p} /></p>)}
        {articles.map((article, i) => (
          <section key={article.title} class="contract-article">
            <h3>ARTICLE {i + 1} · {article.title}</h3>
            {article.paragraphs.map((p, j) => <p key={j}><span class="contract-num">{i + 1}.{j + 1}</span> <Redact text={p} /></p>)}
          </section>
        ))}
        <p class="contract-end">— {tr("FIN DU DOCUMENT", "END OF DOCUMENT")} · {articles.length} ARTICLES —</p>
      </div>

      <Fingerprint enabled={readToEnd} />

      <div class="row icon-row briefing-actions contract-actions">
        <IconButton id="contractBack" icon="retour" label={tr("Retour", "Back")} onClick={() => { briefing.value = "hr"; }} />
        <IconButton id="contractNext" icon="continuer" label={tr("Continuer", "Continue")} primary disabled={!signed}
          onClick={() => { briefing.value = 1; }} />
      </div>
    </div>
  );
}

/** Lecteur d'empreinte : maintenir le doigt 1,5 s pour signer (souris, doigt, ou Espace / Entrée). */
function Fingerprint({ enabled }: { enabled: boolean }) {
  const [scanning, setScanning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const signed = contractSigned.value;

  const start = () => {
    if (!enabled || signed || timer.current) return;
    audio.init();
    setScanning(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setScanning(false);
      contractSigned.value = true;
      audio.beep(true);
    }, HOLD_MS);
  };
  const stop = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = undefined;
    setScanning(false);
  };
  useEffect(() => stop, []);

  const message = signed ? tr("CONTRAT SIGNÉ · EMPREINTE ENREGISTRÉE", "CONTRACT SIGNED · FINGERPRINT RECORDED")
    : !enabled ? tr("LISEZ LE CONTRAT JUSQU'EN BAS", "READ THE CONTRACT TO THE END")
    : scanning ? tr("ANALYSE EN COURS… GARDEZ LE DOIGT POSÉ", "SCANNING… KEEP YOUR FINGER IN PLACE")
    : tr("APPOSEZ VOTRE EMPREINTE POUR SIGNER", "PLACE YOUR FINGERPRINT TO SIGN");

  return (
    <div class={["fingerprint", enabled && "ready", scanning && "scanning", signed && "signed"].filter(Boolean).join(" ")}>
      <button type="button" id="fingerprint" class="fingerprint-pad" disabled={!enabled || signed}
        aria-label={tr("Lecteur d'empreinte : maintenir le doigt posé pour signer", "Fingerprint reader: hold your finger down to sign")}
        onPointerDown={e => { e.preventDefault(); start(); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
        onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
        onKeyUp={e => { if (e.key === " " || e.key === "Enter") stop(); }}
        onContextMenu={e => e.preventDefault()}>
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M14 18a11 11 0 0 1 20 0" />
          <path d="M11 25a13 13 0 0 1 1-6M37 19a13 13 0 0 1 0 12" />
          <path d="M17 34c2-3 2-7 2-10a5 5 0 0 1 10 0c0 5-1 9-3 13" />
          <path d="M14 30c1-2 1-4 1-6a9 9 0 0 1 18 0c0 3 0 6-1 9" />
          <path d="M24 24c0 6-1 11-5 15M21 41c3-3 5-8 6-13" />
          <path d="M31 36c-1 2-2 4-3 5" />
        </svg>
        <span class="fingerprint-beam" aria-hidden="true" />
      </button>
      <div class="fingerprint-msg" id="fingerprintMsg" role="status">{message}</div>
      {signed && <div class="fingerprint-ref">{tr("RÉF.", "REF.")} {CONTRACT_REF} · {tr("SIGNATURE BIOMÉTRIQUE VALIDE", "VALID BIOMETRIC SIGNATURE")}</div>}
    </div>
  );
}
