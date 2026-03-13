# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FutDeQuinta is a full-stack football (futsal) team management app with match tracking, player statistics, and role-based access. It consists of:
- **API/**: Java 21 + Spring Boot 4 backend
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

**Only public endpoint:** `POST /api/usuarios/login`

**Multi-team model:** A `Usuario` can belong to multiple `Company` teams via `Membership` entities, each with a `RoleUsuario`. These per-team roles are embedded in the JWT claims (`permissoes`), enabling the frontend to switch active teams without re-authenticating.

**Key entity relationships:**
- `Usuario` 1-1 `Jogador` (player profile with stats)
- `Usuario` 1-N `Membership` N-1 `Company` (team roles)
- `Partida` stores match results; saving a match triggers player stat updates (pontos, vitorias, empates, derrotas)

**CORS:** Only allows `http://localhost` and `http://129.148.62.223`.

### Frontend (React + TypeScript)

**Auth flow:** Login stores JWT in a cookie. `AuthContext` decodes the token on mount to extract `equipeAtiva` (active team) and `permissoesGlobais` (per-team permission map). `RotaProtegida` redirects to `/` if no cookie is present.

**Route structure:**
- `/` → Login (public)
- `/home` → Match registration + match history (ADMIN-only write actions)
- `/ranking` → Player leaderboard (sorted by points desc, losses asc, wins desc)
- `/sorteio` → Random team draw tool

**State:** Auth state lives in `AuthContext`. Player list (`jogadores`) is fetched in `App.tsx` and passed as props. No additional state management library (no Redux/Zustand).

**Admin gating:** Certain actions (creating matches) are protected by both Spring Security role checks on the API and a secondary frontend password prompt (`VITE_ADMIN_PASSWORD`).

### Environment Variables (FutQuinta/.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_ADMIN_PASSWORD=Admin@5678
VITE_TITULO_MAIN=⚽ BID FutDeQuinta HOMOLOG🍻
```

### Database
MySQL with `stats_data` database. Hibernate `ddl-auto=update` auto-manages schema. Sample seed data is in the root `insertDB_*.json` files.
