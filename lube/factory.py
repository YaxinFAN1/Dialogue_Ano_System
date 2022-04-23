"""应用工厂
"""

from flask import Flask

from . import model, tool, view


def create_app(config: type) -> Flask:
    app = Flask(__name__, static_folder=None, static_url_path=None)
    app.config.from_object(config)

    model.init_app(app)
    view.init_app(app)
    tool.init_app(app)

    return app


def create_development_app() -> Flask:
    """创建开发用APP
    """

    from .configs import Development
    app = create_app(Development)
    return app


def create_unittest_app() -> Flask:
    """创建单元测试用APP

    每次都会重置数据库表结构，清空所有数据
    """
    from .configs import Unittest
    from .model.base import db

    app = create_app(Unittest)
    with app.app_context():
        db.drop_all()
        db.create_all()

    return app
