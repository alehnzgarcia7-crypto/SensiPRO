// ═══════════════════════════════════════════════════════════════
// ARES — Contenido completo de las 8 guías de academia
// 6000+ palabras de contenido REAL de Free Fire
// Cada guía: slug, título, categoría, dificultad, intro, secciones, callouts
// ═══════════════════════════════════════════════════════════════

export type CalloutVariant = 'pro-tip' | 'error' | 'dato-clave' | 'importante';
export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';
export type GuideCategoryLabel = 'Sensibilidad' | 'HUD' | 'Combate' | 'Configuración' | 'Armas';

export interface ContentBlock {
  type: 'text' | 'callout' | 'table' | 'list' | 'ordered-list';
  content?: string;
  variant?: CalloutVariant;
  headers?: string[];
  rows?: string[][];
  items?: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface GuideData {
  slug: string;
  title: string;
  category: GuideCategoryLabel;
  categoryColor: string;
  difficulty: Difficulty;
  readTime: number;
  intro: string;
  sections: GuideSection[];
  relatedSlugs: string[];
}

// ═══════════════════════════════════════════════════════════════
// COLOR MAP
// ═══════════════════════════════════════════════════════════════

export const CATEGORY_COLOR_MAP: Record<GuideCategoryLabel, string> = {
  Sensibilidad: '#06b6d4',
  HUD: '#a855f7',
  Combate: '#ef4444',
  Configuración: '#f97316',
  Armas: '#f59e0b',
};

export const DIFFICULTY_COLOR_MAP: Record<Difficulty, { bg: string; text: string; border: string }> = {
  Principiante: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  Intermedio: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Avanzado: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 1: Sensibilidad Perfecta
// ═══════════════════════════════════════════════════════════════

const sensibilidadPerfecta: GuideData = {
  slug: 'sensibilidad-perfecta',
  title: 'Cómo Encontrar tu Sensibilidad Perfecta',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Principiante',
  readTime: 5,
  intro: 'Copiar la sensibilidad de un pro no funciona. Punto. Su celular tiene diferente pantalla, diferente tasa de refresco, y diferente densidad de píxeles que el tuyo. Aquí te explicamos cómo encontrar la sensibilidad que SÍ funciona para tu dispositivo.',
  sections: [
    {
      id: 'sensi-mal',
      title: 'Por qué tu sensibilidad actual probablemente está mal',
      blocks: [
        {
          type: 'text',
          content: 'La mayoría de jugadores copian la config de un YouTuber y se preguntan por qué no les funciona. La razón es simple: la sensibilidad depende del hardware. Un iPhone 15 Pro con pantalla de 6.1" a 120Hz necesita valores completamente diferentes a un Redmi Note 12 con pantalla de 6.67" a 120Hz.',
        },
        {
          type: 'text',
          content: 'Y no es solo el tamaño — la densidad de píxeles (DPI) cambia cómo tu dedo se mueve por la pantalla. Más DPI = más precisión por milímetro de movimiento. Dos celulares con "la misma sensibilidad" se sienten completamente diferentes si tienen DPI distinto.',
        },
      ],
    },
    {
      id: 'factores',
      title: 'Los 4 factores que determinan tu sensibilidad',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Tamaño de pantalla</strong> — Pantalla más grande = necesitas MENOS sensibilidad. Tu dedo recorre más distancia física por la misma distancia en el juego.',
            '<strong>Tasa de refresco (Hz)</strong> — 120Hz se siente más suave que 60Hz. Con 120Hz puedes usar sensibilidad ligeramente más baja porque el movimiento es más fluido.',
            '<strong>DPI del dispositivo</strong> — Cada pantalla tiene una densidad de píxeles diferente. Mayor DPI = más resolución de movimiento = puedes ser más preciso.',
            '<strong>RAM</strong> — Afecta los FPS que tu celular puede mantener. Menos RAM = más drops de FPS = necesitas sensibilidad más estable (ni muy alta ni muy baja).',
          ],
        },
      ],
    },
    {
      id: 'metodo',
      title: 'El método SensiPRO paso a paso',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'Busca tu celular exacto en el generador. No "Samsung Galaxy" genérico — tu modelo específico.',
            'Confirma la tasa de refresco de tu pantalla (60, 90 o 120 Hz). Revísala en Ajustes → Pantalla.',
            'Elige tu estilo de juego: Agresivo si te gusta rushear, Balanceado para todo terreno, o Francotirador si prefieres distancia.',
            'Copia los valores generados al juego uno por uno.',
            'Ve al campo de entrenamiento y prueba durante 10-15 minutos.',
            'Si sientes que giras muy rápido, baja la general 5-10 puntos. Si muy lento, sube 5-10 puntos.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'No cambies tu sensibilidad cada día. Dale mínimo 3-5 días de práctica antes de ajustar. Tu cerebro necesita tiempo para adaptarse a los nuevos valores.',
        },
      ],
    },
    {
      id: 'errores',
      title: 'Errores que todo el mundo comete',
      blocks: [
        {
          type: 'list',
          items: [
            'Copiar la sensi de un pro sin considerar el dispositivo',
            'Cambiar la sensibilidad después de cada mala partida',
            'Usar la misma sensibilidad en TODOS los scopes (2x, 4x, AWM necesitan valores diferentes)',
            'No considerar el DPI de su pantalla',
            'Subir la sensibilidad general pensando que "más rápido = mejor"',
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: '"Mi amigo usa 250 de general y le va bien, entonces yo también debería." — No. Tu amigo tiene un celular diferente. Usa TU sensibilidad, calibrada para TU dispositivo.',
        },
      ],
    },
    {
      id: 'cuando-ajustar',
      title: 'Cuándo ajustar tu sensibilidad',
      blocks: [
        {
          type: 'list',
          items: [
            'Cuando cambias de celular (OBLIGATORIO recalcular)',
            'Cuando actualizas el sistema operativo (puede cambiar el DPI rendering)',
            'Cuando cambias de 2 a 3 o 4 dedos (la forma de mover la pantalla cambia)',
            'Cuando sientes que llevas semanas sin mejorar y ya probaste todo lo demás',
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Cada vez que cambias de celular, tu primer paso debería ser recalcular tu sensibilidad en SensiPRO. El mismo número en un celular diferente se siente completamente distinto.',
        },
      ],
    },
  ],
  relatedSlugs: ['configuracion-hud', 'dpi-sensibilidad', 'giroscopio-guia'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 2: Configuración de HUD
// ═══════════════════════════════════════════════════════════════

const configuracionHud: GuideData = {
  slug: 'configuracion-hud',
  title: 'Configuración de HUD para 2, 3 y 4 Dedos',
  category: 'HUD',
  categoryColor: '#a855f7',
  difficulty: 'Intermedio',
  readTime: 8,
  intro: 'Tu HUD es tan importante como tu sensibilidad. No importa qué tan buena sea tu config si no puedes alcanzar los botones cómodamente. Aquí te damos configuraciones probadas para 2, 3 y 4 dedos — con códigos HUD reales que puedes copiar directo al juego.',
  sections: [
    {
      id: 'por-que-hud',
      title: '¿Por qué importa el HUD?',
      blocks: [
        {
          type: 'text',
          content: 'El HUD (Heads Up Display) es la posición de todos los botones en tu pantalla. Un mal HUD significa que pierdes 0.5-1 segundo buscando botones en un fight. En Free Fire, esos milisegundos son la diferencia entre matar o morir. El HUD correcto se adapta a cuántos dedos usas y al tamaño de tu pantalla.',
        },
      ],
    },
    {
      id: 'hud-2-dedos',
      title: 'HUD para 2 Dedos — Configuración Clásica',
      blocks: [
        {
          type: 'text',
          content: 'Si juegas con 2 dedos (pulgares), tu HUD debe ser simple y accesible:',
        },
        {
          type: 'list',
          items: [
            'Joystick izquierdo: posición estándar, tamaño medio',
            'Botones de disparo: lado derecho, grandes (55-70% del tamaño)',
            'Mira: centro-derecha, fácil de alcanzar con el pulgar derecho',
            'Botones secundarios (agacharse, saltar): esquina inferior derecha, más pequeños',
            'Mapa: esquina superior izquierda, tamaño mínimo para no estorbar',
            'Inventario: arriba a la derecha, accesible pero no en el camino',
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Con 2 dedos no puedes mover y disparar al mismo tiempo fácilmente. Tu HUD debe minimizar la distancia entre movimiento y disparo.',
        },
      ],
    },
    {
      id: 'hud-3-dedos',
      title: 'HUD para 3 Dedos — El Salto Competitivo',
      blocks: [
        {
          type: 'text',
          content: 'Con 3 dedos (2 pulgares + 1 índice), desbloqueas la habilidad de disparar MIENTRAS te mueves:',
        },
        {
          type: 'list',
          items: [
            'Joystick: igual que 2 dedos',
            'Botón de disparo principal: esquina superior izquierda o derecha (para el índice)',
            'Botón de disparo secundario: lado derecho (para el pulgar)',
            'Mira/scope: derecha media, accesible para el pulgar',
            'Agacharse: esquina derecha, pulgar',
            'Saltar: cerca del disparo secundario',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'El índice se encarga SOLO de disparar. Los pulgares hacen TODO lo demás. No intentes hacer más con el índice al principio — domina lo básico primero.',
        },
      ],
    },
    {
      id: 'hud-4-dedos',
      title: 'HUD para 4 Dedos (Garra) — Nivel Pro',
      blocks: [
        {
          type: 'text',
          content: 'La configuración de garra (2 pulgares + 2 índices) es la que usan la mayoría de pros:',
        },
        {
          type: 'list',
          items: [
            'Índice izquierdo: disparo principal o scope',
            'Índice derecho: disparo o agacharse',
            'Pulgar izquierdo: movimiento (joystick)',
            'Pulgar derecho: mira + botones secundarios',
            'Botones distribuidos en las 4 esquinas de la pantalla',
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'La garra requiere 1-2 semanas de adaptación. Vas a jugar PEOR al principio. Es normal. No te rindas — la mejora es brutal una vez que la dominas.',
        },
      ],
    },
    {
      id: 'codigos-hud',
      title: 'Códigos HUD reales para copiar',
      blocks: [
        {
          type: 'text',
          content: 'Estos son códigos HUD REALES de Free Fire que puedes copiar y pegar directo en el juego. Cada uno está optimizado para diferente cantidad de dedos y estilo de juego.',
        },
        {
          type: 'table',
          headers: ['Dedos', 'Estilo', 'Código'],
          rows: [
            ['2 Dedos', 'Clásico Básico', '#FFHUDT6O3jSJjT59Po7eO'],
            ['2 Dedos', 'Precisión Alta', '#FFHUDT6O3jqVY6q1Po7eM'],
            ['3 Dedos', 'Balanceado', '#FFHUDT6O3jqVY6q1Po7eP'],
            ['3 Dedos', 'Rush Master', '#FFHUDT6O3jldUm9NPo7eP'],
            ['3 Dedos', 'Competitivo', '#FFHUDT6O3jlCbzSRPo7eM'],
            ['4 Dedos', 'Garra Estándar', '#FFHUDT6O3jqVY6q1Po7eO'],
            ['4 Dedos', 'Garra Precisión', '#FFHUDT6O3jlCbzSRPo7eO'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Si apenas estás empezando con una cantidad de dedos nueva, usa el código marcado como "Básico" o "Estándar". Después de 1-2 semanas, prueba los más competitivos.',
        },
      ],
    },
    {
      id: 'aplicar-hud',
      title: 'Cómo aplicar un código HUD en Free Fire',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'Copia el código completo (incluyendo el #)',
            'Abre Free Fire',
            'Ve a Ajustes (ícono de engranaje)',
            'Selecciona "En Partida" o "Controles"',
            'Busca la opción "Importar" o "Pegar código"',
            'Pega el código y confirma',
            'Entra a una partida de entrenamiento para probar',
          ],
        },
      ],
    },
    {
      id: 'elegir-dedos',
      title: 'Cómo elegir entre 2, 3 y 4 dedos',
      blocks: [
        {
          type: 'table',
          headers: ['Factor', '2 Dedos', '3 Dedos', '4 Dedos'],
          rows: [
            ['Facilidad de aprendizaje', 'Alta', 'Media', 'Baja'],
            ['Potencial competitivo', 'Medio', 'Alto', 'Muy Alto'],
            ['Tiempo de adaptación', '0', '1 semana', '2-3 semanas'],
            ['Movimiento + disparo', 'Difícil', 'Posible', 'Fácil'],
            ['Recomendado para', 'Casual', 'Ranked', 'Competitivo/Torneo'],
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'drag-shot-tecnicas', 'headshots-consistentes'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 3: Headshots Consistentes
// ═══════════════════════════════════════════════════════════════

const headshotsConsistentes: GuideData = {
  slug: 'headshots-consistentes',
  title: 'Cómo Hacer Headshots Consistentes',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Intermedio',
  readTime: 6,
  intro: 'Los headshots no son suerte — son sensibilidad correcta + técnica de drag + posición del crosshair. Si dominas estos tres elementos, tu headshot rate sube del 15% al 40% o más.',
  sections: [
    {
      id: 'trinidad',
      title: 'La Trinidad del Headshot',
      blocks: [
        {
          type: 'text',
          content: 'Hay 3 elementos que determinan si le das a la cabeza o al pecho:',
        },
        {
          type: 'list',
          items: [
            '<strong>Sensibilidad calibrada</strong> — Si tu sensi es muy alta, pasas de largo. Muy baja, no llegas. Tiene que ser exacta para tu dispositivo.',
            '<strong>Técnica de drag</strong> — El movimiento que haces con el dedo para subir de pecho a cabeza mientras disparas. Es un skill que se entrena.',
            '<strong>Posición del crosshair</strong> — Dónde apuntas ANTES de ver al enemigo. Si ya estás apuntando a la altura de la cabeza, solo necesitas un micro-ajuste.',
          ],
        },
      ],
    },
    {
      id: 'crosshair-placement',
      title: 'Crosshair placement — El secreto que nadie te enseña',
      blocks: [
        {
          type: 'text',
          content: 'El 90% de los jugadores caminan apuntando al piso. ERROR. Tu crosshair siempre debe estar a la altura donde ESTARÍA la cabeza del enemigo. Cuando aparece un rival, ya estás apuntando. Solo ajustas horizontal, no vertical. Esto reduce tu tiempo de reacción de 0.5s a 0.1s.',
        },
        {
          type: 'text',
          content: 'Practica esto: en el campo de entrenamiento, camina por el mapa manteniendo el crosshair a la altura de las cabezas de los bots. Hazlo 10 minutos diarios. En 1 semana se vuelve instinto.',
        },
      ],
    },
    {
      id: 'drag-shot-basico',
      title: 'Drag Shot — La técnica que separa pros de casuals',
      blocks: [
        {
          type: 'text',
          content: 'El drag shot es un movimiento rápido con el dedo que sube tu mira del pecho a la cabeza mientras disparas. Hay 3 tipos:',
        },
        {
          type: 'list',
          items: [
            '<strong>Drag Vertical</strong> — Desliza hacia ARRIBA en línea recta. El más simple. Funciona bien con M4, SCAR.',
            '<strong>J-Drag</strong> — Movimiento en forma de J — diagonal y luego arriba. Más preciso, especialmente con MP40.',
            '<strong>Rotation Drag</strong> — Movimiento circular. El más avanzado. Ideal para AWM y tiros de una bala.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Empieza con el drag vertical. Domínalo completamente antes de intentar J-drag. No saltes al rotation hasta que el J-drag sea instintivo.',
        },
      ],
    },
    {
      id: 'sensi-headshots',
      title: 'Configuración de sensibilidad para headshots',
      blocks: [
        {
          type: 'text',
          content: 'Para headshots consistentes, necesitas una relación específica entre tus sensibilidades:',
        },
        {
          type: 'list',
          items: [
            'General: calibrada a tu dispositivo (usa el generador)',
            'Red Point: 5-10 puntos MENOR que general (más control en close range)',
            'Scope 2x: 15-20 puntos menor que general',
            'Scope 4x: 25-35 puntos menor que general',
            'AWM scope: la MÁS baja de todas (movimiento mínimo = precisión máxima)',
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'Tener la sensibilidad de scope 4x muy alta. Si estás usando 4x y tu mira brinca por todos lados, tu sensi de scope está demasiado alta. Bájala 15-20 puntos.',
        },
      ],
    },
    {
      id: 'rutina-headshots',
      title: 'Rutina de práctica de 15 minutos',
      blocks: [
        {
          type: 'list',
          items: [
            'Minutos 1-5: Crosshair placement — camina por el mapa apuntando a cabezas',
            'Minutos 5-10: Drag shots contra bots — solo apunta al pecho y practica el drag hacia arriba',
            'Minutos 10-15: 1v1 simulados — pelea contra bots intentando SOLO headshots',
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Hazlo ANTES de jugar ranked. Es como calentar antes de un partido de futbol. 15 minutos de práctica pueden mejorar tu rendimiento toda la sesión.',
        },
      ],
    },
  ],
  relatedSlugs: ['drag-shot-tecnicas', 'sensibilidad-perfecta', 'armas-sensibilidad'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 4: Settings Gráficos
// ═══════════════════════════════════════════════════════════════

const settingsGraficos: GuideData = {
  slug: 'settings-graficos',
  title: 'Settings Gráficos para Máximo FPS',
  category: 'Configuración',
  categoryColor: '#f97316',
  difficulty: 'Principiante',
  readTime: 4,
  intro: 'FPS > gráficos bonitos. Siempre. Un juego a 60 FPS estables con gráficos en bajo gana contra un juego bonito que dropea a 20 FPS en cada fight.',
  sections: [
    {
      id: 'fps-importan',
      title: 'Por qué los FPS importan más que los gráficos',
      blocks: [
        {
          type: 'text',
          content: 'Cada frame que tu celular renderiza es una oportunidad de reaccionar. A 60 FPS, tu pantalla se actualiza 60 veces por segundo. A 30 FPS, la mitad. En un 1v1, el jugador con más FPS VE al enemigo antes y su input se registra más rápido.',
        },
        {
          type: 'text',
          content: 'Los gráficos bonitos no ganan partidas. Los FPS estables sí. Un frame drop en el momento justo de un fight puede costarte la partida entera.',
        },
      ],
    },
    {
      id: 'config-por-gama',
      title: 'Configuración recomendada por gama',
      blocks: [
        {
          type: 'text',
          content: 'Gama baja (2-3 GB RAM, Snapdragon 600 series):',
        },
        {
          type: 'table',
          headers: ['Setting', 'Valor'],
          rows: [
            ['Gráficos', 'Bajo'],
            ['FPS', 'Alto'],
            ['Sombras', 'Desactivado'],
            ['Efectos', 'Bajo'],
            ['Anti-aliasing', 'Desactivado'],
            ['Modo rendimiento', 'Activado'],
          ],
        },
        {
          type: 'text',
          content: 'Gama media (4-6 GB RAM, Snapdragon 700 series):',
        },
        {
          type: 'table',
          headers: ['Setting', 'Valor'],
          rows: [
            ['Gráficos', 'Normal'],
            ['FPS', 'Alto'],
            ['Sombras', 'Bajo'],
            ['Efectos', 'Normal'],
            ['Anti-aliasing', 'Bajo'],
            ['Modo rendimiento', 'Desactivado'],
          ],
        },
        {
          type: 'text',
          content: 'Gama alta (8+ GB RAM, Snapdragon 800+ series, iPhones):',
        },
        {
          type: 'table',
          headers: ['Setting', 'Valor'],
          rows: [
            ['Gráficos', 'Alto'],
            ['FPS', 'Ultra'],
            ['Sombras', 'Normal'],
            ['Efectos', 'Alto'],
            ['Anti-aliasing', 'Alto'],
            ['Modo rendimiento', 'Desactivado'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Incluso en gama alta, muchos pros juegan con gráficos en Normal y FPS en Ultra. Menos cosas en pantalla = menos distracciones = ves enemigos más rápido.',
        },
      ],
    },
    {
      id: 'optimizaciones',
      title: 'Optimizaciones extra del celular',
      blocks: [
        {
          type: 'list',
          items: [
            'Cierra TODAS las apps antes de jugar (WhatsApp, Instagram, todo)',
            'Activa "Modo juego" si tu celular lo tiene',
            'Desactiva Bluetooth si no usas audífonos inalámbricos',
            'Conecta a WiFi 5GHz si es posible (menos latencia que 2.4GHz)',
            'Carga tu celular al 80%+ antes de jugar (baja carga = CPU throttling)',
            'Si hace calor, quita la funda del celular (sobrecalentamiento = FPS drops)',
          ],
        },
      ],
    },
    {
      id: 'verificar-fps',
      title: 'Cómo verificar tus FPS en partida',
      blocks: [
        {
          type: 'text',
          content: 'Free Fire tiene un contador de FPS que puedes activar. Ve a Ajustes → Pantalla → Mostrar FPS. Si ves que caen por debajo de 40 en fights, baja un nivel los gráficos.',
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'Poner gráficos en Ultra en un celular gama baja "porque se ve mejor". Se ve mejor pero juegas peor. Siempre prioriza FPS sobre calidad visual.',
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'dpi-sensibilidad'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 5: Giroscopio
// ═══════════════════════════════════════════════════════════════

const giroscopioGuia: GuideData = {
  slug: 'giroscopio-guia',
  title: 'Giroscopio: ¿Activarlo o No?',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Avanzado',
  readTime: 7,
  intro: 'El giroscopio es el feature más divisivo de Free Fire. Algunos pros juran por él, otros lo odian. La verdad es que depende de tu estilo de juego y de tu celular.',
  sections: [
    {
      id: 'que-es-gyro',
      title: '¿Qué hace el giroscopio?',
      blocks: [
        {
          type: 'text',
          content: 'El giroscopio usa el sensor de movimiento de tu celular para mover la mira. Cuando inclinas el celular hacia la izquierda, tu mira va a la izquierda. Es como tener un control de movimiento adicional además de tu dedo. NO reemplaza el toque de pantalla — lo complementa.',
        },
      ],
    },
    {
      id: 'cuando-si',
      title: '¿Cuándo SÍ usar giroscopio?',
      blocks: [
        {
          type: 'list',
          items: [
            'Juegas con 2 dedos y quieres más control sin cambiar a 3-4 dedos',
            'Tu celular tiene buen giroscopio (iPhones, Samsung S series, Poco F series)',
            'Eres paciente y puedes dedicar 2 semanas a aprenderlo',
            'Juegas sentado/en una posición estable (no en el camión)',
          ],
        },
      ],
    },
    {
      id: 'cuando-no',
      title: '¿Cuándo NO usar giroscopio?',
      blocks: [
        {
          type: 'list',
          items: [
            'Juegas en movimiento (caminando, transporte público) — el movimiento del cuerpo afecta la mira',
            'Tu celular es gama baja (sensores de giroscopio baratos son imprecisos)',
            'Ya eres competitivo con 3-4 dedos — el gyro no te va a dar ventaja adicional significativa',
            'No tienes paciencia para el periodo de adaptación',
          ],
        },
      ],
    },
    {
      id: 'config-gyro',
      title: 'Configuración del giroscopio',
      blocks: [
        {
          type: 'text',
          content: 'Modo recomendado: "Scope activado" (solo se activa cuando usas mira, no todo el tiempo)',
        },
        {
          type: 'text',
          content: 'Los valores de giroscopio en Free Fire van de 0 a 100. Son MUCHO más bajos que los de sensibilidad de toque. No te asustes si ves números "pequeños" — así es como funciona.',
        },
        {
          type: 'table',
          headers: ['Parámetro', 'Gama baja (60Hz)', 'Gama media (90Hz)', 'Gama alta (120Hz)'],
          rows: [
            ['Gyro General', '20-30', '25-35', '30-42'],
            ['Gyro Punto Rojo', '15-25', '18-28', '22-32'],
            ['Gyro Mira 2x', '10-18', '12-22', '15-25'],
            ['Gyro Mira 4x', '5-12', '8-15', '10-18'],
            ['Gyro AWM', '3-8', '5-10', '8-12'],
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Estos valores son puntos de partida calculados por ARES v5.0. El giroscopio es MUY personal — ajusta según cómo se sienta en TU celular. Nota: la escala de gyro es 0-100, no 0-200 como la sensibilidad de toque.',
        },
      ],
    },
    {
      id: 'practicar-gyro',
      title: 'Cómo practicar giroscopio',
      blocks: [
        {
          type: 'list',
          items: [
            'Semana 1: Actívalo solo en "Scope activado". Juega SOLO entrenamiento. Acostúmbrate al movimiento.',
            'Semana 2: Empieza a usar en partidas casuales. No ranked todavía.',
            'Semana 3: Si te sientes cómodo, prueba en ranked. Si no, sigue en casual.',
            'Semana 4: Ajusta la sensibilidad basándote en tu experiencia de las 3 semanas anteriores.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Los primeros 3 días vas a jugar TERRIBLE con gyro. Es normal. Tu cerebro necesita crear nuevas conexiones musculares. NO lo apagues. Aguanta.',
        },
      ],
    },
    {
      id: 'gyro-drag',
      title: 'Gyro + Drag Shot = Combo letal',
      blocks: [
        {
          type: 'text',
          content: 'Si dominas ambos, puedes hacer micro-ajustes con el gyro mientras haces drag con el dedo. Esto da una precisión que es casi imposible solo con dedos. Muchos pros de competitivo usan esta combinación.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'El gyro es especialmente poderoso con snipers (AWM, Kar98k). El micro-ajuste que da el movimiento del celular te permite hacer correcciones de último segundo que con solo el dedo serían imposibles.',
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'headshots-consistentes', 'drag-shot-tecnicas'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 6: Drag Shot Técnicas
// ═══════════════════════════════════════════════════════════════

const dragShotTecnicas: GuideData = {
  slug: 'drag-shot-tecnicas',
  title: 'Técnicas de Drag Shot para Headshots',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Avanzado',
  readTime: 8,
  intro: 'El drag shot es la diferencia entre un jugador normal y un jugador que da miedo. Es la habilidad mecánica más importante de Free Fire y la que más impacta tu headshot rate.',
  sections: [
    {
      id: 'que-es-drag',
      title: '¿Qué es un Drag Shot?',
      blocks: [
        {
          type: 'text',
          content: 'Es un movimiento rápido con el dedo que haces MIENTRAS disparas para mover la mira del pecho/cuerpo hacia la cabeza. No es apuntar a la cabeza directamente (eso es difícil con lag y movimiento). Es apuntar al cuerpo y ARRASTRAR hacia arriba para el headshot.',
        },
      ],
    },
    {
      id: 'drag-vertical',
      title: 'Drag Vertical — La base de todo',
      blocks: [
        {
          type: 'text',
          content: 'El movimiento más simple: deslizar el dedo hacia arriba en línea recta.',
        },
        {
          type: 'text',
          content: 'Cómo practicarlo:',
        },
        {
          type: 'ordered-list',
          items: [
            'Ve al campo de entrenamiento',
            'Apunta al pecho de un bot (NO a la cabeza)',
            'Dispara y SIMULTÁNEAMENTE desliza tu dedo hacia arriba',
            'Si el drag es correcto, la mira sube del pecho a la cabeza durante las primeras 3-4 balas',
            'Repite 100 veces. Sí, 100. Sin exagerar.',
          ],
        },
        {
          type: 'text',
          content: 'Funciona mejor con: M4A1, SCAR, AK47 — armas con recoil vertical predecible.',
        },
        {
          type: 'text',
          content: 'Sensibilidad clave: Tu "General" y "Red Point" determinan qué tan rápido sube la mira. Si es muy alta, te pasas. Si es muy baja, no llegas.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'El movimiento del dedo es CORTO. Máximo 1-2 centímetros en la pantalla. No es un swipe largo — es un flick rápido y controlado.',
        },
      ],
    },
    {
      id: 'j-drag',
      title: 'J-Drag — El siguiente nivel',
      blocks: [
        {
          type: 'text',
          content: 'El J-drag es un movimiento en forma de J: primero diagonal y luego hacia arriba. Es más preciso porque combina ajuste horizontal con el vertical.',
        },
        {
          type: 'text',
          content: 'Cuándo usar J-drag:',
        },
        {
          type: 'list',
          items: [
            'El enemigo se mueve lateralmente',
            'Estás en close-medium range',
            'Con SMGs (MP40, UMP) donde la cadencia es alta',
          ],
        },
        {
          type: 'text',
          content: 'Cómo se siente: imagina que dibujas una J con tu dedo en la pantalla mientras disparas. Empiezas moviendo ligeramente hacia la dirección del enemigo (horizontal) y terminas subiendo (vertical). El resultado: tu mira sigue al enemigo Y sube a la cabeza.',
        },
      ],
    },
    {
      id: 'rotation-drag',
      title: 'Rotation Drag — Nivel competitivo',
      blocks: [
        {
          type: 'text',
          content: 'El rotation es un movimiento circular/semicircular. Es el más difícil pero el más devastador con snipers.',
        },
        {
          type: 'text',
          content: 'Para qué armas:',
        },
        {
          type: 'list',
          items: [
            'AWM (un tiro, tiene que ser headshot)',
            'Kar98k (mismo concepto)',
            'M1887 (shotgun a la cabeza = instakill)',
          ],
        },
        {
          type: 'text',
          content: 'Cómo se siente: en lugar de arrastrar en línea recta, haces un pequeño arco. Esto da más control porque distribuyes el movimiento en una curva suave en lugar de un flick brusco.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'NO intentes rotation drag hasta que domines vertical y J-drag. Es como intentar hacer una patada de bicicleta sin saber chutar — vas a fallar y frustrarte.',
        },
      ],
    },
    {
      id: 'sensi-drag',
      title: 'Sensibilidad específica para drag shots',
      blocks: [
        {
          type: 'text',
          content: 'Tu sensibilidad de drag depende del tipo:',
        },
        {
          type: 'list',
          items: [
            'Drag vertical: Tu sensibilidad general es la que manda. Si sientes que no llegas al headshot, sube general 5-10 puntos.',
            'J-drag: General + Red Point. Ambas deben estar equilibradas.',
            'Rotation: Scope sensitivity. Sobre todo scope 2x y 4x para snipers.',
          ],
        },
      ],
    },
    {
      id: 'plan-7-dias',
      title: 'Rutina de práctica — Plan de 7 días',
      blocks: [
        {
          type: 'table',
          headers: ['Día', 'Ejercicio', 'Duración'],
          rows: [
            ['1-2', 'Drag vertical contra bots quietos', '15 min'],
            ['3-4', 'Drag vertical contra bots en movimiento', '15 min'],
            ['5', 'J-drag contra bots', '15 min'],
            ['6', 'Mezclar vertical + J-drag', '15 min'],
            ['7', 'Aplicar en partida casual', 'Toda la sesión'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Repite el plan cada semana. En la semana 3 agrega rotation drag al día 5-6. La consistencia es más importante que la intensidad.',
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'sensibilidad-perfecta', 'armas-sensibilidad'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 7: DPI y Sensibilidad
// ═══════════════════════════════════════════════════════════════

const dpiSensibilidad: GuideData = {
  slug: 'dpi-sensibilidad',
  title: 'DPI: Qué Es y Cómo Afecta tu Sensibilidad',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Intermedio',
  readTime: 5,
  intro: 'DPI es el dato que la mayoría de jugadores ignoran pero que cambia completamente cómo se siente tu pantalla. Entenderlo es la diferencia entre una sensibilidad "más o menos" y una sensibilidad PRECISA.',
  sections: [
    {
      id: 'que-es-dpi',
      title: '¿Qué es DPI?',
      blocks: [
        {
          type: 'text',
          content: 'DPI = Dots Per Inch (Puntos Por Pulgada). Es cuántos píxeles tiene tu pantalla por cada pulgada física. Un celular con 400 DPI tiene 400 píxeles por pulgada. Uno con 550 DPI tiene 550.',
        },
        {
          type: 'text',
          content: '¿Por qué importa? Porque cuando mueves tu dedo 1 centímetro en la pantalla, en un celular de 400 DPI cruzas menos píxeles que en uno de 550 DPI. Eso significa que el MISMO movimiento de dedo produce un giro DIFERENTE en el juego dependiendo de tu celular.',
        },
      ],
    },
    {
      id: 'dpi-y-ff',
      title: 'Cómo el DPI afecta tu sensibilidad en Free Fire',
      blocks: [
        {
          type: 'text',
          content: 'Imagina dos celulares con la MISMA sensibilidad (170 general):',
        },
        {
          type: 'list',
          items: [
            'Celular A (400 DPI): Mueves 1cm → la mira gira 30 grados',
            'Celular B (550 DPI): Mueves 1cm → la mira gira 42 grados',
          ],
        },
        {
          type: 'text',
          content: 'El celular B se SIENTE más sensible aunque el número en el juego es igual. Por eso copiar la sensibilidad de otro jugador no funciona si tienen celulares con DPI diferente.',
        },
      ],
    },
    {
      id: 'calcular-dpi',
      title: '¿Cómo sé el DPI de mi celular?',
      blocks: [
        {
          type: 'text',
          content: 'SensiPRO lo calcula automáticamente basándose en tu modelo. La fórmula es:',
        },
        {
          type: 'text',
          content: 'DPI = √(ancho² + alto² en píxeles) ÷ tamaño diagonal en pulgadas',
        },
        {
          type: 'text',
          content: 'Ejemplo: Samsung Galaxy A54',
        },
        {
          type: 'list',
          items: [
            'Resolución: 2340 × 1080 píxeles',
            'Pantalla: 6.4 pulgadas',
            'DPI = √(2340² + 1080²) ÷ 6.4 = 403 DPI',
          ],
        },
      ],
    },
    {
      id: 'dpi-en-sensipro',
      title: 'Cómo SensiPRO usa el DPI',
      blocks: [
        {
          type: 'text',
          content: 'Cuando generas tu sensibilidad en SensiPRO, el motor de cálculo ya toma en cuenta las especificaciones de tu pantalla (tamaño, resolución, tipo de panel). Esto significa que los valores generados ya están optimizados para el DPI de tu dispositivo específico.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Por eso es importante buscar tu modelo EXACTO en el generador, no uno similar. Un Samsung Galaxy A54 y un A55 tienen pantallas con DPI diferente, y eso cambia los valores óptimos.',
        },
      ],
    },
    {
      id: 'dpi-comparativa',
      title: 'DPI alto vs DPI bajo',
      blocks: [
        {
          type: 'table',
          headers: ['DPI', 'Pantalla típica', 'Efecto en sensi', 'Recomendación'],
          rows: [
            ['250-350', 'Gama baja, tablets', 'Se siente lento', 'Subir sensi'],
            ['350-450', 'Gama media', 'Equilibrado', 'Valores estándar'],
            ['450-550+', 'Gama alta, iPhones', 'Se siente rápido', 'Bajar sensi'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Si cambias de un celular gama baja a uno gama alta, tu sensibilidad anterior va a sentirse DEMASIADO rápida. Recalcula siempre que cambies de dispositivo.',
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'settings-graficos', 'giroscopio-guia'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 8: Armas y Sensibilidad
// ═══════════════════════════════════════════════════════════════

const armasSensibilidad: GuideData = {
  slug: 'armas-sensibilidad',
  title: 'Guía de Armas: Sensibilidad por Categoría',
  category: 'Armas',
  categoryColor: '#f59e0b',
  difficulty: 'Intermedio',
  readTime: 6,
  intro: 'No usas la misma sensi para una M4 que para una AWM. Cada categoría de arma necesita un estilo diferente de control. Aquí te explicamos cómo ajustar tu approach por arma.',
  sections: [
    {
      id: 'por-que-diferente',
      title: 'Por qué cada arma se siente diferente',
      blocks: [
        {
          type: 'text',
          content: 'Cada arma tiene diferente cadencia de fuego, recoil, daño, y rango efectivo. Una M4 dispara rápido con poco recoil — necesitas sensibilidad estable. Una AWM dispara una bala cada 2 segundos con daño masivo — necesitas precisión absoluta en ESE tiro.',
        },
        {
          type: 'text',
          content: 'La sensibilidad del juego aplica a TODAS las armas igual, pero tu TÉCNICA y tu SCOPE cambian por arma. Ahí es donde entra el ajuste.',
        },
      ],
    },
    {
      id: 'assault-rifles',
      title: 'Assault Rifles (M4A1, AK47, SCAR, PARAFAL)',
      blocks: [
        {
          type: 'text',
          content: 'Scope recomendado: Red Point o 2x. Técnica: Spray control + drag vertical. Rango: Medio (30-60 metros).',
        },
        {
          type: 'text',
          content: 'La M4A1 es la más versátil: recoil manejable, buena cadencia. Para spray con M4, apunta al pecho y deja que el recoil natural suba a la cabeza. Con AK47, dispara en ráfagas de 5-7 balas porque el recoil es más fuerte.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Con assault rifles, tu sensibilidad de "Red Point" es la que más importa. Debería ser 5-10 puntos menor que tu general para control preciso.',
        },
      ],
    },
    {
      id: 'smgs',
      title: 'SMGs (MP40, UMP, MAC10, Thompson-X)',
      blocks: [
        {
          type: 'text',
          content: 'Scope recomendado: Sin scope o Red Point. Técnica: J-drag + movimiento agresivo. Rango: Corto (0-30 metros).',
        },
        {
          type: 'text',
          content: 'La MP40 es la reina del close range. Con SMGs necesitas sensibilidad general REACTIVA — que te permita girar rápido si el enemigo está a tu lado. Aquí la sensibilidad general alta sí ayuda.',
        },
        {
          type: 'text',
          content: 'La MAC10 recibió buffs de daño y precisión en OB52 — es una alternativa sólida a la MP40 con cargador más grande. La Thompson-X ganó +8% tasa de fuego y +15% alcance, haciéndola más versátil a media distancia.',
        },
      ],
    },
    {
      id: 'snipers',
      title: 'Snipers y Marksman (AWM, Kar98k, Winchester)',
      blocks: [
        {
          type: 'text',
          content: 'Scope recomendado: 4x o scope AWM. Técnica: Rotation drag + un solo tiro. Rango: Largo (80-200 metros).',
        },
        {
          type: 'text',
          content: 'Con snipers, tu sensibilidad de scope 4x y scope AWM son CRÍTICAS. Deben ser BAJAS — mucho más bajas que tu general. Si tu AWM scope está en 50, cuando zoomas y el enemigo está lejos, un movimiento mínimo de tu dedo mueve la mira un montón. Bájala a 20-35.',
        },
        {
          type: 'text',
          content: 'La Winchester es nueva en OB52 y entró directamente a S-tier. Es un rifle marksman de ráfagas de 2 disparos. Usa scope 4x y necesita sensibilidad de 4x estable y baja — similar al Kar98k.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'La sensibilidad de scope AWM es la que menos entiendes hasta que la configuras bien. Un buen valor es 60-70% de tu sensibilidad de scope 4x.',
        },
      ],
    },
    {
      id: 'shotguns',
      title: 'Shotguns (M1887, M1014)',
      blocks: [
        {
          type: 'text',
          content: 'Scope recomendado: Sin scope. Técnica: Flick shot + posicionamiento. Rango: Muy corto (0-15 metros).',
        },
        {
          type: 'text',
          content: 'Con shotguns, la sensibilidad general ALTA es tu amiga. Necesitas girar instantáneamente hacia el enemigo y disparar. El M1887 con headshot es instakill — pero necesitas apuntar rápido.',
        },
      ],
    },
    {
      id: 'tabla-resumen',
      title: 'Tabla resumen de sensibilidad por arma',
      blocks: [
        {
          type: 'table',
          headers: ['Arma', 'Scope principal', 'Sensi scope clave', 'Técnica de drag', 'Prioridad'],
          rows: [
            ['M4A1', 'Red Point', 'Red Point -5 a -10', 'Vertical', 'Control spray'],
            ['AK47', 'Red Point', 'Red Point -5 a -10', 'Vertical (ráfagas)', 'Control recoil'],
            ['MP40', 'Sin scope', 'General alta', 'J-drag', 'Velocidad'],
            ['AWM', 'AWM scope', 'Scope AWM muy baja', 'Rotation', 'Precisión 1 tiro'],
            ['Kar98k', '4x', 'Scope 4x baja', 'Rotation', 'Precisión rápida'],
            ['Winchester', '4x', 'Scope 4x baja', 'Vertical', 'Ráfagas precisas'],
            ['M1887', 'Sin scope', 'General alta', 'Flick', 'Reacción'],
            ['SCAR', '2x', 'Scope 2x media', 'Vertical', 'Balance'],
            ['MAC10', 'Sin scope', 'General alta', 'J-drag', 'DPS close range'],
            ['Thompson-X', 'Red Point', 'Red Point media', 'J-drag', 'Versatilidad'],
            ['Desert Eagle', 'Sin scope', 'General alta', 'Flick', 'One-tap secondary'],
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'headshots-consistentes', 'drag-shot-tecnicas'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 9: Combos de Personajes
// ═══════════════════════════════════════════════════════════════

const combosPersonajes: GuideData = {
  slug: 'combos-personajes',
  title: 'Combos de Personajes: Qué Equipar Según tu Estilo',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Intermedio',
  readTime: 8,
  intro: 'En Free Fire tu activa define tu estilo y tus pasivas cubren los huecos. La diferencia entre un jugador bueno y uno que da miedo es saber qué combo usar según la situación.',
  sections: [
    {
      id: 'como-funcionan',
      title: 'Cómo funcionan los combos en Free Fire',
      blocks: [
        {
          type: 'text',
          content: 'Puedes equipar 1 habilidad activa + 3 pasivas (o 4 pasivas sin activa). Tu activa define qué haces: Alok para versatilidad, Tatsuya para agresión, Skyler para destruir coberturas. Tus pasivas cubren los huecos.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Tu activa define qué haces. Tus pasivas definen qué tan bien sobrevives haciéndolo. Tu mascota amplifica tu fortaleza principal.',
        },
      ],
    },
    {
      id: 'combos-rusher',
      title: 'Combos para Rusher / Agresivo',
      blocks: [
        {
          type: 'text',
          content: '<strong>RUSHER IMPARABLE:</strong> Alok (activa) + Jota + D-Bee + Hayato | Mascota: Detective Panda',
        },
        {
          type: 'text',
          content: 'Activas Alok y te olvidas — cura + velocidad 10 segundos. Jota + Panda te dan ~50 HP por cada kill. D-Bee te da +35% precisión moviéndote. Hayato rompe chalecos cuando te queda poca vida. Ideal para 2 dedos y ranked.',
        },
        {
          type: 'text',
          content: '<strong>FANTASMA VELOZ:</strong> Tatsuya (activa) + Jota + D-Bee + Dasha | Mascota: Rockie',
        },
        {
          type: 'text',
          content: 'Dash instantáneo con Tatsuya, eliminar, el dash se resetea, repetir. Dasha sube la cadencia de fuego con cada knock. Rockie reduce el cooldown del dash. Apareces y desapareces como fantasma. Ideal para 3-4 dedos y Clash Squad.',
        },
        {
          type: 'text',
          content: '<strong>TANQUE DE ASALTO:</strong> Xayne (activa) + Jota + Hayato + D-Bee | Mascota: Detective Panda',
        },
        {
          type: 'text',
          content: 'Xayne te da +70 HP temporales (buffed OB52) — entras con 270+ HP efectivos. Jota + Panda curan por kills. Hayato penetra chalecos. Entras como tanque y sales con más vida. Ideal para 4 dedos agresivos.',
        },
      ],
    },
    {
      id: 'combos-ranked',
      title: 'Combos para Balanceado / Ranked',
      blocks: [
        {
          type: 'text',
          content: '<strong>RANKED ESTÁNDAR:</strong> Alok (activa) + Jota + Kelly + Andrew | Mascota: Mr. Waggor',
        },
        {
          type: 'text',
          content: 'El combo gold-standard para ranked. Alok cura al equipo, Kelly te mueve rápido, Andrew protege tu armadura en peleas largas. Mr. Waggor te salva con Gloo Walls en círculos finales. Simple, efectivo, nunca falla. Ideal para principiantes-intermedios.',
        },
        {
          type: 'text',
          content: '<strong>ESCUDO PERFECTO:</strong> Chrono (activa) + Jota + D-Bee + Hayato | Mascota: Rockie',
        },
        {
          type: 'text',
          content: 'Chrono crea un escudo que bloquea 600 de daño — tú disparas desde adentro. Con 4 dedos puedes activar Chrono en el momento exacto que te disparan. La defensa perfecta que también ataca.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Para ranked, el combo Alok + Jota + Kelly + Andrew es el más seguro. Si no sabes qué usar, empieza con ese.',
        },
      ],
    },
    {
      id: 'combos-sniper',
      title: 'Combos para Francotirador / Sniper',
      blocks: [
        {
          type: 'text',
          content: '<strong>SOMBRA LETAL:</strong> Alok (activa) + Rafael + Laura + Maro | Mascota: Mr. Waggor',
        },
        {
          type: 'text',
          content: 'Laura +60% precisión con scope. Rafael silencia tu sniper — nadie sabe de dónde disparas. Maro +25% daño a distancia. Un solo disparo letal desde la sombra. Ideal para 2 dedos y jugadores pacientes.',
        },
        {
          type: 'text',
          content: '<strong>CADENA LETAL:</strong> Skyler (activa) + Maro + Moco + Rafael | Mascota: Mr. Waggor',
        },
        {
          type: 'text',
          content: 'Moco marca al primer disparo, Maro activa +28% daño contra marcados, Rafael te mantiene invisible, Skyler destruye Gloo Walls para que no se cubran. La cadena letal completa. Ideal para 3-4 dedos experimentados.',
        },
        {
          type: 'text',
          content: '<strong>ZERO BOTONES (4 pasivas):</strong> Rafael + Moco + Rin Yagami + Maro | Mascota: Mr. Waggor',
        },
        {
          type: 'text',
          content: 'Cero botones que activar. Todo funciona solo mientras tú solo apuntas y disparas. El combo sniper más elegante del juego. Ideal para 4 dedos que quieren 100% enfoque en aim.',
        },
      ],
    },
    {
      id: 'combos-cs',
      title: 'Combos para Clash Squad',
      blocks: [
        {
          type: 'text',
          content: '<strong>CS DOMINANTE:</strong> Tatsuya (activa) + Wolfrahh + Luna + D-Bee | Mascota: Rockie',
        },
        {
          type: 'text',
          content: 'Dash dirigido, Wolfrahh amplifica headshots por cada kill, Luna dispara más rápido, D-Bee precisión moviéndote. En Clash Squad donde cada ronda importa, este combo escala con cada eliminación. Ideal para 4 dedos y alto nivel.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'En Clash Squad los combos de alto skill ceiling (Tatsuya, Wolfrahh) brillan más porque las rondas son cortas y cada kill cuenta.',
        },
      ],
    },
    {
      id: 'mascotas',
      title: 'Mascotas: cuál elegir y por qué',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Rockie</strong> — Reduce cooldown de tu activa 15%. Si tu build depende de Alok, Skyler o Tatsuya, Rockie la hace más disponible. El más versátil.',
            '<strong>Mr. Waggor</strong> — Genera 1 Gloo Wall gratis cada 100s cuando tienes 0. Te salva en círculos finales. El mejor para Battle Royale.',
            '<strong>Detective Panda</strong> — +10 HP por cada kill. Con Jota = ~50 HP por eliminación. El combo más roto para rushers.',
            '<strong>Falco</strong> — +50% velocidad de planeo para todo el squad. Domina el early game. Perfecto para squads coordinados.',
            '<strong>Spirit Fox</strong> — +10 HP extra al usar medkit. Buena para builds de sustain con K o Maxim.',
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'transicion-dedos', 'armas-sensibilidad'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 10: Transición de 2 a 3 Dedos
// ═══════════════════════════════════════════════════════════════

const transicionDedos: GuideData = {
  slug: 'transicion-dedos',
  title: 'Cómo Pasar de 2 a 3 Dedos sin Morir en el Intento',
  category: 'HUD',
  categoryColor: '#a855f7',
  difficulty: 'Intermedio',
  readTime: 7,
  intro: 'Con 2 dedos solo puedes hacer 2 cosas a la vez. Con 3 puedes mover + apuntar + disparar al mismo tiempo. Es el salto más grande que puedes dar en Free Fire. Aquí te guiamos paso a paso.',
  sections: [
    {
      id: 'por-que-3-dedos',
      title: 'Por qué 3 dedos cambia todo',
      blocks: [
        {
          type: 'text',
          content: 'Con 2 dedos solo puedes mover + apuntar O apuntar + disparar. Con 3 dedos puedes mover + apuntar + disparar al mismo tiempo. Eso desbloquea el Peek & Fire (asomarte y disparar simultáneamente) y el J-Drag se vuelve devastador.',
        },
        {
          type: 'text',
          content: 'El 3 dedos es el estándar competitivo de Free Fire LATAM. No necesitas 4 para ser bueno — 3 es suficiente para llegar a Heroico.',
        },
      ],
    },
    {
      id: 'rendimiento-baja',
      title: 'Tu rendimiento VA A BAJAR las primeras 48-72 horas',
      blocks: [
        {
          type: 'text',
          content: 'Es NORMAL. Tu cerebro está aprendiendo a coordinar un dedo nuevo. NO vuelvas a 2 dedos — aguanta. En 3-5 días ya se siente natural. En 2 semanas eres mejor que antes con 2 dedos.',
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'NO practiques en ranked las primeras 48 horas. Usa Training Ground y partidas casual. Te vas a frustrar y vas a querer volver a 2 dedos — resiste.',
        },
      ],
    },
    {
      id: 'plan-transicion',
      title: 'Plan de transición paso a paso',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            '<strong>Día 1-2:</strong> Solo agacharte con el índice. No cambies nada más. Juega normalmente con 2 pulgares pero tu índice derecho solo se agacha. Acostúmbrate a tener el dedo ahí.',
            '<strong>Día 3-4:</strong> Agacharse + disparar. Coordina: el índice agacha mientras el pulgar dispara. Practica en Training Ground 15 min antes de jugar.',
            '<strong>Día 5-7:</strong> J-Drag con 3 dedos. El pulgar derecho hace el drag, el índice maneja agacharse y scope. Empieza Clash Squad casual.',
            '<strong>Semana 2:</strong> Añade cambiar arma al índice. Progresivamente mueve más acciones al tercer dedo hasta que todo sea natural.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Solo mueve 1 acción a la vez al tercer dedo. Si intentas cambiar todo de golpe, tu cerebro se sobrecarga y abandonas.',
        },
      ],
    },
    {
      id: 'hud-3-dedos',
      title: 'Cómo configurar tu HUD para 3 dedos',
      blocks: [
        {
          type: 'text',
          content: 'El botón de agacharse va arriba a la derecha — donde tu índice descansa naturalmente. El botón de disparo se queda donde está para el pulgar. El scope va cerca del agacharse para que el índice acceda a ambos.',
        },
        {
          type: 'text',
          content: 'El tamaño del botón de disparo para 3 dedos debe ser ~52% (SensiPRO lo calcula según tu pantalla). En el Headshot Mode y en la guía de HUD puedes encontrar códigos HUD listos para 3 dedos.',
        },
      ],
    },
    {
      id: 'errores-cambio',
      title: 'Errores comunes al cambiar de dedos',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Volver a 2 dedos después de 1 día malo</strong> — Dale al menos 5 días completos. SIEMPRE.',
            '<strong>Cambiar todo el HUD de golpe</strong> — Solo mueve 1 botón a la vez. Tu cerebro no puede procesar 5 cambios simultáneos.',
            '<strong>Practicar en ranked</strong> — Usa Training Ground y casual las primeras 48h. No arruines tu rank por impaciente.',
            '<strong>Botón de disparo muy arriba</strong> — Debe estar donde el pulgar descansa naturalmente, no donde el índice está.',
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'El error #1 es rendirse el día 2. El 90% de la gente que lo intenta y falla, falla porque no aguantó la primera semana.',
        },
      ],
    },
  ],
  relatedSlugs: ['configuracion-hud', 'combos-personajes', 'drag-shot-tecnicas'],
};

// ═══════════════════════════════════════════════════════════════
// GUÍA 11: Crosshair Placement
// ═══════════════════════════════════════════════════════════════

const crosshairPlacement: GuideData = {
  slug: 'crosshair-placement',
  title: 'Crosshair Placement: El Secreto que Nadie te Enseña',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Principiante',
  readTime: 5,
  intro: 'El 90% de los jugadores caminan mirando al suelo. Esto les cuesta medio segundo en cada fight — y en Free Fire, medio segundo = muerte. La solución es estúpidamente simple.',
  sections: [
    {
      id: 'error-numero-1',
      title: 'El error #1 de Free Fire',
      blocks: [
        {
          type: 'text',
          content: 'El 90% de los jugadores caminan con el crosshair apuntando a las rodillas del enemigo. Cuando ven a alguien, tienen que mover la mira desde las rodillas hasta la cabeza — eso tarda medio segundo.',
        },
        {
          type: 'text',
          content: 'La solución: SIEMPRE mantén el crosshair a la altura de la cabeza del enemigo, incluso cuando caminas. Cuando aparezca alguien, ya estás apuntando.',
        },
      ],
    },
    {
      id: 'reglas-oro',
      title: 'Las 3 reglas de oro',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>REGLA 1 — DE PIE:</strong> Tu crosshair va a la altura de los ojos del enemigo. No al pecho, no al cuello — a los OJOS.',
            '<strong>REGLA 2 — AGACHADO:</strong> Si el enemigo está agachado, baja tu mira al nivel del cuello de un personaje de pie. Esa es la cabeza de alguien agachado.',
            '<strong>REGLA 3 — GLOO WALL:</strong> Pre-apunta a donde va a salir la cabeza cuando se asome. A la derecha o izquierda de la wall, a la altura correcta. Cuando se asome, solo disparas.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Camina mirando las esquinas y puertas a la altura de la cabeza. Cuando alguien aparezca, ya estás apuntando correctamente.',
        },
      ],
    },
    {
      id: 'pre-aim',
      title: 'Pre-aim: apuntar antes de ver',
      blocks: [
        {
          type: 'text',
          content: 'Pre-aim es poner tu crosshair donde CREES que va a estar la cabeza del enemigo ANTES de verlo. En puertas, esquinas, detrás de walls, spots comunes.',
        },
        {
          type: 'text',
          content: 'Si pre-apuntas a una puerta a la altura de la cabeza y alguien sale corriendo, tu tiempo de reacción pasa de "ver → apuntar → disparar" a solo "ver → disparar". Te ahorras 200-300 milisegundos.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: '200-300 milisegundos no suena a mucho. Pero en Free Fire es la diferencia entre hacer headshot o que TE hagan headshot.',
        },
      ],
    },
    {
      id: 'como-practicar',
      title: 'Cómo practicar crosshair placement',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'En Training Ground, camina por todo el mapa manteniendo el crosshair a la altura de los maniquíes. No dispares — solo camina y mantén la altura.',
            'En partidas casual, enfócate SOLO en mantener el crosshair alto. No te preocupes por ganar — enfócate en nunca mirar al suelo.',
            'Después de 3-4 días, se vuelve automático. Tu cerebro lo hace sin pensar.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Haz esto 5 minutos antes de cada sesión de ranked. Es el warmup más efectivo que existe — y nadie lo hace.',
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'drag-shot-tecnicas', 'sensibilidad-perfecta'],
};

// ═══════════════════════════════════════════════════════════════
// EXPORT — Mapa de todas las guías por slug
// ═══════════════════════════════════════════════════════════════

export const GUIDE_CONTENT: Record<string, GuideData> = {
  'sensibilidad-perfecta': sensibilidadPerfecta,
  'configuracion-hud': configuracionHud,
  'headshots-consistentes': headshotsConsistentes,
  'settings-graficos': settingsGraficos,
  'giroscopio-guia': giroscopioGuia,
  'drag-shot-tecnicas': dragShotTecnicas,
  'dpi-sensibilidad': dpiSensibilidad,
  'armas-sensibilidad': armasSensibilidad,
  'combos-personajes': combosPersonajes,
  'transicion-dedos': transicionDedos,
  'crosshair-placement': crosshairPlacement,
};

export const ALL_GUIDE_SLUGS = Object.keys(GUIDE_CONTENT);

export function getGuideContent(slug: string): GuideData | undefined {
  return GUIDE_CONTENT[slug];
}

export function getRelatedGuides(slugs: string[]): GuideData[] {
  return slugs
    .map((s) => GUIDE_CONTENT[s])
    .filter((g): g is GuideData => g !== undefined);
}
