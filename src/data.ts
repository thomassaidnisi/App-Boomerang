import { NewsItem, Proposal, Vote, BonoInfo, DocItem, EventItem, TeamMember } from './types';

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    date: '28 de Junio, 2026',
    title: '¡Se viene la Estudiantina 2026! 🎪',
    description: 'Preparate para el evento más grande del año en el IJA. Temática de disfraces, stands creativos, buffet económico y torneos intercolegiales.',
    content: 'La Estudiantina es el momento más esperado por toda la comunidad escolar del Instituto Jóvenes Argentinos. Este año la fecha confirmada es el lunes 21 de Septiembre en el camping escolar de la mutual. Tendremos concurso de stands decorados por curso, buffet gestionado íntegramente por el CEC para recaudar fondos para proyectos futuros, bandas en vivo con talentos del colegio y el tradicional desfile de disfraces con premios increíbles. ¡Empezá a debatir y planificar con tus compañeros de curso para llevarse la Copa Estudiantil!',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600',
    featured: true
  },
  {
    id: 'news-2',
    date: '29 de Junio, 2026',
    title: 'Resultados de la reunión mensual con Directivos 📝',
    description: 'Conseguimos la ampliación de los recreos de las mañanas y la instalación de dispensers de agua caliente.',
    content: 'Ayer por la tarde, los miembros de la comisión directiva del Centro de Estudiantes nos reunimos con el director de nivel secundario y la vicedirectora académica. Presentamos las inquietudes recolectadas por los delegados de curso. Logramos los siguientes acuerdos formales:\n\n1. Ampliación del recreo largo de la mañana: pasará de 15 a 20 minutos para permitir un descanso más reparador y agilizar las compras en el buffet.\n2. Agua caliente para el mate: se autorizó la instalación de dos dispensers en áreas comunes.\n3. Protocolo de vestimenta: se iniciará una mesa de diálogo la semana que viene para debatir cambios en el reglamento escolar respecto a bermudas en temporada estival.\n\n¡Gracias a todos por hacernos llegar sus ideas!',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    featured: false
  },
  {
    id: 'news-3',
    date: '25 de Junio, 2026',
    title: 'Gran Torneo Intercurso de Fútsal: ¡Inscripciones abiertas! ⚽',
    description: 'Armá tu equipo mixto, masculino o femenino. Hay tiempo de presentar la planilla hasta el viernes.',
    content: 'Vuelve la pasión intercolegial a la cancha de césped sintético de nuestra institución. Ya se encuentran disponibles las planillas de inscripción en la preceptoría de cada nivel. El torneo se dividirá en categorías masculina, femenina y mixta (con un mínimo de dos jugadoras/jugadores de distinto género en cancha). Las planillas deben ser completadas con firma del preceptor y aval de conducta. Premios para los 1°, 2° y 3° puestos, además de menciones para la valla menos vencida y el goleador/goleadora del torneo. ¡Inscribí a tu curso ya!',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    featured: false
  },
  {
    id: 'news-4',
    date: '18 de Junio, 2026',
    title: 'Campaña Solidaria "Abrigo IJA" 🧥',
    description: 'Recolectamos camperas, buzos y frazadas para donar al Comedor Comunitario "Rayito de Sol" de la zona sur.',
    content: 'Ante la llegada de las bajas temperaturas invernales en Córdoba, el Centro de Estudiantes lanza la tradicional campaña solidaria de recolección de abrigo. Estaremos recibiendo frazadas, sábanas, camperas, buzos, gorros, bufandas y medias en excelente estado o nuevas. Las donaciones se podrán dejar en la caja roja ubicada en la entrada principal del colegio hasta el viernes 10 de julio. Todo lo recaudado será clasificado y entregado al Comedor "Rayito de Sol", con el que colaboramos activamente desde hace años. ¡Demostremos la calidez de la comunidad del IJA!',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
    featured: false
  }
];

export const initialProposals: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Dispensers de agua fría/caliente en planta alta',
    description: 'Para evitar que los cursos ubicados en los pisos superiores tengan que bajar al patio durante los recreos únicamente para recargar el termo o tomar agua fresca, perdiendo tiempo valioso del recreo.',
    course: '6to Año A - Ciencias Naturales',
    status: 'Resuelta',
    date: '20 de Junio, 2026',
    author: 'Lautaro Martínez',
    upvotes: 142,
    downvotes: 8,
    userVote: null,
    responses: [
      {
        date: '24 de Junio, 2026',
        responder: 'Mesa Directiva CEC Boomerang',
        text: '¡Proyecto concretado! Tras la reunión con la dirección e infraestructura, se autorizó e instaló el primer dispenser doble (frío/caliente) en el pasillo de planta alta junto al laboratorio de química. ¡Por favor, cuidémoslo entre todos!'
      }
    ]
  },
  {
    id: 'prop-2',
    title: 'Dos microondas de uso libre en la zona del buffet',
    description: 'Muchos estudiantes se quedan a contraturno por talleres extracurriculares o gimnasia y traen su vianda desde casa. Proponemos colocar dos microondas de libre acceso para que no tengan que almorzar comida fría en invierno.',
    course: '5to Año B - Economía',
    status: 'En el CEC',
    date: '28 de Junio, 2026',
    author: 'Sofía Rodríguez',
    upvotes: 112,
    downvotes: 3,
    userVote: null,
    responses: [
      {
        date: '29 de Junio, 2026',
        responder: 'Mesa Directiva CEC Boomerang',
        text: '¡Hola Sofi! Ya presentamos el proyecto formalmente a la Cooperadora Escolar para que colaboren con la compra de los equipos de 20 litros. Estamos armando un cronograma de limpieza y normas de uso que presentaremos en la próxima asamblea de delegados para asegurar su correcto cuidado.'
      }
    ]
  },
  {
    id: 'prop-3',
    title: 'Permitir bermudas de gimnasia para el uniforme de verano',
    description: 'En los meses de calor sofocante (octubre, noviembre, diciembre y marzo), resulta sumamente incómodo asistir con el pantalón largo gris de vestir para los varones. Proponemos habilitar el uso opcional de la bermuda gris oficial o negra lisa.',
    course: '4to Año A - Ciencias Sociales',
    status: 'En análisis',
    date: '29 de Junio, 2026',
    author: 'Mateo Pérez',
    upvotes: 185,
    downvotes: 12,
    userVote: null,
    responses: []
  },
  {
    id: 'prop-4',
    title: 'Mural Estudiantil en la pared del playón deportivo',
    description: 'Proponemos pintar un gran mural colectivo que represente los valores del compañerismo, la diversidad y el arte escolar en la pared gris del playón, con bocetos diseñados por alumnos de las orientaciones artísticas.',
    course: '5to Año A - Comunicación & Arte',
    status: 'Recibida',
    date: '30 de Junio, 2026',
    author: 'Camila Díaz',
    upvotes: 56,
    downvotes: 2,
    userVote: null,
    responses: []
  },
  {
    id: 'prop-5',
    title: 'Comprar tableros de ajedrez para la biblioteca y recreos',
    description: 'Crear un club escolar de ajedrez y disponer de tableros durante el recreo largo y en horas libres para fomentar un espacio recreativo alternativo, sano y mentalmente estimulante.',
    course: '3ro Año B',
    status: 'Recibida',
    date: '01 de Julio, 2026',
    author: 'Felipe Gómez',
    upvotes: 34,
    downvotes: 1,
    userVote: null,
    responses: []
  },
  {
    id: 'prop-6',
    title: 'Taller extracurricular de Lengua de Señas Argentina (LSA)',
    description: 'Pedimos gestionar con docentes externos un taller bimestral o trimestral optativo para aprender lo básico de LSA, favoreciendo la verdadera inclusión dentro y fuera del colegio.',
    course: '6to Año B - Ciencias Sociales',
    status: 'Archivada',
    date: '12 de Mayo, 2026',
    author: 'Emilia Romero',
    upvotes: 49,
    downvotes: 4,
    userVote: null,
    responses: [
      {
        date: '22 de Mayo, 2026',
        responder: 'Mesa Directiva CEC Boomerang',
        text: 'Evaluamos la propuesta con el gabinete psicopedagógico y la dirección. Debido a cuestiones de presupuesto municipal/escolar, no se puede financiar este año lectivo de forma presencial. Sin embargo, archivamos momentáneamente para reformularlo en formato virtual o gratuito mediante convenios provinciales para el 2027.'
      }
    ]
  }
];

export const initialVotes: Vote[] = [
  {
    id: 'vote-1',
    question: '¿Qué temática prefieren para la gran fiesta de la Estudiantina 2026? 🎪',
    options: [
      { id: 'opt-1-1', text: 'Retro 90s / 2000s (Indumentaria de época, clásicos musicales)', votes: 124 },
      { id: 'opt-1-2', text: 'Neon Glow (Luces ultravioletas, pinturas flúor y blanco)', votes: 145 },
      { id: 'opt-1-3', text: 'Universo Cósmico (Estrellas, galaxias, trajes espaciales/alien)', votes: 68 }
    ],
    totalVotes: 337,
    expiresAt: '2026-07-15T18:00:00-03:00',
    userVotedOptionId: null,
    active: true
  },
  {
    id: 'vote-2',
    question: '¿Qué género musical quieren que predomine en la radio de los recreos largos? 📻',
    options: [
      { id: 'opt-2-1', text: 'Rock Nacional y Pop Clásico Argentino', votes: 105 },
      { id: 'opt-2-2', text: 'Cuarteto Cordobés, RKT y Cumbia', votes: 182 },
      { id: 'opt-2-3', text: 'Indie, Trap & Pop Internacional', votes: 154 }
    ],
    totalVotes: 441,
    expiresAt: '2026-07-08T13:00:00-03:00',
    userVotedOptionId: null,
    active: true
  },
  {
    id: 'vote-3',
    question: '¿Qué día de la semana prefieren habilitar el buffet saludable alternativo? 🍎',
    options: [
      { id: 'opt-3-1', text: 'Martes de frutas, ensaladas de fruta y gelatinas', votes: 232 },
      { id: 'opt-3-2', text: 'Jueves de sándwiches integrales, barras de cereal y frutos secos', votes: 120 }
    ],
    totalVotes: 352,
    expiresAt: '2026-06-20T18:00:00-03:00',
    userVotedOptionId: 'opt-3-1', // User voted in this closed one
    active: false
  },
  {
    id: 'vote-4',
    question: '¿Sumamos talleres de Educación Financiera y armado de CV en horas libres? 💼',
    options: [
      { id: 'opt-4-1', text: 'Sí, es súper clave e importante para salir al mundo laboral', votes: 298 },
      { id: 'opt-4-2', text: 'Prefiero usar las horas libres para descansar o adelantar tareas', votes: 42 }
    ],
    totalVotes: 340,
    expiresAt: '2026-06-10T18:00:00-03:00',
    userVotedOptionId: 'opt-4-1',
    active: false
  }
];

export const initialBono: BonoInfo = {
  totalRaised: 415000,
  goal: 650000,
  drawDate: '2026-08-14T20:00:00-03:00',
  prizes: [
    {
      id: 'prize-1',
      title: '1° Premio: Smart TV 43" Full HD BGH',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=300',
      description: 'El premio mayor para que disfrutes con tus amigos de las mejores series, películas o partidos en alta definición.'
    },
    {
      id: 'prize-2',
      title: '2° Premio: Auriculares Inalámbricos JBL Tune',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300',
      description: 'Gran sonido envolvente Pure Bass con conexión Bluetooth y batería de larga duración de hasta 40 horas.'
    },
    {
      id: 'prize-3',
      title: '3° Premio: Combo Matero de Acero + Mochila Deportiva',
      image: 'https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&q=80&w=300',
      description: 'Un termo de acero inoxidable clásico doble pared de 1 litro junto a una excelente mochila ergonómica.'
    },
    {
      id: 'prize-4',
      title: '4° Premio: Parlante Bluetooth Portátil Resistente al Agua',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=300',
      description: 'Llevá tu música preferida a todos los asados, juntadas y recreos con gran potencia y resistencia total al agua.'
    }
  ],
  courseSales: [
    { course: '6to Año A Naturales', sales: 98000 },
    { course: '5to Año B Economía', sales: 85000 },
    { course: '6to Año B Sociales', sales: 72000 },
    { course: '4to Año A Sociales', sales: 54000 },
    { course: '5to Año A Comunicación', sales: 49000 },
    { course: '4to Año B Economía', sales: 32000 },
    { course: 'Otros cursos combinados', sales: 25000 }
  ]
};

export const initialDocs: DocItem[] = [
  {
    id: 'doc-1',
    title: 'Estatuto del Centro de Estudiantes Boomerang.pdf',
    fileType: 'PDF',
    size: '1.4 MB',
    date: '12 de Abril, 2026'
  },
  {
    id: 'doc-2',
    title: 'Balance General Semestral Jun2026 - Finanzas CEC.pdf',
    fileType: 'PDF',
    size: '890 KB',
    date: '25 de Junio, 2026'
  },
  {
    id: 'doc-3',
    title: 'Reglamento y Código de Conducta Torneos IJA.pdf',
    fileType: 'PDF',
    size: '512 KB',
    date: '22 de Junio, 2026'
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'event-1',
    title: 'Torneo Fútsal - Fecha 1 Intercursos',
    date: '03 de Julio, 2026',
    time: '14:30 hs',
    location: 'Playón Deportivo Escolar',
    description: 'Comienzo de la fase de grupos clasificatoria. ¡Vení a alentar a tu división!'
  },
  {
    id: 'event-2',
    title: 'Asamblea Mensual de Delegados de Aula',
    date: '07 de Julio, 2026',
    time: '10:15 hs (Hora libre/Recreo largo)',
    location: 'Salón de Actos (Planta Baja)',
    description: 'Tratamiento de nuevas propuestas estudiantiles y rendición del estado del bono contribución.'
  },
  {
    id: 'event-3',
    title: 'Charla-Taller de Orientación Vocacional',
    date: '10 de Julio, 2026',
    time: '09:00 hs',
    location: 'Gimnasio del Colegio',
    description: 'Destinado a estudiantes de 5to y 6to año. Invitados de la UNC, UTN y UCC expondrán sobre carreras universitarias.'
  }
];

export const initialTeam: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Bautista Rossi',
    role: 'Presidente (6to Nat)',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'team-2',
    name: 'Martina Fernández',
    role: 'Vicepresidenta (6to Soc)',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'team-3',
    name: 'Thiago Benítez',
    role: 'Secretario General (5to Eco)',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'team-4',
    name: 'Valentina Sosa',
    role: 'Tesorera (5to Arte)',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'team-5',
    name: 'Benjamín Castro',
    role: 'Vocal de Deportes & Recreación (4to Soc)',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

// Custom simulated responses for "Asistente Boomerang"
export const assistantReplies: { keywords: string[]; text: string }[] = [
  {
    keywords: ['bono', 'contribucion', 'rifa', 'premio', 'sorteo'],
    text: '¡Hola! El Bono Contribución es la rifa que organizamos para comprar un sistema de sonido profesional para los actos y los recreos. Vale $1.000 por número. Se sortea el 14 de Agosto y el primer premio es un Smart TV de 43". Podés pedirle números a cualquier delegado de tu curso.'
  },
  {
    keywords: ['propuesta', 'sugerencia', 'idea', 'presentar', 'proyecto'],
    text: '¡Qué bueno que tengas ideas! Podés subir tu propuesta desde la sección "Propuestas" tocando el botón rojo (+). Ingresá el título, tu curso y la descripción. El Centro de Estudiantes la revisará, la pondrá en estado "En análisis" y la presentará ante los directivos si es viable.'
  },
  {
    keywords: ['estudiantina', 'fiesta', 'septiembre', 'primavera'],
    text: '¡La Estudiantina 2026 se viene con todo! Será el lunes 21 de Septiembre. Estamos votando la temática oficial en la pestaña "Votaciones". El curso ganador se lleva la copa. ¡Asegurate de votar antes de la fecha límite!'
  },
  {
    keywords: ['torneo', 'futsal', 'futbol', 'voley', 'deporte', 'inscripcion'],
    text: 'Las planillas del Torneo de Fútsal están en preceptoría de cada nivel. Tenés tiempo hasta este viernes para entregarla completa con la firma de tu preceptor. ¡No te quedes afuera!'
  },
  {
    keywords: ['agua', 'caliente', 'termos', 'dispenser'],
    text: '¡Logramos resolverlo! Ya se colocó un dispenser doble frío/calor en el pasillo de la planta alta al lado del laboratorio de química. Cuidémoslo entre todos limpiando si gotea.'
  },
  {
    keywords: ['consejo', 'quienes son', 'nosotros', 'integrantes', 'comision'],
    text: 'El CEC Boomerang está conformado por Bautista Rossi (Presidente, 6to Nat), Martina Fernández (Vicepresidenta, 6to Soc), Thiago Benítez (Secretario General, 5to Eco), Valentina Sosa (Tesorera, 5to Arte) y Benjamín Castro (Deportes, 4to Soc). Podés encontrarlos en el buffet durante los recreos.'
  },
  {
    keywords: ['recreo', 'recreos', 'tiempo', 'minutos'],
    text: '¡Logramos extender el recreo de la mañana de 15 a 20 minutos! Esto te da más tiempo para merendar, charlar o jugar al metegol. Por favor, sé puntual para volver al aula cuando suene el timbre.'
  },
  {
    keywords: ['hola', 'buen', 'como andas', 'ayuda'],
    text: '¡Hola! Soy el Asistente Virtual Boomerang 🪃. Estoy acá para responder tus consultas sobre el Centro de Estudiantes de IJA. Preguntame sobre el bono, las propuestas, los torneos o la Estudiantina.'
  }
];

export function getAssistantReply(userInput: string): string {
  const normalized = userInput.toLowerCase();
  for (const item of assistantReplies) {
    if (item.keywords.some(kw => normalized.includes(kw))) {
      return item.text;
    }
  }
  return 'No estoy seguro de entender tu consulta. Podés preguntarme sobre el bono contribución, cómo proponer proyectos, el torneo de fútsal o la temática de la Estudiantina. ¡Contamos con vos! 🪃';
}
