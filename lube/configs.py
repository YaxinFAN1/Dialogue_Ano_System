"""Flask APP配置文件
"""


class Production:
    """生产配置
    """

    # Flask 配置
    SECRET_KEY = r"""@,@H;S$A%r/t+k1O]@gub5lQlT(=v&Q6"""

    # JSON 配置
    JSON_AS_ASCII = False

    # SQLAlchemy 配置
    SQLALCHEMY_DATABASE_URI = "{}+{}://{}:{}@{}:{}/{}?charset=utf8mb4".format(
        "mysql",  # DIALECT
        "pymysql",  # DRIVER
        "lube",  # USERNAME
        r"""fd5b6580901f5ba3a2a23d28be45a8cb""",  # PASSWORD
        "localhost",  # HOST
        "3306",  # PORT
        "lube"  # DATABASE
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class Development:
    """开发测试用配置
    """

    # Flask 配置
    SECRET_KEY = r"SECRET_KEY"
    TESTING = True

    # JSON 配置
    JSON_AS_ASCII = False

    # SQLAlchemy 配置
    SQLALCHEMY_DATABASE_URI = "{}+{}://{}:{}@{}:{}/{}?charset=utf8mb4".format(
        "mysql",  # DIALECT
        "pymysql",  # DRIVER
        "lube",  # USERNAME
        r"""fd5b6580901f5ba3a2a23d28be45a8cb""",  # PASSWORD
        # ? 我不确定使用同一个账户是不是一个好主意
        "127.0.0.1",  # HOST
        "3306",  # PORT
        "lube_dev"  # DATABASE
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class Unittest:
    """单元测试配置
    """

    # Flask 配置
    SECRET_KEY = r"SECRET_KEY"
    TESTING = True

    # JSON 配置
    JSON_AS_ASCII = False

    # SQLAlchemy 配置
    # * SQLite 由于外键机制不健全，不再使用
    # * 使用与生产相同的数据库环境，这样最好
    SQLALCHEMY_DATABASE_URI = "{}+{}://{}:{}@{}:{}/{}?charset=utf8mb4".format(
        "mysql",  # DIALECT
        "pymysql",  # DRIVER
        "lube",  # USERNAME
        r"""7k>u:U]^$bf;>wVj'I^TaPd!2lNH:Jyy""",  # PASSWORD
        "10.10.48.4",  # HOST
        "3306",  # PORT
        "lube_test"  # DATABASE
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
