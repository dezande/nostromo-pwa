// Hauteur réellement visible de la fenêtre, dans la variable CSS --app-h.
// Les anciens navigateurs (Samsung Internet ou Chrome d'une Galaxy Tab 4…) ne connaissent pas 100dvh
// et leur 100vh compte aussi la place des barres du navigateur : l'app passait sous la barre du bas.
// Une feuille de style à part, car le style d'écran efface les styles posés sur <html>.
const style = document.createElement("style");
document.head.appendChild(style);

function update() {
  style.textContent = `:root { --app-h: ${window.innerHeight}px; }`;
}

update();
window.addEventListener("resize", update);
window.addEventListener("orientationchange", () => setTimeout(update, 300));
