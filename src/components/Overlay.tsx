// Écran plein qui passe par-dessus le jeu.
import type { ComponentChildren, HTMLAttributes } from "preact";

type Props = { id: string; show: boolean; class?: string; children: ComponentChildren } & Omit<HTMLAttributes<HTMLDivElement>, "id" | "class">;

export function Overlay({ id, show, class: className = "", children, ...rest }: Props) {
  return (
    <div id={id} class={`overlay ${className} ${show ? "show" : ""}`} {...rest}>
      {children}
    </div>
  );
}
