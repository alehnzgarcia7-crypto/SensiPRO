export function normalizeDeviceName(brand: string, model: string): string {
  return `${brand} ${model}`;
}

export function getDeviceSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getBrandIcon(brand: string): string {
  const icons: Record<string, string> = {
    samsung: '/images/brands/samsung.svg',
    apple: '/images/brands/apple.svg',
    xiaomi: '/images/brands/xiaomi.svg',
    redmi: '/images/brands/redmi.svg',
    poco: '/images/brands/poco.svg',
    motorola: '/images/brands/motorola.svg',
    realme: '/images/brands/realme.svg',
    oppo: '/images/brands/oppo.svg',
    vivo: '/images/brands/vivo.svg',
    honor: '/images/brands/honor.svg',
    oneplus: '/images/brands/oneplus.svg',
    infinix: '/images/brands/infinix.svg',
    tecno: '/images/brands/tecno.svg',
    huawei: '/images/brands/huawei.svg',
    google: '/images/brands/google.svg',
    nothing: '/images/brands/nothing.svg',
  };
  return icons[brand.toLowerCase()] ?? '/images/brands/default.svg';
}
