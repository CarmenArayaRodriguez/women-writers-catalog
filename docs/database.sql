--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2026-04-29 07:14:18 -04

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
-- TOC entry 5 (class 2615 OID 224278)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 224400)
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 224279)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 224290)
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    country character varying(100),
    bio text
);


--
-- TOC entry 217 (class 1259 OID 224298)
-- Name: books; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 3616 (class 0 OID 224400)
-- Dependencies: 218
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, role, "createdAt") FROM stdin;
96207dda-6618-4487-a7bc-b90fdaf874d1	admin@admin.com	$2b$10$QnD1bAKdI2IKXpcykg3XgODoXDYO2UsX46skAOiCqyUO.Vo0/Sir2	admin	2026-04-28 22:58:53.588
\.


--
-- TOC entry 3613 (class 0 OID 224279)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6ef61224-dc2b-485f-be00-107ca2f1a79d	8f4cc3f16578bad13ecb78cf727d65c2a5031628955a506df9fed1695e6038ff	2026-04-28 18:43:04.478698-04	20260428224304_init_structured_schema	\N	\N	2026-04-28 18:43:04.347511-04	1
e4884fa6-6f55-4885-9526-b70734926911	3d96e73fb4e2ef2ac3cff8174f7715a2db4bff8d11d1ebf1453c2d2ab551fe98	2026-04-28 18:56:32.0603-04	20260428225632_add_user_table_uuid	\N	\N	2026-04-28 18:56:32.053867-04	1
\.


--
-- TOC entry 3614 (class 0 OID 224290)
-- Dependencies: 216
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authors (id, first_name, last_name, country, bio) FROM stdin;
0340b4d1-2300-46db-b29f-9d54956b1275	Marcela	Serrano	Chile	Destacada novelista chilena conocida por su enfoque en la psicología femenina.
a5765571-0b91-4d2d-80bb-af45e0becd88	Ángeles	Mastretta	México	Escritora mexicana famosa por crear personajes femeninos sugerentes.
674196ac-e2bf-4f18-97a0-78415fc64a10	Nona	Fernández	Chile	Escritora y actriz chilena, centrada en reconstruir la memoria histórica.
686875e6-7a61-4277-a102-94143ae2115f	Laura	Esquivel	México	Pionera en combinar gastronomía con realismo mágico literario.
cb029d92-44dc-423b-a098-d8b01500b8ed	Gabriela	Mistral	Chile	La primera mujer latinoamericana en ganar el Premio Nobel de Literatura.
dde5ce04-402b-4aae-a2e1-a8025f83786f	Isabel	Allende	Chile	Autora de gran éxito mundial, referente de la narrativa hispana.
f0c7daf3-7cab-4ace-8af5-6bb343cae0e7	Arelis	Uribe	Chile	Periodista y escritora chilena destacada por su narrativa directa y social.
787d2c10-3f48-429b-8a96-d7239562224b	Mariana	Enríquez	Argentina	Maestra del terror contemporáneo y urbano latinoamericano.
e14e4a23-b103-4e0a-94d9-4d6b9652033d	Fernanda	Melchor	México	Escritora mexicana reconocida por su estilo visceral y crudo.
1e2566b8-0bb3-47bb-ac32-4e630a5bc0d6	Alejandra	Pizarnik	Argentina	Una de las voces poéticas más intensas y profundas de la literatura latinoamericana del siglo XX.
b9da7d15-528c-4e6e-834d-1ebbed6c9f3b	Lina	Meruane	Chile	Reconocida escritora chilena contemporánea, ganadora del premio Sor Juana Inés de la Cruz.
\.


--
-- TOC entry 3615 (class 0 OID 224298)
-- Dependencies: 217
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.books (id, title, short_description, synopsis, cover_image_url, publisher, year, genre, author_id) FROM stdin;
4c0d1cf8-2cda-4598-aa36-ce4421ee0f4d	Antigua vida mía	Una historia de amistad y reencuentro.	Josefa Ferrer, una famosa cantautora, y Violeta Dasinski, una arquitecta, entrelazan sus vidas en un relato de sororidad, violencia de género y búsqueda de libertad en Guatemala y Chile.	antigua-vida-mia.jpg	Alfaguara	1995	Novela	0340b4d1-2300-46db-b29f-9d54956b1275
ebaff110-4069-44d1-a9e9-b88ac9fa7220	Arráncame la vida	Relato sobre el poder y la libertad femenina.	Catalina Ascencio se casa joven con el general Andrés Ascencio en el México posrevolucionario, descubriendo que su mundo de privilegios es una cárcel de oro que debe romper.	arrancame-la-vida.jpg	Seix Barral	1985	Novela	a5765571-0b91-4d2d-80bb-af45e0becd88
1b58352f-0416-4326-b5dd-6e40b98c5067	Chilean Electric	Crónica sobre la memoria y la luz.	A partir de la anécdota de su abuela presenciando la llegada de la luz eléctrica a la Plaza de Armas, la autora ilumina rincones oscuros de la historia de Chile y la memoria familiar.	chilean-electric.jpg	Alquimia	2015	Ensayo	674196ac-e2bf-4f18-97a0-78415fc64a10
2fec6d43-5662-48cb-8bc4-3e05bbcffaef	Liceo de Niñas	Reflexión sobre la identidad escolar y social.	Una obra que transita entre dramaturgia y narrativa, donde ex alumnas de un liceo público chileno se enfrentan a sus fantasmas escolares y a promesas incumplidas.	liceo-de-ninas.jpg	Alquimia	2015	Novela	674196ac-e2bf-4f18-97a0-78415fc64a10
ecaa919e-9536-4ce3-9bd4-2d8ca28bf0d9	Como agua para chocolate	Recetas y amores imposibles.	Tita De la Garza, condenada a no casarse para cuidar a su madre, expresa sus emociones prohibidas a través de platillos mágicos que afectan a quienes los prueban.	como-agua-para-chocolate.jpg	Anchor	1989	Realismo Mágico	686875e6-7a61-4277-a102-94143ae2115f
b6f41845-1555-4839-906a-04130a182305	Desolación	Poesía desgarradora y profunda.	Poemario fundamental publicado en 192 publico aborda el dolor del amor perdido, maternidad frustrada, fe y conexión mística con la naturaleza.	desolacion.webp	Instituto de las Españas	1922	Poesía	cb029d92-44dc-423b-a098-d8b01500b8ed
515ea951-ff1b-4c50-9075-ffec93a60124	Hija de la fortuna	Aventura en la fiebre del oro.	Eliza Sommers, joven chilena criada por británicos en Valparaíso, viaja como polizón a California en busca de su amante durante la fiebre del oro de 1849.	hija-de-la-fortuna.jpg	Vintage	1999	Novela Histórica	dde5ce04-402b-4aae-a2e1-a8025f83786f
3a084ebd-780f-4bd0-9195-d65943ed92b1	La casa de los espíritus	Saga familiar de los Trueba.	Narra la vida de la familia Trueba a lo largo de cuatro generaciones, mezclando pasiones, política y lo sobrenatural en un Chile en transformación.	la-casa-de-los-espiritus.jpeg	Plaza & Janés	1982	Realismo Mágico	dde5ce04-402b-4aae-a2e1-a8025f83786f
261d6c55-8b37-4a49-9171-4cbd3ed9be26	Las heridas	Relatos sobre la educación y clase.	Crónicas que exploran las cicatrices del sistema educativo chileno, precariedad económica y descubrimiento de la identidad en un entorno desigual.	las-heridas.webp	Emecé	2017	Cuentos	f0c7daf3-7cab-4ace-8af5-6bb343cae0e7
813d23bd-67b4-43fa-a7dc-641703327a41	Quiltras	Historias de mujeres en los márgenes.	Cuentos protagonizados por mujeres jóvenes de barrios populares que retratan amistad, despertar sexual y barreras sociales con lenguaje crudo.	quiltras.jpg	Los Libros de la Mujer Rota	2016	Cuentos	f0c7daf3-7cab-4ace-8af5-6bb343cae0e7
3a00e12a-fe50-4f12-a523-3b0c12356406	Nuestra parte de noche	Sagas familiares y ritos oscuros.	Un padre y un hijo atraviesan Argentina por carretera. Pertenecen a una Orden que rinde culto a la Oscuridad, mezclando terror sobrenatural con historia de dictadura.	nuestra-parte-de-noche.jpeg	Anagrama	2019	Terror	787d2c10-3f48-429b-8a96-d7239562224b
5795c8c0-07f5-48b4-b92d-3e9322462727	Temporada de huracanes	Investigación de un asesinato en un pueblo.	En el pueblo de La Matosa, aparece el cadáver de la Bruja. Testimonios reconstruyen una historia de miseria, violencia y superstición visceral.	temporada-de-huracanes.webp	Random House	2017	Novela	e14e4a23-b103-4e0a-94d9-4d6b9652033d
59e715c1-d4fc-4c54-a08a-ce32b3954e4e	La condesa sangrienta	Relato sobre la aristócrata Erzsébet Báthory.	Un retrato poético y perturbador sobre la figura de la condesa Bathory, donde Pizarnik explora la belleza del horror, la perversión y la obsesión con un lenguaje magistral.	la-condesa-sangrienta.jpg	Libros del Zorro Rojo	1971	Ensayo/Relato	1e2566b8-0bb3-47bb-ac32-4e630a5bc0d6
2e61c454-b670-4b4c-a902-2886daf6342c	Sangre en el ojo	Novela sobre la pérdida de la visión.	Tras sufrir una hemorragia ocular, una mujer debe reconfigurar su mundo, identidad y relaciones personales desde la repentina oscuridad, en un relato visceral.	sangre-en-el-ojo.jpeg	Eterna Cadencia	2012	Novela	b9da7d15-528c-4e6e-834d-1ebbed6c9f3b
\.


--
-- TOC entry 3468 (class 2606 OID 224408)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3461 (class 2606 OID 224287)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3463 (class 2606 OID 224297)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- TOC entry 3465 (class 2606 OID 224305)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- TOC entry 3466 (class 1259 OID 224409)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3469 (class 2606 OID 224306)
-- Name: books books_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- TOC entry 3622 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-04-29 07:14:19 -04

--
-- PostgreSQL database dump complete
--

