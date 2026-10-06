import { DEMOS, type Demo } from "@/demos";
import { loadProject } from "@/store/actions/project";
import { nextId } from "@/store/ids";
import { checkAllCodeClips, stopPlayback } from "@/ui/app/playbackController";
import { DemoCard } from "@/ui/demos/DemoCard";

function openDemo(demo: Demo): void {
  stopPlayback();
  // Nouvel identifiant : les modifications d'une démo ne remplacent pas la démo d'origine dans la sauvegarde.
  loadProject({ ...demo.project, id: nextId() });
  void checkAllCodeClips();
}

/** Projets de démonstration, à la place du mixer tant que le projet est vide. */
export function DemoProjects() {
  return (
    <section
      aria-label="Demo projects"
      className="mx-3 mt-3.5 flex min-h-0 flex-1 flex-col gap-3 border-t border-gray-225 pt-4.5 pb-3.5"
    >
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-title font-semibold">Or open a demo project</h2>
        <span className="text-body text-fg-3">Working songs you can take apart, clip by clip.</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-2.5">
        {DEMOS.map((demo) => (
          <DemoCard key={demo.project.id} demo={demo} onOpen={() => openDemo(demo)} />
        ))}
      </div>
    </section>
  );
}
