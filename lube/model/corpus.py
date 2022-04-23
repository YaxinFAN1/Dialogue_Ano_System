"""语料库模块
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from lube.formatter import carbon

from .base import (FormatError, check_id_constraint, check_type, db,
                   simple_property)


class Corpus(db.Model):
    """语料表
    """
    __tablename__ = "corpus"

    _id = Column("id", String(32), primary_key=True)
    _creator = Column("creator",
                      String(32),
                      ForeignKey("user.id",
                                 ondelete="SET NULL",
                                 onupdate="CASCADE"),
                      nullable=True,
                      default=None)  # 创建者
    _datetime = Column("datetime",
                       DateTime(),
                       nullable=False,
                       default=datetime.now)  # 创建日期，默认值千万不能写成now()
    _content = Column("content", JSON(), nullable=True, default=None)  # 语料内容

    def __init__(self, id: str) -> None:
        """
        Args:
            id (str): 语料ID
        """
        self.id = id
        return

    @property
    def id(self) -> str:
        """获取对象的数据库ID
        """
        return self._id

    @id.setter
    def id(self, value: str) -> None:
        """修改对象的数据库ID
        """
        check_id_constraint(value)
        self._id = value
        return

    creator = simple_property("_creator")
    datetime = simple_property("_datetime")

    @property
    def content(self) -> dict:
        """获取语料内容
        """
        return self._content

    @content.setter
    def content(self, value: Optional[dict]) -> None:
        """写入语料内容

        这个函数是宽容的，根据向后兼容原则，只要能转换的结构都接受，多余信息会被忽略且过滤掉。
        """
        # 格式检查
        if value is not None:
            check_type(value, dict)

            value = carbon.mangling(value)
            if value is None:
                raise FormatError("对象不符合 CARBON 语料结构定义")

        self._content = value
        return
