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

> **En corto** — Revisa primero Google Search Console: acciones manuales, luego si la caída es de todo el sitio o de páginas específicas, y luego si coincide con un cambio en el sitio o con una actualización conocida de Google. Casi todas las caídas de tráfico de negocios pequeños se deben a una de cinco cosas, y normalmente puedes saber cuál en veinte minutos.

Se te cayó el tráfico y quieres saber si es una emergencia. La mayoría de las veces no lo es, pero no lo vas a saber hasta que busques en los lugares correctos, en el orden correcto. Adivinar cuesta dinero: pagarle a alguien para que "arregle tu SEO" antes de saber qué está roto es la manera en que los negocios pequeños queman unos miles de dólares resolviendo el problema equivocado.

## Revisa esto, en este orden

**1. Search Console: acciones manuales primero.** Entra a Google Search Console y ve a Seguridad y acciones manuales. Si hay una acción manual listada, ahí está tu respuesta: algo del sitio violó las directrices de Google (normalmente enlaces basura, contenido pobre o cloaking) y un revisor humano lo marcó. Es raro en el sitio de un negocio local pequeño, pero la revisión toma cinco segundos y descarta de inmediato la causa más aterradora.

**2. ¿Es de todo el sitio o de páginas específicas?** En el informe de Rendimiento de Search Console, mira los clics por página en los últimos tres meses. Si una o dos páginas se desplomaron y el resto se mantuvo, eso no es un problema de algoritmo: es algo específico de esas páginas — contenido viejo, una etiqueta de título que alguien cambió, un competidor que acaba de publicar algo mejor sobre el mismo tema. Si todas las páginas cayeron al mismo tiempo, eso apunta a algo más grande: un problema técnico o una actualización del algoritmo.

**3. ¿Cambió algo en el sitio justo antes de la caída?** Esta es la causa más común que vemos y la más fácil de pasar por alto, porque muchas veces es algo que parecía no tener relación. Un rediseño que cambió las URLs sin redirecciones. Un "arreglo rápido" que dejó por accidente una etiqueta `noindex` en una plantilla. Una edición al robots.txt que bloqueó más de lo que se pretendía. La actualización de un plugin. Una migración de hosting. Alinea la fecha de la caída con el historial de cambios del sitio — commits de git, historial de revisiones del CMS, o simplemente "qué tocamos esa semana". Si coinciden, ya lo encontraste, y el arreglo suele ser mecánico: restaurar la redirección, quitar el bloqueo, revertir la etiqueta.

**4. Revisa el Perfil de Negocio de Google, si la búsqueda local te importa.** Si buena parte de tu tráfico viene de Google Maps o del bloque local, entra directamente a tu Perfil de Negocio, no solo a Search Console. Las suspensiones se han vuelto más comunes en 2026 — la detección de spam de Google está más estricta, y cosas tan normales como una ráfaga de ediciones rápidas a tus horarios, o un nombre que incluye una palabra clave ("Plomería de Jim - El Mejor Plomero de Pasadena"), pueden disparar una revisión automática. Si tu perfil aparece suspendido o en revisión, eso solo puede explicar una caída grande, porque para negocios de servicio local el tráfico de Maps a menudo pesa más que la búsqueda orgánica. La reinstalación requiere documentación real — un recibo de servicios o una licencia comercial con tu nombre y dirección — y normalmente toma de una a tres semanas. No crees un perfil nuevo mientras esperas: eso sacrifica las reseñas y el historial del anterior.

**5. ¿Es una actualización conocida de Google?** Google anuncia sus actualizaciones principales y confirma las fechas de despliegue en su Search Status Dashboard. Si tu caída empezó el día de un despliegue confirmado o justo después, y afectó a varias páginas en vez de una, ahí está tu causa. La mala noticia honesta: no hay arreglo rápido para una actualización principal. Es Google reevaluando cómo se ve el contenido "bueno", y la única respuesta real es mejorar el contenido de las páginas que cayeron — más específico, más útil, escrito con más claridad por alguien que sabe del tema — no un truco técnico. Espera una semana completa después de que termine el despliegue antes de sacar conclusiones; los rankings rebotan mientras una actualización se asienta.

## Lo que probablemente no es la causa

A la estacionalidad se le echa mucho la culpa, y es real para algunos negocios — jardinería, preparación de impuestos, comercio navideño — pero debería verse familiar. Abre los mismos meses del año pasado en Google Analytics. Si el noviembre pasado se veía igual, es estacional y no vale la pena entrar en pánico. Si este noviembre no se parece en nada al anterior, no es estacional, y regresas a las cuatro causas de arriba.

Que un competidor te "robó" el posicionamiento tampoco suele ser la causa real, aunque sea lo primero que la gente sospecha. Alguien sí te desplazó, pero no engañando a Google: publicó algo más completo, más rápido, o mejor ajustado a lo que la persona realmente estaba buscando. El arreglo ahí es el mismo que para una actualización principal: haz la página mejor, no más optimizada.

## Qué haríamos nosotros primero

Si nos llamaras por una caída de tráfico, lo primero que pediríamos sería acceso a Search Console, no una descripción del problema. Veinte minutos ahí adentro te dicen más que una hora de especulación. Si la respuesta resulta ser "tu contenido necesita ser mejor", esa no es una respuesta divertida, y no es de las que arregla alguien prometiendo regresarte a la primera página para el martes que viene. Se arregla escribiendo algo genuinamente más útil que lo que hoy te está ganando.
