// Écran plein qui passe par-dessus le jeu.
export function Overlay({ id, show, class: className = "", children, ...rest }) {
  return (
    <div id={id} class={`overlay ${className} ${show ? "show" : ""}`} {...rest}>
      {children}
    </div>
  );
}
