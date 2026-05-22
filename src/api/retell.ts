// ============================================================
// NEXUS AI — Retell API Client
// Calls the Retell backend to create a web call access token
// ============================================================

const RETELL_API_BASE = 'https://api.retellai.com';

interface CreateWebCallResponse {
  access_token: string;
  call_id?: string;
}

/**
 * Request an access token from Retell AI to start a web call.
 * This calls POST /v2/create-web-call with the agent_id.
 * The VITE_RETELL_API_KEY is used as a Bearer token for authentication.
 */
export async function getAccessToken(agentId: string): Promise<string> {
  const apiKey = import.meta.env.VITE_RETELL_API_KEY;

  if (!apiKey) {
    throw new Error(
      'VITE_RETELL_API_KEY is not set. Please copy .env.example to .env and fill in your credentials.'
    );
  }

  if (!agentId) {
    throw new Error(
      'VITE_RETELL_AGENT_ID is not set. Please copy .env.example to .env and fill in your agent ID.'
    );
  }

  const response = await fetch(`${RETELL_API_BASE}/v2/create-web-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ agent_id: agentId }),
  });

  if (!response.ok) {
    let errorMessage = `Retell API error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) errorMessage = `Retell API: ${errorBody.message}`;
      if (errorBody?.error) errorMessage = `Retell API: ${errorBody.error}`;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  const data: CreateWebCallResponse = await response.json();

  if (!data.access_token) {
    throw new Error('Retell API returned no access_token. Check your agent_id and API key.');
  }

  return data.access_token;
}
