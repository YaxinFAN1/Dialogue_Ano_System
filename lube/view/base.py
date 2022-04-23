"""视图层基础模块

通用异常、访问控制、鉴权系统
"""

from typing import Dict

from flask import Flask
from flask_login import LoginManager, current_user, login_user, logout_user
from lube.model.ac import Priv, User, UserPriv, db

from ..japi import JapiBlueprint, JapiError


#
# 通用异常类
#
class ViewError(JapiError):
    """所有视图层异常的基类

    异常号：-10
    """
    def __init__(self, *info, code=-10):
        super().__init__(*info, code=code)
        return


class NotLoggedInError(ViewError):
    """未登录错误

    异常号：-11
    """
    def __init__(self, *info, code=-11):
        super().__init__(*info, code=code)
        return


class NoPrivilegeError(ViewError):
    """无权限错误

    异常号：-12
    """
    def __init__(self, *info, code=-12):
        super().__init__(*info, code=code)
        return


class ArgumentError(ViewError):
    """请求参数错误

    异常号：-13
    """
    def __init__(self, *info, code=-13):
        super().__init__(*info, code=code)
        return


#
# 权限系统
#
lm = LoginManager()


@lm.user_loader
def load_user(uid):
    return User.query.get(uid)


def check_logged_in() -> None:
    """检查是否已登录

    JAPI 异常号为 -1
    """
    if current_user.get_id() is None:
        raise NotLoggedInError()
    return


class PrivChecker:
    """基于 JAPI 的权限检查器
    """

    all: Dict[str, "PrivChecker"] = {}

    @classmethod
    def create_all(cls) -> None:
        """创建所有权限

        用于初始化
        """
        for p in cls.all.values():
            p.ensure()
        db.session.commit()
        return

    @classmethod
    def all_created(cls) -> bool:
        """检查是否所有权限都被创建了

        返回：
            bool: 是返回True，否返回False
        """
        descs = {i.desc for i in cls.all}
        return descs.issubset({i for i, in db.session.query(Priv._desc).all()})

    def __init__(self, id: str, desc: str) -> None:
        """
        Args:
            id (str): 权限表中的ID
            desc (str): 权限描述
        """
        self.id = id
        self.desc = desc
        assert PrivChecker.all.setdefault(id, self) is self
        return

    def ensure(self) -> None:
        """确保权限存在

        若不存在，则创建权限。
        """
        p: Priv = Priv.query.get(self.id)

        # 没有就创建权限
        if p is None:
            db.session.add(Priv(self.id, self.desc))
            return

        # 否则更新描述信息
        if p._desc != self.desc:
            p._desc = self.desc
        return

    def check(self) -> None:
        """检查当前用户是否拥有权限，会先检查是否登录

        JAPI 异常号为 -2，第二项为缺失权限号
        """
        # 首先检查是否登录
        check_logged_in()

        user = current_user._get_current_object()
        if UserPriv.query.get({"_uid": user.id, "_pid": self.id}) is None:
            raise NoPrivilegeError(self.id)
        return

    def abort(self) -> None:
        """抛出权限不足异常
        """
        raise NoPrivilegeError(self.id)
        return

    def passed(self) -> bool:
        """检查当前用户是否能鉴权通过

        不会抛出异常
        """
        try:
            self.check()
        except ViewError:
            return False
        return True


#
# auth 视图
#
jbp = JapiBlueprint("ac", __name__, url_prefix="/auth")


@jbp.japi_route()
def whoami(jarg):
    """获得当前登录的账户ID

    ## 请求

    无请求体

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串，用户的 ID |
    | 未登录 | 1 |  |
    """
    uid = current_user.get_id()
    if uid is None:
        return None, 1
    return uid


@jbp.japi_route()
def login(jarg):
    """登录账户

    ## 请求

    ```json
    {
        "id": "zhangsan",   // 账户ID
        "pw": "123456"      // 账户密码
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 账号或密码无效 | 1 |  |
    | 已登录 | 2 |  |
    """
    if current_user.get_id() is not None:
        return None, 2  # 已登录

    user = User.query.get(jarg["id"])  # ! 不管他类型对不对，面向内部应用不考虑安全性
    if not user or not user.pw_validate(jarg["pw"]):
        return None, 1  # 账号或密码无效

    login_user(user)
    return


@jbp.japi_route()
def logout(jarg):
    """登出用户

    ## 请求

    无请求体

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 未登录 | 1 |  |
    """
    if current_user.get_id() is None:
        return None, 1  # 未登录

    logout_user()
    return


@jbp.japi_route()
def get_privlist(jarg):
    """获取权限表

    ## 请求

    无请求体

    ## 响应

    成功返回对象列表，每个元素的格式如下：

    ```json
    {
        "id": "cIavI6qTVV0LWkS2",   // 权限 ID
        "desc": "some descriptions" // 权限描述
    }
    ```

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 对象列表 |
    """
    check_logged_in()
    return [{"id": i.id, "desc": i.desc} for i in PrivChecker.all.values()]
    # HACK 是返回PrivChecker.all还是Priv表？


# 初始化函数
def init_app(app: Flask) -> None:
    lm.init_app(app)
    app.register_blueprint(jbp)
    with app.app_context():
        db.create_all()
        PrivChecker.create_all()
    return
