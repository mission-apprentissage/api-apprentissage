import { internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import { renderFile } from "ejs";
import { omit } from "lodash-es";
import mjml from "mjml";
import type { SendMailOptions, SentMessageInfo, Transporter } from "nodemailer";
import { createTransport } from "nodemailer";
import { htmlToText } from "nodemailer-html-to-text";
import { zRoutes } from "shared";
import type { IEmailEvent } from "shared/models/email_event.model";
import type { ITemplate } from "shared/models/email_event/email_templates";
import { assertUnreachable } from "shared/utils/assertUnreachable";

import { addEmailError, createEmailEvent, isUnsubscribed, setEmailMessageId } from "@/actions/emails.actions.js";
import config from "@/config.js";
import logger from "@/services/logger.js";
import { generateAccessToken, generateScope } from "@/services/security/accessTokenService.js";
import { getStaticFilePath } from "@/utils/getStaticFilePath.js";
import { serializeEmailTemplate } from "@/utils/jwtUtils.js";

let transporter: Transporter<SentMessageInfo> | null = null;

export function closeMailer() {
  transporter?.close?.();
  transporter = null;
}

export function initMailer() {
  const settings = { ...config.smtp, secure: false };
  const needsAuthentication = !!settings.auth.user;
  // @ts-expect-error
  transporter = createTransport(needsAuthentication ? settings : omit(settings, ["auth"]));
  transporter?.use("compile", htmlToText());
}

function isTransactionalTemplate(template: ITemplate): boolean {
  switch (template.name) {
    case "register":
    case "magic-link":
    case "register-feedback":
    case "api-key-expiration-15-days":
    case "api-key-expiration-30-days":
      return true;
    default:
      assertUnreachable(template);
  }
}

async function sendEmailMessage(template: ITemplate, emailEvent: IEmailEvent | null): Promise<string | null> {
  const isTransactional = isTransactionalTemplate(template);
  if (!isTransactional && (await isUnsubscribed(template.to))) {
    return null;
  }

  if (!transporter) {
    throw internal("mailer is not initialised");
  }

  const list: SendMailOptions["list"] = {
    help: "https://mission-apprentissage.gitbook.io/general/les-services-en-devenir/accompagner-les-futurs-apprentis",
  };

  if (!isTransactional) {
    list.unsubscribe = getUnsubscribeActionLink(template);
  }

  const { messageId } = await transporter.sendMail({
    from: `${config.email_from} <${config.email}>`,
    to: template.to,
    subject: getEmailSubject(template),
    html: await renderEmail(template, emailEvent),
    list,
  });

  return messageId;
}

export async function sendEmail<T extends ITemplate>(template: T): Promise<void> {
  const emailEvent = await createEmailEvent(template);

  try {
    const messageId = await sendEmailMessage(template, emailEvent);
    if (messageId) {
      await setEmailMessageId(emailEvent, messageId);
    }
  } catch (err) {
    captureException(err);
    logger.error({ err, template: template.name }, "error sending email");
    await addEmailError(emailEvent, { type: "fatal", message: err.message });
  }
}

export function getEmailSubject<T extends ITemplate>(template: T): string {
  switch (template.name) {
    case "register":
      return "Vous avez demandé à recevoir un lien de connexion à l'espace développeurs La bonne alternance.";
    case "magic-link":
      return "Vous avez demandé à recevoir un lien de connexion à l'espace développeurs La bonne alternance.";
    case "register-feedback":
      return "Feedback de refus de création de compte";
    default:
      assertUnreachable(template);
  }
}

export function getPublicUrl(path: string) {
  return `${config.publicUrl}${path}`;
}

export function getApiPublicUrl(path: string) {
  return `${config.apiPublicUrl}${path}`;
}

function getPreviewActionLink(template: ITemplate) {
  return getApiPublicUrl(zRoutes.get["/_private/emails/preview"].path + `?data=${serializeEmailTemplate(template)}`);
}

function getUnsubscribeActionLink(template: ITemplate) {
  return getApiPublicUrl(
    zRoutes.get["/_private/emails/unsubscribe"].path + `?data=${serializeEmailTemplate(template)}`
  );
}

function getMarkAsOpenedActionLink(emailEvent: IEmailEvent | null) {
  if (!emailEvent) {
    return null;
  }

  // organisation is not needed for this token
  const token = generateAccessToken({ email: emailEvent.template.to, organisation: null }, [
    generateScope({ schema: zRoutes.get["/_private/emails/:id/markAsOpened"], options: "all", resources: {} }),
  ]);

  return getApiPublicUrl(
    zRoutes.get["/_private/emails/:id/markAsOpened"].path.replace(":id", emailEvent._id.toString()) + `?token=${token}`
  );
}

export async function renderEmail(template: ITemplate, emailEvent: IEmailEvent | null) {
  const isTransactional = isTransactionalTemplate(template);
  const templateFile = getStaticFilePath(`./emails/${template.name}.mjml.ejs`);

  const buffer = await renderFile(templateFile, {
    template,
    actions: {
      unsubscribe: isTransactional ? null : getUnsubscribeActionLink(template),
      preview: getPreviewActionLink(template),
      markAsOpened: getMarkAsOpenedActionLink(emailEvent),
    },
    utils: { getPublicUrl },
  });

  const { html } = mjml(buffer.toString(), { minify: true });
  return html;
}
