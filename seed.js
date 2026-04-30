/**
 * Script de inicialización de datos (Seeding) para la base de datos
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de registros maestros...');

  /** Limpieza de registros previos para asegurar integridad */
  await prisma.books.deleteMany();
  await prisma.authors.deleteMany();

  /** Registro de obras y autoras */

  // 1. MARCELA SERRANO
  await prisma.authors.create({
    data: {
      first_name: 'Marcela', last_name: 'Serrano', country: 'Chile',
      bio: 'Destacada novelista chilena conocida por su enfoque en la psicología femenina.',
      books: {
        create: [
          { 
            title: 'Antigua vida mía', 
            short_description: 'Una historia de amistad y reencuentro.', 
            synopsis: 'Josefa Ferrer, una famosa cantautora, y Violeta Dasinski, una arquitecta, entrelazan sus vidas en un relato de sororidad, violencia de género y búsqueda de libertad en Guatemala y Chile.',
            year: 1995, genre: 'Novela', publisher: 'Alfaguara', cover_image_url: 'antigua-vida-mia.jpg' 
          }
        ]
      }
    }
  });

  // 2. ÁNGELES MASTRETTA
  await prisma.authors.create({
    data: {
      first_name: 'Ángeles', last_name: 'Mastretta', country: 'México',
      bio: 'Escritora mexicana famosa por crear personajes femeninos sugerentes.',
      books: {
        create: [
          { 
            title: 'Arráncame la vida', 
            short_description: 'Relato sobre el poder y la libertad femenina.', 
            synopsis: 'Catalina Ascencio se casa joven con el general Andrés Ascencio en el México posrevolucionario, descubriendo que su mundo de privilegios es una cárcel de oro que debe romper.',
            year: 1985, genre: 'Novela', publisher: 'Seix Barral', cover_image_url: 'arrancame-la-vida.jpg' 
          }
        ]
      }
    }
  });

  // 3. NONA FERNÁNDEZ
  await prisma.authors.create({
    data: {
      first_name: 'Nona', last_name: 'Fernández', country: 'Chile',
      bio: 'Escritora y actriz chilena, centrada en reconstruir la memoria histórica.',
      books: {
        create: [
          { 
            title: 'Chilean Electric', 
            short_description: 'Crónica sobre la memoria y la luz.', 
            synopsis: 'A partir de la anécdota de su abuela presenciando la llegada de la luz eléctrica a la Plaza de Armas, la autora ilumina rincones oscuros de la historia de Chile y la memoria familiar.',
            year: 2015, genre: 'Ensayo', publisher: 'Alquimia', cover_image_url: 'chilean-electric.jpg' 
          },
          { 
            title: 'Liceo de Niñas', 
            short_description: 'Reflexión sobre la identidad escolar y social.', 
            synopsis: 'Una obra que transita entre dramaturgia y narrativa, donde ex alumnas de un liceo público chileno se enfrentan a sus fantasmas escolares y a promesas incumplidas.',
            year: 2015, genre: 'Novela', publisher: 'Alquimia', cover_image_url: 'liceo-de-ninas.jpg' 
          }
        ]
      }
    }
  });

  // 4. LAURA ESQUIVEL
  await prisma.authors.create({
    data: {
      first_name: 'Laura', last_name: 'Esquivel', country: 'México',
      bio: 'Pionera en combinar gastronomía con realismo mágico literario.',
      books: {
        create: [
          { 
            title: 'Como agua para chocolate', 
            short_description: 'Recetas y amores imposibles.', 
            synopsis: 'Tita De la Garza, condenada a no casarse para cuidar a su madre, expresa sus emociones prohibidas a través de platillos mágicos que afectan a quienes los prueban.',
            year: 1989, genre: 'Realismo Mágico', publisher: 'Anchor', cover_image_url: 'como-agua-para-chocolate.jpg' 
          }
        ]
      }
    }
  });

  // 5. GABRIELA MISTRAL
  await prisma.authors.create({
    data: {
      first_name: 'Gabriela', last_name: 'Mistral', country: 'Chile',
      bio: 'La primera mujer latinoamericana en ganar el Premio Nobel de Literatura.',
      books: {
        create: [
          { 
            title: 'Desolación', 
            short_description: 'Poesía desgarradora y profunda.', 
            synopsis: 'Poemario fundamental que aborda el dolor del amor perdido, la maternidad frustrada, la fe y la conexión mística con la naturaleza.',
            year: 1922, genre: 'Poesía', publisher: 'Instituto de las Españas', cover_image_url: 'desolacion.webp' 
          }
        ]
      }
    }
  });

  // 6. ISABEL ALLENDE
  await prisma.authors.create({
    data: {
      first_name: 'Isabel', last_name: 'Allende', country: 'Chile',
      bio: 'Autora de gran éxito mundial, referente de la narrativa hispana.',
      books: {
        create: [
          { 
            title: 'Hija de la fortuna', 
            short_description: 'Aventura en la fiebre del oro.', 
            synopsis: 'Eliza Sommers, joven chilena criada por británicos en Valparaíso, viaja como polizón a California en busca de su amante durante la fiebre del oro de 1849.',
            year: 1999, genre: 'Novela Histórica', publisher: 'Vintage', cover_image_url: 'hija-de-la-fortuna.jpg' 
          },
          { 
            title: 'La casa de los espíritus', 
            short_description: 'Saga familiar de los Trueba.', 
            synopsis: 'Narra la vida de la familia Trueba a lo largo de cuatro generaciones, mezclando pasiones, política y lo sobrenatural en un Chile en transformación.',
            year: 1982, genre: 'Realismo Mágico', publisher: 'Plaza & Janés', cover_image_url: 'la-casa-de-los-espiritus.jpeg' 
          }
        ]
      }
    }
  });

  // 7. ARELIS URIBE
  await prisma.authors.create({
    data: {
      first_name: 'Arelis', last_name: 'Uribe', country: 'Chile',
      bio: 'Periodista y escritora chilena destacada por su narrativa directa y social.',
      books: {
        create: [
          { 
            title: 'Las heridas', 
            short_description: 'Relatos sobre la educación y clase.', 
            synopsis: 'Crónicas que exploran las cicatrices del sistema educativo chileno, precariedad económica y descubrimiento de la identidad en un entorno desigual.',
            year: 2017, genre: 'Cuentos', publisher: 'Emecé', cover_image_url: 'las-heridas.webp' 
          },
          { 
            title: 'Quiltras', 
            short_description: 'Historias de mujeres en los márgenes.', 
            synopsis: 'Cuentos protagonizados por mujeres jóvenes de barrios populares que retratan amistad, despertar sexual y barreras sociales con lenguaje crudo.',
            year: 2016, genre: 'Cuentos', publisher: 'Los Libros de la Mujer Rota', cover_image_url: 'quiltras.jpg' 
          }
        ]
      }
    }
  });

  // 8. MARIANA ENRÍQUEZ
  await prisma.authors.create({
    data: {
      first_name: 'Mariana', last_name: 'Enríquez', country: 'Argentina',
      bio: 'Maestra del terror contemporáneo y urbano latinoamericano.',
      books: {
        create: [
          { 
            title: 'Nuestra parte de noche', 
            short_description: 'Sagas familiares y ritos oscuros.', 
            synopsis: 'Un padre y un hijo atraviesan Argentina por carretera. Pertenecen a una Orden que rinde culto a la Oscuridad, mezclando terror sobrenatural con historia de dictadura.',
            year: 2019, genre: 'Terror', publisher: 'Anagrama', cover_image_url: 'nuestra-parte-de-noche.jpeg' 
          }
        ]
      }
    }
  });

  // 9. FERNANDA MELCHOR
  await prisma.authors.create({
    data: {
      first_name: 'Fernanda', last_name: 'Melchor', country: 'México',
      bio: 'Escritora mexicana reconocida por su estilo visceral y crudo.',
      books: {
        create: [
          { 
            title: 'Temporada de huracanes', 
            short_description: 'Investigación de un asesinato en un pueblo.', 
            synopsis: 'En el pueblo de La Matosa, aparece el cadáver de la Bruja. Testimonios reconstruyen una historia de miseria, violencia y superstición visceral.',
            year: 2017, genre: 'Novela', publisher: 'Random House', cover_image_url: 'temporada-de-huracanes.webp' 
          }
        ]
      }
    }
  });

  // 10. ALEJANDRA PIZARNIK
  await prisma.authors.create({
    data: {
      first_name: 'Alejandra', last_name: 'Pizarnik', country: 'Argentina',
      bio: 'Voz poética fundamental de la literatura latinoamericana del siglo XX.',
      books: {
        create: [
          { 
            title: 'La condesa sangrienta', 
            short_description: 'Relato sobre Erzsébet Báthory.', 
            synopsis: 'Retrato poético y perturbador sobre la figura de la condesa Bathory, donde se explora la belleza del horror, la perversión y la obsesión.',
            year: 1971, genre: 'Ensayo/Relato', publisher: 'Libros del Zorro Rojo', cover_image_url: 'la-condesa-sangrienta.jpg' 
          }
        ]
      }
    }
  });

  // 11. LINA MERUANE
  await prisma.authors.create({
    data: {
      first_name: 'Lina', last_name: 'Meruane', country: 'Chile',
      bio: 'Escritora chilena contemporánea, ganadora del premio Sor Juana Inés de la Cruz.',
      books: {
        create: [
          { 
            title: 'Sangre en el ojo', 
            short_description: 'Novela sobre la pérdida de la visión.', 
            synopsis: 'Tras sufrir una hemorragia ocular, una mujer debe reconfigurar su mundo y relaciones desde la repentina oscuridad en un relato visceral.',
            year: 2012, genre: 'Novela', publisher: 'Eterna Cadencia', cover_image_url: 'sangre-en-el-ojo.jpeg' 
          }
        ]
      }
    }
  });

  console.log('Carga simétrica completada (14 libros registrados).');
}

main()
  .catch((e) => { 
    console.error('Error durante la carga:', e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });