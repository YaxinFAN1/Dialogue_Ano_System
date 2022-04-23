"""语料库系统工具
"""

from os import listdir
from os.path import join, splitext
from typing import List

from lube.formatter import carbon as cb
from lube.model.corpus import Corpus, db


def list_all() -> List[str]:
    return [i for i, in db.session.query(Corpus._id).all()]


def imports(id: str, carbon: cb.Carbon):
    """导入语料

    Args:
        id (str): 语料库ID
        carbon (Carbon): CARBON语料对象
    """
    assert carbon is not None

    c = Corpus(id)
    c.content = carbon
    db.session.add(c)
    db.session.commit()
    return


def exports(id: str) -> cb.Carbon:
    """导出语料

    Args:
        id (str): 语料库ID

    Returns:
        cb.Carbon: CARBON语料对象
    """
    return Corpus.query.get(id).content


def import_from_folder(folderpath: str, id_prefix: str = "", formatter=cb):
    """导入文件夹

    用于flask shell交互界面。
    文件夹下必须只有语料文件一类文件。

    Args:
        folderpath (str): 文件夹路径
        id_prefix (str): ID前缀，可选
        formatter : 格式化器，默认为CARBON
    """
    filenames = listdir(folderpath)
    fail_counter = 0
    for i in filenames:
        try:
            imports(id_prefix + "$" + splitext(i)[0],
                    formatter.load(join(folderpath, i)))
            print("[DONE]", i)
        except BaseException as e:
            fail_counter += 1
            print("[FAIL]", i, ":", repr(e))

    total = len(filenames)
    print("total", total, "files:", total - fail_counter, "succeed,",
          fail_counter, "failed")
    return


def export_to_folder(folderpath: str, id_prefix: str = "", formatter=cb):
    """导出分组到文件夹

    用于flask shell交互界面。

    Args:
        folderpath (str): 文件夹路径
        id_prefix (str): ID前缀，可选
        formatter : 格式化器，默认为CARBON
    """
    filenames = list_all()
    counter = 0
    for i in filenames:
        if not i.startswith(id_prefix):
            continue
        counter += 1
        try:
            formatter.dump(exports(i), i)
            print("[DONE]", i)
        except BaseException as e:
            print("[FAIL]", i, ":", repr(e))

    print("exported", counter, "file(s)")
    return
