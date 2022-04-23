import click
from flask import Blueprint
from lube.model.base import db

bp = Blueprint("tool", __name__, cli_group=None)


@bp.cli.command("initdb")
@click.option("--drop", is_flag=True, help="Create after drop.")
def initdb(drop):
    if drop:
        click.echo("database dropped")
        db.drop_all()
    db.create_all()
    click.echo("database created")
    return
