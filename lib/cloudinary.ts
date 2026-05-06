type UploadFolder = "id-proofs" | "pg-photos";

async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, filename: file.name, folder }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.url as string;
}

export function uploadIdProof(file: File): Promise<string> {
  return uploadImage(file, "id-proofs");
}

export function uploadPGPhoto(file: File): Promise<string> {
  return uploadImage(file, "pg-photos");
}
