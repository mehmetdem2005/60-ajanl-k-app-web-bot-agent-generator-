# Makefile
# Planner Agent Ecosystem - Operational Management

.PHONY: help install build start stop down restart logs status health test clean migrate deploy prune

DOCKER := docker compose
NPM := npm
FILE := docker-compose.yml

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	$(NPM) ci

build: ## Build TypeScript packages and Docker images
	$(NPM) run build
	$(DOCKER) -f $(FILE) build --no-cache

start: ## Start all services
	$(DOCKER) -f $(FILE) up -d --remove-orphans

stop: ## Stop all services
	$(DOCKER) -f $(FILE) stop

down: ## Stop and remove containers
	$(DOCKER) -f $(FILE) down

restart: ## Restart all services
	$(DOCKER) -f $(FILE) restart

logs: ## Tail all logs
	$(DOCKER) -f $(FILE) logs -f --tail=200

status: ## Show container status
	$(DOCKER) -f $(FILE) ps

health: ## Verify registry and agent health
	@echo "Querying Registry Service..."
	@curl -sf http://localhost:3001/api/v1/agents | jq '.agents[] | {agent_id, status}' || echo "Registry unreachable. Run make start first."

test: ## Run workspace tests
	$(NPM) run test

clean: ## Remove containers, volumes and build artifacts
	$(DOCKER) -f $(FILE) down -v --remove-orphans
	rm -rf packages/*/dist
	rm -rf node_modules

migrate: ## Run migration and DB check
	$(NPM) run migrate

deploy: ## Production deploy sequence
	$(MAKE) test
	$(MAKE) build
	$(MAKE) start
	$(MAKE) health

prune: ## Remove unused Docker data
	docker system prune -af --volumes
