"""数据层测试
"""

import unittest

from lube import model


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
        self.cxt = self.app.app_context()
        self.cxt.push()
        model.db.drop_all()
        model.db.create_all()
        self.s = model.db.session
        return

    def tearDown(self):
        self.cxt.pop()
        self.s.close()
        return

    def test_1(self):
        """测试用户与权限系统简单的增删改查
        """
        s = self.s

        # 创建用户和权限
        s.add(model.ac.User("su", ""))
        s.add(model.ac.Priv("123", "test"))
        s.add(model.ac.Priv("456", "test"))
        self.s.commit()

        # 改个ID
        u: model.ac.User = model.ac.User.query.get("su")
        u.id = "su2"
        self.s.commit()

        # 授予权限
        u.grant_priv("123")
        u.grant_priv("456")
        self.s.commit()

        # 授予一个不存在的权限
        u.grant_priv("wtf")
        self.assertFalse(model.db_commit())

        # 检查权限
        u: model.ac.User = model.ac.User.query.get("su2")
        self.assertEqual(set(u.list_priv()), {"123", "456"})

        # 收回权限
        u.revoke_priv("123")
        self.s.commit()
        self.assertEqual(u.list_priv(), ["456"])

        # 删除用户，权限表应该为空
        s.delete(u)
        self.s.commit()
        self.assertFalse(model.ac.UserPriv.query.all())

        return

    def test_2(self):
        """测试任务系统简单的增删改查
        """
        s = self.s

        # 创建用户
        s.add(model.ac.User("a", ""))
        s.add(model.ac.User("b", ""))
        s.add(model.ac.User("c", ""))

        # 创建任务
        s.add(model.task.TaskBundle("1"))

        # 创建生语料
        s.add(model.task.RawCorpus("1"))
        s.add(model.task.RawCorpus("2"))
        s.add(model.task.RawCorpus("3"))
        self.s.commit()

        # 给任务添加内容
        t: model.task.TaskBundle = model.task.TaskBundle.query.get("1")
        t.add_file("1")
        self.s.commit()
        t.add_annotator("a")
        self.s.commit()
        t.add_annotator("b")
        self.s.commit()
        t.add_file("2")
        self.s.commit()
        t.add_file("3")
        self.s.commit()

        # 现在标注进度表应该有6项
        self.assertEqual(len(model.task.Annotation.query.all()), 6)

        # 删掉一个用户，标注表应该剩3项
        t.remove_annotator("a")
        self.s.commit()
        self.assertEqual(len(model.task.Annotation.query.all()), 3)

        # 把b替换成c，看看现在标注的人有哪些
        t.replace_annotator("b", "c")
        self.s.commit()
        self.assertEqual(t.list_annotators(), ["c"])
        return


if __name__ == "__main__":
    unittest.main()
