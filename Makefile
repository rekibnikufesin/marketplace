SHELL := /bin/bash
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

#-----------------------------------------------------------------------
# Local Rules
#-----------------------------------------------------------------------
build: build-npm

build-run: build-npm deploy-contract-local run-development

build-dockerimage:
	docker build -t marketplace:local .

build-npm:
	npm install

deploy-contract-local:
	truffle migrate --reset

run-local-development:
	cp -r build src/; \
	node_modules/.bin/react-scripts start; \

clean-docker:
	docker system prune -a

#-----------------------------------------------------------------------
# Docker Rules
#-----------------------------------------------------------------------

# Run an existing container w/ deployed contracts
run-docker: 
	docker run -p 3000:3000 marketplace:local

# Do it all with one command (Will replace existing deployed contracts)
run-new-marketplace: deploy-contract-local build-dockerimage run-docker

# Kill a running marketplace container
run-kill: docker kill $(docker ps | grep marketplace:local | awk '{ print $1 }')
