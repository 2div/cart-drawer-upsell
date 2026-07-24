import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // Delete by shop so cleanup still runs if Shopify cannot load a matching session.
  await db.session.deleteMany({ where: { shop } });

  if (!session) {
    console.log(
      `No active session found for ${shop}; cleanup is already complete.`,
    );
  }

  return new Response();
};
