//PRODUCCION

export const environment = {
  production: true,
  apiBaseUrl: 'https://52.71.213.234:8080', // ajustá si el backend en prod usa otro host/puerto
  msal: {
    clientId: '16ad8d4e-5e08-4308-bf95-7f1d30c55b4b',
    tenantId: '1b185538-3c99-4453-8c77-b86e78fa3157',
    redirectUri: 'https://52.71.213.234',
    apiScopes: [
      'api://df568017-6273-43a4-85b0-6460a4950d2d/Pedidos.ReadWrite',
      'api://df568017-6273-43a4-85b0-6460a4950d2d/Ventas.ReadWrite'
    ]
  }
};