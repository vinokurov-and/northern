CREATE TABLE players (
    'id' integer PRIMARY KEY AUTOINCREMENT, 
    'externalId' integer NULL,
    'createdAt' text NULL,
    'title' text NOT NULL, 
    'description' text NULL, 
    'slug' text NULL,
    'position' text NULL,
    'image' text NULL
);