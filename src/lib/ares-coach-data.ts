// ═══════════════════════════════════════════════════════════════
// ARES AI Coach — Datos del showcase interactivo (landing page)
// Todo pre-escrito, $0 en API. Personalidad pro player LATAM.
// ═══════════════════════════════════════════════════════════════

export const ARES_PERSONA = {
  name: 'ARES',
  role: 'AI Coach de Free Fire',
  avatar: '🤖',
  accentColor: '#8b5cf6',
  greeting:
    'Qué onda! Soy ARES, tu coach personal de Free Fire. Conozco tu dispositivo, tu sensibilidad, y las mejores estrategias. ¿En qué te ayudo? 🎯',
} as const;

export interface AresCategory {
  id: string;
  label: string;
  color: string;
}

export const ARES_CATEGORIES: AresCategory[] = [
  { id: 'sensitivity', label: '🎯 Sensibilidad', color: '#f97316' },
  { id: 'weapons', label: '⚔️ Armas', color: '#ef4444' },
  { id: 'techniques', label: '🎮 Técnicas', color: '#06b6d4' },
  { id: 'device', label: '📱 Mi Celular', color: '#22c55e' },
  { id: 'ranking', label: '🏆 Ranking', color: '#eab308' },
  { id: 'training', label: '🏋️ Entreno', color: '#a855f7' },
];

export interface AresConversation {
  id: string;
  category: string;
  question: string;
  response: string;
}

export const ARES_CONVERSATIONS: AresConversation[] = [
  {
    id: 'best-weapon',
    category: 'weapons',
    question: '¿Cuál es la mejor arma para headshot?',
    response:
      'Depende del rango bro 🎯\n\n🔴 CLOSE RANGE: M1887 sin dudarlo. One-tap con J-drag y se acabó. 94 de daño base, x2.0 headshot = 188. Muerte instantánea.\n\n🟠 MID RANGE: M4A1. Es la más consistente del juego, retroceso bajo, drag vertical suave. Si no haces headshots con M4, el problema es tu técnica, no el arma.\n\n🔵 LONG RANGE: AWM. One-shot headshot garantizado con CUALQUIER casco incluido nivel 3. Scope in → micro-drag → dispara en <0.5s.\n\nPero ojo, cada arma necesita su propia sensi. En el Headshot Mode te las calculo todas 💪',
  },
  {
    id: 'my-phone',
    category: 'device',
    question: '¿Mi celular es bueno para Free Fire?',
    response:
      'Dame tu modelo y te digo la neta 📱\n\nPero en general:\n• 120Hz+ = VENTAJA REAL en drag shots (Samsung A54, POCO X5 Pro)\n• AMOLED = mejor touch response que IPS\n• 4GB RAM = funciona pero puede lagear en BR con 50 jugadores\n• 6GB+ RAM = vas sobrado\n\nLo importante es que TU SENSI esté optimizada para TU hardware específico. Un Redmi 13C con sensi bien calibrada le gana a un iPhone mal configurado. Literal.\n\nGenera tu sensi en SensiPRO y te doy tu Headshot Score de 0-100 🔥',
  },
  {
    id: 'drag-headshot',
    category: 'techniques',
    question: '¿Cómo hago drag headshot?',
    response:
      'Te explico las 3 principales bro:\n\n⬆️ VERTICAL DRAG (fácil):\nApunta al PECHO → arrastra fire button RECTO hacia arriba → el crosshair sube a la cabeza. Todo en <0.5 segundos. Ideal con M4A1, SCAR.\n\n🔄 J-DRAG (media):\nArrastra hacia el LADO del enemigo → SUBE formando una J. Para cuando el enemigo está a tu costado. BRUTAL con M1887 y Desert Eagle.\n\n↗️ DIRECTION DRAG (difícil):\nArrastra en la MISMA dirección que se mueve el enemigo + sube. Interceptas su cabeza en movimiento.\n\nMi consejo: empieza con Vertical Drag hasta que lo hagas dormido, después pasa a J-drag. En el Headshot Mode tienes guías animadas de cada técnica 🎯',
  },
  {
    id: 'sensitivity-feel',
    category: 'sensitivity',
    question: 'Mi sensi se siente muy rápida, ¿qué hago?',
    response:
      'Eso pasa mucho y tiene solución:\n\n1️⃣ ¿Acabas de cambiarla? Dale mínimo 3 días antes de juzgar. Tu músculo memoria necesita adaptarse.\n\n2️⃣ Si después de 3 días sigue muy rápida: baja el PUNTO ROJO 5-10 puntos. Es el valor que más afecta al combate diario.\n\n3️⃣ Revisa tu DPI del sistema. Si está arriba de 600, bájalo a 480-550.\n\n4️⃣ ¿Juegas en gama baja? Los celulares con menos Hz necesitan sensi MÁS BAJA porque el touch sampling es menor.\n\n5️⃣ Tip pro: practica 10 min en Training Ground con la nueva sensi ANTES de ir a ranked. Nunca estrenes sensi en clasificatoria bro 💀',
  },
  {
    id: 'rank-up',
    category: 'ranking',
    question: '¿Cómo subo de Diamante a Heroico?',
    response:
      'La subida a Heroico es la más difícil del juego, pero aquí va el plan:\n\n📋 SEMANA 1-2:\n• Solo juega BR en horarios de MENOS jugadores (6-10am, medianoche)\n• Juega PASIVO — Top 5 da más puntos que 10 kills y morir #30\n• Drop en zonas TIER 2 (no hot drop)\n• Lleva M4A1 + AWM/SVD siempre\n\n📋 SEMANA 3-4:\n• Ya tienes base de puntos, ahora juega más agresivo\n• Practica 15 min diarios con el Training Plan del Headshot Mode\n• Squad > Solo para subir (menos varianza)\n\n💡 MENTALIDAD:\nSi pierdes 3 seguidas → PARA. Estás en tilt. Vuelve mañana.\nHeroico es más sobre consistencia que skill puro 🏆',
  },
  {
    id: 'training-routine',
    category: 'training',
    question: 'Dame una rutina de entrenamiento',
    response:
      '15 MINUTOS que te cambian el juego:\n\n🔥 WARMUP (3 min)\n50 disparos con Desert Eagle a maniquíes. SOLO headshots. Cambia distancia cada 10.\n\n⬆️ VERTICAL DRAG (3 min)\n30 reps con M4A1. Apunta al pecho → drag arriba → headshot. Objetivo: 60% accuracy.\n\n🔄 J-DRAG (3 min)\n20 reps con M1887. J desde el costado. Objetivo: 40% accuracy.\n\n↗️ MOVING TARGET (3 min)\nDirection drag con UMP contra maniquí móvil o 1v1 custom. Objetivo: 30% accuracy.\n\n🔄 ROTACIÓN (3 min)\nDesert Eagle → M1887 → M4A1 → AWM. 10 headshots con cada una.\n\nHazla ANTES de jugar ranked. Todos los días. En 2 semanas vas a notar la diferencia, te lo prometo 💪',
  },
  {
    id: 'm4-vs-scar',
    category: 'weapons',
    question: '¿M4A1 o SCAR, cuál es mejor?',
    response:
      'La eterna pregunta bro, aquí va la neta:\n\n🔶 M4A1:\n• Daño: 53 | Cadencia: 560 RPM | Retroceso: BAJO\n• OB51 lo buffeó: +5% DMG, +10% Accuracy\n• Mejor para: spray constante, principiantes, APRENDER headshots\n• La MEJOR arma para aprender drag vertical\n\n🔶 SCAR:\n• Daño: 53 | Cadencia: 540 RPM | Retroceso: BAJO\n• Primer disparo MUY preciso\n• Mejor para: tap-fire, one-taps a distancia, jugadores con buen timing\n\n💡 MI VEREDICTO:\nSi estás aprendiendo → M4A1. Sin discusión.\nSi ya dominas tap-fire → SCAR.\nPara ranked → M4A1 es más consistente.\n\nPero la real es que con la sensi correcta, las dos son bestias 🔥',
  },
  {
    id: 'low-end',
    category: 'device',
    question: '¿Cómo optimizar FF en gama baja?',
    response:
      'Bro te entiendo, yo empecé con un Redmi gama baja:\n\n⚙️ GRÁFICOS:\n• Smooth + High FPS (SIEMPRE)\n• Sombras: OFF\n• Efecto de disparo: OFF\n• Anti-aliasing: OFF\n\n📱 CELULAR:\n• Cierra TODAS las apps antes de jugar\n• Modo gaming si tu cel lo tiene\n• Datos > WiFi para menos lag (contraintuitivo pero funciona)\n• DPI del sistema: 480 (más bajo = menos procesamiento)\n\n🎯 SENSIBILIDAD:\n• En gama baja necesitas sensi MÁS BAJA que gama alta\n• Tu touch sampling es menor = movimientos menos precisos\n• SensiPRO ya calcula esto automáticamente según tu hardware\n\n💡 Lo más importante: la TÉCNICA gana al hardware. He visto jugadores en Redmi 13C llegar a Heroico 🏆',
  },
];
