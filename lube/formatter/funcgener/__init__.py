"""语用生成模块

只是对蒋峰的代码进行了简单包装
"""

from .run import get_info


def process_xml(xml_content: str) -> str:
    return get_info(xml_content)
