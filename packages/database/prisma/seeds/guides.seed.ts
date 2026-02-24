import { PrismaClient, GuideCategory } from '@prisma/client';

interface GuideSeed {
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  content: string;
  readTimeMin: number;
  isPremium: boolean;
  sections: {
    title: string;
    content: string;
    orderIndex: number;
    isPremium: boolean;
  }[];
}

const GUIDES: GuideSeed[] = [
  // ─── SENSITIVITY (4 guías) ───
  {
    title: 'Guía Definitiva de Sensibilidad para Free Fire',
    slug: 'guia-definitiva-sensibilidad-free-fire',
    description: 'Aprende cómo funciona cada slider de sensibilidad y cómo ajustarlo para tu dispositivo exacto.',
    category: 'SENSITIVITY',
    content: '<p>La sensibilidad en Free Fire es el factor más importante para mejorar tu gameplay. No existe una sensibilidad universal — depende de tu dispositivo, tu pantalla, tu estilo de juego y hasta tus dedos.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      { title: 'Qué es cada slider', content: '<p><strong>General:</strong> Controla la velocidad al mirar alrededor sin apuntar. Afecta la cámara libre y la rotación general del personaje.</p><p><strong>Punto Rojo:</strong> Sensibilidad al usar miras de punto rojo. Es la mira más común en las primeras rondas.</p><p><strong>Scope 2x:</strong> Para miras de alcance medio. Ideal para AR a media distancia.</p><p><strong>Scope 4x:</strong> Para rifles de francotirador y combate a larga distancia.</p><p><strong>AWM:</strong> Específico para el AWM. Requiere precisión extrema.</p><p><strong>Look Around (Free Look):</strong> Velocidad al usar la vista libre (ojo) sin mover al personaje.</p>', orderIndex: 0, isPremium: false },
      { title: 'Cómo afecta tu dispositivo', content: '<p>Un dispositivo con pantalla de 120Hz necesita valores más bajos que uno de 60Hz porque la pantalla actualiza el doble de veces por segundo, haciendo que el movimiento se sienta más rápido.</p><p>La resolución también importa: en pantallas Full HD hay más píxeles que recorrer, así que la sensibilidad efectiva es menor que en HD.</p><p>El tamaño de pantalla es clave: en una pantalla de 6.7" tu dedo recorre más distancia física que en una de 5.5", así que necesitas valores más altos en pantallas pequeñas.</p>', orderIndex: 1, isPremium: false },
      { title: 'Método de calibración PRO', content: '<p>El método profesional de calibración tiene 5 pasos:</p><p>1. Pon TODOS los sliders en 50 como base.</p><p>2. Abre una partida de entrenamiento.</p><p>3. Ajusta General primero: apunta a un poste y gira. Si llegas antes de completar el giro, baja. Si no llegas, sube.</p><p>4. Repite con cada mira: punto rojo en un objetivo a 20m, 2x a 50m, 4x a 100m.</p><p>5. AWM al final: apunta a un objetivo estático a 150m+.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Sensibilidad para Giroscopio: Guía Completa',
    slug: 'sensibilidad-giroscopio-guia-completa',
    description: 'Domina el giroscopio: configuración paso a paso, ejercicios de práctica y combos con sensibilidad manual.',
    category: 'SENSITIVITY',
    content: '<p>El giroscopio es el arma secreta de los jugadores de alto nivel. Te permite hacer micro-ajustes inclinando tu celular, dándote una ventaja enorme en combates cercanos.</p>',
    readTimeMin: 10,
    isPremium: true,
    sections: [
      { title: 'Qué es el giroscopio y por qué usarlo', content: '<p>El giroscopio usa los sensores de movimiento de tu celular para controlar la cámara. Cuando inclinas tu dispositivo hacia arriba, la cámara mira arriba. Es como tener un segundo dedo controlando la mira.</p><p>Los jugadores profesionales usan giroscopio porque permite micro-ajustes más rápidos que el dedo. En un combate a quemarropa, esa fracción de segundo decide quién gana.</p>', orderIndex: 0, isPremium: false },
      { title: 'Configuración inicial recomendada', content: '<p>Empieza con estos valores base:</p><p>Scope 3rd Person: 80-90</p><p>Punto Rojo/Holográfico: 90-100</p><p>Scope 2x: 85-95</p><p>Scope 4x: 90-100</p><p>AWM: 95-100</p><p>Free Look: 70-80</p><p>El giroscopio necesita valores más altos que la sensibilidad manual porque los movimientos del celular son más pequeños que los del dedo.</p>', orderIndex: 1, isPremium: true },
      { title: 'Ejercicios diarios de práctica', content: '<p>Día 1-3: Solo caminar y mirar alrededor con giro. No dispares. Acostúmbrate al movimiento.</p><p>Día 4-7: Practica tracking (seguir un objetivo en movimiento) en sala de entrenamiento.</p><p>Día 8-14: Combina giroscopio + dedo. Usa el dedo para movimientos grandes y el giro para micro-ajustes.</p><p>Día 15+: Entra a ranked y practica en combates reales.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Los 10 Errores Más Comunes con la Sensibilidad',
    slug: '10-errores-comunes-sensibilidad',
    description: 'Errores que cometen el 90% de los jugadores al configurar su sensibilidad y cómo evitarlos.',
    category: 'SENSITIVITY',
    content: '<p>La mayoría de jugadores configuran su sensibilidad de forma incorrecta. Estos son los errores más comunes que hemos identificado analizando miles de configuraciones.</p>',
    readTimeMin: 6,
    isPremium: false,
    sections: [
      { title: 'Error #1 al #5', content: '<p><strong>1. Copiar la sensibilidad de un streamer:</strong> Su dispositivo, pantalla y dedos son diferentes a los tuyos.</p><p><strong>2. Cambiar sensibilidad constantemente:</strong> Tu cerebro necesita mínimo 3 días para adaptarse a nuevos valores.</p><p><strong>3. Ignorar el giroscopio:</strong> Incluso en nivel bajo, el giro te da ventaja en combates cercanos.</p><p><strong>4. Misma sensibilidad para todas las miras:</strong> Cada mira tiene un zoom diferente y necesita valores diferentes.</p><p><strong>5. No considerar tu dispositivo:</strong> Un Redmi Note 12 y un Samsung S24 necesitan valores completamente diferentes.</p>', orderIndex: 0, isPremium: false },
      { title: 'Error #6 al #10', content: '<p><strong>6. Sensibilidad muy alta "para girar rápido":</strong> Pierdes precisión. Es mejor un giro de 180° consistente que uno de 360° incontrolable.</p><p><strong>7. No usar sala de entrenamiento:</strong> Calibrar en partida real es como aprender a manejar en la autopista.</p><p><strong>8. Ignorar el DPI de tu pantalla:</strong> Pantallas con mayor DPI necesitan ajustes diferentes.</p><p><strong>9. No ajustar Free Look:</strong> El Free Look es clave para vigilar mientras corres.</p><p><strong>10. No recalibrar después de una actualización:</strong> Garena a veces cambia cómo funcionan los sliders en parches grandes.</p>', orderIndex: 1, isPremium: false },
    ],
  },
  {
    title: 'Sensibilidad por Rango: De Bronce a Heroico',
    slug: 'sensibilidad-por-rango-bronce-heroico',
    description: 'Cómo ajustar tu sensibilidad según tu nivel competitivo actual para subir de rango más rápido.',
    category: 'SENSITIVITY',
    content: '<p>Tu sensibilidad ideal cambia conforme mejoras como jugador. Lo que funciona en Bronce no funciona en Heroico.</p>',
    readTimeMin: 7,
    isPremium: true,
    sections: [
      { title: 'Bronce a Oro', content: '<p>En rangos bajos, la prioridad es control. Usa sensibilidades más bajas (40-60 general) para tener aim estable. No necesitas girar rápido porque los combates son más lentos y hay menos jugadores agresivos.</p>', orderIndex: 0, isPremium: false },
      { title: 'Platino a Diamante', content: '<p>Aquí necesitas más velocidad de reacción. Sube general a 60-75 y activa giroscopio en nivel bajo. Los combates son más rápidos y necesitas girar para verificar flancos.</p>', orderIndex: 1, isPremium: true },
      { title: 'Heroico y Maestro', content: '<p>Sensibilidad alta (70-90) con giroscopio activo. Necesitas micro-flicks instantáneos, giros de 180° consistentes, y la capacidad de cambiar entre objetivos rápidamente. Aquí es donde el giroscopio marca la diferencia real.</p>', orderIndex: 2, isPremium: true },
    ],
  },

  // ─── AIM (3 guías) ───
  {
    title: 'Cómo Mejorar tu Puntería en Free Fire',
    slug: 'como-mejorar-punteria-free-fire',
    description: 'Técnicas probadas de aim training: tracking, flicking, pre-aim y crosshair placement.',
    category: 'AIM',
    content: '<p>La puntería es una habilidad que se entrena, no un talento natural. Con las técnicas correctas y práctica constante, cualquier jugador puede mejorar dramáticamente su aim.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      { title: 'Tracking vs Flicking', content: '<p><strong>Tracking:</strong> Seguir a un enemigo en movimiento manteniendo la mira sobre él. Es la habilidad más importante para AR y SMG.</p><p><strong>Flicking:</strong> Mover la mira rápidamente hacia un objetivo que aparece de repente. Es clave para shotguns y combates sorpresa.</p><p>El 80% de los combates en Free Fire requieren tracking. Prioriza esta habilidad.</p>', orderIndex: 0, isPremium: false },
      { title: 'Pre-aim y Crosshair Placement', content: '<p>Pre-aim significa mantener tu mira apuntando donde esperas que aparezca un enemigo. Si tu crosshair ya está a nivel de cabeza cuando el enemigo sale de una esquina, solo necesitas disparar.</p><p>Practica caminando por el mapa con tu mira siempre a nivel de cabeza, apuntando a esquinas y puertas donde podría aparecer un enemigo.</p>', orderIndex: 1, isPremium: false },
      { title: 'Rutina diaria de aim training', content: '<p>Dedica 10 minutos antes de jugar ranked:</p><p>Minutos 1-3: Tracking lento — sigue un punto en la pared haciendo círculos con tu dedo.</p><p>Minutos 4-6: Flick shots — apunta a un punto, gira 90°, vuelve al punto lo más rápido posible.</p><p>Minutos 7-10: Combate en sala de entrenamiento contra bots.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Headshot Rate: Cómo Subir tu Porcentaje',
    slug: 'headshot-rate-como-subir-porcentaje',
    description: 'El secreto para hacer más headshots: posicionamiento, timing y control de retroceso.',
    category: 'AIM',
    content: '<p>Un headshot rate alto no solo se ve bien en tu perfil — mata más rápido, gasta menos balas y gana más combates 1v1.</p>',
    readTimeMin: 7,
    isPremium: true,
    sections: [
      { title: 'Crosshair placement avanzado', content: '<p>Mantén tu mira SIEMPRE a nivel de cabeza. No al pecho, no al suelo. A nivel de cabeza. Esto solo reduce la distancia que necesitas mover para hacer headshot.</p>', orderIndex: 0, isPremium: false },
      { title: 'Control de retroceso por arma', content: '<p>Cada arma tiene un patrón de retroceso diferente. El AK sube y va a la derecha. El M4 sube recto. La SCAR sube poco. Aprende el patrón de tu arma principal y compensa jalando en dirección opuesta.</p>', orderIndex: 1, isPremium: true },
    ],
  },
  {
    title: 'Aim con Shotgun: Domina el Combate Cercano',
    slug: 'aim-shotgun-combate-cercano',
    description: 'Técnicas de one-tap con shotgun: timing, posicionamiento y combos con gloo wall.',
    category: 'AIM',
    content: '<p>La shotgun es el arma más letal en combate cercano. Un solo disparo bien puesto elimina a cualquier enemigo.</p>',
    readTimeMin: 6,
    isPremium: false,
    sections: [
      { title: 'El one-tap perfecto', content: '<p>No apuntes con scope — dispara en tercera persona. La shotgun tiene spread amplio, así que apunta al torso superior/cabeza a menos de 5 metros. El timing es más importante que la precisión pixel-perfect.</p>', orderIndex: 0, isPremium: false },
      { title: 'Combo shotgun + gloo wall', content: '<p>El combo clásico: dispara, coloca gloo wall, agáchate, espera 0.5s, sal por el lado y dispara de nuevo. Practica este combo hasta que sea automático.</p>', orderIndex: 1, isPremium: false },
    ],
  },

  // ─── MOVEMENT (3 guías) ───
  {
    title: 'Movimiento Avanzado en Free Fire',
    slug: 'movimiento-avanzado-free-fire',
    description: 'Domina el drop shot, bunny hop, jiggle peek y side step para ganar más combates.',
    category: 'MOVEMENT',
    content: '<p>El movimiento es lo que separa a un jugador promedio de un crack. Puedes tener el mejor aim del mundo, pero si te quedas quieto, eres un blanco fácil.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      { title: 'Drop Shot', content: '<p>Agacharte mientras disparas hace que tu hitbox baje instantáneamente, esquivando las balas del enemigo que apuntaba a tu torso. Practica agacharte y disparar al mismo tiempo hasta que sea automático.</p>', orderIndex: 0, isPremium: false },
      { title: 'Jiggle Peek', content: '<p>Asómate rápidamente por una esquina, dispara 2-3 balas y vuelve a cubrirte. Es la técnica más segura para combates en edificios. Muévete izquierda-derecha rápidamente mientras asomas.</p>', orderIndex: 1, isPremium: false },
      { title: 'Bunny Hop y Side Step', content: '<p>El bunny hop es saltar repetidamente mientras te mueves para ser un blanco difícil. Combínalo con side steps (moverte en zigzag) para ser casi imposible de dar a distancia media.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Gloo Wall Mastery: De Básico a PRO',
    slug: 'gloo-wall-mastery-basico-a-pro',
    description: 'Técnicas de gloo wall: one-tap wall, 360 wall, ramp rush y trick shots.',
    category: 'MOVEMENT',
    content: '<p>La gloo wall es la mecánica más única de Free Fire y dominarla te pone en otro nivel.</p>',
    readTimeMin: 10,
    isPremium: true,
    sections: [
      { title: 'One-tap gloo wall', content: '<p>Colocar una gloo wall con un solo toque es esencial. Cambia a gloo wall, mira al suelo frente a ti y toca. Debe ser instantáneo — menos de 0.3 segundos desde que decides hasta que la pared está ahí.</p>', orderIndex: 0, isPremium: false },
      { title: '360 wall y ramp rush', content: '<p>360 wall: gira mientras colocas 4 gloo walls para crear un fuerte instantáneo. Ramp rush: coloca una gloo wall inclinada y súbete para tener altura sobre el enemigo.</p>', orderIndex: 1, isPremium: true },
      { title: 'Trick shots con gloo wall', content: '<p>Coloca una gloo wall, salta encima, y dispara al enemigo desde arriba. Combina con drop shot para bajar mientras disparas. Es el combo más difícil de contrarrestar.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Rotaciones Inteligentes: Llega al Top 3',
    slug: 'rotaciones-inteligentes-top-3',
    description: 'Cómo rotar por el mapa, cuándo moverse, rutas seguras y posicionamiento en zona.',
    category: 'MOVEMENT',
    content: '<p>El 70% de las partidas se pierden por mala rotación, no por mal aim. Saber cuándo y hacia dónde moverte es más importante que saber disparar.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      { title: 'Lectura de zona', content: '<p>Cuando se cierra la zona, no corras directo al centro. Analiza: ¿dónde hay edificios? ¿Dónde hay cobertura? ¿De dónde vendrán otros jugadores? Muévete hacia el lado de la zona con mejor cobertura.</p>', orderIndex: 0, isPremium: false },
      { title: 'Timing de rotación', content: '<p>Rota ANTES de que la zona te empuje. Si esperas a que la zona te alcance, estarás corriendo sin cobertura mientras otros ya están posicionados. Muévete cuando la zona se anuncia, no cuando empieza a cerrarse.</p>', orderIndex: 1, isPremium: false },
    ],
  },

  // ─── STRATEGY (3 guías) ───
  {
    title: 'Estrategias para Squad Ranked',
    slug: 'estrategias-squad-ranked',
    description: 'Roles de equipo, comunicación, aterrizajes coordinados y estrategias de endgame.',
    category: 'STRATEGY',
    content: '<p>Jugar ranked en squad es completamente diferente a solo queue. La coordinación del equipo determina quién gana.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      { title: 'Roles de equipo', content: '<p><strong>IGL (In-Game Leader):</strong> Toma las decisiones de rotación y combate. Solo UNA persona debe ser IGL.</p><p><strong>Fragger:</strong> El que inicia los combates. Mejor aim del equipo.</p><p><strong>Support:</strong> Cubre al fragger, revive, comparte recursos.</p><p><strong>Sniper:</strong> Control de mapa a distancia, información de enemigos.</p>', orderIndex: 0, isPremium: false },
      { title: 'Comunicación efectiva', content: '<p>Usa callouts cortos: "Enemigo norte, 50 metros, detrás de gloo" es mejor que "¡Ahí está, ahí está!". Número + dirección + distancia + cobertura.</p>', orderIndex: 1, isPremium: false },
      { title: 'Endgame en squad', content: '<p>En las últimas zonas, quédate junto a tu equipo. Nunca te separes. El equipo que se mantiene unido gana el 80% de las últimas peleas. Prioriza revivir compañeros sobre matar enemigos.</p>', orderIndex: 2, isPremium: true },
    ],
  },
  {
    title: 'Cómo Ganar Partidas Solo vs Squad',
    slug: 'como-ganar-solo-vs-squad',
    description: 'Tácticas de supervivencia y eliminación cuando juegas solo contra equipos completos.',
    category: 'STRATEGY',
    content: '<p>Solo vs Squad es el modo más difícil de Free Fire, pero también el que más te hace mejorar como jugador.</p>',
    readTimeMin: 8,
    isPremium: true,
    sections: [
      { title: 'Mentalidad y aterrizaje', content: '<p>No aterrices en hot drops. Busca un lugar alejado con buen loot. Tu objetivo es llegar al top 5 primero, después pensar en kills.</p>', orderIndex: 0, isPremium: false },
      { title: 'Third party', content: '<p>Nunca inicies un combate. Espera a que dos equipos peleen y ataca al ganador cuando está débil. Es la estrategia más efectiva en solo vs squad.</p>', orderIndex: 1, isPremium: true },
    ],
  },
  {
    title: 'Loot Priority: Qué Recoger Primero',
    slug: 'loot-priority-que-recoger-primero',
    description: 'Prioridad de armas, accesorios, consumibles y equipamiento para ser eficiente en el looteo.',
    category: 'STRATEGY',
    content: '<p>Los primeros 60 segundos después de aterrizar definen tu partida. Saber exactamente qué buscar te da una ventaja enorme.</p>',
    readTimeMin: 5,
    isPremium: false,
    sections: [
      { title: 'Prioridad de armas', content: '<p>Segundo 1-10: Cualquier arma que encuentres. Segundo 10-30: AR o SMG. Segundo 30-60: Tu combo ideal (AR + Shotgun o AR + Sniper). No seas codicioso — un MP40 en mano vale más que un M4 en el siguiente edificio.</p>', orderIndex: 0, isPremium: false },
      { title: 'Equipamiento esencial', content: '<p>Prioridad: Chaleco nivel 2+ > Casco nivel 2+ > Mochila > Medkits > Gloo walls. Las gloo walls son más importantes que granadas. SIEMPRE lleva mínimo 3 gloo walls.</p>', orderIndex: 1, isPremium: false },
    ],
  },

  // ─── DEVICE (3 guías) ───
  {
    title: 'Optimiza tu Celular para Free Fire',
    slug: 'optimiza-celular-free-fire',
    description: 'Configuraciones de gráficos, FPS, batería y rendimiento para que tu dispositivo no te limite.',
    category: 'DEVICE',
    content: '<p>Tu celular puede estar limitando tu rendimiento sin que lo sepas. Una buena configuración puede significar la diferencia entre 30 y 60 FPS.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      { title: 'Gráficos vs FPS', content: '<p>SIEMPRE prioriza FPS sobre gráficos. Pon gráficos en "Suave" y FPS en "Alto" o "Ultra" si tu celular lo soporta. Los gráficos bonitos no ganan partidas, los FPS estables sí.</p>', orderIndex: 0, isPremium: false },
      { title: 'Liberar RAM', content: '<p>Cierra TODAS las apps en segundo plano antes de jugar. Desactiva notificaciones. Si tu celular tiene "Modo Gaming", actívalo. Cada MB de RAM libre es un frame más.</p>', orderIndex: 1, isPremium: false },
      { title: 'Control de temperatura', content: '<p>Un celular caliente baja su rendimiento automáticamente (thermal throttling). Juega en un lugar fresco, quita la funda del celular, y toma descansos de 5 minutos cada 3-4 partidas.</p>', orderIndex: 2, isPremium: false },
    ],
  },
  {
    title: 'Los Mejores Celulares para Free Fire 2025',
    slug: 'mejores-celulares-free-fire-2025',
    description: 'Top 10 celulares por rango de precio para jugar Free Fire al máximo rendimiento.',
    category: 'DEVICE',
    content: '<p>No necesitas el celular más caro para jugar bien Free Fire. Te mostramos las mejores opciones por presupuesto.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      { title: 'Presupuesto bajo (menos de $3,000 MXN)', content: '<p>Redmi Note 12, Samsung A14, Motorola G24. Todos corren Free Fire a 60FPS en gráficos medios. El Redmi Note 12 es la mejor opción calidad-precio.</p>', orderIndex: 0, isPremium: false },
      { title: 'Gama media ($3,000 - $7,000 MXN)', content: '<p>POCO X5 Pro, Samsung A54, Redmi Note 13 Pro. Pantallas de 120Hz, procesadores que mantienen 60FPS estables en gráficos altos. El POCO X5 Pro es la mejor opción gaming en esta gama.</p>', orderIndex: 1, isPremium: false },
      { title: 'Gama alta (+$7,000 MXN)', content: '<p>Samsung S24, iPhone 15, OnePlus 12. 120Hz, procesadores tope de gama, pantallas AMOLED. Si tu presupuesto lo permite, el Samsung S24 es la mejor experiencia gaming en Android.</p>', orderIndex: 2, isPremium: true },
    ],
  },

  // ─── DEVICE (1 extra para llegar a 20) ───
  {
    title: 'Accesorios Gaming para Celular: Guía de Compra',
    slug: 'accesorios-gaming-celular-guia-compra',
    description: 'Triggers, gamepads, ventiladores, audífonos y pantallas externas para mejorar tu experiencia gaming.',
    category: 'DEVICE',
    content: '<p>Los accesorios correctos pueden transformar tu experiencia de juego. No todos son necesarios, pero algunos marcan una diferencia real.</p>',
    readTimeMin: 6,
    isPremium: false,
    sections: [
      { title: 'Triggers y gamepads', content: '<p>Los triggers L1/R1 te dan dos botones extra para disparar y apuntar sin quitar los pulgares del joystick. Los gamepads tipo Bluetooth son buenos para juegos casuales pero NO recomendados para ranked competitivo — la latencia es un problema.</p>', orderIndex: 0, isPremium: false },
      { title: 'Ventiladores y audífonos', content: '<p>Un ventilador clip-on reduce la temperatura del celular hasta 10°C, evitando thermal throttling. Audífonos con cable (no Bluetooth) son esenciales — necesitas escuchar pasos sin delay. Busca unos con buen aislamiento de ruido.</p>', orderIndex: 1, isPremium: false },
    ],
  },

  // ─── META (3 guías) ───
  {
    title: 'Meta Actual de Free Fire: Las Mejores Armas',
    slug: 'meta-actual-free-fire-mejores-armas',
    description: 'Análisis actualizado del meta: tier list de armas, combos recomendados y qué evitar.',
    category: 'META',
    content: '<p>El meta de Free Fire cambia con cada actualización. Aquí te mantenemos al día con las armas más fuertes del momento.</p>',
    readTimeMin: 6,
    isPremium: false,
    sections: [
      { title: 'Tier S (las mejores)', content: '<p>M4A1: Estable, versátil, buena a todas las distancias. Es la mejor AR del juego actualmente.</p><p>MP40: Rey del combate cercano. TTK (time to kill) más bajo de las SMG.</p><p>AWM: One-shot headshot garantizado. Domina las distancias largas.</p>', orderIndex: 0, isPremium: false },
      { title: 'Tier A (muy buenas)', content: '<p>AK47: Daño alto pero retroceso fuerte. Para jugadores con buen control.</p><p>SCAR: Fácil de usar, buen daño, bajo retroceso. Ideal para principiantes.</p><p>Shotgun M1014: Devastadora en interiores. Combo con gloo wall es letal.</p>', orderIndex: 1, isPremium: false },
      { title: 'Combos recomendados', content: '<p>Agresivo: M4A1 + MP40 — dominas todas las distancias.</p><p>Balanceado: SCAR + Shotgun — versátil y consistente.</p><p>Francotirador: AWM + MP40 — mata lejos y de cerca.</p>', orderIndex: 2, isPremium: false },
    ],
  },
  {
    title: 'Mejores Personajes y Habilidades del Meta',
    slug: 'mejores-personajes-habilidades-meta',
    description: 'Tier list de personajes activos y pasivos, mejores combos de habilidades para ranked.',
    category: 'META',
    content: '<p>Los personajes y sus habilidades pueden cambiar completamente tu estilo de juego. Elegir el combo correcto te da una ventaja significativa.</p>',
    readTimeMin: 7,
    isPremium: true,
    sections: [
      { title: 'Tier S: Personajes esenciales', content: '<p>Alok: Curación + velocidad de movimiento. El personaje más versátil del juego.</p><p>Chrono: Escudo temporal para combates agresivos.</p><p>Wukong: Transformación para flanquear y emboscar.</p>', orderIndex: 0, isPremium: false },
      { title: 'Combos de habilidades para ranked', content: '<p>Combo agresivo: Alok + Jota + Hayato + Kelly. Curación constante + daño extra.</p><p>Combo defensivo: Chrono + Alok + Shirou + Moco. Escudo + tracking de enemigos.</p><p>Combo sniper: Laura + Moco + Rafael + Shirou. Precisión máxima + sigilo.</p>', orderIndex: 1, isPremium: true },
    ],
  },
  {
    title: 'Tier List de Mascotas: Cuáles Valen la Pena',
    slug: 'tier-list-mascotas-cuales-valen',
    description: 'Las mejores mascotas del meta actual, combos con personajes y cuáles ignorar.',
    category: 'META',
    content: '<p>Las mascotas son un boost pasivo que muchos jugadores ignoran. La mascota correcta complementa tu personaje y estilo de juego.</p>',
    readTimeMin: 5,
    isPremium: false,
    sections: [
      { title: 'Tier S: Mascotas imprescindibles', content: '<p>Falcón: Aumento de velocidad de paracaídas. Aterriza primero, lootea primero, gana primero. Es la mascota más usada en competitivo.</p><p>Rockie: Reduce el cooldown de habilidades activas. Funciona con TODOS los personajes.</p>', orderIndex: 0, isPremium: false },
      { title: 'Combos mascota + personaje', content: '<p>Falcón + Alok: Aterrizaje rápido + heal constante = dominación temprana.</p><p>Rockie + Chrono: Escudo disponible más seguido = agresividad constante.</p><p>Panda + Jota: Doble curación = casi imposible de matar en 1v1.</p>', orderIndex: 1, isPremium: false },
    ],
  },
];

export async function seedGuides(prisma: PrismaClient, adminId: string): Promise<number> {
  let count = 0;

  for (const guide of GUIDES) {
    const existing = await prisma.guide.findUnique({
      where: { slug: guide.slug },
    });

    if (existing) continue;

    await prisma.guide.create({
      data: {
        title: guide.title,
        slug: guide.slug,
        description: guide.description,
        category: guide.category,
        content: guide.content,
        readTimeMin: guide.readTimeMin,
        isPremium: guide.isPremium,
        isPublished: true,
        viewCount: Math.floor(Math.random() * 5000) + 500,
        authorId: adminId,
        sections: {
          create: guide.sections,
        },
      },
    });

    count++;
  }

  return count;
}
