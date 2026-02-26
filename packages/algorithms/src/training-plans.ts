// ============================================================
// TRAINING PLANS — 7-day personalized plans per finger count
// Consumed by Headshot Mode training section.
// ============================================================

import type { FingerCount } from './finger-profiles';

// --- TYPES ---

export interface TrainingExercise {
  id: string;
  nameEs: string;
  descriptionEs: string;
  weaponEs: string;
  reps: number;
  timerSeconds: number;
  tipEs: string;
  focusEs: string;
}

export interface TrainingDay {
  day: number;
  titleEs: string;
  summaryEs: string;
  exercises: TrainingExercise[];
  challengeEs: string | null;
  motivationEs: string;
}

export interface TrainingPlanData {
  fingers: FingerCount;
  nameEs: string;
  subtitleEs: string;
  introEs: string;
  warningEs: string | null;
  days: TrainingDay[];
  completionMessageEs: string;
}

// ==========================================
// PLAN 2 DEDOS — "De Pulgar a Pro"
// ==========================================

const PLAN_2_FINGERS: TrainingPlanData = {
  fingers: 2,
  nameEs: 'De Pulgar a Pro',
  subtitleEs: '7 días para dominar el Vertical Drag con 2 dedos',
  introEs: 'Este plan te convierte en letal con solo 2 pulgares. Cada día entrenas una habilidad específica que se acumula. Al final de la semana, tus headshots van a ser consistentes.',
  warningEs: null,
  days: [
    {
      day: 1,
      titleEs: 'Vertical Drag Básico',
      summaryEs: 'Aprende el movimiento fundamental: arrastrar recto hacia arriba.',
      exercises: [
        {
          id: '2d1e1',
          nameEs: 'Drag en estáticos',
          descriptionEs: 'En Training Ground, párate frente a un muñeco. Apunta al pecho y arrastra el botón de disparo RECTO HACIA ARRIBA hasta la cabeza. Repite hasta que el movimiento sea natural.',
          weaponEs: 'M1887',
          reps: 50,
          timerSeconds: 600,
          tipEs: 'No te apures. Cada drag debe ser suave y controlado, no brusco.',
          focusEs: 'Memoria muscular del drag vertical',
        },
        {
          id: '2d1e2',
          nameEs: 'Cambio de arma + drag',
          descriptionEs: 'Ahora alterna entre M1887 y MP40. La M1887 es un solo tiro (snap), la MP40 es spray (drag continuo). Siente la diferencia.',
          weaponEs: 'M1887 / MP40',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'M1887 = snap rápido. MP40 = drag suave y sostenido.',
          focusEs: 'Adaptación del drag a diferentes armas',
        },
      ],
      challengeEs: null,
      motivationEs: 'El camino de mil headshots empieza con un drag.',
    },
    {
      day: 2,
      titleEs: 'Velocidad de Drag',
      summaryEs: 'Aumenta la velocidad de tu drag sin perder precisión.',
      exercises: [
        {
          id: '2d2e1',
          nameEs: 'Drag cronometrado',
          descriptionEs: '50 tiros con MP40. Intenta hacer headshot en cada uno. Mide cuántos consigues de 50.',
          weaponEs: 'MP40',
          reps: 50,
          timerSeconds: 900,
          tipEs: 'Si sacas menos de 15/50, baja tu General en 5 puntos y repite.',
          focusEs: 'Velocidad + consistencia',
        },
        {
          id: '2d2e2',
          nameEs: 'One-tap con escopeta',
          descriptionEs: 'Practica el snap headshot con M1887. Un tiro, una cabeza. Si fallas, reposiciona y repite.',
          weaponEs: 'M1887',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'Pre-apunta a la altura del cuello. El drag solo sube unos centímetros.',
          focusEs: 'Snap precision con escopeta',
        },
      ],
      challengeEs: 'Desafío: 5 headshots SEGUIDOS con M1887 sin fallar',
      motivationEs: 'La sensibilidad es 20%, el entrenamiento es 80%. — Two9',
    },
    {
      day: 3,
      titleEs: 'Drag en Movimiento',
      summaryEs: 'Aprende a hacer drag mientras te mueves (caminando, no quieto).',
      exercises: [
        {
          id: '2d3e1',
          nameEs: 'Caminar + Drag',
          descriptionEs: 'Muévete hacia los muñecos mientras haces drag. El reto es coordinar el joystick izquierdo con el drag derecho.',
          weaponEs: 'SCAR',
          reps: 40,
          timerSeconds: 900,
          tipEs: 'No pares de moverte. En partida real NUNCA estás quieto.',
          focusEs: 'Coordinación movimiento + drag',
        },
        {
          id: '2d3e2',
          nameEs: 'Desert Eagle Flicks',
          descriptionEs: 'La Desert Eagle tiene poco retroceso y daño alto. Practica flick shots rápidos a la cabeza.',
          weaponEs: 'Desert Eagle',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'Apunta al pecho, flick up, dispara. Un movimiento.',
          focusEs: 'Flick shots con pistola',
        },
      ],
      challengeEs: null,
      motivationEs: 'Un jugador que se mueve y hace headshots es imparable.',
    },
    {
      day: 4,
      titleEs: 'Rotation Drag (J-Drag)',
      summaryEs: 'Aprende el segundo drag: el movimiento en J para combate cercano lateral.',
      exercises: [
        {
          id: '2d4e1',
          nameEs: 'J-Drag básico',
          descriptionEs: 'Posiciónate a un lado del muñeco (no enfrente). Arrastra primero HACIA él y luego SUBE. Forma una J con tu pulgar.',
          weaponEs: 'M1887',
          reps: 40,
          timerSeconds: 900,
          tipEs: 'La J debe ser fluida, no dos movimientos separados. Es una curva.',
          focusEs: 'Rotation Drag para combate lateral',
        },
        {
          id: '2d4e2',
          nameEs: 'Alternar Vertical + J-Drag',
          descriptionEs: 'Alterna entre enemigo enfrente (Vertical) y enemigo al lado (J-Drag). Tu cerebro debe elegir automáticamente.',
          weaponEs: 'MP40 / M1887',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'Enemigo enfrente = Vertical. Enemigo al lado = J-Drag. Hazlo instintivo.',
          focusEs: 'Decisión automática de técnica',
        },
      ],
      challengeEs: 'Desafío: 3 J-Drag headshots seguidos con M1887',
      motivationEs: 'El J-Drag es la escopeta de los que saben.',
    },
    {
      day: 5,
      titleEs: 'Clash Squad (Práctica Real)',
      summaryEs: 'Primer día en partida real. Aplica todo en Clash Squad.',
      exercises: [
        {
          id: '2d5e1',
          nameEs: 'Calentamiento',
          descriptionEs: '5 minutos de drag en Training Ground para calentar los pulgares.',
          weaponEs: 'MP40',
          reps: 20,
          timerSeconds: 300,
          tipEs: 'Solo calentamiento. No te presiones.',
          focusEs: 'Calentamiento pre-partida',
        },
        {
          id: '2d5e2',
          nameEs: 'Clash Squad — Solo Headshots',
          descriptionEs: 'Juega 3-5 partidas de Clash Squad. Tu ÚNICO objetivo: headshots. No importa si pierdes. Cuenta tus headshots por partida.',
          weaponEs: 'Lo que encuentres',
          reps: 15,
          timerSeconds: 1800,
          tipEs: 'Ignora ganar/perder. Solo headshots. Anota cuántos haces por partida.',
          focusEs: 'Aplicación en combate real',
        },
      ],
      challengeEs: 'Desafío: Más de 5 headshots en UNA partida de Clash Squad',
      motivationEs: 'Training Ground es el laboratorio. Clash Squad es el examen.',
    },
    {
      day: 6,
      titleEs: 'Battle Royale Casual',
      summaryEs: 'Aplica en partida BR real. Combate cercano con escopeta y SMG.',
      exercises: [
        {
          id: '2d6e1',
          nameEs: 'Calentamiento + repaso',
          descriptionEs: '10 minutos de drag mixto: 20 Vertical + 10 J-Drag.',
          weaponEs: 'M1887 / MP40',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'Enfócate en que cada drag sea limpio.',
          focusEs: 'Repaso de ambas técnicas',
        },
        {
          id: '2d6e2',
          nameEs: 'BR Casual — Aterriza en zona caliente',
          descriptionEs: 'Juega 2-3 BR casual. Aterriza SIEMPRE en zona caliente (Clocktower, Factory, Peak). Busca M1887 o MP40 y pelea.',
          weaponEs: 'M1887 / MP40 / Desert Eagle',
          reps: 10,
          timerSeconds: 2400,
          tipEs: 'Zona caliente = muchos combates = más práctica. No te escondas.',
          focusEs: 'Combate real en BR',
        },
      ],
      challengeEs: null,
      motivationEs: 'Los pros no se esconden. Buscan la pelea.',
    },
    {
      day: 7,
      titleEs: 'Desafío Final',
      summaryEs: 'Demuestra todo lo que aprendiste en 7 días.',
      exercises: [
        {
          id: '2d7e1',
          nameEs: 'Evaluación de precisión',
          descriptionEs: '50 tiros en Training Ground. Anota cuántos son headshot. Tu meta: 25+ de 50 (50%+).',
          weaponEs: 'MP40',
          reps: 50,
          timerSeconds: 600,
          tipEs: 'Compara con tu día 1. Deberías ver mejora clara.',
          focusEs: 'Evaluación final de precisión',
        },
        {
          id: '2d7e2',
          nameEs: 'DESAFÍO: 10 headshots consecutivos',
          descriptionEs: 'En Training Ground, intenta hacer 10 headshots SEGUIDOS con M1887. Sin fallar. Si fallas, empieza de cero.',
          weaponEs: 'M1887',
          reps: 10,
          timerSeconds: 900,
          tipEs: 'Respira. Tomate tu tiempo. Cada drag debe ser perfecto.',
          focusEs: 'Consistencia bajo presión',
        },
      ],
      challengeEs: 'DESAFÍO FINAL: 10 headshots consecutivos con M1887',
      motivationEs: 'Hace 7 días no podías hacer un drag limpio. Mira dónde estás ahora.',
    },
  ],
  completionMessageEs: '¡Completaste \'De Pulgar a Pro\'! Ya dominas el Vertical Drag y el J-Drag con 2 dedos. Siguiente paso: intenta 3 dedos para desbloquear el Peek & Fire.',
};

// ==========================================
// PLAN 3 DEDOS — "El Salto Competitivo"
// ==========================================

const PLAN_3_FINGERS: TrainingPlanData = {
  fingers: 3,
  nameEs: 'El Salto Competitivo',
  subtitleEs: '7 días para dominar el 3er dedo y el Peek & Fire',
  introEs: 'Agregar el índice derecho cambia todo. Este plan te lleva de 2 a 3 dedos de forma gradual, sin perder lo que ya sabes.',
  warningEs: 'Tu rendimiento va a BAJAR las primeras 48-72 horas. Es NORMAL. Tu cerebro está aprendiendo a coordinar un dedo nuevo. NO vuelvas a 2 dedos — aguanta.',
  days: [
    {
      day: 1,
      titleEs: 'Acostumbrar el Índice',
      summaryEs: 'Solo movimiento. Acostumbra tu índice derecho a tocar la pantalla arriba.',
      exercises: [
        {
          id: '3d1e1',
          nameEs: 'Índice en Agacharse',
          descriptionEs: 'Mueve el botón de Agacharse a la esquina superior derecha. Juega una partida entera usando SOLO el índice para agacharse. No cambies nada más.',
          weaponEs: 'Cualquiera',
          reps: 0,
          timerSeconds: 900,
          tipEs: 'Solo agacharte con el índice. Todo lo demás igual que antes.',
          focusEs: 'Acostumbrar el índice a la pantalla',
        },
        {
          id: '3d1e2',
          nameEs: 'Agacharse mientras te mueves',
          descriptionEs: 'En Training Ground, camina y agáchate repetidamente con el índice. El pulgar izquierdo mueve, el índice agacha. Repite hasta que sea natural.',
          weaponEs: 'N/A',
          reps: 50,
          timerSeconds: 600,
          tipEs: 'Si te duele el dedo o se siente raro, es normal. Se pasa en 2-3 días.',
          focusEs: 'Coordinación índice + pulgar',
        },
      ],
      challengeEs: null,
      motivationEs: 'Un dedo nuevo = un mundo nuevo. Hoy solo caminas. Mañana vuelas.',
    },
    {
      day: 2,
      titleEs: 'Agacharse + Disparar',
      summaryEs: 'Coordina el índice (agacharse) con el pulgar (disparar).',
      exercises: [
        {
          id: '3d2e1',
          nameEs: 'Peek básico',
          descriptionEs: 'Detrás de una pared en Training Ground. Agáchate (índice), levántate, dispara (pulgar), agáchate. Ese es el Peek & Fire básico.',
          weaponEs: 'SCAR',
          reps: 40,
          timerSeconds: 900,
          tipEs: 'El ritmo es: agachar → levantar → disparar → agachar. Practícalo lento primero.',
          focusEs: 'Peek & Fire básico',
        },
        {
          id: '3d2e2',
          nameEs: 'Peek + Drag Vertical',
          descriptionEs: 'Combina el peek con el drag. Levántate → drag vertical → agáchate. Si sale headshot, vas por buen camino.',
          weaponEs: 'M4A1',
          reps: 30,
          timerSeconds: 900,
          tipEs: 'No te apures. El peek protege. Tienes tiempo para apuntar.',
          focusEs: 'Combinar peek con drag headshot',
        },
      ],
      challengeEs: 'Desafío: 5 peek headshots seguidos con SCAR',
      motivationEs: 'El Peek & Fire es lo que separa a un casual de un competitivo.',
    },
    {
      day: 3,
      titleEs: 'J-Drag con 3 Dedos',
      summaryEs: 'El Rotation Drag se vuelve devastador con el tercer dedo.',
      exercises: [
        {
          id: '3d3e1',
          nameEs: 'J-Drag + Peek',
          descriptionEs: 'Peek desde cobertura (índice), J-Drag con escopeta (pulgar). El combo más letal a corta distancia.',
          weaponEs: 'M1887',
          reps: 40,
          timerSeconds: 900,
          tipEs: 'Asómate solo lo necesario. El J-Drag hace el resto.',
          focusEs: 'Combo peek + J-Drag',
        },
        {
          id: '3d3e2',
          nameEs: 'Cambiar arma con índice',
          descriptionEs: 'Agrega \'Cambiar Arma\' a los botones del índice. Practica: dispara con escopeta → cambia arma (índice) → dispara con AR. Fluido.',
          weaponEs: 'M1887 → SCAR',
          reps: 20,
          timerSeconds: 600,
          tipEs: 'El cambio de arma con el índice es MUCHO más rápido que con el pulgar.',
          focusEs: 'Weapon switch rápido con índice',
        },
      ],
      challengeEs: null,
      motivationEs: '3 dedos + J-Drag + Peek = máquina de headshots.',
    },
    {
      day: 4,
      titleEs: 'One-Tap Practice',
      summaryEs: 'Entrena el tiro único perfecto a la cabeza.',
      exercises: [
        {
          id: '3d4e1',
          nameEs: 'One-tap con AK47',
          descriptionEs: 'Un tiro, una cabeza. El AK tiene el daño más alto de los ARs. Apunta, drag UP, UN tiro. Repite.',
          weaponEs: 'AK47',
          reps: 50,
          timerSeconds: 900,
          tipEs: 'Un tiro. No spray. Si fallas, reposiciona y repite. Paciencia.',
          focusEs: 'Precisión de un solo tiro',
        },
        {
          id: '3d4e2',
          nameEs: 'One-tap cronometrado',
          descriptionEs: 'Ahora hazlo con timer. Tienes 0.8 segundos por tiro. Apunta → drag → dispara en menos de 0.8s.',
          weaponEs: 'AK47 / SCAR',
          reps: 30,
          timerSeconds: 600,
          tipEs: '0.8s es el tiempo que un enemigo tarda en reaccionar. Si disparas antes, ganas.',
          focusEs: 'Velocidad de one-tap',
        },
      ],
      challengeEs: 'Desafío: 5 one-taps consecutivos con AK47 en menos de 0.8s cada uno',
      motivationEs: 'Un one-tap perfecto es arte. Y tú eres el artista.',
    },
    {
      day: 5,
      titleEs: 'Clash Squad Competitivo',
      summaryEs: 'Aplica todo en Clash Squad con mentalidad competitiva.',
      exercises: [
        {
          id: '3d5e1',
          nameEs: 'Calentamiento completo',
          descriptionEs: '5 min: 10 drags verticales + 10 J-Drags + 10 peeks. Mezcla todo.',
          weaponEs: 'Mixto',
          reps: 30,
          timerSeconds: 300,
          tipEs: 'Calentamiento rápido pero completo. Cada tipo de drag.',
          focusEs: 'Calentamiento pre-competitivo',
        },
        {
          id: '3d5e2',
          nameEs: 'Clash Squad — Peek & Fire focus',
          descriptionEs: '3-5 partidas. En CADA combate, usa cobertura + peek. No pelees al descubierto. Siempre desde pared o Gloo Wall.',
          weaponEs: 'Lo que encuentres',
          reps: 20,
          timerSeconds: 2400,
          tipEs: 'Gloo Wall → Peek → Headshot → Agacharte → Repetir. Ese es el loop.',
          focusEs: 'Peek & Fire en combate real',
        },
      ],
      challengeEs: 'Desafío: Ganar una partida de Clash Squad con más headshots que body shots',
      motivationEs: 'En Clash Squad no hay segunda oportunidad. Cada headshot cuenta.',
    },
    {
      day: 6,
      titleEs: 'Ranked con 3 Dedos',
      summaryEs: 'Tu primera sesión de Ranked usando 3 dedos.',
      exercises: [
        {
          id: '3d6e1',
          nameEs: 'Calentamiento intenso',
          descriptionEs: '10 min de práctica mixta. Enfócate en las armas que más usas en Ranked.',
          weaponEs: 'Tus armas principales',
          reps: 40,
          timerSeconds: 600,
          tipEs: 'Practica con las armas que realmente vas a usar. No con las divertidas.',
          focusEs: 'Preparación para Ranked',
        },
        {
          id: '3d6e2',
          nameEs: 'Ranked — Juega para aprender',
          descriptionEs: '2-3 partidas Ranked. No te presiones por subir de rango. Enfócate en USAR el índice en cada combate.',
          weaponEs: 'Lo que encuentres',
          reps: 10,
          timerSeconds: 2400,
          tipEs: 'Si pierdes rango, no importa. Estás invirtiendo en tu futuro competitivo.',
          focusEs: 'Aplicación en ambiente competitivo',
        },
      ],
      challengeEs: null,
      motivationEs: 'Los puntos de rango van y vienen. La habilidad se queda para siempre.',
    },
    {
      day: 7,
      titleEs: 'Desafío Final',
      summaryEs: 'Demuestra que ya eres un jugador de 3 dedos.',
      exercises: [
        {
          id: '3d7e1',
          nameEs: 'Evaluación: Drag + Peek combo',
          descriptionEs: '30 intentos de Peek + Drag headshot. ¿Cuántos aciertas? Meta: 15+ de 30 (50%+).',
          weaponEs: 'SCAR / M4A1',
          reps: 30,
          timerSeconds: 600,
          tipEs: 'Si llegas a 50%+, ya eres competitivo con 3 dedos.',
          focusEs: 'Evaluación final',
        },
        {
          id: '3d7e2',
          nameEs: 'DESAFÍO: 5 one-taps consecutivos en Ranked',
          descriptionEs: 'Entra a Ranked. Tu misión: 5 headshots de un solo tiro CONSECUTIVOS en una partida. El orden no importa, pero deben ser seguidos.',
          weaponEs: 'AK47 / M1887',
          reps: 5,
          timerSeconds: 1800,
          tipEs: 'Paciencia. Espera el momento correcto. Peek, apunta, one-tap.',
          focusEs: 'Consistencia bajo presión real',
        },
      ],
      challengeEs: 'DESAFÍO FINAL: 5 one-taps consecutivos en Ranked',
      motivationEs: 'Hace 7 días te costaba usar el índice. Ahora haces Peek headshots en Ranked. Eso es progreso real.',
    },
  ],
  completionMessageEs: '¡Completaste \'El Salto Competitivo\'! Ya dominas 3 dedos con Peek & Fire y J-Drag. Siguiente paso: intenta 4 dedos para desbloquear el Jump-Crouch-Fire de Two9.',
};

// ==========================================
// PLAN 4 DEDOS — "Modo Bestia"
// ==========================================

const PLAN_4_FINGERS: TrainingPlanData = {
  fingers: 4,
  nameEs: 'Modo Bestia',
  subtitleEs: '7 días para dominar la Garra y la técnica Two9',
  introEs: '4 dedos es el nivel más alto. Desbloqueas TODAS las técnicas incluyendo la legendaria Jump-Crouch-Fire. Es difícil al principio pero el resultado es devastador.',
  warningEs: 'Tu rendimiento va a CAER 20-30% la primera semana. Es completamente NORMAL. Los pros tardan 3-4 semanas en adaptarse. NO vuelvas a 3 dedos. Aguanta y confía en el proceso.',
  days: [
    {
      day: 1,
      titleEs: 'Posición Garra',
      summaryEs: 'Acostumbra tus manos a la posición de garra. Solo movimiento, nada de combate.',
      exercises: [
        {
          id: '4d1e1',
          nameEs: 'Posición de manos',
          descriptionEs: 'Sostén el celular en posición garra: pulgares abajo, índices arriba tocando las esquinas superiores de la pantalla. Camina por el mapa 15 minutos así. NO pelees.',
          weaponEs: 'N/A',
          reps: 0,
          timerSeconds: 900,
          tipEs: 'Si te duelen las manos, descansa 2 min cada 5. Es normal al principio.',
          focusEs: 'Ergonomía de la posición garra',
        },
        {
          id: '4d1e2',
          nameEs: 'Tocar botones superiores',
          descriptionEs: 'Mueve Disparo a esquina superior derecha y Mira a esquina superior izquierda. Practica tocar cada uno con los índices sin mirar.',
          weaponEs: 'N/A',
          reps: 100,
          timerSeconds: 600,
          tipEs: 'Toca: Mira (índice izq) → Disparo (índice der) → Mira → Disparo. 100 veces.',
          focusEs: 'Memoria muscular de los índices',
        },
      ],
      challengeEs: null,
      motivationEs: 'Hoy solo sostienes el celular diferente. Mañana dominas el mundo.',
    },
    {
      day: 2,
      titleEs: 'Disparar con el Índice',
      summaryEs: 'Transfiere el disparo del pulgar al índice derecho.',
      exercises: [
        {
          id: '4d2e1',
          nameEs: 'Disparo con índice',
          descriptionEs: 'En Training Ground, dispara SOLO con el índice derecho (botón superior). El pulgar derecho SOLO mueve la cámara. 50 tiros.',
          weaponEs: 'SCAR',
          reps: 50,
          timerSeconds: 900,
          tipEs: 'Se siente raro al principio. El índice es más preciso que el pulgar — confía.',
          focusEs: 'Separar disparo (índice) de apuntar (pulgar)',
        },
        {
          id: '4d2e2',
          nameEs: 'Mira con índice izquierdo',
          descriptionEs: 'Ahora agrega: índice izquierdo para abrir Mira/ADS. Índice izq abre scope → pulgar der apunta → índice der dispara.',
          weaponEs: 'M4A1',
          reps: 30,
          timerSeconds: 900,
          tipEs: 'Tres dedos coordinados: scope, apuntar, disparar. Lento pero firme.',
          focusEs: 'Coordinación de 3 dedos activos',
        },
      ],
      challengeEs: null,
      motivationEs: 'Separar el disparo del apuntado es lo que hacen los pros. Ya estás ahí.',
    },
    {
      day: 3,
      titleEs: 'Jump + Shoot',
      summaryEs: 'Desbloquea lo imposible: saltar y disparar al mismo tiempo.',
      exercises: [
        {
          id: '4d3e1',
          nameEs: 'Saltar + Disparar simultáneo',
          descriptionEs: 'Índice izquierdo SALTA, índice derecho DISPARA. Al mismo tiempo. En el aire. 100 intentos.',
          weaponEs: 'MP40',
          reps: 100,
          timerSeconds: 900,
          tipEs: 'No importa si fallas. Solo practica la COORDINACIÓN de 2 índices al mismo tiempo.',
          focusEs: 'Acciones simultáneas con ambos índices',
        },
        {
          id: '4d3e2',
          nameEs: 'Jump Shot Headshot',
          descriptionEs: 'Ahora agrega el drag. Salta → drag up → dispara en el aire. Si sale headshot en el aire, eres una bestia.',
          weaponEs: 'MP40 / M1887',
          reps: 50,
          timerSeconds: 900,
          tipEs: 'Dispara en el PICO del salto (el punto más alto). Ahí es más fácil apuntar.',
          focusEs: 'Jump shot headshot',
        },
      ],
      challengeEs: 'Desafío: 3 headshots en el aire con MP40',
      motivationEs: 'Lo que acabas de hacer es IMPOSIBLE con 2 o 3 dedos. Bienvenido al nivel garra.',
    },
    {
      day: 4,
      titleEs: 'Crouch Spam',
      summaryEs: 'Agacharse repetidamente mientras disparas — el enemigo no puede apuntarte.',
      exercises: [
        {
          id: '4d4e1',
          nameEs: 'Crouch Spam básico',
          descriptionEs: 'Índice der agacha/levanta repetidamente mientras el pulgar der apunta y el índice der dispara. Tu cuerpo sube y baja — el enemigo no puede pegarte.',
          weaponEs: 'SCAR / M4A1',
          reps: 40,
          timerSeconds: 900,
          tipEs: 'El ritmo es rápido: agachar-levantar-agachar-levantar mientras disparas. Como un resorte.',
          focusEs: 'Crouch spam defensivo + ofensivo',
        },
        {
          id: '4d4e2',
          nameEs: 'Crouch Spam + One-Tap',
          descriptionEs: 'Combina: agáchate repetidamente y entre cada agachada haz un one-tap a la cabeza. El enemigo ve un blanco moviéndose que le pega headshots.',
          weaponEs: 'AK47',
          reps: 30,
          timerSeconds: 900,
          tipEs: 'Dispara en el momento EXACTO que te levantas. Ahí tu crosshair está a nivel de cabeza.',
          focusEs: 'Crouch spam + headshot timing',
        },
      ],
      challengeEs: 'Desafío: Matar a un muñeco usando SOLO crouch spam + one-taps',
      motivationEs: 'Crouch spam + headshots = imposible de matar.',
    },
    {
      day: 5,
      titleEs: 'Jump-Crouch-Fire (Técnica Two9)',
      summaryEs: 'La técnica más avanzada de Free Fire. Solo posible con 4 dedos.',
      exercises: [
        {
          id: '4d5e1',
          nameEs: 'La secuencia Two9',
          descriptionEs: 'Paso 1: SALTA (índice izq). Paso 2: En el aire, AGÁCHATE (índice der) — esto aprieta tu crosshair. Paso 3: DISPARA (índice der) en el pico del salto. Todo en menos de 1 segundo.',
          weaponEs: 'M1887 / Desert Eagle',
          reps: 50,
          timerSeconds: 1200,
          tipEs: 'Es la técnica más difícil de FF. Two9 la practica miles de horas. Sé paciente.',
          focusEs: 'Jump-Crouch-Fire completa',
        },
        {
          id: '4d5e2',
          nameEs: 'Two9 vs Gloo Wall',
          descriptionEs: 'Pon una Gloo Wall enfrente. Practica: Saltar para ver POR ENCIMA de la Gloo → Agacharte en el aire → Disparar headshot al muñeco detrás de la Gloo.',
          weaponEs: 'M1887',
          reps: 30,
          timerSeconds: 900,
          tipEs: 'Esta es LA situación donde el Jump-Crouch-Fire domina. El enemigo detrás del Gloo no te ve venir.',
          focusEs: 'Jump-Crouch-Fire sobre Gloo Wall',
        },
      ],
      challengeEs: 'Desafío: 1 headshot con Jump-Crouch-Fire sobre una Gloo Wall',
      motivationEs: 'Two9 tiene 98% de headshot rate con esta técnica. Tú ya la estás practicando.',
    },
    {
      day: 6,
      titleEs: 'Combate Real con Garra',
      summaryEs: 'Clash Squad y BR con todas las técnicas de 4 dedos.',
      exercises: [
        {
          id: '4d6e1',
          nameEs: 'Calentamiento completo',
          descriptionEs: '10 min: Jump shots + Crouch spam + J-Drag + Peek. Todo.',
          weaponEs: 'Mixto',
          reps: 40,
          timerSeconds: 600,
          tipEs: 'Calienta CADA técnica. En partida vas a necesitar todas.',
          focusEs: 'Calentamiento integral',
        },
        {
          id: '4d6e2',
          nameEs: 'Clash Squad — Modo Bestia',
          descriptionEs: '3-5 partidas de Clash Squad. Usa TODAS las técnicas: peek, jump shot, crouch spam, J-Drag. Demuestra que 4 dedos vale la pena.',
          weaponEs: 'Lo que encuentres',
          reps: 15,
          timerSeconds: 2400,
          tipEs: 'No te limites a una técnica. Adapta según la situación.',
          focusEs: 'Combate real con arsenal completo de técnicas',
        },
      ],
      challengeEs: 'Desafío: Hacer al menos 1 Jump-Crouch-Fire headshot en Clash Squad',
      motivationEs: 'Ya no eres un jugador de 2 dedos que mira arriba. Eres un depredador.',
    },
    {
      day: 7,
      titleEs: 'Desafío Final — Modo Bestia',
      summaryEs: 'El desafío más difícil. Demuestra que dominas la garra.',
      exercises: [
        {
          id: '4d7e1',
          nameEs: 'Evaluación de técnicas',
          descriptionEs: '10 de cada una: 10 Vertical Drags + 10 J-Drags + 10 Jump Shots + 10 Crouch Spam headshots + 10 Jump-Crouch-Fire. Cuenta aciertos.',
          weaponEs: 'Mixto',
          reps: 50,
          timerSeconds: 900,
          tipEs: 'Meta: 30+ de 50 (60%+). Si llegas, eres oficialmente un jugador de garra.',
          focusEs: 'Evaluación integral',
        },
        {
          id: '4d7e2',
          nameEs: 'DESAFÍO FINAL: 3 Jump-Crouch-Fire headshots en una partida',
          descriptionEs: 'Entra a Clash Squad. Misión: 3 headshots usando Jump-Crouch-Fire en UNA partida. No importa si ganas o pierdes.',
          weaponEs: 'M1887 / Desert Eagle',
          reps: 3,
          timerSeconds: 1800,
          tipEs: 'Busca las situaciones con Gloo Wall. Ahí brilla el JCF.',
          focusEs: 'Jump-Crouch-Fire en combate real',
        },
      ],
      challengeEs: 'DESAFÍO FINAL: 3 Jump-Crouch-Fire headshots en Clash Squad',
      motivationEs: 'Hace 7 días te costaba sostener el celular en garra. Ahora haces Jump-Crouch-Fire headshots en Ranked. Eres una bestia.',
    },
  ],
  completionMessageEs: '¡Completaste \'Modo Bestia\'! Ya dominas los 4 dedos con todas las técnicas incluyendo la Jump-Crouch-Fire de Two9. Eres parte del 8% de jugadores que usan garra. Sigue practicando — la maestría no tiene techo.',
};

// --- EXPORT ---

export const TRAINING_PLANS: Record<FingerCount, TrainingPlanData> = {
  2: PLAN_2_FINGERS,
  3: PLAN_3_FINGERS,
  4: PLAN_4_FINGERS,
};

export function getTrainingPlan(fingers: FingerCount): TrainingPlanData {
  return TRAINING_PLANS[fingers];
}
