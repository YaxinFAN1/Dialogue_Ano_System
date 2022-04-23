from .base import bp
from . import ac
from . import corpus


def init_app(app):
    app.register_blueprint(bp)
    return
