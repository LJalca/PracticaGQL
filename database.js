
// Datos crudos en memoria (Mock Data)
const CLIENTES_RECORDS = [
    { id: "c-1", nombre: "Corporación Alfa", sector: "Finanzas" },
    { id: "c-2", nombre: "Logística Beta", sector: "Transporte" },
    { id: "c-3", nombre: "Industrias Gamma", sector: "Manufactura" },
    { id: "c-4", nombre: "Tecnología Delta", sector: "Educación" },
    { id: "c-5", nombre: "Retail Epsilon", sector: "Comercio" }
];

const FACTURAS_RECORDS = [
    { id: "f-101", clienteId: "c-1", monto: 1500.00, estado: "PAGADA" },
    { id: "f-102", clienteId: "c-1", monto: 2300.50, estado: "PENDIENTE" },
    { id: "f-103", clienteId: "c-2", monto: 450.00,  estado: "PAGADA" },
    { id: "f-104", clienteId: "c-3", monto: 8900.00, estado: "PAGADA" },
    { id: "f-105", clienteId: "c-3", monto: 1200.00, estado: "ANULADA" },
    { id: "f-106", clienteId: "c-4", monto: 350.00,  estado: "PAGADA" },
    // El cliente 5 ('c-5') deliberadamente no tiene facturas para evaluar robustez del código
];

// Helper para simular latencia de red (200ms por viaje de datos)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
    /**
     * Recupera todos los clientes de la base de datos (1 sola operación de lectura)
     */
    async fetchAllClientes() {
        console.log("\x1b[36m%s\x1b[0m", "[DB READ] SELECT * FROM clientes; (Buscando catálogo completo)");
        await delay(200); 
        return [...CLIENTES_RECORDS];
    },

    /**
     * Recupera las facturas de un cliente específico.
     */
    async fetchFacturasByClienteId(clienteId) {
        console.log("\x1b[31m%s\x1b[0m", `[DB READ] SELECT * FROM facturas WHERE cliente_id = '${clienteId}';`);
        await delay(200);
        return FACTURAS_RECORDS.filter(factura => factura.clienteId === clienteId);
    },

    /**
     * FUNCIÓN OPTIMIZADA PARA EL DATALOADER
     */
    async fetchFacturasByClienteIdsBatch(clienteIds) {
        console.log("\x1b[32m%s\x1b[0m", `[DB BATCH READ] SELECT * FROM facturas WHERE cliente_id IN (${clienteIds.map(id => `'${id}'`).join(", ")});`);
        await delay(200); 
        
        // Retorna un arreglo mapeado donde cada índice corresponde estrictamente a las llaves solicitadas 
        return clienteIds.map(id => 
            FACTURAS_RECORDS.filter(factura => factura.clienteId === id)
        );
    }
};
