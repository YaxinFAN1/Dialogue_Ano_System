"""JSON API 框架
"""

from typing import Callable, Union

from flask import Blueprint, abort, jsonify, request

JSON_t = Union[None, bool, int, float, str, list, dict]


class JapiError(Exception):
    """一种 HTTP 状态码的替代机制
    """
    def __init__(self, *info, code=-1):
        super().__init__(code, *info)
        return


def japi_wrapper(f: Callable):
    """JSON API 包装器

    包装函数做了：
    1. 把请求体从 JSON 解析成 Python 对象；
    2. 把函数返回值编码成 JSON，并返回 200 状态码；
    3. 自动生成函数的批处理版本。

    待包装函数应当不抛出除 JapiError 以外的异常，否则在执行批处理时将使整个处理失败。

    参数：
        f (Callable): 待包装函数
            函数应当接受一个解析结果作为参数，返回一个可 JSON 化的对象和可选的异常号。
    """
    def wrapper():
        jarg = request.get_json(force=True, cache=False)

        if request.args.get("batch") != "1":
            try:
                jret = f(jarg)
                if type(jret) is tuple:
                    code = jret[1]
                    jret = jret[0]
                else:
                    code = 0

                return jsonify((code, jret))
            except JapiError as e:
                return jsonify(e.args)

        # 批处理版本
        if type(jarg) is not list:
            abort(400)
        jrets = []
        for i in jarg:
            try:
                jret = f(i)
                if type(jret) is tuple:
                    code = jret[1]
                    jret = jret[0]
                else:
                    code = 0
                jrets.append((code, jret))
            except JapiError as e:
                jrets.append(e.args)
        return jsonify(jrets)

    wrapper.__doc__ = f.__doc__
    return wrapper


class JapiBlueprint(Blueprint):
    def japi_route(self, rule=None, **options):
        """JSON API 路由包装器

        1. 强制重写 route 装饰器的 method 参数为 ["POST"]
        2. 如果没有指明路由规则，则使用函数名前加斜杠（"/"） 的默认路由规则
        """
        options["methods"] = ["POST"]

        def decorator(f):
            endpoint = options.pop("endpoint", f.__name__)
            wf = japi_wrapper(f)
            if rule is None:
                self.add_url_rule("/" + f.__name__, endpoint, wf, **options)
            else:
                self.add_url_rule(rule, endpoint, wf, **options)
            return f

        return decorator
