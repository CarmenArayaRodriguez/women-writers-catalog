--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2026-04-15 06:45:43 -04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3603 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 224185)
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    country character varying(100),
    bio text
);


ALTER TABLE public.authors OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 224193)
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    short_description text,
    synopsis text,
    cover_image_url character varying(255),
    publisher character varying(100),
    year integer,
    genre character varying(100),
    author_id uuid
);


ALTER TABLE public.books OWNER TO postgres;

--
-- TOC entry 3596 (class 0 OID 224185)
-- Dependencies: 215
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (id, name, country, bio) FROM stdin;
9c0e6697-00f4-43ed-a65b-fff354b2858c	Isabel Allende	Chile	Escritora chilena, referente del realismo mágico y una de las autoras más leídas del mundo.
612e2feb-8ca0-4843-b411-d6fb21f41f27	Mariana Enriquez	Argentina	Periodista y escritora, conocida por sus relatos de terror vinculados a la realidad social.
a3cd0506-f6dd-4421-a20b-6c70b0e7cbd9	Nona Fernández	Chile	Escritora y guionista chilena que explora la memoria y el pasado reciente de su país.
d6ed3a21-05bc-4313-837a-e390edd83b4c	Ángeles Mastretta	México	Escritora conocida por sus relatos sobre mujeres que desafían las convenciones sociales.
e62a0690-9d96-460c-ba24-c9e9ed8bedff	Arelis Uribe	Chile	Escritora y periodista destacada por su narrativa cruda y feminista.
5011e84e-6ab5-4407-a12e-e591cab01b31	Marcela Serrano	Chile 	Escritora chilena, referente de la literatura contemporánea en Latinoamérica. Su obra destaca por explorar la identidad femenina y el compromiso político. Autora de éxitos internacionales como 'Nosotras que nos queremos tanto' y 'Antigua vida mía', ha sido galardonada con el Premio Sor Juana Inés de la Cruz.
4c717540-e191-4205-b0c0-626660150821	Fernanda Melchor	México	Escritora y periodista mexicana, reconocida mundialmente por su novela Temporada de huracanes. Su obra destaca por explorar la violencia y el realismo con una fuerza narrativa impresionante.
3f8bfcf7-df56-4618-97a4-4ed616cdc47b	Laura Esquivel	México	Escritora y política mexicana, famosa por combinar gastronomía y literatura.
\.


--
-- TOC entry 3597 (class 0 OID 224193)
-- Dependencies: 216
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, title, short_description, synopsis, cover_image_url, publisher, year, genre, author_id) FROM stdin;
94623836-8738-40b8-9500-65b1a27f2a06	Nuestra parte de noche	Un viaje oscuro que mezcla terror sobrenatural con historia política.	Un padre y un hijo atraviesan Argentina por carretera en los años de la dictadura, cargando con el legado de una sociedad secreta.	nuestra-parte-de-noche.jpeg	Anagrama	2019	Terror / Novela	612e2feb-8ca0-4843-b411-d6fb21f41f27
92f1f2c8-fee1-4e33-9c35-e6d06adb2d3a	Como agua para chocolate	Una historia de amor prohibido que se cocina con sentimientos mágicos.	Tita de la Garza utiliza la cocina para expresar sus sentimientos en un mundo donde las tradiciones le impiden estar con su amor.	como-agua-para-chocolate.jpg	Planeta	1989	Realismo Mágico	3f8bfcf7-df56-4618-97a4-4ed616cdc47b
17db0c33-cff4-4ba3-9f17-02a0fd8e1872	Chilean Electric	Crónica sobre la memoria familiar y la llegada de la luz a Santiago.	Una reflexión sobre la luz, la oscuridad de la historia y los recuerdos familiares que se iluminan por primera vez.	chilean-electric.jpg	Alquimia	2015	Crónica / Ensayo	a3cd0506-f6dd-4421-a20b-6c70b0e7cbd9
e56137a7-e125-456c-8560-e3051947feaa	Arráncame la vida	El despertar de una mujer frente al poder en el México de los años 30.	Catalina Guzmán narra su ascenso y liberación personal en un matrimonio con un poderoso general en el México posrevolucionario.	arrancame-la-vida.jpg	Seix Barral	1985	Novela Histórica	d6ed3a21-05bc-4313-837a-e390edd83b4c
4fe772a5-24a1-41e2-9c81-6de04b2f533e	Quiltras	Relatos sobre la vida en la periferia, la identidad y el despertar sexual.	A través de un lenguaje directo, rebelde y profundamente honesto, Arelis Uribe nos sumerge en el universo de mujeres que habitan la periferia de Santiago. Quiltras no es solo una colección de relatos; es una radiografía sobre la identidad de clase, la sororidad y la resistencia femenina en los márgenes de la ciudad. Con historias que transitan entre la infancia, el despertar sexual y la crudeza de la vida cotidiana, este libro explora qué significa ser mujer y 'quiltra' en un Chile lleno de contrastes, logrando una obra tan política como íntima que se queda grabada en la piel.	quiltras.jpg	Los Libros de la Mujer Rota	2016	Cuentos	e62a0690-9d96-460c-ba24-c9e9ed8bedff
4d8f32cb-4566-4122-a1b5-60808930d991	Hija de la fortuna	Una ambiciosa saga histórica sobre una joven chilena que viaja a California durante la fiebre del oro en busca de su amor.	Eliza Sommers es una joven chilena que vive en Valparaíso en 1849, el año en que se descubre oro en California. Su amante, Joaquín Andieta, parte hacia el norte decidido a hacer fortuna, y ella decide seguirlo. El viaje de Eliza es una aventura hacia la libertad y el autoconocimiento, donde aprenderá que el amor es una fuerza poderosa pero que la independencia lo es aún más. Una historia llena de personajes inolvidables y una recreación magistral de una época de cambios.	hija-de-la-fortuna.jpg	Plaza & Janés	1999	Novela histórica	9c0e6697-00f4-43ed-a65b-fff354b2858c
4495f297-0272-47cc-b377-ae615e1e06dd	Liceo de Niñas	Una reflexión sobre la memoria, la adolescencia y los fantasmas de la dictadura chilena a través de un reencuentro escolar.	Un grupo de exalumnas de un liceo emblemático se reúne años después de haber participado en las protestas estudiantiles de los años 80. Entre túneles subterráneos y recuerdos que no terminan de encajar, Nona Fernández construye una historia donde el pasado y el presente se confunden. Es una obra que explora cómo la historia de un país se queda grabada en los cuerpos de quienes la vivieron cuando apenas eran niñas.	liceo-de-ninas.jpg	Alquimia Ediciones	2015	Dramaturgia / Novela	a3cd0506-f6dd-4421-a20b-6c70b0e7cbd9
d874a87b-ad57-4096-9d38-3b55f61dd392	Las heridas	Una exploración cruda y valiente sobre las cicatrices del cuerpo, la política y la memoria.	En este libro, Arelis Uribe profundiza en las marcas que deja la vida, el activismo y el amor. Con una prosa directa y sin adornos, nos lleva por un Chile que duele, pero que también se reconoce en sus propias heridas.	las-heridas.webp	Emecé Editores	2023	Ficción contemporánea	e62a0690-9d96-460c-ba24-c9e9ed8bedff
c442a1f2-44d9-4f2a-b567-dedb5ecda4d9	Temporada de huracanes	Un retrato brutal sobre el abandono y la violencia en un México profundo.	La historia comienza con el hallazgo de un cadáver flotando en las aguas de un canal de riego: es el cuerpo de la Bruja, un personaje respetado y temido en el pueblo de La Matosa. A partir de este evento, la novela se despliega en una serie de relatos que se entrelazan para revelar las miserias, los deseos y las violencias de un grupo de personajes marcados por la fatalidad. Con una prosa torrencial y un ritmo que no da tregua, Melchor nos sumerge en una atmósfera asfixiante donde el chisme, la superstición y la brutalidad humana son los verdaderos protagonistas.	temporada-de-huracanes.webp	Literatura Random House	2017	Novela negra	4c717540-e191-4205-b0c0-626660150821
\.


--
-- TOC entry 3449 (class 2606 OID 224192)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- TOC entry 3451 (class 2606 OID 224200)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- TOC entry 3452 (class 2606 OID 224201)
-- Name: books books_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


-- Completed on 2026-04-15 06:45:44 -04

--
-- PostgreSQL database dump complete
--

