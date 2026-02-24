// ═══════════════════════════════════════════════════════════════
// DiscordWidget — Embed del widget de Discord para la comunidad
// Se renderiza solo si hay un server ID configurado
// ═══════════════════════════════════════════════════════════════

interface DiscordWidgetProps {
  serverId?: string;
  className?: string;
}

export function DiscordWidget({ serverId, className }: DiscordWidgetProps) {
  const id = serverId ?? process.env.NEXT_PUBLIC_DISCORD_SERVER_ID;
  if (!id) return null;

  return (
    <div className={className}>
      <h3 className="font-display font-bold text-white mb-3">Discord</h3>
      <iframe
        src={`https://discord.com/widget?id=${encodeURIComponent(id)}&theme=dark`}
        width="100%"
        height="400"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="rounded-xl border border-white/10"
        loading="lazy"
        title="Discord Server"
      />
    </div>
  );
}
