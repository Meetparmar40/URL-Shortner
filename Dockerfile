# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Build the Express backend
# ============================================================
FROM node:20-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ============================================================
# Stage 3: Production image
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies for the backend
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend code
COPY --from=backend-build /app/backend/dist ./backend/dist

# Copy built frontend into the location the backend expects
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Start the backend (serves both API and static frontend)
CMD ["node", "backend/dist/server.js"]
