---
title: 'HIPAA y el sitio web de su consultorio: dónde se tropieza la gente'
description: 'Un tribunal federal anuló en 2024 la lectura más agresiva de las reglas sobre píxeles de seguimiento. Eso cambió menos de lo que dicen los proveedores, y menos de lo que esperan los consultorios.'
pubDate: 2027-03-29T00:00:00.000Z
pillar: websites
targetKeyword: hipaa sitio web consultorio
author: Pasadena Works
tags:
  - salud
  - sitios web
draft: true
locale: es
translationKey: hipaa-website-traps
slug: hipaa-y-el-sitio-web-de-su-consultorio
---

> **En resumen** — En junio de 2024 un tribunal federal anuló la parte de la orientación gubernamental sobre seguimiento en línea que trataba una dirección IP más una visita a una página pública de salud como información protegida, al concluir que la agencia había actuado excediendo claramente su autoridad, y el gobierno retiró su apelación aquel agosto. El resto de la orientación se mantiene, todo lo que está detrás de un inicio de sesión de paciente nunca estuvo en discusión, y la Comisión Federal de Comercio aplica una regla de notificación de brechas que alcanza a organizaciones a las que HIPAA no llega. La respuesta práctica cambió poco: sepa qué envía su sitio a terceros.

Casi todo lo que un consultorio pequeño escucha sobre HIPAA y sitios web procede de alguien que vende o bien un remedio o bien un susto. Conviene separar aquello sobre lo que un tribunal efectivamente resolvió de aquello que sigue siendo un juicio de valor, porque ambas cosas se citan indistintamente y no son lo mismo.

## Qué decidió realmente el tribunal

En diciembre de 2022 la Oficina de Derechos Civiles publicó un boletín sobre tecnologías de seguimiento en línea, revisado en marzo de 2024, que adoptaba una visión expansiva de cuándo el seguimiento en el sitio de un hospital o un consultorio implica información de salud protegida.

La Asociación Estadounidense de Hospitales demandó. El 20 de junio de 2024 el Tribunal de Distrito de los Estados Unidos para el Distrito Norte de Texas anuló una porción específica de ese boletín: aquella que establecía que las obligaciones de HIPAA se activan cuando una tecnología en línea conecta la dirección IP de una persona con una visita a una página pública no autenticada referida a condiciones de salud o proveedores específicos. El tribunal sostuvo que la agencia había actuado excediendo claramente su autoridad bajo HIPAA al promulgarla. El 29 de agosto de 2024 el gobierno retiró su apelación, lo cual dejó la decisión firme.

Ese es un fallo más estrecho de lo que sugirieron los titulares, y conviene ser preciso sobre qué sobrevivió a él.

## Qué no cambió

La porción anulada se refería a páginas públicas no autenticadas: la parte ordinaria de un sitio, sin sesión iniciada, que cualquiera puede leer.

Todo lo que se encuentra detrás de un inicio de sesión de paciente constituye un asunto enteramente distinto y nunca fue objeto de esta disputa. Si un paciente entra en un portal, consulta resultados, solicita una renovación o escribe a un médico, la información generada allí es exactamente aquello para lo que se redactaron las reglas, y un script de seguimiento situado en esas páginas constituye un problema serio al margen de lo que un tribunal haya dicho sobre las páginas públicas.

El resto del boletín también se mantiene. La decisión anuló una proposición específica, no la posición general de la agencia según la cual las tecnologías de seguimiento pueden implicar información protegida cuando la transmiten a terceros.

## La regla que alcanza lo que HIPAA no alcanza

La trampa que más sorprende a la gente consiste en que HIPAA no es el único régimen en juego, y un consultorio puede quedar fuera de ella y estar aun así regulado.

La Comisión Federal de Comercio aplica una Regla de Notificación de Brechas de Salud que cubre a determinadas organizaciones que manejan información de salud sin ser entidades cubiertas por HIPAA. Aplicaciones de salud, servicios de bienestar y diversos productos de salud digital se han encontrado respondiendo ante ella. Para un consultorio médico el punto relevante resulta más estrecho pero real: "HIPAA no se aplica a esto" no constituye la misma afirmación que "ninguna regla se aplica a esto", y algunos proveedores hacen la primera afirmación mientras insinúan la segunda.

## Qué significa esto para el sitio de un consultorio corriente

La postura útil no es el pánico que se vendió en 2023 ni el alivio que siguió al fallo, sino una comprensión ordinaria de adónde van efectivamente sus datos.

Averigüe qué scripts de terceros carga su sitio, pregunta que su desarrollador puede responder en una tarde y que la mayoría de los consultorios nunca ha formulado. Analítica, un píxel publicitario, una ventana de chat, un módulo de reservas incrustado, un carrusel de reseñas, una herramienta de mapas de calor que alguien probó en 2021 y nunca retiró: cada uno de ellos envía algo a alguien, y el total suele resultar mayor de lo que nadie esperaba.

Después aplique una separación sencilla. Las páginas públicas que describen servicios, horarios e indicaciones constituyen la web ordinaria, y tras el fallo de 2024 la lectura agresiva que convertía la analítica rutinaria en esas páginas en un problema de HIPAA ya no se sostiene. Las páginas detrás de un inicio de sesión, y cualquier página cuya propia dirección revele una condición, merecen un enfoque bastante más conservador, lo cual en la práctica suele significar ningún seguimiento de terceros en absoluto.

## Los asuntos poco vistosos que causan las brechas reales

Los píxeles de seguimiento atraen la atención mientras fallos más mundanos causan más problemas.

Un formulario de contacto que envía mensajes de pacientes a una dirección personal constituye un hallazgo rutinario y una exposición genuina. También lo es un formulario de cita que pregunta el motivo de la consulta, lo cual convierte una consulta ordinaria en información clínica y la envía adondequiera que ese formulario envíe las cosas. También lo es un desarrollador que se marchó y conserva acceso administrativo al sitio, y un acuerdo firmado con cada proveedor que toca información de pacientes: el papeleo que nadie disfruta y por el que los auditores preguntan primero.

Nada de eso resulta emocionante, y es donde se sitúa el riesgo real para un consultorio de cinco personas.

## El resumen honesto

Este es un terreno donde el derecho se movió recientemente, donde el movimiento resultó más estrecho de lo que se informó, y donde cualquiera que le ofrezca certeza está exagerando.

Lo que se sostiene resulta poco notable: sepa qué envía su sitio y a quién, mantenga los scripts de terceros fuera de todo lo que esté tras un inicio de sesión, no recoja detalle clínico mediante un formulario de contacto general, y complete el papeleo con los proveedores. Nada de eso depende de cómo se resuelva el próximo caso, y precisamente por ello es la parte que merece hacerse ahora.

**Fuentes:** [American Hospital Association, Opinion & Order in American Hospital Association et al. v. Becerra et al. (en inglés)](https://www.aha.org/legal-documents/2024-06-29-opinion-order-american-hospital-association-et-al-v-xavier-becerra-et-al) · [Federal Trade Commission, Health Breach Notification Rule (en inglés)](https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule)
