from sqlalchemy.orm import Session
from db.schema import Sport, Venue


SPORTS_DATA = [
    {"key": "football", "name": "Football", "min_group": 10, "max_group": 14},
    {"key": "basketball", "name": "Basketball", "min_group": 6, "max_group": 10},
    {"key": "tennis", "name": "Tennis", "min_group": 2, "max_group": 4},
    {"key": "volleyball", "name": "Volleyball", "min_group": 8, "max_group": 12},
    {"key": "running", "name": "Running", "min_group": 2, "max_group": 20},
    {"key": "cycling", "name": "Cycling", "min_group": 2, "max_group": 15},
    {"key": "swimming", "name": "Swimming", "min_group": 2, "max_group": 8},
    {"key": "table-tennis", "name": "Table Tennis", "min_group": 2, "max_group": 4},
    {"key": "badminton", "name": "Badminton", "min_group": 2, "max_group": 4},
]

VENUES_DATA = [
    {"name": "Arena Sport Cluj", "address": "Str. Fabricii 12", "city": "Cluj-Napoca", "sport_keys": "football,basketball,volleyball", "price_per_hour": 120, "rating": 4.5, "lat": 46.774, "lng": 23.601},
    {"name": "Terenul Verde", "address": "Calea Mănăștur 78", "city": "Cluj-Napoca", "sport_keys": "football", "price_per_hour": 80, "rating": 4.2, "lat": 46.762, "lng": 23.573},
    {"name": "SportPark Central", "address": "Bd. 21 Decembrie 45", "city": "Cluj-Napoca", "sport_keys": "football,basketball,tennis", "price_per_hour": 150, "rating": 4.7, "lat": 46.770, "lng": 23.591},
    {"name": "Tennis Club Central", "address": "Str. Clinicilor 5", "city": "Cluj-Napoca", "sport_keys": "tennis,badminton,table-tennis", "price_per_hour": 60, "rating": 4.3, "lat": 46.768, "lng": 23.588},
    {"name": "Sala Sporturilor Horia Demian", "address": "Str. Aleea Stadionului 2", "city": "Cluj-Napoca", "sport_keys": "basketball,volleyball,badminton", "price_per_hour": 100, "rating": 4.4, "lat": 46.763, "lng": 23.580},
    {"name": "Parcul Central", "address": "Bd. Eroilor", "city": "Cluj-Napoca", "sport_keys": "running,cycling", "price_per_hour": None, "rating": 4.6, "lat": 46.771, "lng": 23.587},
    {"name": "Bazinul Olimpic Grigorescu", "address": "Str. Alverna 60", "city": "Cluj-Napoca", "sport_keys": "swimming", "price_per_hour": 30, "rating": 4.1, "lat": 46.758, "lng": 23.568},
    {"name": "Cetățuia Park", "address": "Dealul Cetățuii", "city": "Cluj-Napoca", "sport_keys": "running,cycling", "price_per_hour": None, "rating": 4.5, "lat": 46.774, "lng": 23.583},
    {"name": "Iulius Park Sports", "address": "Str. Alexandru Vaida-Voievod 53", "city": "Cluj-Napoca", "sport_keys": "football,basketball,volleyball,tennis", "price_per_hour": 140, "rating": 4.6, "lat": 46.776, "lng": 23.623},
]


def seed_database(db: Session):
    if db.query(Sport).first():
        return

    for s in SPORTS_DATA:
        db.add(Sport(**s))
    for v in VENUES_DATA:
        db.add(Venue(**v))
    db.commit()
