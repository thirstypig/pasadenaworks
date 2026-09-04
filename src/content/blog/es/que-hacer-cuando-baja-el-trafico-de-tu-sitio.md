---
title: "Qué hacer cuando baja el tráfico de tu página web"
description: "Una caída repentina de tráfico casi siempre tiene una de cinco causas. Este es el orden para encontrar la tuya rápido, antes de adivinar y gastar dinero arreglando lo que no era."
pubDate: 2026-11-02T00:00:00.000Z
pillar: search
targetKeyword: "bajó el tráfico de mi página web"
author: "Pasadena Works"
tags: ["seo", "google search console"]
heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
heroAlt: "La pantalla de una laptop mostrando gráficas de analítica en descenso"
heroCredit: "Luke Chesser"
draft: false
locale: es
translationKey: traffic-drop
slug: que-hacer-cuando-baja-el-trafico-de-tu-sitio
---

> **En corto** — Revise primero Google Search Console: acciones manuales, después si la caída abarca todo el sitio o se limita a páginas concretas, y después si coincide con algún cambio del sitio o con alguna actualización conocida de Google. La mayoría de las caídas de tráfico de un negocio pequeño se remontan a una de cinco causas, y usted normalmente puede determinar cuál en veinte minutos.

Su tráfico cayó y usted quiere saber si constituye una emergencia. La mayoría de las veces no lo constituye, aunque no lo sabrá hasta haber mirado en los lugares correctos y en el orden correcto. Adivinar desperdicia dinero, porque pagarle a alguien para que "arregle su SEO" antes de saber qué está roto es precisamente el modo en que los negocios pequeños incineran varios miles de dólares resolviendo el problema equivocado.

## Revise estas cosas, en este orden

**1. Search Console: primero las acciones manuales.** Entre a Google Search Console y vaya a Seguridad y acciones manuales. Si aparece allí una acción manual, ésa constituye su respuesta: algo del sitio contravino las directrices de Google — habitualmente enlaces de spam, contenido pobre o encubrimiento — y un revisor humano lo señaló. Esto resulta poco frecuente en el sitio de un negocio local pequeño, pero comprobarlo lleva cinco segundos y elimina de inmediato la causa más alarmante.

**2. ¿Abarca todo el sitio o se limita a páginas concretas?** Dentro del informe de Rendimiento de Search Console, examine los clics por página a lo largo de los tres meses precedentes. Si una o dos páginas se desplomaron mientras el resto se mantuvo estable, eso no constituye un problema de algoritmo sino algo específico de esas páginas: contenido desactualizado, una etiqueta de título que alguien modificó, o un competidor que acaba de publicar algo mejor sobre el tema idéntico. Si todas las páginas cayeron simultáneamente, eso indica algo mayor: una falla técnica o una actualización del algoritmo.

**3. ¿Cambió algo en el sitio inmediatamente antes de la caída?** Ésta es la causa más frecuente que encontramos y la más fácil de pasar por alto, porque suele tratarse de algo que parecía enteramente ajeno. Un rediseño que alteró las URLs sin redirecciones. Un "arreglo rápido" que dejó inadvertidamente una etiqueta `noindex` sobre una plantilla. Una edición del robots.txt que bloqueó más de lo pretendido. La actualización de un complemento. Una migración de alojamiento. Alinee la fecha de la caída contra el historial de cambios de su sitio — commits de git, historial de revisiones del CMS, o sencillamente lo que hayan tocado esa semana. Si coinciden, usted lo ha localizado, y el remedio suele ser mecánico: restaurar la redirección, retirar el bloqueo, revertir la etiqueta.

**4. Revise el Perfil de Negocio de Google, si la búsqueda local le importa.** Si una porción sustancial de su tráfico llega desde Google Maps o desde el paquete local, entre directamente a su Perfil de Negocio antes que confiar únicamente en Search Console. Las suspensiones se han vuelto más frecuentes durante 2026, porque la detección de spam de Google se ha vuelto más estricta, y circunstancias tan ordinarias como una ráfaga de ediciones rápidas a su horario, o un nombre que incorpore una palabra clave ("Plomería Jim - El Mejor Plomero de Pasadena"), pueden desencadenar una revisión automática. Si su perfil aparece suspendido o en revisión, eso por sí solo puede explicar una caída considerable, puesto que el tráfico de Maps frecuentemente supera al de la búsqueda orgánica en negocios de servicio local. La reinstalación exige documentación auténtica — un recibo de servicios o una licencia comercial que muestre su nombre y dirección — y ordinariamente requiere de una a tres semanas. No cree un perfil de reemplazo mientras espera, porque hacerlo sacrifica las reseñas y el historial adheridos al original.

**5. ¿Se trata de una actualización conocida de Google?** Google anuncia las actualizaciones centrales y confirma las fechas de despliegue en su [Panel de estado de la Búsqueda](https://status.search.google.com/summary). Si su caída comenzó en la fecha de un despliegue confirmado o inmediatamente después, y afectó a múltiples páginas antes que a una sola, ésa constituye su causa. Observe cuánto tardan realmente: la actualización central de mayo de 2026 se prolongó **once días y veintiuna horas**, y la actualización antispam de agosto de 2026 casi tres días. Los posicionamientos fluctúan sustancialmente durante toda esa ventana, de modo que una caída que aparece el segundo día de un despliegue todavía no constituye un resultado. La mala noticia honesta es que no existe remedio rápido alguno para una actualización central, porque representa a Google reponderando qué aspecto tiene el buen contenido, y la única respuesta genuina consiste en mejorar el contenido real de las páginas que cayeron — más específico, más útil, más evidentemente escrito por alguien que conoce el tema — antes que aplicar algún truco técnico. Conceda una semana completa tras la conclusión del despliegue antes de extraer conclusión alguna.

## Lo que probablemente no es la causa

A la estacionalidad se la culpa muchísimo y resulta genuina para ciertos negocios — jardinería, preparación de impuestos, comercio navideño — pero debería resultarle familiar. Recupere los meses equivalentes del año pasado en Google Analytics. Si el noviembre pasado se parecía a éste, el patrón es estacional y no merece que nadie entre en pánico. Si este noviembre no se parece en absoluto al anterior, no es estacional, y usted regresa a las cuatro causas anteriores.

Que un competidor le esté "robando" el posicionamiento tampoco suele ser la causa real, pese a constituir lo primero que la gente sospecha. Efectivamente alguien le superó, aunque no engañando a Google: publicó algo más exhaustivo, más rápido, o mejor ajustado a lo que el buscador realmente quería. El remedio ahí resulta idéntico al remedio para una actualización central — mejore la página, antes que optimizarla todavía más.

## Qué haríamos nosotros primero

Si usted nos telefoneara por una caída de tráfico, lo primero que solicitaríamos sería acceso a Search Console, antes que una descripción del problema. Veinte minutos dentro de esa herramienta le dicen considerablemente más que una hora de especulación. Si la respuesta resulta ser que su contenido necesita mejorar, ésa no es una respuesta agradable, y no es una que resuelva nadie que asegure poder devolverle a la primera página para el próximo martes. Se resuelve escribiendo algo genuinamente más útil que aquello que actualmente le está superando.
