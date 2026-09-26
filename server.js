import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import DataLoader from "dataloader";
import { db } from "./database.js";

// Esquema GraphQL (schema-first): un solo grafo de clientes y sus facturas.
const typeDefs = `#graphql
  type Factura {
    id: ID!
    monto: Float!
    estado: String!
  }

  type Cliente {
    id: ID!
    nombre: String!
    sector: String!
    facturas: [Factura!]!
  }

  type Query {
    """Antes: 1 lectura de clientes + 1 lectura de facturas por cada cliente (N+1)."""
    clientes: [Cliente!]!

    """Después: 1 lectura de clientes + 1 sola lectura en lote de todas las facturas."""
    clientesOptimizado: [Cliente!]!
  }
`;

// Un DataLoader nuevo por petición HTTP. Así el caché no se comparte entre usuarios.
function crearLoaders() {
  return {
    facturasPorCliente: new DataLoader((clienteIds) =>
      db.fetchFacturasByClienteIdsBatch(clienteIds)
    ),
  };
}

const resolvers = {
  Query: {
    clientes: async () => {
      console.log("\n----- ANTES: sin DataLoader (problema N+1) -----");
      const clientes = await db.fetchAllClientes();
      return clientes.map((cliente) => ({ ...cliente, usarDataLoader: false }));
    },
    clientesOptimizado: async () => {
      console.log("\n----- DESPUES: con DataLoader (un solo lote) -----");
      const clientes = await db.fetchAllClientes();
      return clientes.map((cliente) => ({ ...cliente, usarDataLoader: true }));
    },
  },
  Cliente: {
    facturas: (cliente, _args, context) => {
      if (cliente.usarDataLoader) {      
        return context.loaders.facturasPorCliente.load(cliente.id);
      }     
      return db.fetchFacturasByClienteId(cliente.id);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => ({
    loaders: crearLoaders(),
  }),
});

console.log(`Servidor listo en: ${url}`);
console.log("Abre esa URL y ejecuta las consultas clientes y clientesOptimizado.");
