import './ClaudeCodePage.css';

const CLI_FLAGS = [
  { flag: '-p', desc: 'Print mode — one query then exit', example: 'claude -p "list TODOs"' },
  { flag: '-c', desc: 'Continue most recent session', example: 'claude -c' },
  { flag: '-r / --resume', desc: 'Resume a named or numbered session', example: 'claude -r "auth-refactor"' },
  { flag: '-n / --name', desc: 'Name session at startup', example: 'claude -n "feature-x"' },
  { flag: '--model', desc: 'Override model for this session', example: 'claude --model opus' },
  { flag: '--max-turns', desc: 'Limit autonomous turns', example: 'claude -p "fix" --max-turns 10' },
  { flag: '--output-format', desc: 'text, json, or stream-json output', example: '--output-format json' },
  { flag: '--allowedTools', desc: 'Restrict available tools', example: '--allowedTools "Edit,Bash(npm:*)"' },
  { flag: '--permission-mode', desc: 'Set permission mode', example: '--permission-mode auto' },
  { flag: '--enable-auto-mode', desc: 'Start with Auto Mode enabled', example: 'claude --enable-auto-mode' },
  { flag: '--dangerously-skip-permissions', desc: 'Skip all prompts (YOLO mode)', example: '⚠ CI only' },
  { flag: '--from-pr', desc: 'Link session to a PR/MR/URL', example: 'claude --from-pr 123' },
  { flag: '--fork-session', desc: 'Fork from a resumed session', example: 'claude -r base --fork-session' },
  { flag: '-w', desc: 'Start in isolated git worktree', example: 'claude -w' },
  { flag: '--bare', desc: 'Skip hooks, LSP, plugins (scripted)', example: 'claude -p "..." --bare' },
  { flag: '--plugin-dir', desc: 'Load plugin directory or .zip', example: 'claude --plugin-dir ./my-plugin.zip' },
  { flag: '--channels', desc: 'Relay prompts to Telegram/Discord', example: 'claude --channels' },
  { flag: '--debug', desc: 'Enable debug logging', example: 'claude --debug' },
  { flag: '--init', desc: 'Initialize project with CLAUDE.md', example: 'claude --init' },
];

const ENV_VARS = [
  { name: 'ANTHROPIC_API_KEY', desc: 'API key for authentication' },
  { name: 'CLAUDE_CODE_EFFORT_LEVEL', desc: 'low / medium / high thinking effort' },
  { name: 'ANTHROPIC_MODEL', desc: 'Default model override' },
  { name: 'ANTHROPIC_SMALL_FAST_MODEL', desc: 'Fast model for lightweight tasks' },
  { name: 'CLAUDE_CODE_MAX_OUTPUT_TOKENS', desc: 'Output token limit per turn' },
  { name: 'HTTP_PROXY / HTTPS_PROXY', desc: 'Proxy configuration' },
  { name: 'ANTHROPIC_BASE_URL', desc: 'Custom API endpoint (enterprise)' },
];

const SESSION_CMDS = [
  { cmd: '/compact', desc: 'Condense history. Add focus: /compact focus on tests' },
  { cmd: '/context', desc: 'View context window usage & suggestions' },
  { cmd: '/usage', desc: 'Token usage, cost, plan usage dashboard' },
  { cmd: '/clear', desc: 'Clear conversation history' },
  { cmd: '/resume', desc: 'Resume a session: /resume 1 or /resume name' },
  { cmd: '/rename', desc: 'Name current session: /rename feature-auth' },
  { cmd: '/branch', desc: 'Branch conversation for parallel exploration' },
  { cmd: '/rewind', desc: 'Return to checkpoint (or Esc Esc)' },
  { cmd: '/export', desc: 'Export conversation transcript' },
  { cmd: '/memory', desc: 'View and manage auto-memory files' },
  { cmd: '/goal', desc: 'Set completion condition; Claude runs until met' },
];

const CONFIG_CMDS = [
  { cmd: '/model', desc: 'Change model: /model opus, /model haiku' },
  { cmd: '/fast', desc: 'Toggle fast output mode' },
  { cmd: '/effort', desc: 'Set effort: low / medium / high' },
  { cmd: '/permissions', desc: 'Manage permission settings interactively' },
  { cmd: '/config', desc: 'Open full settings interface' },
  { cmd: '/hooks', desc: 'View hook configuration' },
  { cmd: '/mcp', desc: 'Configure MCP servers: /mcp enable' },
  { cmd: '/add-dir', desc: 'Add working directories for file access' },
  { cmd: '/init', desc: 'Initialize project with CLAUDE.md' },
  { cmd: '/status', desc: 'View session state, model, settings' },
  { cmd: '/theme', desc: 'Manage named themes (plugins can ship themes)' },
  { cmd: '/color', desc: 'Set prompt-bar color: /color default to reset' },
];

const CODING_CMDS = [
  { cmd: '/plan', desc: 'Enter plan mode: /plan refactor auth' },
  { cmd: '/simplify', desc: 'Review code for simplification opportunities' },
  { cmd: '/batch', desc: 'Perform batch operations' },
  { cmd: '/security-review', desc: 'Review code for vulnerabilities' },
  { cmd: '/agents', desc: 'Manage subagents' },
  { cmd: '/tasks', desc: 'List background agents' },
  { cmd: '/bashes', desc: 'List background bash tasks' },
  { cmd: '/loop', desc: 'Recurring task: /loop 5m /foo every 5 min' },
  { cmd: '/skills', desc: 'List installed skills with search box' },
  { cmd: '/claude-api', desc: 'Build apps with Anthropic SDK' },
  { cmd: '/copy', desc: 'Copy code blocks: /copy N for Nth response' },
  { cmd: '/voice', desc: 'Toggle push-to-talk voice mode' },
];

const SHORTCUTS = [
  { key: 'Ctrl+C', action: 'Cancel current operation', key2: 'Ctrl+B', action2: 'Background current operation' },
  { key: 'Ctrl+D', action: 'Exit session (EOF)', key2: 'Ctrl+X Ctrl+K', action2: 'Stop all agents' },
  { key: 'Ctrl+L', action: 'Clear screen (keeps history)', key2: 'Ctrl+S', action2: 'Stash prompt draft' },
  { key: 'Ctrl+O', action: 'Toggle verbose output', key2: 'Ctrl+G', action2: 'Open external editor' },
  { key: 'Ctrl+R', action: 'Search command history', key2: 'Ctrl+T', action2: 'Toggle syntax highlighting' },
  { key: 'Ctrl+V', action: 'Paste image from clipboard', key2: 'Esc Esc', action2: 'Rewind last change' },
  { key: 'Tab', action: 'Accept prompt suggestion', key2: '! Tab', action2: 'Bash history autocomplete' },
  { key: 'Shift+Tab', action: 'Cycle permission modes', key2: 'Shift+Down', action2: 'Cycle agent team' },
  { key: 'Alt+P / Option+P', action: 'Switch models while typing', key2: 'Alt+T', action2: 'Toggle thinking mode' },
  { key: 'Up / Down', action: 'Navigate command history', key2: '?', action2: 'Show all shortcuts' },
];

const UTILITY_CMDS = [
  { cmd: '/doctor', desc: 'Check installation health' },
  { cmd: '/bug', desc: 'Report a bug to Anthropic' },
  { cmd: '/release-notes', desc: 'Browse version changelogs' },
  { cmd: '/powerup', desc: 'Interactive feature lessons with demos' },
  { cmd: '/login', desc: 'Authenticate in session' },
  { cmd: '/logout', desc: 'Sign out in session' },
  { cmd: '/plugin', desc: 'Manage plugins' },
  { cmd: '/buddy', desc: 'Terminal companion pet' },
];

const CONFIG_FILES = [
  { priority: '1', file: 'managed-settings.json', scope: 'Enterprise (locked)' },
  { priority: '2', file: 'CLI flags', scope: 'Current session' },
  { priority: '3', file: '.claude/settings.local.json', scope: 'Personal, per-project' },
  { priority: '4', file: '.claude/settings.json', scope: 'Team (git tracked)' },
  { priority: '5', file: '~/.claude/settings.json', scope: 'User global' },
  { priority: '6', file: '~/.claude.json', scope: 'OAuth tokens, MCP' },
];

export default function ClaudeCodePage() {
  return (
    <div className="cc-grid">

      {/* ── Installation & Auth ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">⚙</span>
          <span className="cc-card__title">Installation &amp; Auth</span>
        </div>
        <div className="cc-card__body">
          <div className="cc-install-block">
            <div className="cc-install-label">Recommended</div>
            <code>curl -fsSL https://claude.ai/install.sh | bash</code>
          </div>
          <div className="cc-install-block">
            <div className="cc-install-label">macOS (Homebrew)</div>
            <code>brew install --cask claude-code</code>
          </div>
          <div className="cc-install-block">
            <div className="cc-install-label">Verify</div>
            <code>claude doctor</code>
          </div>
          <div className="cc-install-block">
            <div className="cc-install-label">Auth</div>
            <code>claude auth login</code>
            <code>claude auth status</code>
            <code>claude auth logout</code>
          </div>
        </div>
      </div>

      {/* ── Quick Prefixes ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">⚡</span>
          <span className="cc-card__title">Quick Prefixes</span>
        </div>
        <div className="cc-card__body">
          <div className="cc-prefix-row">
            <span className="cc-prefix-sym cc-sym-slash">/</span>
            <div><span className="cc-desc">Slash command</span> &nbsp;<span className="cc-code">/compact</span></div>
          </div>
          <div className="cc-prefix-row">
            <span className="cc-prefix-sym cc-sym-bang">!</span>
            <div><span className="cc-desc">Run bash directly</span> &nbsp;<span className="cc-code">! git status</span></div>
          </div>
          <div className="cc-prefix-row">
            <span className="cc-prefix-sym cc-sym-at">@</span>
            <div><span className="cc-desc">Reference a file</span> &nbsp;<span className="cc-code">@src/index.ts</span></div>
          </div>
          <div className="cc-prefix-row">
            <span className="cc-prefix-sym cc-sym-hash">#</span>
            <div><span className="cc-desc">Add to memory</span> &nbsp;<span className="cc-code"># Always use TS</span></div>
          </div>
          <div className="cc-prefix-row">
            <span className="cc-prefix-sym cc-sym-amp">&amp;</span>
            <div><span className="cc-desc">Send to cloud agent</span> &nbsp;<span className="cc-code">&amp; Build the API</span></div>
          </div>
          <div className="cc-multiline">
            <div className="cc-multiline-label">Multiline Input</div>
            <div className="cc-multiline-entries">
              <span><span className="cc-code">\</span> + <span className="cc-code">Enter</span> — escape newline</span>
              <span><span className="cc-code">Option+Enter</span> — macOS</span>
              <span><span className="cc-code">Shift+Enter</span> — modern terminals</span>
              <span><span className="cc-code">Ctrl+J</span> — control char</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Permission Modes ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">🛡</span>
          <span className="cc-card__title">Permission Modes</span>
        </div>
        <div className="cc-card__body" style={{ padding: 0 }}>
          {[
            { name: 'default', desc: 'Prompts on first use of each tool', use: 'dev work' },
            { name: 'acceptEdits', desc: 'Auto-approves file edits, prompts for bash', use: 'trusted repos' },
            { name: 'auto', desc: 'AI classifier reviews each action for safety', use: 'autonomous' },
            { name: 'plan', desc: 'Read-only — no edits or execution', use: 'analysis' },
            { name: 'bypassPermissions', desc: 'Skips all prompts — CI/CD use only', use: 'CI only' },
          ].map(m => (
            <div key={m.name} className="cc-mode-row">
              <span className="cc-mode-name">{m.name}</span>
              <span className="cc-desc">{m.desc}</span>
              <span className="cc-mode-use">{m.use}</span>
            </div>
          ))}
          <div className="cc-note">
            <span className="cc-key">Shift+Tab</span> cycles modes · Auto Mode = recommended replacement for <span className="cc-code">--dangerously-skip-permissions</span>
          </div>
        </div>
      </div>

      {/* ── CLI Flags ── */}
      <div className="cc-card cc-span-2">
        <div className="cc-card__header">
          <span className="cc-card__icon">⌨</span>
          <span className="cc-card__title">CLI Flags</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <thead><tr><th>Flag</th><th>Description</th><th>Example</th></tr></thead>
            <tbody>
              {CLI_FLAGS.map(f => (
                <tr key={f.flag}>
                  <td><span className="cc-flag">{f.flag}</span></td>
                  <td className="cc-desc">{f.desc}</td>
                  <td><span className="cc-code">{f.example}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Env Variables ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">🌐</span>
          <span className="cc-card__title">Env Variables</span>
        </div>
        <div className="cc-card__body" style={{ padding: 0 }}>
          {ENV_VARS.map(e => (
            <div key={e.name} className="cc-env-row">
              <span className="cc-env">{e.name}</span>
              <span className="cc-env-desc">{e.desc}</span>
            </div>
          ))}
          <div className="cc-note">
            Set in shell or in <span className="cc-code">settings.json</span> under <span className="cc-code">"env": {'{ ... }'}</span>
          </div>
        </div>
      </div>

      <div className="cc-section-label">Slash Commands</div>

      {/* ── Session & Context ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">💬</span>
          <span className="cc-card__title">Session &amp; Context</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <tbody>
              {SESSION_CMDS.map(c => (
                <tr key={c.cmd}>
                  <td><span className="cc-cmd">{c.cmd}</span></td>
                  <td className="cc-desc">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Config & Models ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">🔧</span>
          <span className="cc-card__title">Config &amp; Models</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <tbody>
              {CONFIG_CMDS.map(c => (
                <tr key={c.cmd}>
                  <td><span className="cc-cmd">{c.cmd}</span></td>
                  <td className="cc-desc">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Coding & Agents ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">💻</span>
          <span className="cc-card__title">Coding &amp; Agents</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <tbody>
              {CODING_CMDS.map(c => (
                <tr key={c.cmd}>
                  <td><span className="cc-cmd">{c.cmd}</span></td>
                  <td className="cc-desc">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-section-label">Keyboard Shortcuts</div>

      {/* ── Keyboard Shortcuts ── */}
      <div className="cc-card cc-span-2">
        <div className="cc-card__header">
          <span className="cc-card__icon">⌨</span>
          <span className="cc-card__title">Keyboard Shortcuts</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <thead>
              <tr><th>Shortcut</th><th>Action</th><th>Shortcut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {SHORTCUTS.map(s => (
                <tr key={s.key}>
                  <td><span className="cc-key">{s.key}</span></td>
                  <td className="cc-desc">{s.action}</td>
                  <td><span className="cc-key">{s.key2}</span></td>
                  <td className="cc-desc">{s.action2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Config Precedence ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">📁</span>
          <span className="cc-card__title">Config Precedence</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <thead><tr><th>#</th><th>Location</th><th>Scope</th></tr></thead>
            <tbody>
              {CONFIG_FILES.map(f => (
                <tr key={f.priority}>
                  <td><span className="cc-priority">{f.priority}</span></td>
                  <td><span className="cc-code">{f.file}</span></td>
                  <td className="cc-desc">{f.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cc-note">
            <strong>CLAUDE.md locations:</strong><br />
            <span className="cc-code">CLAUDE.md</span> — project root (all users)<br />
            <span className="cc-code">~/.claude/CLAUDE.md</span> — personal, all projects<br /><br />
            <strong>Custom commands:</strong><br />
            <span className="cc-code">.claude/commands/cmd.md</span> → <span className="cc-code">/cmd</span>
          </div>
        </div>
      </div>

      {/* ── MCP Server Commands ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">🔌</span>
          <span className="cc-card__title">MCP Server Commands</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <tbody>
              {[
                'claude mcp add --transport http <name> <url>',
                'claude mcp add --transport stdio <name> <cmd>',
                'claude mcp list',
                'claude mcp remove <name>',
                'claude mcp serve',
                'claude --debug "mcp"',
              ].map(cmd => (
                <tr key={cmd}>
                  <td><span className="cc-code">{cmd}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cc-note">
            Since early 2026, Claude Code uses <strong>Tool Search (lazy loading)</strong> for MCP tools by default — reduces context usage by ~95%.
          </div>
        </div>
      </div>

      {/* ── Utility & Help ── */}
      <div className="cc-card">
        <div className="cc-card__header">
          <span className="cc-card__icon">🔍</span>
          <span className="cc-card__title">Utility &amp; Help</span>
        </div>
        <div className="cc-card__body--flush">
          <table className="cc-table">
            <tbody>
              {UTILITY_CMDS.map(c => (
                <tr key={c.cmd}>
                  <td><span className="cc-cmd">{c.cmd}</span></td>
                  <td className="cc-desc">{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
