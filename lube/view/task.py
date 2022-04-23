"""任务系统模块
"""

from flask_login import current_user
from lube.model.base import ModelError
from lube.model.task import (Annotation, AnnotatorAssign, Inspection,
                             TaskBundle, RawCorpus, db)
from lube.model.corpus import Corpus
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .base import ArgumentError, JapiBlueprint, PrivChecker

# 模块用到的权限
pc_list_all = PrivChecker("OG8xriafxRivmTwP", "任务系统——列出所有任务")
pc_read_others = PrivChecker("kNKLgjX5mRAtsF1k", "任务系统——读取其它用户数据")
pc_create = PrivChecker("MeHtX5ziqXYFvBZe", "任务系统——创建任务")
pc_delete = PrivChecker("MeHtX5ziqXYFqsZe", "任务系统——删除任务")
pc_modify = PrivChecker("MekxX5ziqXYFvBZe", "任务系统——修改任务")

jbp = JapiBlueprint("task", __name__, url_prefix="/task")


def init_app(app) -> None:
    app.register_blueprint(jbp)
    return


##
# 基本CURD
#


@jbp.japi_route()
def list_all(jarg):
    """列出所有任务

    需要权限

    ## 请求

    无请求体

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | JSON字符串列表，为所有任务的ID |
    """
    pc_list_all.check()
    return [i for i, in db.session.query(TaskBundle._id).all()]


@jbp.japi_route()
def create(jarg):
    """创建新任务

    需要权限

    ## 请求

    ```json
    {
        "id": "task-0001",  // 任务 ID
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
    except BaseException:
        raise ArgumentError()

    try:
        a = TaskBundle(id)
        a.creator = current_user.get_id()
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
    """删除任务

    需要权限

    ## 请求

    发送一JSON字符串，为要删除任务的ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    """
    pc_delete.check()

    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        return None, 1

    try:
        files = [r._file for r in db.session.query(Annotation._file).filter(Annotation._task == jarg).all()]
        db.session.query(RawCorpus).filter(RawCorpus._id.in_(files)).delete()
        db.session.query(Corpus).filter(Corpus._id.in_(files)).delete()
        db.session.delete(a)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def rename(jarg):
    """修改任务 ID

    需要权限

    ## 请求

    ```json
    {
        "old_id": "task-0001",  // 原任务 ID
        "new_id": "task-0002"   // 新任务 ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID 不存在 | 1 |  |
    | ID 已被占用 | 2 |  |
    """
    pc_modify.check()

    try:
        old_id = jarg["old_id"]
        new_id = jarg["new_id"]
    except BaseException:
        raise ArgumentError()

    u = TaskBundle.query.get(old_id)
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
def get_prop(jarg):
    """获取任务只读属性

    需要权限

    ## 请求

    发送一 JSON 字符串，为要查询的任务 ID

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
    pc_list_all.check()

    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        return None, 1

    return {"creator": a.creator, "datetime": a.datetime}


##
# 审核员管理
#


@jbp.japi_route()
def get_inspector(jarg):
    """查询任务的审核员

    如果用户既不是任务的审核员也不是任务的标注员，则需要权限。

    ## 请求

    发送一字符串，为带查询任务的ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串，为审核员用户ID |
    | 任务ID不存在 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        pc_read_others.check()
        return None, 1

    uid = current_user.get_id()
    if not a.inspector == uid:  # 是审核员，通过检查
        b = AnnotatorAssign.query.get({"_task": jarg, "_annotator": uid})
        if b is None:  # 是标注员，通过检查
            pc_read_others.check()  # 啥都不是，但有权限，通过检查

    return a.inspector


@jbp.japi_route()
def set_inspector(jarg):
    """设置任务的审核员

    需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001", // 任务 ID
        "uid": "zhangsan"   // 用户 ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务 ID 不存在 | 1 |  |
    | 用户 ID 不存在或重复 | 2 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        uid = jarg["uid"]
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        a.inspector = uid
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 2
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


##
# 文件管理
#


@jbp.japi_route()
def list_files(jarg):
    """列出任务包含的所有文件

    如果用户不是任务的审核员或标注员，则需要权限

    ## 请求

    发送一 JSON 字符串，作为待查询的任务ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 生语料ID组成的字符串列表 |
    | 任务ID不存在 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        pc_read_others.check()
        return None, 1

    uid = current_user.get_id()
    if not a.inspector == uid:  # 是审核员，通过检查
        b = AnnotatorAssign.query.get({"_task": jarg, "_annotator": uid})
        if b is None:  # 是标注员，通过检查
            pc_read_others.check()  # 啥都不是，但有权限，通过检查

    return a.list_files()


@jbp.japi_route()
def add_file(jarg):
    """向任务添加文件

    需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",         // 任务ID
        "fid": "raw_corpus-0001",   // 生语料ID
        "target": "abcde"           // （可选）目标入库ID，默认为生语料ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务ID不存在 | 1 |  |
    | 生语料ID重复或不存在 | 2 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        target = jarg.get("target")
        if target is None:
            target = fid
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        b = a.add_file(fid)
        b.target = target
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 2
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


@jbp.japi_route()
def remove_file(jarg):
    """从任务移除文件

    需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",     // 任务ID
        "fid": "raw-corpus-1"   // 生语料ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务ID不存在 | 1 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        a.remove_file(fid)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


@jbp.japi_route()
def get_file_target(jarg):
    """获取文件完成时的目标入库ID

    如果用户不是任务的审核员或标注员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-0001"   // 生语料ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 字符串或null |
    | 任务或生语料ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
    except BaseException:
        raise ArgumentError()

    a = Inspection.query.get({"_task": tid, "_file": fid})
    if a is None:
        pc_read_others.check()
        return None, 1

    uid = current_user.get_id()
    if not TaskBundle.query.get(tid).inspector == uid:  # 是审核员，通过检查
        b = AnnotatorAssign.query.get({"_task": tid, "_annotator": uid})
        if b is None:  # 是标注员，通过检查
            pc_read_others.check()  # 啥都不是，但有权限，通过检查

    return a.target


@jbp.japi_route()
def set_file_target(jarg):
    """设置文件审核完成时的目标入库ID

    需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-0001",  // 生语料ID
        "target: "chtb-01"   // 目标入库ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务或生语料ID不存在 | 1 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        target = jarg["target"]
    except BaseException:
        raise ArgumentError()

    a = Inspection.query.get({"_task": tid, "_file": fid})
    if a is None:
        return None, 1

    try:
        a.target = target
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


##
# 标注员管理
#


@jbp.japi_route()
def list_annotators(jarg):
    """列出任务所有的标注员

    如果用户不是任务的审核员或标注员，则需要权限

    ## 请求

    发送一 JSON 字符串，作为待查询的任务ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 标注员ID组成的字符串列表 |
    | 任务ID不存在 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        pc_read_others.check()
        return None, 1

    uid = current_user.get_id()
    if not a.inspector == uid:  # 是审核员，通过检查
        b = AnnotatorAssign.query.get({"_task": jarg, "_annotator": uid})
        if b is None:  # 是标注员，通过检查
            pc_read_others.check()  # 啥都不是，但有权限，通过检查

    return a.list_annotators()


@jbp.japi_route()
def add_annotator(jarg):
    """给任务添加标注员

    ## 请求

    ```json
    {
        "tid": "task-0001", // 任务ID
        "uid": "zhangsan",  // 用户ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务ID不存在 | 1 |  |
    | 用户ID重复或不存在 | 2 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        uid = jarg["uid"]
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        a.add_annotator(uid)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, 2
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


@jbp.japi_route()
def remove_annotator(jarg):
    """移除标注员

    这将会同时删除他的所有任务成果

    ## 请求

    ```json
    {
        "tid": "task-0001", // 任务ID
        "uid": "zhangsan",  // 标注员ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务ID不存在 | 1 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        uid = jarg["uid"]
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        a.remove_annotator(uid)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


@jbp.japi_route()
def replace_annotator(jarg):
    """替换标注员

    之前标注员的任务成果将会被保留

    ## 请求

    ```json
    {
        "tid": "task-0001",     // 任务ID
        "old_uid": "zhangsan",  // 原标注员ID
        "new_uid": "lisi",      // 新标注员ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | 任务ID不存在 | 1 |  |
    """
    pc_modify.check()

    try:
        tid = jarg["tid"]
        old_uid = jarg["old_uid"]
        new_uid = jarg["new_uid"]
    except BaseException:
        raise ArgumentError()

    a = TaskBundle.query.get(tid)
    if a is None:
        return None, 1

    try:
        a.replace_annotator(old_uid, new_uid)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


##
# 审核操作
#


@jbp.japi_route()
def list_by_inspector(jarg):
    """列出用户担任审核员的任务

    普通用户只能查询自己的任务列表，查询其它用户的任务列表需要权限。

    ## 请求

    发送一 JSON 字符串，为要查询的用户 ID。

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 相关任务ID组成的字符串列表 |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    if current_user.id != jarg:
        pc_read_others.check()

    return [
        i for i, in db.session.query(TaskBundle._id).filter(
            TaskBundle._inspector == jarg).all()
    ]


@jbp.japi_route()
def get_inspection_progress(jarg):
    """获取审核进度

    如果用户不是任务的审核员，则需要权限

    ## 请求

    发送一字符串，为要查询的任务ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 对象，见下方格式定义 |
    | 任务ID不存在 | 1 |  |

    ### 格式定义

    ```json
    {
        "file-1": true,     // 键为文件ID
        "file-2": false,    // 值为false表示未提交
        "file-10": true     // 值为true表示已提交
    }
    ```
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        pc_read_others.check()
        return None, 1

    uid = current_user.get_id()
    if uid != a.inspector:
        pc_read_others.check()

    return {
        k: v
        for k, v in db.session.query(Inspection._file, Inspection._completed).
        filter(Inspection._task == jarg).all()
    }


@jbp.japi_route()
def get_inspection_result(jarg):
    """获取审核结果

    如果用户不是任务的审核员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001"    // 生语料ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | CARBON格式对象或null |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
    except BaseException:
        raise ArgumentError()

    a = Inspection.query.get({"_task": tid, "_file": fid})
    if a is None:
        # ? 我觉得可能没必要加这么强的权限控制，这么做就像在玩具车上加安全带
        # ? 贴近用户使用场景，按需设计软件才是正确方法，目前用户显然只在乎功能有没有而已
        pc_read_others.check()
        return None, 1

    b = TaskBundle.query.get(tid)
    uid = current_user.get_id()
    if uid != b.inspector:
        pc_read_others.check()

    return a.result


@jbp.japi_route()
def set_inspection_result(jarg):
    """设置审核结果

    如果用户不是任务的审核员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001",   // 生语料ID
        "result": {}         // 任务结果，CARBON格式对象，可以设为null以清空结果
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        result = jarg["result"]
    except BaseException:
        raise ArgumentError()

    a = Inspection.query.get({"_task": tid, "_file": fid})
    if a is None:
        pc_modify.check()
        return None, 1

    b = TaskBundle.query.get(tid)
    uid = current_user.get_id()
    if uid != b.inspector:
        pc_modify.check()

    try:
        a.result = result
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def commit_inspection(jarg):
    """提交审核结果

    如果用户不是任务的审核员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001"    // 生语料ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
    except BaseException:
        raise ArgumentError()

    a = Inspection.query.get({"_task": tid, "_file": fid})
    if a is None:
        pc_modify.check()
        return None, 1

    b = TaskBundle.query.get(tid)
    uid = current_user.get_id()
    if uid != b.inspector:
        pc_read_others.check()

    try:
        a.commit()
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()

    return


##
# 标注操作
#


@jbp.japi_route()
def list_by_annotator(jarg):
    """列出用户担任标注员的任务

    普通用户只能查询自己的任务列表，查询其它用户的任务列表需要权限。

    ## 请求

    发送一 JSON 字符串，为要查询的用户 ID。

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 相关任务的ID组成的字符串列表 |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    if current_user.id != jarg:
        pc_read_others.check()

    return [
        i for i, in db.session.query(AnnotatorAssign._task).filter(
            AnnotatorAssign._annotator == jarg).all()
    ]


@jbp.japi_route()
def get_annotation_progress(jarg):
    """获取标注进度

    如果用户不是任务的审核员或标注员，则需要权限

    标注员只能获取到自己的进度

    ## 请求

    发送一字符串，为要查询的任务ID

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | 对象，见下方格式定义 |
    | 任务ID不存在 | 1 |  |

    ### 格式定义

    ```json
    {
        "zhangsan": {
            "file-1": true,     // 键为文件ID
            "file-2": false,    // 值为false表示未提交
            "file-10: true      // 值为true表示已提交
        },
        "lisi:": {
            "file-1": true,
            "file-2": false,
            "file-10: true
        },
    }
    ```
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = TaskBundle.query.get(jarg)
    if a is None:
        pc_read_others.check()
        return None, 1

    ans = {}
    for uid, fid, flag in db.session.query(
            Annotation._annotator, Annotation._file,
            Annotation._completed).filter(Annotation._task == jarg).all():
        t = ans.setdefault(uid, {})
        t[fid] = flag

    uid = current_user.get_id()
    if uid == a.inspector or pc_read_others.passed():
        return ans
    elif uid in ans:
        return {uid: ans[uid]}
    else:
        pc_read_others.abort()
    return


@jbp.japi_route()
def get_annotation_result(jarg):
    """获取标注结果

    如果用户不是任务的审核员或标注员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001",   // 生语料ID
        "uid": "zhangsan"    // 标注员ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | CARBON格式对象或null |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        uid = jarg["uid"]
    except BaseException:
        raise ArgumentError()

    a = Annotation.query.get({"_task": tid, "_file": fid, "_annotator": uid})
    if a is None:
        pc_read_others.check()
        return None, 1

    cid = current_user.get_id()
    if uid != cid:
        b = TaskBundle.query.get(tid)
        if cid != b.inspector:
            pc_read_others.check()

    return a.result


@jbp.japi_route()
def set_annotation_result(jarg):
    """设置标注结果

    如果用户不是任务的标注员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001",   // 生语料ID
        "uid": "zhangsan"    // 标注员ID
        "result": {}         // CARBON格式对象，可以设为null以清空结果
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        uid = jarg["uid"]
        result = jarg["result"]
    except BaseException:
        raise ArgumentError()

    a = Annotation.query.get({"_task": tid, "_file": fid, "_annotator": uid})
    if a is None:
        pc_modify.check()
        return None, 1

    cid = current_user.get_id()
    if cid != uid:
        pc_modify.check()

    try:
        a.result = result
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return


@jbp.japi_route()
def commit_annotation(jarg):
    """提交标注结果

    如果用户不是任务的标注员，则需要权限

    ## 请求

    ```json
    {
        "tid": "task-0001",  // 任务ID
        "fid": "file-001"    // 生语料ID
        "uid": "zhangsan"    // 标注员ID
    }
    ```

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 |  |
    | ID不存在 | 1 |  |
    """
    try:
        tid = jarg["tid"]
        fid = jarg["fid"]
        uid = jarg["uid"]
    except BaseException:
        raise ArgumentError()

    a = Annotation.query.get({"_task": tid, "_file": fid, "_annotator": uid})
    if a is None:
        pc_modify.check()
        return None, 1

    cid = current_user.get_id()
    if cid != uid:
        pc_modify.check()

    try:
        a.commit()
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise ModelError()
    return
