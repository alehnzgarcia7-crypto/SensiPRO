# ARES SensiPRO — MASTER PLAN A
# ══════════════════════════════════════════════════════════════
# FASE 0 — FUNDACIÓN (8 scripts: ARES-000 → ARES-007)
# "Los cimientos sobre los que se construye un imperio gaming"
# ══════════════════════════════════════════════════════════════
#
# Este archivo contiene las instrucciones EXACTAS para los primeros
# 8 scripts del proyecto. Claude Code lo lee y ejecuta cada script
# creando TODOS los archivos con su contenido COMPLETO.
#
# Si un archivo está aquí, DEBE existir exactamente así en el proyecto.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

Cuando ejecutes un script de este plan:

1. **Lee CLAUDE.md primero** para las convenciones y arquitectura
2. **Lee PROGRESS.md** para saber cuál es el siguiente script
3. **Busca el script en este archivo** por su nombre (ej: ARES-000-genesis)
4. **Crea TODOS los archivos listados** — no dejes ninguno pendiente
5. **Cada archivo debe estar COMPLETO** — no uses `// TODO` ni placeholders
6. **Incluye imports correctos** — referencia packages con `@ares/nombre`
7. **Después de terminar**: actualiza PROGRESS.md, haz git commit y push

## Convenciones de este documento

- `[ARCHIVO]` = ruta del archivo a crear (relativa a ~/SensiPRO/)
- `[EXPORTA]` = funciones/clases que el archivo debe exportar
- `[DEPENDENCIAS]` = otros scripts que deben completarse antes
- `[VALIDACIÓN]` = cómo verificar que el script se completó correctamente
- `[TESTS]` = tests mínimos requeridos (si aplica)

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 0 — FUNDACIÓN                                    █
# █   Scripts 1-8 | La base sobre la que se construye todo   █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-000-genesis

**Fase:** 0 | **Prioridad:** CRÍTICO
**Dependencias:** Ninguna (primer script)
**Descripción:** Inicializa el monorepo Next.js 14 con TypeScript strict, Turborepo, Tailwind con tema gaming completo, y todas las configuraciones de desarrollo.

### Archivos a crear:

```
[ARCHIVO] package.json
```
```json
{
  "name": "ares-sensipro",
  "version": "0.1.0",
  "private": true,
  "description": "ARES — Generador de Sensibilidades #1 para Free Fire",
  "author": "Alex García",
  "license": "PROPRIETARY",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "next dev --turbo",
    "dev:db": "docker compose -f infrastructure/docker/docker-compose.dev.yml up -d",
    "build": "turbo run build",
    "start": "next start",
    "lint": "next lint && eslint packages/ --ext .ts,.tsx",
    "lint:fix": "next lint --fix && eslint packages/ --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,json,md,css}\"",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "cd packages/database && npx prisma migrate dev",
    "db:generate": "cd packages/database && npx prisma generate",
    "db:seed": "cd packages/database && npx tsx prisma/seeds/run-seed.ts",
    "db:studio": "cd packages/database && npx prisma studio",
    "db:reset": "cd packages/database && npx prisma migrate reset --force",
    "docker:up": "docker compose -f infrastructure/docker/docker-compose.dev.yml up -d",
    "docker:down": "docker compose -f infrastructure/docker/docker-compose.dev.yml down",
    "clean": "rm -rf .next node_modules packages/*/node_modules packages/*/dist"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^5.0.0-beta.18",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "zod": "^3.23.0",
    "bcryptjs": "^2.4.3",
    "lucide-react": "^0.378.0",
    "recharts": "^2.12.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.0",
    "postcss": "^8.4.38",
    "prettier": "^3.2.0",
    "tailwindcss": "^3.4.0",
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "playwright": "^1.44.0",
    "@playwright/test": "^1.44.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

```
[ARCHIVO] tsconfig.json
```
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@ares/database": ["./packages/database/src"],
      "@ares/algorithms": ["./packages/algorithms/src"],
      "@ares/types": ["./packages/types/src"],
      "@ares/utils": ["./packages/utils/src"],
      "@ares/errors": ["./packages/errors/src"],
      "@ares/logger": ["./packages/logger/src"],
      "@ares/config": ["./packages/config/src"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "dist", ".next"]
}
```

```
[ARCHIVO] turbo.json
```
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```
[ARCHIVO] next.config.ts
```
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

```
[ARCHIVO] tailwind.config.ts
```
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background layers
        background: {
          DEFAULT: '#050810',
          card: '#0a0f1e',
          elevated: '#111a30',
          hover: '#162040',
        },
        // Brand: Fire & Ice
        fire: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6a00',   // PRIMARY FIRE
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        ice: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00c8ff',   // PRIMARY ICE
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // UI States
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        info: '#3b82f6',
        // Tier colors
        tier: {
          free: '#94a3b8',
          premium: '#f59e0b',
          vip: '#a855f7',
        },
        // Style colors
        style: {
          aggressive: '#ef4444',
          balanced: '#3b82f6',
          sniper: '#22c55e',
        },
        // Neon accents
        neon: {
          pink: '#ff006e',
          green: '#39ff14',
          blue: '#00f0ff',
          purple: '#bf00ff',
          yellow: '#ffe600',
        },
      },
      fontFamily: {
        body: ['Chakra Petch', 'sans-serif'],
        display: ['Exo 2', 'sans-serif'],
        ui: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'gaming': '12px',
      },
      boxShadow: {
        'glow-fire': '0 0 20px rgba(255, 106, 0, 0.3)',
        'glow-ice': '0 0 20px rgba(0, 200, 255, 0.3)',
        'glow-premium': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-vip': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-fire': 'linear-gradient(135deg, #ff6a00, #ee0979)',
        'gradient-ice': 'linear-gradient(135deg, #00c8ff, #0072ff)',
        'gradient-fire-ice': 'linear-gradient(90deg, #ff6a00, #00c8ff)',
        'gradient-premium': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'gradient-vip': 'linear-gradient(135deg, #a855f7, #6366f1)',
        'gradient-dark': 'linear-gradient(135deg, #0a0f1e, #111a30)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-fire': 'pulseFire 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(255, 106, 0, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(255, 106, 0, 0.8), 0 0 40px rgba(255, 106, 0, 0.3)' },
        },
        pulseFire: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 106, 0, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 106, 0, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      screens: {
        'xs': '375px',
        'gaming': '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
```

```
[ARCHIVO] postcss.config.js
```
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```
[ARCHIVO] .eslintrc.json
```
```json
{
  "root": true,
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["dist", "node_modules", ".next", "coverage"]
}
```

```
[ARCHIVO] .prettierrc
```
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf",
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```
[ARCHIVO] .nvmrc
```
```
20
```

```
[ARCHIVO] .gitignore
```
```
# dependencies
node_modules
.pnp
.pnp.js

# next.js
.next/
out/

# production
build
dist

# env files
.env
.env.local
.env.*.local

# testing
coverage
test-results
playwright-report

# misc
.DS_Store
*.pem
.turbo
*.tsbuildinfo

# autopilot
.ares-autopilot/

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
```

```
[ARCHIVO] .env.example
```
```bash
# ═══════════════════════════════════════════════════════════════
# ARES SensiPRO — Variables de Entorno
# Copiar a .env.local y llenar con valores reales
# NUNCA subas .env.local a git
# ═══════════════════════════════════════════════════════════════

# ── Database ──────────────────────────────────────────────
DATABASE_URL="postgresql://ares:ares@localhost:5432/ares_dev"
REDIS_URL="redis://localhost:6379"

# ── Auth ──────────────────────────────────────────────────
NEXTAUTH_SECRET="genera-un-string-random-de-al-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# ── Payments: MercadoPago ─────────────────────────────────
MP_PUBLIC_KEY=""
MP_ACCESS_TOKEN=""

# ── Payments: Stripe ──────────────────────────────────────
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ── Email ─────────────────────────────────────────────────
RESEND_API_KEY=""
EMAIL_FROM="ARES SensiPRO <noreply@sensibilidadespro.com>"

# ── App ───────────────────────────────────────────────────
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Sensibilidades PRO"

# ── SEO ───────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://sensibilidadespro.com"
NEXT_PUBLIC_GA_ID=""

# ── Rate Limiting ─────────────────────────────────────────
RATE_LIMIT_FREE=5
RATE_LIMIT_PREMIUM=9999
RATE_LIMIT_WINDOW=86400
```

```
[ARCHIVO] vitest.config.ts
```
```typescript
import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '.next', '**/*.test.ts', '**/types/**'],
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.next', 'tests/e2e'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ares/database': path.resolve(__dirname, 'packages/database/src'),
      '@ares/algorithms': path.resolve(__dirname, 'packages/algorithms/src'),
      '@ares/types': path.resolve(__dirname, 'packages/types/src'),
      '@ares/utils': path.resolve(__dirname, 'packages/utils/src'),
      '@ares/errors': path.resolve(__dirname, 'packages/errors/src'),
      '@ares/logger': path.resolve(__dirname, 'packages/logger/src'),
      '@ares/config': path.resolve(__dirname, 'packages/config/src'),
    },
  },
});
```

```
[ARCHIVO] playwright.config.ts
```
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```
[ARCHIVO] src/app/globals.css
```
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════════════
   ARES SensiPRO — Gaming Design System
   Dark mode only | Fire & Ice theme | Mobile first
   ═══════════════════════════════════════════════════════════ */

@layer base {
  /* Import gaming fonts */
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Exo+2:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  * {
    @apply border-white/10;
  }

  html {
    @apply scroll-smooth;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    @apply bg-background text-slate-200 font-body antialiased;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(255, 106, 0, 0.03) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(0, 200, 255, 0.03) 0%, transparent 50%);
    min-height: 100vh;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #050810; }
  ::-webkit-scrollbar-thumb { background: #1a2a4e; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #ff6a00; }

  /* Selection */
  ::selection { background: rgba(255, 106, 0, 0.3); color: white; }
}

@layer components {
  /* Glassmorphism base */
  .glass {
    @apply bg-background-card/80 backdrop-blur-xl border border-white/5 rounded-gaming;
  }

  .glass-hover {
    @apply glass transition-all duration-300 hover:border-fire-500/30 hover:shadow-glow-fire;
  }

  /* Glow borders */
  .border-glow-fire {
    @apply border-fire-500/30 shadow-glow-fire;
  }

  .border-glow-ice {
    @apply border-ice-500/30 shadow-glow-ice;
  }

  /* Gradient text */
  .text-gradient-fire-ice {
    @apply bg-gradient-fire-ice bg-clip-text text-transparent;
  }

  .text-gradient-fire {
    @apply bg-gradient-fire bg-clip-text text-transparent;
  }

  /* Gaming button base */
  .btn-gaming {
    @apply inline-flex items-center justify-center gap-2 rounded-gaming px-6 py-3
           font-ui font-semibold text-sm tracking-wider uppercase
           transition-all duration-200 active:scale-95
           disabled:opacity-50 disabled:cursor-not-allowed
           min-h-[44px] min-w-[44px];
  }

  /* Tier badges */
  .badge-free { @apply bg-tier-free/10 text-tier-free border border-tier-free/20; }
  .badge-premium { @apply bg-tier-premium/10 text-tier-premium border border-tier-premium/20; }
  .badge-vip { @apply bg-tier-vip/10 text-tier-vip border border-tier-vip/20; }

  /* Style badges */
  .badge-aggressive { @apply bg-style-aggressive/10 text-style-aggressive border border-style-aggressive/20; }
  .badge-balanced { @apply bg-style-balanced/10 text-style-balanced border border-style-balanced/20; }
  .badge-sniper { @apply bg-style-sniper/10 text-style-sniper border border-style-sniper/20; }

  /* Shimmer loading effect */
  .shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
  }
}

@layer utilities {
  /* Touch target utility */
  .touch-target { @apply min-h-[44px] min-w-[44px]; }

  /* Safe area for mobile */
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
  .safe-top { padding-top: env(safe-area-inset-top, 0); }
}
```

```
[ARCHIVO] src/app/layout.tsx
```
```tsx
import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sensibilidades PRO — Generador #1 para Free Fire',
    template: '%s | Sensibilidades PRO',
  },
  description:
    'Genera las mejores sensibilidades para Free Fire basadas en las especificaciones reales de tu dispositivo. 500+ dispositivos, 3 estilos de juego, giroscopio y más.',
  keywords: [
    'sensibilidades free fire',
    'sensibilidad free fire',
    'configuracion free fire',
    'mejor sensibilidad',
    'free fire config',
    'sensibilidades pro',
  ],
  authors: [{ name: 'ARES SensiPRO' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Sensibilidades PRO',
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description: 'Genera sensibilidades basadas en hardware real. 500+ dispositivos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sensibilidades PRO — Generador #1 para Free Fire',
    description: 'Genera sensibilidades basadas en hardware real. 500+ dispositivos.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050810',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

```
[ARCHIVO] src/app/page.tsx
```
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient-fire-ice text-center">
        ARES SensiPRO
      </h1>
      <p className="mt-4 text-lg text-slate-400 text-center max-w-md">
        Generador de Sensibilidades #1 para Free Fire
      </p>
      <p className="mt-2 text-sm text-slate-500">
        En construcción — Fase 0 completada ✅
      </p>
    </main>
  );
}
```

```
[ARCHIVO] src/app/not-found.tsx
```
```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-display font-bold text-gradient-fire-ice">404</h1>
      <p className="mt-4 text-lg text-slate-400">Esta página no existe</p>
      <Link
        href="/"
        className="mt-6 btn-gaming bg-gradient-fire-ice text-white"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
```

```
[ARCHIVO] src/app/loading.tsx
```
```tsx
export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-fire-500/30 border-t-fire-500 animate-spin" />
        <p className="text-sm text-slate-500 font-ui">Cargando...</p>
      </div>
    </main>
  );
}
```

```
[ARCHIVO] middleware.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|icons).*)'],
};
```

### Validación:
```bash
# Verificar archivos creados
ls package.json tsconfig.json turbo.json next.config.ts tailwind.config.ts postcss.config.js .eslintrc.json .prettierrc .gitignore .env.example vitest.config.ts playwright.config.ts middleware.ts
ls src/app/globals.css src/app/layout.tsx src/app/page.tsx src/app/not-found.tsx src/app/loading.tsx
# Instalar dependencias
npm install
# Verificar TypeScript
npx tsc --noEmit
# Copiar env
cp .env.example .env.local
# Probar dev server
npm run dev
```

### Commit: `feat(init): ARES-000 genesis — Next.js 14 monorepo + TypeScript strict + gaming theme`

---

## ARES-001-database-foundation

**Fase:** 0 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-000-genesis
**Descripción:** Configura Prisma con PostgreSQL, crea el schema completo con 19 modelos y 12 enums, PrismaClient singleton, y seed con usuario admin + achievements base.

### Archivos a crear:

```
[ARCHIVO] packages/database/package.json
```
```json
{
  "name": "@ares/database",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "migrate:prod": "prisma migrate deploy",
    "seed": "tsx prisma/seeds/run-seed.ts",
    "studio": "prisma studio",
    "reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0"
  },
  "devDependencies": {
    "tsx": "^4.10.0",
    "typescript": "^5.4.0"
  }
}
```

```
[ARCHIVO] packages/database/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```
[ARCHIVO] packages/database/prisma/schema.prisma
```
**IMPORTANTE:** Usar el schema COMPLETO que está documentado en CLAUDE.md sección "DATABASE SCHEMA COMPLETO". Son 19 modelos y 12 enums. NO simplificar. Copiar EXACTAMENTE el schema de CLAUDE.md.

Referencia rápida de los modelos a incluir:
1. User (con todos los campos: email, username, password, role, tier, stats, referral, auth tracking)
2. Device (brand, model, slug, specs: screenHz, screenSize, ramGb, panelType, tier, chipset)
3. Sensitivity (deviceId, style, 6 valores principales + 6 gyro opcionales)
4. Favorite (userId, deviceId, style, nickname)
5. SearchHistory (userId, deviceId, style, searchedAt)
6. ActivationCode (code, type, status, createdBy, usedBy)
7. Payment (userId, provider, amount, status, codeType)
8. Subscription (userId, tier, startDate, endDate, paymentId/codeId)
9. Guide (title, slug, category, content, isPremium, isPublished)
10. GuideSection (guideId, title, content, orderIndex, isPremium)
11. Achievement (key, name, description, category, points, requirement JSON)
12. UserAchievement (userId, achievementId, unlockedAt)
13. Tournament (title, status, startDate, endDate, prizeDescription)
14. TournamentEntry (tournamentId, userId, score, rank)
15. SharedConfig (userId, deviceId, style, title, votes)
16. Vote (userId, sharedConfigId, value +1/-1)
17. Comment (userId, content, guideId?, sharedConfigId?, parentId? self-relation)
18. Notification (userId, type, title, message, link, isRead)
19. AdminLog (adminId, action, target, details JSON, ipAddress)

Los 12 enums: UserTier, UserRole, SensitivityStyle, PanelType, DeviceTier, PaymentStatus, PaymentProvider, CodeStatus, CodeType, GuideCategory, TournamentStatus, VoteValue

```
[ARCHIVO] packages/database/src/client.ts
```
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

```
[ARCHIVO] packages/database/src/index.ts
```
```typescript
export { prisma } from './client';
export type {
  User,
  Device,
  Sensitivity,
  Favorite,
  SearchHistory,
  ActivationCode,
  Payment,
  Subscription,
  Guide,
  GuideSection,
  Achievement,
  UserAchievement,
  Tournament,
  TournamentEntry,
  SharedConfig,
  Vote,
  Comment,
  Notification,
  AdminLog,
} from '@prisma/client';

export {
  UserTier,
  UserRole,
  SensitivityStyle,
  PanelType,
  DeviceTier,
  PaymentStatus,
  PaymentProvider,
  CodeStatus,
  CodeType,
  GuideCategory,
  TournamentStatus,
} from '@prisma/client';
```

```
[ARCHIVO] packages/database/prisma/seeds/run-seed.ts
```
```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ARES database...');

  // 1. Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sensibilidadespro.com' },
    update: {},
    create: {
      email: 'admin@sensibilidadespro.com',
      username: 'admin',
      password: adminPassword,
      displayName: 'ARES Admin',
      role: 'ADMIN',
      tier: 'VIP',
      referralCode: 'ARES-ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // 2. Create base achievements
  const achievements = [
    { key: 'FIRST_SEARCH', name: 'Primera Búsqueda', description: 'Genera tu primera sensibilidad', category: 'search', points: 10, requirement: { type: 'count', field: 'totalSearches', value: 1 } },
    { key: 'SEARCHES_10', name: 'Explorador', description: 'Genera 10 sensibilidades', category: 'search', points: 25, requirement: { type: 'count', field: 'totalSearches', value: 10 } },
    { key: 'SEARCHES_50', name: 'Investigador', description: 'Genera 50 sensibilidades', category: 'search', points: 50, requirement: { type: 'count', field: 'totalSearches', value: 50 } },
    { key: 'SEARCHES_100', name: 'Científico', description: 'Genera 100 sensibilidades', category: 'milestone', points: 100, requirement: { type: 'count', field: 'totalSearches', value: 100 } },
    { key: 'FIRST_FAVORITE', name: 'Coleccionista', description: 'Guarda tu primera configuración', category: 'social', points: 10, requirement: { type: 'count', field: 'totalFavorites', value: 1 } },
    { key: 'FAVORITES_10', name: 'Archivista', description: 'Guarda 10 configuraciones', category: 'social', points: 25, requirement: { type: 'count', field: 'totalFavorites', value: 10 } },
    { key: 'FIRST_SHARE', name: 'Difusor', description: 'Comparte tu primera configuración', category: 'social', points: 15, requirement: { type: 'count', field: 'totalShares', value: 1 } },
    { key: 'SHARES_10', name: 'Influencer', description: 'Comparte 10 configuraciones', category: 'social', points: 30, requirement: { type: 'count', field: 'totalShares', value: 10 } },
    { key: 'PREMIUM_MEMBER', name: 'Miembro Premium', description: 'Obtén una cuenta Premium', category: 'premium', points: 50, requirement: { type: 'tier', value: 'PREMIUM' } },
    { key: 'VIP_MEMBER', name: 'Élite VIP', description: 'Obtén una cuenta VIP', category: 'premium', points: 100, requirement: { type: 'tier', value: 'VIP' } },
    { key: 'REFERRAL_1', name: 'Reclutador', description: 'Refiere a tu primer amigo', category: 'social', points: 25, requirement: { type: 'count', field: 'referralCount', value: 1 } },
    { key: 'REFERRAL_5', name: 'Capitán', description: 'Refiere a 5 amigos', category: 'social', points: 75, requirement: { type: 'count', field: 'referralCount', value: 5 } },
    { key: 'ALL_STYLES', name: 'Versátil', description: 'Prueba los 3 estilos de juego', category: 'search', points: 20, requirement: { type: 'styles_tried', value: 3 } },
    { key: 'COMPARE_FIRST', name: 'Analista', description: 'Compara 2 dispositivos por primera vez', category: 'search', points: 15, requirement: { type: 'action', field: 'compare', value: 1 } },
    { key: 'EARLY_ADOPTER', name: 'Early Adopter', description: 'Registrado en los primeros 30 días', category: 'milestone', points: 50, requirement: { type: 'date_before', value: '2026-04-01' } },
    { key: 'NIGHT_OWL', name: 'Búho Nocturno', description: 'Genera sensibilidades después de medianoche', category: 'milestone', points: 15, requirement: { type: 'time_range', value: { start: 0, end: 5 } } },
    { key: 'TOURNAMENT_JOIN', name: 'Competidor', description: 'Participa en tu primer torneo', category: 'social', points: 20, requirement: { type: 'action', field: 'tournament_join', value: 1 } },
    { key: 'GUIDE_READER', name: 'Estudiante', description: 'Lee 5 guías de la academia', category: 'search', points: 20, requirement: { type: 'action', field: 'guides_read', value: 5 } },
    { key: 'CONFIG_SHARED', name: 'Generoso', description: 'Comparte una config en la comunidad', category: 'social', points: 20, requirement: { type: 'action', field: 'config_shared', value: 1 } },
    { key: 'POPULAR_CONFIG', name: 'Popular', description: 'Tu config compartida recibe 10 upvotes', category: 'social', points: 50, requirement: { type: 'action', field: 'config_upvotes', value: 10 } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
  }
  console.log(`  ✅ ${achievements.length} achievements created`);

  console.log('🎯 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Validación:
```bash
# Instalar dependencias del package
cd packages/database && npm install
# Generar Prisma Client
npx prisma generate
# Levantar Docker (PostgreSQL)
cd ../.. && npm run docker:up
# Esperar 5 segundos para que levante
sleep 5
# Ejecutar migration
npm run db:migrate
# Ejecutar seed
npm run db:seed
# Abrir Prisma Studio para verificar
npm run db:studio
```

### Commit: `feat(database): ARES-001 database foundation — 19 models, 12 enums, seed with admin + 20 achievements`

---

## ARES-002-shared-libraries

**Fase:** 0 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-000-genesis, ARES-001-database-foundation
**Descripción:** Crea las 5 librerías compartidas: @ares/types, @ares/utils, @ares/errors, @ares/logger, @ares/config. Cada una es un workspace package con su propio package.json y tsconfig.

### Archivos a crear:

**NOTA IMPORTANTE:** Cada package sigue la misma estructura base:
```
packages/[name]/
  package.json       → { "name": "@ares/[name]", "main": "src/index.ts" }
  tsconfig.json      → extends ../../tsconfig.json
  src/
    index.ts         → barrel exports
    [files].ts       → implementación
```

```
[ARCHIVO] packages/types/package.json
```
```json
{
  "name": "@ares/types",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

```
[ARCHIVO] packages/types/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/types/src/index.ts
```
```typescript
export * from './user.types';
export * from './device.types';
export * from './sensitivity.types';
export * from './payment.types';
export * from './api.types';
export * from './academy.types';
export * from './community.types';
```

```
[ARCHIVO] packages/types/src/user.types.ts
```
```typescript
import type { UserTier, UserRole } from '@prisma/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  tier: UserTier;
  tierExpiresAt: Date | null;
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  referralCode: string | null;
  referralCount: number;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  tier: UserTier;
  tierExpiresAt: Date | null;
}

export interface UserPublic {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  createdAt: Date;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  referralCode?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
```

```
[ARCHIVO] packages/types/src/device.types.ts
```
```typescript
import type { PanelType, DeviceTier } from '@prisma/client';

export interface DeviceInfo {
  id: string;
  brand: string;
  model: string;
  slug: string;
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
  chipset: string | null;
  releaseYear: number | null;
  imageUrl: string | null;
  isPopular: boolean;
}

export interface DeviceSpecs {
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
}

export interface DeviceBrand {
  name: string;
  slug: string;
  count: number;
  iconUrl?: string;
}

export interface DeviceSearchResult {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  isPopular: boolean;
}
```

```
[ARCHIVO] packages/types/src/sensitivity.types.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';

export interface SensitivityValues {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface GyroscopeValues {
  gyroGeneral: number;
  gyroRedPoint: number;
  gyroScope2x: number;
  gyroScope4x: number;
  gyroSniper: number;
  gyroFreeView: number;
}

export interface SensitivityResult {
  deviceId: string;
  deviceName: string;
  style: SensitivityStyle;
  sensitivity: SensitivityValues;
  gyroscope: GyroscopeValues | null;
}

export interface GenerateRequest {
  deviceId: string;
  style: SensitivityStyle;
  includeGyro?: boolean;
}

export interface CompareRequest {
  deviceIdA: string;
  deviceIdB: string;
  style: SensitivityStyle;
}

export interface CompareResult {
  deviceA: SensitivityResult;
  deviceB: SensitivityResult;
  winner: {
    general: 'A' | 'B' | 'TIE';
    overall: 'A' | 'B' | 'TIE';
  };
}
```

```
[ARCHIVO] packages/types/src/payment.types.ts
```
```typescript
import type { CodeType, PaymentProvider, UserTier } from '@prisma/client';

export interface CheckoutRequest {
  codeType: CodeType;
  provider: PaymentProvider;
}

export interface CheckoutResult {
  checkoutUrl: string;
  externalId: string;
  provider: PaymentProvider;
}

export interface ActivationResult {
  success: boolean;
  tier: UserTier;
  expiresAt: Date;
  daysAdded: number;
}

export interface CodeInfo {
  code: string;
  type: CodeType;
  status: string;
  createdAt: Date;
  usedAt: Date | null;
}
```

```
[ARCHIVO] packages/types/src/api.types.ts
```
```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  search?: string;
}
```

```
[ARCHIVO] packages/types/src/academy.types.ts
```
```typescript
import type { GuideCategory } from '@prisma/client';

export interface GuideInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: GuideCategory;
  imageUrl: string | null;
  readTimeMin: number;
  isPremium: boolean;
  viewCount: number;
}

export interface GuideFull extends GuideInfo {
  content: string;
  sections: GuideSection[];
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  isPremium: boolean;
}

export interface TipOfDay {
  id: string;
  title: string;
  content: string;
  category: string;
}
```

```
[ARCHIVO] packages/types/src/community.types.ts
```
```typescript
import type { UserTier, SensitivityStyle, TournamentStatus } from '@prisma/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  tier: UserTier;
  value: number;
}

export interface TournamentInfo {
  id: string;
  title: string;
  description: string | null;
  status: TournamentStatus;
  startDate: Date;
  endDate: Date;
  prizeDescription: string | null;
  maxParticipants: number | null;
  entryTier: UserTier;
  participantCount: number;
}

export interface SharedConfigInfo {
  id: string;
  title: string;
  description: string | null;
  deviceBrand: string;
  deviceModel: string;
  style: SensitivityStyle;
  votes: number;
  authorUsername: string;
  authorTier: UserTier;
  createdAt: Date;
}
```

Ahora las librerías de utilidades:

```
[ARCHIVO] packages/utils/package.json
```
```json
{
  "name": "@ares/utils",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

```
[ARCHIVO] packages/utils/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/utils/src/index.ts
```
```typescript
export * from './format';
export * from './validation';
export * from './device.utils';
export * from './sensitivity.utils';
export * from './tier.utils';
export * from './crypto';
```

```
[ARCHIVO] packages/utils/src/format.ts
```
```typescript
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

export function formatCurrency(centavos: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 30) return `Hace ${diffDays}d`;
  return formatDate(date);
}
```

```
[ARCHIVO] packages/utils/src/validation.ts
```
```typescript
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidActivationCode(code: string): boolean {
  return /^ARES-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}
```

```
[ARCHIVO] packages/utils/src/device.utils.ts
```
```typescript
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
```

```
[ARCHIVO] packages/utils/src/sensitivity.utils.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';

export function formatSensitivity(value: number): string {
  return Math.round(value).toString();
}

export function clampValue(value: number, min = 1, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function getStyleColor(style: SensitivityStyle): string {
  const colors: Record<SensitivityStyle, string> = {
    AGGRESSIVE: '#ef4444',
    BALANCED: '#3b82f6',
    SNIPER: '#22c55e',
  };
  return colors[style];
}

export function getStyleLabel(style: SensitivityStyle): string {
  const labels: Record<SensitivityStyle, string> = {
    AGGRESSIVE: 'Agresivo',
    BALANCED: 'Balanceado',
    SNIPER: 'Francotirador',
  };
  return labels[style];
}

export function getStyleIcon(style: SensitivityStyle): string {
  const icons: Record<SensitivityStyle, string> = {
    AGGRESSIVE: '⚔️',
    BALANCED: '🎯',
    SNIPER: '🔭',
  };
  return icons[style];
}

export function getStyleDescription(style: SensitivityStyle): string {
  const descriptions: Record<SensitivityStyle, string> = {
    AGGRESSIVE: 'Para jugadores rush. Sensibilidades altas para movimientos rápidos.',
    BALANCED: 'Equilibrio perfecto. Ideal para la mayoría de jugadores.',
    SNIPER: 'Para francotiradores. Prioriza precisión con scopes.',
  };
  return descriptions[style];
}
```

```
[ARCHIVO] packages/utils/src/tier.utils.ts
```
```typescript
import type { UserTier } from '@prisma/client';

export function canAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierLevel: Record<UserTier, number> = {
    FREE: 0,
    PREMIUM: 1,
    VIP: 2,
  };
  return tierLevel[userTier] >= tierLevel[requiredTier];
}

export function isFeatureAvailable(
  userTier: UserTier,
  feature: string,
): boolean {
  const freeFeatures = ['generate_balanced', 'search_basic', 'favorites_3', 'history_10'];
  const premiumFeatures = [...freeFeatures, 'generate_all_styles', 'gyroscope', 'compare', 'export', 'favorites_unlimited', 'history_unlimited', 'search_unlimited', 'academy_15'];
  const vipFeatures = [...premiumFeatures, 'no_ads', 'vip_tournaments', 'vip_themes', 'academy_all', 'priority_support', 'vip_badge'];

  const featureMap: Record<UserTier, string[]> = {
    FREE: freeFeatures,
    PREMIUM: premiumFeatures,
    VIP: vipFeatures,
  };

  return featureMap[userTier].includes(feature);
}

export function getTierLabel(tier: UserTier): string {
  const labels: Record<UserTier, string> = {
    FREE: 'Gratis',
    PREMIUM: 'Premium ⭐',
    VIP: 'VIP 👑',
  };
  return labels[tier];
}

export function getTierColor(tier: UserTier): string {
  const colors: Record<UserTier, string> = {
    FREE: '#94a3b8',
    PREMIUM: '#f59e0b',
    VIP: '#a855f7',
  };
  return colors[tier];
}
```

```
[ARCHIVO] packages/utils/src/crypto.ts
```
```typescript
import { randomBytes } from 'crypto';

// Caracteres sin ambiguedad (sin O/0/I/1/l)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateActivationCode(): string {
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = randomBytes(1)[0] % CODE_CHARS.length;
      segment += CODE_CHARS[randomIndex];
    }
    segments.push(segment);
  }
  return `ARES-${segments.join('-')}`;
}

export function generateReferralCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = randomBytes(1)[0] % CODE_CHARS.length;
    code += CODE_CHARS[randomIndex];
  }
  return code;
}
```

Ahora @ares/errors:

```
[ARCHIVO] packages/errors/package.json
```
```json
{
  "name": "@ares/errors",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

```
[ARCHIVO] packages/errors/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/errors/src/index.ts
```
```typescript
export { AresError } from './base.error';
export {
  NotFoundError,
  AuthError,
  ForbiddenError,
  BusinessError,
  RateLimitError,
  ValidationError,
} from './errors';
export { handleApiError, formatErrorResponse } from './error-handler';
```

```
[ARCHIVO] packages/errors/src/base.error.ts
```
```typescript
export class AresError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'AresError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
```

```
[ARCHIVO] packages/errors/src/errors.ts
```
```typescript
import { AresError } from './base.error';

export class NotFoundError extends AresError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} not found: ${id}` : `${resource} not found`,
      404,
    );
    this.name = 'NotFoundError';
  }
}

export class AuthError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 401);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AresError {
  constructor(message = 'No tienes permisos para esta acción') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class BusinessError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 422);
    this.name = 'BusinessError';
  }
}

export class RateLimitError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AresError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}
```

```
[ARCHIVO] packages/errors/src/error-handler.ts
```
```typescript
import { NextResponse } from 'next/server';

import { AresError } from './base.error';

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AresError) {
    return NextResponse.json(
      {
        success: false,
        error: error.toJSON(),
      },
      { status: error.statusCode },
    );
  }

  // Error desconocido
  const message = error instanceof Error ? error.message : 'Error interno del servidor';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
        statusCode: 500,
      },
    },
    { status: 500 },
  );
}

export function formatErrorResponse(code: string, message: string, statusCode: number) {
  return {
    success: false as const,
    error: { code, message, statusCode },
  };
}
```

Ahora @ares/logger:

```
[ARCHIVO] packages/logger/package.json
```
```json
{
  "name": "@ares/logger",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

```
[ARCHIVO] packages/logger/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/logger/src/index.ts
```
```typescript
export { logger } from './logger';
```

```
[ARCHIVO] packages/logger/src/logger.ts
```
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function createLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
}

function output(entry: LogEntry): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const prefix = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
    }[entry.level];

    const msg = `${prefix} [${entry.timestamp.slice(11, 19)}] ${entry.message}`;
    if (entry.data) {
      // eslint-disable-next-line no-console
      console.error(msg, JSON.stringify(entry.data, null, 2));
    } else {
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  } else {
    // Production: structured JSON to stderr
    process.stderr.write(JSON.stringify(entry) + '\n');
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('debug', message, data)),

  info: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('info', message, data)),

  warn: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('warn', message, data)),

  error: (message: string, data?: Record<string, unknown>) =>
    output(createLogEntry('error', message, data)),
};
```

Ahora @ares/config:

```
[ARCHIVO] packages/config/package.json
```
```json
{
  "name": "@ares/config",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

```
[ARCHIVO] packages/config/tsconfig.json
```
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

```
[ARCHIVO] packages/config/src/index.ts
```
```typescript
export { env, validateEnv } from './env';
export * from './constants';
```

```
[ARCHIVO] packages/config/src/env.ts
```
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Sensibilidades PRO'),
  RATE_LIMIT_FREE: z.coerce.number().default(5),
  RATE_LIMIT_PREMIUM: z.coerce.number().default(9999),
  RATE_LIMIT_WINDOW: z.coerce.number().default(86400),
  MP_PUBLIC_KEY: z.string().optional(),
  MP_ACCESS_TOKEN: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`❌ Invalid environment variables:\n${errors}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    const validated = validateEnv();
    return validated[prop as keyof Env];
  },
});
```

```
[ARCHIVO] packages/config/src/constants.ts
```
```typescript
// ══════════════════════════════════════════════════════════
// ARES — Constantes globales del proyecto
// ══════════════════════════════════════════════════════════

// App
export const APP_NAME = 'Sensibilidades PRO';
export const APP_CODENAME = 'ARES';
export const APP_DOMAIN = 'sensibilidadespro.com';

// Sensitivity ranges
export const SENSITIVITY_MIN = 1;
export const SENSITIVITY_MAX = 100;

// Tier limits
export const FREE_SEARCH_LIMIT = 5;
export const FREE_FAVORITE_LIMIT = 3;
export const FREE_HISTORY_LIMIT = 10;
export const FREE_BRANDS = ['Samsung', 'Apple', 'Redmi'];
export const FREE_STYLES = ['BALANCED'] as const;

// Pricing (centavos MXN)
export const PREMIUM_MONTHLY_PRICE = 4900;    // $49 MXN
export const PREMIUM_ANNUAL_PRICE = 39900;    // $399 MXN
export const VIP_MONTHLY_PRICE = 9900;        // $99 MXN
export const VIP_ANNUAL_PRICE = 79900;        // $799 MXN

// Code format
export const CODE_PREFIX = 'ARES';
export const CODE_SEGMENT_LENGTH = 4;
export const CODE_SEGMENTS = 3;

// Durations (days)
export const TIER_DURATIONS: Record<string, number> = {
  PREMIUM_30: 30,
  PREMIUM_90: 90,
  PREMIUM_365: 365,
  VIP_30: 30,
  VIP_90: 90,
  VIP_365: 365,
};

// Referral reward
export const REFERRAL_REWARD_DAYS = 7;
export const REFERRAL_REWARD_TIER = 'PREMIUM';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const RATE_LIMIT_WINDOW_SECONDS = 86400; // 24 hours

// Sensitivity algorithm base values
export const BASE_SENSITIVITY = {
  general: 50,
  redPoint: 45,
  scope2x: 40,
  scope4x: 35,
  sniperScope: 30,
  freeView: 55,
} as const;

// Gyroscope base factor
export const GYRO_BASE_FACTOR = 0.50;
export const GYRO_PANEL_BONUS = 0.05;     // AMOLED/OLED
export const GYRO_GAMING_BONUS = 0.08;    // GAMING tier
```

### Validación:
```bash
# Verificar que todos los packages existen
ls packages/types/package.json packages/utils/package.json packages/errors/package.json packages/logger/package.json packages/config/package.json
# Instalar dependencias
npm install
# Verificar TypeScript compila
npx tsc --noEmit
# Verificar no hay 'any'
grep -r ": any\b" packages/ --include="*.ts" | grep -v node_modules | grep -v ".d.ts"
```

### Commit: `feat(libs): ARES-002 shared libraries — @ares/types, utils, errors, logger, config`

---


## ARES-003-auth-system

**Fase:** 0 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-000, ARES-001, ARES-002
**Descripción:** Implementa NextAuth v5 con CredentialsProvider, server actions de login/registro, middleware de protección de rutas, y páginas de login/registro con diseño gaming.

### Archivos a crear:

```
[ARCHIVO] src/lib/auth/auth.config.ts
```
```typescript
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            password: true,
            role: true,
            tier: true,
            tierExpiresAt: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          logger.warn('Login failed: user not found or inactive', { email: parsed.data.email });
          return null;
        }

        const passwordMatch = await compare(parsed.data.password, user.password);
        if (!passwordMatch) {
          logger.warn('Login failed: invalid password', { email: parsed.data.email });
          return null;
        }

        // Check if tier expired
        if (user.tierExpiresAt && user.tierExpiresAt < new Date() && user.tier !== 'FREE') {
          await prisma.user.update({
            where: { id: user.id },
            data: { tier: 'FREE', tierExpiresAt: null },
          });
          user.tier = 'FREE';
          user.tierExpiresAt = null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        logger.info('User logged in', { userId: user.id, email: user.email });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          image: user.avatarUrl,
          username: user.username,
          role: user.role,
          tier: user.tier,
          tierExpiresAt: user.tierExpiresAt?.toISOString() ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as Record<string, unknown>).username as string;
        token.role = (user as Record<string, unknown>).role as string;
        token.tier = (user as Record<string, unknown>).tier as string;
        token.tierExpiresAt = (user as Record<string, unknown>).tierExpiresAt as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as Record<string, unknown>).username = token.username;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).tier = token.tier;
        (session.user as Record<string, unknown>).tierExpiresAt = token.tierExpiresAt;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

```
[ARCHIVO] src/lib/auth/index.ts
```
```typescript
import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
```

```
[ARCHIVO] src/lib/auth/auth.types.ts
```
```typescript
import type { UserRole, UserTier } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      username: string;
      role: UserRole;
      tier: UserTier;
      tierExpiresAt: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
    tier: string;
    tierExpiresAt: string | null;
  }
}
```

```
[ARCHIVO] src/lib/auth/auth.actions.ts
```
```typescript
'use server';

import { hash } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { BusinessError, AuthError, ValidationError } from '@ares/errors';
import { logger } from '@ares/logger';
import { generateReferralCode } from '@ares/utils';

import { signIn } from './index';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export async function registerUser(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
    referralCode: formData.get('referralCode') || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
    throw new ValidationError(firstError);
  }

  const { email, username, password, referralCode } = parsed.data;

  // Check unique email
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new BusinessError('EMAIL_TAKEN', 'Este email ya está registrado');
  }

  // Check unique username
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new BusinessError('USERNAME_TAKEN', 'Este nombre de usuario ya está en uso');
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Handle referral
  let referredById: string | null = null;
  if (referralCode) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode, isActive: true },
    });
    if (referrer) {
      referredById = referrer.id;
    }
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      displayName: username,
      referralCode: generateReferralCode(),
      referredById,
      isActive: true,
    },
  });

  // If referred, reward the referrer
  if (referredById) {
    await prisma.user.update({
      where: { id: referredById },
      data: { referralCount: { increment: 1 } },
    });
    logger.info('Referral rewarded', { referrerId: referredById, newUserId: user.id });
  }

  logger.info('User registered', { userId: user.id, email: user.email });

  // Auto sign in
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  return { success: true, userId: user.id };
}

export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError('Email y contraseña son requeridos');
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch {
    throw new AuthError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }
}
```

```
[ARCHIVO] src/lib/auth/auth.middleware.ts
```
```typescript
import type { UserRole, UserTier } from '@prisma/client';

import { AuthError, ForbiddenError } from '@ares/errors';

import { auth } from './index';

export async function getRequiredSession() {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError('UNAUTHORIZED', 'Debes iniciar sesión');
  }

  return session;
}

export async function getOptionalSession() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireRole(role: UserRole) {
  const session = await getRequiredSession();
  const userRole = session.user.role as UserRole;

  if (userRole !== role && userRole !== 'ADMIN') {
    throw new ForbiddenError('No tienes permisos para esta acción');
  }

  return session;
}

export async function requireTier(requiredTier: UserTier) {
  const session = await getRequiredSession();
  const userTier = session.user.tier as UserTier;

  const tierLevel: Record<UserTier, number> = {
    FREE: 0,
    PREMIUM: 1,
    VIP: 2,
  };

  if (tierLevel[userTier] < tierLevel[requiredTier]) {
    throw new ForbiddenError(
      `Necesitas ser ${requiredTier} para acceder a esta función`,
    );
  }

  return session;
}
```

```
[ARCHIVO] src/app/api/auth/[...nextauth]/route.ts
```
```typescript
import { GET, POST } from '@/lib/auth';

export { GET, POST };
```

```
[ARCHIVO] src/app/(auth)/layout.tsx
```
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(255, 106, 0, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(0, 200, 255, 0.08) 0%, transparent 50%),
            #050810
          `,
        }}
      />
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
```

```
[ARCHIVO] src/app/(auth)/login/page.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { loginUser } from '@/lib/auth/auth.actions';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await loginUser(formData);
      router.push('/generator');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-fire-ice">
          Iniciar Sesión
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Accede a tu cuenta de Sensibilidades PRO
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-gaming bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gaming w-full bg-gradient-fire-ice text-white font-bold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Entrando...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-fire-500 hover:text-fire-400 font-medium">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
```

```
[ARCHIVO] src/app/(auth)/register/page.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { registerUser } from '@/lib/auth/auth.actions';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get('ref') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await registerUser(formData);
      router.push('/generator');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-fire-ice">
          Crear Cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Únete a la comunidad #1 de Free Fire
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-gaming bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Nombre de usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="tu_username"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres</p>
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Código de referido <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="referralCode"
            name="referralCode"
            type="text"
            defaultValue={referralFromUrl}
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-ice-500/50 focus:outline-none focus:ring-1 focus:ring-ice-500/30 min-h-[44px]"
            placeholder="Código de un amigo"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gaming w-full bg-gradient-fire-ice text-white font-bold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creando cuenta...
            </span>
          ) : (
            'Crear Cuenta Gratis'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-ice-500 hover:text-ice-400 font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
grep -r ": any\b" src/lib/auth/ --include="*.ts" | grep -v node_modules
ls src/lib/auth/auth.config.ts src/lib/auth/auth.actions.ts src/lib/auth/auth.middleware.ts src/lib/auth/index.ts src/lib/auth/auth.types.ts
ls src/app/api/auth/\[...nextauth\]/route.ts
ls src/app/\(auth\)/layout.tsx src/app/\(auth\)/login/page.tsx src/app/\(auth\)/register/page.tsx
```

### Commit: `feat(auth): ARES-003 auth system — NextAuth v5, login/register pages, route protection`

---

## ARES-004-design-system

**Fase:** 0 | **Prioridad:** ALTO
**Dependencias:** ARES-000, ARES-003
**Descripción:** Crea los 15+ componentes UI del design system gaming, layout components (navbar, footer, mobile nav), effects, y el wrapper de providers.

### Archivos a crear:

```
[ARCHIVO] src/lib/cn.ts
```
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```
[ARCHIVO] src/components/ui/button.tsx
```
```tsx
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'premium' | 'vip' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-fire-ice text-white hover:opacity-90 shadow-glow-fire',
  secondary: 'bg-ice-500/10 text-ice-400 border border-ice-500/30 hover:bg-ice-500/20',
  premium: 'bg-gradient-premium text-white hover:opacity-90 shadow-glow-premium',
  vip: 'bg-gradient-vip text-white hover:opacity-90 shadow-glow-vip',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px]',
  md: 'px-5 py-2.5 text-sm min-h-[44px]',
  lg: 'px-8 py-3.5 text-base min-h-[52px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'btn-gaming',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
```

```
[ARCHIVO] src/components/ui/card.tsx
```
```tsx
import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'glow' | 'solid';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'glass',
  glow: 'glass-hover',
  solid: 'bg-background-elevated border border-white/5 rounded-gaming',
};

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}
```

```
[ARCHIVO] src/components/ui/input.tsx
```
```tsx
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-gaming bg-background-card border px-4 py-3 text-sm text-white',
              'placeholder-slate-500 transition-colors min-h-[44px]',
              'focus:outline-none focus:ring-1',
              error
                ? 'border-danger/50 focus:border-danger focus:ring-danger/30'
                : 'border-white/10 focus:border-fire-500/50 focus:ring-fire-500/30',
              icon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
```

```
[ARCHIVO] src/components/ui/badge.tsx
```
```tsx
import { cn } from '@/lib/cn';

type BadgeVariant = 'free' | 'premium' | 'vip' | 'aggressive' | 'balanced' | 'sniper' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  free: 'badge-free',
  premium: 'badge-premium shadow-glow-premium',
  vip: 'badge-vip shadow-glow-vip',
  aggressive: 'badge-aggressive',
  balanced: 'badge-balanced',
  sniper: 'badge-sniper',
  default: 'bg-white/5 text-slate-400 border border-white/10',
};

export function Badge({ variant = 'default', size = 'sm', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-ui font-semibold uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

```
[ARCHIVO] src/components/ui/modal.tsx
```
```tsx
'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full glass p-6 animate-scale-in',
          sizeClasses[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors touch-target"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/components/ui/progress.tsx
```
```tsx
import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'fire' | 'ice' | 'gradient' | 'success';
  className?: string;
}

const colorClasses = {
  fire: 'bg-fire-500',
  ice: 'bg-ice-500',
  gradient: 'bg-gradient-fire-ice',
  success: 'bg-success',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-5',
};

export function Progress({ value, max = 100, size = 'md', showLabel, color = 'gradient', className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-ui text-slate-400">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-white/5 overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/components/ui/skeleton.tsx
```
```tsx
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'rect';
}

const variantDefaults = {
  text: 'h-4 w-full rounded',
  card: 'h-40 w-full rounded-gaming',
  avatar: 'h-10 w-10 rounded-full',
  rect: 'h-20 w-full rounded-gaming',
};

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer bg-white/5',
        variantDefaults[variant],
        className,
      )}
    />
  );
}
```

```
[ARCHIVO] src/components/ui/tabs.tsx
```
```tsx
'use client';

import { cn } from '@/lib/cn';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-gaming bg-background-card border border-white/5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'text-sm font-ui font-medium transition-all min-h-[44px]',
            activeTab === tab.key
              ? 'bg-fire-500/10 text-fire-400 border border-fire-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5',
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

```
[ARCHIVO] src/components/ui/toast.tsx
```
```tsx
'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-success/30 bg-success/10',
  error: 'border-danger/30 bg-danger/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-info/30 bg-info/10',
};

const typeIcons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 rounded-gaming border p-4 animate-slide-up backdrop-blur-lg',
              typeClasses[t.type],
            )}
          >
            <span>{typeIcons[t.type]}</span>
            <p className="flex-1 text-sm text-white">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

```
[ARCHIVO] src/components/ui/tooltip.tsx
```
```tsx
'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-xs text-white bg-background-elevated border border-white/10 rounded-lg whitespace-nowrap animate-fade-in',
            side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : 'top-full left-1/2 -translate-x-1/2 mt-2',
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
```

```
[ARCHIVO] src/components/ui/select.tsx
```
```tsx
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-gaming bg-background-card border px-4 py-3 pr-10 text-sm text-white',
              'transition-colors min-h-[44px] focus:outline-none focus:ring-1',
              error
                ? 'border-danger/50 focus:border-danger focus:ring-danger/30'
                : 'border-white/10 focus:border-fire-500/50 focus:ring-fire-500/30',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background-card">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
```

```
[ARCHIVO] src/components/ui/toggle.tsx
```
```tsx
'use client';

import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-fire-500 shadow-glow-fire' : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  );
}
```

```
[ARCHIVO] src/components/ui/index.ts
```
```typescript
export { Button } from './button';
export { Card, CardHeader, CardContent } from './card';
export { Input } from './input';
export { Select } from './select';
export { Badge } from './badge';
export { Modal } from './modal';
export { ToastProvider, useToast } from './toast';
export { Skeleton } from './skeleton';
export { Progress } from './progress';
export { Tooltip } from './tooltip';
export { Tabs } from './tabs';
export { Toggle } from './toggle';
```

```
[ARCHIVO] src/components/layout/navbar.tsx
```
```tsx
import Link from 'next/link';
import { Zap } from 'lucide-react';

import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const tier = (user as Record<string, unknown> | undefined)?.tier as string | undefined;

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-fire-500" />
          <span className="font-display font-bold text-lg text-gradient-fire-ice">
            SensiPRO
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/generator" className="text-sm text-slate-400 hover:text-white transition-colors">
            Generador
          </Link>
          <Link href="/academy" className="text-sm text-slate-400 hover:text-white transition-colors">
            Academia
          </Link>
          <Link href="/community" className="text-sm text-slate-400 hover:text-white transition-colors">
            Comunidad
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {tier && tier !== 'FREE' && (
                <Badge variant={tier.toLowerCase() as 'premium' | 'vip'}>
                  {tier}
                </Badge>
              )}
              <Link
                href="/profile"
                className="h-8 w-8 rounded-full bg-gradient-fire-ice flex items-center justify-center text-xs font-bold text-white"
              >
                {(user.name ?? 'U')[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-gaming bg-gradient-fire-ice text-white text-sm px-4 py-2"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

```
[ARCHIVO] src/components/layout/footer.tsx
```
```tsx
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-fire-500" />
              <span className="font-display font-bold text-gradient-fire-ice">SensiPRO</span>
            </div>
            <p className="text-xs text-slate-500 max-w-[200px]">
              Generador de sensibilidades #1 para Free Fire. Basado en hardware real.
            </p>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Producto</h4>
            <div className="flex flex-col gap-2">
              <Link href="/generator" className="text-xs text-slate-500 hover:text-white transition-colors">Generador</Link>
              <Link href="/academy" className="text-xs text-slate-500 hover:text-white transition-colors">Academia</Link>
              <Link href="/pricing" className="text-xs text-slate-500 hover:text-white transition-colors">Precios</Link>
            </div>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Comunidad</h4>
            <div className="flex flex-col gap-2">
              <Link href="/leaderboard" className="text-xs text-slate-500 hover:text-white transition-colors">Rankings</Link>
              <Link href="/tournaments" className="text-xs text-slate-500 hover:text-white transition-colors">Torneos</Link>
              <Link href="/shared" className="text-xs text-slate-500 hover:text-white transition-colors">Configs</Link>
            </div>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">Privacidad</Link>
              <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">Términos</Link>
              <Link href="/contact" className="text-xs text-slate-500 hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Sensibilidades PRO. Hecho en 🇲🇽 Cancún, México.
        </div>
      </div>
    </footer>
  );
}
```

```
[ARCHIVO] src/components/layout/mobile-nav.tsx
```
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, BookOpen, Users, User } from 'lucide-react';

import { cn } from '@/lib/cn';

const navItems = [
  { href: '/generator', label: 'Generar', icon: Zap },
  { href: '/academy', label: 'Academia', icon: BookOpen },
  { href: '/community', label: 'Comunidad', icon: Users },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[64px] min-h-[44px] rounded-lg transition-colors',
                isActive ? 'text-fire-500' : 'text-slate-500 active:text-white',
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-ui">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

```
[ARCHIVO] src/components/effects/count-up.tsx
```
```tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CountUp({ end, duration = 1000, className, suffix }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.round(end * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
```

```
[ARCHIVO] src/components/providers.tsx
```
```tsx
'use client';

import { SessionProvider } from 'next-auth/react';

import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
grep -r ": any\b" src/components/ --include="*.ts" --include="*.tsx" | grep -v node_modules
ls src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/input.tsx src/components/ui/badge.tsx src/components/ui/modal.tsx src/components/ui/toast.tsx src/components/ui/progress.tsx src/components/ui/skeleton.tsx src/components/ui/tabs.tsx src/components/ui/tooltip.tsx src/components/ui/select.tsx src/components/ui/toggle.tsx src/components/ui/index.ts
ls src/components/layout/navbar.tsx src/components/layout/footer.tsx src/components/layout/mobile-nav.tsx
ls src/components/effects/count-up.tsx
ls src/components/providers.tsx src/lib/cn.ts
```

### Commit: `feat(ui): ARES-004 design system — 12 gaming components, layout, effects, providers`

---

## ARES-005-infra-docker

**Fase:** 0 | **Prioridad:** MEDIO
**Dependencias:** ARES-000
**Descripción:** Docker Compose para desarrollo con PostgreSQL 16 y Redis 7. Script de setup completo de base de datos y entorno.

### Archivos a crear:

```
[ARCHIVO] infrastructure/docker/docker-compose.dev.yml
```
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ares-postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: ares
      POSTGRES_PASSWORD: ares
      POSTGRES_DB: ares_dev
    volumes:
      - ares-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ares -d ares_dev']
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ares-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - ares-redis-data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  ares-postgres-data:
  ares-redis-data:
```

```
[ARCHIVO] scripts/setup.sh
```
```bash
#!/bin/bash
set -e

echo ""
echo "🎮 ═══════════════════════════════════════════════════════"
echo "   ARES SensiPRO — Setup Completo"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Check prerequisites
echo "📋 Verificando requisitos..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js no instalado. Requiere v20+"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 20 ]; then
  echo "❌ Node.js v20+ requerido (tienes v$(node -v))"
  exit 1
fi
echo "  ✅ Node.js $(node -v)"

if ! command -v docker &> /dev/null; then
  echo "❌ Docker no instalado"
  exit 1
fi
echo "  ✅ Docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

if ! command -v git &> /dev/null; then
  echo "❌ Git no instalado"
  exit 1
fi
echo "  ✅ Git $(git --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

echo ""

# 2. Docker services
echo "🐳 Levantando PostgreSQL y Redis..."
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
for i in {1..15}; do
  if docker compose -f infrastructure/docker/docker-compose.dev.yml ps | grep -q "healthy"; then
    break
  fi
  sleep 1
done
sleep 2

echo "  ✅ PostgreSQL: localhost:5432 (ares/ares)"
echo "  ✅ Redis: localhost:6379"
echo ""

# 3. Environment
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  # Generate random NEXTAUTH_SECRET
  SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/genera-un-string-random-de-al-menos-32-caracteres/${SECRET}/" .env.local
  else
    sed -i "s/genera-un-string-random-de-al-menos-32-caracteres/${SECRET}/" .env.local
  fi
  echo "  ✅ .env.local creado con NEXTAUTH_SECRET generado"
else
  echo "  ℹ️  .env.local ya existe, no se sobreescribe"
fi
echo ""

# 4. Dependencies
echo "📦 Instalando dependencias..."
npm install
echo "  ✅ Dependencias instaladas"
echo ""

# 5. Prisma
echo "🗄️  Configurando base de datos..."
npm run db:generate
npm run db:migrate -- --name init
echo "  ✅ Prisma Client generado y migraciones aplicadas"
echo ""

# 6. Seed
echo "🌱 Sembrando datos iniciales..."
npm run db:seed
echo "  ✅ Admin + achievements creados"
echo ""

# 7. Verify
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit && echo "  ✅ TypeScript compila sin errores" || echo "  ⚠️  TypeScript tiene errores"
echo ""

# 8. Done
echo "🎯 ═══════════════════════════════════════════════════════"
echo "   ¡Setup completo! Para iniciar:"
echo ""
echo "   npm run dev          → Servidor de desarrollo"
echo "   npm run db:studio    → Prisma Studio (ver BD)"
echo "   npm test             → Correr tests"
echo "═══════════════════════════════════════════════════════"
echo ""
```

```
[ARCHIVO] scripts/db-reset.sh
```
```bash
#!/bin/bash
set -e

echo "🗄️  Reseteando base de datos ARES..."
echo "⚠️  Esto borrará TODOS los datos."
echo ""
read -p "¿Continuar? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Cancelado."
  exit 0
fi

npm run db:reset
npm run db:seed

echo ""
echo "✅ Base de datos reseteada y seed aplicado."
```

### Validación:
```bash
chmod +x scripts/setup.sh scripts/db-reset.sh
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
sleep 5
docker compose -f infrastructure/docker/docker-compose.dev.yml ps
# Ambos servicios deben estar healthy
```

### Commit: `feat(infra): ARES-005 Docker — PostgreSQL 16 + Redis 7 + setup/reset scripts`

---

## ARES-006-testing-framework

**Fase:** 0 | **Prioridad:** MEDIO
**Dependencias:** ARES-000, ARES-001, ARES-002
**Descripción:** Configura Vitest con factories de test data, global setup, y primeras pruebas unitarias para las librerías compartidas (mínimo 15 tests pasando).

### Archivos a crear:

```
[ARCHIVO] tests/setup.ts
```
```typescript
import { beforeAll, afterAll } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ares_test';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.NEXTAUTH_SECRET = 'test-secret-that-is-at-least-32-chars-long';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.NEXT_PUBLIC_APP_NAME = 'Sensibilidades PRO Test';
  process.env.RATE_LIMIT_FREE = '5';
  process.env.RATE_LIMIT_PREMIUM = '9999';
  process.env.RATE_LIMIT_WINDOW = '86400';
});

afterAll(() => {
  // Cleanup
});
```

```
[ARCHIVO] tests/factories/index.ts
```
```typescript
export { createTestUser, createTestUserSession } from './user.factory';
export { createTestDevice } from './device.factory';
export { createTestSensitivity } from './sensitivity.factory';
```

```
[ARCHIVO] tests/factories/user.factory.ts
```
```typescript
import type { User, UserTier, UserRole } from '@prisma/client';

let counter = 0;

export function createTestUser(overrides?: Partial<User>): User {
  counter++;
  return {
    id: `user-${counter}-${Date.now()}`,
    email: `testuser${counter}@test.com`,
    username: `testuser${counter}`,
    displayName: `Test User ${counter}`,
    avatarUrl: null,
    bio: null,
    password: '$2a$12$hashedpassword',
    role: 'USER' as UserRole,
    tier: 'FREE' as UserTier,
    tierExpiresAt: null,
    totalSearches: 0,
    totalFavorites: 0,
    totalShares: 0,
    referralCode: `REF${counter}CODE`,
    referralCount: 0,
    referredById: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestUserSession(overrides?: Record<string, unknown>) {
  counter++;
  return {
    id: `user-${counter}`,
    email: `testuser${counter}@test.com`,
    username: `testuser${counter}`,
    displayName: `Test User ${counter}`,
    avatarUrl: null,
    role: 'USER',
    tier: 'FREE',
    tierExpiresAt: null,
    ...overrides,
  };
}
```

```
[ARCHIVO] tests/factories/device.factory.ts
```
```typescript
import type { Device, PanelType, DeviceTier } from '@prisma/client';

let counter = 0;

export function createTestDevice(overrides?: Partial<Device>): Device {
  counter++;
  return {
    id: `device-${counter}-${Date.now()}`,
    brand: 'Samsung',
    model: `Galaxy A${counter + 10}`,
    slug: `samsung-galaxy-a${counter + 10}`,
    screenHz: 90,
    screenSize: 6.5,
    ramGb: 4,
    panelType: 'AMOLED' as PanelType,
    tier: 'MID' as DeviceTier,
    chipset: 'Exynos 1280',
    releaseYear: 2024,
    imageUrl: null,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

```
[ARCHIVO] tests/factories/sensitivity.factory.ts
```
```typescript
import type { SensitivityStyle } from '@prisma/client';
import type { SensitivityResult, SensitivityValues, GyroscopeValues } from '@ares/types';

let counter = 0;

export function createTestSensitivity(overrides?: Partial<SensitivityResult>): SensitivityResult {
  counter++;
  const defaultValues: SensitivityValues = {
    general: 55,
    redPoint: 50,
    scope2x: 45,
    scope4x: 40,
    sniperScope: 35,
    freeView: 60,
  };

  const defaultGyro: GyroscopeValues = {
    gyroGeneral: 28,
    gyroRedPoint: 25,
    gyroScope2x: 22,
    gyroScope4x: 20,
    gyroSniper: 18,
    gyroFreeView: 30,
  };

  return {
    deviceId: `device-${counter}`,
    deviceName: `Samsung Galaxy A${counter + 10}`,
    style: 'BALANCED' as SensitivityStyle,
    sensitivity: { ...defaultValues },
    gyroscope: { ...defaultGyro },
    ...overrides,
  };
}
```

```
[ARCHIVO] packages/utils/src/__tests__/format.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { formatNumber, formatCurrency, slugify, truncate, formatRelativeTime } from '../format';

describe('formatNumber', () => {
  it('formats integers with locale separators', () => {
    expect(formatNumber(1000)).toContain('1');
    expect(formatNumber(1000000)).toContain('1');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatCurrency', () => {
  it('converts centavos to MXN', () => {
    const result = formatCurrency(4900);
    expect(result).toContain('49');
  });

  it('handles zero centavos', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('slugify', () => {
  it('converts text to URL-safe slug', () => {
    expect(slugify('Samsung Galaxy A54')).toBe('samsung-galaxy-a54');
  });

  it('handles accented characters', () => {
    expect(slugify('Guía de Configuración')).toBe('guia-de-configuracion');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('---test---')).toBe('test');
  });
});

describe('truncate', () => {
  it('returns full text if under max length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('this is a very long text', 10)).toBe('this is...');
  });
});

describe('formatRelativeTime', () => {
  it('returns "Hace un momento" for very recent', () => {
    expect(formatRelativeTime(new Date())).toBe('Hace un momento');
  });

  it('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('Hace 5m');
  });

  it('returns hours for same-day times', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('Hace 2h');
  });

  it('returns days for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('Hace 3d');
  });
});
```

```
[ARCHIVO] packages/utils/src/__tests__/validation.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { isValidEmail, isValidUsername, isValidPassword, isValidActivationCode } from '../validation';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('isValidUsername', () => {
  it('accepts valid usernames', () => {
    expect(isValidUsername('alex123')).toBe(true);
    expect(isValidUsername('pro_gamer')).toBe(true);
    expect(isValidUsername('XxX')).toBe(true);
  });

  it('rejects too short', () => {
    expect(isValidUsername('ab')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidUsername('user@name')).toBe(false);
    expect(isValidUsername('user name')).toBe(false);
    expect(isValidUsername('user-name')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts 6+ characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('strongpassword')).toBe(true);
  });

  it('rejects less than 6', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('isValidActivationCode', () => {
  it('accepts valid ARES codes', () => {
    expect(isValidActivationCode('ARES-ABCD-EFGH-JKLM')).toBe(true);
    expect(isValidActivationCode('ARES-2345-6789-WXYZ')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidActivationCode('ARES-ABC-DEF-GHI')).toBe(false);
    expect(isValidActivationCode('ATLAS-ABCD-EFGH-JKLM')).toBe(false);
    expect(isValidActivationCode('ARES-abcd-efgh-jklm')).toBe(false);
    expect(isValidActivationCode('random-text')).toBe(false);
    expect(isValidActivationCode('')).toBe(false);
  });
});
```

```
[ARCHIVO] packages/errors/src/__tests__/errors.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { NotFoundError, AuthError, BusinessError, RateLimitError, ForbiddenError, ValidationError, AresError } from '../index';

describe('AresError base', () => {
  it('has correct properties', () => {
    const error = new AresError('TEST_ERROR', 'Test message', 400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AresError');
  });

  it('serializes to JSON', () => {
    const error = new AresError('ERR', 'msg', 500);
    const json = error.toJSON();
    expect(json).toEqual({ code: 'ERR', message: 'msg', statusCode: 500 });
  });

  it('is instanceof Error', () => {
    const error = new AresError('ERR', 'msg', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AresError);
  });
});

describe('NotFoundError', () => {
  it('has 404 status', () => {
    const error = new NotFoundError('Device');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Device not found');
  });

  it('includes id when provided', () => {
    const error = new NotFoundError('Device', 'abc-123');
    expect(error.message).toBe('Device not found: abc-123');
  });
});

describe('AuthError', () => {
  it('has 401 status', () => {
    const error = new AuthError('INVALID_TOKEN', 'Token inválido');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('INVALID_TOKEN');
  });
});

describe('BusinessError', () => {
  it('has 422 status', () => {
    const error = new BusinessError('EMAIL_TAKEN', 'Email ya registrado');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('EMAIL_TAKEN');
    expect(error.message).toBe('Email ya registrado');
  });
});

describe('ForbiddenError', () => {
  it('has 403 status with default message', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('No tienes permisos para esta acción');
  });

  it('accepts custom message', () => {
    const error = new ForbiddenError('Solo VIP');
    expect(error.message).toBe('Solo VIP');
  });
});

describe('RateLimitError', () => {
  it('has 429 status', () => {
    const error = new RateLimitError('RATE_LIMIT', 'Límite excedido');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT');
  });
});

describe('ValidationError', () => {
  it('has 400 status', () => {
    const error = new ValidationError('Campo requerido');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
```

```
[ARCHIVO] packages/utils/src/__tests__/tier.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { canAccess, getTierLabel, getTierColor } from '../tier.utils';

describe('canAccess', () => {
  it('FREE cannot access PREMIUM', () => {
    expect(canAccess('FREE', 'PREMIUM')).toBe(false);
  });

  it('FREE cannot access VIP', () => {
    expect(canAccess('FREE', 'VIP')).toBe(false);
  });

  it('PREMIUM can access PREMIUM', () => {
    expect(canAccess('PREMIUM', 'PREMIUM')).toBe(true);
  });

  it('PREMIUM cannot access VIP', () => {
    expect(canAccess('PREMIUM', 'VIP')).toBe(false);
  });

  it('VIP can access everything', () => {
    expect(canAccess('VIP', 'FREE')).toBe(true);
    expect(canAccess('VIP', 'PREMIUM')).toBe(true);
    expect(canAccess('VIP', 'VIP')).toBe(true);
  });

  it('everyone can access FREE', () => {
    expect(canAccess('FREE', 'FREE')).toBe(true);
    expect(canAccess('PREMIUM', 'FREE')).toBe(true);
  });
});

describe('getTierLabel', () => {
  it('returns correct labels', () => {
    expect(getTierLabel('FREE')).toBe('Gratis');
    expect(getTierLabel('PREMIUM')).toContain('Premium');
    expect(getTierLabel('VIP')).toContain('VIP');
  });
});

describe('getTierColor', () => {
  it('returns valid hex colors', () => {
    expect(getTierColor('FREE')).toMatch(/^#/);
    expect(getTierColor('PREMIUM')).toMatch(/^#/);
    expect(getTierColor('VIP')).toMatch(/^#/);
  });
});
```

### Validación:
```bash
npx vitest run
# Todos los tests deben pasar (mínimo 15+)
npx vitest run --reporter=verbose 2>&1 | tail -20
```

### Commit: `feat(testing): ARES-006 testing framework — Vitest + 4 factories + 30+ unit tests`

---

## ARES-007-security-base

**Fase:** 0 | **Prioridad:** ALTO
**Dependencias:** ARES-000, ARES-001, ARES-002
**Descripción:** Rate limiter por tier usando Redis (con fallback in-memory), sanitización de inputs, headers de seguridad CSP, y protección CSRF.

### Archivos a crear:

```
[ARCHIVO] src/lib/security/rate-limiter.ts
```
```typescript
import { createClient, type RedisClientType } from 'redis';

import { RateLimitError } from '@ares/errors';
import { logger } from '@ares/logger';
import { FREE_SEARCH_LIMIT } from '@ares/config';

import type { UserTier } from '@prisma/client';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

// Tier-based limits (per 24 hours)
const TIER_LIMITS: Record<UserTier, number> = {
  FREE: FREE_SEARCH_LIMIT,
  PREMIUM: 9999,
  VIP: 9999,
};

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

let redisClient: RedisClientType | null = null;
let redisConnected = false;

async function getRedis(): Promise<RedisClientType | null> {
  if (redisClient && redisConnected) return redisClient;

  try {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    redisClient = createClient({ url }) as RedisClientType;

    redisClient.on('error', () => {
      redisConnected = false;
    });

    await redisClient.connect();
    redisConnected = true;
    return redisClient;
  } catch {
    logger.warn('Redis unavailable, using in-memory rate limiter');
    redisConnected = false;
    return null;
  }
}

function getMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
      limit,
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      limit,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: new Date(entry.resetAt),
    limit,
  };
}

export async function checkRateLimit(
  userId: string,
  tier: UserTier,
): Promise<RateLimitResult> {
  const limit = TIER_LIMITS[tier];
  const windowSeconds = 86400; // 24 hours
  const windowMs = windowSeconds * 1000;
  const key = `ares:ratelimit:${userId}`;

  const redis = await getRedis();

  if (!redis) {
    return getMemoryLimit(key, limit, windowMs);
  }

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);

    if (current > limit) {
      return { allowed: false, remaining: 0, resetAt, limit };
    }

    return {
      allowed: true,
      remaining: limit - current,
      resetAt,
      limit,
    };
  } catch {
    logger.warn('Redis rate limit check failed, falling back to memory');
    return getMemoryLimit(key, limit, windowMs);
  }
}

export async function enforceRateLimit(
  userId: string,
  tier: UserTier,
): Promise<RateLimitResult> {
  const result = await checkRateLimit(userId, tier);

  if (!result.allowed) {
    throw new RateLimitError(
      'SEARCH_LIMIT_EXCEEDED',
      tier === 'FREE'
        ? `Has alcanzado tu límite de ${result.limit} búsquedas diarias. Mejora a Premium para búsquedas ilimitadas.`
        : 'Límite de búsquedas excedido. Intenta de nuevo mañana.',
    );
  }

  return result;
}

// Cleanup stale entries (for in-memory store)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 60000); // every minute
```

```
[ARCHIVO] src/lib/security/sanitize.ts
```
```typescript
/**
 * Strip HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize general user input: strip HTML, trim, limit length
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

/**
 * Sanitize search query: only allow alphanumeric, spaces, and basic punctuation
 */
export function sanitizeSearchQuery(input: string): string {
  return input
    .replace(/[^\p{L}\p{N}\s\-_.]/gu, '')
    .trim()
    .slice(0, 100);
}

/**
 * Sanitize username input
 */
export function sanitizeUsername(input: string): string {
  return input.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
}

/**
 * Escape string for use in HTML attributes
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
```

```
[ARCHIVO] src/lib/security/headers.ts
```
```typescript
/**
 * Security headers for Next.js config
 * These are applied globally via next.config.ts headers()
 */
export function getSecurityHeaders() {
  return [
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://api.mercadopago.com https://api.stripe.com https://www.google-analytics.com",
        "frame-src 'self' https://www.mercadopago.com.mx https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    },
  ];
}
```

```
[ARCHIVO] src/lib/security/csrf.ts
```
```typescript
import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.NEXTAUTH_SECRET ?? 'csrf-fallback-secret';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET).update(token).digest('hex');
  return `${token}.${hmac}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(csrfToken: string): boolean {
  const parts = csrfToken.split('.');
  if (parts.length !== 2) return false;

  const [token, providedHmac] = parts;
  if (!token || !providedHmac) return false;

  const expectedHmac = createHmac('sha256', CSRF_SECRET).update(token).digest('hex');

  // Timing-safe comparison
  if (expectedHmac.length !== providedHmac.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ providedHmac.charCodeAt(i);
  }

  return mismatch === 0;
}
```

```
[ARCHIVO] src/lib/security/index.ts
```
```typescript
export { checkRateLimit, enforceRateLimit } from './rate-limiter';
export { sanitizeInput, sanitizeSearchQuery, sanitizeUsername, stripHtml, escapeHtml } from './sanitize';
export { getSecurityHeaders } from './headers';
export { generateCsrfToken, verifyCsrfToken } from './csrf';
```

```
[ARCHIVO] src/lib/security/__tests__/sanitize.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { sanitizeInput, sanitizeSearchQuery, sanitizeUsername, stripHtml, escapeHtml } from '../sanitize';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });

  it('leaves plain text unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });
});

describe('sanitizeInput', () => {
  it('strips HTML and trims', () => {
    expect(sanitizeInput('  <b>test</b>  ')).toBe('test');
  });

  it('limits length', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeInput(long, 100).length).toBe(100);
  });
});

describe('sanitizeSearchQuery', () => {
  it('allows letters and numbers', () => {
    expect(sanitizeSearchQuery('Samsung Galaxy A54')).toBe('Samsung Galaxy A54');
  });

  it('removes special characters', () => {
    expect(sanitizeSearchQuery('Samsung<script>')).toBe('Samsung');
  });

  it('limits to 100 chars', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeSearchQuery(long).length).toBe(100);
  });
});

describe('sanitizeUsername', () => {
  it('allows alphanumeric and underscores', () => {
    expect(sanitizeUsername('pro_gamer_123')).toBe('pro_gamer_123');
  });

  it('strips invalid characters', () => {
    expect(sanitizeUsername('user@name!')).toBe('username');
  });
});

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('<script>"alert"</script>')).toBe('&lt;script&gt;&quot;alert&quot;&lt;/script&gt;');
  });
});
```

```
[ARCHIVO] src/lib/security/__tests__/csrf.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { generateCsrfToken, verifyCsrfToken } from '../csrf';

describe('CSRF tokens', () => {
  it('generates valid tokens', () => {
    const token = generateCsrfToken();
    expect(token).toContain('.');
    expect(token.split('.').length).toBe(2);
  });

  it('verifies valid tokens', () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token)).toBe(true);
  });

  it('rejects tampered tokens', () => {
    const token = generateCsrfToken();
    const tampered = token.slice(0, -1) + 'x';
    expect(verifyCsrfToken(tampered)).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(verifyCsrfToken('no-dot-here')).toBe(false);
    expect(verifyCsrfToken('')).toBe(false);
    expect(verifyCsrfToken('...')).toBe(false);
  });

  it('generates unique tokens each time', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });
});
```

### Validación:
```bash
npx tsc --noEmit
grep -r ": any\b" src/lib/security/ --include="*.ts" | grep -v node_modules | grep -v "__tests__"
npx vitest run src/lib/security/__tests__/
```

### Commit: `feat(security): ARES-007 security base — rate limiter (Redis+fallback), sanitize, CSP headers, CSRF`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 0 — FUNDACIÓN
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 8 scripts de esta fase, el proyecto tiene:
#
# ✅ Monorepo Next.js 14 con TypeScript strict
# ✅ Tailwind con tema gaming completo (Fire & Ice)
# ✅ PostgreSQL 16 con Prisma (19 modelos, 12 enums)
# ✅ 5 librerías compartidas (@ares/types, utils, errors, logger, config)
# ✅ Autenticación con NextAuth v5 (login + registro + middleware)
# ✅ 12+ componentes UI gaming + layout + effects + providers
# ✅ Docker para desarrollo (PostgreSQL + Redis)
# ✅ Framework de testing con 30+ unit tests pasando
# ✅ Rate limiting con Redis (+ fallback in-memory)
# ✅ Sanitización de inputs (XSS protection)
# ✅ Headers de seguridad CSP completos
# ✅ Protección CSRF con HMAC
#
# PRÓXIMA FASE: docs/MASTER-PLAN-B.md (Fase 1 — Motor de Sensibilidades)
#
# ═══════════════════════════════════════════════════════════════════
