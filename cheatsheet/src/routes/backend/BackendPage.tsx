import './BackendPage.css';

/* ── Section anchor nav ─────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'java21',         label: 'Java 21',         icon: '☕' },
  { id: 'springboot',     label: 'Spring Boot 3',    icon: '🌱' },
  { id: 'rest',           label: 'REST API',         icon: '🔌' },
  { id: 'websocket',      label: 'WebSocket',        icon: '⚡' },
  { id: 'microservices',  label: 'Microservices',    icon: '🧩' },
  { id: 'kafka',          label: 'Kafka + Zookeeper',icon: '📨' },
  { id: 'docker',         label: 'Docker',           icon: '🐳' },
  { id: 'openshift',      label: 'OpenShift / K8s',  icon: '🚀' },
];

/* ── Reusable code renderer ─────────────────────────────────────────────── */
function Code({ lang, children }: { lang?: string; children: string }) {
  return (
    <div className="be-code">
      {lang && <div className="be-code__label">{lang}</div>}
      <pre>{children.trim()}</pre>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SECTION DATA
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Java 21 topics ────────────────────────────────────────────────────────*/
const JAVA_TOPICS = [
  {
    icon: '📦',
    title: 'Records',
    level: 'beginner' as const,
    desc: 'Immutable data carriers. The compiler auto-generates constructor, getters (accessor methods), equals, hashCode, and toString. Ideal for DTOs, value objects, and Kafka payloads.',
    code: `// Traditional DTO — 30+ lines → 1 line with record
record TradeEvent(String tradeId, String status, double notional) {}

// Usage
var e = new TradeEvent("T-001", "BOOKED", 1_000_000.0);
System.out.println(e.tradeId());   // accessor
System.out.println(e);             // auto toString

// Compact constructor for validation
record Money(double amount, String ccy) {
    Money {
        if (amount < 0) throw new IllegalArgumentException("negative");
    }
}`,
  },
  {
    icon: '🔒',
    title: 'Sealed Classes',
    level: 'intermediate' as const,
    desc: 'Restrict which classes can extend/implement a type. Used to model exhaustive domain hierarchies (like ADTs). Works perfectly with pattern matching switch.',
    code: `sealed interface TradeStatus
    permits Pending, Active, Settled, Cancelled {}

record Pending()   implements TradeStatus {}
record Active()    implements TradeStatus {}
record Settled()   implements TradeStatus {}
record Cancelled() implements TradeStatus {}

// Exhaustive switch — compiler warns if a variant is missed
String label = switch (status) {
    case Pending()   -> "Awaiting booking";
    case Active()    -> "Live in risk book";
    case Settled()   -> "Cash exchanged";
    case Cancelled() -> "Voided";
};`,
  },
  {
    icon: '🧵',
    title: 'Virtual Threads (Project Loom)',
    level: 'expert' as const,
    desc: 'Lightweight threads managed by the JVM, not the OS. 1 million virtual threads cost what ~1000 platform threads do. Ideal for high-concurrency I/O workloads (HTTP calls, DB queries, Kafka consumers) without reactive/callback hell.',
    code: `// Spring Boot 3.2+ — enable with one property:
// spring.threads.virtual.enabled=true

// Manual usage
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i ->
        executor.submit(() -> callExternalPricingService(i))
    );
} // auto-closes, awaits all tasks

// Structured concurrency (preview in Java 21)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<Quote>  quote  = scope.fork(() -> pricingEngine.quote(rfq));
    Future<Limits> limits = scope.fork(() -> riskService.check(rfq));
    scope.join().throwIfFailed();
    return new DealTicket(quote.get(), limits.get());
}`,
  },
  {
    icon: '🎯',
    title: 'Pattern Matching',
    level: 'intermediate' as const,
    desc: 'instanceof with binding + switch expressions with type/guard patterns. Eliminates manual casting and if-else chains.',
    code: `// instanceof pattern binding (Java 16+)
if (msg instanceof TradeEvent e && e.notional() > 1_000_000) {
    log.info("Large trade: {}", e.tradeId());
}

// Switch with type patterns + guards (Java 21)
double fee = switch (product) {
    case VanillaOption o when o.premium() > 50_000 -> 0.001;
    case VanillaOption o                            -> 0.002;
    case NdfOption n                                -> 0.0015;
    case Barrier b                                  -> 0.003;
    default                                         -> 0.002;
};`,
  },
  {
    icon: '🌊',
    title: 'Streams & Collectors',
    level: 'beginner' as const,
    desc: 'Declarative pipeline for filtering, mapping, grouping, and aggregating collections. Use parallelStream() carefully — only worth it for CPU-bound ops on large sets.',
    code: `List<Trade> trades = tradeRepository.findAll();

// Group by currency pair, sum notional
Map<String, Double> notionalByCcy = trades.stream()
    .filter(t -> t.status() == TradeStatus.ACTIVE)
    .collect(Collectors.groupingBy(
        Trade::currencyPair,
        Collectors.summingDouble(Trade::notional)
    ));

// Partition into large vs small
Map<Boolean, List<Trade>> partitioned = trades.stream()
    .collect(Collectors.partitioningBy(
        t -> t.notional() >= 1_000_000
    ));

// Flat-map nested lists
List<String> allCurrencies = trades.stream()
    .flatMap(t -> Stream.of(t.buyCcy(), t.sellCcy()))
    .distinct()
    .sorted()
    .toList(); // immutable List (Java 16+)`,
  },
  {
    icon: '⏰',
    title: 'Date/Time API & Text Blocks',
    level: 'beginner' as const,
    desc: 'java.time is immutable & thread-safe. Text blocks (triple-quote strings) eliminate JSON/SQL escape noise.',
    code: `// java.time — always use Instant for UTC timestamps
Instant bookedAt = Instant.now();
LocalDate expiry  = LocalDate.of(2025, 3, 21);
ZonedDateTime tky = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));

// Period vs Duration
Period  p = Period.between(LocalDate.now(), expiry);  // calendar
Duration d = Duration.between(Instant.now(), deadline); // time

// Text block — great for test JSON / SQL
String payload = """
    {
      "tradeId": "%s",
      "status": "BOOKED",
      "notional": %.2f
    }
    """.formatted(trade.id(), trade.notional());`,
  },
];

/* ── Spring Boot 3 topics ──────────────────────────────────────────────── */
const SPRING_TOPICS = [
  {
    icon: '🔧',
    title: 'Auto-Configuration & Starters',
    level: 'beginner' as const,
    desc: 'Spring Boot reads your classpath and auto-configures beans. Starters bundle transitive dependencies. @ConditionalOnMissingBean means your beans override defaults.',
    code: `// pom.xml — one starter pulls transitive deps
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

// application.yml — type-safe properties
spring:
  datasource:
    url: jdbc:h2:mem:fxo
    driver-class-name: org.h2.Driver
  jpa:
    hibernate.ddl-auto: create-drop
    show-sql: false
server:
  port: 8080

// Custom @ConfigurationProperties bean
@ConfigurationProperties(prefix = "fxo.pricing")
record PricingProps(double spread, String baseCurrency) {}`,
  },
  {
    icon: '🌐',
    title: 'REST Controller',
    level: 'beginner' as const,
    desc: '@RestController = @Controller + @ResponseBody. Use ResponseEntity<T> for full control over status codes and headers. @Valid triggers JSR-380 bean validation on @RequestBody.',
    code: `@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @GetMapping("/{id}")
    public ResponseEntity<TradeResponse> get(@PathVariable String id) {
        return tradeService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TradeResponse book(@Valid @RequestBody BookTradeRequest req,
                              @RequestHeader("X-User-Id") String userId) {
        return tradeService.book(req, userId);
    }

    @ExceptionHandler(TradeNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(TradeNotFoundException ex) {
        return new ErrorResponse("TRADE_NOT_FOUND", ex.getMessage());
    }
}`,
  },
  {
    icon: '✅',
    title: 'Bean Validation (JSR-380)',
    level: 'beginner' as const,
    desc: 'Annotate fields on request records/classes. @Valid on the @RequestBody triggers validation before the method runs. BindingResult or MethodArgumentNotValidException carries errors.',
    code: `record BookTradeRequest(
    @NotBlank                         String currencyPair,
    @NotNull @Positive                Double notional,
    @NotNull @Future                  LocalDate expiry,
    @NotNull                          TradeType type,
    @DecimalMin("0.0") @DecimalMax("1.0") Double strike
) {}

// Global error handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return new ErrorResponse("VALIDATION_FAILED", errors.toString());
    }
}`,
  },
  {
    icon: '🗄️',
    title: 'Spring Data JPA',
    level: 'intermediate' as const,
    desc: 'JpaRepository gives CRUD + pagination for free. Derived query methods (findBy…) generate SQL from method names. @Query for custom JPQL/SQL. @Transactional demarcates unit of work.',
    code: `@Entity
@Table(name = "trades")
public class Trade {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String currencyPair;
    private double notional;
    @Enumerated(EnumType.STRING)
    private TradeStatus status;
    private String userId;
    private Instant createdAt = Instant.now();
}

public interface TradeRepository extends JpaRepository<Trade, String> {
    List<Trade> findByUserId(String userId);
    List<Trade> findByStatusAndCurrencyPair(TradeStatus s, String pair);

    @Query("SELECT t FROM Trade t WHERE t.notional >= :min ORDER BY t.createdAt DESC")
    List<Trade> findLargeTrades(@Param("min") double minNotional);

    Page<Trade> findByStatus(TradeStatus status, Pageable pageable);
}

// Service
@Transactional
public Trade book(BookTradeRequest req, String userId) {
    var trade = mapper.toEntity(req);
    trade.setUserId(userId);
    return tradeRepository.save(trade);
}`,
  },
  {
    icon: '🔍',
    title: 'Actuator & Observability',
    level: 'intermediate' as const,
    desc: 'Spring Boot Actuator exposes /actuator/* endpoints. Pair with Micrometer for metrics (Prometheus/Datadog). Health probes are used by OpenShift liveness/readiness checks.',
    code: `# application.yml
management:
  endpoints.web.exposure.include: health,info,metrics,prometheus
  endpoint.health.show-details: always
  health:
    kafka.enabled: true
    db.enabled: true

# Custom health indicator
@Component
public class PricingEngineHealthIndicator implements HealthIndicator {
    private final PricingEngine engine;
    @Override
    public Health health() {
        return engine.isReady()
            ? Health.up().withDetail("latencyMs", engine.lastLatency()).build()
            : Health.down().withDetail("reason", "pricing feed stale").build();
    }
}

# Custom metric
@Service
public class TradeService {
    private final Counter tradeCounter;
    public TradeService(MeterRegistry registry) {
        tradeCounter = Counter.builder("trades.booked")
            .tag("env", "prod").register(registry);
    }
    public Trade book(BookTradeRequest req, String userId) {
        tradeCounter.increment();
        ...
    }
}`,
  },
];

/* ── REST API Design topics ─────────────────────────────────────────────── */
const REST_TOPICS = [
  {
    icon: '📋',
    title: 'HTTP Verbs & Idempotency',
    level: 'beginner' as const,
    desc: 'GET/HEAD/OPTIONS are safe (no side effects). GET/PUT/DELETE are idempotent (same result on repeat). POST is neither. PUT replaces the whole resource; PATCH does partial update.',
    code: `GET    /api/trades          → list (safe, idempotent)
GET    /api/trades/{id}     → single resource
POST   /api/trades          → create (returns 201 + Location header)
PUT    /api/trades/{id}     → full replace (idempotent)
PATCH  /api/trades/{id}     → partial update
DELETE /api/trades/{id}     → delete (idempotent)

# Location header on creation
HTTP/1.1 201 Created
Location: /api/trades/T-00123
Content-Type: application/json

{ "id": "T-00123", "status": "PENDING" }`,
  },
  {
    icon: '🔢',
    title: 'Status Codes',
    level: 'beginner' as const,
    desc: 'Use the right 4xx for client errors — never return 200 with an error body. 422 Unprocessable Entity is the correct code for business rule violations (not validation).',
    code: `2xx Success
  200 OK              — GET/PUT/PATCH succeeded
  201 Created         — POST created a resource
  204 No Content      — DELETE succeeded (no body)

3xx Redirect
  301 Moved Permanently
  304 Not Modified    — cache hit (ETag / If-None-Match)

4xx Client Error
  400 Bad Request     — malformed JSON / missing fields
  401 Unauthorized    — no/invalid auth token
  403 Forbidden       — valid token, insufficient scope
  404 Not Found       — resource doesn't exist
  409 Conflict        — duplicate create / optimistic lock
  422 Unprocessable   — business rule violation
  429 Too Many Requests — rate limit hit

5xx Server Error
  500 Internal Server Error — unexpected exception
  503 Service Unavailable  — downstream dependency down`,
  },
  {
    icon: '📄',
    title: 'Pagination & Filtering',
    level: 'intermediate' as const,
    desc: 'Use cursor-based pagination for large/real-time datasets (stable under inserts). Offset pagination is simpler but drifts when rows are inserted. Always cap page size.',
    code: `# Offset pagination (simple, Spring Pageable)
GET /api/trades?page=0&size=20&sort=createdAt,desc

{
  "content": [...],
  "page": { "size": 20, "number": 0, "totalElements": 847, "totalPages": 43 }
}

# Cursor pagination (stable)
GET /api/trades?after=eyJpZCI6IlQtMDAxIn0&limit=20

{
  "data": [...],
  "nextCursor": "eyJpZCI6IlQtMDIxIn0",
  "hasMore": true
}

# Filtering
GET /api/trades?status=ACTIVE&currencyPair=EURUSD&notionalMin=500000

// Spring: use @RequestParam + Specification<Trade>
Specification<Trade> spec = TradeSpec.byStatus(status)
    .and(TradeSpec.byCcy(pair))
    .and(TradeSpec.minNotional(min));`,
  },
  {
    icon: '🚨',
    title: 'Error Contract & Versioning',
    level: 'intermediate' as const,
    desc: 'Agree on a consistent error envelope — never leak stack traces. API versioning: URI prefix (/v1/) is most common; header versioning (Accept: application/vnd.api+v2+json) is cleaner but harder to test.',
    code: `// Standard error envelope
{
  "timestamp": "2025-03-15T10:23:00Z",
  "status": 422,
  "error": "TRADE_LIMIT_EXCEEDED",
  "message": "Notional 5,000,000 exceeds counterparty limit of 2,000,000",
  "path": "/api/trades",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}

// URI versioning (most discoverable)
@RequestMapping("/api/v1/trades")
@RequestMapping("/api/v2/trades")

// Header versioning
@GetMapping(headers = "X-API-Version=2")

// OpenAPI / Swagger — generates interactive docs
@OpenAPIDefinition(info = @Info(title = "FXO API", version = "v1"))
@Operation(summary = "Book a trade")
@ApiResponse(responseCode = "201", description = "Trade created")
@ApiResponse(responseCode = "422", description = "Business rule violation")`,
  },
];

/* ── WebSocket topics ──────────────────────────────────────────────────── */
const WS_TOPICS = [
  {
    icon: '🔗',
    title: 'Spring WebSocket + STOMP Config',
    level: 'intermediate' as const,
    desc: 'STOMP (Simple Text Oriented Messaging Protocol) runs over WebSocket. SockJS provides fallback (long-polling) for environments that block WebSockets. Clients subscribe to /topic/* destinations.',
    code: `@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix for @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
        // In-memory broker for /topic and /queue
        registry.enableSimpleBroker("/topic", "/queue");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // fallback for older browsers
    }
}`,
  },
  {
    icon: '📡',
    title: 'Broadcasting Messages from Kafka',
    level: 'intermediate' as const,
    desc: 'A Kafka consumer listener receives domain events and forwards them to STOMP destinations via SimpMessagingTemplate. Clients subscribed to /topic/quotes receive the push instantly.',
    code: `@Service
@RequiredArgsConstructor
public class KafkaToWebSocketBridge {

    private final SimpMessagingTemplate ws;

    @KafkaListener(topics = "fxo.quote.returned", groupId = "ws-bridge")
    public void onQuote(QuoteEvent event) {
        ws.convertAndSend("/topic/quotes", event);
    }

    @KafkaListener(topics = "fxo.greeks.updated", groupId = "ws-bridge")
    public void onGreeks(GreeksSnapshot snap) {
        // Per-trade channel — only subscribers for this trade receive it
        ws.convertAndSend("/topic/greeks/" + snap.tradeId(), snap);
    }

    @KafkaListener(topics = "fxo.lifecycle.event", groupId = "ws-bridge")
    public void onLifecycle(LifecycleEvent evt) {
        ws.convertAndSend("/topic/lifecycle", evt);
        // Also push to user-specific queue
        ws.convertAndSendToUser(evt.userId(), "/queue/notifications", evt);
    }
}`,
  },
  {
    icon: '⚛️',
    title: 'React + RxJS WebSocket Client',
    level: 'expert' as const,
    desc: 'Use @stomp/stompjs with SockJS on the client. Wrap in an RxJS Subject for reactive pipelines — filter, map, scan operators make real-time blotter logic clean.',
    code: `// webSocketService.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const messages$ = new Subject<{ dest: string; body: unknown }>();

const client = new Client({
  webSocketFactory: () => new SockJS('/ws'),
  onConnect: () => {
    client.subscribe('/topic/quotes',    m => messages$.next({ dest: 'quotes',    body: JSON.parse(m.body) }));
    client.subscribe('/topic/greeks/#', m => messages$.next({ dest: 'greeks',    body: JSON.parse(m.body) }));
    client.subscribe('/topic/lifecycle', m => messages$.next({ dest: 'lifecycle', body: JSON.parse(m.body) }));
  },
  reconnectDelay: 3000,
});
client.activate();

// Typed stream per destination
export const quoteStream$ = messages$.pipe(
  filter(m => m.dest === 'quotes'),
  map(m => m.body as QuoteEvent)
);

// React hook — auto-unsubscribes on unmount
export function useObservable<T>(obs$: Observable<T>) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const sub = obs$.subscribe(setValue);
    return () => sub.unsubscribe();
  }, [obs$]);
  return value;
}`,
  },
];

/* ── Microservice patterns ──────────────────────────────────────────────── */
const MS_PATTERNS = [
  {
    icon: '🚪',
    name: 'API Gateway',
    tag: 'Infra',
    desc: 'Single entry point for all clients. Handles routing, auth, rate limiting, SSL termination, and protocol translation. Clients never talk to individual services.',
    when: 'Always — the first pattern to implement. Use Spring Cloud Gateway or Kong.',
  },
  {
    icon: '🔍',
    name: 'Service Discovery',
    tag: 'Comms',
    desc: 'Services register themselves (Eureka, Consul). Callers look up instances by service name, not hardcoded hostname. Enables horizontal scaling and rolling deploys.',
    when: 'When you have 3+ services. On OpenShift/K8s, DNS-based discovery (kube-dns) replaces Eureka.',
  },
  {
    icon: '🔌',
    name: 'Circuit Breaker',
    tag: 'Resilience',
    desc: 'Tracks failure rates per downstream call. Opens circuit (fails fast) after threshold. Half-open probes allow recovery. Prevents cascade failures and threads from blocking on broken dependencies.',
    when: 'Any synchronous call to an external service. Use Resilience4j with Spring Boot.',
  },
  {
    icon: '📜',
    name: 'Saga Pattern',
    tag: 'Data',
    desc: 'Manages distributed transactions across services using a sequence of local transactions. Choreography (event-driven) vs Orchestration (central coordinator). Compensating transactions handle rollback.',
    when: 'When a business flow spans multiple databases/services — e.g. book trade + update limits + send confirmation.',
  },
  {
    icon: '📖',
    name: 'CQRS',
    tag: 'Data',
    desc: 'Command Query Responsibility Segregation. Write model (commands) and read model (queries) are separate. Read side can use denormalized views/caches optimised for query patterns.',
    when: 'When read and write access patterns differ greatly — e.g. FX blotter needs fast reads but trade booking needs strong consistency.',
  },
  {
    icon: '📚',
    name: 'Event Sourcing',
    tag: 'Data',
    desc: 'Store state as an append-only sequence of events rather than current state. Replay events to reconstruct state at any point in time. Naturally pairs with CQRS.',
    when: 'Audit-heavy domains (trades, payments). The event log IS the source of truth.',
  },
  {
    icon: '📤',
    name: 'Outbox Pattern',
    tag: 'Reliability',
    desc: 'Write domain event to an outbox table in the same DB transaction as the state change. A separate poller publishes outbox rows to Kafka. Guarantees exactly-once publish without 2PC.',
    when: 'Any time you need to atomically update DB and publish to Kafka — e.g. book trade + emit TradeBooked event.',
  },
  {
    icon: '🌐',
    name: 'BFF (Backend for Frontend)',
    tag: 'Comms',
    desc: 'One backend aggregator per frontend client type (web, mobile). Aggregates and shapes data from multiple services. Avoids over-fetching and reduces round trips.',
    when: 'Different UI clients need very different data shapes from the same underlying services.',
  },
];

const MS_CODE = `// Circuit Breaker with Resilience4j
@CircuitBreaker(name = "pricingEngine", fallbackMethod = "fallbackQuote")
@TimeLimiter(name = "pricingEngine")
@Retry(name = "pricingEngine")
public CompletableFuture<Quote> getQuote(RFQ rfq) {
    return CompletableFuture.supplyAsync(() -> pricingClient.quote(rfq));
}

private CompletableFuture<Quote> fallbackQuote(RFQ rfq, Throwable t) {
    log.warn("Pricing engine unavailable, using cached quote: {}", t.getMessage());
    return CompletableFuture.completedFuture(quoteCacheService.getLastKnown(rfq));
}

# application.yml
resilience4j:
  circuitbreaker:
    instances:
      pricingEngine:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3`;

/* ── Kafka + Zookeeper ──────────────────────────────────────────────────── */
const KAFKA_TOPICS_DATA = [
  { icon: '📝', title: 'Core Concepts', level: 'beginner' as const, desc: 'Kafka stores records in topics, split into partitions spread across brokers. Each record has a key, value, timestamp, and offset. Consumers track their offset per partition, enabling replay. Zookeeper (or KRaft in Kafka 3.3+) manages broker metadata, leader election, and topic configs.', code: `# Topic with 3 partitions, replication factor 3
kafka-topics.sh --create \\
  --topic fxo.trade.booked \\
  --partitions 3 \\
  --replication-factor 3 \\
  --bootstrap-server kafka:9092

# Describe topic
kafka-topics.sh --describe --topic fxo.trade.booked

# Check consumer group lag
kafka-consumer-groups.sh --describe \\
  --group greeks-engine \\
  --bootstrap-server kafka:9092` },
  { icon: '📤', title: 'Spring Kafka Producer', level: 'intermediate' as const, desc: 'KafkaTemplate is the main send API. Use ProducerRecord to set key (routes to specific partition). acks=all + enable.idempotence=true gives at-least-once with deduplication. Transactions give exactly-once across multiple topics.', code: `@Service
@RequiredArgsConstructor
public class TradeEventPublisher {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTradeBooked(Trade trade) {
        var event = new TradeBookedEvent(trade.id(), trade.currencyPair(),
                                         trade.notional(), Instant.now());
        // key = tradeId ensures same trade always hits same partition
        kafkaTemplate.send("fxo.trade.booked", trade.id(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) log.error("Failed to publish", ex);
                else log.debug("Published to partition {} offset {}",
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            });
    }
}

# application.yml
spring.kafka:
  producer:
    acks: all
    enable-idempotence: true
    key-serializer: org.apache.kafka.common.serialization.StringSerializer
    value-serializer: org.springframework.kafka.support.serializer.JsonSerializer` },
  { icon: '📥', title: 'Spring Kafka Consumer', level: 'intermediate' as const, desc: '@KafkaListener with groupId enables consumer group load balancing across partitions. Use MANUAL_IMMEDIATE ack mode for at-least-once with explicit offset commit. Retry + DLT (Dead Letter Topic) handles poison-pill messages.', code: `@Component
public class GreeksEngineConsumer {

    @KafkaListener(
        topics = "fxo.trade.booked",
        groupId = "greeks-engine",
        concurrency = "3" // 3 consumers = 3 threads, 1 per partition
    )
    public void onTradeBooked(
        @Payload TradeBookedEvent event,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset,
        Acknowledgment ack
    ) {
        log.info("Processing trade {} from partition {} offset {}", event.tradeId(), partition, offset);
        greeksService.initPosition(event);
        ack.acknowledge(); // commit offset only after successful processing
    }
}

# application.yml — retry + dead-letter
spring.kafka:
  consumer:
    group-id: greeks-engine
    auto-offset-reset: earliest
    enable-auto-commit: false
  listener.ack-mode: MANUAL_IMMEDIATE` },
  { icon: '🔑', title: 'Partitioning & Keys Strategy', level: 'expert' as const, desc: 'All records with the same key go to the same partition → ordered processing for that key. Choose keys to co-locate related events (trade ID = ordering guarantee per trade). Avoid hot partitions — use composite keys or null keys for uniform distribution.', code: `// Strategy 1: tradeId key — orders events per trade
kafkaTemplate.send("fxo.lifecycle.event", trade.tradeId(), event);

// Strategy 2: null key — round-robin, max throughput
kafkaTemplate.send("fxo.greeks.updated", null, snapshot);

// Strategy 3: custom partitioner — route by currency pair
public class CurrencyPairPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        int numParts = cluster.partitionsForTopic(topic).size();
        return Math.abs(key.toString().hashCode()) % numParts;
    }
}

// Zookeeper role (pre-KRaft)
// - Stores broker list, topic configs, partition leaders
// - Manages leader election on broker failure
// - NOT in the data path — producers/consumers talk directly to brokers
// KRaft (Kafka 3.3+): Zookeeper replaced by Kafka's own Raft consensus` },
];

/* ── Docker topics ─────────────────────────────────────────────────────── */
const DOCKER_TOPICS = [
  {
    icon: '📄',
    title: 'Dockerfile — Multi-Stage Build',
    level: 'beginner' as const,
    desc: 'Multi-stage builds separate compile-time tools from the runtime image. The final image only contains the JRE + jar, not Maven or the JDK — typically 200 MB vs 700 MB.',
    code: `# Stage 1: build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download deps separately so layer is cached unless pom.xml changes
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: runtime — only JRE, no Maven/JDK
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Non-root user for security
RUN addgroup -S fxo && adduser -S fxo -G fxo
USER fxo
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]`,
  },
  {
    icon: '🐙',
    title: 'Docker Compose',
    level: 'intermediate' as const,
    desc: 'Compose defines and runs multi-container local environments. depends_on + healthcheck ensures Kafka is ready before the backend starts. Use named volumes for data persistence.',
    code: `version: "3.9"
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    healthcheck:
      test: ["CMD", "bash", "-c", "echo ruok | nc localhost 2181"]
      interval: 10s; retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on:
      zookeeper: { condition: service_healthy }
    ports: ["9092:9092"]
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  backend:
    build: ./backend
    depends_on:
      kafka: { condition: service_healthy }
    ports: ["8080:8080"]
    environment:
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      SPRING_PROFILES_ACTIVE: docker

  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]`,
  },
  {
    icon: '🌐',
    title: 'Networking & Volumes',
    level: 'intermediate' as const,
    desc: 'Containers on the same Compose network communicate by service name (DNS). Bridge network is default — isolated from the host. Host network = container shares host NIC (Linux only). Named volumes persist data across container restarts.',
    code: `# Container DNS resolution — use service names
KAFKA_BOOTSTRAP_SERVERS=kafka:9092   # not localhost!

# Explicit network declaration
networks:
  fxo-net:
    driver: bridge

services:
  backend:
    networks: [fxo-net]
  kafka:
    networks: [fxo-net]

# Named volume — data survives container restart
volumes:
  kafka-data:
services:
  kafka:
    volumes:
      - kafka-data:/var/lib/kafka/data

# Useful commands
docker compose up --build -d        # detached
docker compose logs -f backend      # tail logs
docker compose exec backend sh      # shell into container
docker compose down -v              # stop + delete volumes`,
  },
  {
    icon: '🏥',
    title: 'Health Checks & Best Practices',
    level: 'expert' as const,
    desc: 'Health checks let Compose/OpenShift know when a container is actually ready (not just started). Use .dockerignore. Never run as root. Use read-only filesystem where possible.',
    code: `# .dockerignore — keep context small
target/
*.log
.git
node_modules

# Health check in Dockerfile
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \\
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Layer caching trick — COPY dependency files first
COPY pom.xml .
RUN mvn dependency:go-offline   # cached unless pom.xml changes
COPY src ./src                   # invalidates cache only when src changes
RUN mvn package -DskipTests

# JVM container awareness (Java 11+)
ENTRYPOINT ["java",
  "-XX:+UseContainerSupport",
  "-XX:MaxRAMPercentage=75.0",
  "-Djava.security.egd=file:/dev/./urandom",
  "-jar", "app.jar"]`,
  },
];

/* ── OpenShift / Kubernetes ─────────────────────────────────────────────── */
const OC_TABLE_ROWS = [
  { obj: 'Pod', desc: 'Smallest deployable unit — 1+ containers sharing network/storage', cmd: 'oc get pods' },
  { obj: 'Deployment', desc: 'Manages ReplicaSets; handles rolling updates and rollbacks', cmd: 'oc rollout status deploy/backend' },
  { obj: 'Service', desc: 'Stable DNS name + ClusterIP for pod group; load balances', cmd: 'oc get svc' },
  { obj: 'Route', desc: 'OpenShift-specific Ingress — exposes service to external traffic with a hostname', cmd: 'oc get routes' },
  { obj: 'ConfigMap', desc: 'Non-secret config key/value pairs; mounted as env vars or files', cmd: 'oc create configmap app-config --from-file=app.yml' },
  { obj: 'Secret', desc: 'Base64-encoded sensitive config; use Sealed Secrets or Vault in prod', cmd: 'oc create secret generic db-creds --from-literal=password=xxx' },
  { obj: 'PVC', desc: 'PersistentVolumeClaim — requests durable storage for stateful workloads', cmd: 'oc get pvc' },
  { obj: 'HPA', desc: 'HorizontalPodAutoscaler — scales replica count based on CPU/memory/custom metrics', cmd: 'oc autoscale deploy/backend --min=2 --max=10 --cpu-percent=70' },
];

const OC_TOPICS = [
  {
    icon: '📦',
    title: 'Deployment Manifest',
    level: 'intermediate' as const,
    desc: 'A Deployment declares desired state. Kubernetes reconciliation loop ensures reality matches. Resources requests/limits prevent noisy-neighbour issues and enable HPA scaling.',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: fxo-backend
  labels:
    app: fxo-backend
spec:
  replicas: 2
  selector:
    matchLabels: { app: fxo-backend }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:
    metadata:
      labels: { app: fxo-backend }
    spec:
      containers:
      - name: backend
        image: registry.example.com/fxo-backend:1.2.3
        ports: [{ containerPort: 8080 }]
        resources:
          requests: { cpu: "250m", memory: "512Mi" }
          limits:   { cpu: "1",    memory: "1Gi" }
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        - name: KAFKA_BOOTSTRAP
          valueFrom:
            configMapKeyRef:
              name: kafka-config
              key: bootstrap-servers
        livenessProbe:
          httpGet: { path: /actuator/health/liveness, port: 8080 }
          initialDelaySeconds: 30; periodSeconds: 10
        readinessProbe:
          httpGet: { path: /actuator/health/readiness, port: 8080 }
          initialDelaySeconds: 20; periodSeconds: 5`,
  },
  {
    icon: '🚦',
    title: 'Liveness vs Readiness vs Startup Probes',
    level: 'intermediate' as const,
    desc: 'Liveness: is the pod alive? (restart if fails). Readiness: is the pod ready to serve traffic? (remove from load balancer if fails, do NOT restart). Startup: gives slow-starting apps time before liveness kicks in.',
    code: `// Spring Boot — expose probe endpoints
// spring-boot-starter-actuator adds:
// GET /actuator/health/liveness  → UP / DOWN
// GET /actuator/health/readiness → UP / OUT_OF_SERVICE

# application.yml
management:
  endpoint.health.probes.enabled: true
  health:
    livenessstate.enabled: true
    readinessstate.enabled: true

# K8s/OCP probe config
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  initialDelaySeconds: 30  # wait for JVM warmup
  failureThreshold: 3      # restart after 3 failures
  periodSeconds: 10

readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
  initialDelaySeconds: 20
  failureThreshold: 3
  periodSeconds: 5

startupProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  failureThreshold: 30   # 30 * 10s = 5 min grace
  periodSeconds: 10`,
  },
  {
    icon: '⚙️',
    title: 'OC CLI Essentials',
    level: 'beginner' as const,
    desc: 'oc is kubectl + OpenShift extensions (routes, builds, image streams). Most kubectl commands work with oc.',
    code: `# Login & context
oc login https://api.cluster.example.com --token=sha256~xxx
oc project my-namespace
oc whoami

# Deploy / rollout
oc apply -f deployment.yaml
oc rollout status deployment/fxo-backend
oc rollout undo deployment/fxo-backend   # instant rollback

# Debug
oc get pods -l app=fxo-backend -o wide
oc logs -f deploy/fxo-backend --tail=200
oc exec -it pod/fxo-backend-xxx -- sh
oc describe pod/fxo-backend-xxx          # events + resource usage

# Scale
oc scale deploy/fxo-backend --replicas=4
oc autoscale deploy/fxo-backend --min=2 --max=10 --cpu-percent=70

# Port-forward for local testing
oc port-forward svc/fxo-backend 8080:8080

# ConfigMap from file
oc create configmap app-config --from-file=application.yml
oc set env deploy/fxo-backend --from=configmap/app-config`,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BackendPage() {
  return (
    <div className="be-page">

      {/* ── Hero ── */}
      <div className="be-hero">
        <div className="be-hero__badge">Principal Engineer Reference</div>
        <h1 className="be-hero__title">Backend Engineering Cheatsheet</h1>
        <p className="be-hero__sub">
          Java 21 · Spring Boot 3 · REST · WebSocket · Microservices · Kafka · Docker · OpenShift
          — from beginner syntax to expert-level production patterns.
        </p>
        <div className="be-hero__nav">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="be-hero__nav-btn">
              <span>{s.icon}</span>{s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          01 JAVA 21
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="java21">
        <div className="be-section__header">
          <span className="be-section__num">01</span>
          <span className="be-section__icon">☕</span>
          <h2 className="be-section__title">Java 21 — Modern Features</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          Java 21 is an LTS release. Key highlights: Records (Java 16), Sealed Classes (Java 17),
          Pattern Matching for switch (Java 21), Virtual Threads via Project Loom (Java 21),
          and Sequenced Collections. Spring Boot 3.2+ runs on Java 21 natively.
        </div>

        <div className="be-topics">
          {JAVA_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="Java">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          02 SPRING BOOT 3
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="springboot">
        <div className="be-section__header">
          <span className="be-section__num">02</span>
          <span className="be-section__icon">🌱</span>
          <h2 className="be-section__title">Spring Boot 3 — Core Concepts</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          Spring Boot 3 requires Java 17+ and Spring Framework 6. Key changes from Boot 2:
          Jakarta EE 10 namespaces (javax.* → jakarta.*), native image support via GraalVM,
          HTTP interface clients, and improved Actuator observability with Micrometer Tracing.
        </div>

        <div className="be-topics">
          {SPRING_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="Java / YAML">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          03 REST API DESIGN
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="rest">
        <div className="be-section__header">
          <span className="be-section__num">03</span>
          <span className="be-section__icon">🔌</span>
          <h2 className="be-section__title">REST API Design</h2>
        </div>

        <div className="be-compare">
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--a">Richardson Maturity Model</div>
            <ul className="be-compare__list">
              <li>Level 0 — Plain HTTP tunnel (SOAP-style)</li>
              <li>Level 1 — Individual resources (/trades, /rfqs)</li>
              <li>Level 2 — HTTP verbs + status codes (target here)</li>
              <li>Level 3 — HATEOAS (links in response body)</li>
            </ul>
          </div>
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--b">Naming Conventions</div>
            <ul className="be-compare__list">
              <li>Nouns, not verbs: /trades not /getTrades</li>
              <li>Plural resource names: /trades/{'{id}'}</li>
              <li>Nested resources: /trades/{'{id}'}/lifecycle-events</li>
              <li>kebab-case paths: /currency-pairs</li>
              <li>camelCase JSON fields: currencyPair</li>
            </ul>
          </div>
        </div>

        <div className="be-topics">
          {REST_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="HTTP / Java">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          04 WEBSOCKET
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="websocket">
        <div className="be-section__header">
          <span className="be-section__num">04</span>
          <span className="be-section__icon">⚡</span>
          <h2 className="be-section__title">WebSocket + STOMP</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          WebSocket is a full-duplex TCP connection initiated by HTTP upgrade. STOMP adds
          pub/sub semantics (destinations, subscriptions, receipts) on top. In Spring,
          SimpMessagingTemplate pushes to /topic/* from anywhere (including Kafka consumers).
          SockJS polyfills for corporate firewalls that block WebSocket upgrades.
        </div>

        <div className="be-kafka-flow">
          <div className="be-kafka-flow__node">Kafka Consumer</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node be-kafka-flow__node--topic">WS Bridge Service</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node">SimpMessagingTemplate</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node be-kafka-flow__node--topic">/topic/greeks</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node">React Client</div>
        </div>

        <div className="be-topics">
          {WS_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang={t.title.includes('React') ? 'TypeScript' : 'Java'}>{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          05 MICROSERVICES
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="microservices">
        <div className="be-section__header">
          <span className="be-section__num">05</span>
          <span className="be-section__icon">🧩</span>
          <h2 className="be-section__title">Microservices Patterns</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          A microservice should own one bounded context and its own database (database-per-service).
          Services communicate via REST (sync) or Kafka (async). On OpenShift/K8s, service discovery
          is DNS-based — no Eureka needed. Start with a monolith and extract services when pain is felt, not upfront.
        </div>

        <div className="be-patterns">
          {MS_PATTERNS.map(p => (
            <div key={p.name} className="be-pattern">
              <div className="be-pattern__top">
                <span className="be-pattern__icon">{p.icon}</span>
                <h3 className="be-pattern__name">{p.name}</h3>
                <span className="be-pattern__tag">{p.tag}</span>
              </div>
              <p className="be-pattern__desc">{p.desc}</p>
              <div className="be-pattern__when">{p.when}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Code lang="Java — Circuit Breaker (Resilience4j)">{MS_CODE}</Code>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          06 KAFKA + ZOOKEEPER
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="kafka">
        <div className="be-section__header">
          <span className="be-section__num">06</span>
          <span className="be-section__icon">📨</span>
          <h2 className="be-section__title">Kafka + Zookeeper</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          Kafka is a distributed append-only log. A topic is split into ordered partitions;
          a consumer group distributes partitions across consumer instances (1 partition per consumer max).
          Zookeeper manages broker metadata and leader election. KRaft (Kafka 3.3+) replaces Zookeeper
          with a built-in Raft consensus layer — simpler operations, no Zookeeper JVM to manage.
        </div>

        <div className="be-kafka-flow" style={{ marginBottom: '1.5rem' }}>
          <div className="be-kafka-flow__node">Producer</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node be-kafka-flow__node--topic">Topic (N partitions)</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node">Consumer Group</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node be-kafka-flow__node--topic">Offset committed</div>
          <div className="be-kafka-flow__arrow">→</div>
          <div className="be-kafka-flow__node">Replay possible</div>
        </div>

        <div className="be-topics">
          {KAFKA_TOPICS_DATA.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="Shell / Java / YAML">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>

        <div className="be-compare" style={{ marginTop: '1.25rem' }}>
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--a">Delivery Guarantees</div>
            <ul className="be-compare__list">
              <li>At-most-once — fire and forget (auto-commit before process)</li>
              <li>At-least-once — commit after success (default)</li>
              <li>Exactly-once — idempotent producer + transactions</li>
            </ul>
          </div>
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--b">Zookeeper vs KRaft</div>
            <ul className="be-compare__list">
              <li>Zookeeper: separate JVM cluster, extra ops burden</li>
              <li>KRaft: Kafka manages its own metadata via Raft</li>
              <li>KRaft: faster startup, fewer moving parts</li>
              <li>KRaft: default in Kafka 3.3+, required in 4.0</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          07 DOCKER
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="docker">
        <div className="be-section__header">
          <span className="be-section__num">07</span>
          <span className="be-section__icon">🐳</span>
          <h2 className="be-section__title">Docker</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          A Docker image is a layered filesystem. Each RUN/COPY instruction adds a layer.
          Layers are cached — put rarely-changing instructions first (base image, dependency download)
          and frequently-changing ones last (src copy, compile) to maximise cache hits.
        </div>

        <div className="be-docker-layers">
          {[
            { label: 'Base OS (Alpine / Debian slim)', bg: '#1e293b' },
            { label: 'JRE 21 (eclipse-temurin:21-jre-alpine)', bg: '#1e3a5f' },
            { label: 'System packages (curl, ca-certs)', bg: '#312e81' },
            { label: 'App user (non-root)', bg: '#3b1f6e' },
            { label: 'Application jar', bg: '#4c1d95' },
          ].map((l, i) => (
            <div key={i} className="be-docker-layer" style={{ background: l.bg }}>
              {l.label}
            </div>
          ))}
        </div>

        <div className="be-topics">
          {DOCKER_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="Dockerfile / YAML / Shell">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          08 OPENSHIFT / KUBERNETES
          ════════════════════════════════════════════════════════════════════ */}
      <section className="be-section" id="openshift">
        <div className="be-section__header">
          <span className="be-section__num">08</span>
          <span className="be-section__icon">🚀</span>
          <h2 className="be-section__title">OpenShift / Kubernetes</h2>
        </div>

        <div className="be-callout">
          <span className="be-callout__icon">💡</span>
          OpenShift = Kubernetes + enterprise extras (Routes, ImageStreams, BuildConfigs, SCCs).
          The oc CLI is a superset of kubectl. Core principle: declare desired state in YAML,
          controllers reconcile reality. Never SSH into a pod to make changes — mutate the manifest.
        </div>

        <div className="be-table-wrap">
          <table className="be-table">
            <thead>
              <tr>
                <th>Object</th>
                <th>Purpose</th>
                <th>Common command</th>
              </tr>
            </thead>
            <tbody>
              {OC_TABLE_ROWS.map(r => (
                <tr key={r.obj}>
                  <td><strong>{r.obj}</strong></td>
                  <td>{r.desc}</td>
                  <td><code>{r.cmd}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="be-topics" style={{ marginTop: '1.25rem' }}>
          {OC_TOPICS.map(t => (
            <div key={t.title} className="be-topic">
              <div className="be-topic__head">
                <span className="be-topic__icon">{t.icon}</span>
                <h3 className="be-topic__title">{t.title}</h3>
                <span className={`be-topic__level be-topic__level--${t.level}`}>{t.level}</span>
              </div>
              <div className="be-topic__body">
                <p className="be-topic__desc">{t.desc}</p>
                <Code lang="YAML / Shell">{t.code}</Code>
              </div>
            </div>
          ))}
        </div>

        <div className="be-compare" style={{ marginTop: '1.25rem' }}>
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--a">OpenShift extras vs vanilla K8s</div>
            <ul className="be-compare__list">
              <li>Route (not just Ingress) with TLS termination</li>
              <li>ImageStream tracks image digest changes</li>
              <li>BuildConfig — build inside cluster (S2I)</li>
              <li>SCC (Security Context Constraints) — stricter than PodSecurity</li>
              <li>Embedded Prometheus + Grafana operator</li>
            </ul>
          </div>
          <div className="be-compare__col">
            <div className="be-compare__head be-compare__head--b">Deploy checklist</div>
            <ul className="be-compare__list">
              <li>Resource requests & limits set on every container</li>
              <li>Liveness + readiness probes configured</li>
              <li>Secrets in Secret objects, not ConfigMaps</li>
              <li>Non-root user in Dockerfile</li>
              <li>HPA configured for production workloads</li>
              <li>PodDisruptionBudget for zero-downtime deploys</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
