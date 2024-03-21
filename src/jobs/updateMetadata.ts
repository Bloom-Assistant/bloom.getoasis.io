import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "../trigger";
import { Stripe } from "@trigger.dev/stripe";
import 'dotenv/config';
import clerkClient, { createClerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe({
    id: "stripe",
    apiKey: import.meta.env.STRIPE_API_KEY!,
  });
  
const clerk = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY! });  

// Your first job
// This Job will be triggered by an event, log a joke to the console, and then wait 5 seconds before logging the punchline.
client.defineJob({
    // This is the unique identifier for your Job, it must be unique across all Jobs in your project.
    id: "update-metadata",
    name: "Update Metadata: Attach Stripe metadata to user",
    version: "0.0.1",
    // This is triggered by an event using eventTrigger. You can also trigger Jobs with webhooks, on schedules, and more: https://trigger.dev/docs/documentation/concepts/triggers/introduction
    trigger: stripe.onCustomerCreated(),
  run: async (payload, io, ctx) => {
      
      await clerkClient.users.updateUserMetadata(payload.id ,{
        publicMetadata: {
          stripeCustomerId: payload.id,
        },
      });
      await io.logger.info(
          "✨ Congratulations, You attached the public metadata! ✨"
      );
      // To learn how to write much more complex (and probably funnier) Jobs, check out our docs: https://trigger.dev/docs/documentation/guides/create-a-job
  },
  });