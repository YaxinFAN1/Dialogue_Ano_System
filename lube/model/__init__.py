"""数据层模块

由于渣技术力的限制，数据层和视图层没做到很好的解耦

那些类的成员函数只能算是个 helper，真要是复杂的操作或者对效率有要求，视图层还得自己调用 db 对象

////: 可以加一层service
"""

from flask import Flask
from sqlalchemy.exc import SQLAlchemyError

from . import ac, base, corpus, task, relations
from .base import db


def init_app(app: Flask) -> None:
    base.init_app(app)
    return
