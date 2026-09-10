---
title: ¿Por qué no aparece mi negocio cuando alguien le pregunta a ChatGPT?
description: 'Los clientes preguntan a los asistentes en lugar de buscar. El motivo por el que su negocio falta suele ser corriente, y la solución no es la que le están vendiendo.'
pubDate: 2027-01-18T00:00:00.000Z
pillar: search
targetKeyword: mi negocio no aparece en busquedas con ia
author: Pasadena Works
tags:
  - busqueda con ia
  - seo local
draft: true
locale: es
translationKey: chatgpt-business-visibility
slug: por-que-chatgpt-no-encuentra-su-negocio
---

> **En resumen** — Los asistentes no guardan un directorio de negocios que puedan ordenar. Leen la web en vivo cuando alguien pregunta, de modo que si sus páginas no están indexadas, o si a algún rastreador se le indicó que no entrara, sencillamente no hay nada que encontrar. Google afirma con claridad que aparecer en sus funciones de IA no exige archivos especiales, marcado adicional ni optimización alguna más allá de la visibilidad habitual en el buscador, y OpenAI documenta un rastreador concreto que determina si a usted se le puede citar. Casi todo lo que se vende como "optimización para IA" queda fuera de esos dos hechos.

Un cliente que antes habría escrito "tintorería cerca de mí" en Google ahora se lo pregunta a un asistente, y la respuesta nombra tres negocios a menos de dos kilómetros del suyo sin mencionarlo a usted. Descubrir eso inquieta de una manera particular, porque a diferencia de un resultado de búsqueda no existe una segunda página con la que consolarse, y la industria que se ha formado alrededor del problema durante los últimos dos años está más que dispuesta a explicárselo mediante una cuota mensual.

La explicación verdadera resulta casi siempre considerablemente más aburrida que el argumento comercial correspondiente, y precisamente por esa razón conviene exponerla con cierto detenimiento.

## Los asistentes leen, no clasifican

La mayoría de los dueños llega a este problema con un modelo mental heredado del buscador: en algún lugar existe una clasificación de tintorerías locales, y el trabajo consiste en subir posiciones. Ese modelo describió la búsqueda razonablemente bien durante veinte años, y por eso mismo confunde aquí.

Cuando alguien le pide una recomendación a un asistente, el asistente va y lee. Lanza sus propias búsquedas, recupera las páginas que obtiene y arma una respuesta con lo que encontró, citando por lo general las fuentes en las que más se apoyó. Nada sobre su negocio está guardado de antemano, y no hay una fila esperando a ser reordenada. Como cada respuesta se construye en el momento en que se pregunta, la pregunta útil no es en qué posición está usted, sino si existe algo sobre usted disponible para leer, y si las distintas versiones disponibles coinciden entre sí.

Esa distinción no es académica, porque determina qué vale la pena pagar. Nadie puede venderle una posición dentro de algo que no existe hasta que se formula la pregunta.

## La única configuración que puede dejarlo fuera por completo

Antes de considerar cualquier medida más elaborada, conviene descartar la única forma verdaderamente técnica de resultar invisible, porque es frecuente y además completamente silenciosa cuando ocurre.

OpenAI publica la lista de rastreadores que opera. El que importa aquí es `OAI-SearchBot`, que según las propias palabras de OpenAI "se utiliza para mostrar sitios web en los resultados de búsqueda de las funciones de búsqueda de ChatGPT" y, dicho con mayor crudeza, "los sitios que se hayan excluido de `OAI-SearchBot` no se mostrarán en las respuestas de búsqueda de ChatGPT". Un rastreador distinto, `GPTBot`, se usa para entrenar modelos, y ambas configuraciones son independientes entre sí: usted puede permitir uno y rechazar el otro.

No se trata en absoluto de un problema hipotético, sino de una consecuencia perfectamente documentada: numerosos sitios bloquearon todos los rastreadores asociados a la IA durante 2024 y 2025, cuando el consejo dominante era mantener el contenido propio fuera de los datos de entrenamiento, y buena parte de ellos lo hizo sin distinguir entre el rastreador que entrena un modelo y el que decide si se le puede citar ante un cliente. Si eso se hizo en su sitio, usted se excluyó de ser recomendado, y con toda probabilidad nunca recibió aviso alguno.

El archivo que controla todo esto es `robots.txt`, que reside en la raíz de su dominio y cualquiera puede leer: visite `sudominio.com/robots.txt` y observe qué dice realmente. Si el contenido no le resulta evidente, esa es una pregunta enteramente razonable para quien mantiene el sitio, y responderla debería tomarle menos de un minuto.

## Lo que dice Google, que no es lo que le están vendiendo

La documentación de Google sobre funciones de IA es inusualmente directa, y conviene citarla en lugar de parafrasearla, porque buena parte del marketing depende de que usted no la haya leído.

No existen, escribe Google, "requisitos adicionales para aparecer en las Vistas Generales de IA (AI Overviews) ni en el Modo IA, ni son necesarias otras optimizaciones especiales". Va más lejos y nombra aquello que usted no necesita: "no es necesario crear archivos legibles por máquina, archivos de texto para IA ni marcado para aparecer en estas funciones. Tampoco hay datos estructurados especiales de schema.org que deba añadir".

El requisito que Google sí impone es corriente, y además conocido: para ser elegible, una página "debe estar indexada y ser apta para mostrarse en la Búsqueda de Google con un fragmento", que es la misma vara que cualquier página ha tenido que superar durante casi una década.

Si le han cotizado una cifra mensual por un archivo específico para IA, una nueva capa de marcado o un contrato de "optimización para motores generativos", contrástelo con ese párrafo. Puede que la propuesta contenga trabajo útil —un sitio genuinamente difícil de rastrear, o datos del negocio que se contradicen entre sí a lo largo de la web, son problemas reales que vale la pena pagar por resolver—, pero son los problemas de siempre, y deberían cobrarse como tales.

## La corroboración pesa más que la redacción

Donde los asistentes sí ejercen algo parecido al juicio, este suele inclinarse a favor de las afirmaciones que más de una fuente independiente está dispuesta a respaldar, y en contra de las que solo usted hace sobre sí mismo.

Si su dirección es una cosa en su sitio web, otra en su Perfil de Negocio y una tercera en un directorio antiguo que sobrevivió al negocio que lo creó, una respuesta armada sobre la marcha tiene que elegir. Con frecuencia elige omitirlo a usted en lugar de afirmar algo que no puede resolver. Eso no constituye un castigo ni una penalización deliberada, sino sencillamente un sistema que se niega a especular cuando la información disponible resulta contradictoria.

El trabajo poco vistoso de lograr que su nombre, dirección, horario y teléfono sean idénticos en todos los lugares donde aparecen le servirá aquí más que cualquier redacción ingeniosa en su página principal, y tiene además la virtud de ser trabajo que usted mismo puede terminar en una tarde, razón por la cual, presumiblemente, nadie ha intentado vendérselo.

## Qué revisar esta semana

Empiece por su propio `robots.txt`, confirmando que nada en él bloquee a los rastreadores de búsqueda en general ni a `OAI-SearchBot` en particular. Después busque el nombre de su negocio en Google y determine si su sitio está indexado siquiera, dado que una página que Google no puede mostrar es una página que ningún asistente puede recuperar. Una vez resuelto eso, abra su Perfil de Negocio junto a la página de contacto de su sitio y reconcilie cada dato que difiera entre ambos, avanzando hacia los directorios que todavía conserven una versión antigua de usted. Por último, hágale a un asistente la pregunta que un cliente haría de verdad, y lea las fuentes que cita en lugar de solo la respuesta, porque esas citas le indican qué páginas están haciendo el trabajo y cuáles se están ignorando.

Nada de lo anterior constituye propiamente una estrategia, y nada de ello cuesta más que una tarde de trabajo dedicada exclusivamente a comprobaciones elementales. Es el piso poco vistoso bajo un tema que ha atraído una cantidad notable de ruido costoso, y la mayoría de los negocios ausentes de estas respuestas faltan por un motivo que figura en algún punto de esa lista.

**Fuentes:** [OpenAI, Descripción general de los rastreadores de OpenAI](https://developers.openai.com/api/docs/bots) · [Google Search Central, Funciones de IA y su sitio web](https://developers.google.com/search/docs/appearance/ai-features?hl=es-419)
