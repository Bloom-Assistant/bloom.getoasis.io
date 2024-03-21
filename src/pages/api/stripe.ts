import Clerk from '@clerk/clerk-sdk-node/esm/instance';
import Stripe from 'stripe';
import type { APIRoute } from "astro";
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const clerkClient = Clerk({ secretKey: '' });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  if (request === null) throw new Error(`Missing userId or request`, { cause: { request } })
  // Stripe sends this for us 🎉
  const stripeSignature = request.headers.get('stripe-signature')
  // If we don't get it, we can't do anything else!
  if (stripeSignature === null) throw new Error('stripeSignature is null')

  let event;

  try {
    event = stripe.webhooks.constructEvent(await request.text(), stripeSignature, webhookSecret || '')
  } catch (error) {
    if (error instanceof Error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // If we dont have the event, we can't do anything again
  if (event === undefined) throw new Error(`event is undefined`)
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
        console.log(`Payment successful for session ID: ${session.id}`);    // That's it? Yep, that's it. We love UX 🎉
        clerkClient.users.updateUserMetadata(event.data.object.metadata?.userId as string, {
          publicMetadata: {
            stripe: {
              status: session.status,
              // This is where we get "paid"
              payment: session.payment_status,
            },
          },
        });
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
  }  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}