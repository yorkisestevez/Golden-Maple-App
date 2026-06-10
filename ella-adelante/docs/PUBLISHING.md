# Guía de publicación · Publishing Guide

**Ella Adelante** — para publicar sin tocar código.
**Ella Adelante** — publish without touching code.

> Esta guía es para ti aunque nunca hayas programado.
> This guide is for you even if you've never written a line of code.

---

## 🇩🇴 Español

### 1. Entrar al panel

1. Abre **tu-sitio.netlify.app/admin** en el navegador (mejor desde la
   computadora la primera vez).
2. Haz clic en **Iniciar sesión / Login with Netlify Identity**.
3. La primera vez, usa el enlace que te llegó por correo para crear tu
   contraseña. Después entras siempre con tu correo y contraseña.

> ¿No te llegó la invitación? Pídele a quien administra el sitio que te
> invite desde Netlify → **Identity → Invite users**.

### 2. Crear un artículo nuevo

1. En el panel, entra a **Artículos / Posts**.
2. Haz clic en **New Artículo / Post** (arriba a la derecha).
3. Llena los campos:

   | Campo                 | Qué poner                                                        |
   | --------------------- | ---------------------------------------------------------------- |
   | **Título**            | El titular. Claro y con gancho.                                  |
   | **Idioma**            | Español, English o Bilingüe. El artículo vive en ese idioma.     |
   | **Sección**           | Historias, Dinero, Voz o Herramientas.                           |
   | **Fecha**             | El día que quieres que aparezca publicado.                       |
   | **Autora**            | Tu nombre o el de quien escribe.                                 |
   | **Resumen**           | 1–2 frases. Es lo que se ve en las tarjetas y en redes.          |
   | **Imagen principal**  | Sube una foto horizontal (mínimo 1200px de ancho).               |
   | **Texto alternativo** | Describe la foto en pocas palabras (para accesibilidad).         |
   | **Destacado**         | Actívalo solo si quieres que sea la historia grande de la home.  |
   | **Contenido de muestra** | Déjalo **apagado** en tus posts reales.                       |
   | **Cuerpo**            | Aquí escribes el artículo. Usa la barra para negritas, títulos, listas y citas. |

4. Para una **cita destacada** (esas frases grandes en color teal), usa el
   botón de **cita / quote** en la barra de formato del cuerpo.

### 3. Guardar, revisar y publicar

El sitio usa un flujo editorial de tres pasos. Arriba verás el estado del
artículo y lo puedes mover:

1. **Borrador (Draft)** — lo estás escribiendo. Nadie lo ve.
2. **En revisión (In review)** — listo para que alguien lo lea.
3. **Listo (Ready)** — aprobado.

Cuando esté listo, haz clic en **Publish → Publish now**. En uno o dos
minutos el artículo aparece solo en el sitio. No hay que hacer nada más.

### 4. Editar o borrar algo publicado

1. Entra a **Artículos / Posts** y haz clic en el que quieres cambiar.
2. Edita lo que necesites y vuelve a **Publish**.
3. Para borrar: abre el artículo y usa **Delete** (abajo). El cambio se
   publica solo.

### 5. Consejos rápidos

- **Una foto buena cambia todo.** Horizontal, con buena luz, mínimo 1200px.
- **El resumen es tu anzuelo.** Es lo que la gente lee antes de hacer clic.
- **Bilingüe** = el cuerpo lleva las dos versiones (primero español, luego
  inglés). Mira el post de muestra "Tu plan de 90 días" como ejemplo.
- **No borres los posts de muestra hasta tener los tuyos.** Cuando publiques
  los reales, ábrelos y bórralos uno por uno.

---

## 🇺🇸 English

### 1. Log in

1. Open **your-site.netlify.app/admin** in your browser (use a computer the
   first time).
2. Click **Login with Netlify Identity**.
3. The first time, use the link from your invitation email to set a password.
   After that, you log in with your email and password.

> No invite email? Ask the site admin to invite you from Netlify →
> **Identity → Invite users**.

### 2. Create a new article

1. In the panel, go to **Artículos / Posts**.
2. Click **New Artículo / Post** (top right).
3. Fill in the fields:

   | Field              | What to write                                                 |
   | ------------------ | ------------------------------------------------------------- |
   | **Title**          | The headline. Clear and with a hook.                          |
   | **Language**       | Spanish, English, or Bilingual. The post lives in that language. |
   | **Section**        | Stories, Money, Voice, or Tools.                              |
   | **Date**           | The day it should appear as published.                        |
   | **Author**         | Your name or the writer's.                                    |
   | **Excerpt**        | 1–2 sentences. Shown on cards and in social shares.           |
   | **Hero image**     | Upload a horizontal photo (at least 1200px wide).             |
   | **Image alt text** | Describe the photo briefly (for accessibility).              |
   | **Featured**       | Turn on only if it should be the big story on the home page.  |
   | **Sample content** | Leave **off** for your real posts.                            |
   | **Body**           | Write the article here. Use the toolbar for bold, headings, lists, and quotes. |

4. For a **pull quote** (those large teal phrases), use the **quote** button
   in the body toolbar.

### 3. Save, review, and publish

The site uses a three-step editorial flow. At the top you'll see the post's
status, which you can move along:

1. **Draft** — you're still writing. Nobody sees it.
2. **In review** — ready for someone to read.
3. **Ready** — approved.

When it's ready, click **Publish → Publish now**. In a minute or two the
article appears on the site on its own. Nothing else to do.

### 4. Edit or delete something published

1. Go to **Artículos / Posts** and click the one you want to change.
2. Edit what you need and click **Publish** again.
3. To delete: open the post and use **Delete** (at the bottom). The change
   publishes on its own.

### 5. Quick tips

- **A good photo changes everything.** Horizontal, well lit, at least 1200px.
- **The excerpt is your hook.** It's what people read before clicking.
- **Bilingual** = the body has both versions (Spanish first, then English).
  See the sample post "Your One-Page 90-Day Plan" as an example.
- **Don't delete the sample posts until you have your own.** Once your real
  posts are live, open each sample and delete it.

---

## Para quien administra (técnico) · For the admin (technical)

To enable publishing for the editor (one time), in Netlify:

1. **Identity → Enable Identity**
2. **Identity → Services → Git Gateway → Enable**
3. **Identity → Registration → Invite only**
4. **Identity → Invite users →** the editor's email

The editor accepts the email invite, sets a password, and uses `/admin`.
Uploaded images are committed to `ella-adelante/src/assets/heroes/` and
optimized automatically at build time.
