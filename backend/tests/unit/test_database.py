from app.database import get_db


def test_get_db_generator():
    db_generator = get_db()
    db = next(db_generator)
    assert db is not None
    db_generator.close()
