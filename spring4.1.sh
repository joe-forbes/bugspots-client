#!/bin/sh
node server --configFile spring/4.1/configs/4.1.6trac5k.json > spring/4.1/4.1.6trac5k.txt
node server --configFile spring/4.1/configs/4.1.6msg5k.json > spring/4.1/4.1.6msg5k.txt
node server --configFile spring/4.1/configs/4.1.0trac5k.json > spring/4.1/4.1.0trac5k.txt
node server --configFile spring/4.1/configs/4.1.0msg5k.json > spring/4.1/4.1.0msg5k.txt
node server --configFile spring/4.1/configs/4.1.0degen5k.json > spring/4.1/4.1.0degen5k.txt