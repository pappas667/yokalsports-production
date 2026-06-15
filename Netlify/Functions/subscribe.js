export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, market } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      'https://api.beehiiv.com/v2/publications/037c3aba-6dae-4af3-980e-dfae9b170e62/subscriptions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Netlify.env.get('BEEHIIV_API_KEY')}`
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: market || 'yokalsports',
          utm_medium: 'website',
          utm_campaign: 'yssr-subscribe'
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/subscribe'
};
