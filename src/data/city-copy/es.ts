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
      'Pasadena es la única ciudad que cubrimos donde los médicos de atención primaria registrados superan en número a los dentistas, y cuenta con más optometristas que cualquiera de las nueve restantes.',
    body: [
      'Con datos de septiembre de 2026, el Registro NPI federal incluye a 227 médicos de atención primaria en medicina familiar o medicina interna, 213 dentistas y 93 optometristas con un lugar de consulta en Pasadena, contando a cada profesional por separado y no a los consultorios. En conjunto, esos 533 profesionales sitúan a Pasadena en segundo lugar entre las ciudades que cubrimos, solo por detrás de Glendale, en la suma de las tres especialidades. Los registros de licencias de California, a cargo de la agencia estatal HCAI, identifican un único hospital general de cuidados agudos dentro de la ciudad: Huntington Hospital.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, que elabora la Oficina del Censo, el 24.2% de los residentes de Pasadena de cinco años o más habla español en casa y el 5.5% habla chino. Casi uno de cada cuatro residentes es una proporción demasiado grande para atenderla con una única persona bilingüe en la recepción y un sitio web exclusivamente en inglés, de modo que los formularios de admisión, los recordatorios de citas y la página que explica qué seguros acepta el consultorio deberían estar disponibles en español. La proporción de hablantes de chino es real, pero considerablemente menor. Dado que la tabla registra el idioma que se habla en casa y no la soltura con que alguien lee en inglés, un consultorio de esta ciudad debería dejar que sus propios expedientes de pacientes, y no la cifra del conjunto de la ciudad, decidan si una traducción al chino justifica su costo.',
      'Por eso, para muchos consultorios de Pasadena el primer paso más útil no consiste en la publicidad, sino en una recepción que funcione en dos idiomas. El servicio Digitalizar el consultorio coloca los formularios de admisión y de consentimiento en el propio teléfono de cada paciente, en español y en inglés, antes de su llegada, de modo que la traducción se realiza una sola vez y no en la recepción cada mañana. Si el problema más difícil resulta ser destacar entre 213 dentistas o 93 optometristas, de eso se ocupa el servicio Conseguir más pacientes, y la Revisión integral del consultorio establecerá cuál de los dos problemas es mayor antes de que usted pague por cualquiera de ellos.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Pasadena, con formularios, recordatorios y páginas de seguros en español e inglés.',
    sources: [npi, hcai, acs('0656000')],
  },

  altadena: {
    title: 'Más pacientes para consultorios médicos y dentales en Altadena',
    summary:
      'La reconstrucción de Altadena tras el incendio Eaton de enero de 2025 todavía estaba lejos de terminar al cierre de ese año, y esta página interpreta las cifras del registro y del censo con eso presente.',
    body: [
      'El incendio Eaton, que comenzó en enero de 2025, destruyó 9,419 estructuras y causó la muerte de 19 civiles, según la página del incidente de CAL FIRE en su última actualización, de agosto de 2026. Las cifras del censo que aparecen en esta página se recopilaron antes del incendio, y los recuentos del registro, aunque se consultaron en septiembre de 2026, todavía pueden incluir direcciones de consultorios registradas antes de él. Con esa salvedad, el Registro NPI incluye a 14 dentistas, 1 optometrista y 1 médico de atención primaria con un lugar de consulta en Altadena. El HCAI de California no registra ningún hospital general de cuidados agudos en la propia Altadena; el hospital cercano es Huntington Hospital, en la vecina Pasadena.',
      'Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, que elabora la Oficina del Censo y cuyas respuestas se recogieron antes del incendio, indicaron que el 21.3% de los residentes de Altadena de cinco años o más hablaba español en casa y el 1.7% hablaba chino. Para diciembre de 2025, según el seguimiento de la reconstrucción que publica Catalyst California, solo 23 de casi 6,000 propiedades residenciales con daños significativos habían terminado de reconstruirse, y solo el 43% había solicitado o recibido un permiso de construcción, por lo que esas proporciones de idioma quizá ya no describan a quienes viven allí hoy. Aun así, la conclusión para un consultorio resiste esa incertidumbre: el español debe estar en los formularios de admisión y en el sitio web, mientras que una traducción al chino sería difícil de justificar con estas cifras.',
      'La ayuda que corresponde aquí es limitada y práctica. Un consultorio que perdió sus expedientes en papel se enfrenta a la lenta tarea de reconstruirlos; el servicio Digitalizar el consultorio escanea y organiza el papel que se haya conservado y configura un sistema EHR según la forma en que realmente trabajan los profesionales clínicos y el personal, para que los expedientes reconstruidos queden en un solo sistema y no en carpetas. Una ficha de Google, un sitio web o el directorio de una aseguradora que todavía muestra una dirección donde el consultorio ya no se encuentra envía a los pacientes al lugar equivocado, y corregir cada uno de ellos para que coincida con una ubicación temporal forma parte del servicio Conseguir más pacientes. Parte de este trabajo un consultorio puede hacerlo por su cuenta en una tarde, y cuando sea así, se lo diremos en lugar de cobrarle por ello.',
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
      'South Pasadena no tiene un hospital propio, y sus residentes hablan chino y español en casa en proporciones tan parecidas que las cifras por sí mismas no bastan para que un consultorio elija un solo idioma.',
    body: [
      'El Registro NPI, consultado en septiembre de 2026, incluye a 45 dentistas, 12 optometristas y 11 médicos de atención primaria con un lugar de consulta en South Pasadena, de modo que aquí los dentistas superan a los médicos generalistas en una proporción de aproximadamente cuatro a uno. El HCAI de California no registra ningún hospital general de cuidados agudos dentro de la ciudad. Los dos hospitales cercanos están ambos en ciudades colindantes: Alhambra Hospital Medical Center, en Alhambra, y Huntington Hospital, en Pasadena.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 14.7% de los residentes de South Pasadena de cinco años o más habla chino en casa y el 11.6% habla español. Ninguna de las dos proporciones basta por sí sola para resolver la cuestión, y un consultorio que lo traduce todo a ambos idiomas puede gastar dinero en páginas que pocos de sus propios pacientes llegan a leer. La secuencia más defendible consiste en indicar en el Perfil de Negocio de Google y en el sitio web qué idiomas habla realmente el personal, y posteriormente traducir los formularios de admisión al idioma que la recepción oye solicitar con mayor frecuencia.',
      'Los dentistas representan 45 de los 68 profesionales que esta página contabiliza en South Pasadena, así que este consejo está pensado sobre todo para los consultorios dentales, cuya cita más económica de llenar suele corresponder a un paciente que ya está atrasado con su limpieza. Por eso, el servicio Conseguir más pacientes empieza con mensajes de recordatorio para los pacientes que se han atrasado, antes de gastar dinero en publicidad. Si usted no sabe distinguir si el verdadero problema son los recordatorios, los teléfonos o la ficha de Google, la Revisión integral del consultorio primero los compara entre sí y los ordena por escrito.',
    ],
    meta: 'Más pacientes para consultorios dentales, médicos y de optometría en South Pasadena: recordatorios, formularios bilingües y fichas de Google exactas.',
    sources: [npi, hcai, acs('0673220')],
  },

  glendale: {
    title: 'Más pacientes para consultorios médicos y dentales en Glendale',
    summary:
      'Glendale tiene más dentistas y médicos de atención primaria registrados que cualquier otra ciudad que cubrimos, tres hospitales generales de cuidados agudos y la menor proporción de hablantes de chino de las diez.',
    body: [
      'Con datos de septiembre de 2026, el Registro NPI incluye a 305 dentistas, 237 médicos de atención primaria y 66 optometristas con un lugar de consulta en Glendale, las cifras más altas de dentistas y de médicos entre las ciudades de este sitio. El HCAI de California otorga licencia a tres hospitales generales de cuidados agudos distintos dentro de la ciudad: Adventist Health Glendale, USC Verdugo Hills Hospital y Glendale Memorial Hospital and Health Center. Un mercado tan denso le ofrece al paciente más opciones que cualquier otra ciudad que cubrimos, lo que también significa que es fácil pasar por alto un consultorio con una ficha incompleta.',
      'Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 13.7% de los residentes de Glendale de cinco años o más habla español en casa y el 0.9% habla chino. Traducir un sitio web al chino a partir de esa segunda cifra sería difícil de defender, y así se lo diríamos. El español es otro asunto, puesto que alcanza a más de uno de cada ocho residentes. Estos son los dos únicos idiomas que recoge esta página, por lo que un consultorio debería examinar sus propios registros de admisión para averiguar qué otros idiomas escucha su recepción en una semana habitual.',
      'En una ciudad con tres hospitales y más de 600 dentistas, optometristas y médicos de atención primaria registrados, un paciente que decide adónde acudir tiene varios consultorios para comparar, y la ficha que responde primero a las preguntas obvias suele ser la que recibe la llamada. El servicio Conseguir más pacientes empieza precisamente por esa ficha: un Perfil de Negocio de Google verificado, un perfil separado para cada médico cuando varios comparten consultorio, y Healthgrades, Zocdoc y los directorios de las aseguradoras corregidos para que coincidan con él. En cambio, un consultorio que ya aparece en un lugar destacado pero todavía tiene huecos sin cubrir en la agenda debería empezar por la Revisión integral del consultorio, porque la visibilidad, por mucha que sea, no arregla un teléfono que nadie contesta.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Glendale: fichas de Google, directorios corregidos y español donde importa.',
    sources: [npi, hcai, acs('0630000')],
  },

  alhambra: {
    title: 'Más pacientes para consultorios médicos y dentales en Alhambra',
    summary:
      'Alhambra es la única ciudad que cubrimos donde más de una quinta parte de los residentes habla español en casa y aproximadamente una tercera parte habla chino, lo que la convierte en un mercado de tres idiomas para cualquier consultorio.',
    body: [
      'El Registro NPI incluye a 91 dentistas, 68 médicos de atención primaria y 16 optometristas con un lugar de consulta en Alhambra, según datos de septiembre de 2026. El HCAI de California otorga licencia a un hospital general de cuidados agudos dentro de la ciudad, Alhambra Hospital Medical Center, y otros tres están cerca, en ciudades colindantes: San Gabriel Valley Medical Center, en San Gabriel, y tanto Garfield Medical Center como Monterey Park Hospital, en Monterey Park. La atención visual constituye la parte más escasa del recuento de Alhambra, que registra más de cinco dentistas por cada optometrista. La vecina Monterey Park tiene menos dentistas, pero registra 27 optometristas, de modo que un consultorio de optometría en Alhambra enfrenta menos competidores registrados dentro de su propia ciudad que uno en Monterey Park.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 33.0% de los residentes de Alhambra de cinco años o más habla chino en casa y el 23.0% habla español. En conjunto, esos dos grupos representan más de la mitad de los residentes de la ciudad de cinco años o más, de manera que un consultorio que opera solo en inglés se dirige a una minoría de sus vecinos en el idioma que utilizan en casa. Los argumentos a favor de formularios de admisión en tres idiomas, un sitio web en tres idiomas y un Perfil de Negocio de Google que nombre cada idioma que habla el personal son aquí tan sólidos como en cualquier otro lugar donde trabajamos. Aun así, un consultorio debería traducir los formularios que los pacientes deben completar antes que las páginas que solo consultan de pasada.',
      'Tres idiomas multiplican el trabajo en la recepción, donde los formularios de un paciente pueden llegar en chino y los del siguiente en español, y alguien tiene que incorporar ambos al mismo expediente. El servicio Digitalizar el consultorio configura formularios de admisión y de consentimiento que los pacientes completan en su propio teléfono, en inglés, español o chino, antes de llegar, lo que traslada la traducción fuera de la sala de espera y elimina buena parte de la transcripción manual. La Revisión integral del consultorio es el mejor primer paso para un consultorio que todavía no puede determinar si su problema de idiomas se encuentra en la recepción o en su sitio web.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Alhambra, donde los formularios, el sitio web y la ficha de Google necesitan tres idiomas.',
    sources: [npi, hcai, acs('0600884')],
  },

  arcadia: {
    title: 'Más pacientes para consultorios médicos y dentales en Arcadia',
    summary:
      'Arcadia combina una numerosa población de habla china con una de las proporciones más bajas de hablantes de español que presentamos, y cuenta con un hospital general de cuidados agudos propio.',
    body: [
      'Según el Registro NPI consultado en septiembre de 2026, Arcadia cuenta con 144 dentistas, 100 médicos de atención primaria y 35 optometristas con un lugar de consulta en la ciudad. El HCAI de California otorga licencia allí a un hospital general de cuidados agudos, USC Arcadia Hospital, y otro, Monrovia Memorial Hospital, está justo al lado, en Monrovia. Por eso, un paciente de Arcadia que busca un dentista puede comparar bastante más de un centenar sin salir de la ciudad.',
      'Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 37.6% de los residentes de Arcadia de cinco años o más habla chino en casa, frente a un 9.3% que habla español. Ese desequilibrio orienta a un consultorio hacia el chino antes que hacia el español, pero la tabla del censo no llega a la decisión que más importa para un sitio web, porque registra el idioma hablado y no dice nada sobre si un lector prefiere los caracteres tradicionales o los simplificados. Un consultorio debería resolver esa cuestión preguntando a sus propios pacientes en lugar de adivinar, ya que una página en la escritura que no le resulta familiar al lector parece descuidada precisamente a los ojos de las personas para quienes se escribió.',
      'Con 279 dentistas, optometristas y médicos de atención primaria registrados en la ciudad, un consultorio de Arcadia rara vez es el único que puede encontrar un paciente de habla china, y el consultorio cuya ficha y cuyos formularios responden en la escritura de ese paciente tiene ventaja sobre los que no lo hacen. El servicio Conseguir más pacientes construye el sitio web en inglés y en la escritura china que realmente usan sus pacientes, y completa el Perfil de Negocio de Google para que indique con claridad qué idiomas puede atender la recepción. Antes de todo eso, la Revisión integral del consultorio examina si esos pacientes ya están llamando y abandonan el intento en algún punto entre el buzón de voz y los formularios de admisión.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Arcadia: sitios web en la escritura china que leen sus pacientes y fichas de Google.',
    sources: [npi, hcai, acs('0602462')],
  },

  monrovia: {
    title: 'Más pacientes para consultorios médicos y dentales en Monrovia',
    summary:
      'Monrovia tiene la mayor proporción de hablantes de español de las diez ciudades que cubrimos, recuentos pequeños de dentistas, optometristas y médicos de atención primaria registrados, y un hospital general de cuidados agudos propio.',
    body: [
      'Con datos de septiembre de 2026, el Registro NPI incluye a 25 dentistas, 15 optometristas y 13 médicos de atención primaria con un lugar de consulta en Monrovia. La ciudad es un mercado pequeño situado junto a otro mucho mayor, puesto que la vecina Arcadia registra 144 dentistas y 100 médicos de atención primaria con la misma búsqueda. El HCAI de California otorga licencia a un hospital general de cuidados agudos en la ciudad, Monrovia Memorial Hospital, mientras que USC Arcadia Hospital se encuentra cerca, en Arcadia.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 30.1% de los residentes de Monrovia de cinco años o más habla español en casa, la proporción más alta entre las ciudades que cubrimos, y el 6.7% habla chino. Cuando casi uno de cada tres residentes lo habla, el español no es una deferencia que un consultorio de esta ciudad pueda dejar en manos del empleado que casualmente sea bilingüe. Debe figurar en el menú de navegación del sitio web, en cada formulario de admisión y de consentimiento, y en la descripción del Perfil de Negocio de Google. La proporción de hablantes de chino justifica una línea que indique si alguien del personal lo habla, aunque es mucho más difícil justificar la traducción de todo un sitio web con ese mismo argumento.',
      'Como el mercado mucho mayor de Arcadia está justo al otro lado del límite municipal, un paciente de Monrovia que no consigue respuesta en un consultorio tiene otras opciones a su alcance, así que lo que retiene a ese paciente es un motivo para quedarse y no la falta de alternativas. El motivo más probable es el que ya señalan las cifras de idioma: un consultorio que responde bien en español, en la ciudad con la mayor proporción de hablantes de español que cubrimos, tiene una ventaja que no depende de cuántos consultorios haya en la ciudad vecina. Por eso, el servicio Conseguir más pacientes comienza con una ficha de Google y un sitio web que le indiquen en español, a una persona hispanohablante que llama, si el consultorio acepta su seguro y si está recibiendo pacientes nuevos. Si sospecha que esas personas ya consiguen comunicarse con el consultorio y no dejan mensaje, la Revisión integral del consultorio es el punto de partida más sensato.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Monrovia, donde el español va en el sitio web, los formularios y la ficha de Google.',
    sources: [npi, hcai, acs('0648648')],
  },

  'san-marino': {
    title: 'Más pacientes para consultorios médicos y dentales en San Marino',
    summary:
      'San Marino registra la mayor proporción de hablantes de chino y la menor proporción de hablantes de español de las diez ciudades que cubrimos, y carece de hospitales dentro de sus límites municipales.',
    body: [
      'Con datos de septiembre de 2026, el Registro NPI incluye a 18 dentistas, 17 médicos de atención primaria y solo 2 optometristas con un lugar de consulta en San Marino, frente a los 93 optometristas registrados en la vecina Pasadena. El HCAI de California no registra ningún hospital general de cuidados agudos en San Marino; los hospitales cercanos son San Gabriel Valley Medical Center, en San Gabriel, y Huntington Hospital, en Pasadena. Dicho de otro modo, un residente que necesita un examen de la vista dispone de muchas más opciones al otro lado del límite municipal que dentro de su propia ciudad.',
      'Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 43.8% de los residentes de San Marino de cinco años o más habla chino en casa, la proporción más alta de todas las ciudades que cubrimos, mientras que solo el 3.2% habla español. A la luz de esas cifras, una versión en chino del sitio web y de los formularios de admisión es menos una cortesía que un segundo idioma de trabajo para el consultorio, en tanto que una traducción al español sería difícil de justificar solo con la población residente. Sin embargo, no todos los pacientes de un consultorio viven dentro de los límites de la ciudad, de modo que sus propios expedientes deberían decidir si se prescinde por completo del español.',
      'Con solo 37 dentistas, optometristas y médicos de atención primaria registrados en toda la ciudad, un consultorio de San Marino tiene pocos competidores locales a los que ganarles pacientes, así que su crecimiento está en los pacientes que ya tiene y en los que lo encuentran desde las ciudades circundantes. El servicio Conseguir más pacientes se ocupa de ambos grupos. Envía mensajes de recordatorio a los pacientes que tienen una visita atrasada, y redacta el Perfil de Negocio de Google y el sitio web en inglés y en chino, para que un paciente que compara los consultorios de San Marino con los de Pasadena o San Gabriel encuentre la misma información en cualquiera de los dos idiomas.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en San Marino: recordatorios, y sitios web y fichas de Google en inglés y chino.',
    sources: [npi, hcai, acs('0668224')],
  },

  'monterey-park': {
    title: 'Más pacientes para consultorios médicos y dentales en Monterey Park',
    summary:
      'Monterey Park alberga dos hospitales generales de cuidados agudos dentro de sus límites municipales, y más de cuatro de cada diez de sus residentes hablan chino en casa.',
    body: [
      'El Registro NPI, consultado en septiembre de 2026, incluye a 69 dentistas, 62 médicos de atención primaria y 27 optometristas con un lugar de consulta en Monterey Park, una distribución en la que los médicos prácticamente igualan en número a los dentistas. El HCAI de California otorga licencia a dos hospitales generales de cuidados agudos distintos dentro de la ciudad, Garfield Medical Center y Monterey Park Hospital, y un tercero, Alhambra Hospital Medical Center, está cerca, en Alhambra. Entre las ciudades que cubrimos, solo Glendale cuenta con más hospitales dentro de sus propios límites.',
      'Según las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense, el 42.1% de los residentes de Monterey Park de cinco años o más habla chino en casa y el 16.4% habla español, la mayor proporción combinada de las diez ciudades de este sitio. La tabla del censo cuenta juntos a los hablantes de mandarín y de cantonés, y esa distinción importa más por teléfono que en papel: un formulario escrito en chino puede servir a los hablantes de cualquiera de los dos, pero un paciente que llama necesita a alguien que hable el idioma que él realmente usa. Por eso, un consultorio de esta ciudad debería indicar en su Perfil de Negocio de Google y en su sitio web exactamente qué idiomas hablados ofrece su personal, en lugar de afirmar de forma general que habla chino, algo que promete más de lo que la recepción puede cumplir.',
      'La Revisión integral del consultorio comienza con una conversación con el personal de recepción. En Monterey Park, esa conversación debería establecer qué idiomas hablados puede atender cada persona de la recepción, y en qué horario, porque un consultorio que solo es bilingüe hasta la hora del almuerzo pierde llamadas de las que nunca se entera. Una vez aclarado eso, el servicio Conseguir más pacientes se asegura de que la ficha de Google y el sitio web describan con exactitud esa organización, y el servicio Digitalizar el consultorio puede enviar a cada paciente los recordatorios de citas y los formularios de admisión en el idioma escrito que prefiera.',
    ],
    meta: 'Más pacientes para consultorios médicos, dentales y de optometría en Monterey Park: recepciones que hablan el idioma del paciente y fichas que lo dicen.',
    sources: [npi, hcai, acs('0648914')],
  },

  'san-gabriel': {
    title: 'Más pacientes para consultorios médicos y dentales en San Gabriel',
    summary:
      'Los residentes de San Gabriel hablan chino y español en casa en proporciones casi idénticas a las de Monterey Park, pero San Gabriel cuenta con muchos más dentistas registrados que Monterey Park y con menos médicos de atención primaria.',
    body: [
      'Con datos de septiembre de 2026, el Registro NPI incluye a 106 dentistas, 47 médicos de atención primaria y 31 optometristas con un lugar de consulta en San Gabriel, en comparación con 69 dentistas y 62 médicos de atención primaria registrados en Monterey Park. El HCAI de California otorga licencia a un hospital general de cuidados agudos en la ciudad, San Gabriel Valley Medical Center, y Alhambra Hospital Medical Center está cerca, en Alhambra. Un consultorio dental de San Gabriel enfrenta más del doble de competidores registrados dentro de la ciudad que un consultorio de atención primaria, mientras que en Monterey Park ambas especialidades se encuentran prácticamente equilibradas.',
      'Las estimaciones de cinco años de 2024 de la Encuesta sobre la Comunidad Estadounidense indican que el 40.1% de los residentes de San Gabriel de cinco años o más habla chino en casa y el 15.1% habla español. Con semejante proporción, el chino debe ocupar un lugar central en la comunicación de un consultorio con sus pacientes, en vez de limitarse a una sola página traducida, lo cual implica que la explicación de los seguros aceptados, los formularios para pacientes nuevos y las respuestas a las reseñas deberían funcionar en chino. El español, que habla en casa más de uno de cada siete residentes, justifica al menos un formulario de admisión traducido y una indicación explícita en el Perfil de Negocio de Google de si alguien en la recepción lo habla.',
      'Con 106 dentistas registrados en la ciudad, un consultorio dental de San Gabriel rara vez es el único que encuentra un paciente potencial, y un historial constante de reseñas recientes, tanto en chino como en inglés, le proporciona a ese paciente una razón para llamar a este consultorio en lugar de a otro. El servicio Conseguir más pacientes establece un procedimiento de solicitud de reseñas que llega a cada paciente después de cada cita, nunca solo a los satisfechos, y redacta respuestas que no revelan nada acerca de si el autor de la reseña es paciente del consultorio. Si las reseñas ya son sólidas y la agenda de citas continúa sin llenarse, la Revisión integral del consultorio buscará la fuga en otra parte.',
    ],
    meta: 'Más pacientes para consultorios dentales, médicos y de optometría en San Gabriel: solicitudes de reseñas y respuestas en chino e inglés, y fichas de Google.',
    sources: [npi, hcai, acs('0667042')],
  },
};
