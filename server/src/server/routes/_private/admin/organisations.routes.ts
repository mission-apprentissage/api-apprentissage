import { conflict, notFound } from "@hapi/boom"
import type { Filter } from "mongodb"
import { MongoServerError, ObjectId } from "mongodb"
import { zRoutes } from "shared"
import type { IOrganisationInternal } from "shared/models/organisation.model"

import { deleteOrganisation } from "@/actions/organisations.actions.js"
import type { Server } from "@/server/server.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import { escapeRegExp } from "@/utils/regexUtils.js"

const DUPLICATE_KEY_ERROR_CODE = 11000

function getSlug(nom: string): string {
  return nom.toLowerCase().replace(/ /g, "-")
}

async function throwOrganisationConflict(nom: string, slug: string): Promise<never> {
  const existing = await getDbCollection("organisations").findOne({ $or: [{ nom }, { slug }] })

  throw conflict("Une organisation portant ce nom existe déjà", existing === null ? undefined : { id: existing._id.toString(), nom: existing.nom })
}

export const organisationAdminRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/admin/organisations",
    {
      schema: zRoutes.get["/_private/admin/organisations"],
      onRequest: [server.auth(zRoutes.get["/_private/admin/organisations"])],
    },
    async (request, response) => {
      const { q, habilitations } = request.query

      const filter: Filter<IOrganisationInternal> = {}

      if (q) {
        filter.nom = { $regex: escapeRegExp(q), $options: "i" }
      }

      if (habilitations && habilitations.length > 0) {
        filter.habilitations = { $in: habilitations }
      }

      const organisations = await getDbCollection("organisations").find(filter).toArray()

      return response.status(200).send(organisations)
    }
  )

  server.post(
    "/_private/admin/organisations",
    {
      schema: zRoutes.post["/_private/admin/organisations"],
      onRequest: [server.auth(zRoutes.post["/_private/admin/organisations"])],
    },
    async (request, response) => {
      const now = new Date()
      const { nom } = request.body
      const slug = getSlug(nom)

      const existing = await getDbCollection("organisations").findOne({ $or: [{ nom }, { slug }] })

      if (existing !== null) {
        await throwOrganisationConflict(nom, slug)
      }

      const organisation: IOrganisationInternal = {
        _id: new ObjectId(),
        nom,
        slug,
        habilitations: [],
        updated_at: now,
        created_at: now,
      }

      try {
        await getDbCollection("organisations").insertOne(organisation)
      } catch (error) {
        // Deux créations concurrentes du même nom : l'index unique tranche, on renvoie le même conflit
        if (error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR_CODE) {
          await throwOrganisationConflict(nom, slug)
        }

        throw error
      }

      return response.status(200).send(organisation)
    }
  )

  server.put(
    "/_private/admin/organisations/:id",
    {
      schema: zRoutes.put["/_private/admin/organisations/:id"],
      onRequest: [server.auth(zRoutes.put["/_private/admin/organisations/:id"])],
    },
    async (request, response) => {
      const now = new Date()

      const organisation = await getDbCollection("organisations").findOneAndUpdate(
        { _id: request.params.id },
        {
          $set: {
            ...request.body,
            updated_at: now,
          },
        },
        { returnDocument: "after" }
      )

      if (organisation === null) {
        throw notFound()
      }

      return response.status(200).send(organisation)
    }
  )

  server.delete(
    "/_private/admin/organisations/:id",
    {
      schema: zRoutes.delete["/_private/admin/organisations/:id"],
      onRequest: [server.auth(zRoutes.delete["/_private/admin/organisations/:id"])],
    },
    async (request, response) => {
      await deleteOrganisation(request.params.id)
      return response.status(200).send({ success: true })
    }
  )
}
