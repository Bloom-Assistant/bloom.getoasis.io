import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "../trigger";
import { Stripe } from "@trigger.dev/stripe";
import 'dotenv/config';
const api = await import('api');
const sdk = api.default('@airbyte-api/v1#4vsz8clinemryl');

const stripe = new Stripe({
    id: "stripe",
    apiKey: import.meta.env.STRIPE_API_KEY!,
  });
// Your first job
// This Job will be triggered by an event, log a joke to the console, and then wait 5 seconds before logging the punchline.
client.defineJob({
    // This is the unique identifier for your Job, it must be unique across all Jobs in your project.
    id: "create-airbyte-workspace",
    name: "Create Airbyte Workspace: Create an airbyte workspace for the user's domain",
    version: "0.0.1",
    // This is triggered by an event using eventTrigger. You can also trigger Jobs with webhooks, on schedules, and more: https://trigger.dev/docs/documentation/concepts/triggers/introduction
    trigger: stripe.onCustomerCreated(),
  run: async (payload, io, ctx) => {

    function getDomainFromEmail(payload: any) {
      // Split the email address by '@'
        // Check if payload and payload.email are defined
        if (!payload || !payload.email) {
          // If not, return an empty string or a default value
          return '';
        }

        // Split the email address by '@'
        const emailParts = payload.email.split('@');

        // Check if the email address has an '@' symbol
        if (emailParts.length !== 2) {
          // If not, return the original email address or a default value
          return payload.email;
        }

        // Get the domain by taking the last part after '@'
        const domain = emailParts.pop();

        return domain;
      }
      
     const response = await io.runTask('create-airbyte-workspace', 
     async () => {
      sdk.auth('eyJhbGciOiJSUzI1NiIsImtpZCI6IjU2YzkxNzFjLTg5ZWMtNGM3NS1hZDBmLWFiNDg0MDAzZDRmYiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiY2xhazFzdTU5MDAwMDNiNmNqNW1tcWc4dSJdLCJjdXN0b21lcl9pZCI6IjlhM2NlOTA1LTU3YmYtNDFjOS1iNGQ5LWE5NzE0OTFkNDQ4NyIsImVtYWlsIjoiamFtZXNAZ2V0b2FzaXMuaW8iLCJlbWFpbF92ZXJpZmllZCI6InRydWUiLCJleHAiOjI1MzQwMjIxNDQwMCwiaWF0IjoxNzEwOTA2OTY4LCJpc3MiOiJodHRwczovL2FwcC5zcGVha2Vhc3lhcGkuZGV2L3YxL2F1dGgvb2F1dGgvY2xhazFzdTU5MDAwMDNiNmNqNW1tcWc4dSIsImp0aSI6IjU2YzkxNzFjLTg5ZWMtNGM3NS1hZDBmLWFiNDg0MDAzZDRmYiIsImtpZCI6IjU2YzkxNzFjLTg5ZWMtNGM3NS1hZDBmLWFiNDg0MDAzZDRmYiIsIm5iZiI6MTcxMDkwNjkwOCwic3BlYWtlYXN5X2N1c3RvbWVyX2lkIjoiWDRyUUtWYTA2Z1kxUHNkREl1bFU2OG9UbGxnMiIsInNwZWFrZWFzeV93b3Jrc3BhY2VfaWQiOiJjbGFrMXN1NTkwMDAwM2I2Y2o1bW1xZzh1Iiwic3ViIjoiWDRyUUtWYTA2Z1kxUHNkREl1bFU2OG9UbGxnMiIsInVzZXJfaWQiOiJYNHJRS1ZhMDZnWTFQc2RESXVsVTY4b1RsbGcyIn0.ciS9N1ykHrlzmRVlZbzSe5k3bAOya4tbjQAmz9daWC2MgMK1ssFmdGJ9xoN6KieHd5lWJ6GH3XXJ1_n3mmAEg2WBpA1f9wDGjX3DvYd80jMmobEZX1MGKvzPMM8QY-htQYsAhBg-18f5jCxVBSvM8FlQhHRmq5SFH97IZox1RcbP-v0vr58ymP0-WMOoFsncKkUGFr6MhON5Gi_U-FDooifUfzZ-wGDjtnAKWfJ59b2UaysyQ4y0ysppq6SPUHwAt75BQMmDTxevOFazT3JIl_St1oXHDybHVrBn7Xm4Gz7fFX-BP4_xIRHw0dBC4tacs0GQ9MuzSAbvUVg3rCCXaA');
      return await sdk.createWorkspace({name: getDomainFromEmail(payload)});
    }
    );
    await io.logger.info(
        "✨ Congratulations, you deployed a airbyte workspace! ✨"
    );
    return response;
      
      // To learn how to write much more complex (and probably funnier) Jobs, check out our docs: https://trigger.dev/docs/documentation/guides/create-a-job
    },
  });