#!/bin/sh
node server --configFile configs/django/degenerate5000/1.4.0rankings.json > out/django/degenerate5000/1.4.0rankings.txt
node server --configFile configs/django/degenerate5000/1.4.20bugfixed.json > out/django/degenerate5000/1.4.20bugfixed.txt
node server --configFile configs/django/degenerate5000/1.5.0rankings.json > out/django/degenerate5000/1.5.0rankings.txt
node server --configFile configs/django/degenerate5000/1.5.12bugfixed.json > out/django/degenerate5000/1.5.12bugfixed.txt
node server --configFile configs/django/degenerate5000/1.6.0rankings.json > out/django/degenerate5000/1.6.0rankings.txt
node server --configFile configs/django/degenerate5000/1.6.11bugfixed.json > out/django/degenerate5000/1.6.11bugfixed.txt
node server --configFile configs/django/degenerate5000/1.7.0rankings.json > out/django/degenerate5000/1.7.0rankings.txt
node server --configFile configs/django/degenerate5000/1.7.7bugfixed.json > out/django/degenerate5000/1.7.7bugfixed.txt
