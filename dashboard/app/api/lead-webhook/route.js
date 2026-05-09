export async function POST(request) {
  try {
    const body = await request.json();
    const targetWebhookUrl =
      body.webhookUrl ||
      process.env.N8N_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    if (!targetWebhookUrl) {
      return Response.json(
        { error: 'Missing n8n webhook URL. Set N8N_WEBHOOK_URL or NEXT_PUBLIC_N8N_WEBHOOK_URL.' },
        { status: 400 }
      );
    }

    const targetUrl = new URL(targetWebhookUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body.lead)
    });

    const responseText = await response.text();

    if (!response.ok) {
      return Response.json(
        {
          error: `n8n returned ${response.status}`,
          details: responseText
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      n8nStatus: response.status
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message || 'Failed to forward lead to n8n'
      },
      { status: 500 }
    );
  }
}
