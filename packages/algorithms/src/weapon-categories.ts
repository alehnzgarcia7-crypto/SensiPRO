// ============================================================
// WEAPON CATEGORIES — Sensitivity modifiers por categoría de arma
// Consumed exclusively by Headshot Mode finger-adjusted engine
// ============================================================

export type WeaponCategory = 'shotgun' | 'smg' | 'ar_fast' | 'ar_heavy' | 'sniper' | 'pistol' | 'special';

export interface WeaponCategoryData {
  id: WeaponCategory;
  name: string;
  nameEs: string;
  icon: string;
  weapons: { name: string; meta: boolean }[];
  sensitivityModifier: number;
  modifierLabel: string;
  descriptionEs: string;
  bestDragTechnique: 'vertical' | 'rotation' | 'direction';
  bestDragEs: string;
  recoilLevel: 'none' | 'low' | 'medium' | 'high';
  recoilLabelEs: string;
  fireButtonAdjust: number;
}

export const WEAPON_CATEGORIES: Record<WeaponCategory, WeaponCategoryData> = {
  shotgun: {
    id: 'shotgun',
    name: 'Shotguns',
    nameEs: 'Escopetas',
    icon: '🔫',
    weapons: [
      { name: 'M1887', meta: true },
      { name: 'M1014', meta: true },
      { name: 'M1014-X', meta: false },
      { name: 'SPAS-12', meta: false },
    ],
    sensitivityModifier: 1.08,
    modifierLabel: '+8%',
    descriptionEs: 'Armas de un tiro. Necesitan snap rápido a la cabeza.',
    bestDragTechnique: 'rotation',
    bestDragEs: 'Rotation Drag (J-Drag) — arrastra en J hacia la cabeza',
    recoilLevel: 'none',
    recoilLabelEs: 'Sin recoil',
    fireButtonAdjust: 5,
  },
  smg: {
    id: 'smg',
    name: 'SMGs',
    nameEs: 'Subfusiles',
    icon: '⚡',
    weapons: [
      { name: 'MP40', meta: true },
      { name: 'UMP', meta: true },
      { name: 'Thompson', meta: false },
      { name: 'P90', meta: false },
      { name: 'MAC10', meta: false },
      { name: 'MP5', meta: false },
    ],
    sensitivityModifier: 1.04,
    modifierLabel: '+4%',
    descriptionEs: 'Fuego rápido para tracking fluido a corta-media distancia.',
    bestDragTechnique: 'vertical',
    bestDragEs: 'Vertical Drag — arrastra recto hacia arriba mientras disparas',
    recoilLevel: 'medium',
    recoilLabelEs: 'Recoil medio',
    fireButtonAdjust: 3,
  },
  ar_fast: {
    id: 'ar_fast',
    name: 'Assault Rifles (Fast)',
    nameEs: 'Rifles de Asalto (Rápidos)',
    icon: '🎯',
    weapons: [
      { name: 'M4A1', meta: true },
      { name: 'SCAR', meta: true },
      { name: 'XM8', meta: true },
      { name: 'Trogon', meta: true },
      { name: 'FAMAS', meta: false },
      { name: 'M14', meta: false },
    ],
    sensitivityModifier: 1.00,
    modifierLabel: 'Base',
    descriptionEs: 'Rifles versátiles. La base para toda sensibilidad.',
    bestDragTechnique: 'vertical',
    bestDragEs: 'Vertical Drag — el estándar para ARs',
    recoilLevel: 'medium',
    recoilLabelEs: 'Recoil medio',
    fireButtonAdjust: 0,
  },
  ar_heavy: {
    id: 'ar_heavy',
    name: 'Assault Rifles (Heavy)',
    nameEs: 'Rifles de Asalto (Pesados)',
    icon: '💥',
    weapons: [
      { name: 'AK47', meta: true },
      { name: 'AN94', meta: false },
      { name: 'Groza', meta: false },
      { name: 'PARAFAL', meta: false },
    ],
    sensitivityModifier: 0.97,
    modifierLabel: '-3%',
    descriptionEs: 'Alto daño pero retroceso fuerte. Necesitan más control.',
    bestDragTechnique: 'vertical',
    bestDragEs: 'Vertical Drag con ráfagas cortas — no spray completo',
    recoilLevel: 'high',
    recoilLabelEs: 'Recoil alto',
    fireButtonAdjust: -2,
  },
  sniper: {
    id: 'sniper',
    name: 'Snipers',
    nameEs: 'Francotiradores',
    icon: '🔭',
    weapons: [
      { name: 'AWM', meta: true },
      { name: 'Kar98k', meta: true },
      { name: 'SVD', meta: false },
      { name: 'Dragunov', meta: false },
      { name: 'M82B', meta: false },
    ],
    sensitivityModifier: 0.94,
    modifierLabel: '-6%',
    descriptionEs: 'Precisión máxima. Un tiro a la cabeza = eliminación.',
    bestDragTechnique: 'direction',
    bestDragEs: 'Direction Drag — sigue la dirección del enemigo en movimiento',
    recoilLevel: 'low',
    recoilLabelEs: 'Recoil bajo',
    fireButtonAdjust: -5,
  },
  pistol: {
    id: 'pistol',
    name: 'Pistols',
    nameEs: 'Pistolas',
    icon: '🔥',
    weapons: [
      { name: 'Desert Eagle', meta: true },
      { name: 'G18', meta: false },
      { name: 'M500', meta: false },
      { name: 'Treatment Gun', meta: false },
    ],
    sensitivityModifier: 1.05,
    modifierLabel: '+5%',
    descriptionEs: 'Armas secundarias de reacción rápida.',
    bestDragTechnique: 'rotation',
    bestDragEs: 'Rotation Drag — snap rápido en combate cercano',
    recoilLevel: 'low',
    recoilLabelEs: 'Recoil bajo',
    fireButtonAdjust: 2,
  },
  special: {
    id: 'special',
    name: 'Special',
    nameEs: 'Especiales',
    icon: '⭐',
    weapons: [
      { name: 'AC80', meta: true },
      { name: 'Crossbow', meta: false },
      { name: 'M79', meta: false },
    ],
    sensitivityModifier: 1.00,
    modifierLabel: 'Base',
    descriptionEs: 'Armas únicas con mecánicas especiales. El AC80 es el arma meta de Two9.',
    bestDragTechnique: 'vertical',
    bestDragEs: "Vertical Drag con ritmo 'one-two' (AC80: falla primer tiro, clava el segundo en la cabeza)",
    recoilLevel: 'low',
    recoilLabelEs: 'Recoil bajo',
    fireButtonAdjust: 0,
  },
};

export function getWeaponCategory(id: WeaponCategory): WeaponCategoryData {
  return WEAPON_CATEGORIES[id];
}

export function getAllWeaponCategories(): WeaponCategoryData[] {
  return Object.values(WEAPON_CATEGORIES);
}

export function getMetaWeapons(): { name: string; category: WeaponCategory }[] {
  const result: { name: string; category: WeaponCategory }[] = [];
  for (const [catId, cat] of Object.entries(WEAPON_CATEGORIES)) {
    for (const weapon of cat.weapons) {
      if (weapon.meta) {
        result.push({ name: weapon.name, category: catId as WeaponCategory });
      }
    }
  }
  return result;
}
