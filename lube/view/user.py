"""用户管理模块
"""

from flask_login import current_user
from lube.model.ac import User
from lube.model.base import ModelError, db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .base import ArgumentError, JapiBlueprint, PrivChecker

# 模块用到的权限
pc_list_all_user = PrivChecker("UBQb1oTHsbwqEJCG", "用户管理——列出所有用户。")
pc_create_user = PrivChecker("W1SPvCCWvX9p9MFB", "用户管理——创建新用户。")
pc_delete_user = PrivChecker("B9bUFFb3VuslaBhI", "用户管理——删除用户。")
pc_read_other = PrivChecker("B9bUFFkkkVuslaBh", "用户管理——获取其它用户数据。")
pc_write_other = PrivChecker("B9bUkse3VuslaBhI", "用户管理——修改其它用户数据。")
pc_grant_priv = PrivChecker("QbByIZVjk6MPklMB", "用户管理——授予权限。")
pc_revoke_priv = PrivChecker("XQN8rVYaqlZUmD9s", "用户管理——收回权限。")

jbp = JapiBlueprint("user", __name__, url_prefix="/user")


def init_app(app):
    app.register_blueprint(jbp)
    return


@jbp.japi_route()
def list_all(jarg):
    """列出所有用户的 ID

    需要权限

    ## 请求

    无请求体

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串列表，为所有用户的 ID |
    """
    pc_list_all_user.check()
    return [i for i, in db.session.query(User._id).all()]


@jbp.japi_route()
def create(jarg):
    """创建新用户

    需要权限

    ## 请求

    ```json
    {
        "id": "zhangsan",   // 用户 ID
        "pw": "123456"      // 用户密码
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 已被占用 | 1 |  |
    """
    pc_create_user.check()

    try:
        id = jarg["id"]
        pw = jarg["pw"]
    except BaseException:
        raise ArgumentError()

    try:
        db.session.add(User(id, pw))
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 1
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def delete(jarg):
    """删除用户

    需要权限

    ## 请求

    发送一 json 字符串，为要删除用户的 ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    """
    pc_delete_user.check()

    if type(jarg) is not str:
        raise ArgumentError()

    u = User.query.get(jarg)
    if u is None:
        return None, 1

    try:
        db.session.delete(u)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def rename(jarg):
    """改变用户 ID

    用户可以修改自己 ID，修改其它用户的 ID 需要权限。

    ## 请求

    ```json
    {
        "old_id": "zhangsan",   // 原 ID
        "new_id": "lisi",       // 新 ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    | ID 已被占用 | 2 |  |
    """
    try:
        old_id = jarg["old_id"]
        new_id = jarg["new_id"]
    except BaseException:
        raise ArgumentError()

    if current_user.id != old_id:
        pc_write_other.check()

    u = User.query.get(old_id)
    if u is None:
        return None, 1

    try:
        u.id = new_id
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 2
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def set_pw(jarg):
    """设置用户密码

    用户可以修改自己密码，但修改他人密码需要权限。

    ## 请求

    ```json
    {
        "id": "zhangsan",   // 用户 ID
        "pw": "123456",     // 新密码
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 用户不存在 | 1 |  |
    """
    try:
        id = jarg["id"]
        pw = jarg["pw"]
    except BaseException:
        raise ArgumentError()

    if current_user.id != id:
        pc_write_other.check()

    u = User.query.get(id)
    if u is None:
        return None, 1

    try:
        u.pw = pw
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def list_priv(jarg):
    """列出用户所有的权限

    用户可以自由查询自己的权限，查询其他人需要权限

    ## 请求

    发送一字符串，为用户 ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串列表，元素为权限 ID |
    | ID 不存在 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    if current_user.id != jarg:
        pc_read_other.check()

    u: User = User.query.get(jarg)
    if u is None:
        return None, 1

    return u.list_priv()


@jbp.japi_route()
def grant_priv(jarg):
    """授予用户权限

    需要权限

    ## 请求

    ```json
    {
        "uid": "zhangsan",      // 用户ID
        "pid": "zbdkqezl..."    // 权限ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 用户 ID 不存在 | 1 |  |
    """
    pc_grant_priv.check()

    try:
        uid = jarg["uid"]
        pid = jarg["pid"]
    except BaseException:
        raise ArgumentError()

    # 编写参数检查代码是非常枯燥而且非常容易出错的，自动参数检查的需求非常迫切
    # 这些代码其实本质上不过是一种对数据格式的描述而已

    u = User.query.get(uid)
    if u is None:
        return None, 1

    try:
        u.grant_priv(pid)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def revoke_priv(jarg):
    """收回用户权限

    需要权限

    ## 请求

    ```json
    {
        "uid": "zhangsan",      // 用户ID
        "pid": "zbdkqezl..."    // 权限ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 用户ID不存在 | 1 |  |
    """
    pc_revoke_priv.check()

    try:
        uid = jarg["uid"]
        pid = jarg["pid"]
    except BaseException:
        raise ArgumentError()

    u = User.query.get(uid)
    if u is None:
        return None, 1

    try:
        u.revoke_priv(pid)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return
