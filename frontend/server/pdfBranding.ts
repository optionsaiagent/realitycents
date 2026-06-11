// Stub for type inference only (frontend build)
export async function brandPdf(opts: {
  pdfUrl: string;
  agentName: string;
  brokerage: string;
  logoUrl: string | null;
}): Promise<Uint8Array> {
  return new Uint8Array();
}
