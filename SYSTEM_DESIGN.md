# Health Tracker App — System Design & Scalability

> **Purpose**: Documents the advanced system design concepts implemented or planned for this project, demonstrating production-readiness and engineering depth for interviews and resume review.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Gateway & Load Balancing](#2-api-gateway--load-balancing)
3. [Caching Strategy (Redis)](#3-caching-strategy-redis)
4. [Asynchronous Processing & Message Queues](#4-asynchronous-processing--message-queues)
5. [Database Design & Scaling](#5-database-design--scaling)
6. [Containerization (Docker)](#6-containerization-docker)
7. [Orchestration (Kubernetes)](#7-orchestration-kubernetes)
8. [Observability — Logging, Metrics, Tracing](#8-observability--logging-metrics-tracing)
9. [Security Design](#9-security-design)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Deployment Strategy](#11-deployment-strategy)
12. [Interview Talking Points](#12-interview-talking-points)
13. [Implementation Roadmap](#13-implementation-roadmap)

---

## 1. Architecture Overview

This project follows a **layered, modular architecture** that started as a focused monolith and is designed to scale horizontally into microservices. The key principle is **separation of concerns** — the API, background workers, caching, and database all operate independently.

```
                            ┌──────────────────────────────────┐
                            │        Global CDN (Cloudflare)   │
                            │  React Static Assets, Edge Cache │
                            └─────────────┬────────────────────┘
                                          │ HTTPS
                            ┌─────────────▼────────────────────┐
                            │    NGINX  (Reverse Proxy)         │
                            │    SSL Termination, Rate Limit    │
                            └─┬───────────┬──────────┬─────────┘
                              │           │          │
                  ┌───────────▼┐  ┌───────▼──┐  ┌───▼────────┐
                  │ Node.js    │  │ Node.js  │  │ Node.js    │
                  │ Server :1  │  │ Server:2 │  │ Server:3   │
                  └─────┬──────┘  └────┬─────┘  └─────┬──────┘
                        │             │               │
                  ┌─────▼─────────────▼───────────────▼──────┐
                  │              Redis Cache                   │
                  └─────────────────────┬─────────────────────┘
                                        │
                  ┌─────────────────────▼─────────────────────┐
                  │            Message Broker (RabbitMQ)       │
                  │  PDF Worker │ AI OCR Worker │ Email Worker │
                  └─────────────────────┬─────────────────────┘
                                        │
                  ┌─────────────────────▼─────────────────────┐
                  │        MongoDB Replica Set (3 nodes)       │
                  │    Primary (Writes) + 2 Secondaries (Reads)│
                  └────────────────────────────────────────────┘
```

---

## 2. API Gateway & Load Balancing

**Problem**: A single backend server is a Single Point of Failure (SPOF). Under load, it becomes a bottleneck.

**Solution**: Route all traffic through **NGINX** before it reaches any backend server.

### Tools
| Tool | Role | License |
|---|---|---|
| **NGINX** | Reverse proxy, load balancer, SSL termination | BSD |
| **HAProxy** | Alternative, higher-performance TCP/HTTP LB | GPL |
| **Traefik** | Dynamic LB with auto-discovery for Docker/K8s | MIT |

### NGINX Load Balancing Config (Round Robin)

```nginx
upstream meditrack_backend {
    least_conn;                      # Least-connections algorithm
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.meditrack.app;

    # SSL (use Let's Encrypt / Certbot)
    ssl_certificate     /etc/letsencrypt/live/meditrack.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meditrack.app/privkey.pem;

    # Rate limiting: max 20 requests/second per IP
    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
    limit_req zone=api burst=50 nodelay;

    location /api/ {
        proxy_pass http://meditrack_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Why `least_conn` over Round Robin?
Analytics and PDF report generation are heavy operations. With round-robin, a server already working on a PDF would still receive new connections. `least_conn` routes new requests to the least busy server.

---

## 3. Caching Strategy (Redis)

**Problem**: The `/api/analytics/*` endpoints query MongoDB with complex aggregations on every request. For a health tracker, data from an hour ago doesn't change — recomputing it constantly wastes CPU and DB bandwidth.

**Solution**: Cache expensive query results in **Redis** (in-memory) with a short TTL.

### Tool: Redis (7.x)
- License: RSALv2 (open-source for self-hosting)
- Client: `ioredis` (for Node.js)

### Cache Pattern: Cache-Aside (Lazy Loading)

```javascript
// middleware/cache.js
import { redis } from '../config/redis.js';

export const cacheMiddleware = (keyFn, ttlSeconds = 300) => async (req, res, next) => {
  const key = keyFn(req);
  const cached = await redis.get(key);
  if (cached) {
    return res.json({ success: true, data: JSON.parse(cached), cached: true });
  }
  // Intercept res.json to cache the result
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body?.success && body?.data) {
      redis.setex(key, ttlSeconds, JSON.stringify(body.data));
    }
    return originalJson(body);
  };
  next();
};
```

```javascript
// Usage in analyticsRoutes.js
router.get('/vitals',   cacheMiddleware(req => `vitals:${req.user._id}:${req.query.days}`, 300), getVitalsTrends);
router.get('/wellness', cacheMiddleware(req => `wellness:${req.user._id}:${req.query.days}`, 300), getWellnessTrends);
```

### Cache Invalidation
When a user logs new vitals or medicines → **invalidate** their cached analytics:
```javascript
await redis.del(`vitals:${userId}:7`);
await redis.del(`vitals:${userId}:30`);
```

### Redis Use Cases Summary

| Use Case | Key Pattern | TTL |
|---|---|---|
| Vitals Trends | `vitals:{userId}:{days}` | 5 min |
| Wellness Trends | `wellness:{userId}:{days}` | 5 min |
| Analytics Dashboard | `dashboard:{userId}` | 2 min |
| Rate Limiting | `ratelimit:{ip}` | 1 min |
| JWT Blocklist (logout) | `blocklist:{jti}` | Until token expiry |

---

## 4. Asynchronous Processing & Message Queues

**Problem**: The PDF report endpoint takes 5–10 seconds (DB queries + AI call). Blocking the HTTP response for this long is terrible UX and exhausts the Node.js thread pool.

**Solution**: Accept the job, return `202 Accepted` immediately, process in a background worker.

### Tools
| Tool | Role | License |
|---|---|---|
| **RabbitMQ** | Message broker (AMQP) | MPL 2.0 |
| **BullMQ** | Job queue backed by Redis | MIT |
| **Kafka** | High-throughput event streaming | Apache 2.0 |

### Architecture: PDF Generation as a Queue Job

```
Client → POST /api/reports/request-pdf
  └─► API: { jobId: "abc123", status: "queued" }  (202 Accepted)
  └─► Publish job payload to RabbitMQ "pdf-reports" queue

RabbitMQ "pdf-reports" queue
  └─► PDF Worker consumes message
        ├── Query DB for health data
        ├── Run AI analysis (Groq)
        ├── Generate PDF with PDFKit
        ├── Upload PDF buffer to S3 / MinIO
        └── Emit WebSocket event to client: { jobId, status: "done", url: "..." }

Client (browser) receives WebSocket event → download link appears
```

### BullMQ Implementation (Redis-backed)

```javascript
// queues/reportQueue.js
import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { generatePDF } from '../services/pdfService.js';

export const reportQueue = new Queue('reports', { connection: redis });

// Producer — call from API route
export const enqueueReport = (userId, days) =>
  reportQueue.add('generate-pdf', { userId, days }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

// Worker — runs as a separate process
new Worker('reports', async (job) => {
  const { userId, days } = job.data;
  const pdfBuffer = await generatePDF(userId, days);
  // store pdfBuffer somewhere, notify via WebSocket
}, { connection: redis, concurrency: 5 });
```

### Event Queue: Medicine Reminders

```
Cron Job (node-cron) @ 07:00 every day
  └─► Query all users with active medicines for today
  └─► Publish one message per user to RabbitMQ "notifications" queue

Notification Worker
  └─► Consumes message
  └─► Sends email reminder via Nodemailer (Gmail App Password)
```

---

## 5. Database Design & Scaling

### MongoDB Replica Set (High Availability)

A replica set has one **primary** (handles writes) and multiple **secondaries** (replicate data, handle reads).

```
Primary ──writes──► Secondary 1 (read replica)
        ──replication──► Secondary 2 (arbiter / read replica)
```

If the primary goes down, an automatic **election** promotes a secondary — **zero downtime**.

```javascript
// In Node.js — route heavy READ queries to secondaries
await HealthLog.find({ userId }).readPref('secondaryPreferred');
```

### Indexing Strategy (Already Partially Implemented)

| Collection | Index | Justification |
|---|---|---|
| `HealthLog` | `{ userId: 1, date: -1 }` | Filter by user, sort by date |
| `MedicineLog` | `{ userId: 1, date: 1, status: 1 }` | Adherence aggregations |
| `Medicine` | `{ userId: 1, isActive: 1 }` | Active medicine list |
| `MedicalRecord` | `{ userId: 1, type: 1, recordDate: -1 }` | Filter by type and period |

### Connection Pooling

```javascript
mongoose.connect(MONGO_URI, {
  maxPoolSize: 20,         // max 20 simultaneous connections per Node process
  minPoolSize: 5,          // keep at least 5 warm connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

## 6. Containerization (Docker)

Docker ensures the app behaves identically across dev, staging, and production.

### `Dockerfile` — Backend

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
USER node
CMD ["node", "server.js"]
```

### `docker-compose.yml` — Full Stack Local Dev

```yaml
version: "3.9"

services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]
    depends_on: [backend1, backend2]

  backend1:
    build: ./backend
    environment: [NODE_ENV=production, PORT=5000]
    env_file: ./backend/.env
    depends_on: [mongo, redis]

  backend2:
    build: ./backend
    environment: [NODE_ENV=production, PORT=5000]
    env_file: ./backend/.env
    depends_on: [mongo, redis]

  frontend:
    build: ./frontend
    ports: ["3000:80"]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
    command: --replSet rs0

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]
    command: redis-server --appendonly yes

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

volumes:
  mongo_data:
  redis_data:
```

---

## 7. Orchestration (Kubernetes)

For **production at scale**, Kubernetes manages the lifecycle of containers automatically.

**Key Concepts Applied:**

| Concept | Application |
|---|---|
| **Deployment** | Defines 3 replicas of the backend pod |
| **HPA (Horizontal Pod Autoscaler)** | Scales backend from 3→10 pods when CPU > 70% |
| **Service** | Internal load balancing between pods |
| **ConfigMap / Secret** | Manages env vars (MONGO_URI, JWT_SECRET) securely |
| **Liveness Probe** | K8s restarts the pod if `/api/health` returns non-200 |
| **Readiness Probe** | K8s doesn't send traffic until the pod is ready |
| **PersistentVolumeClaim** | Persistent storage for MongoDB data |

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meditrack-backend
spec:
  replicas: 3
  selector:
    matchLabels: { app: meditrack-backend }
  template:
    metadata:
      labels: { app: meditrack-backend }
    spec:
      containers:
      - name: backend
        image: ghcr.io/youruser/meditrack-backend:latest
        ports: [{containerPort: 5000}]
        envFrom: [{secretRef: {name: meditrack-secrets}}]
        livenessProbe:
          httpGet: { path: /api/health, port: 5000 }
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet: { path: /api/health, port: 5000 }
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: meditrack-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: meditrack-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 70 }
```

---

## 8. Observability — Logging, Metrics, Tracing

**You cannot optimize what you cannot measure.**

### Stack: Prometheus + Grafana + Loki

```
Node.js App ──metrics──► Prometheus (scrapes /metrics every 15s)
                └──────► Grafana (visualizes dashboards)

Node.js App ──logs──────► Loki (log aggregation)
                └──────► Grafana (search & filter logs)
```

### Backend Metrics (prom-client)

```javascript
// middleware/metrics.js
import { Counter, Histogram, register } from 'prom-client';

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
});

// Expose /metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

### Structured Logging (Winston + Loki)

```javascript
// config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()  // structured JSON → parseable by Loki
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

---

## 9. Security Design

### Defence-in-Depth Layers

| Layer | Mechanism | Tool |
|---|---|---|
| Transport | TLS 1.3 only | NGINX + Let's Encrypt |
| Authentication | JWT (HS256, short-lived 15min + refresh tokens) | jsonwebtoken |
| Authorization | Route-level middleware, resource ownership checks | Custom middleware |
| Input Validation | Schema validation on all body inputs | express-validator |
| Rate Limiting | Per-IP, per-route, with Redis backing | express-rate-limit + Redis |
| File Upload Security | MIME type check, max size 5MB, memory-only (no disk write) | multer |
| Secrets Management | Never in code; use .env + Docker Secrets / K8s Secrets | dotenv |
| CORS | Allowlist of known frontend origins only | cors package |
| Headers | Security headers (HSTS, CSP, X-Frame-Options) | helmet |
| Dependency Audit | Scan for vulnerable packages before deploy | `npm audit` in CI |

---

## 10. CI/CD Pipeline

**Automate everything from code push to deployment.**

### Tool: GitHub Actions (Free, Open Source Workflows)

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd backend && npm ci && npm test
      - run: cd frontend && npm ci && npm run build

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm audit --audit-level=high

  build-and-push:
    needs: [test, security-audit]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & push Docker image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull ghcr.io/${{ github.repository }}/backend:latest
            docker compose -f /app/docker-compose.yml up -d --no-deps backend1 backend2
```

---

## 11. Deployment Strategy

### Environment Tiers

| Environment | Hosting | Purpose |
|---|---|---|
| Development | `localhost` (Docker Compose) | Local dev with hot-reload |
| Staging | Free-tier VPS (Railway / Render / Fly.io) | Pre-production testing |
| Production | Ubuntu VPS (DigitalOcean $12/mo) + Cloudflare | Live users |

### Zero-Downtime Deployment (Rolling Update)

When deploying a new backend version with NGINX upstream:
1. Bring up new backend instance (`backend_v2`)
2. Add to NGINX upstream
3. Remove old instance (`backend_v1`) from upstream
4. Drain old connections, stop old container

With Kubernetes `Deployment`, this is automatic via `RollingUpdate` strategy.

### Free + Open-Source Hosting Options

| Service | What's Free | Best For |
|---|---|---|
| **Railway** | $5/month credit | Full-stack (frontend + backend + DB) |
| **Render** | 750 hrs/month | Node.js services |
| **Fly.io** | 3 shared-CPU VMs | Containerized backends |
| **Cloudflare Pages** | Unlimited | React static frontend |
| **MongoDB Atlas** | 512MB free cluster | Cloud MongoDB |
| **Upstash** | 10,000 commands/day | Serverless Redis |

---

## 12. Interview Talking Points

> *"I built MediTrack as a full-stack health tracking platform and then deliberately applied scalability patterns I'd use in production. Rather than keeping it as a CRUD app, I redesigned it to handle real-world load:"*

- **"I identified our PDF generation and AI OCR as long-running tasks that would block Node.js's event loop. I architected a Message Queue pattern using BullMQ and Redis so the API returns 202 immediately and notifies the client via WebSocket when the job completes."**

- **"To prevent repetitive database aggregations from slowing down the analytics dashboard, I implemented a Cache-Aside pattern with Redis — keyed by userId and date range — with 5-minute TTL. This would reduce DB load by ~70% under real usage."**

- **"I containerized the entire stack using Docker with an NGINX reverse proxy load-balancing across three stateless backend instances. I wrote a Kubernetes Deployment with Horizontal Pod Autoscaler so the system automatically scales from 3 to 10 replicas when CPU crosses 70%."**

- **"I set up a Prometheus + Grafana observability stack with custom metrics — tracking request latency per route, error rates, and active user counts — and structured JSON logging via Winston feeding into Grafana Loki."**

---

## 13. Implementation Roadmap

The following is prioritized by resume impact:

| Priority | Task | Tool | Complexity |
|---|---|---|---|
| ⭐ High | Dockerize app + docker-compose | Docker | Easy |
| ⭐ High | NGINX config with 2 backend instances | NGINX | Easy |
| ⭐ High | Redis caching for analytics routes | Redis + ioredis | Medium |
| ⭐ High | CI/CD pipeline for auto-deploy | GitHub Actions | Medium |
| ☆ Medium | BullMQ background worker for PDF generation | BullMQ + Redis | Medium |
| ☆ Medium | Prometheus metrics endpoint + Grafana | prom-client | Medium |
| ☆ Medium | MongoDB Replica Set setup | MongoDB | Medium |
| ○ Stretch | JWT refresh token rotation + blocklist in Redis | ioredis | Medium |
| ○ Stretch | Kubernetes Deployment + HPA | K8s + minikube | Hard |
| ○ Stretch | Distributed tracing | Jaeger + OpenTelemetry | Hard |
