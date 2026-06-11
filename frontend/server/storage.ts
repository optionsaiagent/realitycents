// Stub for type inference only (frontend build)
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  return { key: relKey, url: "" };
}
