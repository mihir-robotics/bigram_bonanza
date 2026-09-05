export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type ReadTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export function validateUploadFile(file: File): string | null {
  if (file.size === 0) {
    return "The selected file is empty. Choose a non-empty .txt file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File too large. Split the corpus or use a file under 5 MB.";
  }
  const type = file.type;
  if (type && type !== "text/plain" && !file.name.endsWith(".txt")) {
    return "Please upload a plain text (.txt) file.";
  }
  return null;
}

export function readFileAsText(file: File): Promise<ReadTextResult> {
  const validation = validateUploadFile(file);
  if (validation) {
    return Promise.resolve({ ok: false, error: validation });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (text.length === 0) {
        resolve({
          ok: false,
          error: "No valid characters. The file appears empty after reading.",
        });
        return;
      }
      resolve({ ok: true, text });
    };
    reader.onerror = () => {
      resolve({
        ok: false,
        error: "Could not read the file. Try selecting it again.",
      });
    };
    reader.readAsText(file);
  });
}
