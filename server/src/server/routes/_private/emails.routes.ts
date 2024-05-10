import Boom from "@hapi/boom";
import { zRoutes } from "shared";
import { IEmailError } from "shared/models/email_event.model";

import { markEmailAsDelivered, markEmailAsFailed, markEmailAsOpened, unsubscribe } from "@/actions/emails.actions";
import config from "@/config";
import { Server } from "@/server/server";
import { renderEmail } from "@/services/mailer/mailer";
import { deserializeEmailTemplate } from "@/utils/jwtUtils";

export const emailsRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/emails/preview",
    {
      schema: zRoutes.get["/_private/emails/preview"],
    },
    async (request, response) => {
      const template = deserializeEmailTemplate(request.query.data);
      // No need to set markAsOpenedActionLink as the email as already be openned
      const html = await renderEmail(template, null);
      return response
        .header("Content-Type", "text/html")
        .status(200)
        .send(Buffer.from(html as string));
    }
  );

  server.get(
    "/_private/emails/:id/markAsOpened",
    {
      schema: zRoutes.get["/_private/emails/:id/markAsOpened"],
      onRequest: [server.auth(zRoutes.get["/_private/emails/:id/markAsOpened"])],
    },
    async (request, response) => {
      await markEmailAsOpened(request.params.id);

      return response
        .header("Content-Type", "image/gif")
        .status(200)
        .send(Buffer.from("R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64"));
    }
  );

  server.get(
    "/_private/emails/unsubscribe",
    {
      schema: zRoutes.get["/_private/emails/unsubscribe"],
    },
    async (request, response) => {
      const template = deserializeEmailTemplate(request.query.data);

      await unsubscribe(template.to);

      return response
        .header("Content-Type", "text/html")
        .status(200)
        .send(
          Buffer.from(
            `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Désinscription</title>
                </head>
                <body>
                    <div class="sib-container rounded ui-sortable" style="position: relative; max-width: 540px; margin: 0px auto; text-align: left; background: rgb(252, 252, 252); padding: 40px 20px 20px; line-height: 150%; border-radius: 4px; border-width: 0px !important; border-color: transparent !important;">
                        <div class="header" style="padding: 0px 20px;">
                            <h1 class="title editable" data-editfield="newsletter_name" contenteditable="true" style="font-weight: normal; text-align: center; font-size: 25px; margin-bottom: 5px; padding: 0px; margin-top: 0px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: rgb(35, 35, 35);">Désinscription</h1>
                        </div>
                         <div class="innercontainer rounded2 email-wrapper" style="border-radius: 10px; padding: 10px; background: rgb(241, 241, 241);">
                            <div class="description editable" data-editfield="newsletter_description" contenteditable="true" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: rgb(52, 52, 52); padding: 0px 20px 15px; text-align: center">Vous êtes désinscrit.</div>
                        </div>
                    </div>
            
                </body>
            </html>
            `
          )
        );
    }
  );

  server.post(
    "/_private/emails/webhook",
    {
      schema: zRoutes.post["/_private/emails/webhook"],
    },
    async (request, response) => {
      const { webhookKey } = request.query;

      if (config.smtp.webhookKey !== webhookKey) {
        throw Boom.forbidden("Non autorisé");
      }

      const { event, "message-id": messageId } = request.body;

      if (event === "delivered") {
        markEmailAsDelivered(messageId);
      } else {
        markEmailAsFailed(messageId, event as IEmailError["type"]);
      }

      return response.status(200).send();
    }
  );
};
