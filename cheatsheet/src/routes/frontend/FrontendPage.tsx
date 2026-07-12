import { TopicCheckbox } from '../../components/TopicCheckbox/TopicCheckbox';
import './FrontendPage.css';
import '../backend/BackendPage.css'; // reuse be-topic, be-code, be-callout etc.

const SECTIONS = [
  { id: 'espjs-core',    label: 'esp-js Core',          icon: '⚡' },
  { id: 'espjs-react',   label: 'esp-js + React',        icon: '⚛️' },
  { id: 'espjs-vs-redux',label: 'esp-js vs Redux',       icon: '⚖️' },
  { id: 'react-patterns',label: 'React Patterns',        icon: '🧩' },
];

function Code({ lang, children }: { lang?: string; children: string }) {
  return (
    <div className="be-code">
      {lang && <div className="be-code__label">{lang}</div>}
      <pre>{children.trim()}</pre>
    </div>
  );
}

/* ── esp-js Core topics ─────────────────────────────────────────────────── */
const ESP_CORE_TOPICS = [
  {
    icon: '📦',
    title: 'What is esp-js?',
    level: 'beginner' as const,
    desc: 'esp-js (Event State Processor) is a reactive, event-driven state management library. A Router dispatches events; Models hold state and declare which events they handle via observeEvent(). Views observe model streams and re-render when state changes. The pattern enforces a strict unidirectional data flow.',
    code: `// Install
npm install esp-js esp-js-react

// The 3 concepts
// 1. Router  — the message bus; dispatches events to models
// 2. Model   — holds state; handles events via observeEvent()
// 3. View    — subscribes to model changes; renders

import { Router } from 'esp-js';

const router = new Router();

// Register a model with an id
router.addModel('tradeBlotter', {
  trades: [],
  isLoading: false,
});

// Publish an event
router.publishEvent('tradeBlotter', 'loadTrades', { userId: 'U001' });`,
  },
  {
    icon: '🔄',
    title: 'observeEvent — Handling Events',
    level: 'beginner' as const,
    desc: 'observeEvent() registers a handler for a specific event name on a model. Handlers receive the model (mutable during event processing), event data, and an eventContext. All mutations happen synchronously inside the handler — the router batches updates and notifies observers once after all handlers complete.',
    code: `import { Router } from 'esp-js';

const router = new Router();

// Model with event handlers
const blotterModel = {
  trades: [],
  isLoading: false,
  error: null,
};

router.addModel('tradeBlotter', blotterModel);

// Handle 'loadTrades' event — model is mutable here
router
  .getEventObservable('tradeBlotter', 'loadTrades')
  .subscribe((model, event, eventContext) => {
    model.isLoading = true;
    model.error = null;
    // fetch trades async, then publish result event
    fetchTrades(event.userId).then(trades => {
      router.publishEvent('tradeBlotter', 'tradesLoaded', { trades });
    });
  });

router
  .getEventObservable('tradeBlotter', 'tradesLoaded')
  .subscribe((model, event) => {
    model.trades = event.trades;
    model.isLoading = false;
  });

// Publish
router.publishEvent('tradeBlotter', 'loadTrades', { userId: 'U001' });`,
  },
  {
    icon: '👁️',
    title: 'getModelObservable — Observing State',
    level: 'intermediate' as const,
    desc: 'getModelObservable() returns an RxJS-compatible Observable that emits a snapshot of the model after each event processing cycle. Views subscribe to this to receive state updates. The observable emits the model by reference — do not mutate the received model outside an event handler.',
    code: `import { Router } from 'esp-js';

const router = new Router();
router.addModel('tradeBlotter', { trades: [], isLoading: false });

// Subscribe to model updates
router
  .getModelObservable('tradeBlotter')
  .subscribe(model => {
    console.log('State updated:', model.trades.length, 'trades');
    renderBlotter(model); // your render function
  });

// With RxJS operators (esp-js observables are compatible)
router
  .getModelObservable('tradeBlotter')
  .filter(m => !m.isLoading)
  .map(m => m.trades.filter(t => t.status === 'ACTIVE'))
  .subscribe(activeTrades => {
    renderActiveTrades(activeTrades);
  });

// Router lifecycle
router.isRunning; // true after first event
router.dispose(); // clean up all subscriptions`,
  },
  {
    icon: '🏗️',
    title: 'Model Classes & Regions',
    level: 'intermediate' as const,
    desc: 'In production apps, models are classes with observeEvent() calls in an init() method. esp-js supports "regions" — logical groupings of models (like micro-frontends). A region owns a slice of the UI and its models.',
    code: `import { Router, observeEvent } from 'esp-js';

class TradeBlotterModel {
  trades = [];
  selectedTradeId = null;
  isLoading = false;
  error = null;

  // Called by router after model is added
  observeEvents() {
    this.router
      .getEventObservable(this.modelId, 'tradeSelected')
      .subscribe((model, event) => {
        model.selectedTradeId = event.tradeId;
      });

    this.router
      .getEventObservable(this.modelId, 'loadTrades')
      .subscribe((model, event) => {
        model.isLoading = true;
        fetchTrades(event.userId).then(trades =>
          this.router.publishEvent(this.modelId, 'tradesLoaded', { trades })
        );
      });

    this.router
      .getEventObservable(this.modelId, 'tradesLoaded')
      .subscribe((model, event) => {
        model.trades = event.trades;
        model.isLoading = false;
      });
  }
}

// Registration
const router = new Router();
const modelId = 'tradeBlotter';
router.addModel(modelId, new TradeBlotterModel());`,
  },
  {
    icon: '🔀',
    title: 'Event Workflow & Pre/Post Processing',
    level: 'expert' as const,
    desc: 'esp-js has a multi-stage event pipeline: PreProcess → Process → PostProcess. Multiple handlers can observe the same event at different stages. Use PreProcess for validation/guards, Process for state mutation, PostProcess for derived state (computed fields, side effects).',
    code: `import { ObservationStage } from 'esp-js';

// PreProcess — validation / guard, can cancel event
router
  .getEventObservable('tradeBlotter', 'bookTrade', ObservationStage.preview)
  .subscribe((model, event, eventContext) => {
    if (!event.currencyPair || !event.notional) {
      eventContext.cancel(); // stops event propagating further
      model.validationError = 'Currency pair and notional are required';
    }
  });

// Process — normal state mutation
router
  .getEventObservable('tradeBlotter', 'bookTrade', ObservationStage.normal)
  .subscribe((model, event) => {
    model.pendingTrade = event;
    model.isSubmitting = true;
  });

// PostProcess — derived / computed state
router
  .getEventObservable('tradeBlotter', 'bookTrade', ObservationStage.committed)
  .subscribe((model) => {
    // Recompute summary after all normal handlers ran
    model.totalNotional = model.trades.reduce((s, t) => s + t.notional, 0);
    model.lastUpdated = new Date().toISOString();
  });`,
  },
];

/* ── esp-js + React topics ──────────────────────────────────────────────── */
const ESP_REACT_TOPICS = [
  {
    icon: '🔌',
    title: 'RouterProvider & useRouter',
    level: 'beginner' as const,
    desc: 'esp-js-react provides RouterProvider to inject the router via context, and useRouter() to access it in any component. Wrap the app root with RouterProvider once.',
    code: `import { RouterProvider } from 'esp-js-react';
import { Router } from 'esp-js';
import { TradeBlotter } from './components/TradeBlotter';

const router = new Router();
// Register models
router.addModel('tradeBlotter', new TradeBlotterModel(router));
router.addModel('dealTicket', new DealTicketModel(router));

// App root
function App() {
  return (
    <RouterProvider router={router}>
      <div className="app-layout">
        <TradeBlotter modelId="tradeBlotter" />
        <DealTicket modelId="dealTicket" />
      </div>
    </RouterProvider>
  );
}

// Any component can access the router
import { useRouter } from 'esp-js-react';

function TradeRow({ trade }) {
  const router = useRouter();

  const select = () =>
    router.publishEvent('tradeBlotter', 'tradeSelected', { tradeId: trade.id });

  return <tr onClick={select}>{trade.currencyPair}</tr>;
}`,
  },
  {
    icon: '👁️',
    title: 'useModelObservable — Reactive State in Components',
    level: 'intermediate' as const,
    desc: 'useModelObservable() subscribes a React component to a model stream. The component re-renders only when the model emits (after each event cycle). Optionally pass a selector to extract and memoize a slice of state.',
    code: `import { useModelObservable, useRouter } from 'esp-js-react';

// Full model — component re-renders on every model update
function TradeBlotter({ modelId }) {
  const model = useModelObservable(modelId);
  const router = useRouter();

  if (!model) return null;

  return (
    <div>
      {model.isLoading && <Spinner />}
      {model.error && <ErrorBanner message={model.error} />}
      <table>
        {model.trades.map(t => (
          <TradeRow
            key={t.id}
            trade={t}
            isSelected={t.id === model.selectedTradeId}
            onSelect={id => router.publishEvent(modelId, 'tradeSelected', { tradeId: id })}
          />
        ))}
      </table>
    </div>
  );
}

// With selector — only re-renders when selected trade changes
function TradeDetailPanel({ modelId }) {
  const selectedTrade = useModelObservable(
    modelId,
    model => model.trades.find(t => t.id === model.selectedTradeId)
  );
  if (!selectedTrade) return <p>Select a trade</p>;
  return <TradeDetail trade={selectedTrade} />;
}`,
  },
  {
    icon: '📡',
    title: 'Publishing Events from React',
    level: 'beginner' as const,
    desc: 'Components publish events via useRouter().publishEvent(). Never mutate model state directly from a component — always go through an event. This keeps the data flow unidirectional and debuggable.',
    code: `import { useRouter } from 'esp-js-react';

function DealTicketForm({ modelId }) {
  const router = useRouter();
  const model = useModelObservable(modelId);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.publishEvent(modelId, 'bookTrade', {
      currencyPair: model.form.currencyPair,
      notional:     model.form.notional,
      strike:       model.form.strike,
      expiry:       model.form.expiry,
    });
  };

  const handleFieldChange = (field, value) =>
    router.publishEvent(modelId, 'fieldChanged', { field, value });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={model?.form?.currencyPair ?? ''}
        onChange={e => handleFieldChange('currencyPair', e.target.value)}
      />
      <input
        type="number"
        value={model?.form?.notional ?? ''}
        onChange={e => handleFieldChange('notional', +e.target.value)}
      />
      <button type="submit" disabled={model?.isSubmitting}>
        {model?.isSubmitting ? 'Booking…' : 'Book Trade'}
      </button>
    </form>
  );
}`,
  },
  {
    icon: '🧪',
    title: 'Testing esp-js Models',
    level: 'intermediate' as const,
    desc: 'Models are plain objects or classes — test them without React. Create a router, register the model, publish events, and assert on the model state snapshot via getModelObservable. Use Jest + the RxJS TestScheduler if timing matters.',
    code: `import { Router } from 'esp-js';
import { TradeBlotterModel } from './TradeBlotterModel';

describe('TradeBlotterModel', () => {
  let router, modelStates;

  beforeEach(() => {
    router = new Router();
    modelStates = [];
    router.addModel('blotter', new TradeBlotterModel(router, 'blotter'));
    router.getModelObservable('blotter').subscribe(m => modelStates.push({ ...m }));
  });

  afterEach(() => router.dispose());

  test('loads trades on loadTrades event', done => {
    const mockTrades = [{ id: 'T-001', currencyPair: 'EURUSD', notional: 1000000 }];
    jest.spyOn(global, 'fetchTrades').mockResolvedValue(mockTrades);

    router.publishEvent('blotter', 'loadTrades', { userId: 'U001' });

    // After publish: isLoading should be true
    expect(modelStates.at(-1).isLoading).toBe(true);

    // After async fetch resolves
    setTimeout(() => {
      expect(modelStates.at(-1).isLoading).toBe(false);
      expect(modelStates.at(-1).trades).toHaveLength(1);
      done();
    }, 50);
  });
});`,
  },
];

/* ── esp-js vs Redux comparison ─────────────────────────────────────────── */
const VS_ROWS = [
  { aspect: 'Core concept',     esp: 'EventRouter + model observers', redux: 'Single store + pure reducers' },
  { aspect: 'State mutation',   esp: 'Mutable inside event handler (by design)', redux: 'Immutable — return new state object' },
  { aspect: 'Async handling',   esp: 'Publish result event from async callback', redux: 'Middleware (Thunk, Saga, Observable)' },
  { aspect: 'DevTools',         esp: 'esp-js devtools (limited)', redux: 'Redux DevTools (time-travel, excellent)' },
  { aspect: 'Boilerplate',      esp: 'Low — no action creators, no reducers', redux: 'Medium-High (RTK reduces it significantly)' },
  { aspect: 'Multi-model',      esp: 'Native — each model is independent', redux: 'combineReducers / slices' },
  { aspect: 'Observable / RxJS',esp: 'First-class — getModelObservable() is RxJS-compatible', redux: 'Via redux-observable middleware' },
  { aspect: 'Learning curve',   esp: 'Lower for OOP/mutable-state backgrounds', redux: 'Lower for FP/immutability backgrounds' },
  { aspect: 'Ecosystem',        esp: 'Smaller — internal Deutsche Bank origin', redux: 'Huge — React-Redux, RTK, RTK Query' },
  { aspect: 'Use when',         esp: 'Complex per-model event pipelines, multi-model blotter UIs', redux: 'Standard React SPA, team familiarity, DevTools need' },
];

/* ── React patterns topics ──────────────────────────────────────────────── */
const REACT_TOPICS = [
  {
    icon: '🎣',
    title: 'Custom Hooks Pattern',
    level: 'intermediate' as const,
    desc: 'Extract stateful logic into custom hooks. In an esp-js codebase, custom hooks wrap useModelObservable + useRouter to give components a clean API with no direct esp-js imports.',
    code: `// hooks/useTradeBlotter.ts
import { useModelObservable, useRouter } from 'esp-js-react';

const MODEL_ID = 'tradeBlotter';

export function useTradeBlotter() {
  const router = useRouter();
  const model  = useModelObservable(MODEL_ID);

  return {
    trades:      model?.trades ?? [],
    isLoading:   model?.isLoading ?? false,
    selectedId:  model?.selectedTradeId ?? null,
    selectTrade: (tradeId: string) =>
      router.publishEvent(MODEL_ID, 'tradeSelected', { tradeId }),
    loadTrades:  (userId: string) =>
      router.publishEvent(MODEL_ID, 'loadTrades', { userId }),
  };
}

// Component — no esp-js imports at all
function TradeBlotter() {
  const { trades, isLoading, selectTrade, loadTrades } = useTradeBlotter();

  useEffect(() => { loadTrades('U001'); }, []);

  if (isLoading) return <Spinner />;
  return (
    <table>
      {trades.map(t => (
        <tr key={t.id} onClick={() => selectTrade(t.id)}>{t.currencyPair}</tr>
      ))}
    </table>
  );
}`,
  },
  {
    icon: '⚡',
    title: 'useMemo & useCallback',
    level: 'intermediate' as const,
    desc: 'useMemo memoises a computed value (re-computes only when deps change). useCallback memoises a function reference. Both prevent child re-renders when parent state unrelated to the child changes. Overusing them adds overhead — profile first.',
    code: `function TradeBlotter({ trades, filters }) {
  // useMemo — expensive filter only runs when trades or filters change
  const filteredTrades = useMemo(
    () => trades.filter(t =>
      (!filters.ccy || t.currencyPair.startsWith(filters.ccy)) &&
      (!filters.minNotional || t.notional >= filters.minNotional)
    ),
    [trades, filters.ccy, filters.minNotional]
  );

  // useCallback — stable reference so TradeRow doesn't re-render
  const handleSelect = useCallback(
    (tradeId: string) => selectTrade(tradeId),
    [selectTrade] // stable if coming from a custom hook
  );

  return (
    <table>
      {filteredTrades.map(t => (
        // Without useCallback, TradeRow re-renders on every parent render
        <TradeRow key={t.id} trade={t} onSelect={handleSelect} />
      ))}
    </table>
  );
}

// Memo — skip re-render if props didn't change
const TradeRow = React.memo(({ trade, onSelect }) => (
  <tr onClick={() => onSelect(trade.id)}>{trade.currencyPair}</tr>
));`,
  },
  {
    icon: '🌍',
    title: 'Context for Cross-Cutting Concerns',
    level: 'intermediate' as const,
    desc: 'React Context avoids prop drilling for cross-cutting concerns like auth, theme, and feature flags. In an esp-js app, the router itself is injected via RouterProvider context. Keep context lean — fat context causes unnecessary re-renders across many consumers.',
    code: `// AuthContext — user session available everywhere
const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (userId: string) => {
    const u = await authService.login(userId);
    setUser(u);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook — single access point
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Usage — no prop drilling
function TradeBlotter() {
  const { user } = useAuth();
  // ...
}`,
  },
  {
    icon: '🚀',
    title: 'Performance: React.memo & Virtualization',
    level: 'expert' as const,
    desc: 'For large blotter tables (1000+ rows), virtualize the list — only render visible rows. react-window or TanStack Virtual renders ~20 DOM rows regardless of data size. Pair with React.memo to prevent row re-renders when unchanged.',
    code: `import { FixedSizeList as List } from 'react-window';

// Virtualized trade blotter — renders only ~20 rows at any time
function VirtualizedBlotter({ trades }) {
  const Row = useCallback(
    ({ index, style }) => (
      <div style={style}>
        <TradeRow trade={trades[index]} />
      </div>
    ),
    [trades]
  );

  return (
    <List
      height={600}        // visible height px
      itemCount={trades.length}
      itemSize={48}       // row height px
      width="100%"
    >
      {Row}
    </List>
  );
}

// react-query / SWR for server state — keeps esp-js models for UI state only
import { useQuery } from '@tanstack/react-query';

function useTrades(userId: string) {
  return useQuery({
    queryKey: ['trades', userId],
    queryFn:  () => fetch('/api/trades?userId=' + userId).then(r => r.json()),
    staleTime: 30_000,   // 30s before background refetch
    refetchInterval: 60_000,
  });
}`,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function FrontendPage() {
  return (
    <div className="fe-page">

      {/* Hero */}
      <div className="fe-hero">
        <div className="fe-hero__badge">Principal Engineer Reference</div>
        <h1 className="fe-hero__title">Frontend Engineering Cheatsheet</h1>
        <p className="fe-hero__sub">
          esp-js (Event State Processor) · esp-js + React · vs Redux · React performance patterns
          — from first principles to production-grade blotter UIs.
        </p>
        <div className="fe-hero__nav">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="fe-hero__nav-btn">
              <span>{s.icon}</span>{s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          01 esp-js CORE
          ════════════════════════════════════════════════════════════════════ */}
      <section className="fe-section" id="espjs-core">
        <div className="fe-section__header">
          <span className="fe-section__num">01</span>
          <span className="fe-section__icon">⚡</span>
          <h2 className="fe-section__title">esp-js Core</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          esp-js was open-sourced by Deutsche Bank. It enforces a strict event → model → view flow.
          Unlike Redux, models are <strong>mutable inside event handlers</strong> — the router owns the processing cycle
          and notifies observers only after all handlers complete. This makes it natural for OOP-style
          complex domain models (blotters, deal tickets, risk grids) where immutability adds noise.
        </div>

        {/* Data flow diagram */}
        <div className="fe-flow">
          <div className="fe-flow__node">UI Event</div>
          <div className="fe-flow__arrow">→</div>
          <div className="fe-flow__node fe-flow__node--esp">router.publishEvent()</div>
          <div className="fe-flow__arrow">→</div>
          <div className="fe-flow__node fe-flow__node--esp">getEventObservable() handlers</div>
          <div className="fe-flow__arrow">→</div>
          <div className="fe-flow__node">Model mutated</div>
          <div className="fe-flow__arrow">→</div>
          <div className="fe-flow__node fe-flow__node--esp">getModelObservable() emits</div>
          <div className="fe-flow__arrow">→</div>
          <div className="fe-flow__node">React re-renders</div>
        </div>

        <div className="be-topics">
          {ESP_CORE_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
                <TopicCheckbox topicKey={`frontend/espjs-core/${t.title}`} />
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="TypeScript">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          02 esp-js + REACT
          ════════════════════════════════════════════════════════════════════ */}
      <section className="fe-section" id="espjs-react">
        <div className="fe-section__header">
          <span className="fe-section__num">02</span>
          <span className="fe-section__icon">⚛️</span>
          <h2 className="fe-section__title">esp-js + React</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          esp-js-react bridges the esp-js router into React's component tree.
          <code> RouterProvider</code> injects the router via context;
          <code> useModelObservable(modelId)</code> subscribes the component to a model stream
          and triggers a re-render when it emits.
          Components never hold domain state — they only display what the model provides and
          publish events back to the router.
        </div>

        <div className="be-topics">
          {ESP_REACT_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
                <TopicCheckbox topicKey={`frontend/espjs-react/${t.title}`} />
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="TypeScript / React">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          03 esp-js vs Redux
          ════════════════════════════════════════════════════════════════════ */}
      <section className="fe-section" id="espjs-vs-redux">
        <div className="fe-section__header">
          <span className="fe-section__num">03</span>
          <span className="fe-section__icon">⚖️</span>
          <h2 className="fe-section__title">esp-js vs Redux</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          Both solve the same problem: predictable state management with a unidirectional data flow.
          esp-js favours mutable OOP models and per-model event routing.
          Redux (with RTK) favours immutable FP-style slices and a single store.
          Neither is universally better — the right choice depends on team background and domain complexity.
        </div>

        <div className="fe-vs">
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>esp-js</th>
                <th>Redux / RTK</th>
              </tr>
            </thead>
            <tbody>
              {VS_ROWS.map(r => (
                <tr key={r.aspect}>
                  <td><strong>{r.aspect}</strong></td>
                  <td>{r.esp}</td>
                  <td>{r.redux}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Code lang="TypeScript — equivalent patterns side by side">{`// ── SAME FEATURE: load trades ──────────────────────────────────────────────

// esp-js
router
  .getEventObservable('blotter', 'loadTrades')
  .subscribe((model, event) => {
    model.isLoading = true;                         // mutate directly
    fetchTrades(event.userId).then(trades =>
      router.publishEvent('blotter', 'tradesLoaded', { trades })
    );
  });
router
  .getEventObservable('blotter', 'tradesLoaded')
  .subscribe((model, event) => {
    model.trades = event.trades;                    // mutate directly
    model.isLoading = false;
  });

// Redux Toolkit (RTK)
const blotterSlice = createSlice({
  name: 'blotter',
  initialState: { trades: [], isLoading: false },
  reducers: {
    tradesLoaded: (state, action) => {
      state.trades = action.payload;                // Immer makes this feel mutable
      state.isLoading = false;
    },
  },
});
const loadTrades = createAsyncThunk('blotter/load', async (userId) => {
  return await fetchTrades(userId);                 // auto-dispatches pending/fulfilled/rejected
});`}</Code>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          04 REACT PATTERNS
          ════════════════════════════════════════════════════════════════════ */}
      <section className="fe-section" id="react-patterns">
        <div className="fe-section__header">
          <span className="fe-section__num">04</span>
          <span className="fe-section__icon">🧩</span>
          <h2 className="fe-section__title">React Patterns</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          These patterns apply regardless of whether you use esp-js or Redux.
          In a financial blotter UI: <strong>virtualize</strong> large tables,
          <strong>memoize</strong> row components and expensive filters,
          <strong>isolate</strong> cross-cutting concerns (auth, theme) into context,
          and <strong>wrap</strong> esp-js/Redux in custom hooks so components stay clean.
        </div>

        <div className="be-topics">
          {REACT_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
                <TopicCheckbox topicKey={`frontend/react-patterns/${t.title}`} />
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="TypeScript / React">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
