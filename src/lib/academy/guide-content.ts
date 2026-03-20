// ═══════════════════════════════════════════════════════════════
// ARES — Contenido completo de las 11 guías de academia
// Basado en datos REALES del algoritmo ARES v5.0
// 613 dispositivos, 21 marcas, datos calibrados con specs de hardware real
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
// GUIA 1: Sensibilidad Perfecta
// ═══════════════════════════════════════════════════════════════

const sensibilidadPerfecta: GuideData = {
  slug: 'sensibilidad-perfecta',
  title: 'Cómo Encontrar tu Sensibilidad Perfecta',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Principiante',
  readTime: 6,
  intro: 'Copiar la sensibilidad de un pro no funciona. Su celular tiene diferente DPI, diferente tasa de refresco y diferente tamaño de pantalla. ARES v5.0 calcula TU sensibilidad usando las specs exactas de tu dispositivo: DPI, RAM, tasa de refresco y tipo de panel.',
  sections: [
    {
      id: 'por-que-no-copiar',
      title: 'Por qué copiar la sensi de un YouTuber te arruina',
      blocks: [
        {
          type: 'text',
          content: 'La sensibilidad depende del DPI de tu pantalla. Un iPhone 16 Pro Max tiene ~460 DPI y necesita General ~87. Un Samsung A06 tiene ~270 DPI y necesita General ~117. Si copias la sensi del iPhone en tu Samsung, vas a sentir la mira como si tuvieras los dedos congelados.',
        },
        {
          type: 'text',
          content: 'Y no es solo DPI. La RAM afecta los FPS, los Hz afectan la suavidad del tracking, y el tamaño de pantalla cambia cuanto recorre tu dedo. Son 4 factores que ARES calcula simultáneamente.',
        },
        {
          type: 'callout',
          variant: 'error',
          content: '"Mi amigo usa 150 de General y le va bien" — Tu amigo tiene un celular con DPI diferente. Ese 150 en su pantalla equivale a un número completamente distinto en la tuya.',
        },
      ],
    },
    {
      id: 'algoritmo-real',
      title: 'Cómo ARES v5.0 calcula tu sensibilidad (datos reales)',
      blocks: [
        {
          type: 'text',
          content: 'El motor usa interpolación lineal por segmentos de DPI para calcular tu General base. Después aplica 3 ajustes secundarios y un boost por estilo de juego. Todo clampeado entre 1 y 200.',
        },
        {
          type: 'table',
          headers: ['DPI del celular', 'General base'],
          rows: [
            ['200 o menos', '130'],
            ['200-280', '130-115 (interpolado)'],
            ['280-400', '115-100 (interpolado)'],
            ['400-460', '100-88 (interpolado)'],
            ['460-600', '88-75 (interpolado)'],
            ['600 o más', '75'],
          ],
        },
        {
          type: 'text',
          content: 'Después del General base, se suman/restan estos ajustes:',
        },
        {
          type: 'table',
          headers: ['Factor', 'Valor bajo', 'Valor medio', 'Valor alto'],
          rows: [
            ['RAM', '2GB: -4 | 3GB: -2 | 4GB: -1', '6GB: 0', '8GB: +1 | 12GB: +2 | 16GB: +3'],
            ['Hz', '60Hz: +3 | 90Hz: +1', '120Hz: 0', '144Hz: -1 | 165Hz: -2'],
            ['Pantalla', '<5.5": +3 | <6.0": +1', '<6.5": 0', '<6.7": -1 | <7.0": -2 | <8.0": -4'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'DPI bajo = sensibilidad alta. DPI alto = sensibilidad baja. El motor compensa automáticamente para que el MISMO movimiento de dedo produzca el MISMO giro en cualquier celular.',
        },
      ],
    },
    {
      id: 'ejemplo-real',
      title: 'Ejemplo real: Samsung A06 vs iPhone 16 Pro Max',
      blocks: [
        {
          type: 'text',
          content: 'Samsung Galaxy A06 — Gama baja (LOW tier, 270 DPI, 4GB RAM, 60Hz, pantalla 6.7"):',
        },
        {
          type: 'ordered-list',
          items: [
            'DPI 270 cae en segmento 200-280: General base = ~117',
            'RAM 4GB: ajuste -1 = 116',
            'Hz 60: ajuste +3 = 119',
            'Pantalla 6.7": ajuste -1 = 118',
            'Estilo BALANCED: boost +0 = 118 final',
          ],
        },
        {
          type: 'text',
          content: 'iPhone 16 Pro Max — Gama gaming (GAMING tier, 460 DPI, 8GB RAM, 120Hz, pantalla 6.9"):',
        },
        {
          type: 'ordered-list',
          items: [
            'DPI 460 cae en segmento 400-460: General base = ~88',
            'RAM 8GB: ajuste +1 = 89',
            'Hz 120: ajuste 0 = 89',
            'Pantalla 6.9": ajuste -2 = 87',
            'Estilo BALANCED: boost +0 = 87 final',
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'La diferencia es de 31 puntos (118 vs 87). Si copias la sensi del iPhone al Samsung, vas a tener la mira DEMASIADO lenta. Y viceversa, demasiado rápida. Por eso NECESITAS el cálculo por dispositivo.',
        },
      ],
    },
    {
      id: 'ratios-pro',
      title: 'Cómo se calculan los demás sliders (ratios de pros)',
      blocks: [
        {
          type: 'text',
          content: 'Una vez que ARES calcula tu General, los demás valores se generan multiplicando General por ratios calibrados con datos de hardware real. Cada estilo tiene sus propios ratios.',
        },
        {
          type: 'table',
          headers: ['Slider', 'Agresivo (ratio)', 'Balanceado (ratio)', 'Francotirador (ratio)'],
          rows: [
            ['Punto Rojo', '0.78x', '0.95x', '1.06x'],
            ['Mira 2x', '0.64x', '0.90x', '1.00x'],
            ['Mira 4x', '0.61x', '0.80x', '0.88x'],
            ['AWM', '1.07x', '0.60x', '0.59x'],
            ['Vista Libre', '0.93x', '0.68x', '0.63x'],
          ],
        },
        {
          type: 'text',
          content: 'Ejemplo con Samsung A06 BALANCED (General=118): Punto Rojo = 118x0.95 = 112, Mira 2x = 118x0.90 = 106, Mira 4x = 118x0.80 = 94, AWM = 118x0.60 = 71, Vista Libre = 118x0.68 = 80.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Los pros agresivos ponen el AWM en 1.07x del General (MAS alto que el General) para quickscoping. Los snipers lo bajan a 0.59x para control total con scope. ARES aplica el ratio correcto segun tu estilo.',
        },
      ],
    },
    {
      id: 'estilos',
      title: 'Los 3 estilos y su boost al General',
      blocks: [
        {
          type: 'table',
          headers: ['Estilo', 'Boost al General', 'Para quién'],
          rows: [
            ['Agresivo', '+40 puntos', 'Rushers, close range, MP40 y escopetas'],
            ['Balanceado', '+0 (baseline)', 'Ranked estándar, todo terreno'],
            ['Francotirador', '-20 puntos', 'Snipers, larga distancia, control máximo'],
          ],
        },
        {
          type: 'text',
          content: 'Con el Samsung A06: Agresivo = 118+40 = 158 General. Francotirador = 118-20 = 98. La diferencia de 60 puntos entre Agresivo y Francotirador es exactamente lo que necesitas para cada estilo.',
        },
      ],
    },
    {
      id: 'cuando-ajustar',
      title: 'Cuándo recalcular tu sensibilidad',
      blocks: [
        {
          type: 'list',
          items: [
            'Cambias de celular (OBLIGATORIO — el DPI cambia)',
            'Cambias de 2 a 3 o 4 dedos (los multiplicadores de dedo cambian los ratios)',
            'Actualizas el sistema operativo (puede cambiar el DPI rendering)',
            'Llevas 2+ semanas sin mejorar y ya probaste todo lo demás',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'No cambies tu sensibilidad después de cada mala partida. Dale mínimo 3-5 días para que tu memoria muscular se adapte. Tu cerebro necesita tiempo para recalibrarse.',
        },
      ],
    },
  ],
  relatedSlugs: ['dpi-sensibilidad', 'configuracion-hud', 'giroscopio-guia'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 2: Configuración de HUD
// ═══════════════════════════════════════════════════════════════

const configuracionHud: GuideData = {
  slug: 'configuracion-hud',
  title: 'Configuración de HUD para 2, 3 y 4 Dedos',
  category: 'HUD',
  categoryColor: '#a855f7',
  difficulty: 'Intermedio',
  readTime: 8,
  intro: 'Tu HUD define qué tan rápido reaccionas en un fight. El tamaño del botón de disparo, la posición de los controles, y cuántos dedos usas cambian TOTALMENTE cómo debes configurar tu pantalla. ARES calcula el tamaño de botón exacto según tu pantalla y estilo.',
  sections: [
    {
      id: 'boton-disparo',
      title: 'Tamaño del botón de disparo: la ciencia detrás',
      blocks: [
        {
          type: 'text',
          content: 'ARES calcula el tamaño del botón de disparo cruzando 3 variables: cuántos dedos usas, el tamaño de tu pantalla, y tu estilo de juego. Más dedos = botón más chico porque tienes un dedo dedicado a disparar.',
        },
        {
          type: 'table',
          headers: ['Pantalla', '2 Dedos', '3 Dedos', '4 Dedos'],
          rows: [
            ['< 6.0" (compacta)', '70%', '60%', '55%'],
            ['6.0" - 6.5" (estándar)', '65%', '55%', '50%'],
            ['6.5" - 6.8" (grande)', '60%', '52%', '48%'],
            ['> 6.8" (extra grande)', '55%', '48%', '44%'],
          ],
        },
        {
          type: 'text',
          content: 'Encima de estos valores base, el estilo suma o resta: AGRESIVO +5% (botón más grande para CQC), FRANCOTIRADOR -5% (más chico para mejor visibilidad). Clampeado entre 35% y 80%.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Un jugador de 2 dedos en pantalla de 6.1" necesita botón de 65%. El mismo jugador con 4 dedos en la misma pantalla solo necesita 50%. La diferencia es que con 4 dedos tu índice se dedica SOLO a disparar.',
        },
      ],
    },
    {
      id: 'hud-2-dedos',
      title: 'HUD para 2 Dedos — Máxima simplicidad',
      blocks: [
        {
          type: 'text',
          content: 'Con 2 dedos (pulgares) no puedes mover y disparar al mismo tiempo. Tu HUD debe minimizar la distancia entre movimiento y disparo. El botón de disparo va GRANDE (55-70%) en la parte derecha.',
        },
        {
          type: 'list',
          items: [
            'Joystick izquierdo: posición default, tamaño medio',
            'Botón de disparo: lado derecho, tamaño 55-70% según pantalla',
            'Mira: centro-derecha, alcanzable con el pulgar derecho',
            'Agacharse y saltar: esquina inferior derecha, más pequeños',
            'Mapa: esquina superior izquierda, tamaño mínimo',
            'Transparencia del botón: ~60% para no tapar enemigos',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Con 2 dedos el drag headshot se hace con el pulgar derecho arrastrando RECTO HACIA ARRIBA. El botón grande te da más área de contacto para el drag. No lo hagas más chico por estética.',
        },
      ],
    },
    {
      id: 'hud-3-dedos',
      title: 'HUD para 3 Dedos — El estándar competitivo',
      blocks: [
        {
          type: 'text',
          content: 'Con 3 dedos (2 pulgares + índice derecho) desbloqueas el Peek & Fire. El índice derecho se encarga de agacharse y scope. Tu pulgar derecho sigue haciendo el drag para headshots.',
        },
        {
          type: 'list',
          items: [
            'Botón de disparo: lado derecho, 48-60% según pantalla',
            'Agacharse: esquina superior derecha (para el índice)',
            'Scope/Mira: arriba derecha, cerca del agacharse',
            'Joystick: posición default izquierda',
            'Cambiar arma: accesible para el pulgar derecho',
            'Transparencia del botón: ~55%',
          ],
        },
        {
          type: 'text',
          content: 'El índice derecho se encarga SOLO de agacharse y mira. Los pulgares hacen todo lo demás. No intentes hacer más con el índice al principio.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'La posición del agacharse arriba a la derecha es CLAVE. Tu índice descansa naturalmente ahí cuando agarras el celular con 3 dedos. Si lo pones en otro lugar, te va a cansar la mano.',
        },
      ],
    },
    {
      id: 'hud-4-dedos',
      title: 'HUD para 4 Dedos (Garra) — Control total',
      blocks: [
        {
          type: 'text',
          content: 'La garra (2 pulgares + 2 índices) desbloquea TODO: saltar+disparar, agacharse+disparar, peek+fire. Botón de disparo va CHICO (44-55%) porque tu índice derecho se dedica exclusivamente a disparar.',
        },
        {
          type: 'list',
          items: [
            'Índice izquierdo: scope y saltar (esquina superior izquierda)',
            'Índice derecho: disparar y agacharse (esquina superior derecha)',
            'Pulgar izquierdo: joystick (movimiento)',
            'Pulgar derecho: apuntar (drag) + botones secundarios',
            'Botón de disparo: 44-55% según pantalla, transparencia ~50%',
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'NO intentes 4 dedos si no dominas 3. La garra requiere 3-4 semanas de adaptación. Vas a jugar PEOR las primeras 2 semanas. Es normal — la mejora después es brutal.',
        },
      ],
    },
    {
      id: 'codigos-hud',
      title: 'Códigos HUD reales para copiar al juego',
      blocks: [
        {
          type: 'text',
          content: 'Códigos HUD de Free Fire que puedes copiar directo. Cada uno está optimizado para diferente cantidad de dedos. Copia el código completo (con el #), ve a Ajustes > Controles > Importar.',
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
          content: 'Empieza con el código "Básico" o "Estándar" de tu cantidad de dedos. Después de 1-2 semanas cuando ya estés cómodo, prueba los competitivos.',
        },
      ],
    },
    {
      id: 'elegir-dedos',
      title: 'Tabla comparativa: 2 vs 3 vs 4 dedos',
      blocks: [
        {
          type: 'table',
          headers: ['Factor', '2 Dedos', '3 Dedos', '4 Dedos'],
          rows: [
            ['Nivel competitivo', 'Casual', 'Competitivo', 'Pro'],
            ['Acciones simultáneas', '2', '3', '4'],
            ['Saltar + Disparar', 'No', 'No', 'Sí'],
            ['Peek & Fire', 'No', 'Sí', 'Sí'],
            ['Agacharse + Disparar', 'No', 'No', 'Sí'],
            ['Adaptación (días)', '3', '14', '28'],
            ['Botón de disparo', '55-70%', '48-60%', '44-55%'],
            ['Gyro recomendado', 'No', 'Opcional (20-30)', 'Sí (25-40)'],
            ['Mejores armas', 'Escopetas, SMGs', 'ARs, SMGs', 'Todas'],
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'transicion-dedos', 'drag-shot-tecnicas'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 3: Headshots Consistentes
// ═══════════════════════════════════════════════════════════════

const headshotsConsistentes: GuideData = {
  slug: 'headshots-consistentes',
  title: 'Cómo Hacer Headshots Consistentes',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Intermedio',
  readTime: 7,
  intro: 'Los headshots no son suerte. Son sensibilidad calibrada + crosshair placement + cascade enforcement. ARES tiene un motor completo de headshot que aplica multiplicadores específicos sobre tu sensibilidad base para optimizar el tiro a la cabeza.',
  sections: [
    {
      id: 'headshot-modifiers',
      title: 'Los multiplicadores headshot de ARES (datos reales)',
      blocks: [
        {
          type: 'text',
          content: 'El Headshot Mode de ARES toma tu sensibilidad base y aplica multiplicadores por slider. El Punto Rojo SUBE un 18% porque el drag headshot depende del Punto Rojo. Las miras con zoom BAJAN para estabilidad.',
        },
        {
          type: 'table',
          headers: ['Slider', 'Multiplicador Headshot', 'Efecto'],
          rows: [
            ['General', '1.07x (+7%)', 'Giros más rápidos para adquirir target'],
            ['Punto Rojo', '1.18x (+18%)', 'Drag headshot más responsivo'],
            ['Mira 2x', '1.10x (+10%)', 'Tracking a media distancia'],
            ['Mira 4x', '0.92x (-8%)', 'Más estabilidad con zoom'],
            ['AWM', '0.88x (-12%)', 'Control máximo para one-shot'],
            ['Vista Libre', '1.05x (+5%)', 'Recolocación rápida'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'El Punto Rojo sube +18% en modo headshot porque los pros usan el Punto Rojo para el 70% de sus headshots. Es la mira que mejor se presta para drag porque está diseñada para combate cercano-medio.',
        },
      ],
    },
    {
      id: 'cascade',
      title: 'La regla del Cascade: General >= Punto Rojo >= 2x >= 4x',
      blocks: [
        {
          type: 'text',
          content: 'ARES enforce una cascada obligatoria en modo headshot: tu General siempre es mayor o igual que tu Punto Rojo, que es mayor o igual que tu 2x, que es mayor o igual que tu 4x. El AWM y Vista Libre son independientes.',
        },
        {
          type: 'text',
          content: 'Si los multiplicadores producen un Punto Rojo mayor que el General, se clampea al General. Si el 2x queda mayor que el Punto Rojo, se clampea al Punto Rojo. Esta cascada evita que la mira brinque al cambiar de scope.',
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'Si tu Punto Rojo es MAS ALTO que tu General, cada vez que abres la mira sientes un salto brusco. El cascade lo previene. Si ajustas manualmente, RESPETA la cadena: General >= RP >= 2x >= 4x.',
        },
      ],
    },
    {
      id: 'reglas-crosshair',
      title: 'Las 3 reglas de crosshair para headshots',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>REGLA 1 — SIEMPRE a nivel de cabeza:</strong> Tu crosshair va a la altura de los ojos del enemigo. No al pecho, no al cuello. Si caminas mirando al suelo, ya perdiste medio segundo antes de que empiece el fight.',
            '<strong>REGLA 2 — Pre-aim en esquinas:</strong> Pre-apunta a nivel de cabeza ANTES de ver al enemigo. En puertas, esquinas, detrás de Gloo Walls. Cuando aparezca alguien, solo disparas. Te ahorras 200-300ms.',
            '<strong>REGLA 3 — El aim assist favorece body shots:</strong> Free Fire tiene aim assist que jala al CUERPO. El drag manual hacia ARRIBA es la única forma de headshot consistente. No dependas del aim assist.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'En combate cercano, apunta al cuello. El recoil natural de las balas sube al headshot solo. Con M4A1 o SCAR, las balas 3-5 del spray naturalmente suben a la cabeza si empezaste en el cuello.',
        },
      ],
    },
    {
      id: 'headshot-score',
      title: 'Tu Headshot Score: qué lo sube y qué lo baja',
      blocks: [
        {
          type: 'text',
          content: 'ARES calcula un Headshot Score de 0-100 basado en tu hardware y tu configuración. Empieza en 50 y suma o resta segun factores reales:',
        },
        {
          type: 'table',
          headers: ['Factor', 'Bonus', 'Condición'],
          rows: [
            ['120Hz+', '+10', 'Más frames = mejor tracking de cabeza'],
            ['90Hz', '+5', 'Mejora leve vs 60Hz'],
            ['Panel AMOLED/OLED/LTPO', '+8', 'Mejor respuesta táctil'],
            ['Punto Rojo 85-120', '+10', 'Rango óptimo de drag headshot'],
            ['General 80-150', '+5', 'Rango competitivo de General'],
            ['Pantalla 6.0"-6.7"', '+5', 'Sweet spot para drag'],
            ['Tier GAMING/ULTRA', '+5', 'Hardware premium'],
            ['RP/General ratio 0.9-1.1', '+5', 'Config optimizada para headshot'],
          ],
        },
        {
          type: 'text',
          content: 'Un Samsung Galaxy S24 Ultra (120Hz, AMOLED, ULTRA tier, 6.8") con buena config puede llegar a score 88+. Un gama baja con 60Hz y LCD se queda en ~55. El score te dice qué TAN equipado estás para headshots.',
        },
      ],
    },
    {
      id: 'rutina-headshots',
      title: 'Rutina de 15 minutos antes de ranked',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'Minutos 1-3: Warmup con Desert Eagle — 50 disparos a maniquíes, SOLO headshots. Cambia distancia cada 10 disparos.',
            'Minutos 3-6: Drag vertical con M4A1 — apunta al pecho de maniquíes y arrastra hacia arriba. 30 repeticiones. Objetivo: 60% accuracy.',
            'Minutos 6-9: Rotation drag (J-Drag) con M1887 — posiciónate lateral al maniquí y haz la J. 20 repeticiones.',
            'Minutos 9-12: Direction drag con UMP — maniquíes en movimiento o 1v1 custom. 20 repeticiones.',
            'Minutos 12-15: Rotación de armas — 10 headshots con Desert Eagle, 10 con M1887, 10 con M4A1, 10 con AWM.',
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Hazlo ANTES de jugar ranked. Es como calentar antes de un partido. 15 minutos de práctica pueden mejorar tu rendimiento toda la sesión. La memoria muscular se activa con repetición.',
        },
      ],
    },
  ],
  relatedSlugs: ['crosshair-placement', 'drag-shot-tecnicas', 'sensibilidad-perfecta'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 4: Settings Gráficos
// ═══════════════════════════════════════════════════════════════

const settingsGraficos: GuideData = {
  slug: 'settings-graficos',
  title: 'Settings Gráficos para Máximo FPS',
  category: 'Configuración',
  categoryColor: '#f97316',
  difficulty: 'Principiante',
  readTime: 5,
  intro: 'Los FPS ganan peleas, no los gráficos bonitos. El algoritmo de ARES ajusta tu sensibilidad según los Hz y RAM de tu celular porque directamente afectan tus FPS y cómo se siente el aim. Aquí están los 5 settings que debes cambiar HOY.',
  sections: [
    {
      id: 'settings-obligatorios',
      title: 'Los 5 settings de Free Fire que debes poner ASI',
      blocks: [
        {
          type: 'table',
          headers: ['Setting', 'Valor recomendado', 'Por qué'],
          rows: [
            ['Gráficos', 'Smooth + FPS Máximo', 'Menos efectos = más FPS = mejor aim'],
            ['Aim Assist', 'Activado', 'Ayuda al body tracking (el headshot lo haces tú)'],
            ['Precisión en Mira', 'Default', 'Mejora la consistencia del scope-in'],
            ['Cambio de Arma', 'Rápido + Activado', 'Combos de switch más rápidos'],
            ['Disparo al Abrir Mira', 'Activado', 'Dispara automáticamente al hacer scope'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Cierra TODAS las apps antes de jugar. Más RAM libre = más FPS = mejor respuesta táctil. Con 4GB de RAM, cerrar WhatsApp e Instagram puede darte 10-15 FPS extra.',
        },
      ],
    },
    {
      id: 'hz-y-sensibilidad',
      title: 'Cómo los Hz afectan tu sensibilidad (datos del algoritmo)',
      blocks: [
        {
          type: 'text',
          content: 'ARES ajusta tu sensibilidad según los Hz de tu pantalla. A 60Hz el motor SUBE tu sensi +3 puntos porque con menos frames el tracking es menos preciso y necesitas movimiento más agresivo. A 120Hz NO ajusta porque ya tienes frames suficientes.',
        },
        {
          type: 'table',
          headers: ['Hz', 'Ajuste ARES', 'FPS objetivo', 'Efecto en aim'],
          rows: [
            ['60Hz', '+3 a tu General', '60 FPS', 'Tracking básico, drag más lento'],
            ['90Hz', '+1 a tu General', '90 FPS', 'Tracking mejorado, más suave'],
            ['120Hz', '0 (baseline)', '120 FPS', 'Tracking óptimo, drag fluido'],
            ['144Hz', '-1 a tu General', '144 FPS', 'Ultra suave, puedes bajar sensi'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Si tu celular dice 120Hz pero tus FPS caen a 40 en fights, esos 120Hz no sirven de nada. Baja los gráficos hasta que mantengas FPS estables cerca de tu tasa de refresco.',
        },
      ],
    },
    {
      id: 'ram-y-fps',
      title: 'RAM: el factor oculto que destruye tu aim',
      blocks: [
        {
          type: 'text',
          content: 'La RAM afecta directamente cuántos FPS mantiene tu celular en fights intensos. ARES ajusta tu sensibilidad según la RAM porque menos RAM = más drops de FPS = pixel skipping = necesitas sensibilidad más conservadora.',
        },
        {
          type: 'table',
          headers: ['RAM', 'Ajuste ARES', 'Impacto en FPS', 'Recomendación'],
          rows: [
            ['2GB', '-4 a tu General', 'Drops constantes a 20-30 FPS', 'Gráficos en Bajo, cerrar TODO'],
            ['3GB', '-2 a tu General', 'Drops en fights a 35-40 FPS', 'Gráficos en Bajo, FPS en Alto'],
            ['4GB', '-1 a tu General', 'FPS estables 50-60', 'Gráficos Normal, FPS en Alto'],
            ['6GB', '0 (baseline)', 'FPS estables 60+', 'Gráficos Normal, FPS en Ultra'],
            ['8GB+', '+1 a +3 a tu General', 'FPS estables 90-120', 'Puedes subir gráficos'],
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'Poner gráficos en Ultra con 3GB de RAM "porque se ve mejor". Se ve mejor pero juegas peor. Tu celular dropea a 20 FPS en cada fight y tu drag falla. SIEMPRE prioriza FPS sobre calidad visual.',
        },
      ],
    },
    {
      id: 'config-por-gama',
      title: 'Configuración completa por gama de celular',
      blocks: [
        {
          type: 'text',
          content: 'Gama baja (2-4GB RAM, procesador antiguo):',
        },
        {
          type: 'table',
          headers: ['Setting', 'Valor'],
          rows: [
            ['Gráficos', 'Smooth'],
            ['FPS', 'Alto'],
            ['Sombras', 'Desactivado'],
            ['Efectos', 'Bajo'],
            ['Anti-aliasing', 'Desactivado'],
            ['Modo rendimiento', 'Activado'],
          ],
        },
        {
          type: 'text',
          content: 'Gama media-alta (6-8GB RAM, Snapdragon 700+):',
        },
        {
          type: 'table',
          headers: ['Setting', 'Valor'],
          rows: [
            ['Gráficos', 'Normal-Alto'],
            ['FPS', 'Ultra'],
            ['Sombras', 'Bajo'],
            ['Efectos', 'Normal'],
            ['Anti-aliasing', 'Bajo'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Muchos pros con celulares gama alta juegan con gráficos en Smooth y FPS en Ultra. Menos efectos visuales = ves enemigos más rápido. No es por rendimiento, es por CLARIDAD.',
        },
      ],
    },
    {
      id: 'optimizaciones-extra',
      title: 'Optimizaciones del celular para máximo rendimiento',
      blocks: [
        {
          type: 'list',
          items: [
            'Cierra TODAS las apps antes de jugar — WhatsApp, Instagram, TikTok, TODO',
            'Activa "Modo Juego" si tu celular lo tiene (Samsung Game Booster, Xiaomi Game Turbo)',
            'Desactiva Bluetooth si no usas audífonos inalámbricos',
            'WiFi 5GHz si es posible — menos latencia que 2.4GHz',
            'Carga al 80%+ antes de jugar — batería baja = CPU throttling = FPS drops',
            'Quita la funda del celular si hace calor — sobrecalentamiento = FPS drops severos',
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'dpi-sensibilidad', 'configuracion-hud'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 5: Giroscopio
// ═══════════════════════════════════════════════════════════════

const giroscopioGuia: GuideData = {
  slug: 'giroscopio-guia',
  title: 'Giroscopio: Cuándo Sí, Cuándo No, y Cómo Configurarlo',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Avanzado',
  readTime: 7,
  intro: 'El giroscopio te da un tercer eje de control usando la inclinación del celular. ARES lo calcula multiplicando cada valor de sensibilidad por factores entre 0.30-0.34x, produciendo valores en rango 20-42. Pero NO es para todos: con 2 dedos está DESHABILITADO, con 3 es opcional, y con 4 es recomendado.',
  sections: [
    {
      id: 'como-funciona-gyro',
      title: 'Cómo calcula ARES el giroscopio (datos reales)',
      blocks: [
        {
          type: 'text',
          content: 'El motor de giroscopio toma cada valor de sensibilidad y lo multiplica por un factor específico. Los factores están calibrados para que el gyro caiga en rango 20-42, que es donde los pros lo usan.',
        },
        {
          type: 'table',
          headers: ['Slider', 'Factor de conversión', 'Ejemplo (General=100)'],
          rows: [
            ['Gyro General', '0.30x del General', '100 x 0.30 = 30'],
            ['Gyro Punto Rojo', '0.32x del Punto Rojo', '95 x 0.32 = 30'],
            ['Gyro 2x', '0.32x del Mira 2x', '90 x 0.32 = 29'],
            ['Gyro 4x', '0.34x del Mira 4x', '80 x 0.34 = 27'],
            ['Gyro AWM', '0.34x del AWM scope', '60 x 0.34 = 20'],
            ['Gyro Vista Libre', '0.30x del Vista Libre', '68 x 0.30 = 20'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'La escala del giroscopio en Free Fire va de 0 a 100, NO de 0 a 200 como la sensibilidad de toque. Si ves valores de 20-40 no te asustes, son los rangos normales que usan los pros.',
        },
      ],
    },
    {
      id: 'gyro-por-dpi',
      title: 'Gyro base independiente por DPI',
      blocks: [
        {
          type: 'text',
          content: 'Además del cálculo por factores, ARES tiene un motor forense de gyro que calcula valores independientes según el DPI del dispositivo. El gyro base baja con DPI alto porque pantallas con más densidad de píxeles necesitan menos inclinación.',
        },
        {
          type: 'table',
          headers: ['DPI del celular', 'Gyro base', 'Tapering por scope'],
          rows: [
            ['300 o menos', '42', '-10 por paso (32, 22, 12...)'],
            ['300-450', '38', '-10 por paso (28, 18, 8...)'],
            ['450+', '34', '-10 por paso (24, 14, 4...)'],
          ],
        },
        {
          type: 'text',
          content: 'El estilo de juego también ajusta el gyro base: Agresivo suma +4 (40% del boost x0.1), Francotirador resta -2. Así un agresivo tiene gyro más alto para giros rápidos con inclinación.',
        },
      ],
    },
    {
      id: 'gyro-por-dedos',
      title: 'Giroscopio según tu cantidad de dedos',
      blocks: [
        {
          type: 'table',
          headers: ['Dedos', 'Gyro', 'Rango', 'Razón'],
          rows: [
            ['2 Dedos', 'DESHABILITADO', '0', 'Ya tienes demasiado con los pulgares. El gyro te desestabiliza.'],
            ['3 Dedos', 'Opcional', '20-30', 'Ayuda con control de recoil. Empieza en 25 y ajusta +/-5.'],
            ['4 Dedos', 'RECOMENDADO', '25-40', 'Agrega un 3er eje de control con la inclinación. Empieza en 30.'],
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'Con 2 dedos el giroscopio está DESHABILITADO en ARES. No es por limitación del celular, es porque biomecánicamente no funciona: tus pulgares ya están saturados y la inclinación arruina tu grip.',
        },
      ],
    },
    {
      id: 'cuando-si-cuando-no',
      title: 'Cuándo SÍ y cuándo NO activar giroscopio',
      blocks: [
        {
          type: 'text',
          content: 'Actívalo SI:',
        },
        {
          type: 'list',
          items: [
            'Juegas con 3-4 dedos y quieres más control de recoil',
            'Tu celular tiene buen sensor de gyro (iPhones, Samsung S series, Poco F series)',
            'Juegas sentado o en posición estable',
            'Puedes dedicar 2-3 semanas a aprenderlo sin frustrarte',
          ],
        },
        {
          type: 'text',
          content: 'NO lo actives SI:',
        },
        {
          type: 'list',
          items: [
            'Juegas en movimiento (transporte público, caminando)',
            'Tu celular es gama baja con sensores baratos e imprecisos',
            'Juegas con 2 dedos',
            'Ya eres competitivo sin él y no quieres resetear tu memoria muscular',
          ],
        },
      ],
    },
    {
      id: 'config-gyro',
      title: 'Configuración paso a paso',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'Activa el modo "Scope activado" — solo se activa al usar mira, no todo el tiempo',
            'Pon todos los valores en el rango bajo de tu perfil de dedos (3 dedos: 20, 4 dedos: 25)',
            'Semana 1: juega SOLO en Training Ground y casual. Acostúmbrate al movimiento.',
            'Semana 2: si te sientes cómodo, sube cada valor +3 a +5. Prueba en Clash Squad casual.',
            'Semana 3: ajusta fino. Si un scope se mueve mucho, baja ese valor. Si no responde, sube.',
            'Semana 4: ya deberías estar en tu rango óptimo. Prueba en ranked.',
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Los primeros 3 días vas a jugar TERRIBLE con gyro. Tu cerebro necesita crear nuevas conexiones musculares. NO lo apagues. Si aguantas 5 días, el día 7 ya se siente natural.',
        },
      ],
    },
    {
      id: 'gyro-headshot-combo',
      title: 'Gyro + Drag = El combo definitivo',
      blocks: [
        {
          type: 'text',
          content: 'En modo headshot, ARES aplica modificadores de gyro adicionales: Gyro Punto Rojo sube 1.15x y Gyro General sube 1.05x. Esto permite micro-ajustes con inclinación mientras haces drag con el dedo.',
        },
        {
          type: 'text',
          content: 'El combo funciona así: tu dedo hace el drag vertical hacia la cabeza, y la inclinación del celular hace correcciones horizontales de último segundo. Es como tener dos sistemas de aim trabajando juntos.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'El gyro es especialmente poderoso con snipers (AWM, Kar98k). El micro-ajuste por inclinación te permite correcciones de 2-3 grados que con solo el dedo serían imposibles.',
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'headshots-consistentes', 'transicion-dedos'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 6: Drag Shot Técnicas
// ═══════════════════════════════════════════════════════════════

const dragShotTecnicas: GuideData = {
  slug: 'drag-shot-tecnicas',
  title: 'Las 9 Técnicas de Drag Shot (por Dedos)',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Avanzado',
  readTime: 10,
  intro: 'ARES tiene 9 técnicas de drag organizadas en 3 sets de 3 (una por cantidad de dedos). Cada set tiene una primaria, una secundaria, y una avanzada exclusiva. La técnica que puedes usar depende DIRECTAMENTE de cuántos dedos juegas.',
  sections: [
    {
      id: 'tres-tecnicas-base',
      title: 'Las 3 técnicas base de drag',
      blocks: [
        {
          type: 'table',
          headers: ['Técnica', 'Movimiento', 'Dificultad', 'Mejor distancia', 'Mejores armas'],
          rows: [
            ['Vertical Drag', 'Recto hacia arriba', '1/3 (Fácil)', 'Corta-Media', 'MP40, M4A1, SCAR, UMP'],
            ['Rotation Drag (J-Drag)', 'Forma de J: horizontal + arriba', '2/3 (Media)', 'Corta', 'M1887, M1014, Desert Eagle, MP40'],
            ['Direction Drag', 'Diagonal siguiendo al enemigo', '3/3 (Avanzada)', 'Media-Larga', 'AWM, Kar98k, SVD, SCAR'],
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Las 3 técnicas se construyen una sobre otra. DOMINA el Vertical antes de intentar J-Drag. Domina el J-Drag antes de intentar Direction. Si saltas pasos, vas a fallar y frustrarte.',
        },
      ],
    },
    {
      id: 'set-2-dedos',
      title: 'Set de 2 Dedos: J-Drag, J-Drag+Peek, Jump Drag',
      blocks: [
        {
          type: 'text',
          content: '<strong>Primaria: Vertical Drag</strong> — Tu único drag confiable con 2 dedos. Apunta al pecho, toca disparo, arrastra RECTO hacia arriba. Corto y preciso, máximo 1-2cm en la pantalla.',
        },
        {
          type: 'text',
          content: '<strong>Secundaria: J-Drag (Rotation)</strong> — Para enemigos al costado. Arrastra primero horizontal hacia el enemigo, luego curva hacia arriba formando una J. Funciona brutal con M1887 a distancia corta.',
        },
        {
          type: 'text',
          content: '<strong>Técnica avanzada: ninguna.</strong> Con 2 dedos no puedes saltar y disparar simultáneamente. Tu enfoque es drag PURO con el pulgar derecho.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Con 2 dedos tu vista libre tiene multiplicador de 0.70x (30% menos que baseline). ARES compensa bajando tu Vista Libre porque con pulgares el area de tracking es mas limitada.',
        },
      ],
    },
    {
      id: 'set-3-dedos',
      title: 'Set de 3 Dedos: Vertical Drag, Direction Drag, Flick Shot',
      blocks: [
        {
          type: 'text',
          content: '<strong>Primaria: Rotation Drag (J-Drag)</strong> — Con el índice manejando scope y agacharse, tu pulgar tiene libertad total para el J-Drag. El Peek & Fire (asomarte con el índice mientras tu pulgar dragea) es DEVASTADOR.',
        },
        {
          type: 'text',
          content: '<strong>Secundaria: Vertical Drag</strong> — Para situaciones simples donde el enemigo está directamente frente a ti. No todo necesita ser un J-Drag fancy.',
        },
        {
          type: 'text',
          content: '<strong>Avanzada: Peek & Fire</strong> — El índice agacha/levanta tu personaje mientras el pulgar hace el drag. El enemigo no puede apuntarte bien porque te asomas y te escondes. Combo: Agacharse (índice) + Drag vertical (pulgar) = peek headshot.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'El Peek & Fire es la razón #1 para pasar de 2 a 3 dedos. Asomarte detrás de una Gloo Wall, disparar un headshot y esconderte en 0.5 segundos es imposible con 2 dedos.',
        },
      ],
    },
    {
      id: 'set-4-dedos',
      title: 'Set de 4 Dedos: Situp Headshot, Situp+One-Tap, Flick Shot',
      blocks: [
        {
          type: 'text',
          content: '<strong>Primaria: Rotation Drag (J-Drag)</strong> — Igual que 3 dedos pero con más libertad. Tus índices manejan disparo, scope, agacharse y saltar. Tu pulgar derecho se dedica 100% al drag.',
        },
        {
          type: 'text',
          content: '<strong>Secundaria: Direction Drag</strong> — Para enemigos corriendo lateralmente a media-larga distancia. Arrastra en la MISMA DIRECCIÓN que se mueve el enemigo + ligeramente arriba. Requiere predicción del movimiento.',
        },
        {
          type: 'text',
          content: '<strong>Avanzada: Jump-Crouch-Fire (Técnica Two9)</strong> — Salta (índice izquierdo), agáchate en el aire (índice derecho), dispara (índice derecho) en el pico del salto. SOLO posible con 4 dedos. Es la técnica que le da a Two9 su tasa de headshot del 98%.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'El combo Jump-Crouch-Fire es la técnica más difícil del juego. Necesitas coordinar 4 acciones con 4 dedos en menos de 0.5 segundos. Practica 100+ veces en Training Ground antes de siquiera intentarlo en casual.',
        },
      ],
    },
    {
      id: 'sensi-por-drag',
      title: 'Qué sensibilidad afecta cada drag',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Vertical Drag:</strong> Tu General es la que manda. Si sientes que no llegas al headshot, sube General 5-10 puntos. Si te pasas, baja 5-10.',
            '<strong>J-Drag:</strong> General + Punto Rojo. Ambas deben estar equilibradas. En modo headshot ARES sube el Punto Rojo 1.18x por esta razón.',
            '<strong>Direction Drag:</strong> Mira 2x y 4x. Son las sensibilidades de scope que usas para tracking a distancia.',
            '<strong>Situp Headshot:</strong> Punto Rojo + AWM scope. El scope-in y disparo deben ser instantáneos.',
          ],
        },
      ],
    },
    {
      id: 'plan-7-dias',
      title: 'Plan de práctica de 7 días',
      blocks: [
        {
          type: 'table',
          headers: ['Día', 'Ejercicio', 'Duración', 'Arma'],
          rows: [
            ['1-2', 'Vertical drag contra bots quietos', '15 min', 'M4A1'],
            ['3', 'Vertical drag contra bots en movimiento', '15 min', 'SCAR'],
            ['4', 'J-Drag contra bots (lateral)', '15 min', 'M1887'],
            ['5', 'Mezclar Vertical + J-Drag alternando', '15 min', 'Desert Eagle'],
            ['6', 'Direction drag (tracking enemigos)', '15 min', 'UMP'],
            ['7', 'Aplicar todo en Clash Squad casual', 'Sesión completa', 'Rotación'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Repite el plan cada semana. En la semana 3 agrega Situp Headshot si juegas con 4 dedos. La consistencia de 15 min diarios es más importante que sesiones de 2 horas una vez a la semana.',
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'crosshair-placement', 'transicion-dedos'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 7: DPI y Sensibilidad
// ═══════════════════════════════════════════════════════════════

const dpiSensibilidad: GuideData = {
  slug: 'dpi-sensibilidad',
  title: 'DPI: Qué Es y Cómo Afecta tu Sensibilidad',
  category: 'Sensibilidad',
  categoryColor: '#06b6d4',
  difficulty: 'Intermedio',
  readTime: 6,
  intro: 'DPI es el dato más importante para calcular tu sensibilidad y es el que el 99% de los jugadores ignoran. ARES v5.0 usa la fórmula rawDpi = round((ppi / screenSize) x 4.2 + 180) para calcular el DPI de cada dispositivo. Entender esto es la diferencia entre una sensi "más o menos" y una sensi PERFECTA.',
  sections: [
    {
      id: 'que-es-dpi',
      title: 'DPI explicado para gamers',
      blocks: [
        {
          type: 'text',
          content: 'DPI = Dots Per Inch (Puntos Por Pulgada). Es cuántos píxeles tiene tu pantalla por cada pulgada física. Cuando mueves tu dedo 1 centímetro, tu celular registra cuántos píxeles cruzaste. Más DPI = más píxeles por centímetro = movimiento más preciso.',
        },
        {
          type: 'text',
          content: 'Por eso el MISMO movimiento de dedo produce un giro DIFERENTE en dos celulares con DPI distinto. Un celular con 460 DPI registra 40% más movimiento que uno con 270 DPI para el mismo swipe.',
        },
      ],
    },
    {
      id: 'formula-dpi',
      title: 'La fórmula que usa ARES para calcular DPI',
      blocks: [
        {
          type: 'text',
          content: 'ARES calcula el DPI de cada dispositivo con esta fórmula: rawDpi = round((PPI / screenSize) x 4.2 + 180). El resultado se clampea entre 200 y 800.',
        },
        {
          type: 'text',
          content: 'PPI (Pixels Per Inch) se calcula de la resolución: PPI = sqrt(ancho^2 + alto^2) / diagonal en pulgadas.',
        },
        {
          type: 'text',
          content: 'Ejemplo con Samsung Galaxy A54:',
        },
        {
          type: 'ordered-list',
          items: [
            'Resolución: 2340 x 1080 píxeles',
            'Diagonal: 6.4 pulgadas',
            'PPI = sqrt(2340^2 + 1080^2) / 6.4 = 2578 / 6.4 = 403 PPI',
            'rawDpi = round((403 / 6.4) x 4.2 + 180) = round(63 x 4.2 + 180) = round(264 + 180) = 444',
            'DPI calculado = 444, clampeado [200, 800] = 444 DPI',
          ],
        },
      ],
    },
    {
      id: 'dpi-por-tier',
      title: 'DPI estimado cuando no hay datos exactos',
      blocks: [
        {
          type: 'text',
          content: 'Cuando ARES no tiene el DPI exacto de tu dispositivo (algunos celulares oscuros no tienen spec sheet completo), usa estimaciones por tier:',
        },
        {
          type: 'table',
          headers: ['Tier del celular', 'DPI estimado', 'General base resultante', 'Celulares típicos'],
          rows: [
            ['LOW', '270', '~117', 'Samsung A06, Tecno Spark, Moto E'],
            ['MID', '395', '~101', 'Redmi Note 12, Samsung A54, Moto G'],
            ['HIGH', '460', '~88', 'Samsung S23, Pixel 7'],
            ['GAMING', '460', '~88', 'iPhone 15 Pro, Samsung S24 Ultra, ROG Phone'],
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Por eso es importante buscar tu modelo EXACTO en el generador, no uno "parecido". Un Samsung A54 tiene DPI ~444 y un A55 tiene DPI ~452. Son 8 puntos de diferencia que cambian tu General por 1-2 puntos.',
        },
      ],
    },
    {
      id: 'dpi-y-sensi',
      title: 'Cómo el DPI determina tu sensibilidad base',
      blocks: [
        {
          type: 'text',
          content: 'La relación es inversa: DPI alto = sensibilidad baja. DPI bajo = sensibilidad alta. ARES usa interpolación lineal por segmentos para que la transición sea suave.',
        },
        {
          type: 'table',
          headers: ['DPI', 'General base', 'Ejemplo de celulares'],
          rows: [
            ['200', '130', 'Tablets muy viejas, celulares 2018-'],
            ['270', '~117', 'Samsung A06, Moto E, Tecno Spark'],
            ['350', '~107', 'Redmi 12, Samsung A15, Moto G Power'],
            ['400', '100', 'Samsung A54, Redmi Note 12, Moto G'],
            ['460', '88', 'iPhone 14/15/16, Samsung S24'],
            ['550', '~79', 'Algunos tablets high-end'],
            ['600+', '75', 'iPads, tablets gaming'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'La diferencia entre un gama baja (DPI 270, General 117) y un iPhone (DPI 460, General 88) es de 29 puntos. Copiar la sensi del iPhone en tu gama baja te deja con la mira pegada al piso.',
        },
      ],
    },
    {
      id: 'dpi-cambio-celular',
      title: 'Cambiar de celular: tu DPI cambia y tu sensi DEBE cambiar',
      blocks: [
        {
          type: 'text',
          content: 'Si cambias de un Samsung A06 (DPI 270) a un iPhone 16 (DPI 460), tu sensibilidad anterior de 117 se va a sentir DEMASIADO rápida en el iPhone. Necesitas bajar a ~87. ARES recalcula automáticamente.',
        },
        {
          type: 'text',
          content: 'Lo mismo aplica al revés: si cambias de un iPhone a un gama media, tu sensi de 87 se va a sentir lentísima. El DPI bajó y necesitas subir.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Cada vez que cambias de celular, tu PRIMER paso debería ser recalcular tu sensibilidad. El mismo número en un celular diferente se siente completamente distinto por la diferencia de DPI.',
        },
      ],
    },
  ],
  relatedSlugs: ['sensibilidad-perfecta', 'settings-graficos', 'giroscopio-guia'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 8: Armas y Sensibilidad
// ═══════════════════════════════════════════════════════════════

const armasSensibilidad: GuideData = {
  slug: 'armas-sensibilidad',
  title: 'Guía de Armas: Modificadores de Sensibilidad por Categoría',
  category: 'Armas',
  categoryColor: '#f59e0b',
  difficulty: 'Intermedio',
  readTime: 8,
  intro: 'ARES tiene 7 categorías de armas con modificadores reales de sensibilidad. Las escopetas suben tu sensi +8% para snap rápido. Los snipers la bajan -6% para máximo control. Aquí están los 11 armas del selector, sus categorías, modificadores, y cómo ajustar tu approach.',
  sections: [
    {
      id: 'categorias-armas',
      title: 'Las 7 categorías y sus modificadores',
      blocks: [
        {
          type: 'text',
          content: 'Cada categoría de arma aplica un multiplicador sobre tu sensibilidad base. El motor de headshot de ARES usa estos multiplicadores para ajustar los valores automáticamente cuando seleccionas un arma.',
        },
        {
          type: 'table',
          headers: ['Categoría', 'Modificador', 'Mejor drag', 'Recoil', 'Botón disparo'],
          rows: [
            ['Escopetas', '+8%', 'J-Drag (Rotation)', 'Sin recoil', '+5%'],
            ['Subfusiles (SMGs)', '+4%', 'Vertical Drag', 'Medio', '+3%'],
            ['ARs Rápidos (M4, SCAR)', 'Base (0%)', 'Vertical Drag', 'Medio', '0%'],
            ['ARs Pesados (AK, Parafal)', '-3%', 'Vertical (ráfagas)', 'Alto', '-2%'],
            ['Francotiradores', '-6%', 'Direction Drag', 'Bajo', '-5%'],
            ['Pistolas', '+5%', 'Rotation Drag', 'Bajo', '+2%'],
            ['Especiales (AC80)', 'Base (0%)', 'Vertical con ritmo', 'Bajo', '0%'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Los modificadores son multiplicativos sobre tu sensibilidad base. Si tu General BALANCED es 100, con escopeta sube a 108 y con sniper baja a 94. ARES aplica esto automáticamente en el modo headshot.',
        },
      ],
    },
    {
      id: 'armas-close',
      title: 'Armas de corta distancia: M1887, MP40, M1014, MAC10, Desert Eagle',
      blocks: [
        {
          type: 'text',
          content: '<strong>M1887 (Escopeta S-tier)</strong> — Daño 94, headshot 188 (2.0x), RPM 55. Un headshot = kill instantáneo con cualquier casco. Usa J-Drag rapidísimo: apunta al pecho y haz la J. El arma #1 para clips.',
        },
        {
          type: 'text',
          content: '<strong>MP40 (SMG A-tier)</strong> — Daño 48, headshot 72 (1.5x), RPM 830. Cadencia BRUTAL. No necesitas one-tap — spray al cuello y el recoil natural sube a la cabeza. Drag vertical SUAVE, no brusco. Baja tu sensi -2 a -3% con este arma.',
        },
        {
          type: 'text',
          content: '<strong>Desert Eagle (Pistola S-tier)</strong> — Daño 90, headshot 198 (2.2x), RPM 40. La pistola más letal del juego. One-tap a media distancia. Sube tu sensi +5% (+8% al Punto Rojo). La favorita para 1v1 y clips.',
        },
        {
          type: 'text',
          content: '<strong>MAC10 (SMG A-tier)</strong> — Daño 45, RPM 900. La SMG más rápida del juego. Baja tu sensi -3% al General y -4% al Punto Rojo para controlar el spread. Spray puro, no intentes one-taps.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Con el MP40 a 830 RPM, 3-4 balas llegan a la cabeza si apuntas al cuello. No necesitas drag perfecto, solo apunta al cuello y deja que el recoil haga el trabajo.',
        },
      ],
    },
    {
      id: 'armas-mid',
      title: 'Armas de media distancia: M4A1, AK47, SCAR, Woodpecker, Parafal',
      blocks: [
        {
          type: 'text',
          content: '<strong>M4A1 (AR S-tier)</strong> — Daño 53, headshot 90 (1.7x), RPM 560, rango 79m. El AR más CONSISTENTE. Recoil bajo, funciona a todas las distancias. La mejor arma para APRENDER headshots. Sin ajuste de sensi (base).',
        },
        {
          type: 'text',
          content: '<strong>AK47 (AR A-tier)</strong> — Daño 61, headshot 110 (1.8x), RPM 480. Más daño que M4 pero MÁS recoil. Baja sensi -4% General, -5% Punto Rojo, -7% Mira 2x. Dispara en ráfagas de 5-7 balas. 2 headshots = kill con casco nivel 2.',
        },
        {
          type: 'text',
          content: '<strong>Woodpecker (AR S-tier)</strong> — Daño 65, headshot 130 (2.0x), RPM 360, rango 85m. AR con ALMA DE SNIPER. Multiplicador headshot de 2.0x. Tap-fire obligatorio. Sube sensi +5% en Mira 2x y +3% en 4x. Dos headshots = kill garantizado.',
        },
        {
          type: 'text',
          content: '<strong>SCAR (AR S-tier)</strong> — Primer disparo MUY preciso. Ideal para tap-fire headshots. Misma sensi que M4 pero sube +3% en Mira 2x por su precisión inherente.',
        },
      ],
    },
    {
      id: 'armas-long',
      title: 'Armas de larga distancia: AWM, SVD, Kar98K',
      blocks: [
        {
          type: 'text',
          content: '<strong>AWM (Sniper S-tier)</strong> — Daño 90, headshot 225 (2.5x). ONE-SHOT HEADSHOT GARANTIZADO con cualquier casco incluyendo nivel 3. Baja tu AWM scope -8%. El quickscope con AWM es la técnica más respetada del juego.',
        },
        {
          type: 'text',
          content: '<strong>SVD/Dragunov (Tirador A-tier)</strong> — Daño 73, headshot 146 (2.0x), RPM 120. Semi-auto: headshots rápidos consecutivos sin bolt action. Sube Mira 4x +5%, baja AWM scope -5%. Dos headshots = kill.',
        },
        {
          type: 'text',
          content: '<strong>Kar98K (Sniper B-tier)</strong> — Daño 90, headshot 198 (2.2x). NO mata con casco nivel 3 en un tiro. Baja AWM scope -10%. Usala como warmup para AWM, misma mecánica de quickscope pero con menos daño.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Los francotiradores aplican -6% a toda tu sensibilidad. Esto es porque a larga distancia un movimiento mínimo de dedo mueve la mira MUCHO. Necesitas control absoluto. ARES reduce automáticamente.',
        },
      ],
    },
    {
      id: 'tabla-resumen-armas',
      title: 'Tabla resumen de las 11 armas',
      blocks: [
        {
          type: 'table',
          headers: ['Arma', 'Tipo', 'Tier', 'Headshot DMG', 'Mod. Sensi', 'Drag'],
          rows: [
            ['M1887', 'Escopeta', 'S', '188 (2.0x)', '+8%', 'J-Drag'],
            ['Desert Eagle', 'Pistola', 'S', '198 (2.2x)', '+5%', 'J-Drag'],
            ['MP40', 'SMG', 'A', '72 (1.5x)', '+4%', 'Vertical'],
            ['M1014', 'Escopeta', 'A', '140 (1.8x)', '+8%', 'Vertical'],
            ['MAC10', 'SMG', 'A', '67 (1.5x)', '+4%', 'Vertical'],
            ['M4A1', 'AR', 'S', '90 (1.7x)', 'Base', 'Vertical'],
            ['SCAR', 'AR', 'S', '90 (1.7x)', 'Base', 'Vertical'],
            ['AK47', 'AR', 'A', '110 (1.8x)', '-3%', 'Vertical'],
            ['Woodpecker', 'AR', 'S', '130 (2.0x)', 'Base', 'Vertical'],
            ['Parafal', 'AR', 'A', '104 (1.8x)', '-3%', 'Vertical'],
            ['AWM', 'Sniper', 'S', '225 (2.5x)', '-6%', 'Direction'],
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'drag-shot-tecnicas', 'sensibilidad-perfecta'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 9: Combos de Personajes
// ═══════════════════════════════════════════════════════════════

const combosPersonajes: GuideData = {
  slug: 'combos-personajes',
  title: '18 Combos de Personajes: Por Estilo y Dedos',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Intermedio',
  readTime: 10,
  intro: 'ARES tiene 18 combos de personajes organizados en una matrix de 3 estilos x 3 perfiles de dedos x 2 opciones (principal + alternativo). Tu combo no es genérico — está optimizado para tu estilo Y tu cantidad de dedos.',
  sections: [
    {
      id: 'como-funcionan',
      title: 'Cómo funciona la matrix de combos',
      blocks: [
        {
          type: 'text',
          content: 'Puedes equipar 1 habilidad activa + 3 pasivas + 1 mascota. Tu activa define qué haces (rush, defender, destruir walls). Tus pasivas cubren los huecos. Tu mascota amplifica tu fortaleza principal.',
        },
        {
          type: 'text',
          content: 'ARES cruza 3 variables: estilo de juego (Agresivo/Balanceado/Francotirador) x cantidad de dedos (2/3/4) x prioridad (Principal/Alternativo). Eso da 18 combos únicos optimizados para cada situación.',
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Tu activa define qué haces. Tus pasivas definen qué tan bien sobrevives haciéndolo. Tu mascota amplifica tu fortaleza principal. Cambia tu combo según el modo: Battle Royale vs Clash Squad.',
        },
      ],
    },
    {
      id: 'combos-agresivo',
      title: 'Combos Agresivos (6 combos: 2 por dedos)',
      blocks: [
        {
          type: 'text',
          content: '<strong>2 Dedos Principal — RUSHER IMPARABLE:</strong> Alok (activa) + Jota + D-Bee + Hayato | Mascota: Detective Panda. Activas Alok y te olvidas — cura + velocidad 10s. Jota + Panda dan ~50 HP por kill. D-Bee +35% precisión moviéndote. Ideal para ranked.',
        },
        {
          type: 'text',
          content: '<strong>2 Dedos Alternativo — HEADSHOT MACHINE:</strong> Alok (activa) + Jota + Kelly + Wolfrahh | Mascota: Detective Panda. Kelly te acerca rápido, Wolfrahh +3% headshot damage por kill. Más kills = más daño = más kills.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Principal — DESTRUCTOR DE WALLS:</strong> Skyler (activa) + Jota + D-Bee + Hayato | Mascota: Mr. Waggor. Skyler destruye Gloo Walls con tu índice sin dejar de apuntar. Waggor genera walls gratis.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Alternativo — FANTASMA VELOZ:</strong> Tatsuya (activa) + Jota + D-Bee + Dasha | Mascota: Rockie. Dash instantáneo que se resetea con cada kill. Dasha +18% cadencia por knock. Apareces y desapareces.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Principal — ELITE PRO:</strong> Tatsuya (activa) + Wolfrahh + Luna + D-Bee | Mascota: Rockie. El combo de mayor nivel del juego. Dash con 4 dedos, Wolfrahh escala headshot damage, Luna cadencia, D-Bee precisión.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Alternativo — TANQUE DE ASALTO:</strong> Xayne (activa) + Jota + Hayato + D-Bee | Mascota: Detective Panda. Xayne +70 HP temporales — entras con 270+ HP. Jota + Panda curan por kills. Entras como tanque.',
        },
      ],
    },
    {
      id: 'combos-balanceado',
      title: 'Combos Balanceados (6 combos: 2 por dedos)',
      blocks: [
        {
          type: 'text',
          content: '<strong>2 Dedos Principal — RANKED ESTANDAR:</strong> Alok (activa) + Jota + Kelly + Andrew | Mascota: Mr. Waggor. El gold-standard para ranked. Simple, efectivo, nunca falla. Andrew protege armadura en peleas largas. Waggor te salva con walls.',
        },
        {
          type: 'text',
          content: '<strong>2 Dedos Alternativo — PRECISION TOTAL:</strong> Alok (activa) + Laura + Moco + Hayato | Mascota: Rockie. Laura +60% precisión con mira. Moco marca enemigos. Más enfocado en headshots.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Principal — CONTROL TOTAL:</strong> Alok (activa) + Jota + Moco + D-Bee | Mascota: Mr. Waggor. Equilibrio perfecto. Moco marca, Jota cura por kills, D-Bee precisión. El combo más versátil del juego.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Alternativo — OFENSIVO INTELIGENTE:</strong> Skyler (activa) + Laura + Jota + Hayato | Mascota: Rockie. Skyler destruye coberturas, Laura precisión brutal con mira.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Principal — ESCUDO PERFECTO:</strong> Chrono (activa) + Jota + D-Bee + Hayato | Mascota: Rockie. Chrono crea escudo de 600 de daño. Con 4 dedos activas Chrono en el instante que te disparan y disparas desde adentro.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Alternativo — INTEL + DANO:</strong> Tatsuya (activa) + Jota + Moco + Wolfrahh | Mascota: Detective Panda. Dash, marca con Moco, Wolfrahh amplifica cada kill. Intel + daño + movilidad.',
        },
      ],
    },
    {
      id: 'combos-sniper',
      title: 'Combos Francotirador (6 combos: 2 por dedos)',
      blocks: [
        {
          type: 'text',
          content: '<strong>2 Dedos Principal — SOMBRA LETAL:</strong> Alok (activa) + Rafael + Laura + Maro | Mascota: Mr. Waggor. Laura +60% precisión con scope. Rafael silencia tu sniper. Maro +25% daño a distancia. Un disparo letal desde la sombra.',
        },
        {
          type: 'text',
          content: '<strong>2 Dedos Alternativo — MARCADOR SILENCIOSO:</strong> Alok (activa) + Laura + Moco + Hayato | Mascota: Rockie. Moco marca al primer hit — si fallas, tu equipo sabe dónde está. Laura + Hayato para segundo intento.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Principal — SNIPER DEFINITIVO:</strong> Skyler (activa) + Maro + Moco + Rafael | Mascota: Mr. Waggor. Moco marca, Maro +28% daño contra marcados, Rafael invisible, Skyler destruye walls. Cadena letal completa.',
        },
        {
          type: 'text',
          content: '<strong>3 Dedos Alternativo — FRANCOTIRADOR CLASICO:</strong> Skyler (activa) + Laura + Rafael + Hayato | Mascota: Rockie. Laura precisión, Rafael sigilo, Hayato penetra armaduras. Más simple pero igual de letal.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Principal — DOMINIO TOTAL:</strong> Skyler (activa) + Maro + Moco + Rafael | Mascota: Mr. Waggor. Mismo que SNIPER DEFINITIVO pero con 4 dedos puedes Skyler + scope + reposicionar simultáneamente.',
        },
        {
          type: 'text',
          content: '<strong>4 Dedos Alternativo — 4 PASIVAS ZERO BOTONES:</strong> Rafael + Moco + Rin Yagami + Maro | Mascota: Mr. Waggor. Cero botones de habilidad que activar. Los kunai de Rin bajan HP auto. Todo funciona solo mientras TÚ solo apuntas y disparas.',
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'El combo ZERO BOTONES es para jugadores de 4 dedos que quieren 100% enfoque en aim. Sin activa que presionar, tus 4 dedos se dedican exclusivamente a mover, apuntar, disparar y agacharte.',
        },
      ],
    },
    {
      id: 'mascotas',
      title: 'Las 5 mascotas y cuándo usar cada una',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Rockie</strong> — Reduce cooldown de activa 15%. Si tu build depende de Alok, Skyler o Tatsuya, Rockie la hace disponible más seguido. El más versátil.',
            '<strong>Mr. Waggor</strong> — Genera 1 Gloo Wall gratis cada 100s cuando tienes 0. Te salva en círculos finales y rotaciones. El mejor para Battle Royale.',
            '<strong>Detective Panda</strong> — +10 HP por kill. Con Jota = ~50 HP por eliminación. El combo más roto para rushers agresivos.',
            '<strong>Falco</strong> — +50% velocidad de planeo para todo el squad. Domina el early game. Para squads coordinados.',
            '<strong>Spirit Fox</strong> — +10 HP extra con medkit. Buena para builds de sustain largo en ranked.',
          ],
        },
      ],
    },
  ],
  relatedSlugs: ['headshots-consistentes', 'transicion-dedos', 'armas-sensibilidad'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 10: Transición de Dedos
// ═══════════════════════════════════════════════════════════════

const transicionDedos: GuideData = {
  slug: 'transicion-dedos',
  title: 'Cómo Cambiar de 2 a 3 o 4 Dedos (con Datos Reales)',
  category: 'HUD',
  categoryColor: '#a855f7',
  difficulty: 'Intermedio',
  readTime: 8,
  intro: 'Pasar de 2 a 3 dedos cambia tus multiplicadores de sensibilidad, tu tamaño de botón, tu giroscopio, y desbloquea técnicas de drag nuevas. ARES tiene perfiles completos por cantidad de dedos con datos verificados de pros.',
  sections: [
    {
      id: 'multiplicadores-dedos',
      title: 'Los multiplicadores de sensibilidad por dedos (datos reales)',
      blocks: [
        {
          type: 'text',
          content: 'Cada perfil de dedos tiene multiplicadores que ajustan tu sensibilidad. Con 2 dedos, tu Punto Rojo baja 6% (0.94x) porque el pulgar es menos preciso. Con 4 dedos, tu Punto Rojo SUBE 6% (1.06x) porque tu índice tiene control dedicado.',
        },
        {
          type: 'table',
          headers: ['Slider', '2 Dedos', '3 Dedos (baseline)', '4 Dedos'],
          rows: [
            ['General', '1.00x', '1.00x', '1.00x'],
            ['Punto Rojo', '0.94x (-6%)', '1.00x', '1.06x (+6%)'],
            ['Mira 2x', '0.92x (-8%)', '1.00x', '1.08x (+8%)'],
            ['Mira 4x', '0.90x (-10%)', '1.00x', '1.08x (+8%)'],
            ['AWM', '0.88x (-12%)', '1.00x', '1.05x (+5%)'],
            ['Vista Libre', '0.70x (-30%)', '1.00x', '1.15x (+15%)'],
            ['Gyroscope', 'DESHABILITADO', '1.00x', '1.10x (+10%)'],
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'La Vista Libre con 2 dedos tiene multiplicador de 0.70x (30% MENOS). Es porque con pulgares no puedes hacer freelook y moverte al mismo tiempo. Con 4 dedos sube a 1.15x (+15%) porque tienes un dedo libre para freelook.',
        },
      ],
    },
    {
      id: 'que-cambia',
      title: 'Todo lo que cambia al subir de dedos',
      blocks: [
        {
          type: 'table',
          headers: ['Cambio', '2 → 3 Dedos', '3 → 4 Dedos'],
          rows: [
            ['Acciones simultáneas', '2 → 3', '3 → 4'],
            ['Peek & Fire', 'Se desbloquea', 'Ya lo tienes'],
            ['Saltar + Disparar', 'No disponible', 'Se desbloquea'],
            ['Agacharse + Disparar', 'No disponible', 'Se desbloquea'],
            ['Botón de disparo', '55-70% → 48-60%', '48-60% → 44-55%'],
            ['Giroscopio', 'Deshabilitado → Opcional (20-30)', 'Opcional → Recomendado (25-40)'],
            ['Técnica avanzada', 'Ninguna → Peek & Fire', 'Peek & Fire → Jump-Crouch-Fire'],
            ['Tiempo de adaptación', '14 días', '28 días'],
          ],
        },
      ],
    },
    {
      id: 'plan-2-a-3',
      title: 'Plan de transición: 2 a 3 dedos (14 días)',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            '<strong>Día 1-2:</strong> Solo agacharte con el índice. No cambies NADA más. Juega normalmente con 2 pulgares pero tu índice derecho solo se agacha. Tu cerebro se acostumbra a tener el dedo ahí.',
            '<strong>Día 3-5:</strong> Agacharse + scope. Coordina: el índice agacha Y abre mira. Los pulgares siguen igual. Practica 15 min en Training Ground antes de cada sesión.',
            '<strong>Día 5-7:</strong> Peek & Fire. El índice agacha, te asomas, tu pulgar dispara. Este es el combo que hace que 3 dedos valga la pena.',
            '<strong>Día 8-10:</strong> Agrega cambiar arma al índice. Progresivamente mueve más acciones al tercer dedo.',
            '<strong>Día 11-14:</strong> Empieza Clash Squad casual. NO ranked todavía.',
          ],
        },
        {
          type: 'callout',
          variant: 'error',
          content: 'NO practiques en ranked las primeras 48 horas. Vas a perder partidas y frustrarte. Usa Training Ground y casual. El día 7 ya deberías sentir que 3 dedos es natural.',
        },
      ],
    },
    {
      id: 'plan-3-a-4',
      title: 'Plan de transición: 3 a 4 dedos (28 días)',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            '<strong>Semana 1:</strong> Mueve SOLO el botón de Disparo a esquina superior derecha para tu índice derecho. Tu índice derecho ahora dispara. Todo lo demás igual.',
            '<strong>Semana 2:</strong> Agrega Mira/Scope a esquina superior izquierda para tu índice izquierdo. Tu índice izquierdo maneja scope y saltar.',
            '<strong>Semana 3:</strong> Practica el combo Jump + Shoot. Salta con índice izquierdo, dispara con índice derecho. 50 repeticiones diarias en Training Ground.',
            '<strong>Semana 4:</strong> Clash Squad competitivo. Si te sientes cómodo, prueba ranked.',
          ],
        },
        {
          type: 'text',
          content: 'Tip del algoritmo: Si vienes de 3 dedos, manten tu HUD actual y mueve solo 1 botón a la vez. Tu cerebro no puede procesar 5 cambios simultáneos.',
        },
      ],
    },
    {
      id: 'errores-comunes',
      title: 'Los 5 errores que te hacen abandonar',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>Volver a tu cantidad anterior después de 1 día malo</strong> — Dale mínimo 5 días completos. SIEMPRE. El día 2 es el peor.',
            '<strong>Cambiar todo el HUD de golpe</strong> — Mueve 1 botón a la vez. Una acción por semana para 4 dedos.',
            '<strong>Practicar en ranked</strong> — Usa Training Ground y casual las primeras 48-72h.',
            '<strong>Botón de disparo en posición incómoda</strong> — Debe estar donde el índice descansa NATURALMENTE. Esquina superior derecha para la mayoría.',
            '<strong>No recalcular la sensibilidad</strong> — Cambiar de dedos cambia los multiplicadores. Tu sensi de 2 dedos NO funciona para 3 dedos. Recalcula en ARES.',
          ],
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'El error #1 es rendirse el día 2. El 90% de la gente que intenta cambiar de dedos falla porque no aguantó la primera semana. Si pasas el día 5, el día 7 ya se siente natural.',
        },
      ],
    },
  ],
  relatedSlugs: ['configuracion-hud', 'drag-shot-tecnicas', 'combos-personajes'],
};

// ═══════════════════════════════════════════════════════════════
// GUIA 11: Crosshair Placement
// ═══════════════════════════════════════════════════════════════

const crosshairPlacement: GuideData = {
  slug: 'crosshair-placement',
  title: 'Crosshair Placement: Las 3 Reglas y 10 Tips',
  category: 'Combate',
  categoryColor: '#ef4444',
  difficulty: 'Principiante',
  readTime: 5,
  intro: 'El 90% de los jugadores caminan apuntando al suelo. Eso les cuesta 200-300 milisegundos en cada fight — y en Free Fire eso es la diferencia entre hacer headshot o que TE hagan headshot. La solución es estúpidamente simple y ARES la tiene integrada en el Headshot Mode.',
  sections: [
    {
      id: 'las-3-reglas',
      title: 'Las 3 reglas de oro del crosshair',
      blocks: [
        {
          type: 'list',
          items: [
            '<strong>REGLA 1 — DE PIE:</strong> Tu crosshair va a la altura de los OJOS del enemigo. No al pecho, no al cuello — a los OJOS. Cuando aparece alguien, ya estás apuntando a la cabeza. Solo ajustas horizontal.',
            '<strong>REGLA 2 — ENEMIGO AGACHADO:</strong> Si el enemigo está agachado, baja tu mira al nivel del cuello de un personaje de pie. Esa es la cabeza de alguien agachado. Practica reconocer esta altura.',
            '<strong>REGLA 3 — GLOO WALL:</strong> Pre-apunta a donde va a salir la cabeza cuando el enemigo se asome. A la derecha o izquierda de la wall, a la altura correcta. Cuando se asome, solo disparas.',
          ],
        },
        {
          type: 'callout',
          variant: 'dato-clave',
          content: 'Estas 3 reglas son universales. No importa si juegas con 2, 3 o 4 dedos. No importa tu sensibilidad. El crosshair placement es la UNICA técnica que no requiere hardware ni configuración — solo disciplina.',
        },
      ],
    },
    {
      id: 'los-10-tips',
      title: 'Los 10 tips de crosshair (del motor de ARES)',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'SIEMPRE mantén el crosshair a nivel de CABEZA. Nunca al pecho, nunca al suelo.',
            'Pre-apunta a nivel de cabeza ANTES de ver al enemigo. Cuando aparezca, solo dispara.',
            'El aim assist de Free Fire favorece BODY SHOTS. El drag manual es ESENCIAL para headshots.',
            'Activa "Precisión en Mira" en Ajustes para headshots más limpios.',
            'Activa "Cambio rápido de arma" para combos: disparo, switch, disparo headshot.',
            'Gráficos en Smooth + High FPS = mejor respuesta táctil = mejores headshots.',
            'DPI del sistema entre 480-600 es óptimo para drag headshots.',
            'El tamaño del botón de disparo importa: 44-70% según dedos y playstyle. Rusher: más grande. Sniper: más chico.',
            'Practica 10-15 minutos DIARIOS en Training Ground. Memoria muscular > sensibilidad.',
            'En combate cercano, apunta al cuello. El recoil natural sube al headshot.',
          ],
        },
      ],
    },
    {
      id: 'pre-aim',
      title: 'Pre-aim: apuntar antes de ver al enemigo',
      blocks: [
        {
          type: 'text',
          content: 'Pre-aim es poner tu crosshair donde CREES que va a estar la cabeza del enemigo ANTES de verlo. En puertas, esquinas, detrás de walls, spots comunes de campeo.',
        },
        {
          type: 'text',
          content: 'Con pre-aim, tu secuencia de reacción pasa de "ver → apuntar → disparar" a solo "ver → disparar". Te ahorras 200-300 milisegundos. Suena poco, pero en Free Fire es literalmente la diferencia entre vivir y morir.',
        },
        {
          type: 'list',
          items: [
            'En puertas: apunta a la altura de cabeza del lado donde el enemigo probablemente saldrá',
            'En esquinas: crosshair pegado a la esquina a la altura correcta',
            'En Gloo Walls: pre-aim al borde de la wall donde se asomará la cabeza',
            'En escaleras: ajusta la altura — los enemigos que suben tienen la cabeza más abajo',
          ],
        },
      ],
    },
    {
      id: 'practica-crosshair',
      title: 'Cómo practicar crosshair placement (5 minutos)',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            'Entra a Training Ground. Camina por todo el mapa manteniendo el crosshair a la altura de las cabezas de los maniquíes. NO dispares — solo camina y mantén la altura.',
            'Practica giros: da vueltas de 180 grados y verifica que al girar, tu crosshair se mantiene a nivel de cabeza, no baja al piso.',
            'Practica en puertas: acércate a una puerta y pre-apunta donde estaría la cabeza de alguien saliendo.',
            'Después de 3-4 días haciéndolo, se vuelve automático. Tu cerebro lo hace sin pensar.',
          ],
        },
        {
          type: 'callout',
          variant: 'pro-tip',
          content: 'Haz esto 5 minutos antes de CADA sesión de ranked. Es el warmup más efectivo que existe — y nadie lo hace. Cuesta 5 minutos y mejora tu rendimiento toda la sesión.',
        },
      ],
    },
    {
      id: 'crosshair-y-sensi',
      title: 'Crosshair placement + sensibilidad correcta = headshots',
      blocks: [
        {
          type: 'text',
          content: 'El crosshair placement elimina la necesidad de ajuste VERTICAL (ya estás a la altura correcta). Tu sensibilidad solo necesita cubrir el ajuste HORIZONTAL (izquierda-derecha). Esto simplifica el aim dramáticamente.',
        },
        {
          type: 'text',
          content: 'Si tu sensibilidad está bien calibrada por ARES y tu crosshair placement es bueno, el único movimiento que necesitas hacer es un micro-ajuste horizontal de unos pocos grados. Eso es un headshot consistente.',
        },
        {
          type: 'callout',
          variant: 'importante',
          content: 'Crosshair placement es FREE. No cuesta dinero, no requiere celular gaming, no necesitas 4 dedos. Es la UNICA mejora que depende 100% de ti. Si solo puedes mejorar UNA cosa, mejora esto.',
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
