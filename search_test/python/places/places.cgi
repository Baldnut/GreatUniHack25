#!/usr/bin/python3
from wsgiref.handlers import CGIHandler
from placespy import app

CGIHandler().run(app)