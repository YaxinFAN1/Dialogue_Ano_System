"""xin_cmn格式化库
"""

from typing import Optional
from xml.etree import ElementTree as ET


def from_carbon(carbon: dict) -> Optional[str]:
    raise NotImplementedError()
    return


def to_carbon(text: str) -> Optional[dict]:
    try:
        doc = ET.fromstring(text)

        discourse = {}
        discourse["topic"] = doc.find("./BODY/HEADLINE/S").text
        discourse["dateline"] = doc.find("./HEADER/DATE").text
        discourse["lead"] = ""
        discourse["abstract"] = ""

        roots = []
        for p in doc.findall("./BODY/TEXT/P"):
            node = {}
            node["content"] = "".join([i.text for i in p.findall("./S")])
            node["function"] = ""
            node["topic"] = ""
            roots.append(node)

        return {"discourse": discourse, "roots": roots}

    except BaseException:
        return None
