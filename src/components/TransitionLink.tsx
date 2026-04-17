"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export default function TransitionLink({ children, href, className, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    // 1. On lance le loader
    const startEvent = new CustomEvent("start-loader");
    window.dispatchEvent(startEvent);

    // 2. Sécurité Anti-Blocage : 
    // Si après 2 secondes la page n'a pas fini de charger, on force la fin du loader
    // pour que l'utilisateur ne reste pas bloqué sur un écran noir.
    const safetyTimeout = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("stop-loader"));
    }, 2000);

    // 3. Délai pour laisser le rideau/loader s'afficher (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 4. Changement de page
    router.push(href.toString());

    // Note : Le "safetyTimeout" sera annulé ou complété par la nouvelle page
    // mais par prévoyance, on peut aussi envoyer un stop après le push
    // pour les pages déjà mises en cache par Next.js (qui chargent instantanément).
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("stop-loader"));
      clearTimeout(safetyTimeout);
    }, 500);
  };

  return (
    <Link {...props} href={href} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}