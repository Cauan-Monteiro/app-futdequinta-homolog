# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FutDeQuinta is a full-stack football (futsal) team management app with match tracking, player statistics, and role-based access. It consists of:
- **API/**: Java 21 + Spring Boot 4 backend (entry point: `SofaScoreApplication.java`)
- **FutQuinta/**: React 19 + TypeScript + Vite frontend
- **docker-compose.yaml**: Orchestrates MySQL, API, and Frontend

## Commands

### Full Stack (Docker)
```bash
docker-compose up -d
# Frontend: http://localhost:80 | API: http://localhost:8080 | MySQL: localhost:3306
```

### Backend
```bash
cd API
mvn clean install          # Build
mvn spring-boot:run        # Run (requires MySQL at mysqldb:3306)
mvn test                   # Run tests
mvn clean package -DskipTests  # Build without tests
```

### Frontend
```bash
cd FutQuinta
npm install
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Backend (Spring Boot)

**Security:** JWT-based stateless auth using Auth0 JWT library. `SecurityFilter` (OncePerRequestFilter) extracts the Bearer token and sets the Spring Security context. `TokenService` issues/validates HMAC256 tokens (15-day expiry) containing per-team role claims. Role hierarchy: `ADMIN > JOGADOR > VISITANTE`.

**Public endpoints (no auth required):**
- `POST /api/usuarios/login`
- `POST /api/usuarios/registrar`
- `GET /api/usuarios/verificar-email`
- `GET /api/partidas`
- `GET /api/jogadores`

**Protected endpoints (examples):**
- `GET /api/company` → requires ROLE_JOGADOR
- `GET /api/company/{id}` → requires ROLE_JOGADOR (used by LayoutInterno for team name/image)
- `POST /api/partidas` → requires ROLE_ADMIN

**Multi-team model:** A `Usuario` can belong to multiple `Company` teams via `Membership` entities, each with a `RoleUsuario`. These per-team roles are embedded in the JWT claims (`permissoes`), enabling the frontend to switch active teams without re-authenticating. Registration via `POST /api/usuarios/registrar` auto-creates a `Membership` with role `JOGADOR` for the company matching `VITE_COMPANY_ID`.

**Key entity relationships:**
- `Usuario` 1-1 `Jogador` (player profile with stats, linked via `idJogador` foreign key)
- `Usuario` 1-N `Membership` N-1 `Company` (team roles)
- `Partida` stores match results with `JogadorTime` (`@ElementCollection` of `{id, time}` pairs). **Saving a match does NOT auto-update player stats** — stats (`pontos`, `vitorias`, `empates`, `derrotas`, `partidas`) must be updated explicitly via `PUT /api/jogadores/{id}`

**Passwords are stored and compared in plaintext** in `UsuarioController`.

**CORS:** Allows `http://localhost`, `http://localhost:5173` (dev), and `http://129.148.62.223`. Note: `SecurityConfig` restricts globally, but controllers also declare `@CrossOrigin` individually.

### Frontend (React + TypeScript)

**Auth flow:** Login stores JWT in a cookie. `AuthContext` decodes the token on mount to populate `permissoesGlobais` (a `Record<companyId, role>` map from the JWT `permissoes` claim). Key methods: `login(token)`, `aplicarToken(token)`, `entrarComoVisitante()`. `equipeAtiva` is derived by picking the **first key** of that map — there is no explicit active-team selection yet. `RotaProtegida` redirects to `/` if no cookie is present.

**Guest access:** `entrarComoVisitante()` sets `isGuest = true` without a JWT. Guests can access `/home` (read-only) and `/ranking`, but `/sorteio` requires authentication and is blocked for guests.

**Route structure:**
- `/` → Login (public)
- `/home` → Match registration + match history (ADMIN-only write actions)
- `/ranking` → Player leaderboard (sorted by points desc, losses asc, wins desc)
- `/sorteio` → Random team draw tool (auth required)

**State:** Auth state lives in `AuthContext`. Player list (`jogadores`) is held in `App.tsx` state and passed as props to all routes. `carregarJogadores()` is passed down to `Home` and called from there — **players are not loaded on app mount**, so `Ranking` and `Sorteio` show empty lists until `Home` is visited first.

**Toast notifications:** `useToast` hook (`FutQuinta/src/hooks/useToast.ts`) manages a list of auto-dismissing toasts (4 s). `LayoutInterno` holds the `useToast` instance and passes `addToast` to child routes via React Router's `<Outlet context>`. Child routes access it with `useOutletContext()`. `ToastContainer` renders them.

**Sorteio algorithm:** Players must have `posicao` of `"Goleiro"` or `"Linha"` (the `Posicao` enum). Requires ≥2 goalkeepers and ≥8 outfield players. Balance score = `(pontos / (partidas * 3)) * 100`; players sorted descending by score, then distributed snake-draft style (indices 0,3,4,7… → Azul; 1,2,5,6… → Vermelho). Drafts can be saved/loaded via `POST/GET /api/times-sorteados` — one draft per `companyId` (upsert on save). The `TimeSorteado` entity stores player ID lists for each team plus `dataSorteio`.

**Player attributes:** `Jogador` has an `@Embedded` `Atributos` object (`attack`, `defense`, `shot`, `pass`, `physical`, `pace`) stored as columns on the same table. These attributes are not yet used in any balancing logic.

No additional state management library (no Redux/Zustand).

**Admin gating:** Certain actions (creating matches) are protected by both Spring Security role checks on the API and a secondary frontend password prompt (`VITE_ADMIN_PASSWORD`).

### Environment Variables (FutQuinta/.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_ADMIN_PASSWORD=Admin@5678
VITE_TITULO_MAIN=⚽ BID FutDeQuinta HOMOLOG🍻
VITE_COMPANY_ID=1
```

### Database
MySQL with `stats_data` database. Hibernate `ddl-auto=update` auto-manages schema. Sample seed data is in the root `insertDB_*.json` files.
