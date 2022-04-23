"""公共基础模块

全局变量、异常类、工具函数等
"""

import re
from typing import List

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from ..japi import JapiError

db = SQLAlchemy()  # 全局数据库对象
id_pattern = re.compile(r"^(?:\w|[.$-]){0,31}\w$")  # ID模式


class ModelError(JapiError):
    """所有数据层异常的基类

    除了独立函数之外，所有的错误都应该转化为异常的形式表现出来，不应再用函数返回值的形式。

    异常号：-20
    """
    def __init__(self, *info, code=-20):
        super().__init__(*info, code=code)
        return


class DataTypeError(ModelError):
    """数据类型错误

    异常号：-21
    """
    def __init__(self, *info, code=-21):
        super().__init__(*info, code=code)
        return


class FormatError(ModelError):
    """数据格式错误

    异常号：-22
    """
    def __init__(self, *info, code=-22):
        super().__init__(*info, code=code)
        return


class StateError(ModelError):
    """状态错误

    异常号：-23
    """
    def __init__(self, *info, code=-23):
        super().__init__(*info, code=code)
        return


def check_type(obj, t) -> None:
    """检查对象是否是指定类型，不满足则抛出异常
    """
    if type(obj) is not t:
        raise DataTypeError(f"对象不是类型 '{t}'")
    return


def check_id_constraint(id: str) -> None:
    """检查标识符是否满足约束，不满足则抛出异常
    """
    # 检查类型
    check_type(id, str)

    # 检查格式
    if id_pattern.match(id) is None:
        raise FormatError(f"'{id}' 不满足标识符（ID）约束")
    return


def simple_property(colname: str) -> property:
    """构建简单属性

    数据层ORM每列都使用属性包装起来，避免直接访问，以便实现后端的约束检查。
    但有些列没有约束检查，他们的获取器和写入器都没有约束检查，就用这个函数一键构建。

    参数：
        colname (str): 列名
    """
    def fget(self):
        return getattr(self, colname)

    def fset(self, value):
        setattr(self, colname, value)
        return

    return property(fget, fset)


def init_app(app: Flask) -> None:
    db.init_app(app)
    return
