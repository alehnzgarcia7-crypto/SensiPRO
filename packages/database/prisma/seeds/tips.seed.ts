import type { PrismaClient, GuideCategory, TipDifficulty } from '@prisma/client';

interface TipSeed {
  title: string;
  content: string;
  category: GuideCategory;
  difficulty: TipDifficulty;
}

const TIPS: TipSeed[] = [
  // ─── SENSITIVITY (18 tips) ───
  { title: 'Tu DPI manda tu sensibilidad', content: 'El DPI de tu pantalla es el factor #1 que determina tu sensibilidad. DPI bajo (~270) = General ~185-190. DPI alto (~460) = General ~163-170. Usa SensiPRO para calcularlo automáticamente.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'No copies la sensi de un streamer', content: 'Los streamers usan dispositivos diferentes al tuyo. Lo que funciona en un iPad Pro no funciona en un Redmi Note.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'Dale 3 días a cada cambio', content: 'Tu cerebro necesita mínimo 3 días para acostumbrarse a una nueva sensibilidad. No cambies cada partida.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'Prueba en sala de entrenamiento', content: 'SIEMPRE prueba cambios de sensibilidad en la sala de entrenamiento antes de ir a ranked.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'El giroscopio es tu amigo', content: 'Activar giroscopio incluso en nivel bajo te da una ventaja enorme en combates cercanos. No lo ignores.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'Sensibilidad alta no es igual a mejor', content: 'Más sensibilidad = más velocidad pero menos control. Encuentra el balance donde puedas girar rápido Y apuntar preciso.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },
  { title: 'Cada mira necesita su valor', content: 'No pongas la misma sensibilidad para todas las miras. El scope 4x necesita menos sensibilidad que el punto rojo.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'Free Look va separado (14-22)', content: 'El Free Look (vista libre) NO sigue el tapering -15. Tiene su propio cálculo independiente y debe estar entre 14-22 dependiendo de tu DPI. No lo subas más o perderás control.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },
  { title: '120Hz ajusta ±3 puntos', content: 'La tasa de refresco es un ajuste SECUNDARIO al DPI. 120Hz suma ~3 puntos vs 60Hz. No es el 10-15% que se creía antes — el DPI importa mucho más.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },
  { title: 'Pantalla grande = ±4 puntos', content: 'El tamaño de pantalla es un ajuste secundario. Una pantalla de 6.7" suma ~4 puntos vs una de 5.5". El factor principal sigue siendo el DPI.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },
  { title: 'AWM scope necesita precisión', content: 'Para el AWM usa la sensibilidad más baja de todas tus miras. Cada pixel cuenta para el headshot.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },
  { title: 'Calibra después de actualizar', content: 'Garena a veces cambia cómo funcionan los sliders en actualizaciones. Recalibra después de cada parche grande.', category: 'SENSITIVITY', difficulty: 'ADVANCED' },
  { title: 'El tapering profesional es -15', content: 'Los mejores calibradores usan tapering -15: si tu General es 175, tu Punto Rojo es 160, tu 2x es 145, tu 4x es 130 y tu AWM es 115. Este patrón escalonado te da control progresivo con cada zoom.', category: 'SENSITIVITY', difficulty: 'ADVANCED' },
  { title: 'Sensibilidad diferente por arma', content: 'Tu sensibilidad ideal para pelear con MP40 (cerca) es diferente a la de pelear con M4 (lejos).', category: 'SENSITIVITY', difficulty: 'ADVANCED' },
  { title: 'Giro de 180° en un swipe', content: 'Ajusta tu sensibilidad general para poder hacer un giro de 180° con un solo movimiento del dedo sin levantar.', category: 'SENSITIVITY', difficulty: 'ADVANCED' },
  { title: 'Giroscopio: empieza solo con scope', content: 'Si eres nuevo con giroscopio, actívalo solo "Scope On" primero. Cuando domines eso, pasa a "Always On".', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'No toques sensi antes de ranked', content: 'NUNCA cambies tu sensibilidad justo antes de una sesión de ranked. Hazlo en un día que practiques.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'General va de 135 a 195', content: 'En v4.0, la sensibilidad General está entre 135 (DPI ultra alto ~600) y 195 (DPI bajo ~200). Si tu valor está fuera de este rango, probablemente no está calibrado correctamente para tu pantalla.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'Cambiaste de celular? Recalibra', content: 'Si cambias de dispositivo, tu sensibilidad DEBE cambiar. Un Samsung A13 (DPI 270) usa General ~187 mientras que un iPhone 15 (DPI 460) usa General ~170. Nunca copies la misma config entre celulares.', category: 'SENSITIVITY', difficulty: 'BEGINNER' },
  { title: 'La RAM ajusta ±5 puntos máximo', content: 'La RAM es un factor secundario. Un celular de 3GB baja ~5 puntos y uno de 12GB sube ~5. No es el factor principal — el DPI de tu pantalla importa 10 veces más.', category: 'SENSITIVITY', difficulty: 'INTERMEDIATE' },

  // ─── AIM (17 tips) ───
  { title: 'Apunta a nivel de cabeza', content: 'Mantén tu mira SIEMPRE a nivel de cabeza mientras caminas. Reduce la distancia para headshots.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: '10 minutos de aim training', content: 'Antes de jugar ranked, dedica 10 minutos a practicar aim en sala de entrenamiento. Es como calentar antes de hacer ejercicio.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'Tracking > Flicking', content: 'El 80% de combates en FF requieren tracking (seguir al objetivo). Practica tracking más que flick shots.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'Pre-aim en esquinas', content: 'Antes de girar una esquina, pre-apunta donde esperas que esté el enemigo. Así solo necesitas disparar.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'Dispara en ráfagas', content: 'No mantengas presionado el botón. Dispara en ráfagas de 3-5 balas para mantener precisión a media distancia.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'Conoce el retroceso de tu arma', content: 'Cada arma tiene un patrón de retroceso. Aprende el de tu arma principal y compensa jalando en dirección opuesta.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'Agáchate al disparar', content: 'Agacharte reduce tu retroceso y te hace un blanco más pequeño. Hazlo en cada combate a media distancia.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'Shotgun: apunta al torso', content: 'Con shotgun no apuntes a la cabeza. El spread es amplio, apunta al torso superior para máximo daño.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'Usa la mira adecuada', content: 'Punto rojo para <50m, 2x para 50-100m, 4x para 100m+. No uses 4x en combate cercano.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'No apuntes con scope en close range', content: 'En combate cercano (<5m) dispara en tercera persona. Apuntar con scope te hace más lento.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'El primer disparo es el más preciso', content: 'El primer disparo siempre va exactamente donde apuntas. Haz que cuente, especialmente con snipers.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'Practica con armas que no te gustan', content: 'Forzarte a usar armas incómodas mejora tu aim general más rápido que usar siempre tu favorita.', category: 'AIM', difficulty: 'ADVANCED' },
  { title: 'Micro-flicks con giroscopio', content: 'Usa el giroscopio para ajustes finales de aim. Tu dedo hace el movimiento grande, el giro hace el ajuste fino.', category: 'AIM', difficulty: 'ADVANCED' },
  { title: 'Cambia entre objetivos', content: 'En squad, practica cambiar tu aim entre varios objetivos rápidamente. En endgame necesitas eliminar múltiples enemigos.', category: 'AIM', difficulty: 'ADVANCED' },
  { title: 'No persigas kills', content: 'Si fallas los primeros disparos y el enemigo se cubre, no lo persigas. Reposiciónate y busca otro ángulo.', category: 'AIM', difficulty: 'INTERMEDIATE' },
  { title: 'Stance importa', content: 'Cómo sostienes tu celular afecta tu aim. Usa dedos índice o pulgares de forma consistente, no mezcles.', category: 'AIM', difficulty: 'BEGINNER' },
  { title: 'Respira', content: 'En combates intensos tendemos a tensar los dedos. Relaja tus manos conscientemente para aim más suave.', category: 'AIM', difficulty: 'INTERMEDIATE' },

  // ─── MOVEMENT (17 tips) ───
  { title: 'Nunca te quedes quieto', content: 'SIEMPRE muévete durante un combate. Un blanco estático es un blanco muerto.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: 'Drop shot básico', content: 'Agáchate mientras disparas para esquivar balas. Practica presionar agacharse y disparar al mismo tiempo.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: 'Jiggle peek en esquinas', content: 'Asómate rápido por una esquina, dispara 2-3 balas y vuelve a cubrirte. Repite.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Zigzag al cruzar espacios abiertos', content: 'Nunca corras en línea recta por un campo abierto. Muévete en zigzag para ser un blanco difícil.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: 'Usa vehículos como cover', content: 'Los vehículos no solo sirven para moverse. Estaciónalos estratégicamente como cobertura temporal.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Gloo wall instantánea', content: 'Practica colocar gloo walls en <0.3 segundos. Cambia a gloo, mira al suelo y coloca. Debe ser automático.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: '4 gloo walls = fuerte instantáneo', content: 'Gira 360° colocando 4 gloo walls para crear un fuerte alrededor tuyo en 2 segundos.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Ramp rush', content: 'Coloca una gloo wall inclinada y súbete encima. Tener altura te da ventaja enorme en el combate.', category: 'MOVEMENT', difficulty: 'ADVANCED' },
  { title: 'Salta mientras colocas gloo', content: 'Saltar antes de colocar gloo wall te da una pared más alta. Útil contra enemigos en posición elevada.', category: 'MOVEMENT', difficulty: 'ADVANCED' },
  { title: 'No saltes en combate cercano', content: 'Saltar en combate cercano te hace predecible (caes en el mismo lugar). Mejor usa side steps.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Usa el prone (tirarse al piso)', content: 'Tirarte al piso en medio de un combate a media distancia puede confundir al enemigo y esquivar sus balas.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Rota antes de la zona', content: 'Muévete cuando la zona se ANUNCIA, no cuando empieza a cerrarse. Llega primero a la buena posición.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: 'Corre por los bordes del mapa', content: 'Correr por el centro del mapa te expone a enemigos de todas direcciones. Los bordes te protegen un flanco.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Cambia de posición después de disparar', content: 'Después de matar a alguien, MUÉVETE. Su equipo va a mirar hacia donde escuchó los disparos.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Usa las cuestas', content: 'Las cuestas y elevaciones del terreno son cobertura natural. Asómate, dispara, baja. Mejor que gloo wall.', category: 'MOVEMENT', difficulty: 'INTERMEDIATE' },
  { title: 'Free look mientras corres', content: 'Activa Free Look mientras corres para vigilar a tus costados sin cambiar dirección.', category: 'MOVEMENT', difficulty: 'BEGINNER' },
  { title: 'Silencio es oro', content: 'Camina (no corras) cuando estés cerca de enemigos. Los pasos suenan fuerte y delatan tu posición.', category: 'MOVEMENT', difficulty: 'BEGINNER' },

  // ─── STRATEGY (17 tips) ───
  { title: 'No aterrices en hot drops', content: 'Si quieres subir de rango, evita aterrizar donde van todos. Un aterrizaje seguro = mejor loot = más posibilidades.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Lleva siempre 3+ gloo walls', content: 'Las gloo walls son más importantes que granadas. Siempre lleva al menos 3.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Posición > kills', content: 'Un jugador bien posicionado con 2 kills gana más puntos que uno con 8 kills que murió en top 20.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Third party siempre', content: 'Espera a que dos equipos peleen y ataca al ganador cuando está débil. Es la estrategia más efectiva.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'No revivas en campo abierto', content: 'Si tu compañero cayó en campo abierto, NO vayas a revivir. Espera o usa gloo walls para cubrir.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Un IGL por equipo', content: 'En squad, solo UNA persona debe tomar las decisiones de rotación y combate. Demasiados jefes = caos.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Callouts cortos y claros', content: '"Enemigo norte, 50m, detrás de gloo" es mejor que "¡Ahí está, ahí está!" Dirección + distancia + cover.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Prioriza revivir sobre matar', content: 'En endgame, un compañero vivo vale más que un kill. Si puedes revivir de forma segura, hazlo primero.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Controla los edificios', content: 'En las últimas zonas, controlar un edificio te da ventaja enorme. Llega primero y defiende las escaleras.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Guarda la munición', content: 'No dispares a enemigos a 200m+ con AR. Solo revelas tu posición sin probabilidad de kill.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Airdrop solo si estás cerca', content: 'No cruces medio mapa por un airdrop. Solo ve si cae cerca y puedes llegar antes que otros.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Juega el borde de la zona', content: 'En ranked, juega en el borde de la zona (no el centro). Así solo tienes enemigos de un lado.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'No peleen separados', content: 'En squad, nunca te separes más de 30 metros de tu equipo. Si te agarran solo, perdiste.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Conoce tu combo de armas', content: 'Decide tu combo ideal ANTES de aterrizar. AR+Shotgun, AR+Sniper, o SMG+AR. No cambies a mitad de partida.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Usa granadas para flush', content: 'Si un enemigo se cubre detrás de gloo wall, lanza una granada detrás de la pared. Forzalo a moverse.', category: 'STRATEGY', difficulty: 'INTERMEDIATE' },
  { title: 'Farmea puntos en los primeros minutos', content: 'Los primeros 3-4 minutos son para lootear, no para pelear. No busques combates temprano en ranked.', category: 'STRATEGY', difficulty: 'BEGINNER' },
  { title: 'Sabe cuándo retirarte', content: 'Si un combate no va a tu favor en 5 segundos, retírate. Vivir > una kill potencial.', category: 'STRATEGY', difficulty: 'ADVANCED' },

  // ─── DEVICE (15 tips) ───
  { title: 'FPS > gráficos bonitos', content: 'SIEMPRE pon gráficos en "Suave" y FPS en "Alto". Los gráficos bonitos no ganan partidas.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Cierra apps en segundo plano', content: 'Cierra TODO antes de jugar. Cada app abierta roba RAM y CPU que Free Fire necesita.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Quita la funda del celular', content: 'Tu celular se calienta al jugar. Quita la funda para que ventile mejor y evite thermal throttling.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Modo Gaming', content: 'Si tu celular tiene "Modo Gaming" o "Modo Rendimiento", actívalo. Prioriza CPU/GPU para el juego.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Desactiva notificaciones', content: 'Una notificación en medio de un combate = muerte segura. Activa No Molestar antes de jugar.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'WiFi > datos móviles', content: 'Siempre que puedas, juega en WiFi. Los datos móviles tienen más latencia y son menos estables.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Descansos de 5 minutos', content: 'Cada 3-4 partidas, descansa 5 minutos. Tu celular se enfría, tus ojos descansan y juegas mejor.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Limpia tu pantalla', content: 'Una pantalla sucia reduce la precisión del touch. Limpia tu pantalla cada sesión de juego.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Batería entre 20-80%', content: 'Jugar con menos de 20% de batería reduce rendimiento. Jugar cargando calienta el celular. Ideal: 40-80%.', category: 'DEVICE', difficulty: 'INTERMEDIATE' },
  { title: 'Ping bajo = ventaja', content: 'Busca el servidor con menor ping. La diferencia entre 20ms y 100ms es enorme en combates cercanos.', category: 'DEVICE', difficulty: 'INTERMEDIATE' },
  { title: 'Resolución de pantalla', content: 'Si tu celular lo permite, reduce la resolución de pantalla para ganar FPS. La diferencia visual es mínima.', category: 'DEVICE', difficulty: 'INTERMEDIATE' },
  { title: 'Actualiza Free Fire', content: 'Siempre juega la última versión. Las actualizaciones suelen traer optimizaciones de rendimiento.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Espacio de almacenamiento', content: 'Mantén al menos 2GB libres de almacenamiento. Un celular lleno funciona más lento en todo.', category: 'DEVICE', difficulty: 'BEGINNER' },
  { title: 'Protector de pantalla mate', content: 'Un protector de pantalla mate reduce reflejos y mejora la respuesta del touch. Vale la inversión.', category: 'DEVICE', difficulty: 'INTERMEDIATE' },
  { title: 'Dedales/finger sleeves', content: 'Los dedales gaming eliminan el sudor del dedo y mejoran la precisión del touch. Cuestan menos de $50 MXN.', category: 'DEVICE', difficulty: 'INTERMEDIATE' },

  // ─── META (20 tips) ───
  { title: 'M4A1 es la AR más consistente', content: 'OB51 buffeó el M4A1: +5% daño y +10% precisión en upgrades. Buen daño (53), bajo retroceso, funciona a todas las distancias.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'MP40 domina el close range', content: 'Con 830 RPM (la cadencia más alta del juego), el MP40 tiene el TTK más bajo en combate cercano. Pierde 40% de daño pasados 10m.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'AWM one-shot headshot', content: 'El AWM es la única arma que mata de un headshot con casco nivel 3. Solo de airdrop pero define el late-game.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'M1014: 6 rondas de destrucción', content: 'La M1014 tiene 6 rondas en cargador — puede hacer squad wipe sin recargar. Dentro de edificios es la reina.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'SCAR para principiantes', content: 'La SCAR tiene el retroceso más bajo de las AR. 53 DMG con 61 RoF la hacen perfecta para aprender spray control.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'Woodpecker penetra armaduras', content: 'La Woodpecker tiene penetración de armadura incorporada. 85 de daño que ignora chalecos nivel 3. Combo perfecto con MP40.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'Parafal subió de tier en OB51', content: 'OB51 buffeó la Parafal: +5% armor pen, +3% DMG, +5% accuracy. Con 69 de daño base (el más alto de AR), es una opción seria.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'Thompson reworked en OB51', content: 'La Thompson recibió buff enorme en OB51: +3% DMG, +5% armor pen, +10% rango, +5% accuracy y soporte para scope 2x. Vale la pena probarla.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'MAC10: el armor breaker', content: 'MAC10 con 42 rondas rompe armaduras rápido. OB51 mejoró todos sus upgrade paths. Perfecto para rush agresivo.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'Combo MP40 + Woodpecker', content: 'El combo #1 del meta actual: MP40 para rush cercano + Woodpecker para armor pen a distancia. Lo usan los pros.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'Combo SCAR + M1014', content: 'El combo más confiable para ranked: SCAR spray a media distancia + M1014 shotgun para cerrar kills.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'Knockdown más rápido en OB51', content: 'OB51 redujo el bleed-out de 35s a 14s para rifles/snipers. Revive a tus compañeros MÁS RÁPIDO que antes.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'Nero: nuevo personaje OB51', content: 'Nero lanza un dummy que rastrea enemigos y crea zonas donde no se pueden colocar Gloo Walls. Counter al meta de gloo rush.', category: 'META', difficulty: 'ADVANCED' },
  { title: 'Aim Precision modes del OB51', content: 'OB51 añadió 3 modos de aim: Default, Precise on Scope y Full Control. Pruébalos para ver cuál se adapta a tu estilo.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'Alok sigue siendo top tier', content: 'Alok (curación + velocidad) sigue siendo uno de los mejores personajes. Combínalo con Jota para heal constante.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'Skyler contra gloo walls', content: 'Skyler destruye hasta 5 Gloo Walls con su onda sónica. Esencial en el meta actual donde todos spamean gloos.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'No sigas el meta ciegamente', content: 'El "meta" es lo que funciona en promedio. Si tú eres bueno con un arma "off-meta", úsala. La consistencia personal > tier list.', category: 'META', difficulty: 'ADVANCED' },
  { title: 'Granadas son infravaloradas', content: 'Una granada detrás de una gloo wall = kill garantizado. El enemigo tiene que salir de su cobertura.', category: 'META', difficulty: 'INTERMEDIATE' },
  { title: 'OB51 empiezas con 4 medkits', content: 'Post-OB51 empiezas con 4 Med Kits que no ocupan espacio en mochila. Puedes ser más agresivo temprano.', category: 'META', difficulty: 'BEGINNER' },
  { title: 'Winchester: ráfaga de 2 tiros', content: 'La nueva Winchester dispara ráfagas de 2 tiros. Alta movilidad y recarga parcial. Floor loot + vending machine por 300 coins.', category: 'META', difficulty: 'ADVANCED' },
];

export async function seedTips(prisma: PrismaClient): Promise<number> {
  let count = 0;

  for (const tip of TIPS) {
    const existing = await prisma.tip.findFirst({
      where: { title: tip.title },
    });

    if (existing) continue;

    await prisma.tip.create({
      data: {
        title: tip.title,
        content: tip.content,
        category: tip.category,
        difficulty: tip.difficulty,
        isPublished: true,
      },
    });

    count++;
  }

  return count;
}
