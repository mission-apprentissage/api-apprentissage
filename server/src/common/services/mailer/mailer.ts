import { internal } from "@hapi/boom";
import { captureException } from "@sentry/node";
import ejs from "ejs";
import { omit } from "lodash-es";
import mjml from "mjml";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { htmlToText } from "nodemailer-html-to-text";
import { zRoutes } from "shared";
import { IEmailEvent } from "shared/models/email_event.model";
import { ITemplate } from "shared/models/email_event/email_templates";
import { assertUnreachable } from "shared/utils/assertUnreachable";

import config from "@/config";

import {
  addEmailError,
  createEmailEvent,
  isUnsubscribed,
  setEmailMessageId,
} from "../../../modules/actions/emails.actions";
import { generateAccessToken, generateScope } from "../../../security/accessTokenService";
import logger from "../../logger";
import { getStaticFilePath } from "../../utils/getStaticFilePath";
import { serializeEmailTemplate } from "../../utils/jwtUtils";

let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

export function closeMailer() {
  transporter?.close?.();
  transporter = null;
}

export function initMailer() {
  const settings = { ...config.smtp, secure: false };
  const needsAuthentication = !!settings.auth.user;
  // @ts-expect-error
  transporter = nodemailer.createTransport(needsAuthentication ? settings : omit(settings, ["auth"]));
  transporter.use("compile", htmlToText());
}

async function sendEmailMessage(template: ITemplate, emailEvent: IEmailEvent | null): Promise<string | null> {
  if (await isUnsubscribed(template.to)) {
    return null;
  }
  if (!transporter) {
    throw internal("mailer is not initialised");
  }

  const { messageId } = await transporter.sendMail({
    from: `${config.email_from} <${config.email}>`,
    to: template.to,
    subject: getEmailSubject(template),
    html: await renderEmail(template, emailEvent),
    list: {
      help: "https://mission-apprentissage.gitbook.io/general/les-services-en-devenir/accompagner-les-futurs-apprentis", // TODO [metier/tech]
      unsubscribe: getUnsubscribeActionLink(template),
    },
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
    await addEmailError(emailEvent, {
      type: "fatal",
      message: err.message,
    });
  }
}

export function getEmailSubject<T extends ITemplate>(template: T): string {
  switch (template.name) {
    case "reset_password":
      return "Réinitialisation du mot de passe";
    default:
      assertUnreachable(template.name);
  }
}

export function getPublicUrl(path: string) {
  return `${config.publicUrl}${path}`;
}

function getPreviewActionLink(template: ITemplate) {
  return getPublicUrl(`/api/emails/preview?data=${serializeEmailTemplate(template)}`);
}

function getUnsubscribeActionLink(template: ITemplate) {
  return getPublicUrl(`/api/emails/unsubscribe?data=${serializeEmailTemplate(template)}`);
}

function getMarkAsOpenedActionLink(emailEvent: IEmailEvent | null) {
  if (!emailEvent) {
    return null;
  }

  const token = generateAccessToken({ email: emailEvent.template.to }, [
    generateScope({
      schema: zRoutes.get["/emails/:id/markAsOpened"],
      options: "all",
      resources: {},
    }),
  ]);

  return getPublicUrl(`/api/emails/${emailEvent._id.toString()}/markAsOpened?token=${token}`);
}

export async function renderEmail(template: ITemplate, emailEvent: IEmailEvent | null) {
  const templateFile = getStaticFilePath(`./emails/${template.name}.mjml.ejs`);

  const buffer = await ejs.renderFile(templateFile, {
    template,
    actions: {
      unsubscribe: getUnsubscribeActionLink(template),
      preview: getPreviewActionLink(template),
      markAsOpened: getMarkAsOpenedActionLink(emailEvent),
    },
    utils: { getPublicUrl },
  });

  const { html } = mjml(buffer.toString(), { minify: true });
  return html;
}
