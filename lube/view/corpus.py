"""语料库模块
"""

from lube.model.base import ModelError
from lube.model.corpus import Corpus, db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from flask_login import current_user

from .base import ArgumentError, JapiBlueprint, PrivChecker

# 模块用到的权限
pc_list_all = PrivChecker("ZKVRlgfdpAZ2Mpn4", "语料库管理——检索所有语料。")
pc_create = PrivChecker("bbebdBag0gFjS9zv", "语料库管理——创建新语料。")
pc_delete = PrivChecker("bFGvGdoBxgCi9qTI", "语料库管理——删除语料。")
pc_rename = PrivChecker("d3YNThU2UlyIbNTc", "语料库管理——重命名语料。")
pc_read = PrivChecker("oOfUyJvoV0v6ZnAW", "语料库管理——读取语料数据。")
pc_write = PrivChecker("oHSwzmthd7jiSfqq", "语料库管理——修改语料数据。")

jbp = JapiBlueprint("corpus", __name__, url_prefix="/corpus")


@jbp.japi_route()
def list_all(jarg):
    """列出所有语料ID

    需要权限

    ## 请求

    无请求体

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串列表，为所有语料的 ID |
    """
    pc_list_all.check()
    return [i for i, in db.session.query(Corpus._id).all()]


@jbp.japi_route()
def create(jarg):
    """创建语料

    需要权限

    ## 请求

    ```json
    {
        "id": "corpus_0001",    // 新语料 ID
        "content": {}           // （可选）语料内容，CARBON格式对象
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 已被占用 | 1 |  |
    """
    pc_create.check()

    try:
        id = jarg["id"]
        content = jarg.get("content")
    except BaseException:
        raise ArgumentError()

    try:
        a = Corpus(id)
        a.creator = current_user.get_id()
        a.content = content
        db.session.add(a)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 1
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError

    return


@jbp.japi_route()
def delete(jarg):
    """删除语料

    需要权限

    ## 请求

    发送一 json 字符串，为要删除语料的ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    """
    pc_delete.check()

    if type(jarg) is not str:
        raise ArgumentError()

    u = Corpus.query.get(jarg)
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
    """改变语料ID

    ## 请求

    ```json
    {
        "old_id": "corpus_0001",    // 原ID
        "new_id": "corpus_1000",    // 新ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 原ID不存在 | 1 |  |
    | 新ID已被占用 | 2 |  |
    """
    pc_rename.check()

    try:
        old_id = jarg["old_id"]
        new_id = jarg["new_id"]
    except BaseException:
        raise ArgumentError()

    a = Corpus.query.get(old_id)
    if a is None:
        return None, 1

    try:
        a.id = new_id
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 2
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


@jbp.japi_route()
def get_prop(jarg):
    """获取语料的只读属性

    需要权限

    ## 请求

    发送一 JSON 字符串，为要查询的语料 ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | JSON对象，见下方格式定义 |
    | ID 不存在 | 1 |  |

    ### 格式定义

    ```json
    {
        "creator":"gyh2020", // 创建人的用户ID
        "datetime":"2020-08-04 18:53:48" // 创建时间
    }
    ```
    """
    pc_read.check()

    if type(jarg) is not str:
        raise ArgumentError()

    a = Corpus.query.get(jarg)
    if a is None:
        return None, 1

    return {"creator": a.creator, "datetime": a.datetime}


@jbp.japi_route()
def get_content(jarg):
    """读取语料内容

    ## 请求

    发送一 JSON 字符串，为要查询的语料 ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | CARBON 语料对象 |
    | ID 不存在 | 1 |  |
    """
    pc_read.check()

    if type(jarg) is not str:
        raise ArgumentError()

    a = Corpus.query.get(jarg)
    if a is None:
        return None, 1

    return a.content


@jbp.japi_route()
def set_content(jarg):
    """修改语料内容

    ## 请求

    ```json
    {
        "id": "corpus_0001",    // 语料 ID
        "content": {},          // 语料内容，CARBON格式对象
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    """
    pc_write.check()

    try:
        id = jarg["id"]
        content = jarg["content"]
    except BaseException:
        raise ArgumentError()

    a = Corpus.query.get(id)
    if a is None:
        return None, 1

    try:
        a.content = content
        db.session.commit()
    except SQLAlchemyError():
        db.session.rollback()
        raise ModelError()

    return


# 初始化函数
def init_app(app) -> None:
    app.register_blueprint(jbp)
    return
