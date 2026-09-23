import type { CityCopy, CitySlug } from '../cities';

/*
 * Spanish twins of city-copy/en.ts. Every figure is the English figure, with a
 * period as the decimal mark (cities.test.ts compares them digit for digit),
 * and quantities the English writes as words stay words. Terms and agency
 * names are recorded, with their sources, in the "Spanish phrasing" section of
 * docs/superpowers/specs/2026-09-14-practice-city-pages-sources.md.
 */

const NPI = 'https://npiregistry.cms.hhs.gov/search';
const HCAI = 'https://data.chhs.ca.gov/dataset/healthcare-facility-locations';
/** Identical to en.ts: data.census.gov pinned to ACSDT5Y2024 and one place. */
const census = (fips: string) => `https://data.census.gov/table/ACSDT5Y2024.C16001?g=160XX00US${fips}`;

const npi = {
  label: 'Registro NPI de los CMS, profesionales individuales según la dirección de su lugar de consulta y su especialidad principal, consultado en septiembre de 2026',
  url: NPI,
};
const hcai = {
  label: 'HCAI, Departamento de Información y Acceso a la Atención Sanitaria de California, lista de centros de salud con licencia, consultada en septiembre de 2026',
  url: HCAI,
};
const acs = (fips: string) => ({
  label: 'Oficina del Censo de EE. UU., Encuesta sobre la Comunidad Estadounidense, estimaciones de cinco años de 2024, tabla C16001',
  url: census(fips),
});

export const copy: Partial<Record<CitySlug, CityCopy>> = {
  pasadena: {
    title: 'Más pacientes para consultorios médicos y dentales en Pasadena',
    summary:
      'Pasadena es la única ciudad que cubrimos cuyo registro encabezan los médicos de atención primaria y no los dentistas, y en ella figuran más optometristas que en cualquiera de las otras nueve.',
    body: [
      'Si usted dirige un consultorio de medicina familiar o de medicina interna en Pasadena, sus vecinos más cercanos son, en su mayoría, consultorios exactamente como el suyo. Esta es la única ciudad que cubrimos donde los médicos de atención primaria registrados superan en número a los dentistas: con datos de septiembre de 2026, el Registro NPI federal incluye a 227 de ellos frente a 213 dentistas y 93 optometristas, contando a cada profesional por separado y no a los consultorios. En conjunto, esos 533 profesionales sitúan a Pasadena en segundo lugar, solo por detrás de Glendale, en la suma de las tres especialidades. Cuando los consultorios que lo rodean son del mismo tipo que el suyo, las diferencias que quedan son las que usted controla: si sus fichas son exactas, si sus formularios están en el idioma que lee el paciente y si alguien contesta el teléfono.',
      'Los registros de licencias de California, a cargo de la agencia estatal HCAI, identifican un único hospital general de cuidados agudos dentro de la ciudad: Huntington Hospital. Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, que elabora la Oficina del Censo, el 24.2% de los residentes de Pasadena de cinco años o más habla español en casa y el 5.5% habla chino. Casi uno de cada cuatro residentes es una proporción demasiado grande para atenderla con una única persona bilingüe en la recepción y un sitio web exclusivamente en inglés, de modo que los formularios de admisión, los recordatorios de citas y la página que explica qué seguros acepta el consultorio deberían estar disponibles en español. La proporción de hablantes de chino es real, pero considerablemente menor. Dado que la tabla registra el idioma que se habla en casa y no la soltura con que alguien lee en inglés, sus propios expedientes clínicos, y no la cifra del conjunto de la ciudad, deberían decidir si una traducción al chino justifica su costo.',
      'El primer trabajo aquí no suele ser la publicidad, sino una recepción que funcione en dos idiomas. El servicio Digitalizar el consultorio coloca los formularios de admisión y de consentimiento en el propio teléfono de cada paciente, en español y en inglés, antes de su llegada, de modo que la traducción se hace una sola vez y no en la recepción cada mañana. Si usted dirige en cambio uno de los 213 consultorios dentales o de los 93 consultorios de optometría de la ciudad, o si el problema mayor resulta ser que nada en internet distingue a su consultorio de los vecinos, de eso se ocupa el servicio Conseguir más pacientes, y la Revisión integral del consultorio determinará cuál de los dos le cuesta más antes de que usted pague por cualquiera de ellos. Una agencia que cobra una cuota mensual por publicidad tiene pocos motivos para informarle de que el problema era un formulario de la recepción, y ese es el principal argumento para que lo revise alguien que no le está vendiendo la publicidad.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Pasadena, con formularios, recordatorios y páginas de seguros en español e inglés.',
    sources: [npi, hcai, acs('0656000')],
  },

  altadena: {
    title: 'Más pacientes para consultorios médicos y dentales en Altadena',
    summary:
      'Altadena todavía se está reconstruyendo tras el incendio Eaton de enero de 2025, así que esta página interpreta sus cifras del registro y del censo con esa cautela, y lo que señala es la reparación antes que el crecimiento.',
    body: [
      'Si usted dirige un consultorio dental en Altadena, es posible que sus pacientes, sus expedientes clínicos y su dirección hayan cambiado de lugar. El incendio Eaton, que comenzó en enero de 2025, destruyó 9,419 estructuras y causó la muerte de 19 civiles, según la página del incidente de CAL FIRE en su última actualización, de agosto de 2026. Los recuentos del registro que aparecen aquí, aunque se consultaron en septiembre de 2026, todavía pueden incluir direcciones de consultorios anotadas antes del incendio; con esa salvedad, el Registro NPI incluye a 14 dentistas, 1 optometrista y 1 médico de atención primaria con un lugar de consulta en Altadena.',
      'El HCAI de California no registra ningún hospital general de cuidados agudos en la propia Altadena; el hospital cercano es Huntington Hospital, en la vecina Pasadena. Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, que elabora la Oficina del Censo y cuyas respuestas se recogieron antes del incendio, indicaron que el 21.3% de los residentes de Altadena de cinco años o más hablaba español en casa y el 1.7% hablaba chino. Para diciembre de 2025, según el seguimiento de la reconstrucción que publica Catalyst California, solo 23 de casi 6,000 propiedades residenciales con daños significativos habían terminado de reconstruirse, y solo el 43% había solicitado o recibido un permiso de construcción. Esas proporciones de idioma quizá ya no describan a quienes viven allí hoy. Una conclusión resiste esa incertidumbre: el español corresponde a los formularios de admisión y al sitio web, mientras que una traducción al chino sería difícil de justificar con estas cifras.',
      'La ayuda que corresponde aquí es limitada, y una parte de ella no nos toca venderla. Un consultorio que perdió sus expedientes en papel se enfrenta a la lenta tarea de reconstruirlos; el servicio Digitalizar el consultorio escanea y organiza el papel que se haya conservado y configura un sistema EHR según la forma en que realmente trabajan los profesionales clínicos y el personal, para que los expedientes reconstruidos queden en un solo sistema y no en carpetas. Una ficha de Google, un sitio web o el directorio de una aseguradora que todavía muestra una dirección donde el consultorio ya no se encuentra envía a los pacientes al lugar equivocado, y corregir cada uno de ellos para que coincida con una ubicación temporal forma parte del servicio Conseguir más pacientes. Parte de este trabajo un consultorio puede hacerlo por su cuenta en una tarde, y cuando sea así, se lo diremos en lugar de cobrarle por ello.',
    ],
    meta: 'Ayuda para consultorios médicos, dentales y de optometría en Altadena: expedientes, fichas de Google con la dirección correcta y formularios en español.',
    sources: [
      npi,
      hcai,
      acs('0601290'),
      { label: 'CAL FIRE, página del incendio Eaton, actualizada por última vez en agosto de 2026', url: 'https://www.fire.ca.gov/incidents/2025/1/7/eaton-fire' },
      {
        label: 'Catalyst California, Red Tape to Recovery: Tracking Altadena Rebuilding After the Eaton Fire (cifras de diciembre de 2025)',
        url: 'https://www.catalystcalifornia.org/campaign-tools/publications/red-tape-to-recovery-tracking-altadena-rebuilding',
      },
    ],
  },

  'south-pasadena': {
    title: 'Más pacientes para consultorios médicos y dentales en South Pasadena',
    summary:
      'South Pasadena no tiene un hospital propio y su registro se inclina marcadamente hacia la odontología, de modo que aquí un consultorio crece sobre todo conservando a los pacientes que ya tiene.',
    body: [
      'Si usted dirige un consultorio dental en South Pasadena, es uno de los 45 dentistas que el Registro NPI incluyó aquí en septiembre de 2026, junto con 12 optometristas y 11 médicos de atención primaria, es decir, aproximadamente cuatro dentistas por cada médico generalista de la ciudad. Un mercado tan inclinado hacia una sola especialidad premia al consultorio que conserva lo que ya tiene, porque el consultorio que está a dos cuadras compite por las mismas citas de rutina y no por un tipo de visita distinto.',
      'El HCAI de California no registra ningún hospital general de cuidados agudos dentro de la ciudad. Los dos hospitales cercanos están ambos en ciudades colindantes: Alhambra Hospital Medical Center, en Alhambra, y Huntington Hospital, en Pasadena. Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 14.7% de los residentes de South Pasadena de cinco años o más habla chino en casa y el 11.6% habla español. Ninguna de las dos proporciones basta por sí sola para resolver la cuestión, y un consultorio que lo traduce todo a ambos idiomas puede gastar dinero en páginas que pocos de sus propios pacientes llegan a leer. La secuencia más defendible consiste en indicar en el Perfil de Negocio de Google y en el sitio web qué idiomas habla realmente el personal, y después traducir los formularios de admisión al idioma que la recepción oye solicitar con mayor frecuencia.',
      'Los dentistas representan 45 de los 68 profesionales que esta página contabiliza, así que lo que sigue está escrito sobre todo para ellos: el sillón que menos cuesta llenar es el de un paciente que ya figura en sus registros y tiene la visita atrasada. Por eso el servicio Conseguir más pacientes empieza con mensajes de recordatorio para los pacientes que se han atrasado, antes de gastar dinero en publicidad. Los recordatorios son de lo menos rentable que alguien le puede vender a un consultorio dental, y esa es más o menos la razón por la que suelen recomendarse al final; para nosotros son el punto de partida. Si usted no logra distinguir si el verdadero problema son los recordatorios, los teléfonos o la ficha de Google, la Revisión integral del consultorio primero los compara entre sí y los ordena por escrito.',
    ],
    meta: 'Más pacientes para consultorios dentales, médicos y de optometría en South Pasadena: recordatorios, formularios bilingües y fichas de Google exactas.',
    sources: [npi, hcai, acs('0673220')],
  },

  glendale: {
    title: 'Más pacientes para consultorios médicos y dentales en Glendale',
    summary:
      'Glendale tiene más dentistas y médicos de atención primaria registrados que cualquier otra ciudad que cubrimos, además de tres hospitales generales de cuidados agudos, de modo que lo difícil de ejercer aquí es destacar.',
    body: [
      'Si usted dirige un consultorio dental en Glendale, un paciente que busca dentista aquí elige entre 305 de ellos, la cifra más alta de las diez ciudades de este sitio; el Registro NPI añade 237 médicos de atención primaria y 66 optometristas que ejercen en la ciudad, con datos de septiembre de 2026. Una densidad así rara vez se anuncia como un solo mes malo, sino que aparece como un competidor que abre a unas cuadras, como un martes por la mañana que antes estaba lleno y como un consultorio fácil de pasar por alto porque nada en su ficha lo distingue de los demás.',
      'Glendale alberga además tres hospitales generales de cuidados agudos dentro de la ciudad, Adventist Health Glendale, USC Verdugo Hills Hospital y Glendale Memorial Hospital and Health Center, más que cualquier otra ciudad que cubrimos. Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, que elabora la Oficina del Censo, el 13.7% de los residentes de cinco años o más habla español en casa y el 0.9% habla chino. Con esa proporción, el español en los formularios de admisión, en los recordatorios y en la página que explica qué seguros acepta justifica su costo; en cambio, traducir el sitio al chino apoyándose en la segunda cifra sería difícil de defender, y así se lo diríamos.',
      'En una ciudad con tres hospitales y más de 600 dentistas, optometristas y médicos de atención primaria registrados, la cita que menos cuesta llenar le pertenece a un paciente que ya es suyo y tiene la visita atrasada, así que el servicio Conseguir más pacientes empieza por los recordatorios antes de que un solo dólar vaya a la publicidad, y solo después trabaja sobre la ficha, las reseñas y la página de seguros. Si las llamadas ya están entrando y la recepción las está perdiendo, el primer trabajo es en cambio Digitalizar el consultorio. La Revisión integral del consultorio resuelve por escrito cuál de los dos es, antes de que usted pague por cualquiera de ellos. En el mercado más saturado de este sitio, el consejo fácil es gastar más que el consultorio de la cuadra siguiente, y nosotros preferimos averiguar qué es lo que usted ya paga y no está recuperando.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Glendale: primero los recordatorios, luego la ficha, las reseñas y el español.',
    sources: [npi, hcai, acs('0630000')],
  },

  alhambra: {
    title: 'Más pacientes para consultorios médicos y dentales en Alhambra',
    summary:
      'Alhambra es la única ciudad que cubrimos donde más de una quinta parte de los residentes habla español en casa y aproximadamente una tercera parte habla chino. Eso pone tres idiomas en cada turno de la recepción.',
    body: [
      'Si usted dirige un consultorio dental en Alhambra, la hora más difícil de la semana probablemente ocurre en la recepción y no junto al sillón dental: los formularios de un paciente llegan en chino, los del siguiente en español, y una sola persona tiene que incorporar ambos al mismo expediente clínico. El Registro NPI incluye a 91 dentistas, 68 médicos de atención primaria y 16 optometristas con un lugar de consulta en Alhambra, según datos de septiembre de 2026, y la atención visual es la parte más escasa de ese recuento, con más de cinco dentistas por cada optometrista. La vecina Monterey Park tiene menos dentistas, pero registra 27 optometristas, de modo que un consultorio de optometría en Alhambra enfrenta menos competidores registrados dentro de su propia ciudad que uno en Monterey Park.',
      'El HCAI de California otorga licencia a un hospital general de cuidados agudos dentro de la ciudad, Alhambra Hospital Medical Center. Otros tres están cerca, en ciudades colindantes: San Gabriel Valley Medical Center, en San Gabriel, y tanto Garfield Medical Center como Monterey Park Hospital, en Monterey Park. Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 33.0% de los residentes de Alhambra de cinco años o más habla chino en casa y el 23.0% habla español. En conjunto, esos dos grupos representan más de la mitad de los residentes de la ciudad de cinco años o más, de manera que un consultorio que opera solo en inglés se dirige a una minoría de sus vecinos en el idioma que utilizan en casa. Los argumentos a favor de formularios de admisión en tres idiomas, un sitio web en tres idiomas y un Perfil de Negocio de Google que nombre cada idioma que habla el personal son aquí tan sólidos como en cualquier otro lugar donde trabajamos, aunque los formularios que los pacientes deben completar van antes que las páginas que solo consultan de pasada.',
      'Tres idiomas multiplican el trabajo en la recepción, y contratar a una tercera recepcionista no es la única manera de absorberlo. El servicio Digitalizar el consultorio configura formularios de admisión y de consentimiento que los pacientes completan en su propio teléfono, en inglés, español o chino, antes de llegar, lo que traslada la traducción fuera de la sala de espera y elimina buena parte de la transcripción manual. La Revisión integral del consultorio es el mejor primer paso para un consultorio que todavía no puede determinar si su problema de idiomas está en la recepción o en su sitio web, y responde esa pregunta por escrito. Ahorrarle a un consultorio el costo de un tercer sueldo vale más para él que cualquier cosa que nosotros pudiéramos facturarle con cargo a ese sueldo, y preferimos ser nosotros quienes se lo digamos.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Alhambra, donde los formularios, el sitio web y la ficha de Google necesitan tres idiomas.',
    sources: [npi, hcai, acs('0600884')],
  },

  arcadia: {
    title: 'Más pacientes para consultorios médicos y dentales en Arcadia',
    summary:
      'Arcadia combina una numerosa población de habla china con una de las proporciones más bajas de hablantes de español que presentamos, así que la pregunta para un consultorio no es si traducir, sino qué idioma hacer bien.',
    body: [
      'Si usted dirige un consultorio dental en Arcadia, la decisión que más cuesta equivocar es en qué idioma trabaja realmente su consultorio. El Registro NPI, consultado en septiembre de 2026, incluye a 144 dentistas, 100 médicos de atención primaria y 35 optometristas con un lugar de consulta en la ciudad, de modo que un residente puede comparar bastante más de un centenar de dentistas sin cruzar el límite municipal. Traducir a medias un consultorio al chino, con una página de destino aquí y un formulario allá, cuesta dinero de verdad y deja todo lo demás en inglés. Vale la pena decidir el idioma una sola vez y después sostenerlo en cada página, en cada formulario y en cada recordatorio.',
      'El HCAI de California otorga licencia allí a un hospital general de cuidados agudos, USC Arcadia Hospital, y otro, Monrovia Memorial Hospital, está justo al lado, en Monrovia. Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 37.6% de los residentes de Arcadia de cinco años o más habla chino en casa, frente a un 9.3% que habla español. Ese desequilibrio orienta a un consultorio hacia el chino antes que hacia el español, pero la tabla del censo no llega a la decisión que más importa para un sitio web, porque registra el idioma hablado y no dice nada sobre si un lector prefiere los caracteres tradicionales o los simplificados. Un consultorio debería resolver esa cuestión preguntando a sus propios pacientes en lugar de adivinar, ya que una página en la escritura que no le resulta familiar al lector parece descuidada precisamente a los ojos de las personas para quienes se escribió.',
      'Un idioma bien hecho vale más que dos mal hechos, y entre los 279 dentistas, optometristas y médicos de atención primaria registrados en la ciudad, una traducción a medio terminar es exactamente el detalle que se nota. El servicio Conseguir más pacientes construye el sitio web en inglés y en la escritura china que realmente usan sus pacientes, y completa el Perfil de Negocio de Google para que indique con claridad qué idiomas puede atender la recepción. Preferimos construir un idioma bien hecho a facturar dos, y la decisión sobre cuál les corresponde a sus pacientes y no a nosotros. Antes de todo eso, la Revisión integral del consultorio examina si esos pacientes ya están llamando y abandonan el intento en algún punto entre el buzón de voz y los formularios de admisión.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Arcadia: sitios web en la escritura china que leen sus pacientes y fichas de Google.',
    sources: [npi, hcai, acs('0602462')],
  },

  monrovia: {
    title: 'Más pacientes para consultorios médicos y dentales en Monrovia',
    summary:
      'Monrovia tiene la mayor proporción de hablantes de español de las diez ciudades que cubrimos y recuentos pequeños de profesionales registrados, de modo que aquí un consultorio compite por lo bien que responde y no por su tamaño.',
    body: [
      'Si usted dirige un consultorio dental en Monrovia, dirige un consultorio pequeño junto a un mercado mucho mayor. Con datos de septiembre de 2026, el Registro NPI incluye a 25 dentistas, 15 optometristas y 13 médicos de atención primaria con un lugar de consulta en Monrovia, mientras que la vecina Arcadia registra 144 dentistas y 100 médicos de atención primaria con la misma búsqueda. Un consultorio de este tamaño no puede gastar más que su vecina y tampoco lo necesita, porque la ventaja disponible aquí no es la escala, sino ser el consultorio que responde bien en español, un idioma que en Monrovia se habla en casa más que en cualquier otra ciudad que cubrimos.',
      'El HCAI de California otorga licencia a un hospital general de cuidados agudos en la ciudad, Monrovia Memorial Hospital, mientras que USC Arcadia Hospital se encuentra cerca, en Arcadia. Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 30.1% de los residentes de Monrovia de cinco años o más habla español en casa, la proporción más alta entre las ciudades que cubrimos, y el 6.7% habla chino. Cuando casi uno de cada tres residentes lo habla, el español no es una deferencia que un consultorio de esta ciudad pueda dejar en manos del empleado que casualmente sea bilingüe. Debe figurar en el menú de navegación del sitio web, en cada formulario de admisión y de consentimiento, y en la descripción del Perfil de Negocio de Google. La proporción de hablantes de chino justifica una línea que indique si alguien del personal lo habla, aunque es mucho más difícil justificar la traducción de todo un sitio web con ese mismo argumento.',
      'Por eso el servicio Conseguir más pacientes comienza con una ficha de Google y un sitio web que le digan en español, a quien llama en español, si el consultorio acepta su seguro y si está recibiendo pacientes nuevos, porque son las dos cosas que un consultorio puede responder antes de que suene el teléfono. Después vienen los mensajes de recordatorio en español, ya que es más fácil conservar una lista pequeña de pacientes que reemplazarla. Si usted sospecha que esas personas ya consiguen comunicarse con el consultorio y no dejan mensaje, la Revisión integral del consultorio es el punto de partida sensato, y escucha a la recepción antes de que nadie compre publicidad. A un consultorio de este tamaño suelen venderle un presupuesto de publicidad que no tiene forma realista de recuperar, y los dos pasos anteriores cuestan menos que un mes de ese presupuesto.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Monrovia, donde el español va en el sitio web, los formularios y la ficha de Google.',
    sources: [npi, hcai, acs('0648648')],
  },

  'san-marino': {
    title: 'Más pacientes para consultorios médicos y dentales en San Marino',
    summary:
      'San Marino registra la mayor proporción de hablantes de chino y la menor proporción de hablantes de español de las diez ciudades que cubrimos, carece de hospital dentro de sus límites municipales y tiene muy pocos profesionales clínicos dentro de ellos.',
    body: [
      'Si usted dirige un consultorio dental en San Marino, buena parte de lo que sus pacientes necesitan está en otra parte. Con datos de septiembre de 2026, el Registro NPI incluye a 18 dentistas, 17 médicos de atención primaria y solo 2 optometristas con un lugar de consulta en San Marino, frente a los 93 optometristas registrados en la vecina Pasadena, de modo que un residente que necesita un examen de la vista dispone de muchas más opciones al otro lado del límite municipal que dentro de él. Un consultorio de una ciudad tan pequeña rara vez le disputa pacientes al consultorio de la misma calle; el trabajo consiste en seguir siendo el consultorio al que esos pacientes vuelven cuando el resto de su atención tiene que ocurrir fuera de la ciudad.',
      'El HCAI de California no registra ningún hospital general de cuidados agudos en San Marino; los hospitales cercanos son San Gabriel Valley Medical Center, en San Gabriel, y Huntington Hospital, en Pasadena. Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 43.8% de los residentes de San Marino de cinco años o más habla chino en casa, la proporción más alta de todas las ciudades que cubrimos, mientras que solo el 3.2% habla español. A la luz de esas cifras, una versión en chino del sitio web y de los formularios de admisión es menos una cortesía que un segundo idioma de trabajo para el consultorio, en tanto que una traducción al español sería difícil de justificar solo con la población residente. Sin embargo, no todos los pacientes de un consultorio viven dentro de los límites de la ciudad, de modo que sus propios expedientes clínicos deberían decidir si se prescinde por completo del español.',
      'Con solo 37 dentistas, optometristas y médicos de atención primaria registrados en toda la ciudad, no hay un gran grupo de competidores locales a quienes quitarles pacientes, así que el crecimiento tiene que venir de los pacientes que usted ya tiene y de las ciudades de alrededor. El servicio Conseguir más pacientes se ocupa de ambos grupos. Envía mensajes de recordatorio a los pacientes que tienen una visita atrasada. También redacta el Perfil de Negocio de Google y el sitio web en inglés y en chino, para que un paciente que compara un consultorio de San Marino con otro de Pasadena o San Gabriel encuentre la misma información en cualquiera de los dos idiomas. No existe ninguna campaña competitiva que valga la pena montar contra un campo tan pequeño, y una consultoría que intentara venderle una estaría describiendo otra ciudad.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en San Marino: recordatorios, y sitios web y fichas de Google en inglés y chino.',
    sources: [npi, hcai, acs('0668224')],
  },

  'monterey-park': {
    title: 'Más pacientes para consultorios médicos y dentales en Monterey Park',
    summary:
      'Monterey Park alberga dos hospitales generales de cuidados agudos dentro de sus límites municipales y más de cuatro de cada diez de sus residentes hablan chino en casa, de modo que aquí un consultorio trabaja en un mercado bien abastecido y en más de un idioma hablado.',
    body: [
      'Si usted dirige un consultorio dental en Monterey Park, su competencia más cercana está inusualmente pareja. El Registro NPI incluye a 69 dentistas, 62 médicos de atención primaria y 27 optometristas con un lugar de consulta en la ciudad, según la consulta de septiembre de 2026, una distribución en la que los médicos casi igualan en número a los dentistas, algo poco común entre las ciudades de este sitio. El HCAI de California otorga licencia a Garfield Medical Center y a Monterey Park Hospital dentro de la ciudad, y un tercero, Alhambra Hospital Medical Center, está cerca, en Alhambra; entre las ciudades que cubrimos, solo Glendale cuenta con más dentro de sus propios límites. En una ciudad tan bien abastecida de profesionales clínicos, lo que un consultorio controla es con qué rapidez responde y en qué idioma.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 42.1% de los residentes de Monterey Park de cinco años o más habla chino en casa y el 16.4% habla español, la mayor proporción combinada de las diez ciudades de este sitio. La tabla del censo cuenta juntos a los hablantes de mandarín y de cantonés, y esa distinción importa más por teléfono que en papel: un formulario escrito en chino puede servir a los hablantes de cualquiera de los dos, pero un paciente que llama necesita a alguien que hable el idioma que él realmente usa. Por eso, un consultorio de esta ciudad debería indicar en su Perfil de Negocio de Google y en su sitio web exactamente qué idiomas hablados ofrece su personal, en lugar de afirmar de forma general que habla chino, algo que promete más de lo que la recepción puede cumplir.',
      'La Revisión integral del consultorio comienza con una conversación con el personal de recepción. En Monterey Park, esa conversación debería establecer qué idiomas hablados puede atender cada persona de la recepción, y en qué horario, porque un consultorio que solo es bilingüe hasta la hora del almuerzo pierde llamadas de las que nunca se entera. Una vez aclarado eso, el servicio Conseguir más pacientes hace que la ficha de Google y el sitio web describan con exactitud esa organización, y el servicio Digitalizar el consultorio puede enviar a cada paciente los recordatorios de citas y los formularios de admisión en el idioma escrito que prefiera. Nosotros trabajamos en inglés, y no vamos a fingir que la persona que lo asesora tenga que hablar ningún otro idioma. Lo que sí tiene que ser exacto es lo que afirma su propia ficha. Una línea matizada que prometa mandarín los días hábiles por la mañana le trae pacientes a los que de verdad puede atender, mientras que una promesa sin matices de hablar chino produce una llamada que termina mal.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Monterey Park: recepciones que hablan el idioma del paciente y fichas que lo dicen.',
    sources: [npi, hcai, acs('0648914')],
  },

  'san-gabriel': {
    title: 'Más pacientes para consultorios médicos y dentales en San Gabriel',
    summary:
      'Los residentes de San Gabriel hablan chino y español en casa en proporciones casi idénticas a las de Monterey Park, pero la ciudad tiene muchos más dentistas registrados y menos médicos de atención primaria, de modo que aquí la especialidad saturada es la odontología.',
    body: [
      'Si usted dirige un consultorio dental en San Gabriel, enfrenta más competencia registrada dentro de la ciudad que un médico de la misma calle. Con datos de septiembre de 2026, el Registro NPI incluye a 106 dentistas, 47 médicos de atención primaria y 31 optometristas con un lugar de consulta en San Gabriel, en comparación con 69 dentistas y 62 médicos de atención primaria en Monterey Park. Eso supone más del doble de consultorios dentales compitiendo entre sí que de consultorios de atención primaria, mientras que en Monterey Park ambas especialidades se encuentran prácticamente equilibradas. Por eso, lo que separa a un consultorio dental del siguiente cuenta más aquí que a una ciudad de distancia.',
      'El HCAI de California otorga licencia a un hospital general de cuidados agudos en la ciudad, San Gabriel Valley Medical Center, y Alhambra Hospital Medical Center está cerca, en Alhambra. Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 40.1% de los residentes de San Gabriel de cinco años o más habla chino en casa y el 15.1% habla español. Con semejante proporción, el chino debe ocupar un lugar central en la comunicación de un consultorio con sus pacientes, en vez de limitarse a una sola página traducida, lo cual implica que la explicación de los seguros aceptados, los formularios para pacientes nuevos y las respuestas a las reseñas deberían funcionar en chino. El español, que habla en casa más de uno de cada siete residentes, justifica al menos un formulario de admisión traducido y una indicación explícita en el Perfil de Negocio de Google de si alguien en la recepción lo habla.',
      'Entre 106 dentistas registrados, un historial constante de reseñas recientes, tanto en chino como en inglés, es lento de construir y difícil de falsificar, y eso es justamente lo que hace que valga la pena construirlo. El servicio Conseguir más pacientes establece un procedimiento de solicitud de reseñas que llega a cada paciente después de cada cita, nunca solo a los satisfechos, y redacta respuestas que no revelan nada acerca de si el autor de la reseña es paciente del consultorio. Las reseñas son lo más lento que hacemos y lo más sencillo de falsificar, y precisamente por eso a los consultorios que las compran terminan descubriéndolos; la versión lenta es la única que vale la pena tener. Si las reseñas ya son sólidas y la agenda de citas continúa sin llenarse, la Revisión integral del consultorio buscará la fuga en otra parte.',
    ],
    meta: 'Más pacientes para consultorios dentales, médicos y de optometría en San Gabriel: solicitudes de reseñas y respuestas en chino e inglés, y fichas de Google.',
    sources: [npi, hcai, acs('0667042')],
  },
};
