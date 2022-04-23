"""Carbon语料格式处理器
"""

from hashlib import new
import json
from typing import List, Optional

Carbon = dict


def load(filepath: str) -> Carbon:
    with open(filepath, encoding="utf-8") as f:
        a = json.load(f)
    return a


def dump(carbon: Carbon, filename: str) -> None:
    with open(filename + ".json", "w", encoding="utf-8") as f:
        json.dump(carbon, f, ensure_ascii=False)
    return


def strictly_check(carbon: Carbon) -> bool:
    """严格地检查对象

    Args:
        carbon (dict): 语料内容JSON对象

    Returns:
        bool: 合法返回True，否则返回False
    """
    def check_node(node: dict) -> None:
        """递归检查语料树的结点

        Args:
            node (dict): 结点JSON对象，包括Relation和Paragraph。
        """
        assert type(node) is dict
        children = node.get("children")
        children
        raise NotImplementedError()  # TODO

    try:
        assert type(carbon) is dict
        assert carbon.keys() == {"discourse", "roots"}

        discourse = carbon["discourse"]
        assert type(discourse) is dict
        assert discourse.keys() == {"topic", "dateline", "lead", "abstract"}

        assert type(discourse["topic"]) is str
        assert type(discourse["dateline"]) is str
        assert type(discourse["lead"]) is str
        assert type(discourse["abstract"]) is str

        roots = carbon("roots")
        assert type(roots) is list
        for node in roots:
            check_node(node)

    except AssertionError:
        return False

    return True


def mangling(carbon: Carbon) -> Optional[Carbon]:
    """粉碎重组语料内容，在此过程中会自动构建语用。

    Args:
        carbon (dict): 语料内容JSON对象

    Returns:
        Optional[Carbon]: 成功返回安全化后的新Carbon对象，注意使用的是软拷贝，失败返回None。
    """
    from .chtb import from_carbon, to_carbon
    from .funcgener import process_xml
    
    if 'type' in carbon:
        if carbon['type'] == 'dialogue':
            return mangling_dialogue(carbon)

    # 半成品情况，无法标注语用
    if len(carbon["roots"]) != 1:
        return mangling_old(carbon)

    # 成品情况，直接暴力转换把语用加上去
    xml_content = from_carbon(carbon)
    if xml_content is None:
        return None
    xml_content = process_xml(xml_content)
    return to_carbon(xml_content)


def mangling_old(carbon: Carbon) -> Optional[Carbon]:  # ! deprecated
    """粉碎语料内容字典然后重组，使之100%符合对象格式要求。

    这个函数适合进行向后兼容的安全入库格式化。

    Args:
        carbon (dict): 语料内容JSON对象

    Returns:
        Optional[Carbon]: 成功返回安全化后的新Carbon对象，注意使用的是软拷贝，失败返回None。
    """
    def rebuild_forests(roots: List[dict]) -> list:
        """重构森林

        返回重新构建的树根列表
        """
        assert type(roots) is list
        new_roots = []

        for root in roots:
            assert type(root) is dict
            new_root = {}

            children = root.get("children")
            if children is None:  # Paragraph结点
                for i in ["function", "topic", "content"]:
                    assert type(root[i]) is str
                    new_root[i] = root[i]

            else:  # Relation结点
                center = root["center"]
                assert type(center) is int
                new_root["center"] = center

                function = root["function"]
                assert type(function) is str
                new_root["function"] = function

                type_ = root["type"]
                assert type(type_) is str
                new_root["type"] = type_

                # 递归构建子树
                new_root["children"] = rebuild_forests(children)

            # 添加进根列表
            new_roots.append(new_root)

        return new_roots

    try:
        # 总检查
        assert type(carbon) is dict
        new_carbon = {}

        # 篇章头总检查
        discourse = carbon["discourse"]
        assert type(discourse) is dict
        new_discourse = {}
        new_carbon["discourse"] = new_discourse

        # 篇章头内容检查
        for i in ("topic", "dateline", "lead", "abstract"):
            assert type(discourse[i]) is str
            new_discourse[i] = discourse[i]

        # 篇章结构树
        new_carbon["roots"] = rebuild_forests(carbon["roots"])

    except (AssertionError, KeyError):
        return None

    return new_carbon


def mangling_dialogue(carbon: Carbon) -> Carbon:
    assert 'texts' in carbon
    assert 'speakers' in carbon
    assert type(carbon['texts']) is list
    assert type(carbon['speakers']) is list
    assert len(carbon['texts']) == len(carbon['speakers'])
    new_carbon = {
        'texts': carbon['texts'],
        'speakers': carbon['speakers'],
        'type': carbon['type'],
        }
    
    length = len(carbon['texts'])
    if 'address_to' in carbon:
        for e in carbon['address_to']:
            assert type(e) is list
            assert len(e) == 2
            for n in e:
                assert type(n) is int
                assert 0 <= n < length
        new_carbon['address_to'] = carbon['address_to']
    else:
        new_carbon['address_to'] = []
    
    if 'relations' in carbon:
        new_carbon['relations'] = carbon['relations'][:len(carbon['address_to'])]
        
    if 'sessions' in carbon:
        new_carbon['sessions'] = carbon['sessions'][:length]
    
    return new_carbon
