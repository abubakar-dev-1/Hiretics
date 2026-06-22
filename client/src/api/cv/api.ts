// Serverless CV flow: presign -> direct-to-S3 PUT -> (event-driven) AI scoring.
import { authHeaders } from "@/lib/auth";
import { resilientFetch } from "@/lib/http";

const SERVERLESS_API = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

// Upload a CV by requesting a presigned S3 URL, then PUTting the file directly
// to S3. The upload triggers the S3 -> SQS -> worker pipeline that scores it.
export async function uploadCV({ campaignId, file }: { campaignId: string; file: File }) {
  // 1) Ask the backend for a presigned upload URL (creates a Pending candidate).
  const presignRes = await resilientFetch(`${SERVERLESS_API}/candidates/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId }),
  });
  if (!presignRes.ok) {
    throw new Error("Failed to start upload");
  }
  const { uploadUrl, candidateId } = await presignRes.json();

  // 2) Upload the PDF straight to S3 (bypasses the backend).
  const putRes = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!putRes.ok) {
    throw new Error("Failed to upload CV");
  }

  return { candidateId };
}

// Ranked candidates for a campaign (highest AI score first). Auth required.
export async function getApplicants(campaignId: string) {
  const response = await resilientFetch(`${SERVERLESS_API}/campaigns/${campaignId}/candidates`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch applicants");
  }
  return response.json();
}
