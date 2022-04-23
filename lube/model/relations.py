from sqlalchemy import Column, String
from .base import db, simple_property


class Relation(db.Model):
    
    __tablename__ = "relations"
    
    _relation = Column("relation", String(32), primary_key=True)

    
    def __init__(self, relation: str) -> None:
        """
        Args:
            id (str): 语料ID
        """
        self.relation = relation
        return
    
    relation = simple_property("_relation")