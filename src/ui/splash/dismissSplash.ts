import { delayUntilExit } from "@/ui/splash/exitTiming";

/** Durée de la sortie la plus longue (`k2-out`, index.html). */
const EXIT_DURATION_MS = 400;
/** Au-delà, le splash est retiré même si `animationend` n'est jamais arrivé : il ne doit pas masquer l'app. */
const REMOVAL_FALLBACK_MS = EXIT_DURATION_MS * 3;

/** Temps à attendre pour retomber sur le temps fort ; 0 sans animation (mouvement réduit). */
function exitDelay(logo: Element | null): number {
  const turn = logo?.getAnimations()[0];
  if (!turn) return 0;
  const elapsed = turn.currentTime;
  const loop = turn.effect?.getComputedTiming().duration;
  if (typeof elapsed !== "number" || typeof loop !== "number" || loop <= 0) return 0;
  return delayUntilExit(elapsed, loop);
}

function playExit(splash: HTMLElement): void {
  const remove = () => splash.remove();
  splash.addEventListener("animationend", (event) => {
    if (event.target === splash) remove();
  });
  window.setTimeout(remove, REMOVAL_FALLBACK_MS);
  splash.classList.add("is-ready");
}

/** Retire l'écran de chargement d'index.html une fois l'app rendue, sur le prochain temps fort. */
export function dismissSplash(): void {
  const splash = document.getElementById("splash");
  if (!splash) return;
  window.setTimeout(() => playExit(splash), exitDelay(splash.querySelector(".k2-rot")));
}
