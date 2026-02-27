import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';

import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest} from 'next/server';
import { z } from 'zod';

import { CURRENT_META } from '@/lib/academy/meta-config';
import type { MetaSnapshot } from '@/lib/academy/meta-config';
import { auth } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// ARES-304 — Admin Meta API
// GET: Obtener meta snapshot actual
// PUT: Actualizar meta (solo ADMIN)
// ═══════════════════════════════════════════════════════════════

const META_FILE_PATH = path.join(process.cwd(), 'data', 'meta-snapshot.json');

const weaponSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['AR', 'SMG', 'SHOTGUN', 'SNIPER', 'PISTOL', 'LMG']),
  tier: z.enum(['S', 'A', 'B', 'C']),
  damage: z.number().int().min(0).max(100),
  fireRate: z.number().int().min(0).max(100),
  range: z.number().int().min(0).max(100),
  accuracy: z.number().int().min(0).max(100),
  magazine: z.number().int().min(1).max(200),
  recoilControl: z.number().int().min(0).max(100),
  description: z.string().min(1).max(500),
  bestFor: z.string().min(1).max(200),
  combo: z.string().min(1).max(200),
});

const characterSchema = z.object({
  name: z.string().min(1).max(50),
  tier: z.enum(['S', 'A', 'B', 'C']),
  ability: z.string().min(1).max(100),
  abilityType: z.enum(['ACTIVE', 'PASSIVE']),
  description: z.string().min(1).max(500),
  bestCombo: z.array(z.string().min(1).max(50)).min(1).max(10),
});

const comboSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  weapons: z.array(z.string().min(1).max(50)).min(1).max(5),
  style: z.string().min(1).max(50),
});

const metaUpdateSchema = z.object({
  version: z.string().min(1, 'Versión requerida').max(20),
  patchNotes: z.string().min(1, 'Notas del parche requeridas').max(500),
  weapons: z.array(weaponSchema).min(1, 'Al menos un arma requerida'),
  characters: z.array(characterSchema).min(1, 'Al menos un personaje requerido'),
  topCombos: z.array(comboSchema).optional().default([]),
});

async function loadMetaSnapshot(): Promise<MetaSnapshot> {
  try {
    const content = await readFile(META_FILE_PATH, 'utf-8');
    return JSON.parse(content) as MetaSnapshot;
  } catch {
    return CURRENT_META;
  }
}

export async function GET() {
  try {
    const data = await loadMetaSnapshot();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al obtener meta snapshot', { error: message });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener el meta actual',
        },
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;

    if (!session?.user || userRole !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo administradores pueden actualizar el meta',
          },
        },
        { status: 403 },
      );
    }

    const body: unknown = await request.json();
    const parsed = metaUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
          },
        },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString();
    const snapshot: MetaSnapshot = {
      ...parsed.data,
      lastUpdated: today,
    };

    // Asegurar que el directorio data/ existe
    const dataDir = path.dirname(META_FILE_PATH);
    await mkdir(dataDir, { recursive: true });

    await writeFile(META_FILE_PATH, JSON.stringify(snapshot, null, 2), 'utf-8');

    logger.info('Meta snapshot actualizado', {
      version: snapshot.version,
      weaponsCount: snapshot.weapons.length,
      charactersCount: snapshot.characters.length,
      adminId: (session.user as { id?: string }).id,
    });

    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('Error al actualizar meta snapshot', { error: message });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar el meta',
        },
      },
      { status: 500 },
    );
  }
}
