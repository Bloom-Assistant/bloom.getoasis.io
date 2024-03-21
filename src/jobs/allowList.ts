import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "../trigger";
import { Stripe } from "@trigger.dev/stripe";
import Clerk from '@clerk/clerk-sdk-node/esm/instance';

const stripe = new Stripe({
  id: "stripe",
  apiKey: "sk_test_51Ow9oTJfa7ajJzhmlSSRiPAXFJTHnjF9f8l8sv7u1RpCBstfz00SnbvNqrluqle0HYoSvrpLHMBuJkwYSFrwTf4C00E8ffi5Lw"!,
});
// Your first job
// This Job will be triggered by an event, log a joke to the console, and then wait 5 seconds before logging the punchline.
client.defineJob({
  // This is the unique identifier for your Job, it must be unique across all Jobs in your project.
  id: "allow-list",
  name: "Allow List: Add user to allow list",
  version: "0.0.1",
  // This is triggered by an event using eventTrigger. You can also trigger Jobs with webhooks, on schedules, and more: https://trigger.dev/docs/documentation/concepts/triggers/introduction
  trigger: stripe.onCheckoutSessionCompleted(),
run: async (payload, io, ctx) => {
    // Use a Task to generate a random number. Using a Tasks means it only runs once.
    const clerkClient = Clerk({ secretKey: "sk_test_kzzE1nMNSBDNTcpcyi2b67nDqwdyqIVISTw2Yypeps" });
    const clientList = await clerkClient.clients.getClientList();

    const allowlistIdentifier = await clerkClient.allowlistIdentifiers.createAllowlistIdentifier({
            identifier: payload.metadata?.email as string,
            notify: false,
        });

    await io.logger.info(
        "✨ Congratulations, You just ran your first successful Trigger.dev Job! ✨"
    );
    // To learn how to write much more complex (and probably funnier) Jobs, check out our docs: https://trigger.dev/docs/documentation/guides/create-a-job
},
});
