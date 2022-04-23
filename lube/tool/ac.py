"""访问控制系统工具
"""

import click
from lube.model.ac import User, UserPriv, db
from lube.view.base import PrivChecker

from .base import bp


@bp.cli.command("create_su")
@click.argument("id")
@click.argument("pw")
def create_su(id: str, pw: str) -> None:
    """创建超级用户

    Args:
        id (str): 超级用户ID
        pw (str): 超级用户密码
    """
    # 创建用户
    db.session.add(User(id, pw))
    db.session.commit()

    # 创建所有权限
    PrivChecker.create_all()

    # 给予所有权限
    for i in PrivChecker.all.values():
        db.session.add(UserPriv(_uid=id, _pid=i.id))

    db.session.commit()
    return
