CREATE TABLE "student" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"prom"	TEXT NOT NULL,
	"level" TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);


CREATE TABLE "invoice" (
	"id"	INTEGER NOT NULL UNIQUE,
	"recu"	TEXT NOT NULL,
	"montant"	INTEGER NOT NULL,
	"id_sous"	INTEGER NOT NULL,
	"id_student"	INTEGER NOT NULL,
	FOREIGN KEY("id_sous") REFERENCES "sous"("id"),
	FOREIGN KEY("id_student") REFERENCES "student"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "sous" (
	"id"	INTEGER NOT NULL UNIQUE,
	"sous"	TEXT NOT NULL,
	"id_student"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "test" (
	"id"	INTEGER NOT NULL UNIQUE,
	"pr"	INTEGER,
	"gr"	INTEGER,
	"clar"	INTEGER,
	"lis"	INTEGER,
	"id_student"	INTEGER NOT NULL,
	FOREIGN KEY("id_student") REFERENCES "student"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "config" (
	"id"    INTEGER NOT NULL UNIQUE,
	"fee"   INTEGER,
	"initial_student_number" INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO `config` VALUES (1, 350000, 1234);