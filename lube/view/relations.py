from .base import ArgumentError, JapiBlueprint
from lube.model.base import ModelError
from lube.model.relations import Relation, db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


jbp = JapiBlueprint("relations", __name__, url_prefix="/relations")


relations = set(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'])


@jbp.japi_route()
def get(jarg):
    return [r for r, in db.session.query(Relation._relation).all()]


@jbp.japi_route()
def delete(jarg):
    try:
        value = jarg["value"]
    except BaseException:
        raise ArgumentError()
    
    r = Relation.query.get(value)
    if r is not None:
        try:
            db.session.delete(r)
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise ModelError()

    return [r for r, in db.session.query(Relation._relation).all()]


@jbp.japi_route()
def add(jarg):
    
    try:
        value = jarg["value"]
    except BaseException:
        raise ArgumentError()
        
    r = Relation.query.get(value)
    if r is None:
        try:
            r = Relation(value)
            db.session.add(r)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return None, 1
        except SQLAlchemyError:
            db.session.rollback()
            raise ModelError
    
    return [r for r, in db.session.query(Relation._relation).all()]


# 初始化函数
def init_app(app) -> None:
    app.register_blueprint(jbp)
    return
