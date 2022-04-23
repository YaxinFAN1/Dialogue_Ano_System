def index():
    return "<h1>LUBE API SYSTEM IS RUNNING</h1>"


def create_production_app():
    from .configs import Production
    from .factory import create_app

    app = create_app(Production)
    app.add_url_rule("/", view_func=index)
    return app


def create_development_app():
    from .configs import Development
    from .factory import create_app

    app = create_app(Development)
    app.add_url_rule("/", view_func=index)
    return app
