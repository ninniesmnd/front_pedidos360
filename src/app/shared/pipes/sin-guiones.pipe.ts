import { Pipe, PipeTransform } from '@angular/core';

// Textos legibles para valores con guion bajo (con tildes donde corresponde).
const ETIQUETAS: Record<string, string> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparación',
  LISTO_PARA_DESPACHO: 'Listo para despacho',
  EN_REPARTO: 'En reparto',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  DELIVERY: 'Delivery',
  RETIRO_EN_TIENDA: 'Retiro en tienda'
};

@Pipe({ name: 'sinGuiones' })
export class SinGuionesPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    if (ETIQUETAS[valor]) return ETIQUETAS[valor];

    // Respaldo para valores nuevos que aún no estén en el mapa.
    const texto = valor.replace(/_/g, ' ').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}