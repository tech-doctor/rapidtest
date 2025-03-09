
CREATE TABLE tee_times (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    time TIMESTAMP NOT NULL,
     price TEXT NOT NULL, 
    min_players INT NOT NULL,
    max_players INT NOT NULL,
    holes TEXT NOT NULL
);