// ============================================================
// HUD LAYOUTS — Complete button layouts for 2/3/4 fingers
// Positions are % from left (x) and % from top (y) in
// landscape phone orientation. Consumed by Headshot Mode.
// ============================================================

import type { FingerCount } from './finger-profiles';

export interface HudButton {
  id: string;
  nameEs: string;
  x: number;           // % from left (0-100)
  y: number;           // % from top (0-100)
  size: number;         // % of screen width (20-100)
  transparency: number; // 0-100 (100 = fully visible)
  priority: 'critical' | 'high' | 'medium' | 'low';
  fingerEs: string;     // which finger uses this
  color: string;        // hex for SVG
}

export interface FingerRole {
  fingerEs: string;
  color: string;
  actionsEs: string[];
}

export interface HudLayout {
  fingers: FingerCount;
  nameEs: string;
  descriptionEs: string;
  fingerRoles: FingerRole[];
  buttons: HudButton[];
  proTipsEs: string[];
  mistakesEs: string[];
  transitionEs: string | null;
  adaptationDays: number;
}

// --- 2 FINGER HUD ---

const HUD_2_FINGERS: HudLayout = {
  fingers: 2,
  nameEs: 'Layout 2 Dedos (Pulgar)',
  descriptionEs: 'Ambos pulgares hacen todo. Simple, cómodo, ideal para empezar.',
  fingerRoles: [
    {
      fingerEs: 'Pulgar Izquierdo',
      color: '#3B82F6',
      actionsEs: ['Joystick', 'Correr', 'Saltar', 'Granada', 'Gloo Wall', 'Medikit', 'Mochila'],
    },
    {
      fingerEs: 'Pulgar Derecho',
      color: '#EF4444',
      actionsEs: ['Cámara/Apuntar', 'Disparar', 'Mira', 'Agacharse', 'Cambiar Arma', 'Recoger'],
    },
  ],
  buttons: [
    { id: 'joystick', nameEs: 'Joystick', x: 13, y: 73, size: 48, transparency: 70, priority: 'critical', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'jump', nameEs: 'Saltar', x: 26, y: 50, size: 40, transparency: 75, priority: 'high', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'gloo', nameEs: 'Gloo Wall', x: 8, y: 42, size: 38, transparency: 85, priority: 'high', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'grenade', nameEs: 'Granada', x: 5, y: 28, size: 32, transparency: 65, priority: 'medium', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'medikit', nameEs: 'Medikit', x: 5, y: 14, size: 30, transparency: 60, priority: 'low', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'backpack', nameEs: 'Mochila', x: 3, y: 4, size: 28, transparency: 55, priority: 'low', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'fire', nameEs: 'Disparar', x: 82, y: 58, size: 65, transparency: 60, priority: 'critical', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'scope', nameEs: 'Mira', x: 88, y: 36, size: 38, transparency: 75, priority: 'critical', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'crouch', nameEs: 'Agacharse', x: 74, y: 76, size: 35, transparency: 70, priority: 'high', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'weapon', nameEs: 'Cambiar Arma', x: 92, y: 18, size: 30, transparency: 65, priority: 'medium', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'reload', nameEs: 'Recargar', x: 70, y: 22, size: 28, transparency: 60, priority: 'medium', fingerEs: 'Pulgar Der', color: '#EF4444' },
  ],
  proTipsEs: [
    'Botón de Disparo donde tu pulgar derecho descansa naturalmente — no estires',
    'Gloo Wall en el lado OPUESTO al Disparo para evitar misclicks en clutch',
    'Botón de Disparo al 55-70% para drag headshots más fáciles con el pulgar',
    'Usa Vista Libre frecuentemente — es tu única forma de revisar alrededores',
    'FreeLook es CRÍTICO para 2 dedos — sin él estás ciego mientras te mueves',
  ],
  mistakesEs: [
    'Gloo Wall y Disparo del mismo lado (misclicks en pánico)',
    'Botón de Disparo muy pequeño (no puedes hacer drag con el pulgar)',
    'Demasiados botones cerca del joystick (presiones accidentales)',
    'No usar FreeLook (pierdes awareness total)',
  ],
  transitionEs: null,
  adaptationDays: 3,
};

// --- 3 FINGER HUD ---

const HUD_3_FINGERS: HudLayout = {
  fingers: 3,
  nameEs: 'Layout 3 Dedos (Competitivo)',
  descriptionEs: 'Dos pulgares + índice derecho. El estándar competitivo de Free Fire LATAM.',
  fingerRoles: [
    {
      fingerEs: 'Pulgar Izquierdo',
      color: '#3B82F6',
      actionsEs: ['Joystick', 'Medikit', 'Mochila', 'Granada/Habilidad', 'Gloo Wall'],
    },
    {
      fingerEs: 'Índice Derecho',
      color: '#10B981',
      actionsEs: ['Agacharse', 'Cambiar Arma', 'Recargar'],
    },
    {
      fingerEs: 'Pulgar Derecho',
      color: '#EF4444',
      actionsEs: ['Disparar', 'Saltar', 'Mira/ADS', 'Cámara'],
    },
  ],
  buttons: [
    { id: 'joystick', nameEs: 'Joystick', x: 13, y: 73, size: 44, transparency: 70, priority: 'critical', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'gloo', nameEs: 'Gloo Wall', x: 16, y: 52, size: 36, transparency: 85, priority: 'high', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'grenade', nameEs: 'Granada', x: 8, y: 30, size: 32, transparency: 65, priority: 'medium', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'medikit', nameEs: 'Medikit', x: 5, y: 42, size: 30, transparency: 60, priority: 'medium', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'backpack', nameEs: 'Mochila', x: 3, y: 10, size: 28, transparency: 55, priority: 'low', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'crouch', nameEs: 'Agacharse', x: 76, y: 7, size: 36, transparency: 75, priority: 'high', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'weapon', nameEs: 'Cambiar Arma', x: 90, y: 7, size: 30, transparency: 65, priority: 'medium', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'reload', nameEs: 'Recargar', x: 63, y: 7, size: 28, transparency: 60, priority: 'medium', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'fire', nameEs: 'Disparar', x: 82, y: 56, size: 55, transparency: 55, priority: 'critical', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'jump', nameEs: 'Saltar', x: 74, y: 38, size: 38, transparency: 70, priority: 'high', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'scope', nameEs: 'Mira', x: 90, y: 33, size: 36, transparency: 75, priority: 'critical', fingerEs: 'Pulgar Der', color: '#EF4444' },
  ],
  proTipsEs: [
    'Disparo + Saltar del MISMO LADO (derecho) — permite drag headshots mientras saltas',
    'Gloo Wall del lado IZQUIERDO — nunca junto al Disparo',
    'Índice derecho maneja los botones de arriba: agacharse, cambiar arma, recargar',
    'Practica 10-15 min diarios en Training Ground antes de Ranked',
    'Fire button al 48-60% — balance entre drag y visibilidad',
    'El 3 dedos es el más usado por pros de LATAM — no necesitas 4 para ser bueno',
  ],
  mistakesEs: [
    'Más de 2 botones críticos asignados al mismo dedo',
    'Botones muy juntos arriba (misclicks con el índice)',
    'Copiar el HUD de un pro sin ajustar a tu pantalla',
    'Poner Gloo Wall y Disparo del mismo lado',
  ],
  transitionEs: 'Si vienes de 2 dedos: mueve solo Agacharse arriba para tu índice. Mantén todo lo demás. Después de 1 semana, agrega Cambiar Arma.',
  adaptationDays: 14,
};

// --- 4 FINGER HUD ---

const HUD_4_FINGERS: HudLayout = {
  fingers: 4,
  nameEs: 'Layout 4 Dedos — Garra (Pro)',
  descriptionEs: 'Ambos pulgares + ambos índices. Control simultáneo máximo. Usado en torneos.',
  fingerRoles: [
    {
      fingerEs: 'Pulgar Izquierdo',
      color: '#3B82F6',
      actionsEs: ['Joystick', 'Habilidades'],
    },
    {
      fingerEs: 'Índice Izquierdo',
      color: '#F59E0B',
      actionsEs: ['Mira/ADS', 'Gloo Wall', 'Saltar'],
    },
    {
      fingerEs: 'Índice Derecho',
      color: '#10B981',
      actionsEs: ['Disparar', 'Agacharse', 'Recargar', 'Cambiar Arma'],
    },
    {
      fingerEs: 'Pulgar Derecho',
      color: '#EF4444',
      actionsEs: ['Cámara/Apuntar', 'Disparo Secundario', 'Tirarse'],
    },
  ],
  buttons: [
    { id: 'scope', nameEs: 'Mira/ADS', x: 12, y: 7, size: 38, transparency: 75, priority: 'critical', fingerEs: 'Índice Izq', color: '#F59E0B' },
    { id: 'gloo', nameEs: 'Gloo Wall', x: 28, y: 7, size: 36, transparency: 85, priority: 'high', fingerEs: 'Índice Izq', color: '#F59E0B' },
    { id: 'jump', nameEs: 'Saltar', x: 43, y: 7, size: 34, transparency: 70, priority: 'high', fingerEs: 'Índice Izq', color: '#F59E0B' },
    { id: 'fire', nameEs: 'Disparar', x: 83, y: 7, size: 50, transparency: 55, priority: 'critical', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'crouch', nameEs: 'Agacharse', x: 68, y: 7, size: 34, transparency: 70, priority: 'high', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'weapon', nameEs: 'Cambiar Arma', x: 57, y: 7, size: 28, transparency: 65, priority: 'medium', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'reload', nameEs: 'Recargar', x: 94, y: 7, size: 26, transparency: 60, priority: 'medium', fingerEs: 'Índice Der', color: '#10B981' },
    { id: 'joystick', nameEs: 'Joystick', x: 13, y: 73, size: 42, transparency: 70, priority: 'critical', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'grenade', nameEs: 'Granada', x: 8, y: 48, size: 30, transparency: 65, priority: 'medium', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'medikit', nameEs: 'Medikit', x: 25, y: 50, size: 28, transparency: 60, priority: 'low', fingerEs: 'Pulgar Izq', color: '#3B82F6' },
    { id: 'fire2', nameEs: 'Disparo (Izq)', x: 74, y: 64, size: 40, transparency: 50, priority: 'medium', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'prone', nameEs: 'Tirarse', x: 88, y: 74, size: 28, transparency: 55, priority: 'low', fingerEs: 'Pulgar Der', color: '#EF4444' },
    { id: 'backpack', nameEs: 'Mochila', x: 92, y: 54, size: 26, transparency: 55, priority: 'low', fingerEs: 'Pulgar Der', color: '#EF4444' },
  ],
  proTipsEs: [
    'Disparo en SUPERIOR DERECHA para el índice — NO abajo como en 2 dedos',
    'Mira en SUPERIOR IZQUIERDA — permite ADS + Disparo simultáneo',
    'Los 4 botones críticos en las 4 ESQUINAS para máximo control',
    'Activa Giroscopio (25-40) — 3er eje de control',
    'No más de 2 botones importantes por dedo',
    'Practica Jump+Crouch+Fire (la técnica de Two9) — solo posible con 4 dedos',
    'Fire button al 44-55% — el índice tiene más precisión que el pulgar',
    'Rendimiento CAE 20-30% la primera semana — es NORMAL, se recupera en semana 3',
  ],
  mistakesEs: [
    'Saturar un lado de la pantalla (toques accidentales)',
    'Botón de Disparo aún abajo a la derecha (debe estar ARRIBA)',
    'No distribuir acciones entre los 4 dedos',
    'Saltarse la etapa de 3 dedos (ve 2→3→4, no saltes)',
    'Rendirse después de la semana 1',
  ],
  transitionEs: 'Si vienes de 3 dedos: mueve SOLO el Disparo a esquina superior derecha. Practica 1 semana. Después mueve la Mira a superior izquierda.',
  adaptationDays: 28,
};

export const HUD_LAYOUTS: Record<FingerCount, HudLayout> = {
  2: HUD_2_FINGERS,
  3: HUD_3_FINGERS,
  4: HUD_4_FINGERS,
};

export function getHudLayout(fingers: FingerCount): HudLayout {
  return HUD_LAYOUTS[fingers];
}

export function getButtonsByFinger(layout: HudLayout, fingerEs: string): HudButton[] {
  return layout.buttons.filter((b) => b.fingerEs === fingerEs);
}

export function getCriticalButtons(layout: HudLayout): HudButton[] {
  return layout.buttons.filter((b) => b.priority === 'critical');
}
