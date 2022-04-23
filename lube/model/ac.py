"""访问控制模块
"""

from typing import List

from flask_login import UserMixin
from sqlalchemy import Column, ForeignKey, String
from werkzeug.security import check_password_hash, generate_password_hash

from .base import check_id_constraint, check_type, db, simple_property


class User(db.Model, UserMixin):
    """用户表

    缩写说明：
        pw - password，密码
    """
    __tablename__ = "user"

    _id = Column("id", String(32), primary_key=True)
    _pw_hash = Column("pw_hash", String(128), nullable=False)

    # HACK init参数只包含unnullable且没有默认值的属性
    # 或把默认值写入__init__？
    def __init__(self, id: str, pw: str) -> None:
        """
        Args:
            id (str): 新用户ID
            pw (str): 用户密码
        """
        self.id = id
        self.pw = pw
        return

    @property
    def id(self) -> str:
        """获取对象的数据库ID
        """
        return self._id

    @id.setter
    def id(self, id: str) -> None:
        """修改对象的数据库ID
        """
        check_id_constraint(id)
        self._id = id
        return

    pw = property()

    @pw.setter
    def pw(self, pw: str) -> None:
        """设置密码
        """
        check_type(pw, str)
        self._pw_hash = generate_password_hash(pw)
        return

    def pw_validate(self, pw: str) -> bool:
        """验证密码（安全）

        Args:
            pw (str): 密码（明文）

        Returns:
            bool: 验证通过返回True，否则返回False
        """
        return check_password_hash(self._pw_hash, pw)

    def list_priv(self) -> List[str]:
        """列出用户所有权限
        """
        return [
            i[0] for i in db.session.query(UserPriv._pid).filter(
                UserPriv._uid == self._id).all()
        ]

    def grant_priv(self, pid):
        """授予权限
        """
        db.session.add(UserPriv(_pid=pid, _uid=self._id))
        return

    def revoke_priv(self, pid: str):
        """收回权限
        """
        db.session.query(UserPriv).filter(
            UserPriv._pid == pid,
            UserPriv._uid == self._id,
        ).delete()
        return


class Priv(db.Model):
    """权限表

    缩写说明：
        desc - description，说明
    """
    __tablename__ = "priv"

    _id = Column("id", String(16), primary_key=True)
    _desc = Column("desc", String(64), nullable=False)  # 权限描述

    def __init__(self, id: str, desc: str):
        """
        Args:
            id (str): 权限ID
            desc (str): 权限描述
        """
        self.id = id
        self.desc = desc
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

    desc = simple_property("_desc")


class UserPriv(db.Model):
    """用户权限表
    """
    __tablename__ = "user_priv"

    _uid = Column("uid",
                  String(32),
                  ForeignKey(
                      User._id,
                      onupdate="CASCADE",
                      ondelete="CASCADE",
                  ),
                  primary_key=True)
    _pid = Column("pid",
                  String(16),
                  ForeignKey(
                      Priv._id,
                      onupdate="CASCADE",
                      ondelete="CASCADE",
                  ),
                  primary_key=True)

    # TODO 还可以添加creator、datetime等信息
