"""格式化器模块
"""

from lube.formatter import chtb, xin_cmn

from .base import ArgumentError, JapiBlueprint, PrivChecker

# 模块用到的权限
pc_use_formatter = PrivChecker("Hw213MpvhthM18HW", "使用格式化器的权限。")

jbp = JapiBlueprint("formatter", __name__, url_prefix="/formatter")


def init_app(app) -> None:
    app.register_blueprint(jbp)
    return


@jbp.before_request
def check_priv():
    pc_use_formatter.check()
    return


@jbp.japi_route()
def carbon2chtb(jarg):
    """CARBON 转 CHTB 类型

    需要权限

    ## 请求

    发送 CARBON 格式语料对象。

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | JSON字符串，内容为CHTB格式语料 |
    | 转换失败 | 1 |  |
    """
    if type(jarg) is not dict:
        raise ArgumentError()

    a = chtb.from_carbon(jarg)
    if a is None:
        return None, 1
    return a


@jbp.japi_route()
def chtb2carbon(jarg):
    """CHTB 转 CARBON 类型

    ## 请求

    JSON字符串，内容为CHTB格式语料

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | JSON对象，CARBON语料格式 |
    | 失败 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = chtb.to_carbon(jarg)
    if a is None:
        return None, 1
    return a


@jbp.japi_route()
def xin_cmn2carbon(jarg):
    """xin_cmn 转 CARBON 类型

    ## 请求

    JSON字符串，内容为CHTB格式语料

    ## 响应

    | 情况 | 异常号 | JSON |
    | --- | --- | --- |
    | 成功 | 0 | JSON对象，CARBON语料格式 |
    | 失败 | 1 |  |
    """
    if type(jarg) is not str:
        raise ArgumentError()

    a = xin_cmn.to_carbon(jarg)
    if a is None:
        return None, 1
    return a
