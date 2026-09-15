import { useEffect } from "react";
import Lenis from "lenis";

let globalLenis = null;

export function pauseSmoothScroll() {
  if (globalLenis) {
    globalLenis.stop();
  }
}

export function resumeSmoothScroll() {
  if (globalLenis) {
    globalLenis.start();
  }
}

/*
  Lenis assume o controle do scroll da página para deixá-lo mais suave e
  também assume a suavização dos links de âncora (Início, Serviços, etc).
  `respectReducedMotion` (padrão do Lenis) já desativa a suavização sozinho
  quando o usuário tem "reduzir movimento" ativado no sistema.
*/
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.1,
    });
    globalLenis = lenis;

    return () => {
      lenis.destroy();
      globalLenis = null;
    };
  }, []);
}

