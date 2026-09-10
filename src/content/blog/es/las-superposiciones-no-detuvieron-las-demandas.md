---
title: Las superposiciones de accesibilidad no detuvieron las demandas
description: 'Las demandas subieron un 27% en 2025 mientras crecía la adopción de superposiciones. La razón mecánica es más simple que el argumento: los fallos que dominan los datos no son de los que un script pueda decidir.'
pubDate: 2027-09-06T00:00:00.000Z
pillar: websites
targetKeyword: funcionan las superposiciones de accesibilidad
author: Pasadena Works
tags:
  - accesibilidad
  - sitios web
draft: false
locale: es
translationKey: overlays-did-not-work
slug: las-superposiciones-no-detuvieron-las-demandas
---

> **En resumen** — Las demandas federales por accesibilidad web subieron un 27% en 2025 mientras los productos de superposición se vendían con más fuerza que nunca, lo cual constituye correlación antes que prueba y merece advertirse igualmente. El argumento mecánico resulta más sólido: de los seis tipos de fallo que componen el 96% de todo lo que WebAIM detecta, varios no pueden resolverse mediante un script, porque exigen saber qué representa una imagen o qué hace un botón. Y el Departamento de Justicia no tiene norma alguna contra la cual pudiera certificarse nada.

Las superposiciones se venden sobre una promesa concreta —añada una línea de script y el problema de accesibilidad queda resuelto— y merece examinar esa promesa frente al registro publicado antes que frente al marketing de cualquiera de las dos partes.

## Qué muestran y qué no muestran las cifras

Los demandantes presentaron **3.117** demandas por accesibilidad web en tribunales federales en 2025, un 27% más que las 2.452 de 2024, durante un periodo en que los productos de superposición se comercializaron y adoptaron ampliamente.

Eso constituye correlación y no constituye prueba, y quien lo presente como prueba se está excediendo en la dirección contraria, y los volúmenes de demandas se mueven por muchos motivos —actividad de los despachos demandantes, resoluciones jurisdiccionales, mera moda— y atribuir el cambio a una única causa incurriría en el mismo error que cometen los proveedores de superposiciones.

El argumento más sólido no es estadístico, y es mecánico.

## Por qué un script no puede hacer casi nada de esto

El estudio de WebAIM de 2026 sobre un millón de portadas encontró seis tipos de fallo que suponen el **96%** de todos los errores detectados, y Tómelos en orden y pregunte qué podría hacer un script con cada uno.

**El texto de bajo contraste**, en el 83,9% de las páginas, constituye una decisión de diseño, y un script puede sobrescribir colores, y hacerlo o bien rompe el diseño o bien produce una variante que nadie eligió. No puede saber qué grises fueron deliberados.

**El texto alternativo ausente**, en el 53,1%, exige saber qué representa la imagen y por qué está en la página, y la descripción automatizada ha mejorado considerablemente y sigue sin poder saber que la fotografía es su escaparate antes que un edificio genérico, que es el contenido informativo entero.

**Las etiquetas de formulario ausentes**, en el 51%, exigen saber para qué sirve el campo, y un script puede adivinarlo del texto de marcador de posición cuando este existe, y cuando no existe, no tiene nada de lo que partir.

**Los enlaces y botones vacíos**, en el 46,3% y el 30,6%, son controles sin nombre accesible, y el nombre es precisamente aquello que nunca se anotó, y no hay ningún sitio de donde un script pueda leerlo.

**El idioma del documento ausente**, en el 13,5%, es el único elemento de la lista que un script genuinamente sí puede arreglar, y es el menos consecuente de los seis.

Ese es el caso entero, y cinco de los seis fallos que dominan los datos son *información* ausente, no *código* ausente, y añadir una capa por encima no suministra una información que nunca estuvo ahí.

## La afirmación sobre certificación, aparte

Parte del marketing de superposiciones insinúa un resultado de cumplimiento, y esa afirmación fracasa por motivos enteramente distintos.

El Departamento de Justicia declara que "no dispone de un reglamento que establezca normas detalladas" y que las empresas "pueden elegir actualmente cómo garantizarán" que su oferta en línea sea accesible, describiendo las WCAG como "orientación útil". No existe norma federal contra la cual un producto pudiera certificarle, de modo que un distintivo que afirme el cumplimiento constituye un artefacto de marketing al margen de lo que el producto subyacente haga.

## Para qué sirven realmente las superposiciones

Esto no argumenta que los productos no hagan nada, y pretender lo contrario sería la imagen especular de la exageración.

Ofrecen controles de preferencia para el usuario —tamaño de texto, espaciado, modos de contraste, una guía de lectura— y algunas personas genuinamente los emplean, y ofrecerlos constituye una pequeña cortesía. El error no consiste en tener uno; consiste en tratarlo como el trabajo antes que como un complemento a este.

## Qué hacer en su lugar, y qué cuesta

Arregle las seis cosas directamente, que es una semana de esfuerzo poco memorable antes que una suscripción.

El contraste son un puñado de valores de plantilla, y el texto alternativo lo escribe quien sabe qué son las imágenes, conforme se tocan las páginas. Las etiquetas de formulario son un cambio de marcado, y los enlaces y botones vacíos necesitan nombres tecleados una vez. El idioma del documento es un atributo.

Después conserve un registro fechado de lo hecho, y ese registro vale más que un distintivo si alguna vez llega algo, porque describe trabajo antes que afirmar un estatus que nadie está facultado para conferir.

**Fuentes:** [WebAIM, The WebAIM Million (informe de 2026, en inglés)](https://webaim.org/projects/million/) · [ADA.gov, Guidance on Web Accessibility and the ADA (en inglés)](https://www.ada.gov/resources/web-guidance/)
