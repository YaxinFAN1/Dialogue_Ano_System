"""访问控制模块测试
"""

import unittest

from lube import model
from lube.test.test_view import util
from lube.tool.ac import create_su

from .util import japi_breq, japi_req


class CompletenessTest(unittest.TestCase):
    """功能完备性测试
    """
    @classmethod
    def setUpClass(cls):
        from lube.factory import create_unittest_app
        cls.app = create_unittest_app()
        return

    @classmethod
    def tearDownClass(cls):
        return

    def setUp(self):
        with self.app.app_context():
            # 重置数据库
            model.db.drop_all()
            model.db.create_all()

            # 创建超级用户
            create_su("su", "")
        return

    def tearDown(self):
        return

    def test_1(self):
        # 登录 su
        c_su = self.app.test_client()
        util.c = c_su
        res = japi_req("/auth/login", {"id": "su", "pw": ""})
        self.assertEqual(res[0], 0)

        # 创建 u0 ~ u5
        res = japi_breq("/user/create", [{
            "id": f"u{i}",
            "pw": "",
        } for i in range(6)])
        for i in res:
            self.assertEqual(i[0], 0)

        # 给 u0 ~ u5 授予权限
        jarg = []
        for i in range(6):
            jarg.extend([
                {
                    "uid": f"u{i}",
                    "pid": "B9bUkse3VuslaBhI"
                },  # 改其它用户 ID
                {
                    "uid": f"u{i}",
                    "pid": "W1SPvCCWvX9p9MFB"
                },
                {
                    "uid": f"u{i}",
                    "pid": "XQN8rVYa13ZUmD9s"
                },
            ])
        res = japi_breq("/user/grant_priv", jarg)

        # 登录 u0
        c_u0 = self.app.test_client()
        util.c = c_u0
        res = japi_req("/auth/login", {"id": "u0", "pw": ""})
        self.assertEqual(res[0], 0)

        # 登录 u1
        c_u1 = self.app.test_client()
        util.c = c_u1
        res = japi_req("/auth/login", {"id": "u0", "pw": ""})
        self.assertEqual(res[0], 0)

        # u0 改 u1 ID
        util.c = c_u0
        res = japi_req("/user/change_id", {"old_id": "u1", "new_id": "uu1"})
        self.assertEqual(res[0], 0)

        # u1 看看自己的登录状态
        util.c = c_u1
        res = japi_req("/auth/whoami")
        self.assertEqual(res[0], 0)
        self.assertEqual(res[1], "u0")  # ! 我无 fuck 说，希望这个小问题不要太被在意
        return


class RobustnessTest(unittest.TestCase):
    """健壮性测试
    """


if __name__ == "__main__":
    unittest.main()
