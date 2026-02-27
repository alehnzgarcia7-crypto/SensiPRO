'use client';

import { getHudLayout, type FingerCount } from '@ares/algorithms';
import { motion } from 'framer-motion';

interface FingerRoleCardsProps {
  fingers: FingerCount;
}

export function FingerRoleCards({ fingers }: FingerRoleCardsProps) {
  const layout = getHudLayout(fingers);
  const maxActions = Math.max(...layout.fingerRoles.map((r) => r.actionsEs.length));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {layout.fingerRoles.map((role, i) => {
        const load = role.actionsEs.length / maxActions;

        return (
          <motion.div
            key={role.fingerEs}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="glass-card overflow-hidden"
          >
            {/* Color header strip */}
            <div
              className="h-1"
              style={{ background: `linear-gradient(90deg, ${role.color}, ${role.color}80)` }}
            />

            <div className="p-3">
              {/* Finger name */}
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: role.color, boxShadow: `0 0 6px ${role.color}60` }}
                />
                <p className="text-xs font-ui font-bold text-white truncate">
                  {role.fingerEs}
                </p>
              </div>

              {/* Actions list */}
              <div className="space-y-0.5 mb-2">
                {role.actionsEs.map((action) => (
                  <p key={action} className="text-[10px] font-body text-slate-400 leading-tight">
                    • {action}
                  </p>
                ))}
              </div>

              {/* Load indicator */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-ui text-slate-600 uppercase">Carga</span>
                  <span className="text-[9px] font-mono text-slate-500">{role.actionsEs.length}</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${load * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${role.color}80, ${role.color})`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
