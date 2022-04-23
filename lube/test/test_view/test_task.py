"""访问控制模块测试
"""

import json
import unittest

from lube import model
from lube.test.test_view import util
from lube.tool.ac import create_su

from ..examples import list_files, load_example
from .util import japi_breq, japi_req


class CompletenessTest(unittest.TestCase):
    """功能完备性测试
    """
    @classmethod
    def setUpClass(cls):
        from lube.factory import create_unittest_app
        cls.app = create_unittest_app()

        with cls.app.app_context():
            # 重置数据库
            model.db.drop_all()
            model.db.create_all()

            # 创建超级用户
            create_su("su", "")
            create_su("a", "")
            create_su("b", "")
            create_su("c", "")

        return

    @classmethod
    def tearDownClass(cls):
        return

    def setUp(self):
        return

    def tearDown(self):
        return

    def test_1(self):
        # 登录 su
        c_su = self.app.test_client()
        util.c = c_su
        res = japi_req("/auth/login", {"id": "su", "pw": ""})
        self.assertEqual(res[0], 0)

        # 添加生语料
        res = japi_breq(
            "/raw-corpus/create",
            [{
                "id": i,
                "content": json.loads(load_example(i, "chtb/json"))
            } for i in list_files("chtb/json")],
        )
        self.assertTrue(all([i == 0 for i, in res]))

        # 创建3个任务
        res = japi_breq("/task/create", [
            {
                "id": "1"
            },
            {
                "id": "2"
            },
            {
                "id": "3"
            },
        ])
        self.assertTrue(all([i == 0 for i, in res]))

        # 给任务1添加所有生语料
        _, files = japi_req("/raw-corpus/list_all")
        res = japi_breq(
            "/task/add_file",
            [{
                "tid": "1",
                "fid": i
            } for i in files],
        )
        self.assertTrue(all([i == 0 for i, in res]))

        # 把a设为任务1的审核员，b、c设为任务的标注员
        japi_req("/task/set_inspector", {"tid": "1", "uid": "a"})
        res = japi_breq(
            "/task/add_annotator",
            [{
                "tid": "1",
                "uid": "b"
            }, {
                "tid": "1",
                "uid": "c"
            }],
        )
        self.assertTrue(all([i == 0 for i, in res]))

        # b批量完成标注任务
        c_b = self.app.test_client()
        util.c = c_b
        res = japi_req("/auth/login", {"id": "b", "pw": ""})
        self.assertEqual(res[0], 0)
        res = japi_breq(
            "/task/commit_annotation",
            [{
                "tid": "1",
                "fid": i,
                "uid": "b"
            } for i in files],
        )
        self.assertTrue(all([i == 0 for i, in res]))

        # a批量完成任务
        c_a = self.app.test_client()
        util.c = c_a
        res = japi_req("/auth/login", {"id": "a", "pw": ""})
        self.assertEqual(res[0], 0)
        res = japi_breq(
            "/task/commit_inspection",
            [{
                "tid": "1",
                "fid": i,
            } for i in files],
        )
        self.assertTrue(all([i == 0 for i, in res]))

        # su查询任务的完成状态
        util.c = c_su
        res = japi_req("/task/get_inspection_progress")
        self.assertEqual(len(res[1]), len(files))
        self.assertTrue(all(res.values()))
        _, res = japi_req("/task/get_annotation_progress")
        self.assertEqual(len(res), 2)
        return


if __name__ == "__main__":
    unittest.main()
