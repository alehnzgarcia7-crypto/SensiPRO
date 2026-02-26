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
  // ═══════════════════════════════════════════════════════════
  // SENSIBILIDAD (5 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Cómo Encontrar tu Sensibilidad Perfecta en Free Fire',
    slug: 'como-encontrar-sensibilidad-perfecta-free-fire',
    description: 'Guía paso a paso para principiantes: entiende cada slider, calibra según tu dispositivo y encuentra la configuración que te hará mejorar.',
    category: 'SENSITIVITY',
    content: '<p>La sensibilidad en Free Fire es el pilar fundamental de tu gameplay. No importa qué tan buenas sean tus armas o tu posicionamiento — si tu sensibilidad no está bien calibrada, nunca vas a conectar los disparos que necesitas. Esta guía te enseña desde cero cómo funciona el sistema de sensibilidad y cómo encontrar TU configuración ideal.</p><p>El error más grande que cometen los jugadores es copiar la sensibilidad de un streamer. Lo que funciona para alguien jugando en un iPad Pro con 120Hz no va a funcionar en tu Redmi Note 12 con 60Hz. Cada dispositivo responde diferente al touch, tiene diferente latencia de pantalla y diferente respuesta del giroscopio.</p>',
    readTimeMin: 10,
    isPremium: false,
    sections: [
      {
        title: 'Los 6 Sliders de Sensibilidad Explicados',
        content: '<p>Free Fire tiene 6 controles de sensibilidad independientes, cada uno en una escala de 0 a 200:</p><p><strong>General:</strong> Controla la velocidad al mirar alrededor sin apuntar. Es el slider más importante porque afecta tu capacidad de girar, verificar flancos y hacer seguimiento de enemigos a tu alrededor. Un valor muy bajo te deja vulnerable a ataques por la espalda; uno muy alto te hace perder control al intentar apuntar.</p><p><strong>Punto Rojo (Red Dot):</strong> La sensibilidad al usar miras de punto rojo u holográficas. Es la mira más común en los primeros minutos del juego y la que más usarás con AR a media distancia. Debe ser lo suficientemente precisa para mantener el crosshair en el enemigo mientras controlas el retroceso.</p><p><strong>Scope 2x:</strong> Para combates a media distancia (50-100m) con mira 2x. Necesitas un balance entre velocidad para seguir a un enemigo en movimiento y estabilidad para mantener la mira fija durante el spray.</p><p><strong>Scope 4x:</strong> Para combates a larga distancia (100m+). Aquí la precisión es clave — cualquier movimiento mínimo del dedo mueve la mira una distancia enorme a esa distancia. Valores más bajos dan más control.</p><p><strong>Sniper Scope:</strong> Específico para el scope de AWM, Kar98k y M82B. El scope tiene más zoom que el 4x, así que necesitas aún más precisión. Muchos pros usan valores entre 40-60 en escala 0-200.</p><p><strong>Free Look (Vista Libre):</strong> La velocidad al usar el botón de vista libre (el ojo) que te permite mirar sin mover al personaje. Necesitas que sea rápido para vigilar mientras corres, pero no tan rápido que no puedas enfocar en una dirección específica.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Cómo Afecta tu Dispositivo a la Sensibilidad (v4.0)',
        content: '<p>El algoritmo v4.0 usa el DPI de tu pantalla como factor principal (~90% del cálculo). Los demás factores son ajustes secundarios:</p><p><strong>DPI de Pantalla (FACTOR #1):</strong> El DPI (dots per inch) mide cuántos píxeles hay por pulgada de tu pantalla. Un Samsung A13 tiene DPI ~270, un iPhone 15 tiene DPI ~460. A mayor DPI, tu dedo cubre más píxeles por centímetro de movimiento, por lo que necesitas MENOS sensibilidad. La interpolación v4.0 va de General 195 (DPI 200) a General 135 (DPI 600).</p><p><strong>RAM (ajuste ±5 puntos):</strong> La RAM afecta la estabilidad de FPS, no la sensibilidad directamente. Celulares con 3GB o menos bajan ~5 puntos porque los frame drops hacen que sensi alta sea inconsistente. 12GB+ sube ~5 puntos. Es un ajuste menor comparado con el DPI.</p><p><strong>Refresh Rate (ajuste ±3 puntos):</strong> 120Hz suma ~3 puntos vs 60Hz. Los frames más suaves permiten sensibilidad ligeramente más alta. Antes se creía que era 10-15% — en v4.0 son solo ±3 puntos.</p><p><strong>Tamaño de Pantalla (ajuste ±4 puntos):</strong> Pantallas más grandes suman algunos puntos por la ergonomía del swipe. Es el ajuste secundario más pequeño.</p><p><strong>Panel (LCD vs AMOLED):</strong> AMOLED tiene mejor respuesta al touch pero el impacto en sensibilidad es mínimo (~1-2 puntos). No es un factor significativo en v4.0.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Método de Calibración PRO v4.0 (5 Pasos)',
        content: '<p>Este es el método actualizado para v4.0 con calibración forense DPI-first:</p><p><strong>Paso 1 — Genera tu base en SensiPRO:</strong> Busca tu modelo exacto en el generador. El algoritmo v4.0 calcula tu General base usando el DPI de tu pantalla como factor principal, con ajustes secundarios por RAM, Hz y tamaño. Este es tu punto de partida científico — NO 100, NO el valor de un streamer.</p><p><strong>Paso 2 — Aplica tapering -15:</strong> Si tu General es 175, tu Punto Rojo debería ser 160, tu 2x = 145, tu 4x = 130, tu AWM = 115. Este patrón escalonado de -15 es usado por los mejores calibradores del mundo porque da control progresivo con cada nivel de zoom.</p><p><strong>Paso 3 — Prueba en entrenamiento:</strong> Ve a la sala de entrenamiento con estos valores. Intenta girar 180° con un solo swipe. Si giras demasiado, baja General 5 puntos (y todos los demás -5 también). Si no llegas, sube 5. El tapering -15 se mantiene siempre.</p><p><strong>Paso 4 — Free Look aparte:</strong> El Free Look NO sigue el tapering. Ponlo entre 14-22 según tu DPI (SensiPRO lo calcula). Pruébalo corriendo y mirando a los costados — debe ser rápido para vigilar pero controlable.</p><p><strong>Paso 5 — 3 días sin tocar:</strong> Dale mínimo 3 días antes de juzgar. Tu memoria muscular necesita adaptarse. Si después de 3 días sigue incómodo, ajusta de 5 en 5 puntos manteniendo el tapering -15.</p><p><strong>Importante:</strong> NUNCA estrenes sensibilidad nueva en ranked. Siempre prueba 10-15 min en Training Ground primero.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'La Escala 0-200: Todo lo que Cambió Después del OB50',
    slug: 'escala-0-200-cambios-ob50-free-fire',
    description: 'Free Fire cambió su sistema de sensibilidad. Aprende cómo funciona la nueva escala, cómo convertir tus valores anteriores y qué settings usar.',
    category: 'SENSITIVITY',
    content: '<p>Free Fire opera con una escala de sensibilidad de 0 a 200, donde 100 es el punto medio neutral. Muchos jugadores que vienen de configuraciones antiguas o que ven guías desactualizadas no entienden cómo funciona esta escala y terminan con valores subóptimos. Esta guía te explica todo sobre el sistema actual y cómo sacarle el máximo provecho.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      {
        title: 'Cómo Funciona la Escala 0-200',
        content: '<p>La escala 0-200 de Free Fire no es lineal — es decir, la diferencia entre 50 y 60 no es la misma que entre 150 y 160. En los extremos (cerca de 0 o de 200) los cambios son más drásticos, mientras que en el centro (80-120) los cambios son más sutiles.</p><p>Esto significa que si estás en 100, subir a 110 apenas se nota. Pero si estás en 180, subir a 190 es un cambio ENORME. Por eso la mayoría de los jugadores profesionales mantienen sus valores entre 150-185: es la zona donde tienes buena velocidad pero los ajustes finos todavía son manejables.</p><p><strong>Valores recomendados por los pros (OB51):</strong></p><p>General: 165 | Punto Rojo: 185 | Scope 2x: 170 | Scope 4x: 165 | Sniper: 160 | Free Look: 185</p><p>Estos son promedios — tu valor ideal depende de tu dispositivo, pero es un excelente punto de partida para dispositivos de gama media-alta (6GB+ RAM, 90Hz+).</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Aim Precision: Los 3 Nuevos Modos del OB51',
        content: '<p>OB51 introdujo tres modos de precisión de aim que interactúan directamente con tu sensibilidad:</p><p><strong>Default (Aim Assist):</strong> El modo estándar. Free Fire ayuda a pegar tu mira al enemigo cuando estás cerca de apuntar a él. Es el más fácil de usar y el recomendado para jugadores de nivel bajo-medio. Tu sensibilidad funciona normalmente.</p><p><strong>Precise on Scope:</strong> Cuando usas scope, la sensibilidad se reduce automáticamente para darte más precisión. Es perfecto para jugadores que usan sensibilidad alta para girar rápido pero necesitan más control al apuntar con scope. Si usas este modo, puedes permitirte subir tu sensibilidad general 10-15 puntos sin perder precisión al scopear.</p><p><strong>Full Control:</strong> Desactiva todo aim assist. Tus disparos van exactamente donde apuntas, sin corrección. Solo para jugadores avanzados con excelente memoria muscular. Si usas este modo, necesitas sensibilidad perfectamente calibrada porque no hay red de seguridad.</p><p>Además, OB51 redujo el aim assist más allá de 10 metros y añadió -10% velocidad de movimiento al scopear con un objetivo a menos de 5m. Esto cambia cómo se siente la sensibilidad en combates cercanos con scope.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Valores por DPI de Pantalla (v4.0)',
        content: '<p>El algoritmo v4.0 usa DPI-first con tapering -15. Aquí están los rangos reales por tipo de dispositivo:</p><p><strong>DPI bajo (~270) — Samsung A13, A14, A15, Redmi 12, Redmi 13C:</strong> General 183-190 | P.Rojo 168-175 | 2x 153-160 | 4x 138-145 | AWM 123-130 | Vista Libre 19-21. Estos celulares tienen menos píxeles por pulgada, así que necesitan sensibilidad más ALTA para que el mismo movimiento de dedo produzca el mismo giro.</p><p><strong>DPI medio (~395) — Redmi Note 13, POCO X5, Samsung A54, Moto G54:</strong> General 173-178 | P.Rojo 158-163 | 2x 143-148 | 4x 128-133 | AWM 113-118 | Vista Libre 17-19. La zona media donde la mayoría de jugadores de LATAM se encuentran.</p><p><strong>DPI alto (~460) — iPhone 13-16, Samsung S23-S24, Xiaomi 13-14:</strong> General 163-172 | P.Rojo 148-157 | 2x 133-142 | 4x 118-127 | AWM 103-112 | Vista Libre 15-17. DPI alto = menos sensibilidad. No es que el celular sea "peor" — es que los píxeles son más densos.</p><p><strong>DPI ultra (~500+) — Samsung S24 Ultra, Xiaomi 14 Ultra:</strong> General 145-160 | P.Rojo 130-145 | 2x 115-130 | 4x 100-115 | AWM 85-100 | Vista Libre 14-15. Pantallas QHD+ con densidad extrema. Sensibilidad baja = más control por milímetro.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'DPI de Pantalla: El Factor #1 de tu Sensibilidad',
    slug: 'dpi-pantalla-factor-principal-sensibilidad',
    description: 'El DPI de tu pantalla es lo que realmente determina tu sensibilidad óptima en Free Fire. Aprende cómo funciona la calibración forense v4.0.',
    category: 'SENSITIVITY',
    content: '<p>El DPI (puntos por pulgada) de tu pantalla es el factor #1 que determina tu sensibilidad en Free Fire. No es la RAM, no es el procesador — es cuántos píxeles tiene tu pantalla por pulgada. El algoritmo v4.0 de SensiPRO usa calibración forense DPI-first con ±2 puntos de precisión. Esta guía explica cómo funciona y por qué tu sensibilidad cambia entre dispositivos.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      {
        title: 'Qué es DPI y Por Qué Manda tu Sensibilidad',
        content: '<p>DPI = Dots Per Inch (puntos por pulgada). Es la densidad de píxeles de tu pantalla. Un Samsung A13 tiene DPI ~270 (pocos píxeles por pulgada), mientras que un iPhone 15 tiene DPI ~460 (muchos píxeles por pulgada).</p><p><strong>Por qué el DPI es el factor #1:</strong> Cuando mueves tu dedo 1 centímetro en una pantalla de DPI 270, cubres menos píxeles que en una de DPI 460. Para que el MISMO movimiento de dedo produzca el MISMO giro en Free Fire, necesitas sensibilidad más ALTA en pantallas de DPI bajo y más BAJA en pantallas de DPI alto.</p><p><strong>La fórmula v4.0:</strong> Usa interpolación por segmentos: DPI 200→General 195, DPI 270→183, DPI 395→175, DPI 460→165, DPI 600→135. Después se aplican ajustes secundarios de RAM (±5), Hz (±3), y tamaño de pantalla (±4).</p><p><strong>Ejemplo real:</strong> Samsung A13 (DPI 270) → General 187 con tapering -15: P.Rojo 172, 2x 157, 4x 142, AWM 127. iPhone 15 (DPI 460) → General 170 con tapering -15: P.Rojo 155, 2x 140, 4x 125, AWM 110. La diferencia de 17 puntos no es porque uno sea "mejor" — es porque sus pantallas tienen densidades diferentes.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Tabla de Sensibilidad por DPI + Tapering -15',
        content: '<p>El algoritmo v4.0 genera tu sensibilidad basándose en el DPI de tu pantalla como driver principal, con tapering -15 entre cada nivel de zoom:</p><p><strong>DPI ~200 (HD básico):</strong> General 195 → P.Rojo 180 → 2x 165 → 4x 150 → AWM 135. Vista Libre: 22.</p><p><strong>DPI ~270 (Samsung A13, Redmi 12):</strong> General 183-187 → P.Rojo 168-172 → 2x 153-157 → 4x 138-142 → AWM 123-127. Vista Libre: 19-21.</p><p><strong>DPI ~395 (Redmi Note 13, POCO X5):</strong> General 173-176 → P.Rojo 158-161 → 2x 143-146 → 4x 128-131 → AWM 113-116. Vista Libre: 17-19.</p><p><strong>DPI ~460 (iPhone 14/15/16, Samsung S24):</strong> General 163-170 → P.Rojo 148-155 → 2x 133-140 → 4x 118-125 → AWM 103-110. Vista Libre: 15-17.</p><p><strong>DPI ~600 (pantallas QHD+):</strong> General 135-140 → P.Rojo 120-125 → 2x 105-110 → 4x 90-95 → AWM 75-80. Vista Libre: 14-15.</p><p>Los rangos de ±5 dentro de cada DPI vienen de los ajustes secundarios: RAM (±5), Hz (±3), tamaño de pantalla (±4).</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Ajustes Secundarios: RAM, Hz, Pantalla',
        content: '<p>El DPI es el factor principal (~90% del cálculo), pero hay 3 ajustes secundarios que afinan tu sensibilidad:</p><p><strong>RAM (±5 puntos):</strong> 3GB o menos: -5 puntos (los frame drops hacen que sensi alta sea inconsistente). 4GB: -2. 6GB: base (0). 8GB: +3. 12GB+: +5. La RAM NO define tu sensibilidad — solo la ajusta ligeramente.</p><p><strong>Refresh Rate (±3 puntos):</strong> 60Hz: base (0). 90Hz: +1. 120Hz: +3. 144Hz: +3. Los frames más suaves permiten sensibilidad ligeramente más alta. Antes se creía que era 10-15% — en realidad son solo ±3 puntos.</p><p><strong>Tamaño de pantalla (±4 puntos):</strong> <5.5": -3 (menos distancia de swipe). 6-6.5": base (0). 6.5-7": +2. >7": +4 (tablets). El tamaño afecta la ergonomía del swipe pero no tanto la calibración.</p><p><strong>Ejemplo completo:</strong> Samsung A54 (DPI 401, 8GB, 120Hz, 6.4"): DPI base = 173, RAM +3 = 176, Hz +3 = 179... pero el engine interpola todo junto. SensiPRO calcula todo automáticamente con ±2 puntos de precisión.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'DPI en Free Fire: Qué Es y Cómo Configurarlo',
    slug: 'dpi-free-fire-que-es-como-configurar',
    description: 'El DPI de tu pantalla afecta la sensibilidad efectiva. Aprende qué es, cómo calcularlo y cómo compensar para tu dispositivo.',
    category: 'SENSITIVITY',
    content: '<p>DPI significa "Dots Per Inch" (puntos por pulgada) y es una medida de la densidad de píxeles de tu pantalla. Es un factor oculto que afecta directamente cómo se siente la sensibilidad en Free Fire — y la mayoría de los jugadores ni siquiera saben que existe.</p>',
    readTimeMin: 8,
    isPremium: true,
    sections: [
      {
        title: 'Qué es DPI y Por Qué Importa',
        content: '<p>El DPI mide cuántos píxeles hay en una pulgada de tu pantalla. Un Redmi Note 12 (1080x2400 en 6.67") tiene ~395 DPI, mientras que un iPhone 15 Pro Max (1290x2796 en 6.7") tiene ~460 DPI.</p><p>Más DPI = más píxeles que recorrer con el dedo = la misma sensibilidad se siente MÁS LENTA en pantallas de mayor DPI. Es como la diferencia entre caminar en una calle de 10 metros vs una de 12 metros — necesitas más pasos (movimiento del dedo) para cubrir la misma distancia.</p><p><strong>Ejemplo práctico:</strong> Si pones sensibilidad 150 en un celular de 395 DPI y en uno de 460 DPI, el de 460 DPI se va a sentir notablemente más lento porque tu dedo necesita cubrir más píxeles para el mismo giro. La diferencia es de aproximadamente 15-20% en "feel".</p><p>Esto explica por qué la sensibilidad de un streamer no funciona cuando la copias — probablemente su celular tiene DPI diferente al tuyo.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Cómo Calcular tu DPI Efectivo',
        content: '<p>Para saber el DPI de tu celular, puedes buscarlo en GSMArena.com o calcularlo manualmente:</p><p><strong>Fórmula:</strong> DPI = √(ancho² + alto²) / diagonal en pulgadas</p><p>Ejemplo para Samsung Galaxy A54 (1080x2340, 6.4"): √(1080² + 2340²) / 6.4 = √(6,643,600) / 6.4 = 2,577 / 6.4 = 403 DPI</p><p><strong>Rangos de DPI comunes:</strong></p><p>Menos de 300 DPI: Pantallas HD básicas. Sensibilidad se siente rápida. Baja 5-10% de las recomendaciones estándar.</p><p>300-400 DPI: Rango medio (la mayoría de gama media). Valores estándar funcionan bien.</p><p>400-500 DPI: Full HD+ y superiores. Sube 5-10% respecto a las recomendaciones.</p><p>Más de 500 DPI: Pantallas QHD+ y tablets. Sube 10-15%.</p>',
        orderIndex: 1,
        isPremium: true,
      },
      {
        title: 'Compensación de DPI en la Práctica',
        content: '<p>Una vez que conoces tu DPI, puedes compensar para que tu sensibilidad "se sienta" igual que en otros dispositivos:</p><p><strong>Fórmula de compensación:</strong> Tu sensibilidad = Sensibilidad base × (tu DPI / 400)</p><p>Si la sensibilidad recomendada para tu rango de RAM es 150, y tu celular tiene 460 DPI: 150 × (460/400) = 150 × 1.15 = 172.5 ≈ 173</p><p>Si tu celular tiene 350 DPI: 150 × (350/400) = 150 × 0.875 = 131</p><p>Esta compensación asegura que la velocidad de giro REAL (grados por centímetro de movimiento del dedo) sea consistente independientemente de tu pantalla.</p><p><strong>Nota importante:</strong> Esta es una aproximación. Después de compensar por DPI, siempre necesitas ajuste fino en la sala de entrenamiento. El DPI te da un punto de partida mucho más preciso que adivinar, pero los últimos 5-10 puntos de ajuste deben hacerse por feel.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Giroscopio: Guía Completa para Mejorar tu Aim',
    slug: 'giroscopio-guia-completa-mejorar-aim',
    description: 'Domina el giroscopio desde cero: configuración, ejercicios prácticos, combos con sensibilidad manual y errores comunes.',
    category: 'SENSITIVITY',
    content: '<p>El giroscopio es la ventaja competitiva más grande que puedes tener en Free Fire. Los jugadores profesionales de LATAM como B4, Raistar y los equipos de la Free Fire Pro League usan giroscopio porque permite micro-ajustes de aim imposibles de hacer solo con el dedo. Si todavía no lo usas, esta guía te enseña desde cero.</p>',
    readTimeMin: 12,
    isPremium: true,
    sections: [
      {
        title: 'Por Qué el Giroscopio te Hace Mejor Jugador',
        content: '<p>El giroscopio usa los sensores de movimiento de tu celular (acelerómetro + giróscopo) para controlar la cámara del juego. Cuando inclinas tu dispositivo, la cámara se mueve en la dirección correspondiente.</p><p><strong>La ventaja real:</strong> Tu dedo hace los movimientos GRANDES (girar 90°, cambiar de objetivo). El giroscopio hace los ajustes FINOS (mantener el crosshair en la cabeza, compensar retroceso). Es como tener un segundo dedo controlando la mira.</p><p>En un combate a quemarropa donde ambos jugadores se ven al mismo tiempo, el que usa giroscopio tiene ventaja porque puede hacer micro-correcciones más rápido. El dedo necesita levantarse y reposicionarse; el giroscopio es continuo — inclinas y listo.</p><p><strong>Datos de la Pro League:</strong> El 85% de los jugadores profesionales de Free Fire en LATAM usan giroscopio. El headshot rate promedio de jugadores con giroscopio es 15-20% más alto que sin él.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Configuración Inicial del Giroscopio',
        content: '<p>El giroscopio tiene su propia sección de sensibilidad en Free Fire. Antes de configurarlo, necesitas decidir el modo:</p><p><strong>Scope On (recomendado para principiantes):</strong> El giroscopio solo se activa cuando estás usando scope/mira. Mientras caminas y miras alrededor, solo funciona el dedo. Esto te permite acostumbrarte gradualmente.</p><p><strong>Always On (recomendado para avanzados):</strong> El giroscopio funciona siempre. Tu dedo y el giroscopio trabajan juntos todo el tiempo. Más difícil de aprender pero más poderoso una vez dominado.</p><p><strong>Valores iniciales recomendados (escala 0-200):</strong></p><p>3rd Person: 80-100 | Red Dot: 90-110 | 2x Scope: 85-105 | 4x Scope: 90-110 | AWM: 95-115 | Free Look: 70-90</p><p>Los valores de giroscopio suelen ser MÁS BAJOS que los de dedo porque los movimientos del celular son más amplificados. Empieza bajo y sube gradualmente a lo largo de 1-2 semanas.</p><p><strong>Tip clave:</strong> No uses giroscopio en dispositivos pesados (tablets, celulares de más de 220g) a menos que los apoyes en algo. Sostener un dispositivo pesado con una mano mientras inclinan con la otra causa fatiga rápida y temblores que arruinan la precisión.</p>',
        orderIndex: 1,
        isPremium: true,
      },
      {
        title: 'Plan de Entrenamiento de 14 Días',
        content: '<p>Este plan te lleva de cero a usar giroscopio en ranked en 2 semanas:</p><p><strong>Día 1-3: Familiarización.</strong> Activa giroscopio en "Scope On". Ve a sala de entrenamiento. NO dispares. Solo camina y mira alrededor usando el giroscopio. Apunta a diferentes objetos inclinando el celular. El objetivo es que tu cerebro asocie "inclinar celular = mover cámara" sin pensar.</p><p><strong>Día 4-7: Tracking básico.</strong> En sala de entrenamiento, sigue a un bot en movimiento con tu mira usando SOLO giroscopio (no toques la pantalla para apuntar). Practica seguir su cabeza mientras camina de izquierda a derecha. 15 minutos diarios.</p><p><strong>Día 8-10: Combina dedo + giroscopio.</strong> Ahora usa ambos: el dedo para el movimiento inicial y el giroscopio para mantener la mira en el objetivo. Entra a Clash Squad no rankeado y practica en combates reales.</p><p><strong>Día 11-13: Ajuste fino.</strong> Después de 10 días, tu cerebro ya entiende el giroscopio. Ahora ajusta los valores: si te pasas del objetivo al apuntar, baja. Si no llegas, sube. Haz ajustes de 5 en 5, no de 20 en 20.</p><p><strong>Día 14+: Ranked.</strong> Entra a ranked con giroscopio. Vas a sentirte incómodo los primeros 3-5 partidas. Es normal. NO desactives el giroscopio porque te frustres. Después de 20 partidas, ya no querrás jugar sin él.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PUNTERÍA / AIM (5 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Drag Headshot: La Técnica que Todo Jugador Debe Dominar',
    slug: 'drag-headshot-tecnica-dominar',
    description: 'Aprende la mecánica del drag headshot en Free Fire: timing, posición del dedo, armas ideales y ejercicios de práctica.',
    category: 'AIM',
    content: '<p>El drag headshot es la técnica de puntería más icónica de Free Fire. Consiste en disparar mientras arrastras tu dedo hacia la cabeza del enemigo, usando el aim assist del juego para "enganchar" el headshot. Es lo que separa a los jugadores casuales de los que realmente saben jugar.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Cómo Funciona el Drag Headshot',
        content: '<p>El drag headshot aprovecha dos mecánicas del juego:</p><p><strong>1. Aim Assist:</strong> Free Fire tiene un aim assist sutil que "pega" tu mira al enemigo cuando estás cerca de apuntarle. El drag headshot usa este assist para enganchar el crosshair al cuerpo y luego arrastra hacia arriba hasta la cabeza.</p><p><strong>2. Fire Rate Timing:</strong> La primera bala de cualquier arma es 100% precisa (cero retroceso). El drag headshot intenta que esa primera bala impacte en la cabeza aprovechando el momento exacto del disparo.</p><p><strong>La mecánica paso a paso:</strong></p><p>1. Pre-apunta al torso del enemigo (es más grande y fácil de apuntar que la cabeza).</p><p>2. Presiona el botón de disparar.</p><p>3. Simultáneamente, arrastra tu dedo de aiming HACIA ARRIBA, moviendo el crosshair del torso a la cabeza.</p><p>4. El aim assist "engancha" tu mira al pasar por la cabeza.</p><p>5. La primera bala (o las primeras 2-3) impactan en la cabeza antes de que el retroceso descontrole la mira.</p><p>Todo esto sucede en menos de 0.3 segundos. Por eso se llama "drag" — estás arrastrando la mira.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Armas Ideales y Configuración',
        content: '<p><strong>Mejores armas para drag headshot:</strong></p><p>MP40: La mejor para drag headshot en close range. La cadencia altísima (83) significa que aun si el primer disparo no es headshot, los siguientes 5-6 que le siguen rápidamente tienen alta probabilidad de conectar con la cabeza durante el drag.</p><p>M4A1: Perfecta para drag headshot a media distancia. Su bajo retroceso te da una ventana más larga para que el drag funcione antes de que la mira se escape.</p><p>AK47: Más difícil pero más letal. El alto daño por bala (61) significa que 1-2 headshots eliminan al enemigo. El retroceso vertical pronunciado del AK en realidad AYUDA al drag porque sube naturalmente hacia la cabeza.</p><p><strong>Configuración de sensibilidad para drag:</strong> Necesitas sensibilidad de punto rojo/scope ligeramente más alta que lo normal para que el drag sea rápido. Si tu sensibilidad general es 150, tu punto rojo podría estar en 170-180 para drag shots efectivos.</p><p><strong>HUD recomendado:</strong> Usa el botón de disparo izquierdo para disparar y el dedo derecho para el drag simultáneo. Algunos jugadores usan 3-4 dedos para separar disparo, movimiento y aim en dedos diferentes.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Ejercicios de Práctica Diarios',
        content: '<p><strong>Ejercicio 1 — Drag estático (5 min):</strong> Ve a sala de entrenamiento. Párate a 10m de un bot estático. Apunta al torso y practica el drag hacia la cabeza sin moverte. Repite 50 veces. Cuenta cuántos headshots logras. Meta: 35+ de 50.</p><p><strong>Ejercicio 2 — Drag en movimiento (5 min):</strong> Activa bots móviles. Ahora haz el drag mientras TÚ te mueves (side step). Esto simula un combate real donde ambos están en movimiento.</p><p><strong>Ejercicio 3 — Drag a diferentes distancias (5 min):</strong> Practica el drag a 5m (close), 15m (mid), y 30m (far). El ángulo del drag cambia con la distancia — a más distancia, el drag es más sutil; a menor distancia, es más pronunciado.</p><p><strong>Progresión semanal:</strong></p><p>Semana 1: Solo bots estáticos. Enfócate en la mecánica pura.</p><p>Semana 2: Bots móviles + tú estático.</p><p>Semana 3: Ambos en movimiento.</p><p>Semana 4: Clash Squad no rankeado contra jugadores reales.</p><p>Después de 4 semanas de práctica diaria (15 min), el drag headshot va a ser automático — tu cerebro lo va a hacer sin que pienses en ello.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'One-Tap Headshot: Cómo Hacerlo Consistentemente',
    slug: 'one-tap-headshot-como-hacerlo-consistentemente',
    description: 'Domina el arte del one-tap headshot con shotgun y sniper: timing, crosshair placement, y mentalidad.',
    category: 'AIM',
    content: '<p>El one-tap headshot es cuando eliminas a un enemigo con un solo disparo a la cabeza. Es la jugada más satisfactoria de Free Fire y la que más tilta a tus enemigos. Con las armas correctas y la técnica adecuada, puedes hacer one-taps de forma consistente.</p>',
    readTimeMin: 8,
    isPremium: true,
    sections: [
      {
        title: 'Armas para One-Tap y sus Rangos',
        content: '<p>No todas las armas pueden hacer one-tap headshot. Necesitas armas con daño suficiente para matar de un headshot aun con casco:</p><p><strong>AWM (90 DMG):</strong> One-tap headshot garantizado contra cualquier casco, incluyendo nivel 3. Es la única arma que lo garantiza siempre. Rango ideal: 50-200m.</p><p><strong>M1887 (100 DMG):</strong> One-tap al torso/cabeza a menos de 5m. El spread de la shotgun hace que no necesites apuntar a la cabeza exactamente — apunta al torso superior y el spread conecta con cabeza + torso.</p><p><strong>Kar98k (90 DMG):</strong> One-tap headshot contra casco nivel 1 y 2. No siempre mata con casco nivel 3 (depende de la durabilidad). Rango ideal: 30-150m.</p><p><strong>Desert Eagle (90 DMG):</strong> One-tap headshot contra casco nivel 1 y la mayoría de nivel 2. Ideal para one-taps rápidos a media distancia como secundaria.</p><p><strong>Woodpecker (85 DMG):</strong> Casi one-tap headshot. Dos disparos rápidos eliminan a cualquiera. La penetración de armadura compensa el daño ligeramente menor.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Crosshair Placement: La Clave del One-Tap',
        content: '<p>El 90% del one-tap headshot no es sobre velocidad de reacción — es sobre DÓNDE está tu mira ANTES de ver al enemigo.</p><p><strong>Crosshair placement</strong> significa mantener tu mira permanentemente a nivel de cabeza mientras caminas, giras esquinas y abres puertas. Si tu mira ya está a nivel de cabeza cuando el enemigo aparece, solo necesitas hacer un micro-ajuste y disparar.</p><p><strong>Cómo practicar:</strong></p><p>1. Camina por el mapa de entrenamiento sin disparar. Solo enfócate en mantener tu mira a la altura exacta donde estaría la cabeza de un enemigo de pie.</p><p>2. Presta atención a las puertas, esquinas y ventanas — tu mira debe apuntar al marco de la puerta a la altura de la cabeza ANTES de abrirla.</p><p>3. En escaleras, ajusta la altura según si el enemigo vendría de arriba o de abajo.</p><p>4. Practica esto durante 10 minutos diarios y en 1 semana va a ser automático.</p><p>Los pros no son más rápidos que tú — simplemente su mira ya está donde necesita estar. Tú tienes que mover la mira 20cm hasta la cabeza; ellos solo tienen que moverla 2cm. Eso es crosshair placement.</p>',
        orderIndex: 1,
        isPremium: true,
      },
      {
        title: 'Quick Scope con AWM: Técnica Paso a Paso',
        content: '<p>El quick scope es la técnica de apuntar con el scope del AWM por una fracción de segundo y disparar inmediatamente. Es la forma más letal de usar el AWM porque minimiza el tiempo que estás parado y vulnerable.</p><p><strong>Mecánica del quick scope:</strong></p><p>1. Pre-apunta en la dirección general del enemigo (sin scope).</p><p>2. Presiona scope + disparo casi simultáneamente. Scope primero por una fracción de segundo.</p><p>3. En el momento que el scope se abre (0.1-0.2s), tu dedo ya está presionando disparar.</p><p>4. Inmediatamente después del disparo, suelta scope y muévete.</p><p>Todo el proceso dura 0.3-0.5 segundos. Un quick scope perfecto se ve como si el scope ni siquiera se hubiera abierto — el enemigo solo ve que moriste.</p><p><strong>Sensibilidad para quick scope:</strong> Tu sensibilidad de scope sniper debe ser MÁS ALTA que lo normal para quick scoping. Si normalmente usas 60 para sniper, sube a 75-85 para quick scopes. Necesitas que la mira se mueva rápido en esa ventana corta.</p><p><strong>Error más común:</strong> No pre-apuntar antes de scopear. Si abres el scope y el enemigo no está ni cerca de tu mira, no vas a poder ajustar a tiempo. El 80% del quick scope es pre-aim correcto.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Recoil Control: Domina el Retroceso de Cada Arma',
    slug: 'recoil-control-domina-retroceso-cada-arma',
    description: 'Patrones de retroceso de las armas más usadas, técnicas de compensación y ejercicios para mejorar tu spray.',
    category: 'AIM',
    content: '<p>Cada arma en Free Fire tiene un patrón de retroceso diferente. Conocer estos patrones y saber compensarlos es la diferencia entre un spray que mata en 0.5 segundos y uno que gasta todo el cargador sin dar una bala. Esta guía documenta los patrones reales y cómo contrarrestarlos.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Patrones de Retroceso por Arma',
        content: '<p>El retroceso en Free Fire tiene dos componentes: <strong>vertical</strong> (la mira sube) y <strong>horizontal</strong> (la mira se desvía a los lados). Cada arma tiene una combinación única:</p><p><strong>M4A1:</strong> Retroceso vertical moderado, casi zero horizontal. La mira sube en línea recta. Compensación: jala suavemente hacia abajo mientras disparas. Es la arma más fácil de controlar.</p><p><strong>AK47:</strong> Retroceso vertical fuerte + horizontal derecho. La mira sube rápido y se desvía a la derecha después de las primeras 8-10 balas. Compensación: jala hacia abajo-izquierda. Requiere práctica pero su alto daño compensa la dificultad.</p><p><strong>SCAR:</strong> Retroceso vertical bajo, horizontal mínimo. La mira apenas se mueve. Compensación: casi no necesita. Es la AR "beginner-friendly".</p><p><strong>MP40:</strong> Retroceso moderado pero la cadencia hace que se acumule rápido. En close range no importa porque el spread es aceptable, pero a media distancia necesitas compensar jalando hacia abajo.</p><p><strong>Parafal:</strong> Retroceso vertical medio-alto pero la cadencia lenta (48) te da tiempo entre disparos para re-centrar. Cada bala tiene más "kick" pero hay más tiempo para compensar.</p><p><strong>UMP:</strong> Retroceso bajo-medio. Patrón predecible con leve desviación izquierda. Buena para aprender spray control.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Técnicas de Compensación',
        content: '<p><strong>Pull-Down (Jalar hacia abajo):</strong> La técnica más básica. Mientras disparas, jala tu dedo de aim suavemente hacia abajo para contrarrestar la subida natural de la mira. La velocidad del pull-down debe coincidir con la velocidad del retroceso del arma.</p><p><strong>Burst Fire (Ráfagas):</strong> Dispara 4-5 balas, suelta, vuelve a disparar. Entre cada ráfaga, la mira se re-centra parcialmente. Efectivo a media-larga distancia donde el spray completo es incontrolable.</p><p><strong>Crouch Spray (Spray agachado):</strong> Agacharte reduce el retroceso de todas las armas ~20%. Combina agacharte + pull-down para sprays más estables. Los pros se agachan al inicio de cada combate a media distancia.</p><p><strong>Strafe Spray (Spray en movimiento):</strong> Moverte mientras disparas añade spread pero te hace difícil de dar. En close range, el spread extra es aceptable. En mid range, detente o agáchate para máxima precisión.</p><p><strong>Tapeo (Tap Fire):</strong> Disparar un tiro a la vez. La primera bala siempre va exactamente donde apuntas. Efectivo con armas de alto daño como AK47 a larga distancia.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Ejercicios de Spray Control',
        content: '<p><strong>Ejercicio 1 — La pared:</strong> Ve a sala de entrenamiento. Párate a 30m de una pared. Vacía un cargador completo en la pared SIN compensar. Observa el patrón. Ahora vacía otro cargador COMPENSANDO. Compara ambos patrones. Repite hasta que el patrón compensado sea un punto concentrado.</p><p><strong>Ejercicio 2 — 30 balas, 1 punto:</strong> Con un M4A1, intenta vaciar 30 balas en un solo punto de la pared a 20m. Debes compensar el retroceso perfectamente para que todas las balas caigan en un área del tamaño de un puño.</p><p><strong>Ejercicio 3 — Transfer spray:</strong> Colócate entre dos bots. Empieza disparando al primero, luego transfiere tu spray al segundo sin soltar el gatillo. Esto practica el control de retroceso durante cambios de objetivo.</p><p><strong>Rutina diaria (10 min):</strong></p><p>3 min: Spray a pared con M4A1 a 30m</p><p>3 min: Spray a pared con AK47 a 30m</p><p>2 min: Spray a bots móviles a 15m</p><p>2 min: Transfer spray entre 2 bots</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Pre-aim y Crosshair Placement: Técnicas de los Pros',
    slug: 'pre-aim-crosshair-placement-tecnicas-pros',
    description: 'La técnica que más impacto tiene en tu headshot rate: dónde debes apuntar ANTES de ver al enemigo.',
    category: 'AIM',
    content: '<p>Pre-aim y crosshair placement son la misma idea: mantener tu mira en la posición correcta ANTES de que aparezca el enemigo. Es la técnica más importante en cualquier shooter y la que más mejora tu headshot rate con el menor esfuerzo.</p>',
    readTimeMin: 7,
    isPremium: true,
    sections: [
      {
        title: 'Los 3 Principios del Pre-Aim',
        content: '<p><strong>1. Altura de cabeza:</strong> Tu mira debe estar SIEMPRE a la altura de la cabeza de un personaje de pie. No al suelo, no al pecho, no al aire — a la cabeza. Cuando caminas por el mapa, tu mira debe estar a esa altura constante. Si un enemigo aparece y tu mira ya está a nivel de cabeza, solo necesitas un micro-ajuste horizontal.</p><p><strong>2. Ángulos comunes:</strong> Los enemigos salen de los mismos lugares: puertas, esquinas, detrás de gloo walls, arriba de edificios. Tu mira debe pre-apuntar a estos ángulos comunes. Cuando giras una esquina, tu mira ya debe estar apuntando a donde el enemigo probablemente está.</p><p><strong>3. Distancia al borde:</strong> No apuntes pegado a la pared/esquina. Mantén un espacio de 10-20cm (en pantalla) entre tu mira y el borde. Si apuntas pegado al borde y el enemigo sale corriendo, tu mira va a quedar detrás de él. El espacio te da tiempo de reacción.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Mapeo de Ángulos por Mapa',
        content: '<p>Cada mapa de Free Fire tiene spots predecibles donde los enemigos se posicionan. Aquí los ángulos clave de los mapas principales:</p><p><strong>Bermuda — Clock Tower:</strong> Pre-apunta al segundo piso (ventanas) cuando te acercas. Los campers se sientan ahí el 80% del tiempo. Apunta a la ventana izquierda primero — es la más usada.</p><p><strong>Bermuda — Pochinok:</strong> Los edificios de dos pisos son los más contestados. Pre-apunta a las escaleras internas cuando entras — el enemigo te espera arriba.</p><p><strong>Kalahari — Stone Ridge:</strong> Las rocas altas son posiciones de sniper clásicas. Pre-apunta al borde superior de las rocas cuando las rodeas.</p><p><strong>Purgatory — Graveyard:</strong> Las lápidas son cobertura perfecta. Pre-apunta a la altura de cabeza sobre las lápidas (no detrás, SOBRE).</p><p>El principio es simple: donde TÚ te esconderías es donde EL ENEMIGO se va a esconder. Pre-apunta a esos spots.</p>',
        orderIndex: 1,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Quick Scope con AWM: Guía Paso a Paso',
    slug: 'quick-scope-awm-guia-paso-a-paso',
    description: 'Domina el quick scope: timing exacto, sensibilidad recomendada, posicionamiento y combos con SMG.',
    category: 'AIM',
    content: '<p>El quick scope con AWM es la jugada más letal de Free Fire. Un quick scope bien ejecutado elimina al enemigo antes de que pueda reaccionar — abre scope, dispara, cierra scope, todo en menos de medio segundo. Esta guía te enseña la mecánica exacta.</p>',
    readTimeMin: 8,
    isPremium: true,
    sections: [
      {
        title: 'Mecánica del Quick Scope',
        content: '<p>El quick scope tiene 4 fases que ocurren en 0.3-0.5 segundos:</p><p><strong>Fase 1 — Pre-aim (antes del scope):</strong> Centra tu cámara en la dirección general del enemigo. No necesitas que sea perfecto — solo que el enemigo esté en el 30% central de tu pantalla.</p><p><strong>Fase 2 — Open scope (0.1s):</strong> Presiona el botón de scope. El AWM tiene un tiempo de apertura de scope de ~0.15 segundos. Durante este tiempo, ajusta tu mira hacia el enemigo si no estaba centrado.</p><p><strong>Fase 3 — Disparo (0.05s):</strong> En el INSTANTE que el scope se abre completamente, dispara. No esperes a "estabilizar" la mira — eso es para camping, no para quick scoping.</p><p><strong>Fase 4 — Cancel (0.1s):</strong> Inmediatamente después del disparo, cierra scope y muévete. No te quedes parado mirando si dio. Un buen quick scoper ya está corriendo antes de que la bala llegue.</p><p><strong>Input timing:</strong> Scope → (0.1s delay) → Disparo → (inmediato) → Cerrar scope → Moverse. Practica el timing hasta que sea una sola acción fluida, no 4 pasos separados.</p>',
        orderIndex: 0,
        isPremium: true,
      },
      {
        title: 'Sensibilidad y Setup para Quick Scope',
        content: '<p><strong>Sensibilidad de scope sniper para quick scope:</strong> Necesitas que sea 15-25% MÁS ALTA que para camping/hard scoping. Si normalmente usas 100 para sniper, sube a 115-125 para quick scope. La razón: en el breve momento que el scope está abierto, necesitas que el menor movimiento del dedo mueva la mira suficiente para ajustar al objetivo.</p><p><strong>HUD recomendado:</strong> Usa el layout de 3-4 dedos. Dedo izquierdo: movimiento + scope button. Pulgar derecho: aim + fire button. Índice derecho (opcional): fire button dedicado. Tener scope y fire en manos diferentes permite la simultaneidad que necesitas.</p><p><strong>Scope button position:</strong> Coloca el botón de scope cerca del borde izquierdo de la pantalla, accesible con el dedo izquierdo sin dejar de mover. La transición scope→fire debe ser instantánea.</p><p><strong>Arma secundaria:</strong> SIEMPRE lleva una SMG (MP40, MAC10, MP5) como secundaria. Después del quick scope, si no mataste, necesitas cambiar a SMG inmediatamente para el follow-up. El AWM tiene bolt-action — no puedes disparar otra vez por 1.5 segundos.</p>',
        orderIndex: 1,
        isPremium: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // MOVIMIENTO (4 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Jiggle Peek: Esquiva Balas Como un Pro',
    slug: 'jiggle-peek-esquiva-balas-como-pro',
    description: 'Domina el jiggle peek: cómo asomarte, disparar y cubrirte en un solo movimiento fluido.',
    category: 'MOVEMENT',
    content: '<p>El jiggle peek es la técnica de movimiento más importante para combates en edificios y detrás de cobertura. Consiste en asomarte rápidamente desde detrás de una pared o gloo wall, disparar 2-3 balas, y volver a cubrirte antes de que el enemigo pueda reaccionar. Dominarlo te hace casi imposible de eliminar en combates posicionales.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      {
        title: 'Mecánica del Jiggle Peek',
        content: '<p>El jiggle peek tiene 3 fases que se repiten en loop:</p><p><strong>1. Peek (asomarte):</strong> Desde detrás de cobertura, mueve tu joystick hacia el lado del enemigo para asomarte. Solo necesitas que tu cuerpo se asome lo suficiente para que puedas disparar — no te expongas completamente. Idealmente, solo tu brazo y cabeza deben ser visibles.</p><p><strong>2. Shoot (disparar):</strong> En el instante que te asomas, dispara 2-3 balas. No esperes a tener un aim perfecto — dispara mientras te asomas. La combinación de tu movimiento + disparos hace que el enemigo tenga que rastrear un blanco en movimiento.</p><p><strong>3. Cover (cubrirte):</strong> Inmediatamente después de disparar, mueve el joystick de vuelta para volver detrás de la cobertura. El tiempo total expuesto debe ser 0.3-0.5 segundos — menos de lo que tarda el enemigo en reaccionar y ajustar su aim.</p><p><strong>El loop:</strong> Peek → Shoot → Cover → Peek → Shoot → Cover. Repite hasta que el enemigo muera o se retire. Cada peek le quita 20-30% de HP si conectas. En 3-4 peeks, el enemigo está eliminado sin que haya podido darte un solo disparo.</p><p><strong>Variación — Double jiggle:</strong> Asómate dos veces rápido sin disparar (fintando) y dispara en la tercera. El enemigo espera tu patrón de peek-shoot y cuando cambias el timing, queda expuesto.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Cuándo Usar y Cuándo No',
        content: '<p><strong>Usa jiggle peek cuando:</strong></p><p>• Estás detrás de una pared o edificio con un enemigo al otro lado</p><p>• El enemigo está en una posición fija (camping, detrás de gloo wall)</p><p>• Estás en desventaja numérica (1v2, 1v3) y necesitas eliminar uno a uno</p><p>• Tu vida está baja y no puedes permitirte un combate directo</p><p>• Estás esperando a que tu habilidad/medkit cargue</p><p><strong>NO uses jiggle peek cuando:</strong></p><p>• El enemigo tiene una shotgun (un disparo a tu peek te mata)</p><p>• Estás en campo abierto sin cobertura real</p><p>• El enemigo está a menos de 3 metros (es mejor rush directo)</p><p>• Tienes ventaja numérica (3v1 — mejor rush coordinado)</p><p><strong>Interacción con gloo walls:</strong> La combinación más poderosa es jiggle peek con tu propia gloo wall. Coloca una gloo wall y haz peek por los lados. El enemigo tiene que decidir si disparar a la gloo wall o esperar tu peek — y mientras decide, tú lo estás eliminando.</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },
  {
    title: 'Drop Shot y Jump Shot: Cuándo Usar Cada Uno',
    slug: 'drop-shot-jump-shot-cuando-usar-cada-uno',
    description: 'Las dos técnicas de evasión más usadas en combate cercano: cuándo agacharte y cuándo saltar.',
    category: 'MOVEMENT',
    content: '<p>Drop shot (agacharte mientras disparas) y jump shot (saltar mientras disparas) son las dos técnicas de evasión más básicas y más efectivas de Free Fire. Pero usarlas en el momento equivocado puede costarte la vida. Esta guía te enseña cuándo usar cada una.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      {
        title: 'Drop Shot: Tu Mejor Herramienta en Mid Range',
        content: '<p>El drop shot consiste en presionar el botón de agacharte mientras estás disparando. Tu hitbox baja instantáneamente, esquivando las balas del enemigo que apuntaba a tu torso/cabeza.</p><p><strong>Ventajas:</strong></p><p>• Reduces tu hitbox un 30% instantáneamente</p><p>• Reduce el retroceso de tu arma ~20%</p><p>• Tu aim se estabiliza al agacharte</p><p>• El enemigo tiene que re-ajustar su aim hacia abajo</p><p><strong>Cuándo usarlo:</strong> Media distancia (10-30m). Es la zona donde ambos jugadores tienen tiempo de apuntar y disparar — agacharte te da la ventaja de ser un blanco más pequeño y más preciso.</p><p><strong>Cómo ejecutar:</strong> Presiona agacharte AL MISMO TIEMPO que empiezas a disparar, no antes ni después. Si te agachas antes de disparar, el enemigo ve tu movimiento y ajusta. Si te agachas después, ya recibiste daño innecesario.</p><p><strong>Error común:</strong> Quedarte agachado después de la pelea. Un enemigo agachado es más lento y un blanco más fácil para un segundo enemigo. Levántate y muévete después de cada combate.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Jump Shot: Para Close Range y Escape',
        content: '<p>El jump shot consiste en saltar mientras disparas. Tu personaje salta y la mira tiene más spread, pero eres mucho más difícil de dar.</p><p><strong>Cuándo usarlo:</strong></p><p>• Combate cercano (<5m) con shotgun — el spread de la shotgun compensa la pérdida de precisión</p><p>• Para escapar de una situación desfavorable — saltas detrás de cobertura mientras disparas para disuadir al enemigo</p><p>• Para ganar altura sobre gloo walls — saltas y disparas al enemigo detrás de la pared</p><p><strong>Cuándo NO usarlo:</strong></p><p>• A media-larga distancia con AR — la pérdida de precisión hace que no pegues nada</p><p>• Contra más de un enemigo — eres predecible en el aire (caes en el mismo lugar)</p><p>• Repetidamente en el mismo spot — el enemigo predice tu landing</p><p><strong>Side step vs jump:</strong> A distancia cercana, el side step (moverte lateralmente) es generalmente mejor que saltar. Saltar te hace predecible (trayectoria parabólica fija), pero el side step es impredecible (puedes cambiar dirección al instante). Usa jump solo cuando necesitas ganar altura o escapar sobre un obstáculo.</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },
  {
    title: 'Side Step y Crouch Spam: Movimiento Evasivo',
    slug: 'side-step-crouch-spam-movimiento-evasivo',
    description: 'Técnicas avanzadas de movimiento para hacerte imposible de dar en combates 1v1.',
    category: 'MOVEMENT',
    content: '<p>El side step y el crouch spam son técnicas de movimiento avanzadas que convierten combates que normalmente perderías en victorias. La idea es simple: un blanco que se mueve de forma impredecible es casi imposible de dar. Pero ejecutar estos movimientos mientras mantienes tu aim preciso requiere práctica.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      {
        title: 'Side Step: ADAD Movement',
        content: '<p>El side step (o ADAD en PC, o L-R en mobile) consiste en moverte rápidamente de izquierda a derecha mientras disparas. En Free Fire mobile, esto se logra moviendo tu joystick izquierdo rápidamente de un lado a otro.</p><p><strong>La mecánica:</strong> Mueve el joystick LEFT → RIGHT → LEFT → RIGHT en intervalos de 0.3-0.5 segundos. Tu personaje se mueve en zigzag, haciendo que el crosshair del enemigo no pueda seguirte. Mientras tanto, TÚ mantienes tu aim fijo en el enemigo con tu dedo derecho.</p><p><strong>La dificultad:</strong> Mover tu cuerpo de forma impredecible mientras mantienes el aim estable. Es como patear una pelota mientras caminas — requiere que tu cerebro procese dos inputs simultáneos. Practica con HUD de 3-4 dedos para separar movimiento de aim.</p><p><strong>Ritmo variable:</strong> No hagas side step a ritmo constante (LEFT-RIGHT-LEFT-RIGHT a la misma velocidad). Varía el timing: LEFT (rápido) → RIGHT (mantén 0.5s) → LEFT (rápido) → RIGHT (rápido). La variabilidad hace que sea imposible predecir tu posición.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Crouch Spam: La Técnica Anti-Headshot',
        content: '<p>El crouch spam es subir y bajar repetidamente (agacharte y levantarte) durante un combate. Tu cabeza sube y baja constantemente, haciendo casi imposible que el enemigo conecte headshots.</p><p><strong>Cuándo usarlo:</strong> En combates a media distancia (15-30m) donde ambos jugadores están parados y disparando. Es especialmente efectivo contra jugadores que dependen de headshots (drag shooters).</p><p><strong>Cómo ejecutar:</strong> Presiona crouch rápidamente 2-3 veces por segundo mientras disparas. Tu personaje parece "temblar" de pie a agachado repetidamente. El enemigo que intenta apuntar a tu cabeza ve que su crosshair pasa arriba y abajo de tu cabeza sin poder fijarse.</p><p><strong>Combo: Side step + Crouch spam:</strong> La combinación definitiva. Te mueves de izquierda a derecha MIENTRAS subes y bajas. Tu hitbox se mueve en 3 dimensiones (X + Y + Z). Es la técnica de evasión más difícil de contrarrestar en todo Free Fire.</p><p><strong>Limitación:</strong> El crouch spam reduce tu velocidad de movimiento y tu propia precisión. No lo uses en close range (mejor rush directo) ni a larga distancia (el movimiento no es significativo a esa distancia).</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },
  {
    title: 'Gloo Wall Tricks: 10 Técnicas Avanzadas',
    slug: 'gloo-wall-tricks-10-tecnicas-avanzadas',
    description: 'Las 10 técnicas más efectivas con gloo wall: one-tap wall, 360 protection, ramp rush, peek tricks y más.',
    category: 'MOVEMENT',
    content: '<p>La gloo wall es la mecánica más única de Free Fire y la que más diferencia a este juego de otros battle royales. Dominar las gloo walls te pone en un nivel completamente diferente. Estas son las 10 técnicas que usan los jugadores profesionales.</p>',
    readTimeMin: 10,
    isPremium: true,
    sections: [
      {
        title: 'Técnicas 1-5: Fundamentales',
        content: '<p><strong>1. One-Tap Gloo Wall:</strong> Coloca una gloo wall con un solo toque instantáneo. Cambia a gloo wall, mira al suelo frente a ti y coloca en menos de 0.3 segundos. Debe ser automático — cuando recibes daño, tu reacción inmediata es one-tap gloo wall.</p><p><strong>2. 360 Protection:</strong> Gira 360° mientras colocas 4 gloo walls para crear un fuerte instantáneo. Protección de todos los ángulos. Practica girando y colocando una pared cada 90°. Tiempo objetivo: 2 segundos para las 4 paredes.</p><p><strong>3. Ramp Rush:</strong> Coloca una gloo wall inclinada (apuntando ligeramente hacia arriba) y salta encima. Te da ventaja de altura sobre el enemigo. Desde arriba, dispara al enemigo que solo ve la parte superior de la gloo wall.</p><p><strong>4. Peek Right:</strong> En Free Fire, tu cámara está ligeramente a la derecha del personaje. Esto significa que hacer peek por el LADO DERECHO de una gloo wall te da ventaja — ves más del enemigo de lo que él ve de ti. Siempre posiciónate para hacer peek por la derecha.</p><p><strong>5. Shield Swap:</strong> Cuando tu gloo wall está a punto de romperse, coloca una nueva DETRÁS de la vieja. Cuando la vieja se rompe, ya tienes la nueva lista. El enemigo piensa que te quedaste sin protección pero en realidad tienes una nueva pared fresca.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Técnicas 6-10: Avanzadas',
        content: '<p><strong>6. Jump Gloo:</strong> Salta y coloca la gloo wall en el aire. La pared aparece más alta que una colocación normal. Útil contra enemigos en posición elevada — la pared extra alta te cubre mejor.</p><p><strong>7. Double Layer:</strong> Coloca dos gloo walls una detrás de otra. El enemigo tiene que romper DOS paredes para llegar a ti. Ganas el doble de tiempo para curarte, recargar o reposicionar.</p><p><strong>8. Bait Wall:</strong> Coloca una gloo wall como señuelo en una dirección y flanquea por otra. El enemigo apunta a la gloo wall esperando que hagas peek, pero tú ya rodeaste por el otro lado.</p><p><strong>9. Shotgun + Gloo Combo:</strong> Dispara shotgun → coloca gloo wall instantáneamente → espera 0.5s → peek por el lado y dispara otra vez. El ciclo shotgun-gloo-peek es devastador en combate cercano porque la gloo wall te protege durante la recarga de la shotgun.</p><p><strong>10. Gloo Stair:</strong> Coloca 2-3 gloo walls inclinadas una encima de otra para crear una "escalera" improvisada. Te permite subir a techos, rocas altas o posiciones que normalmente serían inaccesibles. Requiere mucha práctica para el ángulo correcto.</p><p><strong>Tip pro:</strong> Siempre carga al menos 5 gloo walls. En endgame, las gloo walls son más valiosas que las medkits. Una gloo wall te salva la vida; una medkit te compra 3 segundos.</p>',
        orderIndex: 1,
        isPremium: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ESTRATEGIA (3 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Rotaciones en Battle Royale: Cuándo y Dónde Moverse',
    slug: 'rotaciones-battle-royale-cuando-donde-moverse',
    description: 'El 70% de las partidas se pierden por mala rotación. Aprende a leer la zona, elegir rutas seguras y llegar primero a buenas posiciones.',
    category: 'STRATEGY',
    content: '<p>La rotación — el arte de moverse por el mapa en el momento correcto y hacia el lugar correcto — es la habilidad más subestimada de Free Fire. Puedes tener el mejor aim del mundo, pero si rotas tarde o a un mal lugar, vas a morir sin disparar una bala.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Lectura de Zona y Timing',
        content: '<p>La zona en Free Fire se cierra en intervalos predecibles. Tu rotación debe sincronizarse con estos intervalos:</p><p><strong>Zona 1-2 (amplia):</strong> No necesitas rotar urgentemente. Lootea tranquilo. Solo muévete si estás en el borde extremo.</p><p><strong>Zona 3 (media):</strong> Empieza a posicionarte. Identifica dónde estará la siguiente zona (no el centro actual — imagina dónde se cerrará la SIGUIENTE). Muévete temprano cuando se anuncia, no cuando empieza a cerrar.</p><p><strong>Zona 4-5 (pequeña):</strong> Cada rotación es crítica. Un error aquí = muerte. Planifica tu ruta ANTES de que la zona empiece a cerrarse. Identifica cobertura en tu ruta.</p><p><strong>Zona final (tiny):</strong> Ya no rotas — te posicionas. Busca la mejor cobertura disponible (edificio, roca, elevación) y quédate. En esta zona, el que se mueve primero pierde.</p><p><strong>Regla de oro:</strong> Rota cuando la zona se ANUNCIA, no cuando empieza a CERRAR. Si esperas a que la zona empiece a moverse, ya llegaste tarde — otros jugadores ya ocuparon las mejores posiciones.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Rutas Seguras y Posicionamiento',
        content: '<p><strong>Principio del borde:</strong> Nunca corras por el centro del mapa. El centro te expone a enemigos de TODAS las direcciones (360° de peligro). Corre por el borde de la zona — así solo tienes enemigos de un lado (180° o menos de peligro).</p><p><strong>Cobertura natural:</strong> Planifica tu ruta pasando de cobertura en cobertura: roca → árbol → pared → edificio. Nunca cruces campo abierto si hay alternativa con cobertura. Si TIENES que cruzar campo abierto, hazlo en zigzag usando free look para vigilar.</p><p><strong>Vehículos:</strong> Los vehículos son buenos para rotaciones largas (zona 2-3) pero terribles para rotaciones cortas (zona 4+). El ruido del motor avisa a todos dónde estás. Usa vehículos para llegar rápido y abandónalos 100m antes de tu destino.</p><p><strong>Elevación:</strong> Siempre prioriza posiciones altas. En Free Fire, el que tiene la altura tiene la ventaja. Puedes ver más, disparar por encima de gloo walls, y los enemigos tienen que apuntar hacia arriba (más difícil).</p><p><strong>Agua:</strong> Nunca, NUNCA te metas al agua. Nadar te hace lento, no puedes disparar, y eres el blanco más fácil del juego. Rodea cualquier cuerpo de agua, sin importar cuánto tiempo extra tome.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Rotación con Equipo',
        content: '<p>Rotar en squad es completamente diferente a rotar solo:</p><p><strong>Formación de rotación:</strong> Nunca roten los 4 en fila. El IGL va primero (decidiendo la ruta), el fragger va segundo (listo para responder a contacto), los supports van atrás. Mantengan 10-15m de distancia entre cada uno — lo suficientemente cerca para ayudarse pero lo suficientemente lejos para que una sola granada no los elimine a todos.</p><p><strong>Scout antes de rotar:</strong> Antes de mover al equipo, envía al IGL o al fragger a verificar que la ruta está limpia. Los otros 3 cubren desde posición segura. Solo cuando el scout confirma "limpio", el resto se mueve.</p><p><strong>Smoke rotations:</strong> Si tienen granadas de humo, úsenlas para cruzar espacios abiertos. Un humo bien colocado te da 10 segundos de cobertura visual. Tiren el humo ANTES de moverse, no mientras están corriendo.</p><p><strong>Si hacen contacto durante la rotación:</strong> NO se detengan a pelear a menos que tengan ventaja clara. Coloquen gloo walls y continúen hacia la zona. Un equipo eliminando a otro mientras la zona se cierra sobre ellos pierde más de lo que gana.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Juego de Equipo en Clash Squad: Roles y Comunicación',
    slug: 'juego-equipo-clash-squad-roles-comunicacion',
    description: 'Domina Clash Squad con roles definidos, callouts efectivos y estrategias por ronda.',
    category: 'STRATEGY',
    content: '<p>Clash Squad es el modo competitivo por excelencia de Free Fire. Rounds cortos, 4v4, compra de armas — es donde se prueba tu habilidad real. Pero ganar consistentemente requiere más que buen aim: necesitas coordinación, roles y comunicación.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Los 4 Roles del Squad',
        content: '<p>Cada equipo competitivo tiene 4 roles definidos:</p><p><strong>IGL (In-Game Leader):</strong> Toma TODAS las decisiones tácticas. "Vamos izquierda", "Defendemos aquí", "Push ahora". Solo UNA persona es IGL — tener dos líderes causa confusión y decisiones contradictorias. El IGL no necesita ser el mejor jugador, pero debe ser el más calmado y con mejor lectura del juego.</p><p><strong>Entry Fragger:</strong> El primero en entrar a cada combate. Tiene el mejor aim del equipo y las reacciones más rápidas. Su trabajo: hacer el primer kill o al menos dar información de dónde están los enemigos. Usa SMG o shotgun como primaria.</p><p><strong>Support/Trader:</strong> Sigue al entry fragger a 5-10m de distancia. Si el fragger cae, el support inmediatamente elimina al enemigo que lo mató (trade kill). Si el fragger sobrevive, el support lo cubre y cura. Usa AR como primaria.</p><p><strong>Anchor/Sniper:</strong> Se posiciona en la retaguardia con visión amplia. Cubre las rotaciones del equipo, avisa de flanqueos, y provee soporte a distancia. Usa sniper o marksman como primaria.</p><p><strong>Regla importante:</strong> Los roles NO son fijos por partida — se adaptan por ronda. Si el fragger está teniendo un mal día (missing shots), el support puede tomar su lugar temporalmente.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Comunicación y Callouts',
        content: '<p>La comunicación efectiva gana rondas. Aquí el sistema de callouts que usan los equipos competitivos:</p><p><strong>Estructura de callout:</strong> [Cantidad] + [Dirección] + [Distancia] + [Cobertura]</p><p>Ejemplos:</p><p>"Uno norte, 30m, detrás de gloo" ✅</p><p>"Dos oeste, 50m, en el edificio segundo piso" ✅</p><p>"¡Ahí está, ahí está!" ❌ (No da información útil)</p><p>"Están a la derecha" ❌ (¿Tu derecha o la mía?)</p><p><strong>Direcciones:</strong> Usa Norte/Sur/Este/Oeste o la brújula del minimapa. NUNCA uses "derecha/izquierda" porque depende de hacia dónde esté mirando cada uno.</p><p><strong>Información de HP:</strong> Cuando dañas a un enemigo, reporta cuánto. "Uno norte, bajo" (menos de 30% HP) o "Uno norte, medio" (30-60% HP). Esto ayuda a tu equipo a decidir si push o esperar.</p><p><strong>Calls de acción:</strong> Solo el IGL hace calls de acción ("Push ahora", "Retírense", "Heal primero"). Los demás solo dan INFORMACIÓN. Si todos gritan "push" al mismo tiempo, nadie lidera.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Economía y Compras por Ronda',
        content: '<p>La economía en Clash Squad es crucial. Cada ronda te da dinero para comprar armas y equipo:</p><p><strong>Ronda 1 (eco):</strong> Todos tienen poco dinero. Compra solo una SMG o AR básica. NO compres gloo walls ni medkits en ronda 1 — guarda el dinero.</p><p><strong>Ronda 2:</strong> Si ganaste ronda 1, compra tu arma principal + gloo walls. Si perdiste, haz "eco" (compra mínimo) para tener dinero en ronda 3.</p><p><strong>Rondas 3-5 (fuerza):</strong> Aquí es donde gastas. Tu combo ideal + gloo walls + medkits. El equipo debe comprar de forma coordinada — no sirve que uno tenga AWM y otro tenga pistola.</p><p><strong>Ronda de match point:</strong> Gasta TODO. No tiene sentido guardar dinero si el siguiente round es el último. Compra la mejor arma disponible + máximo equipo.</p><p><strong>Compras coordinadas:</strong> Si un jugador tiene mucho dinero y otro poco, el rico puede comprar un arma y tirársela al pobre. La coordinación económica del equipo es más importante que la compra individual.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'End Game: Cómo Ganar los Últimos Círculos',
    slug: 'end-game-como-ganar-ultimos-circulos',
    description: 'Estrategias para el end game de Battle Royale: posicionamiento, timing de combate y toma de decisiones bajo presión.',
    category: 'STRATEGY',
    content: '<p>El end game (últimos 3-5 minutos de una partida de Battle Royale) es donde se decide todo. Puedes haber looteado 10 minutos y tener 5 kills, pero si no sabes jugar los últimos círculos, todo eso no sirve de nada. Esta guía cubre las estrategias que te llevan del top 10 al #1.</p>',
    readTimeMin: 8,
    isPremium: true,
    sections: [
      {
        title: 'Posicionamiento en Zonas Pequeñas',
        content: '<p>Cuando quedan menos de 10 jugadores y la zona es pequeña, las reglas del juego cambian:</p><p><strong>Prioridad #1: Cobertura.</strong> Busca la mejor cobertura disponible dentro de la zona: edificio > roca grande > gloo wall > árbol. Un jugador detrás de buena cobertura gana contra uno sin cobertura el 90% de las veces, sin importar la diferencia de aim.</p><p><strong>Prioridad #2: Altura.</strong> El punto más alto dentro de la zona es la mejor posición. Desde arriba ves a todos, disparas por encima de gloo walls, y los enemigos tienen que exponer su cabeza para mirarte. Si hay un edificio de 2+ pisos en la zona, llega primero.</p><p><strong>Prioridad #3: Zona edge.</strong> Posiciónate en el borde de la zona, no en el centro. En el borde solo tienes enemigos de un lado (el interior). En el centro estás rodeado. Muévete con la zona manteniendo tu espalda contra el borde.</p><p><strong>NO hagas:</strong> No te pares en campo abierto "para tener visión". La visión no sirve si no tienes cobertura — te eliminan antes de poder reaccionar a lo que ves.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Timing de Combate y Third Party',
        content: '<p><strong>La regla de oro del end game:</strong> NO inicies combates innecesarios. Cada disparo revela tu posición a TODOS los jugadores restantes. El jugador que inicia el combate en end game suele morir — no por el enemigo que atacó, sino por el TERCERO que escuchó los disparos y atacó mientras ambos estaban distraídos.</p><p><strong>Third party (tercerear):</strong> Espera a que dos equipos/jugadores empiecen a pelear. Mientras se eliminan mutuamente, tú te posicionas. Cuando uno gane (con poca vida), tú atacas al ganador debilitado. Es la estrategia más efectiva en end game.</p><p><strong>Cuándo SÍ atacar:</strong></p><p>• El enemigo no sabe que estás ahí (ventaja de información)</p><p>• Tienes AWM y puedes one-tap sin revelar tu posición por mucho tiempo</p><p>• La zona va a forzarte a mover y el enemigo está en tu ruta</p><p>• Solo quedan 2 jugadores (tú y él)</p><p><strong>Cuándo NO atacar:</strong></p><p>• Quedan 3+ jugadores/equipos y no tienes posición segura post-combate</p><p>• El enemigo tiene mejor posición (altura, cobertura superior)</p><p>• Tu equipo no está junto (si atacas solo mientras tu equipo está disperso, pierdes)</p>',
        orderIndex: 1,
        isPremium: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // DISPOSITIVO (3 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Configuración Gráfica Óptima por Dispositivo',
    slug: 'configuracion-grafica-optima-por-dispositivo',
    description: 'Ajusta gráficos, FPS y resolución para maximizar el rendimiento de Free Fire en cualquier celular.',
    category: 'DEVICE',
    content: '<p>La configuración gráfica de Free Fire puede significar la diferencia entre 30 FPS con stuttering y 60 FPS estables. Cada opción gráfica tiene un impacto diferente en el rendimiento, y no todas necesitan estar al máximo para jugar bien.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      {
        title: 'Gráficos vs FPS: La Decisión Correcta',
        content: '<p><strong>Regla #1: FPS SIEMPRE sobre gráficos.</strong> Los FPS estables te dan:</p><p>• Sensibilidad consistente (sin "saltos" por frame drops)</p><p>• Input lag menor (tus toques se registran más rápido)</p><p>• Animaciones suaves (ves al enemigo moverse fluido, no "teleportándose")</p><p>Los gráficos bonitos no te dan NADA competitivo. Las sombras lindas y las texturas HD no te ayudan a ganar — de hecho, te perjudican porque consumen recursos que podrían ir a FPS.</p><p><strong>Configuración recomendada para TODOS los dispositivos:</strong></p><p>• Gráficos: Suave (Smooth)</p><p>• FPS: Ultra (si tu celular soporta) o Alto</p><p>• Sombras: OFF</p><p>• Efectos de luz: Bajo</p><p>• Detalle de texturas: Bajo</p><p>Esta configuración maximiza los FPS sin importar tu dispositivo. La diferencia visual es mínima — los personajes y armas se ven bien, solo el entorno tiene menos detalle. Pero tus FPS serán 30-50% más altos.</p><p><strong>Un caso especial:</strong> Si tu dispositivo tiene 120Hz, asegúrate de activar la opción "Ultra" en FPS. Muchos jugadores con celulares de 120Hz juegan a 60 FPS porque no cambiaron esta opción — están desperdiciando la mitad de la capacidad de su pantalla.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Optimizaciones por Gama de Dispositivo',
        content: '<p><strong>Gama baja (2-3GB RAM, Helio G25/Snapdragon 450):</strong></p><p>Gráficos: Suave | FPS: Normal | Resolución: Baja si disponible. Cierra TODAS las apps, usa modo gaming, y reinicia antes de cada sesión. Limita partidas a 3-4 seguidas para evitar thermal throttling.</p><p><strong>Gama media (4-6GB RAM, Snapdragon 680/Dimensity 700):</strong></p><p>Gráficos: Suave | FPS: Alto | Sombras: OFF. Puedes jugar sesiones más largas sin degradación. Activa modo gaming para priorizar recursos.</p><p><strong>Gama alta (8GB+ RAM, Snapdragon 8 Gen 1+/A15+):</strong></p><p>Gráficos: Suave | FPS: Ultra | Puedes activar algunas opciones visuales sin impactar FPS. Pero si quieres máximo rendimiento competitivo, mantén todo en bajo.</p><p><strong>Tip extra:</strong> Si notas que tus FPS bajan durante combates con muchos jugadores y gloo walls, baja la calidad de "Efectos" — los efectos de explosión y gloo wall son los que más GPU consumen.</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },
  {
    title: 'HUD Personalizado: Cómo Importar y Configurar Códigos',
    slug: 'hud-personalizado-importar-configurar-codigos',
    description: 'Aprende a importar códigos HUD de Free Fire, personalizar la distribución de botones y optimizar para tu estilo de juego.',
    category: 'DEVICE',
    content: '<p>El HUD (Heads-Up Display) es la distribución de botones en tu pantalla. Un HUD bien configurado te da acceso rápido a todas las acciones sin quitar los dedos de movimiento y aim. La diferencia entre un HUD default y uno optimizado es enorme.</p>',
    readTimeMin: 7,
    isPremium: false,
    sections: [
      {
        title: 'Tipos de HUD: 2, 3 y 4 Dedos',
        content: '<p><strong>2 Dedos (pulgares):</strong> El setup más básico. Ambos pulgares en la parte inferior de la pantalla. Movimiento izquierdo, aim + disparo derecho. Limitado porque no puedes mover, apuntar y disparar al mismo tiempo. Recomendado solo para principiantes absolutos.</p><p><strong>3 Dedos:</strong> Pulgares + un índice. El índice maneja el botón de disparo (esquina superior derecha/izquierda). Esto libera tu pulgar derecho para SOLO aim, sin necesidad de alcanzar el botón de disparo. Mejora significativa: puedes apuntar y disparar de forma independiente.</p><p><strong>4 Dedos (garra):</strong> Pulgares + ambos índices. Distribución: pulgar izquierdo = movimiento, pulgar derecho = aim, índice izquierdo = scope/gloo wall, índice derecho = disparo. El setup usado por el 90% de los jugadores competitivos. Permite realizar todas las acciones simultáneamente.</p><p><strong>Recomendación:</strong> Si juegas con 2 dedos, cambia a 3 dedos. Si ya usas 3, cambia a 4. Cada transición necesita 1-2 semanas de adaptación pero la mejora es permanente.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Cómo Importar Códigos HUD',
        content: '<p>Free Fire permite compartir configuraciones HUD mediante códigos. Así es como importas uno:</p><p><strong>Paso 1:</strong> Abre Free Fire → Ajustes (engranaje) → Controles → HUD Personalizado.</p><p><strong>Paso 2:</strong> Toca el ícono de importar (flecha hacia abajo o "Import").</p><p><strong>Paso 3:</strong> Pega el código HUD. Estos códigos son cadenas alfanuméricas que codifican la posición y tamaño de cada botón.</p><p><strong>Paso 4:</strong> El HUD se carga. PERO necesitas ajustarlo: cada pantalla tiene diferente tamaño y proporciones. Lo que se ve perfecto en un Samsung S24 puede tener botones superpuestos en un Redmi Note 12.</p><p><strong>Después de importar:</strong></p><p>1. Ve a "Personalizar HUD" y verifica que ningún botón se superponga.</p><p>2. Ajusta el tamaño de los botones: mínimo 70% para touch targets adecuados (dedo debe cubrir el botón cómodamente).</p><p>3. Verifica que alcanzas todos los botones sin estirar los dedos incómodamente.</p><p>4. Juega 2-3 partidas de práctica antes de ir a ranked con el nuevo HUD.</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },
  {
    title: 'Optimizar Free Fire en Dispositivos de Gama Baja',
    slug: 'optimizar-free-fire-dispositivos-gama-baja',
    description: 'Todas las optimizaciones posibles para jugar Free Fire fluido en celulares de 2-4GB RAM.',
    category: 'DEVICE',
    content: '<p>Si tu celular tiene 2-4GB de RAM y un procesador de gama baja, Free Fire puede sentirse laggy y frustrante. Pero con las optimizaciones correctas, puedes mejorar dramáticamente el rendimiento y jugar de forma competitiva. Esta guía cubre TODAS las optimizaciones posibles.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Optimizaciones del Sistema',
        content: '<p><strong>1. Limpieza de RAM antes de jugar:</strong> Cierra todas las apps desde el administrador de tareas. Ve a Ajustes → Apps → Forzar detención de apps que no necesitas (redes sociales, email, navegadores). Reinicia el celular si no lo has hecho en el día.</p><p><strong>2. Desactivar animaciones del sistema:</strong> Ve a Opciones de desarrollador (toca 7 veces el número de compilación en "Acerca del teléfono"). Cambia: Escala de animación de ventana → 0.5x, Escala de animación de transición → 0.5x, Escala de duración del animador → 0.5x. Esto no afecta Free Fire pero hace que el sistema consuma menos recursos.</p><p><strong>3. Modo No Molestar:</strong> Activa modo No Molestar antes de jugar. Las notificaciones consumen CPU y pueden causar micro-lags en el momento menos oportuno.</p><p><strong>4. Desactivar Location Services:</strong> El GPS consume batería y CPU. Desactívalo mientras juegas.</p><p><strong>5. Conexión WiFi vs Datos:</strong> WiFi es preferible por menor latencia. Si usas datos, busca un lugar con buena señal. Una conexión inestable causa rubber-banding (tu personaje "rebota" entre posiciones).</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Optimizaciones de Free Fire',
        content: '<p><strong>Dentro del juego, ajusta todo para rendimiento:</strong></p><p>Gráficos: Suave (obligatorio) | FPS: Normal o Alto | Mapa miniatura: Bajo | Personajes en lobby: OFF | Auto-descarga de recursos: OFF | Calidad de sombras: OFF | Distancia de renderizado: Baja</p><p><strong>Almacenamiento:</strong> Mantén al menos 2GB libres en tu celular. Cuando el almacenamiento está lleno, el sistema usa la memoria del disco como swap, que es mucho más lenta que la RAM.</p><p><strong>Actualizaciones:</strong> Mantén Free Fire actualizado. Las actualizaciones suelen incluir optimizaciones de rendimiento que benefician especialmente a dispositivos de gama baja.</p><p><strong>Cache:</strong> Cada 2-3 semanas, limpia el cache de Free Fire: Ajustes → Apps → Free Fire → Almacenamiento → Borrar cache. NO borres datos (eso borra tu cuenta local). El cache se acumula y puede llegar a 500MB-1GB.</p><p><strong>Temperatura:</strong> El thermal throttling es tu peor enemigo. Cuando el celular se calienta por encima de 45°C, el procesador baja su velocidad automáticamente, causando drops de FPS brutales. Quita la funda, juega con ventilador o aire acondicionado, y toma descansos de 5 minutos cada 3-4 partidas.</p>',
        orderIndex: 1,
        isPremium: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // META ACTUAL (2 guías)
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Mejores Armas del Meta OB50/OB51',
    slug: 'mejores-armas-meta-ob50-ob51',
    description: 'Tier list actualizada con los cambios de OB50 y OB51: qué armas subieron, cuáles bajaron y los mejores combos para ranked.',
    category: 'META',
    content: '<p>Los parches OB50 y OB51 trajeron cambios significativos al balance de armas en Free Fire. Varias armas que antes eran mediocres ahora son viables, y algunas dominantes recibieron nerfs. Esta guía analiza el meta actual post-OB51 con datos reales de los cambios.</p>',
    readTimeMin: 9,
    isPremium: false,
    sections: [
      {
        title: 'Tier S: Las Mejores del Meta Actual',
        content: '<p>Las armas Tier S son las que definen el meta — verás estas armas en casi todas las partidas de ranked y competitivo:</p><p><strong>M4A1 — El Rey Estable:</strong> OB51 buffeó todos sus niveles de upgrade: +5% daño y +10% precisión. Con 53 de daño base, bajo retroceso y buen rango (79), es la AR más consistente. Si solo puedes aprender a usar una AR, que sea esta. Funciona en cualquier distancia con cualquier mira.</p><p><strong>MP40 — Close Range Absoluto:</strong> OB50 añadió nuevos chips que mejoran su rendimiento. Con cadencia de 83 (la más alta del juego, 830 RPM), el MP40 tiene el TTK más bajo en combate cercano. A menos de 10 metros, no hay arma que lo supere. Pierde 40% de daño pasados 10m, así que combínalo con un AR o marksman para distancia.</p><p><strong>AWM — One-Shot King:</strong> Sin cambios en OB50/OB51, pero sigue siendo la única arma que garantiza one-shot headshot contra casco nivel 3. Solo de airdrop, así que no siempre está disponible, pero cuando la tienes, controlas el juego.</p><p><strong>MAC10 — El Armor Breaker:</strong> OB51 mejoró todos sus upgrade paths: +5% daño, +5% precisión, +5% velocidad por nivel. Su cargador de 42 rondas y capacidad de romper armaduras la convierten en la SMG más versátil después del MP40.</p><p><strong>Woodpecker — Media-Larga Penetración:</strong> La marksman rifle con penetración de armadura incorporada. 85 de daño que ignora chalecos. Combinada con MP40, forma el combo más popular del meta: rush con SMG + control con marksman.</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Cambios Clave de OB50 y OB51',
        content: '<p><strong>Armas que SUBIERON:</strong></p><p>• Parafal: De Tier B a Tier A. OB51 le dio +5% armor pen, +3% daño, +5% precisión. Con 69 de daño base (el más alto de las AR), ahora es una opción seria para media distancia.</p><p>• Thompson: De Tier C a Tier B. OB51 la transformó: +3% daño, +5% armor pen, +10% rango, +5% precisión, y ahora soporta scope 2x. La Thompson con scope 2x es una SMG-AR híbrida muy interesante.</p><p>• AN94: OB50 le dio +10% precisión. No subió de tier pero es un pickup más confiable.</p><p>• M60: OB50 añadió slots de boca y culata. Sigue siendo nicho pero tiene más opciones de personalización.</p><p><strong>Armas que BAJARON:</strong></p><p>• M82B: OB50 nerfó -15% de penetración de Gloo Wall. Sigue fuerte pero ya no destruye gloos tan fácil.</p><p>• M1887: OB50 aplicó nerf de rango. Sigue siendo letal en close range pero el rango efectivo se redujo ligeramente.</p><p><strong>Nuevas armas:</strong></p><p>• Winchester (OB51): Marksman rifle de ráfaga de 2 disparos. Alta movilidad y sistema de recarga parcial. Floor loot + vending machine (300 FF coins). Es nueva en el meta y los jugadores todavía están explorando su potencial.</p>',
        orderIndex: 1,
        isPremium: false,
      },
      {
        title: 'Mejores Combos para Ranked',
        content: '<p>Estos son los combos de armas más efectivos en el meta actual basados en el análisis de partidas competitivas:</p><p><strong>Tier S Combos:</strong></p><p>MP40 + Woodpecker: El combo dominante. MP40 para rush cercano, Woodpecker para control a distancia con armor pen. Es lo que usan la mayoría de equipos en Pro League.</p><p>SCAR + M1014: El combo más confiable. SCAR para spray a media distancia (bajo retroceso, consistente), M1014 para cerrar kills en interiores. Perfecto para ranked.</p><p>AWM + MP5/Bizon: Control sniper. AWM para one-tap a distancia, SMG para defensa cercana. Requiere buen aim y posicionamiento.</p><p><strong>Tier A Combos:</strong></p><p>MAC10 + Woodpecker: Variante del combo S con MAC10 que ofrece más munición y armor break.</p><p>M4A1 + M1887: Versátil. M4A1 estable a toda distancia + M1887 one-tap en close. Equilibrio entre seguridad y agresividad.</p><p>AK47 + MP40: Para jugadores con buen control de retroceso. AK tiene el daño más alto de las AR + MP40 cubre close range.</p><p><strong>Combos Emergentes (post-OB51):</strong></p><p>Winchester + Parafal: Dos armas de alto daño por disparo. Winchester ráfagas + Parafal 69 DMG. Para jugadores que prefieren precisión sobre spray.</p><p>Thompson-X + Desert Eagle: Thompson buffeada + pocket sniper. Agresivo y móvil.</p>',
        orderIndex: 2,
        isPremium: true,
      },
    ],
  },
  {
    title: 'Combos de Armas: Las Mejores Parejas para Ranked',
    slug: 'combos-armas-mejores-parejas-ranked',
    description: 'Análisis detallado de los mejores combos de armas por estilo de juego: agresivo, balanceado y sniper.',
    category: 'META',
    content: '<p>Elegir el combo de armas correcto es tan importante como saber usarlas. Un buen combo cubre todas las distancias y situaciones que vas a encontrar en ranked. Esta guía analiza los mejores combos para cada estilo de juego con las armas del meta actual.</p>',
    readTimeMin: 8,
    isPremium: false,
    sections: [
      {
        title: 'Combos Agresivos (Rush/Push)',
        content: '<p>Si tu estilo es agresivo — rushear, buscar combates, pushear cada sonido de disparo — estos combos maximizan tu capacidad de eliminar rápido:</p><p><strong>MP40 + Woodpecker (META #1):</strong> El combo más popular en competitivo actual. MP40 para los combates cercanos (0-10m) donde su TTK de 0.3s no tiene rival. Woodpecker para control y daño a media-larga distancia (20-80m) con penetración de armadura. Cambias entre ambas según la distancia. Es el combo con mayor floor y ceiling — funciona tanto en manos novatas como expertas.</p><p><strong>MAC10 + M1887 (Double Rush):</strong> MAC10 spray con 42 rondas para sostener combates largos + M1887 one-tap cuando estás encima del enemigo. Requiere agresividad constante — no funciona si juegas pasivo.</p><p><strong>MP40 + M4A1 (Classic Rush):</strong> El combo clásico que nunca falla. M4A1 es tu AR segura para cualquier distancia, MP40 para cerrar kills. Si no sabes qué combo elegir, este funciona siempre.</p><p><strong>Personajes ideales para rush:</strong> Alok (heal + speed), Jota (heal on kill con SMG/Shotgun), Skyler (destruir gloo walls enemigas).</p>',
        orderIndex: 0,
        isPremium: false,
      },
      {
        title: 'Combos Balanceados y de Sniper',
        content: '<p><strong>Combos Balanceados:</strong></p><p>SCAR + M1014: El combo "balanceado competitivo" por excelencia. SCAR te da consistencia a media distancia con el retroceso más bajo de las AR. M1014 te da 6 rondas de devastación en interiores. Funciona en cualquier situación sin ser especializado en ninguna.</p><p>M4A1 + M1887: Similar al anterior pero con más potencial de one-tap. M4A1 es más precisa que SCAR a larga distancia pero tiene ligeramente más retroceso. M1887 tiene solo 2 disparos pero cada uno puede matar instantáneamente.</p><p>Parafal + Thompson: Post-OB51, este combo combina el daño más alto por bala de AR (69 Parafal) con una SMG mejorada que ahora soporta scope 2x. Ambas armas fueron buffeadas y son picks emergentes en el meta.</p><p><strong>Combos de Sniper:</strong></p><p>AWM + MP5: AWM one-tap a distancia, MP5 con el TTK más bajo (0.28s) para defensa cercana. Necesitas buen posicionamiento — si te pillan sin cobertura, el AWM no te salva.</p><p>AWM + Bizon: Variante con Bizon (42 rondas, buena precisión). Más spray sostenido que MP5 pero TTK ligeramente más alto.</p><p>Kar98k + MP40: La versión accesible del sniper combo. Kar98k es floor loot (no necesitas airdrop) y sigue haciendo one-tap headshot contra la mayoría de cascos.</p>',
        orderIndex: 1,
        isPremium: false,
      },
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
