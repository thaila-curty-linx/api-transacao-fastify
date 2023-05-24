import fastify from "fastify";
import crypto from "node:crypto";
import { knex } from "./database";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(transactionsRoutes,{prefix:'transactions'})



app.listen({ port: env.PORT }).then(() => {
  console.log("http server running");
});
