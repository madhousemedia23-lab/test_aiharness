import React from 'react';
import {
  AbsoluteFill, interpolate, spring, useCurrentFrame,
  useVideoConfig, Easing, Img, staticFile,
} from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

// ─── Tokens ──────────────────────────────────────────────────────────────────

const C = {
  bg: '#0d1117', surf: '#161b22', alt: '#21262d', border: '#30363d',
  text: '#e6edf3', dim: '#8b949e',
  green: '#3fb950', blue: '#58a6ff', orange: '#d29922',
  red: '#f85149', purple: '#bc8cff', teal: '#39d353',
} as const;

const MONO = "'Courier New', Courier, monospace";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FPS = 30;

// Scene durations
const S0 = 15 * FPS;
const S1 = 15 * FPS;
const S2 = 22 * FPS;
const S3 = 17 * FPS;
const S4 = 22 * FPS;
const S5 = 13 * FPS;
const S6 = 18 * FPS;
const S7 = 26 * FPS;
const TR = 20;

export const TOTAL_DURATION = S0+S1+S2+S3+S4+S5+S6+S7 - 7*TR;

// Content area: y=58→640  (VO strip occupies 640→720)
const CONTENT_TOP = 58;
const CONTENT_BOT = 635; // stay above VO
const L = 54;            // left margin
const R = 54;            // right margin

// ─── Animation helpers ───────────────────────────────────────────────────────

const fi = (f: number, d = 0, dur = 0.5) =>
  interpolate(f, [d*FPS, (d+dur)*FPS], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

const spr = (f: number, delay = 0, cfg = { damping: 200 }) =>
  spring({ frame: f - delay*FPS, fps: FPS, config: cfg });

// ─── VO subtitle strip ────────────────────────────────────────────────────────

const VO: React.FC<{ lines: string[]; start?: number; secPer?: number }> = ({
  lines, start = 0, secPer = 3,
}) => {
  const frame = useCurrentFrame();
  const elapsed = (frame - start * FPS) / FPS;
  if (elapsed < 0) return null;
  const idx = Math.min(Math.floor(elapsed / secPer), lines.length - 1);
  const t = elapsed - idx * secPer;
  const op = Math.min(t / 0.25, 1) * Math.min((secPer - t) / 0.4, 1);
  return (
    <div style={{
      position: 'absolute', bottom: 14, left: 100, right: 100,
      background: 'rgba(0,0,0,0.75)', borderRadius: 6,
      padding: '8px 20px', textAlign: 'center', opacity: Math.max(0, op),
      zIndex: 10,
    }}>
      <div style={{ color: '#fff', fontSize: 14, fontFamily: SANS, lineHeight: 1.45 }}>
        {lines[Math.max(0, idx)]}
      </div>
    </div>
  );
};

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

const SceneLabel: React.FC<{ n: string; title: string }> = ({ n, title }) => (
  <div style={{
    position: 'absolute', top: 20, left: L, fontFamily: MONO,
    color: C.dim, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
  }}>{n} — {title}</div>
);

// Heading placed in caller — keeps layout predictable
const H1: React.FC<{ text: string; delay?: number; size?: number }> = ({ text, delay = 0, size = 20 }) => {
  const frame = useCurrentFrame();
  const op = fi(frame, delay, 0.5);
  return (
    <div style={{ opacity: op, transform: `translateY(${interpolate(op,[0,1],[10,0])}px)`, marginBottom: 14 }}>
      <div style={{ color: C.text, fontSize: size, fontWeight: 'bold', fontFamily: MONO, lineHeight: 1.3 }}>{text}</div>
    </div>
  );
};

// Inline-flow Gate box (no absolute positioning)
const Gate: React.FC<{
  label: string; q: string; ans: 'YES' | 'NO'; consequence: string;
  col: string; delay: number;
}> = ({ label, q, ans, consequence, col, delay }) => {
  const frame = useCurrentFrame();
  const op = fi(frame, delay, 0.4);
  return (
    <div style={{
      opacity: op, transform: `translateX(${interpolate(op,[0,1],[16,0])}px)`,
      background: C.surf, border: `1px solid ${C.border}`,
      borderRadius: 7, padding: '10px 14px', marginBottom: 8,
    }}>
      <div style={{ color: C.blue, fontSize: 9, letterSpacing: 2, marginBottom: 4, fontFamily: MONO }}>{label}</div>
      <div style={{ color: C.dim, fontSize: 11, marginBottom: 8, fontFamily: MONO }}>{q}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          background: ans === 'YES' ? C.green : C.red, color: '#000',
          fontWeight: 'bold', fontSize: 10, padding: '2px 10px', borderRadius: 3,
          fontFamily: MONO,
        }}>{ans}</span>
        <span style={{ color: C.text, fontSize: 10, fontFamily: MONO }}>{consequence}</span>
      </div>
    </div>
  );
};

// Step item (inline-flow)
const Step: React.FC<{ num: number; text: string; sub: string; col: string; delay: number }> = ({ num, text, sub, col, delay }) => {
  const frame = useCurrentFrame();
  const op = fi(frame, delay, 0.35);
  return (
    <div style={{ opacity: op, display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: col + '22', border: `1.5px solid ${col}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: col, fontSize: 9, fontWeight: 'bold', fontFamily: MONO,
      }}>{num}</div>
      <div>
        <div style={{ color: col, fontSize: 11, fontFamily: MONO }}>{text}</div>
        <div style={{ color: C.dim, fontSize: 9, fontFamily: MONO, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
};

// Code block (inline-flow)
const Code: React.FC<{ lines: string[]; delay?: number; title?: string }> = ({ lines, delay = 0, title }) => {
  const frame = useCurrentFrame();
  const op = fi(frame, delay, 0.4);
  return (
    <div style={{ opacity: op, background: C.surf, border: `1px solid ${C.border}`, borderRadius: 7, overflow: 'hidden', fontFamily: MONO, marginBottom: 10 }}>
      {title && <div style={{ background: C.alt, borderBottom: `1px solid ${C.border}`, padding: '4px 12px', color: C.dim, fontSize: 9 }}>{title}</div>}
      <div style={{ padding: '8px 12px' }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            color: l.trim().startsWith('#') ? C.dim :
                   l.includes('"decision"') || l.includes('"block"') ? C.red :
                   l.includes('"reason"') ? C.orange :
                   l.includes('os.path') || l.includes('os.remove') ? C.green :
                   l.includes('if ') || l.includes('and ') ? C.blue :
                   l.includes('print(') || l.includes('json.dumps') ? C.orange : C.text,
            fontSize: 10, lineHeight: 1.7, whiteSpace: 'pre',
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// ─── Scene 7 node layout helpers ─────────────────────────────────────────────
// Grid: 7 cols × 5 rows fitting 1280×580 content area
// col pitch = 170px, row pitch = 110px, NW=155, NH=46

const NW7 = 155, NH7 = 46;
const cX = (c: number) => 52 + c * 170;   // col(0)=52 … col(6)=1072, +155=1227 ✓
const rY = (r: number) => 70 + r * 110;   // row(0)=70 … row(4)=510, +46=556 ✓

type N7 = { id: string; label: string; sub: string; col: string; cx: number; cy: number; delay: number };

// Smart arrow: chooses right→left for horizontal, bottom→top for downward
function smartArrow(src: N7, tgt: N7) {
  const sRight = src.cx + NW7, sMidY = src.cy + NH7 / 2, sBotX = src.cx + NW7 / 2, sBot = src.cy + NH7;
  const tLeft = tgt.cx, tMidY = tgt.cy + NH7 / 2, tTopX = tgt.cx + NW7 / 2, tTop = tgt.cy;
  const sameRow = Math.abs(src.cy - tgt.cy) < 30;
  if (sameRow && src.cx < tgt.cx) return { x1: sRight,  y1: sMidY, x2: tLeft,  y2: tMidY };
  if (sameRow && src.cx > tgt.cx) return { x1: src.cx,  y1: sMidY, x2: sRight, y2: tMidY };
  return { x1: sBotX, y1: sBot, x2: tTopX, y2: tTop };
}

// ─── Scene 0 — Two Actors (Cursor screenshot) ─────────────────────────────────

const Scene0: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#1a1b26' }}>
      {/* Full Cursor screenshot — properly contained */}
      <Img
        src={staticFile('cursor-ide.png')}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center top',
          opacity: fi(frame, 0.1, 0.7),
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', opacity: fi(frame, 0.4, 0.5) }} />

      <SceneLabel n="00" title="Your Setup" />

      {/* File-tree annotation — x≈65, y≈82 in display */}
      <div style={{ position: 'absolute', left: 65, top: 82, opacity: fi(frame, 0.8, 0.4) }}>
        <div style={{ background: C.blue, color: '#000', fontSize: 9, fontWeight: 'bold', padding: '2px 8px', borderRadius: 3, fontFamily: SANS, whiteSpace: 'nowrap' }}>
          Cursor IDE — .cursor/rules/ auto-loaded
        </div>
        <div style={{ width: 2, height: 14, background: C.blue, marginLeft: 10 }} />
      </div>

      {/* Terminal annotation — y≈500 */}
      <div style={{ position: 'absolute', left: 130, top: 500, opacity: fi(frame, 1.3, 0.4) }}>
        <div style={{ background: C.green, color: '#000', fontSize: 9, fontWeight: 'bold', padding: '2px 8px', borderRadius: 3, fontFamily: SANS, whiteSpace: 'nowrap' }}>
          Integrated terminal — Claude Code CLI
        </div>
      </div>

      {/* Terminal content — x=125, y=514, max height 115px (leaves room for VO) */}
      <div style={{
        position: 'absolute', left: 125, top: 514, width: 1090, height: 115,
        background: 'rgba(10,14,20,0.90)', borderTop: `1px solid ${C.border}`,
        padding: '6px 12px', opacity: fi(frame, 1.3, 0.4), overflow: 'hidden',
      }}>
        {[
          { text: '$ claude code .', col: C.text },
          { text: '⚡  SessionStart hook fired → sentinel created → ALL tools blocked', col: C.blue },
          { text: 'MANDATORY: Read AGENTS.md to unlock.', col: C.orange },
        ].map((l, i) => (
          <div key={i} style={{ color: l.col, fontSize: 10, lineHeight: 1.7, fontFamily: MONO }}>{l.text}</div>
        ))}
      </div>

      {/* Info cards — over the Cursor AI panel area (right side of screenshot) */}
      <div style={{
        position: 'absolute', left: 790, top: 60, width: 438,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ background: 'rgba(13,27,53,0.93)', border: `2px solid ${C.blue}`, borderRadius: 9, padding: '12px 16px', fontFamily: MONO, opacity: fi(frame, 0.5, 0.5) }}>
          <div style={{ color: C.blue, fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>🖥  Cursor IDE</div>
          <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.6 }}>Your main editor. Opens the project and silently loads rule files from .cursor/rules/ on every turn — automatically, no setup needed.</div>
        </div>
        <div style={{ background: 'rgba(13,40,24,0.93)', border: `2px solid ${C.green}`, borderRadius: 9, padding: '12px 16px', fontFamily: MONO, opacity: fi(frame, 1.4, 0.5) }}>
          <div style={{ color: C.green, fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>⚡  Claude Code CLI</div>
          <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.6 }}>The AI you type instructions to — running in Cursor's terminal. Has a built-in bouncer that blocks all tools until it reads the rulebook first.</div>
        </div>
        <div style={{ background: 'rgba(13,17,23,0.93)', border: `1px solid ${C.purple}`, borderRadius: 8, padding: '9px 14px', fontFamily: MONO, textAlign: 'center', opacity: fi(frame, 2.4, 0.5) }}>
          <div style={{ color: C.purple, fontSize: 11, fontWeight: 'bold' }}>Both read from .ai/protocols/ — one rulebook</div>
        </div>
      </div>

      <VO lines={[
        "This is your actual setup. Cursor on the left — your code editor.",
        "At the bottom, inside Cursor's terminal, that's Claude Code running.",
        "Two different tools — but they both follow the exact same rulebook.",
        "One set of rules. Two enforcement paths. Zero gaps.",
      ]} start={0.8} secPer={3.5} />
    </AbsoluteFill>
  );
};

// ─── Scene 1 — Cursor: Auto-Loaded Rules ─────────────────────────────────────

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="01" title="Cursor — How Rules Auto-Load" />

      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R }}>
        <H1 text="Every time Cursor opens this project, it silently loads 3 rule files." delay={0.2} />

        {/* Flow strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, opacity: fi(frame, 0.6, 0.4), flexWrap: 'wrap' }}>
          {[
            { t: 'Cursor opens', bg: '#0d1b35', col: C.blue },
            { t: '→' },
            { t: 'scans .cursor/rules/', bg: C.surf, col: C.text },
            { t: '→' },
            { t: 'alwaysApply: true', bg: C.surf, col: C.blue },
            { t: '→' },
            { t: 'injected into every AI turn', bg: '#0d2818', col: C.green },
          ].map((item, i) =>
            item.t === '→'
              ? <div key={i} style={{ color: C.dim, fontSize: 16 }}>→</div>
              : <div key={i} style={{ background: (item as any).bg, border: `1px solid ${(item as any).col}`, borderRadius: 5, padding: '5px 10px', color: (item as any).col, fontSize: 10 }}>{item.t}</div>
          )}
        </div>

        {/* Three .mdc cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[
            { name: 'foundations.mdc', delay: 1.0, lines: ['alwaysApply: true', '───────────────', '# Loaded on every Cursor turn', '"Small changes. No secrets.', 'Read TODO_MD_AGENT_PROTOCOL.md', 'Read DOCS_MAINTENANCE_PROTOCOL.md"'] },
            { name: 'todomd-collaboration.mdc', delay: 2.0, lines: ['alwaysApply: true', '───────────────', '# Pointer only. Says:', '"Go read the real rules at:', ' .ai/protocols/', '  TODO_MD_AGENT_PROTOCOL.md"'] },
            { name: 'docs-maintenance.mdc', delay: 3.0, lines: ['alwaysApply: true', '───────────────', '# Pointer only. Says:', '"Go read the real rules at:', ' .ai/protocols/', '  DOCS_MAINTENANCE_PROTOCOL.md"'] },
          ].map(f => (
            <div key={f.name} style={{ flex: 1, opacity: fi(frame, f.delay, 0.4) }}>
              <div style={{ color: C.dim, fontSize: 9, letterSpacing: 2, marginBottom: 5, textTransform: 'uppercase' }}>{f.name}</div>
              <div style={{ background: C.surf, border: `1.5px solid ${C.blue}`, borderRadius: 7, padding: '9px 11px' }}>
                {f.lines.map((l, i) => (
                  <div key={i} style={{
                    color: l.startsWith('#') ? C.orange : l.includes('alwaysApply') ? C.green : l.includes('.ai/protocols') ? C.blue : l.startsWith('─') ? C.border : C.text,
                    fontSize: 10, lineHeight: 1.7, whiteSpace: 'pre',
                  }}>{l || ' '}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key insight */}
        <div style={{ opacity: fi(frame, 4.5, 0.5), background: C.surf, border: `1px solid ${C.purple}`, borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ color: C.purple, fontSize: 18, flexShrink: 0 }}>💡</div>
          <div style={{ color: C.text, fontSize: 11, lineHeight: 1.5 }}>
            <strong style={{ color: C.purple }}>The clever bit:</strong> these files don't contain the actual rules — they just say "go read this other file." The real rules live in <span style={{ color: C.blue }}>.ai/protocols/</span> in one place only, so they can never get out of sync.
          </div>
        </div>
      </div>

      <VO lines={[
        "When Cursor opens the project, it looks for files ending in .mdc.",
        "Any with alwaysApply: true gets loaded automatically — every single time.",
        "But the rule files don't contain the actual rules. They're just signposts.",
        "They point to .ai/protocols/ where the real rules live. One place. Always current.",
      ]} start={0.5} secPer={3.2} />
    </AbsoluteFill>
  );
};

// ─── Scene 2 — Claude Code: The Bouncer ──────────────────────────────────────

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="02" title="Claude Code — The Bouncer (Hook Blocking)" />

      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R, display: 'flex', gap: 24 }}>
        {/* Left: numbered steps */}
        <div style={{ width: 430 }}>
          <H1 text="Every tool is blocked until AGENTS.md is read." delay={0.2} size={18} />
          {[
            { n:1, t:'Session opens in Cursor terminal', s:'$ claude code .', col:C.blue, d:0.5 },
            { n:2, t:'SessionStart hook creates a lock', s:'sentinel: /tmp/.claude_must_read_agents', col:C.orange, d:1.5 },
            { n:3, t:'You try ANYTHING — Write, Edit, Bash…', s:'Claude attempts to use a tool', col:C.text, d:3.0 },
            { n:4, t:'PreToolUse hook fires BEFORE the tool', s:'pre-tool-check.sh reads stdin JSON', col:C.orange, d:4.5 },
            { n:5, t:'Lock exists + tool is not Read?', s:'Hook outputs {"decision":"block"} → HARD STOP', col:C.red, d:6.0 },
            { n:6, t:'🚫  BLOCKED — cannot proceed', s:'Literally nothing works until step 7', col:C.red, d:7.5 },
            { n:7, t:'Only way out: Read AGENTS.md', s:'PreToolUse allows Read through normally', col:C.green, d:9.5 },
            { n:8, t:'Post-read hook removes the lock', s:'post-tool-read.sh sees AGENTS.md in path', col:C.green, d:11.5 },
            { n:9, t:'✅  ALL tools unblocked', s:'Normal work begins — bouncer steps aside', col:C.teal, d:13.5 },
          ].map(s => <Step key={s.n} num={s.n} text={s.t} sub={s.s} col={s.col} delay={s.d} />)}
        </div>

        {/* Right: code + output */}
        <div style={{ flex: 1 }}>
          <div style={{ height: 14 }} />{/* align with content */}
          <Code
            title="pre-tool-check.sh — runs before EVERY tool call"
            delay={4.5}
            lines={[
              '# What tool is Claude trying to use?',
              'data = json.load(sys.stdin)',
              'tool = data.get("tool_name", "")',
              'sentinel = "/tmp/.claude_must_read_agents"',
              '',
              '# Lock exists AND not a Read call?',
              'if os.path.exists(sentinel) and tool != "Read":',
              '    print(json.dumps({',
              '        "decision": "block",',
              '        "reason": "Read AGENTS.md first."',
              '    }))',
            ]}
          />
          <div style={{ opacity: fi(frame, 7.0, 0.4), background:'#2a0000', border:`2px solid ${C.red}`, borderRadius:7, padding:'9px 14px', marginBottom:10 }}>
            <div style={{ color:C.red, fontSize:12, fontWeight:'bold', marginBottom:3 }}>🚫  Claude Code receives:</div>
            <div style={{ color:C.dim, fontSize:10, fontFamily:MONO }}>{'{ "decision": "block", "reason": "Read AGENTS.md first." }'}</div>
            <div style={{ color:C.red, fontSize:10, marginTop:3 }}>Tool call cancelled. Model must try something else.</div>
          </div>
          <div style={{ opacity: fi(frame, 13.0, 0.5), background:'#0d2818', border:`2px solid ${C.green}`, borderRadius:7, padding:'9px 14px' }}>
            <div style={{ color:C.green, fontSize:12, fontWeight:'bold', marginBottom:3 }}>✅  After reading AGENTS.md:</div>
            <div style={{ color:C.dim, fontSize:10 }}>post-tool-read.sh detects AGENTS.md in tool_input.file_path → deletes sentinel → all tools work normally for the rest of the session.</div>
          </div>
        </div>
      </div>

      <VO lines={[
        "Think of Claude Code as having a bouncer standing at the door.",
        "The moment the session opens, a lock is created — a file on disk.",
        "Every tool Claude tries to use runs through the bouncer first.",
        "The bouncer checks: is the lock there? Is this NOT a Read call? BLOCKED.",
        "Claude literally cannot do anything. The JSON block output stops the tool cold.",
        "The only key that fits: use the Read tool specifically on AGENTS.md.",
        "Once that happens, the lock is removed and everything works normally.",
      ]} start={0.5} secPer={2.8} />
    </AbsoluteFill>
  );
};

// ─── Scene 3 — How It Knows What Docs to Create ──────────────────────────────

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="03" title="How It Knows What Docs to Create" />

      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R, display: 'flex', gap: 24 }}>
        {/* Left: decision gates (inline-flow, not absolute) */}
        <div style={{ width: 560 }}>
          <H1 text="After every file edit, 4 questions run automatically." delay={0.2} size={18} />
          <Gate label="QUESTION 1 — What kind of change?" q="Did you touch product code? (scripts/, src/, harness-video/, app/, services/…)" ans="YES" consequence="→ Product path. docs/ folder must be updated." col={C.green} delay={0.6} />
          <Gate label="QUESTION 2 — Does docs/ exist yet?" q="Is there already a docs/ folder at the project root?" ans="NO" consequence="→ Bootstrap full package: README.md + architecture.md + conventions.md" col={C.orange} delay={1.8} />
          <Gate label="QUESTION 2b — (if docs/ exists)" q="Does a doc already exist for THIS specific surface?" ans="NO" consequence="→ Create a new file, e.g. docs/scripts/foo.md" col={C.orange} delay={2.8} />
          <Gate label="QUESTION 3 — Harness change instead?" q="Did you touch .ai/, .cursor/, .claude/, AGENTS.md, CLAUDE.md?" ans="YES" consequence="→ Update .ai/docs/ + root README.md instead of docs/" col={C.purple} delay={3.8} />
          <Gate label="QUESTION 4 — Both?" q="Did your change touch both product code AND harness files?" ans="YES" consequence="→ Update BOTH docs/ AND .ai/docs/ in the same change." col={C.blue} delay={4.8} />
        </div>

        {/* Right: structure + stop gate */}
        <div style={{ flex: 1 }}>
          <div style={{ height: 34 }} />
          <div style={{ color: C.dim, fontSize: 9, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Product docs structure it always follows:</div>
          {[
            { f: 'docs/README.md', r: 'Index of every documented surface', col: C.green },
            { f: 'docs/architecture.md', r: 'How all components connect', col: C.blue },
            { f: 'docs/conventions.md', r: 'Naming rules and folder layout', col: C.blue },
            { f: 'docs/<surface>/README.md', r: 'Reference page for that surface', col: C.orange },
            { f: 'docs/scripts/foo.md', r: '← e.g. CLI flags, usage, examples', col: C.dim },
            { f: 'docs/frontend/README.md', r: '← e.g. component tree, routes', col: C.dim },
          ].map((item, i) => (
            <div key={i} style={{ opacity: fi(frame, 1.5 + i*0.2, 0.4), marginBottom: 7, display: 'flex', gap: 8 }}>
              <div style={{ color: item.col, fontSize: 10, minWidth: 195, fontFamily: MONO }}>{item.f}</div>
              <div style={{ color: C.dim, fontSize: 10, fontFamily: MONO }}>— {item.r}</div>
            </div>
          ))}

          <div style={{ opacity: fi(frame, 5.0, 0.5), marginTop: 14, background: C.surf, border: `1px solid ${C.red}`, borderRadius: 7, padding: '9px 12px' }}>
            <div style={{ color: C.red, fontSize: 11, fontWeight: 'bold', marginBottom: 4, fontFamily: MONO }}>⚡  stop_docs_gate.py</div>
            <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.5, fontFamily: MONO }}>
              When Claude finishes its turn, this gate checks git status. If product files changed but docs/ wasn't touched — <span style={{ color: C.red }}>BLOCKED</span>. The turn cannot end until docs are done.
            </div>
          </div>
        </div>
      </div>

      <VO lines={[
        "After every file edit, four questions run to figure out what docs to create.",
        "First: is this product code — a script, a website, an app? Yes → docs/ gets updated.",
        "Second: does the right doc file already exist? No → it creates a new one.",
        "Third: was it a harness change like a rule or hook? Different folder — .ai/docs/.",
        "And there's a gate that blocks Claude from finishing until the docs are actually done.",
      ]} start={0.5} secPer={3.0} />
    </AbsoluteFill>
  );
};

// ─── Scene 4 — Frontend Example ──────────────────────────────────────────────

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { t:0.5,  col:C.blue,   icon:'👤', actor:'You',    action:'"Add a React frontend"', detail:'Claude creates todo: - [ ] Add React frontend +Project @ai #frontend {claude}' },
    { t:2.2,  col:C.green,  icon:'⚡', actor:'Claude', action:'Creates src/App.tsx + src/components/', detail:'pre_write_gate.py: open task exists ✓ → write proceeds' },
    { t:4.0,  col:C.orange, icon:'🔔', actor:'Hook',   action:'PostToolUse fires — Edit|Write matched', detail:'Checklist: product change? YES. Harness change? NO.' },
    { t:5.8,  col:C.blue,   icon:'🔍', actor:'Check',  action:'Gate A: src/ is a product path → YES', detail:'Gate B: .ai/protocols/ or .cursor/ touched? NO → PRODUCT-ONLY' },
    { t:7.6,  col:C.orange, icon:'📁', actor:'Check',  action:'docs/ exists? YES', detail:'docs/frontend/ exists? NO — this surface has never been documented.' },
    { t:9.4,  col:C.green,  icon:'✏️',  actor:'Create', action:'docs/frontend/README.md created', detail:'Component tree, routes, how to run, dependencies — all documented.' },
    { t:11.2, col:C.green,  icon:'📝', actor:'Update', action:'docs/README.md + docs/architecture.md', detail:'Index gets a new row for frontend. Architecture adds the new component.' },
    { t:13.0, col:C.green,  icon:'✅', actor:'Gate',   action:'stop_docs_gate.py: docs/ was touched ✓', detail:'Task: [ ] → [x] {claude} + # ai: note. Turn is allowed to end.' },
    { t:14.8, col:C.orange, icon:'👀', actor:'You',    action:'Review in Cursor → Alt+D', detail:'You check the diff, press Alt+D in Todo MD. Task officially closed.' },
  ];
  const aCol: Record<string, string> = { You: C.orange, Claude: C.green, Hook: C.orange, Check: C.blue, Create: C.green, Update: C.green, Gate: C.red };
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="04" title="Real Example — Adding a React Frontend" />
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R }}>
        <H1 text='What actually happens when you say "add a React frontend"' delay={0.2} size={18} />
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {steps.slice(0, 5).map((s, i) => (
              <div key={i} style={{ opacity: fi(frame, s.t, 0.35), display: 'flex', gap: 8, marginBottom: 11 }}>
                <div style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                    <div style={{ background: aCol[s.actor]+'22', border:`1px solid ${aCol[s.actor]}`, borderRadius:3, padding:'1px 6px', color:aCol[s.actor], fontSize:8, fontWeight:'bold' }}>{s.actor}</div>
                    <div style={{ color: s.col, fontSize: 11, fontWeight: 'bold' }}>{s.action}</div>
                  </div>
                  <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.5 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {steps.slice(5).map((s, i) => (
              <div key={i} style={{ opacity: fi(frame, s.t, 0.35), display: 'flex', gap: 8, marginBottom: 11 }}>
                <div style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                    <div style={{ background: aCol[s.actor]+'22', border:`1px solid ${aCol[s.actor]}`, borderRadius:3, padding:'1px 6px', color:aCol[s.actor], fontSize:8, fontWeight:'bold' }}>{s.actor}</div>
                    <div style={{ color: s.col, fontSize: 11, fontWeight: 'bold' }}>{s.action}</div>
                  </div>
                  <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.5 }}>{s.detail}</div>
                </div>
              </div>
            ))}
            <div style={{ opacity: fi(frame, 17.5, 0.5), marginTop: 6, background: '#0d2818', border: `2px solid ${C.green}`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: C.green, fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>Created automatically in one conversation:</div>
              {['docs/frontend/README.md  (brand new)', 'docs/README.md  (updated — new row added)', 'docs/architecture.md  (updated — new component)'].map((l,i) => (
                <div key={i} style={{ color: C.text, fontSize: 10, lineHeight: 1.7 }}>✓  {l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <VO lines={[
        "Let's make it concrete. You say: add a React frontend.",
        "Claude creates a task on the board first — before touching any files.",
        "It writes src/App.tsx. The moment it saves, the PostToolUse hook fires.",
        "Hook asks: product path? YES. Doc exists for frontend? NO — create it.",
        "docs/frontend/README.md appears. Index and architecture get updated too.",
        "A gate checks docs/ was updated. It was. Turn ends. You review and sign off.",
        "One conversation. Code written. Docs created. Board updated. All automatic.",
      ]} start={0.5} secPer={2.8} />
    </AbsoluteFill>
  );
};

// ─── Scene 5 — Todo Protocol ──────────────────────────────────────────────────

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="05" title="Todo Protocol — The Task Tracker" />
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R, display: 'flex', gap: 24 }}>
        <div style={{ width: 530 }}>
          <H1 text="Every piece of work gets a task. No task = no write." delay={0.2} size={18} />
          {[
            { state: '- [ ] Add email script +Project @ai #scripts (B) {claude}', label:'OPEN', col:C.orange, detail:"Created by Claude BEFORE writing code. {claude} shows who's responsible.", d:0.8 },
            { state: '- [x] Add email script +Project @ai #scripts (B) {claude}', label:'DONE BY AGENT', col:C.blue, detail:"Claude marks it done. But you haven't verified it yet.", d:3.0 },
            { state: '# ai: Created scripts/email_summary.py — stdlib SMTP.', label:'NOTE', col:C.dim, detail:"Short note: what was done and where to check.", d:4.5 },
            { state: '- [x] Add email script ... ✓  (cm:2026-05-12)', label:'VERIFIED', col:C.green, detail:"You press Alt+D in Cursor. Todo MD stamps it closed.", d:6.5 },
          ].map((item, i) => (
            <div key={i} style={{ opacity: fi(frame, item.d, 0.4), marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ background: item.col+'22', border:`1px solid ${item.col}`, borderRadius:3, padding:'1px 7px', color:item.col, fontSize:9, fontWeight:'bold', flexShrink:0, marginTop:2 }}>{item.label}</div>
                <div>
                  <div style={{ background: C.surf, border:`1px solid ${C.border}`, borderRadius:4, padding:'5px 10px', color:item.col, fontSize:10, marginBottom:3, fontFamily:MONO }}>{item.state}</div>
                  <div style={{ color:C.dim, fontSize:9 }}>{item.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 34 }} />
          <div style={{ color:C.dim, fontSize:9, letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>The non-negotiable rules</div>
          {[
            { r:'Create task BEFORE writing code', w:'pre_write_gate.py blocks writes if no open task.', col:C.orange },
            { r:'Never delete a task line', w:'History stays forever. Humans remove by hand only.', col:C.red },
            { r:'{claude} or {cursor} on every line', w:'Stamps show who last touched it. Traceable.', col:C.blue },
            { r:'# ai: completion note required', w:'Short note saying what was done and where.', col:C.purple },
            { r:'Human closes with Alt+D only', w:"Claude can't officially close it — only you can.", col:C.green },
          ].map((item, i) => (
            <div key={i} style={{ opacity: fi(frame, 1.5+i*0.4, 0.4), display:'flex', gap:8, marginBottom:10 }}>
              <div style={{ color:item.col, fontSize:13, flexShrink:0 }}>→</div>
              <div>
                <div style={{ color:item.col, fontSize:11, fontWeight:'bold', fontFamily:MONO }}>{item.r}</div>
                <div style={{ color:C.dim, fontSize:9 }}>{item.w}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <VO lines={[
        "Every piece of work needs a task on the board before any code gets written.",
        "The task has a stamp: {claude} if Claude did it, {cursor} if Cursor did.",
        "Like a sticky note with your name. Everyone knows who's responsible.",
        "When Claude finishes its part, it ticks the box and leaves a short note.",
        "Then YOU verify it in Cursor and press Alt+D. That's the official sign-off.",
        "Tasks are never deleted. History stays forever. That's the rule.",
      ]} start={0.5} secPer={2.1} />
    </AbsoluteFill>
  );
};

// ─── Scene 6 — Full Flow ──────────────────────────────────────────────────────

const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = [
    { t:0.5,  actor:'Cursor',  col:C.blue,   action:'Opens project', detail:'Auto-loads all 3 .mdc rule files silently on every turn' },
    { t:2.0,  actor:'Claude',  col:C.green,  action:'Claude Code starts in terminal', detail:'SessionStart hook fires → lock created → ALL tools blocked' },
    { t:3.5,  actor:'Claude',  col:C.green,  action:'Reads AGENTS.md', detail:'Only Read allowed → post-read hook removes lock → tools unblocked' },
    { t:5.0,  actor:'Claude',  col:C.green,  action:'Reads 3 protocol files', detail:'TODO_MD_PROTOCOL + DOCS_PROTOCOL + docs-surface-classifier' },
    { t:6.5,  actor:'You',     col:C.orange, action:'Give a task', detail:'Claude creates a todo entry with {claude} stamp BEFORE writing anything' },
    { t:8.0,  actor:'Claude',  col:C.green,  action:'Writes the code', detail:'pre_write_gate.py: open task exists ✓ → write proceeds' },
    { t:9.5,  actor:'Hook',    col:C.orange, action:'PostToolUse fires after every write', detail:'Runs classifier → updates correct docs in the same change' },
    { t:11.0, actor:'Gate',    col:C.red,    action:'stop_docs_gate checks', detail:'Product files changed + docs/ untouched? → BLOCKED. Must update docs first.' },
    { t:12.5, actor:'Claude',  col:C.green,  action:'Task marked [x] + # ai: note', detail:'{claude} marker confirmed. Docs done. Gate passes. Turn ends.' },
    { t:14.0, actor:'You',     col:C.orange, action:'Review in Cursor → Alt+D', detail:'You sign off. Task closed. Cursor shows the new docs in the file tree.' },
  ];
  const aCol: Record<string, string> = { Cursor:C.blue, Claude:C.green, You:C.orange, Hook:C.orange, Gate:C.red };
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="06" title="Full Flow — Session Open to Task Closed" />
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: L, right: R }}>
        <H1 text="The complete picture — every step, both tools." delay={0.2} size={18} />
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {flow.slice(0,5).map((f,i) => (
              <div key={i} style={{ opacity: fi(frame,f.t,0.35), display:'flex', gap:10, marginBottom:10 }}>
                <div style={{ minWidth:52, height:17, borderRadius:3, background:aCol[f.actor]+'22', border:`1px solid ${aCol[f.actor]}`, display:'flex', alignItems:'center', justifyContent:'center', color:aCol[f.actor], fontSize:8, fontWeight:'bold', flexShrink:0 }}>{f.actor}</div>
                <div>
                  <div style={{ color:f.col, fontSize:11 }}>{f.action}</div>
                  <div style={{ color:C.dim, fontSize:9, marginTop:1 }}>{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {flow.slice(5).map((f,i) => (
              <div key={i} style={{ opacity: fi(frame,f.t,0.35), display:'flex', gap:10, marginBottom:10 }}>
                <div style={{ minWidth:52, height:17, borderRadius:3, background:aCol[f.actor]+'22', border:`1px solid ${aCol[f.actor]}`, display:'flex', alignItems:'center', justifyContent:'center', color:aCol[f.actor], fontSize:8, fontWeight:'bold', flexShrink:0 }}>{f.actor}</div>
                <div>
                  <div style={{ color:f.col, fontSize:11 }}>{f.action}</div>
                  <div style={{ color:C.dim, fontSize:9, marginTop:1 }}>{f.detail}</div>
                </div>
              </div>
            ))}
            <div style={{ opacity: fi(frame,16,0.5), marginTop:6, display:'flex', gap:16, flexWrap:'wrap' }}>
              {[{col:C.blue,l:'Cursor'},{col:C.green,l:'Claude Code'},{col:C.orange,l:'You / Hook'},{col:C.red,l:'Gate (blocks)'}].map((x,i)=>(
                <div key={i} style={{ display:'flex', gap:5, alignItems:'center' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:x.col }}/>
                  <span style={{ color:C.dim, fontSize:9 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <VO lines={[
        "Here's the full picture from the moment you open Cursor.",
        "Cursor loads its rules. Claude starts in the terminal. Bouncer activates.",
        "Must read AGENTS.md. Tools unlock. Task created. Code written.",
        "After every write, hook fires and forces docs to update in the same change.",
        "Gate checks everything is done. Claude marks the task. You sign it off.",
        "Every single task goes through exactly this. No shortcuts.",
      ]} start={0.5} secPer={2.8} />
    </AbsoluteFill>
  );
};

// ─── Scene 7 — Complete File Map ─────────────────────────────────────────────
//
// Grid: col(c) = 52 + c*170  (7 cols, fits 1227+NW7=1227+155=1382 — wait)
// With NW7=155 and 7 cols: col(6)+155 = 52+6*170+155 = 52+1020+155 = 1227 ✓ (< 1280)
// rY(r) = 70 + r*110  →  rY(4)+NH7 = 70+440+46 = 556 ✓ (< 635 content bottom)

const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  const nodes: N7[] = [
    // Row 0 — entry points
    { id:'cursor',    label:'Cursor IDE',          sub:'your editor',           col:C.blue,   cx:cX(0), cy:rY(0), delay:0.2 },
    { id:'agents',    label:'AGENTS.md',           sub:'charter + hub',         col:C.blue,   cx:cX(2), cy:rY(0), delay:0.5 },
    { id:'claude_md', label:'CLAUDE.md',           sub:'defers to AGENTS.md',   col:C.green,  cx:cX(4), cy:rY(0), delay:0.8 },
    { id:'claude_cc', label:'Claude Code CLI',     sub:'in Cursor terminal',    col:C.green,  cx:cX(6), cy:rY(0), delay:1.1 },
    // Row 1 — rule files
    { id:'mdc1',      label:'foundations.mdc',     sub:'.cursor/rules/',        col:C.blue,   cx:cX(0), cy:rY(1), delay:1.4 },
    { id:'mdc2',      label:'todomd-collab.mdc',   sub:'.cursor/rules/',        col:C.blue,   cx:cX(1), cy:rY(1), delay:1.6 },
    { id:'settings',  label:'settings.local.json', sub:'.claude/ — hooks wire', col:C.green,  cx:cX(5), cy:rY(1), delay:1.9 },
    // Row 2 — protocols + hooks
    { id:'todo_p',    label:'TODO_MD_PROTOCOL',    sub:'.ai/protocols/',        col:C.purple, cx:cX(1), cy:rY(2), delay:2.2 },
    { id:'docs_p',    label:'DOCS_MAINT_PROTOCOL', sub:'.ai/protocols/',        col:C.purple, cx:cX(3), cy:rY(2), delay:2.5 },
    { id:'pre_tool',  label:'pre-tool-check.sh',   sub:'.claude/hooks BLOCKS',  col:C.orange, cx:cX(5), cy:rY(2), delay:2.8 },
    { id:'post_read', label:'post-tool-read.sh',   sub:'.claude/hooks unlocks', col:C.green,  cx:cX(6), cy:rY(2), delay:3.1 },
    // Row 3 — flows + gates
    { id:'classif',   label:'surface-classifier',  sub:'.ai/docs/flows/',       col:C.orange, cx:cX(2), cy:rY(3), delay:3.4 },
    { id:'doc_flow',  label:'doc-update-flow',     sub:'.ai/docs/flows/',       col:C.orange, cx:cX(3), cy:rY(3), delay:3.7 },
    { id:'pre_write', label:'pre_write_gate.py',   sub:'blocks if no task',     col:C.red,    cx:cX(5), cy:rY(3), delay:4.0 },
    { id:'stop_docs', label:'stop_docs_gate.py',   sub:'blocks if no docs',     col:C.red,    cx:cX(6), cy:rY(3), delay:4.3 },
    // Row 4 — outputs
    { id:'todo_md',   label:'.ai/todo/todo.md',    sub:'task board',            col:C.teal,   cx:cX(1), cy:rY(4), delay:4.6 },
    { id:'docs_prod', label:'docs/',               sub:'product docs',          col:C.teal,   cx:cX(3), cy:rY(4), delay:4.9 },
    { id:'ai_docs',   label:'.ai/docs/',           sub:'harness docs',          col:C.purple, cx:cX(5), cy:rY(4), delay:5.2 },
  ];

  const nm = Object.fromEntries(nodes.map(n => [n.id, n]));

  type E7 = { f: string; t: string; label: string; col: string; delay: number };
  const edges: E7[] = [
    { f:'cursor',    t:'mdc1',      label:'loads',      col:C.blue,   delay:5.6 },
    { f:'cursor',    t:'mdc2',      label:'loads',      col:C.blue,   delay:5.8 },
    { f:'mdc1',      t:'agents',    label:'points at',  col:C.blue,   delay:6.1 },
    { f:'mdc2',      t:'todo_p',    label:'points at',  col:C.purple, delay:6.4 },
    { f:'claude_cc', t:'claude_md', label:'reads',      col:C.green,  delay:6.7 },
    { f:'claude_md', t:'agents',    label:'defers to',  col:C.green,  delay:7.0 },
    { f:'agents',    t:'todo_p',    label:'governs',    col:C.purple, delay:7.3 },
    { f:'agents',    t:'docs_p',    label:'governs',    col:C.purple, delay:7.6 },
    { f:'settings',  t:'pre_tool',  label:'PreToolUse', col:C.orange, delay:7.9 },
    { f:'settings',  t:'post_read', label:'PostRead',   col:C.green,  delay:8.2 },
    { f:'docs_p',    t:'classif',   label:'gate via',   col:C.orange, delay:8.5 },
    { f:'classif',   t:'doc_flow',  label:'then run',   col:C.orange, delay:8.8 },
    { f:'todo_p',    t:'todo_md',   label:'writes to',  col:C.teal,   delay:9.1 },
    { f:'pre_write', t:'todo_md',   label:'checks',     col:C.red,    delay:9.4 },
    { f:'classif',   t:'docs_prod', label:'product→',   col:C.teal,   delay:9.7 },
    { f:'classif',   t:'ai_docs',   label:'harness→',   col:C.purple, delay:10.0 },
    { f:'stop_docs', t:'docs_prod', label:'checks',     col:C.red,    delay:10.3 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: MONO }}>
      <SceneLabel n="07" title="Complete File Map — All Connections" />

      {/* Legend — right of scene label */}
      <div style={{ position:'absolute', top:20, right:R, display:'flex', gap:12, opacity:fi(frame,0.2,0.5) }}>
        {[{col:C.blue,l:'Cursor'},{col:C.green,l:'Claude Code'},{col:C.purple,l:'Protocols'},{col:C.orange,l:'Hooks/Flows'},{col:C.red,l:'Gates'},{col:C.teal,l:'Outputs'}].map((x,i)=>(
          <div key={i} style={{ display:'flex', gap:4, alignItems:'center' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:x.col }}/>
            <span style={{ color:C.dim, fontSize:9 }}>{x.l}</span>
          </div>
        ))}
      </div>

      {/* Smart arrows */}
      <svg style={{ position:'absolute', top:0, left:0, width:1280, height:720, pointerEvents:'none', overflow:'visible' }}>
        {edges.map((e, i) => {
          const s = nm[e.f], t = nm[e.t];
          if (!s || !t) return null;
          const op = fi(frame, e.delay, 0.4);
          const { x1, y1, x2, y2 } = smartArrow(s, t);
          const mx=(x1+x2)/2, my=(y1+y2)/2;
          return (
            <g key={i} opacity={op}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={e.col} strokeWidth={1.3} strokeDasharray="5 3" strokeOpacity={0.8}/>
              <polygon points={`${x2},${y2} ${x2-4},${y2-8} ${x2+4},${y2-8}`} fill={e.col} fillOpacity={0.8}/>
              <text x={mx+4} y={my-5} fill={C.dim} fontSize={8} textAnchor="middle" fontFamily={MONO}>{e.label}</text>
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(n => {
        const p = spr(frame, n.delay);
        const op = interpolate(p,[0,0.2],[0,1],{extrapolateRight:'clamp'});
        const sc = interpolate(p,[0,1],[0.8,1]);
        return (
          <div key={n.id} style={{
            position:'absolute', left:n.cx, top:n.cy, width:NW7,
            opacity:op, transform:`scale(${sc})`, transformOrigin:'top left',
          }}>
            <div style={{ background:C.surf, border:`1.5px solid ${n.col}`, borderRadius:6, padding:'5px 9px', height:NH7, overflow:'hidden' }}>
              <div style={{ color:n.col, fontSize:9, fontWeight:'bold', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:MONO }}>{n.label}</div>
              <div style={{ color:C.dim, fontSize:8, marginTop:2, fontFamily:MONO }}>{n.sub}</div>
            </div>
          </div>
        );
      })}

      <VO lines={[
        "This is every file in the harness and how they all connect.",
        "Blue is Cursor. Green is Claude Code. Purple is shared protocols.",
        "Orange is hooks and decision flows. Red are the gates that block things.",
        "Teal at the bottom is what actually gets written — your task board and docs.",
        "Every arrow is a real connection with a real purpose. Nothing is optional.",
        "One rulebook. Two tools. Lots of enforcement. Zero gaps.",
      ]} start={0.4} secPer={3.8} />
    </AbsoluteFill>
  );
};

// ─── Composition ──────────────────────────────────────────────────────────────

export const HarnessVideo: React.FC = () => {
  const T = springTiming({ config: { damping: 200 }, durationInFrames: TR });
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={S0} premountFor={TR}><Scene0 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S1} premountFor={TR}><Scene1 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S2} premountFor={TR}><Scene2 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S3} premountFor={TR}><Scene3 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S4} premountFor={TR}><Scene4 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S5} premountFor={TR}><Scene5 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S6} premountFor={TR}><Scene6 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />

      <TransitionSeries.Sequence durationInFrames={S7} premountFor={TR}><Scene7 /></TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
