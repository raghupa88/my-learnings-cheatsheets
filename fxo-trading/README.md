# FXO Trading Platform

A full-stack Foreign Exchange Options (FXO) trading simulation built as a reference implementation for SCB principal engineers. It demonstrates end-to-end trade lifecycle — from client RFQ through pricing, booking, Greeks monitoring, confirmation, and settlement — using event-driven architecture.

---

## Workspace layout

```
fxo-trading/
├── backend/              Spring Boot 3.2 · Java 21 · Maven
├── frontend/             React 18 · TypeScript · Vite
└── docker-compose.yml    Zookeeper + Kafka + backend + frontend
```

This workspace is part of the `my-learnings-cheatsheets` npm monorepo. The sibling `cheatsheet/` workspace hosts the static D&FX reference SPA.

---

## System architecture

```mermaid
graph TD
    Browser["Browser\n(React SPA)"]

    subgraph Docker Compose
        FE["Frontend\nnginx :3000"]
        BE["Backend\nSpring Boot :8080"]
        KF["Kafka\n:29092 (internal)"]
        ZK["Zookeeper\n:2181"]
    end

    Browser -->|HTTP REST| FE
    Browser -->|STOMP/WebSocket| FE
    FE -->|proxy /api| BE
    FE -->|proxy /ws| BE
    BE -->|produce/consume| KF
    KF --> ZK

    BE -->|H2 in-memory DB| DB[(H2)]
```

---

## Event flow

```mermaid
sequenceDiagram
    actor Sales as Sales (Alice)
    participant API as REST API
    participant Kafka
    participant PE as PricingEngine
    participant WS as WebSocket Broker
    participant Browser

    Sales->>API: POST /api/rfq
    API->>Kafka: fxo.rfq.created
    Kafka->>PE: consume (800ms delay)
    PE->>Kafka: fxo.quote.returned
    Kafka->>WS: broadcast /topic/quotes
    WS->>Browser: live quote update (flash animation)

    Note over API,WS: Repeat every 5s for Greeks
    API->>Kafka: fxo.greeks.updated (GreeksEngine @Scheduled)
    Kafka->>WS: broadcast /topic/greeks
    WS->>Browser: Delta/Gamma/Vega/Theta charts update

    Sales->>API: POST /api/lifecycle/:id (CONFIRMED)
    API->>Kafka: fxo.lifecycle.event
    Kafka->>WS: broadcast /topic/lifecycle
    WS->>Browser: SWIFT MT300 preview appears
```

---

## Trade lifecycle state machine

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Trade booked
    ACTIVE --> CONFIRMED : POST /lifecycle/:id {CONFIRMED}
    ACTIVE --> EXPIRED : POST /lifecycle/:id {EXPIRED}
    ACTIVE --> ACTIVE : POST /lifecycle/:id {BARRIER_HIT}
    CONFIRMED --> SETTLED : POST /lifecycle/:id {SETTLED}
    CONFIRMED --> EXPIRED : POST /lifecycle/:id {EXPIRED}
    SETTLED --> [*]
    EXPIRED --> [*]
```

---

## Role-based screens

```mermaid
graph LR
    Login["Login\n(persona picker)"]

    Login -->|Alice · SALES| RFQ["RFQ Blotter\nSubmit & watch live quotes"]
    Login -->|Bob · TRADER| DT["Deal Ticket\nBook trades"]
    Login -->|David · RISK| Risk["Greeks Dashboard\nΔ Γ ν Θ live charts"]
    Login -->|Carol · OPS| Conf["Confirmation\nSWIFT MT300 preview"]

    DT --> LC["Lifecycle\nConfirm · Settle · Expire"]
    Conf --> LC
```

---

## Quick start

### Full stack (Docker)

```bash
cd fxo-trading
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8080        |
| H2 console | http://localhost:8080/h2-console |

### Development (without Docker)

Start Kafka locally (or use a cloud broker), then:

```bash
# Terminal 1 — backend
cd fxo-trading/backend
KAFKA_BOOTSTRAP_SERVERS=localhost:9092 mvn spring-boot:run

# Terminal 2 — frontend (dev server with HMR)
cd fxo-trading/frontend
npm install
npm run dev        # → http://localhost:5174
```

The Vite dev server proxies `/api` and `/ws` to `localhost:8080` automatically.

### From the monorepo root

```bash
npm run dev:fxo      # starts frontend dev server
npm run build:fxo    # production build of frontend
```

---

## Test personas

| ID   | Name         | Role       | Landing page        |
|------|--------------|------------|---------------------|
| U001 | Alice Chen   | SALES      | RFQ Blotter         |
| U002 | Bob Kumar    | TRADER     | Deal Ticket         |
| U003 | Carol White  | OPERATIONS | Confirmation & SWIFT|
| U004 | David Park   | RISK       | Greeks Dashboard    |

No passwords — mock authentication via `POST /api/auth/login { userId }`.

---

## Sub-workspace docs

- [Backend →](./backend/README.md) — Spring Boot, Kafka topics, REST API reference, entity model
- [Frontend →](./frontend/README.md) — React app structure, screens, WebSocket integration
