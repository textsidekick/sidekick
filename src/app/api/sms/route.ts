import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString() || "";
    const question = body.trim();

    if (!question) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Hi! I'm Sidekick. Ask me anything!</Message></Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Test response - hardcoded for now
    const answer = "Employees park in Lot B behind the building. Visitor parking is in front.";

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>${answer}</Message></Response>`;
    
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (err: any) {
    console.error("SMS error:", err);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>Sorry, error occurred.</Message></Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  }
}
