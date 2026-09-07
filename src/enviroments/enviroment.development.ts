//DESARROLLO

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  msal: {
    clientId: '16ad8d4e-5e08-4308-bf95-7f1d30c55b4b',
    tenantId: '1b185538-3c99-4453-8c77-b86e78fa3157',
    redirectUri: 'http://localhost:4200',
    apiScopes: [
      'api://df568017-6273-43a4-85b0-6460a4950d2d/Pedidos.ReadWrite',
      'api://df568017-6273-43a4-85b0-6460a4950d2d/Ventas.ReadWrite'
    ]
  }
};