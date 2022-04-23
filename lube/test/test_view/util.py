"""客户端视角的 WEB API 包装

使用前必须给c对象赋值。
"""

from typing import List

from flask.testing import FlaskClient
from flask.wrappers import Response
from lube.japi import JSON_t

JapiResponse_t = List[JSON_t]
c: FlaskClient = None


class ResponseError(Exception):
    def __init__(self, r: Response) -> None:
        self.r = r
        return

    def __str__(self):
        return "{} - {}".format(self.r.status_code, self.r.get_data(True))


def japi_req(url: str, jarg: JSON_t = "") -> JapiResponse_t:
    """JSON API 请求
    """
    r = c.post(url, json=jarg)
    assert r.status_code == 200

    j = r.get_json()
    assert type(j) is list

    return j


def japi_breq(url: str, jarg: JSON_t = []) -> List[JapiResponse_t]:
    """JSON API 批处理请求
    """
    r = c.post(url + "?batch=1", json=jarg)
    assert r.status_code == 200

    j = r.get_json()
    assert type(j) is list

    return j
