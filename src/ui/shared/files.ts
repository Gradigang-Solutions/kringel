/** Propose le téléchargement d'un fichier. */
export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Propose le téléchargement d'un texte sous forme de fichier. */
export function downloadTextFile(fileName: string, text: string, mimeType: string): void {
  downloadBlob(fileName, new Blob([text], { type: mimeType }));
}

/** Ouvre le sélecteur de fichiers et lit le fichier choisi ; null si l'utilisateur annule. */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      void file.text().then(resolve);
    });
    input.addEventListener("cancel", () => {
      resolve(null);
    });
    input.click();
  });
}
