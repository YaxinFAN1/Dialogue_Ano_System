"""一键运行所有单元测试

在本项目根目录下运行
"""

import unittest

loader = unittest.TestLoader()
suites = loader.discover(
    "./test/test_view",
    pattern="test_*.py",
    top_level_dir="..",
)  # 这里的路径调了好久

runner = unittest.TextTestRunner()
runner.run(suites)
