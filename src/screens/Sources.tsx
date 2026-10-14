// Écran « Sources », ouvert depuis l'accueil : crédits, inspirations et outils de l'app.
// Les adresses principales ont un QR code pour les ouvrir depuis un téléphone.
// Les textes sont dans src/data/sources.ts.
import { Overlay } from "../components/Overlay";
import { Monitor } from "../components/Monitor";
import { IconButton } from "../components/Icon";
import { QrCode } from "../components/QrCode";
import { SOURCES } from "../data/sources";
import { sourcesOpen } from "../state/ui";

/** Adresse sans « https:// » ni « / » final, plus lisible. */
const shortUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function Sources() {
  const close = () => { sourcesOpen.value = false; };
  return (
    <Overlay id="sources" show={sourcesOpen.value} class="briefing">
      {sourcesOpen.value && (
        <Monitor label="ARCHIVES · SOURCES ET CRÉDITS">
          <div class="panel briefing-panel sources-panel">
            <div class="tuto-head">
              <div class="briefing-corp">WEYLAND-YUTANI CORP · DOCUMENTATION</div>
              <IconButton id="sourcesClose" icon="annuler" label="Fermer les sources" class="tuto-close" onClick={close} />
            </div>
            <h2>SOURCES</h2>
            {SOURCES.map(group => (
              <section key={group.title} class="source-group">
                <h3>{group.title}</h3>
                <ul class={group.items.some(s => s.qr) ? "source-list with-qr" : "source-list"}>
                  {group.items.map(s => (
                    <li key={s.name} class={s.qr ? "source source-qr" : "source"}>
                      {s.qr && s.url && <QrCode text={s.url} label={`QR code : ${shortUrl(s.url)}`} />}
                      <div class="source-text">
                        <strong>{s.name}</strong>
                        <span class="source-by">{s.by}</span>
                        <span class="source-use">{s.use}</span>
                        {s.url && <a class="source-url" href={s.url} target="_blank" rel="noopener">{shortUrl(s.url)}</a>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p class="source-note">
              Création de fan, sans lien avec les ayants droit. Les protocoles ne sont pas dans l'app :
              on utilise les fiches et les cartes de l'effet.
            </p>
            <div class="row icon-row briefing-actions">
              <IconButton id="sourcesBack" icon="retour" label="Retour à l'accueil" primary onClick={close} />
            </div>
          </div>
        </Monitor>
      )}
    </Overlay>
  );
}
