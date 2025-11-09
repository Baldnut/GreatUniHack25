#!/usr/bin/python3
from wsgiref.handlers import CGIHandler
from distancespy import app

CGIHandler().run(app)