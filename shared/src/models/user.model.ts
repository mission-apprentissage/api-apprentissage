import { zOrganisationHabilitation } from "api-alternance-sdk"
import type { Jsonify } from "type-fest"
import { z } from "zod/v4-mini"

import type { IModelDescriptorGeneric } from "./common.js"
import { zObjectIdMini } from "./common.js"

const collectionName = "users" as const

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ email: 1 }, { unique: true }],
  [
    {
      email: "text",
    },
    {
      name: "email_text",
      default_language: "french",
      collation: {
        locale: "simple",
        strength: 1,
      },
      weights: {
        email: 10,
      },
    },
  ],
  [{ "api_keys._id": 1 }, {}],
  [{ organisation: 1 }, {}],
]

export const zApiKeyEnv = z.enum(["production", "sandbox"])

export type IApiKeyEnv = z.output<typeof zApiKeyEnv>

export const zApiKey = z.object({
  _id: zObjectIdMini,
  name: z.nullable(z.string()),
  key: z.string(),
  env: zApiKeyEnv,
  last_used_at: z.nullable(z.date()),
  expires_at: z.date(),
  created_at: z.date(),
  expiration_warning_sent: z.nullable(z.enum(["30-days", "15-days"])),
})

export type IApiKey = z.output<typeof zApiKey>

export const zApiKeyPrivate = z.extend(z.omit(zApiKey, { key: true }), {
  value: z.nullable(z.string()),
  // Habilitations effectives de la clé, calculées côté serveur à partir du rôle réellement appliqué
  // à l'authentification (cf. getApiKeyHabilitations) : jamais recalculées côté client, qui
  // divergerait de la règle d'autorisation
  habilitations: z.array(zOrganisationHabilitation),
})

export type IApiKeyPrivate = z.output<typeof zApiKeyPrivate>
export type IApiKeyPrivateJson = Jsonify<IApiKeyPrivate>

const zStringTrimmed = z.string().check(z.trim())

const zStringTrimmedNullable = z.pipe(
  z.pipe(
    z.nullable(zStringTrimmed),
    z.transform((value) => value || null)
  ),
  z.nullable(zStringTrimmed.check(z.minLength(1)))
)

// Les schémas ci-dessous ne portent que des CLEFS de traduction (namespace i18n "global", cf.
// ui/app/i18n/locales/{fr,en}/global.json sous "errors"), jamais de texte final : `shared/` est
// consommé aussi bien par `server/` que par `ui/` et ne doit pas connaître la langue de la page.
// Charge à l'UI de résoudre `error.message` via `t(error.message)` avant affichage — les messages
// Zod génériques (non custom, ex. email invalide) passent inchangés dans ce `t()` : la locale
// zod (z.config) les a déjà résolus en texte final, et une clef introuvable renvoie sa valeur
// d'origine telle quelle (comportement par défaut de i18next).
export const USER_ERROR_KEYS = {
  requiredField: "errors.requiredField",
  selectOption: "errors.selectOption",
  otherTypeRequired: "errors.otherTypeRequired",
} as const

// Champ texte requis (non nullable), utilisé pour les champs devenus obligatoires
// à la saisie (formulaires) alors que la donnée en base reste nullable (utilisateurs existants).
export const zStringRequired = z.string({ error: USER_ERROR_KEYS.requiredField }).check(z.trim(), z.minLength(1, { error: USER_ERROR_KEYS.requiredField }))

// Requiert `other_type` non vide dès lors que `type` vaut "autre" (un `type` absent, ex. update
// partielle sans ce champ, n'est jamais considéré comme "autre" et ne déclenche donc pas la règle).
export function checkOtherType(data: { type?: string; other_type?: string | null }): boolean {
  return data.type !== "autre" || (typeof data.other_type === "string" && data.other_type.trim().length > 0)
}

export const zUser = z.object({
  _id: zObjectIdMini,
  organisation: z.nullable(z.string()),
  email: z.string().check(z.email(), z.toLowerCase()),
  prenom: zStringTrimmedNullable,
  nom: zStringTrimmedNullable,
  type: z.enum(["operateur_public", "organisme_formation", "entreprise", "editeur_logiciel", "apprenant", "autre"], {
    error: USER_ERROR_KEYS.selectOption,
  }),
  // Précision du profil, saisie uniquement quand `type` vaut "autre" (cf. checkOtherType).
  other_type: z.nullish(zStringTrimmed),
  description: zStringTrimmedNullable,
  cgu_accepted_at: z.date(),
  is_admin: z.boolean(),
  api_keys: z.array(zApiKey),
  updated_at: z.date(),
  created_at: z.date(),
})

export const zUserCreate = z.pick(zUser, {
  email: true,
  is_admin: true,
})

export const zUserPublic = z.object({
  _id: zObjectIdMini,
  email: zUser.shape.email,
  organisation: z.nullable(z.string()),
  is_admin: zUser.shape.is_admin,
  has_api_key: z.boolean(),
  api_key_used_at: z.nullable(z.date()),
  updated_at: zUser.shape.updated_at,
  created_at: zUser.shape.created_at,
})

export const zUserAdminView = z.extend(
  z.pick(zUser, {
    _id: true,
    email: true,
    prenom: true,
    nom: true,
    organisation: true,
    is_admin: true,
    type: true,
    other_type: true,
    description: true,
    cgu_accepted_at: true,
    updated_at: true,
    created_at: true,
  }),
  {
    api_keys: z.array(z.omit(zApiKey, { key: true })),
  }
)

export const zUserAdminUpdate = z
  .extend(
    z.partial(
      z.pick(zUser, {
        email: true,
        is_admin: true,
        organisation: true,
        type: true,
        other_type: true,
      })
    ),
    {
      prenom: zStringRequired,
      nom: zStringRequired,
    }
  )
  .check(
    z.refine(checkOtherType, {
      error: USER_ERROR_KEYS.otherTypeRequired,
      path: ["other_type"],
    })
  )

export type IUser = z.output<typeof zUser>
export type IUserPublic = Jsonify<z.output<typeof zUserPublic>>
export type IUserCreate = Jsonify<z.output<typeof zUserCreate>>
export type IUserAdminView = z.output<typeof zUserAdminView>
export type IUserAdminUpdate = z.output<typeof zUserAdminUpdate>

export function toPublicUser(user: IUser): z.output<typeof zUserPublic> {
  return zUserPublic.parse({
    _id: user._id,
    email: user.email,
    organisation: user.organisation,
    is_admin: user.is_admin,
    has_api_key: user.api_keys.length > 0,
    api_key_used_at: user.api_keys.reduce<Date | null>((acc, key) => {
      if (acc === null) return key.last_used_at
      if (key.last_used_at === null) return acc
      return acc.getTime() > key.last_used_at.getTime() ? acc : key.last_used_at
    }, null),
    updated_at: user.updated_at,
    created_at: user.created_at,
  })
}

export default {
  zod: zUser,
  indexes,
  collectionName,
}
