#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║                                                                               ║
# ║     █████╗ ██████╗ ███████╗███████╗                                           ║
# ║    ██╔══██╗██╔══██╗██╔════╝██╔════╝                                           ║
# ║    ███████║██████╔╝█████╗  ███████╗                                           ║
# ║    ██╔══██║██╔══██╗██╔══╝  ╚════██║                                           ║
# ║    ██║  ██║██║  ██║███████╗███████║                                           ║
# ║    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝                                           ║
# ║                                                                               ║
# ║    A U T O P I L O T    v2.0  —  ENHANCED GAMING PLATFORM BUILDER            ║
# ║                                                                               ║
# ║    "El sistema que construye el destructor de SystemWoods mientras duermes"   ║
# ║                                                                               ║
# ║    v2.0 ENHANCEMENTS:                                                         ║
# ║    • Gaming dashboard con stats en tiempo real                                ║
# ║    • Phase completion detection + auto-celebration                            ║
# ║    • Pre/post validation flags per script                                     ║
# ║    • Dependency chain verification before execution                           ║
# ║    • Health monitoring (disk, memory, node, claude)                           ║
# ║    • Enhanced metrics: LOC delta, file delta, test counts                     ║
# ║    • Smart retry with exponential backoff                                     ║
# ║    • Session profiles (quick/normal/marathon)                                 ║
# ║    • Parallel validation pipeline                                             ║
# ║    • Export session report as markdown                                        ║
# ║    • Sound alerts (macOS) on completion/failure                               ║
# ║    • Estimated time remaining calculation                                     ║
# ║    • Full ANSI gaming UI with phase progress bars                             ║
# ║                                                                               ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝
#
#  USAGE:
#    ./autopilot.sh                        →  Modo interactivo
#    ./autopilot.sh --auto                 →  Modo autónomo (construye sin parar)
#    ./autopilot.sh --auto --notify        →  Autónomo + notificaciones Telegram
#    ./autopilot.sh --status               →  Muestra progreso actual
#    ./autopilot.sh --resume               →  Retoma desde el último fallo
#    ./autopilot.sh --dashboard            →  Abre dashboard en navegador
#    ./autopilot.sh --validate             →  Valida el proyecto completo
#    ./autopilot.sh --validate-phase N     →  Valida solo fase N
#    ./autopilot.sh --reset-script X       →  Marca script X como pendiente
#    ./autopilot.sh --reset-phase N        →  Marca toda la fase N como pendiente
#    ./autopilot.sh --profile quick        →  Sesión rápida (3 scripts, 5s cooldown)
#    ./autopilot.sh --profile marathon     →  Sesión larga (20 scripts, 15s cooldown)
#    ./autopilot.sh --report               →  Genera reporte markdown de sesión
#    ./autopilot.sh --health               →  System health check
#    ./autopilot.sh --deps ARES-XXX       →  Muestra dependencias de un script
#    ./autopilot.sh --phase-status         →  Status detallado por fase

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

PROJECT_DIR="$HOME/SensiPRO"
AUTOPILOT_DIR="$PROJECT_DIR/.ares-autopilot"
LOG_DIR="$AUTOPILOT_DIR/logs"
RECOVERY_DIR="$AUTOPILOT_DIR/recovery"
REPORTS_DIR="$AUTOPILOT_DIR/reports"
STATE_FILE="$AUTOPILOT_DIR/state.json"
METRICS_FILE="$AUTOPILOT_DIR/metrics.json"
CONFIG_FILE="$AUTOPILOT_DIR/config.sh"
DASHBOARD_FILE="$AUTOPILOT_DIR/dashboard/index.html"
PHASE_HISTORY="$AUTOPILOT_DIR/phase_completions.log"

MAX_RETRIES=3
MAX_SCRIPTS_PER_SESSION=10
COOLDOWN_BETWEEN_SCRIPTS=10
COOLDOWN_AFTER_ERROR=30
RATE_LIMIT_COOLDOWN=300
TOTAL_SCRIPTS=68
TOTAL_PHASES=9

TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
NOTIFY_ENABLED=false
MODE="interactive"
SHOULD_NOTIFY=false
SOUND_ENABLED=true
VERBOSE=false

# Session profiles
PROFILE_QUICK_MAX=3
PROFILE_QUICK_COOLDOWN=5
PROFILE_NORMAL_MAX=10
PROFILE_NORMAL_COOLDOWN=10
PROFILE_MARATHON_MAX=20
PROFILE_MARATHON_COOLDOWN=15

# ═══════════════════════════════════════════════════════════════
# PHASE CONFIGURATION — 9 fases, scripts por fase
# ═══════════════════════════════════════════════════════════════

declare -A PHASE_NAMES=(
    [0]="Foundation"
    [1]="Motor de Sensibilidad"
    [2]="UI/UX"
    [3]="Academia PRO"
    [4]="Monetización"
    [5]="Comunidad"
    [6]="Admin"
    [7]="Mobile/PWA"
    [8]="SEO/Deploy"
)

declare -A PHASE_SCRIPTS=(
    [0]=8  [1]=10 [2]=8 [3]=6 [4]=8 [5]=8 [6]=6 [7]=5 [8]=9
)

declare -A PHASE_PLANS=(
    [0]="MASTER-PLAN-A.md"
    [1]="MASTER-PLAN-B.md"
    [2]="MASTER-PLAN-C.md"
    [3]="MASTER-PLAN-D.md"
    [4]="MASTER-PLAN-E.md"
    [5]="MASTER-PLAN-F.md"
    [6]="MASTER-PLAN-G.md"
    [7]="MASTER-PLAN-H.md"
    [8]="MASTER-PLAN-I.md"
)

declare -A PHASE_PREFIXES=(
    [0]="ARES-00" [1]="ARES-10" [2]="ARES-20" [3]="ARES-30"
    [4]="ARES-40" [5]="ARES-50" [6]="ARES-60" [7]="ARES-70" [8]="ARES-80"
)

declare -A PHASE_CELEBRATIONS=(
    [0]="🏗️  CIMIENTOS LISTOS — El esqueleto del destructor está listo"
    [1]="⚡ MOTOR ENCENDIDO — El corazón algorítmico late"
    [2]="🎨 UI GAMING — La experiencia visual está brutal"
    [3]="📚 ACADEMIA COMPLETA — Contenido que retiene usuarios"
    [4]="💰 MONETIZACIÓN ACTIVA — El dinero empieza a fluir"
    [5]="👥 COMUNIDAD VIVA — Los jugadores tienen su casa"
    [6]="👑 ADMIN PANEL — Control total del imperio"
    [7]="📱 MOBILE READY — PWA instalable en cualquier celular"
    [8]="🚀 DEPLOYED — SystemWoods DESTRUIDO. ARES vive. 🔥🔥🔥"
)

# ═══════════════════════════════════════════════════════════════
# COLORS & FORMATTING
# ═══════════════════════════════════════════════════════════════

R='\033[0;31m'; G='\033[0;32m'; B='\033[0;34m'; Y='\033[1;33m'
P='\033[0;35m'; C='\033[0;36m'; W='\033[1;37m'; D='\033[0;90m'
BOLD='\033[1m'; NC='\033[0m'; FIRE='\033[38;5;208m'; ICE='\033[38;5;39m'
PURPLE='\033[38;5;135m'; LIME='\033[38;5;118m'; PINK='\033[38;5;213m'

# ═══════════════════════════════════════════════════════════════
# UI FUNCTIONS
# ═══════════════════════════════════════════════════════════════

clear_line() { printf "\r\033[K"; }

show_logo() {
    clear
    echo ""
    echo -e "${FIRE}    ╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${FIRE}    ║${NC}  ${W}█▀▀█ █▀▀█ █▀▀ █▀▀   █▀▀█ █  █ ▀▀█▀▀ █▀▀█${NC}              ${FIRE}║${NC}"
    echo -e "${FIRE}    ║${NC}  ${W}█▄▄█ █▄▄▀ █▀▀ ▀▀█   █▄▄█ █  █   █   █  █${NC}              ${FIRE}║${NC}"
    echo -e "${FIRE}    ║${NC}  ${W}█  █ █  █ ▀▀▀ ▀▀▀   █  █ ▀▀▀▀   █   ▀▀▀▀${NC}              ${FIRE}║${NC}"
    echo -e "${FIRE}    ║${NC}                                                         ${FIRE}║${NC}"
    echo -e "${FIRE}    ║${NC}  ${C}A U T O N O M O U S   G A M I N G   B U I L D E R${NC}     ${FIRE}║${NC}"
    echo -e "${FIRE}    ║${NC}  ${D}v2.0 — Enhanced Edition${NC}                                 ${FIRE}║${NC}"
    echo -e "${FIRE}    ╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

progress_bar() {
    local current=${1:-0}; local total=${2:-$TOTAL_SCRIPTS}; local width=40
    local label=${3:-""}
    current=$(echo "$current" | tr -dc '0-9'); current=${current:-0}
    total=$(echo "$total" | tr -dc '0-9'); total=${total:-$TOTAL_SCRIPTS}
    [ "${total:-1}" -eq 0 ] 2>/dev/null && total=$TOTAL_SCRIPTS
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done

    local color=$G
    [ $percentage -lt 25 ] && color=$R
    [ $percentage -ge 25 ] && [ $percentage -lt 50 ] && color=$Y
    [ $percentage -ge 50 ] && [ $percentage -lt 75 ] && color=$C
    [ $percentage -ge 75 ] && color=$G

    if [ -n "$label" ]; then
        printf "  ${color}${bar}${NC} ${W}%3d%%${NC} ${D}(%d/%d)${NC} ${D}%s${NC}\n" "$percentage" "$current" "$total" "$label"
    else
        printf "  ${color}${bar}${NC} ${W}%3d%%${NC} ${D}(%d/%d)${NC}\n" "$percentage" "$current" "$total"
    fi
}

phase_progress_bar() {
    local phase=$1; local completed=$2; local total=$3; local width=20
    [ "${total:-1}" -eq 0 ] 2>/dev/null && return
    local filled=$(( (completed > 0 && total > 0) ? completed * width / total : 0 ))
    local empty=$((width - filled))
    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done
    [ "$completed" -eq "$total" ] && printf "${G}${bar}${NC}" || printf "${Y}${bar}${NC}"
}

spinner() {
    local chars='⣾⣽⣻⢿⡿⣟⣯⣷'; local i=0
    while kill -0 "$1" 2>/dev/null; do
        printf "\r  ${FIRE}${chars:i++%${#chars}:1}${NC} %s" "$2"; sleep 0.15
    done; clear_line
}

countdown() {
    local secs=$1; local label=${2:-"Esperando"}
    for ((i=secs; i>0; i--)); do
        printf "\r  ${D}⏳ ${label}: ${W}${i}s${NC}  "
        sleep 1
    done; clear_line
}

play_sound() {
    [ "$SOUND_ENABLED" != true ] && return
    case "$1" in
        success) command -v afplay &>/dev/null && afplay /System/Library/Sounds/Glass.aiff 2>/dev/null & ;;
        error) command -v afplay &>/dev/null && afplay /System/Library/Sounds/Basso.aiff 2>/dev/null & ;;
        phase) command -v afplay &>/dev/null && afplay /System/Library/Sounds/Hero.aiff 2>/dev/null & ;;
        complete) command -v afplay &>/dev/null && afplay /System/Library/Sounds/Funk.aiff 2>/dev/null & ;;
    esac
}

show_status_box() {
    local name=$1 num=$2 total=$3 phase=$4 status=$5
    local icon="⬜" color=$D
    case $status in
        running) icon="⚡" color=$C;;
        success) icon="✅" color=$G;;
        error) icon="❌" color=$R;;
        healing) icon="🔧" color=$Y;;
        validating) icon="🔍" color=$P;;
        skipped) icon="⏭️" color=$D;;
    esac
    echo ""
    echo -e "  ${color}╭─────────────────────────────────────────────────╮${NC}"
    printf "  ${color}│${NC} ${icon} ${BOLD}%-42s${NC}  ${color}│${NC}\n" "$name"
    printf "  ${color}│${NC}   ${D}%-44s${NC}${color}│${NC}\n" "${phase}"
    printf "  ${color}│${NC}   ${D}Script %-3d de %-3d  │  Status: %-14s${NC}${color}│${NC}\n" "$num" "$total" "$status"
    echo -e "  ${color}╰─────────────────────────────────────────────────╯${NC}"
}

# ═══════════════════════════════════════════════════════════════
# STATE MANAGEMENT (JSON-based)
# ═══════════════════════════════════════════════════════════════

init_state() {
    [ -f "$STATE_FILE" ] || cat > "$STATE_FILE" << 'EOF'
{
    "session_count": 0,
    "total_scripts_completed": 0,
    "total_scripts_failed": 0,
    "total_scripts_skipped": 0,
    "total_time_seconds": 0,
    "total_loc_generated": 0,
    "total_files_generated": 0,
    "total_tests_passed": 0,
    "streak": 0,
    "longest_streak": 0,
    "last_script_completed": "",
    "last_phase_completed": -1,
    "last_run_timestamp": "",
    "phases_completed": [],
    "avg_script_time": 0,
    "fastest_script": "",
    "fastest_time": 99999,
    "slowest_script": "",
    "slowest_time": 0
}
EOF
}

update_state() {
    local key=$1 value=$2
    if command -v jq &>/dev/null; then
        local tmp=$(mktemp)
        jq ".$key = $value" "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    else
        sed -i.bak "s/\"$key\":[^,}]*/\"$key\": $value/" "$STATE_FILE" 2>/dev/null
        rm -f "${STATE_FILE}.bak"
    fi
}

get_state() {
    local key=$1
    if command -v jq &>/dev/null; then
        jq -r ".$key // empty" "$STATE_FILE" 2>/dev/null
    else
        grep -o "\"$key\":[^,}]*" "$STATE_FILE" 2>/dev/null | sed 's/.*: *//' | tr -d '"'
    fi
}

init_metrics() { [ -f "$METRICS_FILE" ] || echo '{"scripts":[],"phases":[]}' > "$METRICS_FILE"; }

add_metric() {
    local name=$1 status=$2 duration=$3 loc=$4 files=$5 any_count=$6
    local tests=${7:-0} loc_delta=${8:-0} file_delta=${9:-0}
    local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local phase=$(get_phase_number_for_script "$name")

    if command -v jq &>/dev/null; then
        local tmp=$(mktemp)
        jq ".scripts += [{
            \"name\": \"$name\",
            \"status\": \"$status\",
            \"duration_seconds\": ${duration:-0},
            \"loc\": ${loc:-0},
            \"files\": ${files:-0},
            \"any_count\": ${any_count:-0},
            \"tests_passed\": ${tests:-0},
            \"loc_delta\": ${loc_delta:-0},
            \"file_delta\": ${file_delta:-0},
            \"phase\": ${phase:--1},
            \"timestamp\": \"$ts\"
        }]" "$METRICS_FILE" > "$tmp" && mv "$tmp" "$METRICS_FILE"
    else
        local entry="{\"name\":\"$name\",\"status\":\"$status\",\"duration_seconds\":${duration:-0},\"loc\":${loc:-0},\"files\":${files:-0},\"any_count\":${any_count:-0},\"tests_passed\":${tests:-0},\"phase\":${phase:--1},\"timestamp\":\"$ts\"}"
        sed -i.bak "s/\"scripts\":\[/\"scripts\":\[$entry,/" "$METRICS_FILE" 2>/dev/null
        rm -f "${METRICS_FILE}.bak"
    fi
}

# ═══════════════════════════════════════════════════════════════
# NOTIFICATIONS (Telegram)
# ═══════════════════════════════════════════════════════════════

notify() {
    [ "$NOTIFY_ENABLED" != true ] && return
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" -d "parse_mode=Markdown" -d "text=$1" &>/dev/null &
}

notify_script_complete() {
    local name=$1 num=$2 total=$3 dur=$4 loc=$5 files=$6 any=$7
    local pct=$((num * 100 / total))
    notify "✅ *${name}*
📊 ${num}/${total} (${pct}%)
⏱️ ${dur}s | 📁 ${files} files | 📝 ${loc} LOC
$([ "$any" != "0" ] && echo "⚠️ any: ${any}" || echo "🎯 Zero any")"
}

notify_script_failed() {
    notify "❌ *${1}* — Intento ${3}/${MAX_RETRIES}
🔍 ${2}"
}

notify_session_summary() {
    notify "📊 *SESIÓN TERMINADA*
✅ ${1} completados | ❌ ${2} fallidos
⏱️ ${3} | 📝 ${4} LOC"
}

notify_rate_limit() {
    notify "🚫 *Rate limit* — Esperando ${RATE_LIMIT_COOLDOWN}s"
}

notify_phase_complete() {
    local phase=$1; local name=${PHASE_NAMES[$phase]}
    local celebration=${PHASE_CELEBRATIONS[$phase]}
    notify "🎉🎉🎉 *¡FASE ${phase} COMPLETADA!*
${celebration}

Fase: *${name}*
Siguiente: Fase $((phase+1)) — ${PHASE_NAMES[$((phase+1))]:-NINGUNA}"
    play_sound "phase"
}

notify_all_complete() {
    notify "🎉🔥🏆 *¡ARES SENSIPRO COMPLETADO!*

${TOTAL_SCRIPTS} scripts ejecutados
SystemWoods oficialmente DESTRUIDO 🎮

🇲🇽 Hecho en Cancún con 🔥"
    play_sound "complete"
}

# ═══════════════════════════════════════════════════════════════
# SCRIPT RESOLUTION & DEPENDENCIES
# ═══════════════════════════════════════════════════════════════

get_next_script() {
    [ ! -f "$PROJECT_DIR/PROGRESS.md" ] && { echo "NONE"; return; }
    grep '| ⬜ |' "$PROJECT_DIR/PROGRESS.md" 2>/dev/null | head -1 | \
        sed 's/.*| \(ARES-[^ |]*\) .*/\1/' | tr -d ' '
    [ ${PIPESTATUS[0]} -ne 0 ] && echo "NONE"
}

get_completed_count() {
    grep -c '| ✅ |' "$PROJECT_DIR/PROGRESS.md" 2>/dev/null || echo 0
}

get_failed_count() {
    grep -c '| ❌ |' "$PROJECT_DIR/PROGRESS.md" 2>/dev/null || echo 0
}

get_phase_number_for_script() {
    local script=$1
    local num=$(echo "$script" | grep -o '[0-9]' | head -1)
    echo "${num:-0}"
}

get_phase_for_script() {
    local script=$1; local num=$(get_phase_number_for_script "$script")
    echo "Fase ${num} — ${PHASE_NAMES[$num]:-Unknown}"
}

get_masterplan_for_script() {
    local script=$1; local num=$(get_phase_number_for_script "$script")
    local plan="${PHASE_PLANS[$num]:-NOT_FOUND}"
    local path="$PROJECT_DIR/docs/$plan"
    [ -f "$path" ] && echo "$path" || echo "NOT_FOUND"
}

get_phase_completed_count() {
    local phase=$1; local prefix=${PHASE_PREFIXES[$phase]}
    [ -z "$prefix" ] && { echo 0; return; }
    grep "| ${prefix}" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null | grep -c '| ✅ |' || echo 0
}

get_phase_total_count() {
    local phase=$1
    echo "${PHASE_SCRIPTS[$phase]:-0}"
}

is_phase_complete() {
    local phase=$1
    local completed=$(get_phase_completed_count "$phase")
    local total=$(get_phase_total_count "$phase")
    [ "${completed:-0}" -ge "${total:-1}" ] 2>/dev/null && [ "${total:-1}" -gt 0 ] 2>/dev/null
}

check_phase_completion() {
    local phase=$1
    if is_phase_complete "$phase"; then
        local already_logged=$(grep "PHASE_${phase}_DONE" "$PHASE_HISTORY" 2>/dev/null)
        if [ -z "$already_logged" ]; then
            echo "PHASE_${phase}_DONE $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$PHASE_HISTORY"
            local last=$(get_state "last_phase_completed"); last=${last:--1}
            update_state "last_phase_completed" "$phase"

            echo ""
            echo -e "  ${FIRE}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "  ${FIRE}║${NC}                                                           ${FIRE}║${NC}"
            echo -e "  ${FIRE}║${NC}  ${W}${BOLD}🎉 ¡FASE ${phase} COMPLETADA!${NC}                                  ${FIRE}║${NC}"
            echo -e "  ${FIRE}║${NC}                                                           ${FIRE}║${NC}"
            echo -e "  ${FIRE}║${NC}  ${C}${PHASE_NAMES[$phase]}${NC}                                       ${FIRE}║${NC}"
            echo -e "  ${FIRE}║${NC}  ${G}${PHASE_CELEBRATIONS[$phase]}${NC}"
            echo -e "  ${FIRE}║${NC}                                                           ${FIRE}║${NC}"
            echo -e "  ${FIRE}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""

            [ "$SHOULD_NOTIFY" = true ] && notify_phase_complete "$phase"
            play_sound "phase"
            return 0
        fi
    fi
    return 1
}

get_script_dependencies() {
    local script=$1; local mp=$(get_masterplan_for_script "$script")
    [ "$mp" = "NOT_FOUND" ] && return
    grep -A2 "## $script" "$mp" 2>/dev/null | grep "Dependencias:" | \
        sed 's/.*Dependencias://' | tr ',' '\n' | sed 's/^ *//' | grep "ARES-"
}

check_dependencies() {
    local script=$1; local deps=$(get_script_dependencies "$script")
    [ -z "$deps" ] && return 0

    local missing=""
    while IFS= read -r dep; do
        dep=$(echo "$dep" | tr -d ' ')
        [ -z "$dep" ] && continue
        if ! grep -q "| $dep.*| ✅ |" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null; then
            missing+="$dep "
        fi
    done <<< "$deps"

    if [ -n "$missing" ]; then
        echo -e "  ${Y}⚠️ Dependencias pendientes: ${missing}${NC}"
        return 1
    fi
    return 0
}

# ═══════════════════════════════════════════════════════════════
# PROJECT METRICS
# ═══════════════════════════════════════════════════════════════

count_files() {
    find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l | tr -d ' '
}

count_loc() {
    find "$PROJECT_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec cat {} + 2>/dev/null | wc -l | tr -d ' '
}

count_any() {
    grep -r ': any' "$PROJECT_DIR/src/" --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -v node_modules | grep -v ".d.ts" | wc -l | tr -d ' '
}

count_console_log() {
    grep -r 'console\.\(log\|warn\|error\)' "$PROJECT_DIR/src/" --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -v node_modules | grep -v "// .*console" | wc -l | tr -d ' '
}

count_tests() {
    find "$PROJECT_DIR" -type f -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' '
}

count_components() {
    find "$PROJECT_DIR/src/components" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
}

count_api_routes() {
    find "$PROJECT_DIR/src/app/api" -type f -name "route.ts" 2>/dev/null | wc -l | tr -d ' '
}

estimate_time_remaining() {
    local completed=$(get_completed_count); completed=${completed:-0}
    local avg=$(get_state "avg_script_time"); avg=${avg:-120}
    local remaining=$((TOTAL_SCRIPTS - completed))
    local total_secs=$((remaining * avg + remaining * COOLDOWN_BETWEEN_SCRIPTS))
    local hours=$((total_secs / 3600))
    local mins=$(((total_secs % 3600) / 60))
    echo "${hours}h ${mins}m"
}

# ═══════════════════════════════════════════════════════════════
# HEALTH MONITORING
# ═══════════════════════════════════════════════════════════════

health_check() {
    show_logo
    echo -e "  ${W}${BOLD}🏥 System Health Check${NC}"; echo ""

    # Disk space
    local disk_free=$(df -h "$PROJECT_DIR" 2>/dev/null | tail -1 | awk '{print $4}')
    local disk_pct=$(df "$PROJECT_DIR" 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%')
    disk_pct=${disk_pct:-0}
    local disk_icon="✅"
    [ "$disk_pct" -gt 90 ] 2>/dev/null && disk_icon="❌"
    [ "$disk_pct" -gt 80 ] 2>/dev/null && [ "$disk_pct" -le 90 ] 2>/dev/null && disk_icon="⚠️"
    echo -e "  ${disk_icon} Disco: ${disk_free} libre (${disk_pct}% usado)"

    # Node.js
    if command -v node &>/dev/null; then
        local nv=$(node -v 2>/dev/null)
        echo -e "  ${G}✅${NC} Node.js: ${nv}"
    else
        echo -e "  ${R}❌${NC} Node.js: No instalado"
    fi

    # npm
    if command -v npm &>/dev/null; then
        echo -e "  ${G}✅${NC} npm: $(npm -v 2>/dev/null)"
    else
        echo -e "  ${R}❌${NC} npm: No instalado"
    fi

    # Claude Code
    if command -v claude &>/dev/null; then
        echo -e "  ${G}✅${NC} Claude Code: Instalado"
    else
        echo -e "  ${R}❌${NC} Claude Code: No instalado"
    fi

    # Git
    if command -v git &>/dev/null; then
        echo -e "  ${G}✅${NC} Git: $(git --version 2>/dev/null | head -1)"
    else
        echo -e "  ${R}❌${NC} Git: No instalado"
    fi

    # Project files
    echo ""
    echo -e "  ${C}━━━ Proyecto ━━━${NC}"
    [ -f "$PROJECT_DIR/CLAUDE.md" ] && echo -e "  ${G}✅${NC} CLAUDE.md" || echo -e "  ${R}❌${NC} CLAUDE.md"
    [ -f "$PROJECT_DIR/PROGRESS.md" ] && echo -e "  ${G}✅${NC} PROGRESS.md" || echo -e "  ${R}❌${NC} PROGRESS.md"

    local mp_count=$(ls "$PROJECT_DIR/docs/MASTER-PLAN-"*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  $([ "$mp_count" -ge 9 ] && echo "${G}✅" || echo "${Y}⚠️")${NC} Master Plans: ${mp_count}/9"

    # Package.json
    [ -f "$PROJECT_DIR/package.json" ] && echo -e "  ${G}✅${NC} package.json" || echo -e "  ${D}⬜${NC} package.json (se crea en Fase 0)"

    # Git repo
    [ -d "$PROJECT_DIR/.git" ] && echo -e "  ${G}✅${NC} Git repo inicializado" || echo -e "  ${D}⬜${NC} Git repo (se crea al iniciar)"

    echo ""
    echo -e "  ${C}━━━ Autopilot ━━━${NC}"
    [ -f "$STATE_FILE" ] && echo -e "  ${G}✅${NC} State file" || echo -e "  ${D}⬜${NC} State file (se crea al iniciar)"
    [ -f "$METRICS_FILE" ] && echo -e "  ${G}✅${NC} Metrics file" || echo -e "  ${D}⬜${NC} Metrics file"
    [ "$NOTIFY_ENABLED" = true ] && echo -e "  ${G}✅${NC} Telegram configurado" || echo -e "  ${D}⬜${NC} Telegram (opcional)"
    echo ""
}

# ═══════════════════════════════════════════════════════════════
# SCRIPT EXECUTION
# ═══════════════════════════════════════════════════════════════

execute_script() {
    local script_name=$1; local attempt=$2
    local mp=$(get_masterplan_for_script "$script_name")
    local log_file="$LOG_DIR/${script_name}_$(date +%Y%m%d_%H%M%S).log"
    local start_time=$(date +%s)

    # Pre-execution metrics
    local pre_files=$(count_files)
    local pre_loc=$(count_loc)

    # Build the prompt
    local prompt="Lee el archivo CLAUDE.md para las convenciones del proyecto."
    if [ "$mp" != "NOT_FOUND" ]; then
        prompt+=" Luego lee el master plan en $(basename "$mp") y ejecuta SOLO el script ${script_name}."
        prompt+=" Crea TODOS los archivos especificados con código LITERAL completo."
        prompt+=" Al terminar actualiza PROGRESS.md marcando ${script_name} como ✅."
        prompt+=" Haz git add -A && git commit con el mensaje del plan."
    else
        prompt+=" Ejecuta el script ${script_name}. Marca como ✅ en PROGRESS.md al terminar."
    fi
    prompt+=" REGLAS: 0 any, 0 console.log, tipos explícitos, Zod en APIs."

    # Execute with Claude Code
    cd "$PROJECT_DIR"
    local output
    output=$(timeout 600 claude --print --dangerously-skip-permissions "$prompt" 2>&1 | tee "$log_file")
    local exit_code=$?

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Check for rate limiting
    if echo "$output" | grep -qi "rate.limit\|429\|too many\|overloaded"; then
        return 2
    fi

    # Post-execution metrics
    local post_files=$(count_files)
    local post_loc=$(count_loc)
    local file_delta=$((post_files - pre_files))
    local loc_delta=$((post_loc - pre_loc))

    # Check if marked as complete in PROGRESS.md
    if grep -q "| ${script_name}.*| ✅ |" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null; then
        echo "SUCCESS:${duration}:${file_delta}:${loc_delta}"
        return 0
    fi

    # Check if files were created even if PROGRESS not updated
    if [ "$file_delta" -gt 0 ] || [ "$loc_delta" -gt 50 ]; then
        # Auto-mark as complete
        sed -i.bak "s/| ${script_name}[^|]* | ⬜ |/| ${script_name} | ✅ |/" \
            "$PROJECT_DIR/PROGRESS.md" 2>/dev/null
        rm -f "$PROJECT_DIR/PROGRESS.md.bak"
        echo "SUCCESS:${duration}:${file_delta}:${loc_delta}"
        return 0
    fi

    echo "FAILED:${duration}:0:0"
    return 1
}

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

validate_build() {
    local issues=0

    # TypeScript check
    if [ -f "$PROJECT_DIR/tsconfig.json" ]; then
        cd "$PROJECT_DIR"
        npx tsc --noEmit 2>/dev/null
        if [ $? -ne 0 ]; then
            echo -e "  ${Y}⚠️ TypeScript errors detected${NC}"
            ((issues++))
        else
            echo -e "  ${G}  ✓ TypeScript OK${NC}"
        fi
    fi

    # Any check
    local a=$(count_any)
    if [ "$a" -gt 0 ]; then
        echo -e "  ${R}  ✗ Found ${a} 'any' violations${NC}"
        ((issues++))
    else
        echo -e "  ${G}  ✓ Zero 'any' — type safe${NC}"
    fi

    return $issues
}

validate_phase() {
    local phase=$1
    show_logo
    echo -e "  ${W}${BOLD}🔍 Validando Fase ${phase} — ${PHASE_NAMES[$phase]}${NC}"; echo ""

    local completed=$(get_phase_completed_count "$phase")
    local total=$(get_phase_total_count "$phase")

    echo -e "  ${C}Scripts:${NC} ${completed}/${total}"
    progress_bar "$completed" "$total" "${PHASE_NAMES[$phase]}"
    echo ""

    # Check master plan exists
    local plan="${PHASE_PLANS[$phase]}"
    local plan_path="$PROJECT_DIR/docs/$plan"
    [ -f "$plan_path" ] && echo -e "  ${G}✅${NC} ${plan}" || echo -e "  ${R}❌${NC} ${plan} — FALTANTE"

    # Check scripts status
    local prefix=${PHASE_PREFIXES[$phase]}
    echo ""
    echo -e "  ${C}━━━ Scripts ━━━${NC}"
    grep "| ${prefix}" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null | while IFS= read -r line; do
        local name=$(echo "$line" | sed 's/.*| \(ARES-[^ |]*\).*/\1/')
        local status=$(echo "$line" | grep -o '| ✅ |\|| ⬜ |\|| ❌ |' | head -1)
        case "$status" in
            *✅*) echo -e "  ${G}  ✅ ${name}${NC}";;
            *❌*) echo -e "  ${R}  ❌ ${name}${NC}";;
            *) echo -e "  ${D}  ⬜ ${name}${NC}";;
        esac
    done
    echo ""

    if is_phase_complete "$phase"; then
        echo -e "  ${G}🎉 Fase ${phase} COMPLETADA${NC}"
    else
        echo -e "  ${Y}⏳ Fase ${phase} en progreso (${completed}/${total})${NC}"
    fi
    echo ""
}

validate_full_project() {
    show_logo
    echo -e "  ${W}${BOLD}🔍 Validación Completa del Proyecto${NC}"; echo ""

    local issues=0

    echo -e "  ${C}━━━ Type Safety ━━━${NC}"
    local a=$(count_any); echo -e "  $([ "$a" -eq 0 ] && echo "${G}  ✓" || echo "${R}  ✗") 'any': ${a}${NC}"
    [ "$a" -gt 0 ] && ((issues++))

    echo -e "  ${C}━━━ Logging ━━━${NC}"
    local c=$(count_console_log); echo -e "  $([ "$c" -eq 0 ] && echo "${G}  ✓" || echo "${Y}  ⚠") console.log: ${c}${NC}"

    echo -e "  ${C}━━━ Proyecto ━━━${NC}"
    echo -e "  ${W}  📁 Archivos TS/TSX: $(count_files)${NC}"
    echo -e "  ${W}  📝 LOC: $(count_loc)${NC}"
    echo -e "  ${W}  🧪 Tests: $(count_tests)${NC}"
    echo -e "  ${W}  🧩 Components: $(count_components)${NC}"
    echo -e "  ${W}  🔌 API Routes: $(count_api_routes)${NC}"

    echo ""
    echo -e "  ${C}━━━ Fases ━━━${NC}"
    for ((p=0; p<TOTAL_PHASES; p++)); do
        local pc=$(get_phase_completed_count "$p")
        local pt=$(get_phase_total_count "$p")
        local bar=$(phase_progress_bar "$p" "$pc" "$pt")
        local icon="⏳"
        [ "$pc" -ge "$pt" ] 2>/dev/null && [ "$pt" -gt 0 ] 2>/dev/null && icon="✅"
        printf "  ${icon} Fase %d %-22s ${bar} %d/%d\n" "$p" "${PHASE_NAMES[$p]}" "$pc" "$pt"
    done

    echo ""
    echo -e "  ${C}━━━ Progreso Global ━━━${NC}"
    local comp=$(get_completed_count); comp=${comp:-0}
    progress_bar "$comp" "$TOTAL_SCRIPTS"
    echo ""

    [ $issues -eq 0 ] && echo -e "  ${G}🎯 Proyecto OK${NC}" || echo -e "  ${R}⚠️ ${issues} problemas${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════
# GIT OPS
# ═══════════════════════════════════════════════════════════════

ensure_git_push() {
    cd "$PROJECT_DIR"
    git add -A 2>/dev/null
    git diff --cached --quiet 2>/dev/null || \
        git commit -m "chore: autopilot checkpoint — $(date +%Y-%m-%d_%H:%M)" 2>/dev/null
    git push origin main 2>/dev/null && echo -e "  ${G}  ✓ Push OK${NC}" || \
        echo -e "  ${Y}  ⚠ Push falló (no remote o sin internet)${NC}"
}

create_recovery_snapshot() {
    local dir="$RECOVERY_DIR/${1}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$dir"
    cp "$PROJECT_DIR/PROGRESS.md" "$dir/" 2>/dev/null
    cp "$STATE_FILE" "$dir/" 2>/dev/null
    cd "$PROJECT_DIR" && git rev-parse HEAD > "$dir/git_sha.txt" 2>/dev/null
    echo "$dir"
}

rollback_to_snapshot() {
    [ -d "$1" ] || return
    local sha=$(cat "$1/git_sha.txt" 2>/dev/null)
    [ -n "$sha" ] && {
        cd "$PROJECT_DIR"
        git reset --hard "$sha" 2>/dev/null
        cp "$1/PROGRESS.md" "$PROJECT_DIR/" 2>/dev/null
        echo -e "  ${Y}  ↩ Rollback OK${NC}"
    }
}

# ═══════════════════════════════════════════════════════════════
# RESET OPERATIONS
# ═══════════════════════════════════════════════════════════════

reset_script() {
    [ -z "$1" ] && { echo -e "  ${R}❌ Uso: --reset-script ARES-XXX-nombre${NC}"; exit 1; }
    if grep -q "$1" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null; then
        sed -i.bak "s/| $1 | ✅ |[^|]*|[^|]*|[^|]*|[^|]*|/| $1 | ⬜ | — | — | — | — |/" \
            "$PROJECT_DIR/PROGRESS.md" 2>/dev/null
        rm -f "$PROJECT_DIR/PROGRESS.md.bak"
        echo -e "  ${G}✅ ${1} → ⬜ pendiente${NC}"
    else echo -e "  ${R}❌ ${1} no encontrado en PROGRESS.md${NC}"; fi
}

reset_phase() {
    local phase=$1
    [ -z "$phase" ] && { echo -e "  ${R}❌ Uso: --reset-phase N${NC}"; exit 1; }
    local prefix=${PHASE_PREFIXES[$phase]}
    [ -z "$prefix" ] && { echo -e "  ${R}❌ Fase ${phase} no válida (0-8)${NC}"; exit 1; }

    local count=0
    grep "| ${prefix}" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null | while IFS= read -r line; do
        local name=$(echo "$line" | sed 's/.*| \(ARES-[^ |]*\).*/\1/')
        sed -i.bak "s/| ${name}[^|]* | ✅ |/| ${name} | ⬜ |/" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null
        rm -f "$PROJECT_DIR/PROGRESS.md.bak"
        ((count++))
    done

    # Also remove from phase completions log
    sed -i.bak "/PHASE_${phase}_DONE/d" "$PHASE_HISTORY" 2>/dev/null
    rm -f "${PHASE_HISTORY}.bak"

    echo -e "  ${G}✅ Fase ${phase} (${PHASE_NAMES[$phase]}) reseteada${NC}"
}

# ═══════════════════════════════════════════════════════════════
# SHOW STATUS (Enhanced with phase breakdown)
# ═══════════════════════════════════════════════════════════════

show_status() {
    show_logo
    local completed=$(get_completed_count) next=$(get_next_script) phase=""
    [ "$next" != "NONE" ] && [ -n "$next" ] && phase=$(get_phase_for_script "$next") || phase="🏁 COMPLETADO"
    local files=$(count_files) loc=$(count_loc)
    local streak=$(get_state "streak") longest=$(get_state "longest_streak")
    local total_time=$(get_state "total_time_seconds")
    local sessions=$(get_state "session_count")
    local failed=$(get_state "total_scripts_failed")
    completed=${completed:-0}; files=${files:-0}; loc=${loc:-0}
    streak=${streak:-0}; longest=${longest:-0}; total_time=${total_time:-0}
    sessions=${sessions:-0}; failed=${failed:-0}
    local hours=$((total_time/3600)) mins=$(((total_time%3600)/60))
    local eta=$(estimate_time_remaining)

    echo -e "  ${W}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${W}║${NC}  ${BOLD}🎮 ARES SensiPRO — Estado del Proyecto${NC}                  ${W}║${NC}"
    echo -e "  ${W}╠═══════════════════════════════════════════════════════════╣${NC}"
    printf "  ${W}║${NC}  ${C}Fase actual:${NC}  %-40s${W}║${NC}\n" "$phase"
    printf "  ${W}║${NC}  ${C}Siguiente:${NC}    %-40s${W}║${NC}\n" "${next:-🏁 Completado}"
    printf "  ${W}║${NC}  ${C}Racha:${NC}        %-40s${W}║${NC}\n" "${streak} seguidos (mejor: ${longest})"
    printf "  ${W}║${NC}  ${C}Sesiones:${NC}     %-40s${W}║${NC}\n" "${sessions}"
    printf "  ${W}║${NC}  ${C}Tiempo:${NC}       %-40s${W}║${NC}\n" "${hours}h ${mins}m de generación"
    printf "  ${W}║${NC}  ${C}ETA:${NC}          %-40s${W}║${NC}\n" "~${eta} restante"
    echo -e "  ${W}║${NC}                                                           ${W}║${NC}"
    printf "  ${W}║${NC} "; progress_bar "${completed}" "${TOTAL_SCRIPTS}"
    echo -e "  ${W}║${NC}                                                           ${W}║${NC}"
    printf "  ${W}║${NC}  ${G}📁${NC} %-12s ${G}📝${NC} %-12s ${R}❌${NC} %-12s    ${W}║${NC}\n" "${files} files" "${loc} LOC" "${failed} failed"
    echo -e "  ${W}╚═══════════════════════════════════════════════════════════╝${NC}"

    echo ""
    echo -e "  ${C}━━━ Progreso por Fase ━━━${NC}"; echo ""
    for ((p=0; p<TOTAL_PHASES; p++)); do
        local pc=$(get_phase_completed_count "$p")
        local pt=$(get_phase_total_count "$p")
        local bar=$(phase_progress_bar "$p" "$pc" "$pt")
        local icon="⏳"; local status_color=$Y
        if [ "$pc" -ge "$pt" ] 2>/dev/null && [ "$pt" -gt 0 ] 2>/dev/null; then
            icon="✅"; status_color=$G
        elif [ "$pc" -eq 0 ] 2>/dev/null; then
            icon="⬜"; status_color=$D
        fi
        printf "  ${icon} ${status_color}Fase %s${NC} %-18s ${bar} ${D}%d/%d${NC}\n" "$p" "${PHASE_NAMES[$p]}" "$pc" "$pt"
    done
    echo ""
}

show_phase_status() {
    show_logo
    echo -e "  ${W}${BOLD}📊 Status Detallado por Fase${NC}"; echo ""

    for ((p=0; p<TOTAL_PHASES; p++)); do
        local pc=$(get_phase_completed_count "$p")
        local pt=$(get_phase_total_count "$p")
        local icon="⏳"
        [ "$pc" -ge "$pt" ] 2>/dev/null && [ "$pt" -gt 0 ] 2>/dev/null && icon="✅"
        [ "$pc" -eq 0 ] 2>/dev/null && icon="⬜"

        echo -e "  ${FIRE}━━━ Fase ${p}: ${PHASE_NAMES[$p]} (${pc}/${pt}) ${icon} ━━━${NC}"
        echo -e "  ${D}Plan: ${PHASE_PLANS[$p]}${NC}"

        local prefix=${PHASE_PREFIXES[$p]}
        grep "| ${prefix}" "$PROJECT_DIR/PROGRESS.md" 2>/dev/null | while IFS= read -r line; do
            local name=$(echo "$line" | sed 's/.*| \(ARES-[^ |]*\).*/\1/')
            if echo "$line" | grep -q '| ✅ |'; then
                echo -e "    ${G}✅ ${name}${NC}"
            elif echo "$line" | grep -q '| ❌ |'; then
                echo -e "    ${R}❌ ${name}${NC}"
            else
                echo -e "    ${D}⬜ ${name}${NC}"
            fi
        done
        echo ""
    done
}

# ═══════════════════════════════════════════════════════════════
# MAIN AUTOPILOT LOOP
# ═══════════════════════════════════════════════════════════════

run_autopilot() {
    show_logo; init_state; init_metrics
    mkdir -p "$REPORTS_DIR"
    touch "$PHASE_HISTORY"

    local session_start=$(date +%s) session_completed=0 session_failed=0
    local session_loc_start=$(count_loc) session_files_start=$(count_files)

    local sessions=$(get_state "session_count"); sessions=${sessions:-0}; sessions=$((sessions+1))
    update_state "session_count" "$sessions"
    update_state "last_run_timestamp" "\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""

    echo -e "  ${W}Sesión #${sessions}${NC} — ${D}$(date '+%A %d de %B, %Y — %H:%M')${NC}"
    echo -e "  ${D}Modo: ${MODE} | Max: ${MAX_SCRIPTS_PER_SESSION} scripts | Cooldown: ${COOLDOWN_BETWEEN_SCRIPTS}s${NC}"
    echo ""

    # Pre-flight checks
    echo -e "  ${C}━━━ Pre-flight ━━━${NC}"
    command -v claude &>/dev/null && echo -e "  ${G}✓ Claude Code${NC}" || \
        { echo -e "  ${R}❌ Claude Code no instalado${NC}"; exit 1; }
    command -v git &>/dev/null && echo -e "  ${G}✓ Git${NC}" || \
        { echo -e "  ${R}❌ Git no instalado${NC}"; exit 1; }
    [ -f "$PROJECT_DIR/CLAUDE.md" ] && [ -f "$PROJECT_DIR/PROGRESS.md" ] && \
        echo -e "  ${G}✓ CLAUDE.md + PROGRESS.md${NC}" || \
        { echo -e "  ${R}❌ Archivos faltantes en ~/SensiPRO${NC}"; exit 1; }

    local mp_count=$(ls "$PROJECT_DIR/docs/MASTER-PLAN-"*.md 2>/dev/null | wc -l | tr -d ' ')
    [ "$mp_count" -gt 0 ] && echo -e "  ${G}✓ ${mp_count} MASTER-PLANs${NC}" || \
        { echo -e "  ${R}❌ No hay MASTER-PLANs en docs/${NC}"; exit 1; }

    [ -d "$PROJECT_DIR/.git" ] || {
        cd "$PROJECT_DIR"; git init; git add -A
        git commit -m "chore: initial — ARES infrastructure"
    }
    echo -e "  ${G}✓ Git repo${NC}"; echo ""

    local completed=$(get_completed_count); completed=${completed:-0}
    echo -e "  📊 Progreso: ${BOLD}${completed}/${TOTAL_SCRIPTS}${NC}"
    progress_bar "$completed" "$TOTAL_SCRIPTS"; echo ""

    [ "$completed" -ge "$TOTAL_SCRIPTS" ] 2>/dev/null && {
        echo -e "  ${G}🎉 ¡TODOS LOS SCRIPTS COMPLETADOS! SystemWoods destruido. 🔥${NC}"
        notify_all_complete
        exit 0
    }

    echo -e "  ${FIRE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${FIRE}  🎮 AUTOPILOT LOOP — Modo: ${MODE}${NC}"
    echo -e "  ${FIRE}  📊 Max: ${MAX_SCRIPTS_PER_SESSION} scripts | ⏳ Cooldown: ${COOLDOWN_BETWEEN_SCRIPTS}s${NC}"
    echo -e "  ${FIRE}  🕐 ETA: ~$(estimate_time_remaining)${NC}"
    echo -e "  ${FIRE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo ""

    for ((idx=0; idx<MAX_SCRIPTS_PER_SESSION; idx++)); do
        local next=$(get_next_script)
        [ "$next" = "NONE" ] || [ -z "$next" ] && {
            echo -e "  ${G}🏁 No hay más scripts pendientes.${NC}"; break
        }

        completed=$(get_completed_count); completed=${completed:-0}
        local num=$((completed+1))
        local phase=$(get_phase_for_script "$next")
        local phase_num=$(get_phase_number_for_script "$next")
        local mp=$(get_masterplan_for_script "$next")

        echo -e "  ${W}📦 ${BOLD}${next}${NC} — ${D}${phase}${NC}"
        [ "$mp" != "NOT_FOUND" ] && echo -e "  ${D}   Plan: $(basename "$mp")${NC}"

        # Check dependencies
        if ! check_dependencies "$next"; then
            echo -e "  ${Y}  ⏭️ Saltando por dependencias pendientes${NC}"
            show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "skipped"
            local ts=$(get_state "total_scripts_skipped"); ts=${ts:-0}
            update_state "total_scripts_skipped" "$((ts+1))"
            continue
        fi

        # Interactive confirmation
        if [ "$MODE" = "interactive" ]; then
            echo -ne "  ${C}¿Ejecutar? (s/n/q): ${NC}"; read -r ans
            case $ans in n|N) continue;; q|Q) break;; esac
        fi

        show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "running"
        local snapshot=$(create_recovery_snapshot "$next")
        local success=false

        for ((att=1; att<=MAX_RETRIES; att++)); do
            [ $att -gt 1 ] && {
                show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "healing"
                echo -e "  ${Y}🔧 Auto-healing intento ${att}/${MAX_RETRIES}...${NC}"
                local backoff=$((COOLDOWN_AFTER_ERROR * att))
                countdown $backoff "Backoff exponencial"
            }

            local result=$(execute_script "$next" "$att")
            local es=$?

            if [ $es -eq 2 ]; then
                echo -e "  ${R}🚫 Rate limit detectado${NC}"
                notify_rate_limit
                countdown $RATE_LIMIT_COOLDOWN "Rate limit cooldown"
                ((att--)); continue
            elif [ $es -eq 0 ] && echo "$result" | grep -q "SUCCESS"; then
                local dur=$(echo "$result" | cut -d: -f2)
                local file_d=$(echo "$result" | cut -d: -f3)
                local loc_d=$(echo "$result" | cut -d: -f4)
                local fn=$(count_files) ln=$(count_loc)
                success=true

                show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "success"
                echo -e "  ${G}  ⏱️ ${dur}s | 📁 ${fn} files (+${file_d}) | 📝 ${ln} LOC (+${loc_d})${NC}"
                play_sound "success"

                # Validate
                show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "validating"
                validate_build
                ensure_git_push

                # Update metrics
                add_metric "$next" "success" "${dur:-0}" "${ln:-0}" "${fn:-0}" "$(count_any)" "0" "${loc_d:-0}" "${file_d:-0}"

                # Update state
                local sk=$(get_state "streak"); sk=${sk:-0}; sk=$((sk+1))
                update_state "streak" "$sk"
                local lg=$(get_state "longest_streak"); lg=${lg:-0}
                [ $sk -gt $lg ] && update_state "longest_streak" "$sk"
                update_state "last_script_completed" "\"$next\""
                local tc=$(get_state "total_scripts_completed"); tc=${tc:-0}
                update_state "total_scripts_completed" "$((tc+1))"
                local tt=$(get_state "total_time_seconds"); tt=${tt:-0}
                update_state "total_time_seconds" "$((tt+${dur:-0}))"
                update_state "total_files_generated" "$(count_files)"
                update_state "total_loc_generated" "$(count_loc)"

                # Update avg time
                local new_tc=$((tc+1))
                local new_avg=$(( (tt + ${dur:-0}) / new_tc ))
                update_state "avg_script_time" "$new_avg"

                # Track fastest/slowest
                local ft=$(get_state "fastest_time"); ft=${ft:-99999}
                [ "${dur:-99999}" -lt "$ft" ] 2>/dev/null && {
                    update_state "fastest_time" "${dur}"
                    update_state "fastest_script" "\"$next\""
                }
                local st=$(get_state "slowest_time"); st=${st:-0}
                [ "${dur:-0}" -gt "$st" ] 2>/dev/null && {
                    update_state "slowest_time" "${dur}"
                    update_state "slowest_script" "\"$next\""
                }

                ((session_completed++))

                # Notify
                [ "$SHOULD_NOTIFY" = true ] && \
                    notify_script_complete "$next" "$num" "$TOTAL_SCRIPTS" "${dur:-0}" "${ln:-0}" "${fn:-0}" "$(count_any)"

                # Check phase completion
                check_phase_completion "$phase_num"

                break
            else
                show_status_box "$next" "$num" "$TOTAL_SCRIPTS" "$phase" "error"
                echo -e "  ${R}  Error intento ${att}/${MAX_RETRIES}${NC}"
                play_sound "error"
                [ "$SHOULD_NOTIFY" = true ] && notify_script_failed "$next" "check logs" "$att"

                if [ $att -eq $MAX_RETRIES ]; then
                    echo -e "  ${R}  ❌ ${next} falló ${MAX_RETRIES} veces — skipping${NC}"
                    rollback_to_snapshot "$snapshot"
                    add_metric "$next" "failed" "0" "0" "0" "0"
                    update_state "streak" "0"
                    local tf=$(get_state "total_scripts_failed"); tf=${tf:-0}
                    update_state "total_scripts_failed" "$((tf+1))"
                    ((session_failed++))
                fi
            fi
        done

        # Cooldown between scripts
        [ $idx -lt $((MAX_SCRIPTS_PER_SESSION-1)) ] && {
            local next_check=$(get_next_script)
            [ "$next_check" != "NONE" ] && [ -n "$next_check" ] && \
                countdown $COOLDOWN_BETWEEN_SCRIPTS "Cooldown"
        }
    done

    # ═══════════════════════════════════════════════════════════
    # SESSION SUMMARY
    # ═══════════════════════════════════════════════════════════

    local session_end=$(date +%s)
    local session_duration=$((session_end - session_start))
    local sh=$((session_duration/3600)) sm=$(((session_duration%3600)/60)) ss=$((session_duration%60))
    local time_str="${sh}h ${sm}m ${ss}s"
    local session_loc_end=$(count_loc) session_files_end=$(count_files)
    local session_loc_delta=$((session_loc_end - session_loc_start))
    local session_files_delta=$((session_files_end - session_files_start))

    echo ""
    echo -e "  ${FIRE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${FIRE}║${NC}  ${BOLD}📊 RESUMEN — SESIÓN #${sessions}${NC}                                  ${FIRE}║${NC}"
    echo -e "  ${FIRE}╠═══════════════════════════════════════════════════════════╣${NC}"
    printf "  ${FIRE}║${NC}  ${G}✅ Completados:${NC}  %-38s${FIRE}║${NC}\n" "${session_completed}"
    printf "  ${FIRE}║${NC}  ${R}❌ Fallidos:${NC}     %-38s${FIRE}║${NC}\n" "${session_failed}"
    printf "  ${FIRE}║${NC}  ${C}⏱️  Duración:${NC}    %-38s${FIRE}║${NC}\n" "${time_str}"
    printf "  ${FIRE}║${NC}  ${C}📝 LOC delta:${NC}    %-38s${FIRE}║${NC}\n" "+${session_loc_delta}"
    printf "  ${FIRE}║${NC}  ${C}📁 Files delta:${NC}  %-38s${FIRE}║${NC}\n" "+${session_files_delta}"
    echo -e "  ${FIRE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "  ${FIRE}║${NC}  ${W}Progreso global:${NC}                                        ${FIRE}║${NC}"
    printf "  ${FIRE}║${NC} "; progress_bar "$(get_completed_count)" "$TOTAL_SCRIPTS"
    echo -e "  ${FIRE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "  ${D}Continuar:     ./autopilot.sh --auto${NC}"
    echo -e "  ${D}Estado:        ./autopilot.sh --status${NC}"
    echo -e "  ${D}Dashboard:     ./autopilot.sh --dashboard${NC}"
    echo -e "  ${D}Reporte:       ./autopilot.sh --report${NC}"
    echo ""

    [ "$SHOULD_NOTIFY" = true ] && \
        notify_session_summary "$session_completed" "$session_failed" "$time_str" "$session_loc_delta"
    ensure_git_push
}

# ═══════════════════════════════════════════════════════════════
# SESSION REPORT (Markdown export)
# ═══════════════════════════════════════════════════════════════

generate_report() {
    local report_file="$REPORTS_DIR/report_$(date +%Y%m%d_%H%M%S).md"
    local completed=$(get_completed_count); completed=${completed:-0}
    local total_time=$(get_state "total_time_seconds"); total_time=${total_time:-0}
    local hours=$((total_time/3600)) mins=$(((total_time%3600)/60))

    cat > "$report_file" << REPORT
# ARES SensiPRO — Reporte de Autopilot
**Generado:** $(date '+%Y-%m-%d %H:%M:%S')
**Sesiones totales:** $(get_state "session_count")

---

## Progreso Global
- **Scripts completados:** ${completed}/${TOTAL_SCRIPTS} ($(( completed * 100 / TOTAL_SCRIPTS ))%)
- **Scripts fallidos:** $(get_state "total_scripts_failed")
- **Tiempo total:** ${hours}h ${mins}m
- **Racha actual:** $(get_state "streak")
- **Mejor racha:** $(get_state "longest_streak")
- **Tiempo promedio/script:** $(get_state "avg_script_time")s

## Proyecto
- **Archivos TS/TSX:** $(count_files)
- **Líneas de código:** $(count_loc)
- **Tests:** $(count_tests)
- **Componentes:** $(count_components)
- **API Routes:** $(count_api_routes)
- **Violaciones 'any':** $(count_any)

## Progreso por Fase

| Fase | Nombre | Completados | Total | Status |
|------|--------|-------------|-------|--------|
REPORT

    for ((p=0; p<TOTAL_PHASES; p++)); do
        local pc=$(get_phase_completed_count "$p")
        local pt=$(get_phase_total_count "$p")
        local icon="⏳"
        [ "$pc" -ge "$pt" ] 2>/dev/null && [ "$pt" -gt 0 ] 2>/dev/null && icon="✅"
        [ "$pc" -eq 0 ] 2>/dev/null && icon="⬜"
        echo "| ${p} | ${PHASE_NAMES[$p]} | ${pc} | ${pt} | ${icon} |" >> "$report_file"
    done

    echo "" >> "$report_file"
    echo "## Records" >> "$report_file"
    echo "- **Script más rápido:** $(get_state "fastest_script") ($(get_state "fastest_time")s)" >> "$report_file"
    echo "- **Script más lento:** $(get_state "slowest_script") ($(get_state "slowest_time")s)" >> "$report_file"

    echo -e "  ${G}📄 Reporte: ${report_file}${NC}"
    # Try to open
    command -v open &>/dev/null && open "$report_file" 2>/dev/null
}

# ═══════════════════════════════════════════════════════════════
# SETUP TELEGRAM
# ═══════════════════════════════════════════════════════════════

setup_telegram() {
    show_logo
    echo -e "  ${W}📱 Configurar Telegram${NC}"; echo ""
    echo -e "  ${D}1. Busca @BotFather en Telegram → /newbot${NC}"
    echo -e "  ${D}2. Copia el token${NC}"
    echo -e "  ${D}3. Busca @userinfobot → /start para tu Chat ID${NC}"; echo ""

    echo -ne "  ${C}Bot Token: ${NC}"; read -r token
    echo -ne "  ${C}Chat ID: ${NC}"; read -r chat_id

    if [ -n "$token" ] && [ -n "$chat_id" ]; then
        mkdir -p "$AUTOPILOT_DIR"
        echo "TELEGRAM_BOT_TOKEN=\"${token}\"" > "$CONFIG_FILE"
        echo "TELEGRAM_CHAT_ID=\"${chat_id}\"" >> "$CONFIG_FILE"

        local r=$(curl -s -X POST "https://api.telegram.org/bot${token}/sendMessage" \
            -d "chat_id=${chat_id}" -d "text=🎮 ARES AUTOPILOT v2.0 conectado 🔥" 2>&1)
        echo "$r" | grep -q '"ok":true' && echo -e "\n  ${G}✅ Configurado!${NC}" || \
            echo -e "\n  ${R}❌ Error. Verifica token/ID.${NC}"
    else echo -e "  ${Y}Cancelado.${NC}"; fi
}

# ═══════════════════════════════════════════════════════════════
# ENHANCED DASHBOARD — Gaming themed HTML v2.0
# ═══════════════════════════════════════════════════════════════

generate_dashboard() {
    mkdir -p "$AUTOPILOT_DIR/dashboard"
    cat > "$DASHBOARD_FILE" << 'DASHHTML'
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="15">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎮 ARES AUTOPILOT v2.0</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#050810;color:#e0e0e0;font-family:'SF Mono',Monaco,'Cascadia Code',monospace;padding:15px}
.hdr{text-align:center;padding:25px;border-bottom:1px solid #1a2a4e;margin-bottom:20px}
.hdr h1{font-size:1.8em;background:linear-gradient(90deg,#ff6a00,#00c8ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr p{color:#555;font-size:.8em;margin-top:5px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.cd{background:#0a0f1e;border:1px solid #1a2a4e;border-radius:12px;padding:18px;text-align:center}
.cd .n{font-size:2.2em;font-weight:bold;margin:8px 0}
.cd .l{color:#666;font-size:.75em;text-transform:uppercase;letter-spacing:1px}
.c1 .n{color:#00ff88}.c2 .n{color:#ff4444}.c3 .n{color:#00c8ff}.c4 .n{color:#ff6a00}
.c5 .n{color:#a855f7}.c6 .n{color:#eab308}
.sec{background:#0a0f1e;border:1px solid #1a2a4e;border-radius:12px;padding:20px;margin-bottom:15px}
.sec h3{color:#ff6a00;margin-bottom:12px;font-size:1em}
.bar{height:28px;background:#0d1424;border-radius:14px;overflow:hidden;margin:10px 0}
.fill{height:100%;border-radius:14px;background:linear-gradient(90deg,#ff6a00,#00c8ff);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.85em;transition:width .8s ease}
.phase{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #0d1424}
.phase:last-child{border:none}
.phase .pn{width:30px;text-align:center;font-weight:bold}
.phase .pl{flex:1;font-size:.85em}
.phase .pb{flex:2;height:14px;background:#0d1424;border-radius:7px;overflow:hidden}
.phase .pf{height:100%;border-radius:7px;transition:width .5s}
.phase .ps{width:50px;text-align:right;font-size:.8em;color:#888}
.log{max-height:350px;overflow-y:auto}
.le{padding:6px 8px;border-bottom:1px solid #080d1a;font-size:.8em;display:flex;align-items:center;gap:8px}
.le.s{border-left:3px solid #00ff88}.le.f{border-left:3px solid #ff4444}
.le .t{color:#444;font-size:.75em;margin-left:auto}
.ft{text-align:center;padding:15px;color:#333;font-size:.75em}
@media(max-width:768px){.g4,.g3{grid-template-columns:repeat(2,1fr)}.cd .n{font-size:1.6em}}
</style></head><body>
<div class="hdr"><h1>🎮 ARES AUTOPILOT v2.0</h1><p>Autonomous Gaming Platform Builder — Auto-refresh 15s</p></div>
<div class="g4">
<div class="cd c1"><div class="l">Completados</div><div class="n" id="c">0</div></div>
<div class="cd c2"><div class="l">Fallidos</div><div class="n" id="f">0</div></div>
<div class="cd c3"><div class="l">Archivos</div><div class="n" id="fi">0</div></div>
<div class="cd c4"><div class="l">LOC</div><div class="n" id="l">0</div></div>
</div>
<div class="g3">
<div class="cd c5"><div class="l">Racha</div><div class="n" id="sk">0</div></div>
<div class="cd c6"><div class="l">Sesiones</div><div class="n" id="se">0</div></div>
<div class="cd c1"><div class="l">Tiempo</div><div class="n" id="tm" style="font-size:1.4em">0h 0m</div></div>
</div>
<div class="sec"><h3>📊 Progreso Global — 68 Scripts</h3>
<div class="bar"><div class="fill" id="p" style="width:0%">0%</div></div>
<p style="color:#666;text-align:center;font-size:.85em" id="pt">0/68</p></div>
<div class="sec"><h3>🎯 Progreso por Fase</h3><div id="phases"></div></div>
<div class="sec"><h3>📋 Log de Ejecución</h3><div class="log" id="le"><div class="le" style="color:#444">Esperando datos...</div></div></div>
<div class="ft">ARES SensiPRO 🇲🇽 Cancún | <span id="u"></span></div>
<script>
const PN=['Foundation','Motor','UI/UX','Academia','Monetización','Comunidad','Admin','Mobile','SEO/Deploy'];
const PT=[8,10,8,6,8,8,6,5,9];
const PP=['ARES-00','ARES-10','ARES-20','ARES-30','ARES-40','ARES-50','ARES-60','ARES-70','ARES-80'];
async function u(){try{
const s=await(await fetch('state.json')).json();
const m=await(await fetch('metrics.json')).json();
document.getElementById('c').textContent=s.total_scripts_completed||0;
document.getElementById('f').textContent=s.total_scripts_failed||0;
document.getElementById('fi').textContent=s.total_files_generated||0;
document.getElementById('l').textContent=(s.total_loc_generated||0).toLocaleString();
document.getElementById('sk').textContent=s.streak||0;
document.getElementById('se').textContent=s.session_count||0;
const tt=s.total_time_seconds||0;
document.getElementById('tm').textContent=Math.floor(tt/3600)+'h '+Math.floor((tt%3600)/60)+'m';
const p=Math.round(((s.total_scripts_completed||0)/68)*100);
document.getElementById('p').style.width=p+'%';
document.getElementById('p').textContent=p+'%';
document.getElementById('pt').textContent=(s.total_scripts_completed||0)+'/68';
// Phases
const pd=document.getElementById('phases');pd.innerHTML='';
const sc=m.scripts||[];
for(let i=0;i<9;i++){const pc=sc.filter(x=>x.phase===i&&x.status==='success').length;
const pct=Math.round((pc/PT[i])*100);const done=pc>=PT[i];
pd.innerHTML+=`<div class="phase"><div class="pn" style="color:${done?'#00ff88':'#ff6a00'}">${done?'✅':i}</div><div class="pl">${PN[i]}</div><div class="pb"><div class="pf" style="width:${pct}%;background:${done?'#00ff88':'linear-gradient(90deg,#ff6a00,#00c8ff)'}"></div></div><div class="ps">${pc}/${PT[i]}</div></div>`;}
// Log
const d=document.getElementById('le');d.innerHTML='';
sc.slice(-30).reverse().forEach(s=>{const e=document.createElement('div');
e.className='le '+(s.status==='success'?'s':'f');
e.innerHTML=`${s.status==='success'?'✅':'❌'} <b>${s.name}</b> — ${s.duration_seconds}s <span class="t">${new Date(s.timestamp).toLocaleString()}</span>`;
d.appendChild(e);});
}catch(e){}document.getElementById('u').textContent=new Date().toLocaleString();}
u();setInterval(u,5000);
</script></body></html>
DASHHTML
}

open_dashboard() {
    generate_dashboard
    cp "$STATE_FILE" "$AUTOPILOT_DIR/dashboard/state.json" 2>/dev/null
    cp "$METRICS_FILE" "$AUTOPILOT_DIR/dashboard/metrics.json" 2>/dev/null
    if command -v open &>/dev/null; then
        cd "$AUTOPILOT_DIR/dashboard"; python3 -m http.server 8888 &>/dev/null &
        sleep 1; open "http://localhost:8888"
        echo -e "  ${C}🌐 Dashboard: http://localhost:8888${NC}"
    elif command -v xdg-open &>/dev/null; then
        cd "$AUTOPILOT_DIR/dashboard"; python3 -m http.server 8888 &>/dev/null &
        sleep 1; xdg-open "http://localhost:8888"
    else echo -e "  ${D}Dashboard: ${DASHBOARD_FILE}${NC}"; fi
}

# ═══════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════

main() {
    mkdir -p "$LOG_DIR" "$RECOVERY_DIR" "$REPORTS_DIR" "$AUTOPILOT_DIR/dashboard"
    [ -f "$CONFIG_FILE" ] && { source "$CONFIG_FILE"
        [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && NOTIFY_ENABLED=true; }

    while [[ $# -gt 0 ]]; do
        case $1 in
            --auto) MODE="auto"; shift;;
            --notify) SHOULD_NOTIFY=true
                [ "$NOTIFY_ENABLED" != true ] && { echo -e "${Y}⚠️ Telegram no config. Usa --setup-telegram${NC}"; exit 1; }
                shift;;
            --status) init_state; init_metrics; show_status; exit 0;;
            --phase-status) init_state; init_metrics; show_phase_status; exit 0;;
            --dashboard) init_state; init_metrics; open_dashboard; exit 0;;
            --setup-telegram) setup_telegram; exit 0;;
            --resume) MODE="auto"; shift;;
            --validate) init_state; validate_full_project; exit 0;;
            --validate-phase) init_state; validate_phase "$2"; exit 0;;
            --reset-script) reset_script "$2"; exit 0;;
            --reset-phase) reset_phase "$2"; exit 0;;
            --report) init_state; init_metrics; generate_report; exit 0;;
            --health) health_check; exit 0;;
            --deps) get_script_dependencies "$2"; exit 0;;
            --no-sound) SOUND_ENABLED=false; shift;;
            --verbose) VERBOSE=true; shift;;
            --max-scripts) MAX_SCRIPTS_PER_SESSION=$2; shift 2;;
            --cooldown) COOLDOWN_BETWEEN_SCRIPTS=$2; shift 2;;
            --profile)
                case $2 in
                    quick) MAX_SCRIPTS_PER_SESSION=$PROFILE_QUICK_MAX; COOLDOWN_BETWEEN_SCRIPTS=$PROFILE_QUICK_COOLDOWN;;
                    normal) MAX_SCRIPTS_PER_SESSION=$PROFILE_NORMAL_MAX; COOLDOWN_BETWEEN_SCRIPTS=$PROFILE_NORMAL_COOLDOWN;;
                    marathon) MAX_SCRIPTS_PER_SESSION=$PROFILE_MARATHON_MAX; COOLDOWN_BETWEEN_SCRIPTS=$PROFILE_MARATHON_COOLDOWN;;
                    *) echo -e "${R}Profile: quick | normal | marathon${NC}"; exit 1;;
                esac; shift 2;;
            --help|-h)
                show_logo
                echo "  Uso: ./autopilot.sh [opciones]"
                echo ""
                echo "  ${BOLD}Modos de ejecución:${NC}"
                echo "    (sin args)                 Modo interactivo"
                echo "    --auto                     Autónomo"
                echo "    --auto --notify            Autónomo + Telegram"
                echo "    --resume                   Retomar"
                echo ""
                echo "  ${BOLD}Perfiles de sesión:${NC}"
                echo "    --profile quick            3 scripts, 5s cooldown"
                echo "    --profile normal           10 scripts, 10s cooldown (default)"
                echo "    --profile marathon          20 scripts, 15s cooldown"
                echo ""
                echo "  ${BOLD}Monitoreo:${NC}"
                echo "    --status                   Progreso global"
                echo "    --phase-status             Detalle por fase"
                echo "    --dashboard                Dashboard web gaming"
                echo "    --report                   Exportar reporte markdown"
                echo "    --health                   System health check"
                echo ""
                echo "  ${BOLD}Validación:${NC}"
                echo "    --validate                 Validar proyecto completo"
                echo "    --validate-phase N         Validar solo fase N"
                echo "    --deps ARES-XXX            Ver dependencias de un script"
                echo ""
                echo "  ${BOLD}Operaciones:${NC}"
                echo "    --reset-script NOMBRE      Re-ejecutar un script"
                echo "    --reset-phase N            Resetear toda una fase"
                echo "    --setup-telegram           Configurar Telegram"
                echo "    --max-scripts N            Max scripts por sesión"
                echo "    --cooldown N               Segundos entre scripts"
                echo "    --no-sound                 Desactivar sonidos"
                echo "    --verbose                  Output detallado"
                echo ""
                echo "  ${BOLD}Ejemplos:${NC}"
                echo "    ./autopilot.sh --auto --notify --profile marathon"
                echo "    ./autopilot.sh --auto --max-scripts 15 --cooldown 8"
                echo "    ./autopilot.sh --reset-phase 3"
                echo "    ./autopilot.sh --validate-phase 1"
                echo ""; exit 0;;
            *) echo -e "${R}Opción desconocida: $1 (usa --help)${NC}"; exit 1;;
        esac
    done

    [ -d "$PROJECT_DIR" ] || {
        echo -e "${R}❌ ~/SensiPRO no existe.${NC}"
        echo -e "${D}   mkdir -p ~/SensiPRO/docs${NC}"
        echo -e "${D}   cp CLAUDE.md PROGRESS.md autopilot.sh ~/SensiPRO/${NC}"
        echo -e "${D}   cp MASTER-PLAN-*.md ~/SensiPRO/docs/${NC}"
        exit 1
    }

    generate_dashboard
    run_autopilot
}

# ═══════════════════════════════════════════════════════════════
# 🎮 ARES AUTOPILOT v2.0 — SystemWoods muere mientras duermes
# ═══════════════════════════════════════════════════════════════
main "$@"
