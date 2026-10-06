import { Braces, LayoutGrid, SlidersVertical } from "lucide-react";
import { setPhoneTab } from "@/store/actions/layout";
import { useHasAnyClip } from "@/store/selectors";
import { useUiStore, type PhoneTab } from "@/store/uiStore";
import { CodePanel } from "@/ui/code/CodePanel";
import { DemoProjects } from "@/ui/demos/DemoProjects";
import { EditorPanel } from "@/ui/editors/EditorPanel";
import { ClipGrid } from "@/ui/grid/ClipGrid";
import { EmptyStateCard } from "@/ui/grid/EmptyStateCard";
import { Mixer } from "@/ui/mixer/Mixer";
import { TabPanel, Tabs, type TabOption } from "@/ui/primitives/Tabs";
import { TopBar } from "@/ui/transport/TopBar";

const TAB_ICON_SIZE = 16;

const TABS: readonly TabOption<PhoneTab>[] = [
  { value: "clips", label: "Clips", icon: <LayoutGrid size={TAB_ICON_SIZE} aria-hidden /> },
  { value: "mixer", label: "Mixer", icon: <SlidersVertical size={TAB_ICON_SIZE} aria-hidden /> },
  { value: "code", label: "Code", icon: <Braces size={TAB_ICON_SIZE} aria-hidden /> },
];

/** L'éditeur ouvert prend tout l'écran ; sinon la grille, précédée de l'invitation tant que le projet est vide. */
function ClipsView() {
  const hasEditor = useUiStore((state) => state.editorClipId !== null);
  const hasAnyClip = useHasAnyClip();
  if (hasEditor) return <EditorPanel />;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-3">
      {hasAnyClip ? null : <EmptyStateCard layout="inline" />}
      <ClipGrid hasEmptyStateOverlay={false} />
      {hasAnyClip ? null : <DemoProjects />}
    </div>
  );
}

/** Mise en page du téléphone : une vue à la fois, choisie dans la barre d'onglets du bas. */
export function PhoneWorkspace() {
  const phoneTab = useUiStore((state) => state.phoneTab);
  return (
    <>
      <TopBar />
      <Tabs options={TABS} value={phoneTab} onChange={setPhoneTab} label="Views">
        <TabPanel value="clips">
          <ClipsView />
        </TabPanel>
        <TabPanel value="mixer">
          <Mixer />
        </TabPanel>
        <TabPanel value="code">
          <CodePanel />
        </TabPanel>
      </Tabs>
    </>
  );
}
