import { FastifyInstance } from "fastify";
import knex from "knex";
import {z} from 'zod'
import {randomUUID} from 'crypto'

export async function transactionsRoutes(app:FastifyInstance) {
    app.get("/", async (request,reply) => {
       const createTransactionBodySchema=z.object({
        title:z.string(),
        amount:z.number(),
        type:z.enum(['credit','debit'])
       })

       //validating the request body with the defined schema and returning the properties with type. throw error if types are wrong
       const { title, amount, type }=createTransactionBodySchema.parse(request.body)

        await knex('transactions').insert({
            id:randomUUID(),
            title,
            amount: type==='credit' ? amount : amount*-1,
        })
        return reply.status(201).send()
      });

      
}