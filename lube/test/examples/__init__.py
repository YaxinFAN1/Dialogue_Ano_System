import os
from typing import List

examples_folder_path = os.path.split(__file__)[0]


def load_example(filename: str, subpath: str = "") -> str:
    """加载样例文件内容

    使用utf-8编码打开文件

    Args:
        filename (str): 文件名
        subpath (str): 子路径

    Returns:
        str: 文件内容
    """
    with open(os.path.join(examples_folder_path, subpath, filename),
              encoding="utf-8") as f:
        return f.read()


def list_files(subpath: str = "") -> List[str]:
    """列出文件夹下文件

    Args:
        subpath (str, 可选): 子路径，默认为样例文件夹根目录。

    Returns:
        List[str]: 目录下文件名列表（不包括文件夹）
    """
    return [
        i for i in os.listdir(os.path.join(examples_folder_path, subpath))
        if os.path.isfile(os.path.join(examples_folder_path, subpath, i))
    ]
