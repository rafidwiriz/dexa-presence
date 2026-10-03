# Root orchestration — dexa-presence

.PHONY: help install dev api web db lint test build clean

help:
	@echo "Targets:"
	@echo "  install  — install deps for api and web"
	@echo "  dev      — run api + web in dev mode (foreground)"
	@echo "  api      — run api in dev mode"
	@echo "  web      — run web in dev mode"
	@echo "  db       — start infra (postgres + rabbitmq) via docker compose"
	@echo "  lint     — lint api + web"
	@echo "  test     — run api tests"
	@echo "  build    — build api + web"
	@echo "  clean    — remove node_modules + build artifacts"
	@echo "  seed     — seed the database with sample data"

install:
	cd apps/api && npm install
	cd apps/web && npm install

dev:
	cd apps/api && npm run start:dev &
	cd apps/web && npm run dev

api:
	cd apps/api && npm run start:dev

web:
	cd apps/web && npm run dev

db:
	docker compose -f docker/compose.yml up -d

lint:
	cd apps/api && npm run lint
	cd apps/web && npm run lint

test:
	cd apps/api && npm test

build:
	cd apps/api && npm run build
	cd apps/web && npm run build

clean:
	rm -rf apps/api/node_modules apps/web/node_modules apps/api/dist apps/web/dist

seed:
	cd apps/api && node --env-file=.env scripts/seed.js
