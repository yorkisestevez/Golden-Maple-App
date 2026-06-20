"""
Estevez Intelligence — Investor Brief (bilingual EN/ES, branded PDF).

A professional, investor-facing overview of the Estevez Intelligence thesis:
a venture studio building AI-leveraged, asset-light service businesses, with
Northbound Dispatch as the proof point. Every section is presented in English
and Spanish side by side.

Usage:
    python3 generate_investor_brief.py [output_path]
"""

import sys
import os
import datetime

from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    NextPageTemplate, KeepTogether, Table, TableStyle,
)

import brand
from brand import (
    PAGE, MARGIN, TOP_SPACE, BOTTOM_SPACE, styles, make_page_decorator,
    make_cover_decorator, section_heading, callout, stat_tiles, data_table,
    INDIGO, GOLD, CYAN, INK, INK_2, LINE, GREY,
)

DOC_LABEL = "Investor Brief"
FULL = PAGE[0] - 2 * MARGIN


# ----------------------------------------------------------------------------
# Bilingual two-column block (EN | ES) with a center divider
# ----------------------------------------------------------------------------
def bilingual(pairs, st, labels=False):
    gap = 0.34 * inch
    cw = (FULL - gap) / 2
    rows = []
    if labels:
        rows.append([
            Paragraph('<font color="#6C5CE7"><b>EN&nbsp;·&nbsp;ENGLISH</b></font>', st["label"]),
            "",
            Paragraph('<font color="#6C5CE7"><b>ES&nbsp;·&nbsp;ESPAÑOL</b></font>', st["label"]),
        ])
    for en, es in pairs:
        l = en if hasattr(en, "wrap") else Paragraph(en, st["body"])
        r = es if hasattr(es, "wrap") else Paragraph(es, st["body"])
        rows.append([l, "", r])
    t = Table(rows, colWidths=[cw, gap, cw])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("LINEBEFORE", (2, 0), (2, -1), 0.5, LINE),
        ("LEFTPADDING", (2, 0), (2, -1), 14),
    ]))
    return t


def heading_bi(en, es, num=None):
    """Section heading showing both languages: EN — ES."""
    return section_heading(f'{en} &nbsp;<font color="#F2B441">/</font>&nbsp; {es}', num=num)


def build(output_path):
    st = styles()
    today = datetime.date.today().strftime("%B %Y")

    cover_frame = Frame(MARGIN, BOTTOM_SPACE, FULL, 0.4 * inch, id="cover")
    interior_frame = Frame(MARGIN, BOTTOM_SPACE, FULL,
                           PAGE[1] - TOP_SPACE - BOTTOM_SPACE, id="main")

    doc = BaseDocTemplate(
        output_path, pagesize=PAGE,
        title="Estevez Intelligence — Investor Brief / Resumen para Inversionistas",
        author="Estevez Intelligence",
        subject="Investment opportunity overview (EN/ES)")

    cover_tmpl = PageTemplate(
        id="cover", frames=[cover_frame],
        onPage=make_cover_decorator(
            kicker="INVESTMENT OPPORTUNITY  ·  OPORTUNIDAD DE INVERSIÓN",
            title="Estevez<br/>Intelligence",
            subtitle="A venture studio building AI-leveraged, asset-light service "
                     "businesses.<br/><font color='#8C93A8'>Un estudio de "
                     "negocios que construye empresas de servicios asistidas por "
                     "IA, de bajo capital.</font>",
            meta_lines=[
                f"Investor Brief / Resumen para Inversionistas  ·  {today}",
                "Proof point / Caso de éxito: Northbound Dispatch",
                "Barrie, Ontario, Canada",
            ]))
    interior_tmpl = PageTemplate(
        id="main", frames=[interior_frame],
        onPage=make_page_decorator(DOC_LABEL))
    doc.addPageTemplates([cover_tmpl, interior_tmpl])

    s = []
    s.append(NextPageTemplate("main"))
    s.append(Spacer(1, 1))
    s.append(PageBreak())

    # ===================== EXECUTIVE SUMMARY =====================
    s.append(heading_bi("Executive Summary", "Resumen Ejecutivo", num="01"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "Estevez Intelligence builds businesses that <b>own the coordination layer "
        "of fragmented service industries, not the assets</b> — wrapped in an AI "
        "stack that lets one operator do the work of three. Our proof point, "
        "<b>Northbound Dispatch</b>, dispatches freight for truck owner-operators "
        "with near-zero capital and is cash-flow positive at the first customer.",
        "Estevez Intelligence construye empresas que <b>controlan la coordinación de "
        "industrias de servicios fragmentadas, sin poseer los activos</b> — "
        "potenciadas por una plataforma de IA que permite a un operador hacer el "
        "trabajo de tres. Nuestro caso de éxito, <b>Northbound Dispatch</b>, gestiona "
        "cargas para camioneros independientes con capital casi nulo y es rentable "
        "desde el primer cliente.",
    )], st, labels=True))
    s.append(Spacer(1, 10))
    s.append(stat_tiles([
        ("3x", "operator leverage vs. incumbents / apalancamiento del operador"),
        ("~$150/mo", "cost to launch a vertical / costo para lanzar"),
        ("2 lines", "services + productized AI / servicios + IA como producto"),
    ]))
    s.append(Spacer(1, 10))
    s.append(callout(
        "<b>The investment:</b> we are not betting on one company — we are funding a "
        "<b>repeatable method and a shared AI stack</b>, then pointing it at one "
        "fragmented industry after another.<br/>"
        "<b>La inversión:</b> no apostamos por una sola empresa — financiamos un "
        "<b>método repetible y una plataforma de IA compartida</b>, y la aplicamos a "
        "una industria fragmentada tras otra.", accent=GOLD, bg="#FFF8E9"))

    # ===================== THE OPPORTUNITY =====================
    s.append(heading_bi("The Opportunity", "La Oportunidad", num="02"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "Thousands of local service industries are large, fragmented, and still run "
        "on phone calls, spreadsheets, and memory. The <b>coordination work</b> — "
        "matching supply to demand, negotiating, scheduling, invoicing — is "
        "repetitive, rules-based, and ideal for AI. Whoever automates it captures "
        "the margin without owning the assets.",
        "Miles de industrias de servicios locales son grandes, fragmentadas y aún "
        "funcionan con llamadas, hojas de cálculo y memoria. El <b>trabajo de "
        "coordinación</b> — emparejar oferta y demanda, negociar, programar, "
        "facturar — es repetitivo, basado en reglas e ideal para la IA. Quien lo "
        "automatiza captura el margen sin poseer los activos.",
    )], st))
    s.append(Spacer(1, 6))
    s.append(callout(
        "<b>The pattern:</b> pick a fragmented, manual industry → enter asset-light → "
        "build the system of record → layer AI on the repetitive work → reach 3x "
        "operator leverage → productize the AI layer.<br/>"
        "<b>El patrón:</b> elegir una industria fragmentada y manual → entrar con bajo "
        "capital → construir el sistema de registro → automatizar con IA → alcanzar 3x "
        "de apalancamiento → convertir la IA en producto.", accent=INDIGO))

    # ===================== SOLUTION & MOAT =====================
    s.append(PageBreak())
    s.append(heading_bi("The Solution & The Moat", "La Solución y la Ventaja", num="03"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "Each business runs on a shared AI stack: a CRM system of record, workflow "
        "automations (onboarding, alerts, invoicing), an inbound voice agent, and a "
        "matching/scoring agent over live data feeds — all with human-in-the-loop "
        "approval. A traditional dispatcher manages 5–7 trucks; ours targets "
        "<b>15–20</b> at the same fee per truck.",
        "Cada empresa funciona sobre una plataforma de IA compartida: un CRM como "
        "sistema de registro, automatizaciones (alta de clientes, alertas, "
        "facturación), un agente de voz para llamadas entrantes y un agente que "
        "empareja y califica oportunidades sobre datos en vivo — con aprobación "
        "humana. Un despachador tradicional maneja 5–7 camiones; el nuestro apunta a "
        "<b>15–20</b> con la misma tarifa por camión.",
    )], st))
    s.append(Spacer(1, 6))
    s.append(bilingual([(
        "<b>The moat compounds.</b> Every month the AI layer takes more of the manual "
        "playbook, widening the cost-to-serve advantage — and the same stack is "
        "reused across every new vertical, so each one is cheaper than the last.",
        "<b>La ventaja se acumula.</b> Cada mes la IA asume más del trabajo manual, "
        "ampliando la ventaja en costos — y la misma plataforma se reutiliza en cada "
        "nuevo vertical, por lo que cada uno cuesta menos que el anterior.",
    )], st))

    # ===================== BUSINESS MODEL =====================
    s.append(heading_bi("Business Model", "Modelo de Negocio", num="04"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "Recurring, week-to-week fees on coordination — not margin on owned assets. "
        "Northbound charges <b>8% of gross load revenue</b> or <b>$200/week flat</b> "
        "per truck. A blended ~$300/truck/week ≈ <b>$1,290/truck/month</b>. A second "
        "revenue line emerges as the AI stack is productized and sold to others in "
        "each industry.",
        "Tarifas recurrentes, semana a semana, por la coordinación — no margen sobre "
        "activos propios. Northbound cobra <b>8% de los ingresos brutos</b> o "
        "<b>$200/semana fijo</b> por camión. Un promedio de ~$300/camión/semana ≈ "
        "<b>$1,290/camión/mes</b>. Una segunda línea de ingresos surge al convertir la "
        "plataforma de IA en producto para terceros de cada industria.",
    )], st))
    s.append(Spacer(1, 8))
    s.append(data_table(
        ["Active trucks / Camiones", "Monthly revenue / Ingreso mensual", "Annualized / Anualizado"],
        [
            ["5", "~$6,450", "~$77K"],
            ["10", "~$12,900", "~$155K"],
            ["15 (one operator / un operador)", "~$19,350", "~$232K"],
            ["25 (+ 2nd operator / 2º operador)", "~$32,250", "~$387K"],
        ],
        col_widths=[FULL * 0.40, FULL * 0.32, FULL * 0.28]))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        '<font color="#646B7C" size=7.5><i>Illustrative planning estimates (CAD). '
        'Estimaciones ilustrativas de planificación (CAD).</i></font>', st["body_sm"]))

    # ===================== TRACTION & PORTFOLIO =====================
    s.append(PageBreak())
    s.append(heading_bi("Traction & Portfolio", "Tracción y Portafolio", num="05"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "The method is already running across two verticals, proving the blueprint "
        "travels:",
        "El método ya opera en dos verticales, demostrando que el modelo se replica:",
    )], st))
    s.append(Spacer(1, 4))
    s.append(data_table(
        ["Venture / Empresa", "Vertical", "Status / Estado"],
        [
            ["<b>Northbound Dispatch</b>", "Truck dispatch / Despacho de camiones",
             "Live · brand, site, CRM, docs, automation roadmap built / En marcha"],
            ["<b>Golden Maple + estimate-ai</b>", "Home-services estimating / Cotización de servicios",
             "Live · AI instant-quote product deployed / En marcha"],
            ["<b>Shared AI stack</b>", "Voice agent · n8n · matching agents",
             "Reused across ventures / Reutilizada en todas las empresas"],
        ],
        col_widths=[1.85 * inch, 1.9 * inch, FULL - 1.85 * inch - 1.9 * inch]))
    s.append(Spacer(1, 8))
    s.append(callout(
        "Two ventures, one stack, one method — the core proof that Estevez "
        "Intelligence is a repeatable machine, not a single company.<br/>"
        "Dos empresas, una plataforma, un método — la prueba de que Estevez "
        "Intelligence es una máquina repetible, no una sola empresa.",
        accent=CYAN, bg="#E9FBFD"))

    # ===================== MARKET / REPLICATION =====================
    s.append(heading_bi("Market & Replication", "Mercado y Replicación", num="06"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "The method is industry-agnostic: any fragmented, manual, recurring service "
        "market is a candidate. Each is a multi-billion-dollar industry of small "
        "independent operators who need coordination.",
        "El método es agnóstico a la industria: cualquier mercado de servicios "
        "fragmentado, manual y recurrente es candidato. Cada uno es una industria "
        "multimillonaria de pequeños operadores independientes que necesitan "
        "coordinación.",
    )], st))
    s.append(Spacer(1, 4))
    s.append(data_table(
        ["Industry / Industria", "Asset NOT owned / Activo no poseído", "Unit scaled / Unidad"],
        [
            ["Truck dispatch / Despacho", "Trucks / Camiones", "Trucks per operator"],
            ["Home services / Servicios del hogar", "Crews / Cuadrillas", "Quotes per day"],
            ["Cleaning / Limpieza", "Cleaners / Personal", "Jobs per coordinator"],
            ["Last-mile courier / Mensajería", "Vehicles / Vehículos", "Deliveries per operator"],
            ["Equipment rental / Alquiler de equipo", "Equipment / Equipo", "Bookings per operator"],
        ],
        col_widths=[FULL * 0.40, FULL * 0.34, FULL * 0.26]))

    # ===================== FINANCIAL PROJECTIONS =====================
    s.append(PageBreak())
    s.append(heading_bi("Financial Projections", "Proyecciones Financieras", num="07"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "Illustrative three-year trajectory: scale Northbound, launch additional "
        "verticals on the shared stack, and begin productizing the AI layer. Margins "
        "expand as the stack absorbs more manual work.",
        "Trayectoria ilustrativa a tres años: escalar Northbound, lanzar verticales "
        "adicionales sobre la plataforma compartida y comenzar a comercializar la IA "
        "como producto. Los márgenes crecen a medida que la plataforma asume más "
        "trabajo manual.",
    )], st))
    s.append(Spacer(1, 8))
    s.append(data_table(
        ["Year / Año", "Verticals / Verticales", "Revenue / Ingresos", "Drivers / Impulsores"],
        [
            ["Year 1 / Año 1", "1–2", "~$230K", "Northbound to ~15 trucks / hasta ~15 camiones"],
            ["Year 2 / Año 2", "2–3", "~$600K", "2nd operator + new vertical / 2º operador + vertical"],
            ["Year 3 / Año 3", "3–4", "~$1.5M", "Productized AI + multi-vertical / IA como producto"],
        ],
        col_widths=[1.15 * inch, 1.0 * inch, 1.1 * inch, FULL - 1.15 * inch - 1.0 * inch - 1.1 * inch]))
    s.append(Spacer(1, 6))
    s.append(Paragraph(
        '<font color="#646B7C" size=7.5><i>Forward-looking illustrative estimates (CAD), '
        'not guarantees. Estimaciones ilustrativas a futuro (CAD), no garantías.</i></font>',
        st["body_sm"]))

    # ===================== THE ASK & USE OF FUNDS =====================
    s.append(heading_bi("The Ask & Use of Funds", "La Inversión y Uso de Fondos", num="08"))
    s.append(Spacer(1, 8))
    s.append(stat_tiles([
        ("$250K", "seed round (CAD) / ronda semilla"),
        ("18 mo", "runway to 3 verticals / pista a 3 verticales"),
        ("2", "revenue lines unlocked / líneas de ingreso"),
    ]))
    s.append(Spacer(1, 10))
    s.append(data_table(
        ["Use of funds / Uso de fondos", "%", "Purpose / Propósito"],
        [
            ["AI stack & engineering / Plataforma de IA", "40%", "Harden voice, matching & workflow agents / Robustecer agentes"],
            ["Operations & operators / Operaciones", "25%", "Scale Northbound, hire/train operators / Escalar y contratar"],
            ["Go-to-market / Comercialización", "20%", "Acquire carriers & launch verticals / Captar clientes y lanzar"],
            ["Legal & buffer / Legal y reserva", "15%", "Compliance, contingencies / Cumplimiento y contingencias"],
        ],
        col_widths=[2.0 * inch, 0.55 * inch, FULL - 2.0 * inch - 0.55 * inch]))
    s.append(Spacer(1, 8))
    s.append(callout(
        "Capital accelerates a model that already works manually — it funds the "
        "shared stack and replication, not survival.<br/>"
        "El capital acelera un modelo que ya funciona manualmente — financia la "
        "plataforma compartida y la replicación, no la supervivencia.",
        accent=GOLD, bg="#FFF8E9"))

    # ===================== WHY NOW + TEAM =====================
    s.append(PageBreak())
    s.append(heading_bi("Why Now & Team", "Por Qué Ahora y Equipo", num="09"))
    s.append(Spacer(1, 8))
    s.append(bilingual([(
        "<b>Why now:</b> capable AI agents and voice models have only just made "
        "true operator leverage possible, while these industries remain almost "
        "entirely un-automated. The window to own the coordination layer is open now.",
        "<b>Por qué ahora:</b> los agentes de IA y los modelos de voz recién hacen "
        "posible un verdadero apalancamiento del operador, mientras estas industrias "
        "siguen casi sin automatizar. La ventana para controlar la coordinación está "
        "abierta ahora.",
    ), (
        "<b>Team:</b> Founded and operated by <b>Yorkis Estevez</b> (Barrie, Ontario) "
        "— founder of Golden Maple and Northbound Dispatch, combining hands-on "
        "service-business operating experience with an AI-first build approach.",
        "<b>Equipo:</b> Fundada y operada por <b>Yorkis Estevez</b> (Barrie, Ontario) "
        "— fundador de Golden Maple y Northbound Dispatch, combinando experiencia "
        "operativa real en negocios de servicios con un enfoque de construcción "
        "centrado en la IA.",
    )], st))

    # ===================== CLOSING / CONTACT =====================
    s.append(Spacer(1, 12))
    s.append(KeepTogether([
        heading_bi("Let's Talk", "Hablemos", num="10"),
        Spacer(1, 8),
        bilingual([(
            "We are raising to turn a proven method into a portfolio. If you invest in "
            "AI applied to real-world businesses, we should talk.",
            "Estamos levantando capital para convertir un método probado en un "
            "portafolio. Si invierte en IA aplicada a negocios reales, hablemos.",
        )], st),
        Spacer(1, 8),
        callout(
            "<b>Estevez Intelligence</b> &nbsp;·&nbsp; Yorkis Estevez &nbsp;·&nbsp; "
            "yorkis@estevezintelligence.com &nbsp;·&nbsp; Barrie, Ontario, Canada",
            accent=GOLD, bg="#0A0E1A", textcolor="#FFFFFF"),
        Spacer(1, 8),
        Paragraph(
            '<font color="#646B7C" size=7><i>This document is for informational purposes only and does '
            'not constitute an offer to sell or a solicitation to buy securities. Figures are '
            'forward-looking illustrative estimates, not guarantees. &nbsp;|&nbsp; Este documento es '
            'solo informativo y no constituye una oferta de venta ni una solicitud de compra de '
            'valores. Las cifras son estimaciones ilustrativas a futuro, no garantías.</i></font>',
            st["body_sm"]),
    ]))

    doc.build(s)
    print(f"✓ Investor Brief (EN/ES) → {output_path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = (sys.argv[1] if len(sys.argv) > 1
           else os.path.join(here, "output", "Estevez-Intelligence-Investor-Brief-EN-ES.pdf"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    build(out)
