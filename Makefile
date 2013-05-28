# Warning: I hate make.
WHISKEYDIR=./node_modules/whiskey/bin/
WHISKEY=${WHISKEYDIR}whiskey --scope-leaks
UNIT_TESTS ?= ${wildcard tests/*.js}
FILES := ${wildcard lib/*.js}
NODELINTDIR=./node_modules/nodelint/
NODELINT=${NODELINTDIR}nodelint 

test:	unittest

lint:
	${NODELINT} ${FILES} --config jslint.conf
unittest: 
	${WHISKEY} --tests "${UNIT_TESTS}"
