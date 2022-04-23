"""任务模块
"""

from datetime import datetime
from typing import Optional, List

from lube.formatter import carbon
from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey,
                        ForeignKeyConstraint, String)

from .base import (FormatError, StateError, check_id_constraint, check_type,
                   db, simple_property)
from .corpus import Corpus


class RawCorpus(db.Model):
    """语料表
    """
    __tablename__ = "raw_corpus"

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


class TaskBundle(db.Model):
    """任务组表
    """
    __tablename__ = "task_bundle"

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
                       default=datetime.now)  # 创建日期
    _inspector = Column("inspector",
                        String(32),
                        ForeignKey("user.id",
                                   ondelete="SET NULL",
                                   onupdate="CASCADE"),
                        nullable=True,
                        default=None)  # 审核员

    def __init__(self, id: str) -> None:
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
    inspector = simple_property("_inspector")

    def list_files(self) -> List[str]:
        """查询任务包含的所有文件
        """
        return [
            i for i, in db.session.query(Inspection._file).filter(
                Inspection._task == self._id).all()
        ]

    def add_file(self, fid) -> "Inspection":
        """添加文件

        重点是自动创建关联的标注任务
        """
        s = db.session

        # 添加记录
        a = Inspection(_task=self._id, _file=fid)
        s.add(a)

        # 给每个关联的标注员都添加标注任务
        for i in s.query(AnnotatorAssign._annotator)  \
                  .filter(AnnotatorAssign._task == self._id)  \
                  .all():
            s.add(Annotation(_task=self._id, _file=fid, _annotator=i[0]))
        return a

    def remove_file(self, fid):
        """移除文件
        """
        db.session.delete(
            Inspection.query.get({
                "_task": self._id,
                "_file": fid,
            }))
        return

    # TODO 这个功能感觉用不到，先不实现了
    # def replace_file(self, old_fid, new_fid):
    #     """替换文件
    #
    #     保留之前的任务成果
    #     """
    #     return

    def list_annotators(self) -> List[str]:
        """查询任务分配的标注员
        """
        return [
            i[0] for i in db.session.query(AnnotatorAssign._annotator).filter(
                AnnotatorAssign._task == self._id).all()
        ]

    def add_annotator(self, uid):
        """添加标注员

        同时对任务组中的所有文件添加标注任务
        """
        s = db.session

        # 添加记录
        s.add(AnnotatorAssign(_task=self._id, _annotator=uid))

        # 给新标注员创建任务
        for i in s.query(Inspection._file)  \
                  .filter(Inspection._task == self._id)  \
                  .all():
            s.add(Annotation(_task=self._id, _file=i[0], _annotator=uid))
        return

    def remove_annotator(self, uid):
        """移除文件
        """
        db.session.delete(
            AnnotatorAssign.query.get({
                "_task": self._id,
                "_annotator": uid,
            }))
        return

    def replace_annotator(self, old_uid, new_uid):
        """替换标注员

        会保留之前的任务结果
        """
        old = AnnotatorAssign.query.get({
            "_task": self._id,
            "_annotator": old_uid,
        })
        old._annotator = new_uid
        # 设置了外键约束，Annotation 表会自动更新
        return


#
# 理想情况下，下面这三张表都不应该被视图层直接调用，因为他们都不是实体表。
# 如果直接调用的话，就显得耦合过紧：视图层还要厘清表的结构。
# 所以我在 TaskBundle 里面加了几个辅助函数，尽量避免直接操作关系表。
#


class Inspection(db.Model):
    """审核进度表

    同时也是文件和任务的关联表
    """
    __tablename__ = "inspection"

    _task = Column("task",
                   String(32),
                   ForeignKey("task_bundle.id",
                              ondelete="CASCADE",
                              onupdate="CASCADE"),
                   primary_key=True)  # 任务
    _file = Column("file",
                   String(32),
                   ForeignKey("raw_corpus.id",
                              ondelete="CASCADE",
                              onupdate="CASCADE"),
                   primary_key=True)  # 文件
    _result = Column("result", JSON(), nullable=True, default=None)  # 审核结果
    _target = Column("target", String(32), nullable=True, default=None)
    _completed = Column("completed", Boolean(), nullable=False,
                        default=False)  # 完成标志

    def __check_uncompleted(self) -> None:
        """检查任务处于未完成状态
        """
        if self._completed:
            raise StateError("不能修改已完成的任务")
        return

    @property
    def result(self) -> Optional[dict]:
        """读取任务结果，没有内容会返回None。
        """
        return self._result

    @result.setter
    def result(self, value: Optional[dict]) -> None:
        """更新任务成果

        不能变更已完成任务的任务内容。

        这个函数是宽容的。
        """
        # 前置状态检查
        if self._completed:
            raise StateError("不能修改已完成任务的结果")

        # 清空内容的情况处理
        if value is None:
            self._result = None
            return

        # 类型检查
        check_type(value, dict)
        temp = carbon.mangling(value)
        if temp is None:
            raise FormatError("对象不符合 CARBON 格式要求")

        self._result = temp
        return

    @property
    def target(self) -> str:
        return self._target

    @target.setter
    def target(self, value) -> None:
        check_id_constraint(value)
        self._target = value
        return

    @property
    def completed(self) -> bool:
        """获取任务完成标志
        """
        return self._completed

    def commit(self) -> None:
        """提交任务

        自动将结果入库
        """
        # 前置状态检查
        self.__check_uncompleted()
        self._completed = True

        c = Corpus(self._target)
        c.content = self._result
        c.creator = TaskBundle.query.get(self._task).inspector

        db.session.add(c)
        return


class AnnotatorAssign(db.Model):
    """标注员分配表
    """
    __tablename__ = "annotator_assign"

    _task = Column("task",
                   String(32),
                   ForeignKey("task_bundle.id",
                              ondelete="CASCADE",
                              onupdate="CASCADE"),
                   primary_key=True)
    _annotator = Column(
        "annotator",
        String(32),
        ForeignKey(
            "user.id",
            ondelete="CASCADE",  # HACK 如果用户被删除，任务也跟着一起被删除了
            onupdate="CASCADE"),
        primary_key=True,
    )


class Annotation(db.Model):
    """标注进度表
    """

    __tablename__ = "annotation"

    _task = Column("task", String(32), primary_key=True)  # 大任务ID
    _file = Column("file", String(32), primary_key=True)  # 文件ID
    _annotator = Column("annotator", String(32), primary_key=True)  # 标注员ID
    _result = Column("result", JSON(), nullable=True, default=None)  # 任务结果
    _completed = Column("completed", Boolean(), nullable=False,
                        default=False)  # 完成标志

    __table_args__ = (
        ForeignKeyConstraint(
            ["task", "file"],
            ["inspection.task", "inspection.file"],
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["task", "annotator"],
            ["annotator_assign.task", "annotator_assign.annotator"],
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
    )  # ? 在数据库层面实现约束：标注进度表主键 = 审核进度表主键 ⋈ 标注员分配表主键

    def __check_uncompleted(self) -> None:
        """检查任务处于未完成状态
        """
        if Inspection.query.get(
            {"_task": self._task, "_file": self._file}
        )._completed:
            raise StateError("不能修改已完成的任务")
        return

    @property
    def result(self) -> Optional[dict]:
        """读取任务结果，没有内容会返回None。
        """
        return self._result

    @result.setter
    def result(self, value: Optional[dict]) -> None:
        """更新任务成果

        不能变更已完成任务的任务内容。

        这个函数是宽容的。
        """
        # 前置状态检查
        self.__check_uncompleted()

        # 清空内容的情况处理
        if value is None:
            self._result = None
            return

        # 类型检查
        assert isinstance(value, dict)
        temp = carbon.mangling(value)
        if temp is None:
            raise FormatError("carbon format check failed")

        self._result = temp
        return

    @property
    def completed(self) -> bool:
        """获取任务完成标志
        """
        return self._completed

    def commit(self):
        self.__check_uncompleted()
        self._completed = True
        return
