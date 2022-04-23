"""CHTB格式化库
"""

from typing import Optional
from xml.etree import ElementTree as ET

from .carbon import Carbon


def from_carbon(content: dict, force=False) -> Optional[str]:
    """语料文件内容JSON格式转XML格式

    Carbon格式是CHTB格式的超集，所以会有无法等价转换的情况。
    使用 force=True 强制转换并返回，该情况下不会返回None。
    注意，这个函数会修改传入的content！

    Args:
        content (dict): 语料内容JSON对象
        force (bool): 强行转换开关

    Returns:
        Optional[str]: 转换成功则返回XML格式表示的语料内容，转换失败返回None。
    """
    try:
        doc = ET.Element("DOC")

        # 构建DISCOURSE
        discourse = content["discourse"]
        doc_discourse = ET.SubElement(
            doc, "DISCOURSE", {
                "Dateline": discourse["dateline"],
                "DiscourseTopic": discourse["topic"],
            })
        ET.SubElement(doc_discourse, "LEAD").text = discourse["lead"]
        ET.SubElement(doc_discourse, "ABSTRACT").text = discourse["abstract"]

        # 先搭RELATION和TEXT框架
        doc_relation = ET.SubElement(doc, "RELATION")
        doc_text = ET.SubElement(doc, "TEXT")

        r_id_counter = 1  # Relation ID计数器
        p_id_counter = 1  # Paragraph ID计数器

        def compile_subtree(root: dict):
            """编译子树到XML元素树

            Args:
                root (dict): 子树根
            """
            nonlocal r_id_counter
            nonlocal p_id_counter

            children = root.get("children")

            if children is None:  # Paragraph结点
                # 计算叶节点的ID（无所谓自顶自底）
                root["id"] = p_id_counter
                p_id_counter += 1

                # 叶节点左右切分点都为自己的ID
                root["sep_left"] = root["id"]
                root["sep_right"] = root["id"]

                # 写入XML
                ET.SubElement(
                    doc_text, "P", {
                        "Function": root["function"],
                        "ID": str(root["id"]),
                        "ParagraphTopic": root["topic"]
                    }).text = root["content"]

            else:  # Relation结点
                # 自顶向下计算ID
                root["id"] = r_id_counter
                r_id_counter += 1

                sep_leftest = 255  # HACK 最大容忍255段（255个<p>节点）
                sep_rightest = 0
                for subroot in children:
                    # 需要自顶向下计算的属性
                    subroot["parent_id"] = root["id"]  # ParentId
                    subroot["layer"] = root["layer"] + 1  # layer
                    compile_subtree(subroot)  # 递归入口

                    # 记录最左分隔点
                    if subroot["sep_left"] < sep_leftest:
                        sep_leftest = subroot["sep_left"]

                    # 记录最右分割点
                    if subroot["sep_right"] > sep_rightest:
                        sep_rightest = subroot["sep_right"]

                root["sep_left"] = sep_leftest  # 最左分割点就是自己的左分割点
                root["sep_right"] = sep_rightest  # 最右分割点就是自己的右分割点

                # 写入XML
                if len(children) == 0:
                    if force:
                        return  # 强制状态下直接返回，不写入XML文件
                        # 在最好的情况下（大概是段数不超255）不会影响XML文件的完整性
                    else:
                        raise AssertionError(
                            "hanging relation node")  # 悬挂关系节点，不应该出现
                else:
                    props = {}

                    # Center属性
                    prop_center = root["center"]
                    if prop_center == 0:
                        props["Center"] = "1"
                    elif prop_center == 1:
                        props["Center"] = "2"
                    elif prop_center == -1:
                        props["Center"] = "3"
                    else:
                        if force:
                            props["Center"] = "3"  # 强制转换则默认置为3
                        else:
                            raise AssertionError(
                                "center index not in { -1, 0, 1 }")  # 中心下标无法表示

                    props["ChildList"] = "|".join(
                        [str(i["id"]) for i in children if "children" in i])
                    props["Function"] = root["function"]
                    props["ID"] = str(root["id"])
                    props["Layer"] = str(root["layer"])

                    # ParagraphPosition属性（切分方式）
                    sep_pos = [
                        str(i["sep_left"]) + "..." + str(i["sep_right"])
                        for i in children
                    ]
                    props["ParagraphPosition"] = "|".join(sep_pos)

                    props["ParentId"] = str(root["parent_id"])

                    # RelationType和StructureType属性
                    prop_type = root["type"]
                    props["RelationType"] = prop_type
                    if prop_type == "Joint":
                        props["StructureType"] = "Parallel segmentation"
                    else:
                        props["StructureType"] = "Hierarchical segmentation"

                    ET.SubElement(doc_relation, "R", props)
            return

        roots = content["roots"]
        for root in roots:
            root["parent_id"] = -1  # 顶层根的父结点ID为-1
            root["layer"] = 1
            compile_subtree(root)
        doc_text[:] = sorted(doc_text, key=lambda x: int(x.attrib["ID"]))

        # TODO XML 缩进功能要升级 Python 3.9
        return ET.tostring(doc, "utf-8", xml_declaration=True).decode()

    except BaseException:
        return None


def to_carbon(xml_content: str) -> Optional[dict]:
    """语料文件内容XML格式转JSON格式

    这个函数并不对语料文件进行严格的一致性检查

    这个算法仅用到了CHTB文件格式的以下数据：
        DOC/DISCOURSE 的全部结点的全部属性、文本
        所有 DOC/RELATION/R 结点的 Center、Function、ID、Layer
            、ParagraphPosition、RelationType 属性
        所有 DOC/TEXT/P 结点的 Function、ID、ParagraphTopic 属性和结点的文本

    Args:
        xml_content (str): XML格式的语料文件内容

    Returns:
        Optional[dict]: 解析成功返回Carbon字典，失败返回None。
    """
    try:
        j = {}
        doc = ET.fromstring(xml_content)

        # 读取篇章整体信息
        doc_discourse = doc.find("./DISCOURSE")
        j_discourse = {}
        j_discourse["topic"] = doc_discourse.attrib["DiscourseTopic"]
        j_discourse["dateline"] = doc_discourse.attrib["Dateline"]
        j_discourse["lead"] = "".join(
            [i.text for i in doc_discourse.findall("./LEAD")]).strip()
        j_discourse["abstract"] = "".join(
            [i.text for i in doc_discourse.findall("./ABSTRACT")]).strip()
        j["discourse"] = j_discourse

        # 生成叶节点
        roots = []  # 根列表
        doc_text = doc.find("./TEXT")
        for pe in doc_text.findall("./P"):
            p_id = int(pe.attrib["ID"])
            roots.append((p_id, p_id, {
                "function": pe.attrib["Function"],
                "topic": pe.attrib["ParagraphTopic"],
                "content": pe.text
            }))
        roots.sort(key=lambda x: x[0])

        # 收集Relations信息
        class R:
            def __init__(self, re: ET.Element):
                self.layer = int(re.attrib["Layer"])
                self.seppos = [
                    (int(i.split("...")[0]), int(i.split("...")[1]))
                    for i in re.attrib["ParagraphPosition"].split("|")
                ]
                self.seppos.sort(key=lambda x: x[0])

                self.function = re.attrib["Function"]
                self.type = re.attrib["RelationType"]
                center = re.attrib["Center"]
                if center == "3":
                    self.center = -1
                else:
                    self.center = int(center) - 1

        rs = []
        doc_relation = doc.find("./RELATION")
        for re in doc_relation.findall("./R"):
            rs.append(R(re))

        # 自底向上建树
        rs.sort(key=lambda x: x.layer, reverse=True)
        for r in rs:
            node = {
                "children": [],
                "center": r.center,
                "function": r.function,
                "type": r.type
            }
            node_children = node["children"]

            # 要被这个高层结点合并的结点列表
            subs = []
            for seppos in r.seppos:
                root = None

                # 在roots里查找分割对应的结点
                for i in range(len(roots)):
                    a = roots[i]
                    if a[0] == seppos[0]:  # 找到起始点
                        if a[1] == seppos[1]:  # 匹配结束点
                            root = a
                            subs.append(i)
                        break

                if root is None:
                    # raise RuntimeError("inconsistent corpus file")
                    return None
                node_children.append(root[2])  # 找到了，把那个结点添加进自己的子结点列表

            # 合并低层结点并替换roots中区间
            if subs == []:
                continue

            interval = (roots[subs[0]][0], roots[subs[-1]][1], node)
            subs.reverse()
            for i in subs:
                roots.pop(i)
            roots.insert(subs[-1], interval)

        # 提取语料树
        j["roots"] = [i[2] for i in roots]

        return j

    except BaseException:
        return None


def load(filepath: str) -> Carbon:
    with open(filepath, encoding="utf-8") as f:
        a = f.read()
    b = to_carbon(a)
    return b


def dump(carbon: Carbon, filename: str) -> None:
    with open(filename + ".xml", "w", encoding="utf-8") as f:
        f.write(from_carbon(carbon))
    return
