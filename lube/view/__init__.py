"""视图层
"""

from flask import Flask

from . import base, corpus, formatter, raw_corpus, task, user, relations


def init_app(app: Flask) -> None:
    base.init_app(app)
    user.init_app(app)
    corpus.init_app(app)
    formatter.init_app(app)
    raw_corpus.init_app(app)
    task.init_app(app)
    relations.init_app(app)
    return
