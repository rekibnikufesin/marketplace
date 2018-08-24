SHELL := /bin/bash
ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

#-----------------------------------------------------------------------
# Do stuff
#-----------------------------------------------------------------------
build: build-npm

build-run: build-npm deploy-contract-local run-development

#-----------------------------------------------------------------------
# Rules
#-----------------------------------------------------------------------

build-npm:
	npm install

deploy-contract-local:
	truffle migrate --reset

run-development:
	cp -r build src/; \
	node_modules/.bin/react-scripts start; \