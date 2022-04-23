@echo off
set FLASK_APP=factory:create_development_app()
flask %*
