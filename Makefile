.PHONY: test
IMAGE_NAME=shortlet-assessment
CONTAINER_NAME=shortlet-assessment-container
DOCKER_COMPOSE_FILE=docker-compose.yml

install:
	docker compose run --rm app npm install
	@echo "Dependencies have been installed successfully 📦"

# Build the Docker image
build:
	docker compose -f $(DOCKER_COMPOSE_FILE) build
	@echo "Docker image has been built successfully 😊"

# Run the Docker container
run:
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d
	@echo "Local server is running on http://localhost:3010 🚀 🏃‍🔥"

# Stop and remove the Docker container
stop:
	docker compose -f $(DOCKER_COMPOSE_FILE) down
	@echo "Docker container has been stopped and removed successfully 🛑"

# Run tests in the Docker container
test:
	npm run test
	@echo "Tests have been run successfully 🧪"

test-coverage:
	npm run test:cov
	@echo "Tests have been run successfully 🧪"

# Build, run, and test in sequence
all: build run test
	@echo "Build, run, and test have been completed successfully 🎉"
