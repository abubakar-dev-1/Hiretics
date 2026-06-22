# -*- coding: utf-8 -*-
"""
Generate professional system diagrams for the Hiretics FYP report.
Pure matplotlib (no external diagram engines). Outputs PNGs to ./diagrams/.
Diagrams reflect the ACTUAL built system: event-driven serverless on LocalStack.
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
from matplotlib.lines import Line2D

OUT = os.path.join(os.path.dirname(__file__), "diagrams")
os.makedirs(OUT, exist_ok=True)

# ---- palette ---------------------------------------------------------------
NAVY   = "#1F3A5F"
BLUE   = "#2E5E8C"
TEAL   = "#1B998B"
AMBER  = "#E0A458"
RED    = "#C1492E"
PURPLE = "#6C5B7B"
GREY   = "#4A4A4A"
LGREY  = "#EAEEF3"
WHITE  = "#FFFFFF"

plt.rcParams["font.family"] = "DejaVu Sans"


def box(ax, x, y, w, h, text, fc=BLUE, tc=WHITE, fs=10, rounded=True, ec=None, lw=1.2, bold=True):
    style = "round,pad=0.02,rounding_size=0.06" if rounded else "square,pad=0.02"
    p = FancyBboxPatch((x, y), w, h, boxstyle=style,
                       linewidth=lw, edgecolor=ec or fc, facecolor=fc, zorder=2)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
            color=tc, fontsize=fs, fontweight="bold" if bold else "normal",
            zorder=3, wrap=True)
    return (x + w / 2, y + h / 2, w, h)


def arrow(ax, p1, p2, text="", color=GREY, fs=8, style="-|>", rad=0.0, ls="-", offset=(0, 0)):
    a = FancyArrowPatch(p1, p2, arrowstyle=style, mutation_scale=14,
                        linewidth=1.4, color=color, zorder=1,
                        connectionstyle=f"arc3,rad={rad}", linestyle=ls)
    ax.add_patch(a)
    if text:
        mx = (p1[0] + p2[0]) / 2 + offset[0]
        my = (p1[1] + p2[1]) / 2 + offset[1]
        ax.text(mx, my, text, ha="center", va="center", fontsize=fs,
                color=color, zorder=4,
                bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.85))


def base(figsize=(12, 8), xlim=(0, 100), ylim=(0, 100)):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_xlim(*xlim); ax.set_ylim(*ylim)
    ax.axis("off")
    return fig, ax


def title(ax, t, x=50, y=97):
    ax.text(x, y, t, ha="center", va="center", fontsize=14, fontweight="bold", color=NAVY)


def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=170, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("wrote", path)


# ===========================================================================
# FIGURE 5 — SYSTEM ARCHITECTURE (event-driven serverless)
# ===========================================================================
def fig_architecture():
    fig, ax = base(figsize=(14, 9))
    title(ax, "Figure 5 — Hiretics Event-Driven Serverless Architecture (Emulated on LocalStack)")

    # ---- client tier (outside cloud boundary) ----
    box(ax, 5, 83, 22, 9, "Browser (Client)\nNext.js 15 + React UI", fc=NAVY, fs=9.5)
    box(ax, 31, 83, 22, 9, "Next.js Server\n/sl-api same-origin proxy", fc=BLUE, fs=9.5)
    box(ax, 31, 71, 22, 8, "Socket.IO Client\n(live dashboard)", fc=PURPLE, fs=9)

    # ---- LocalStack boundary ----
    ls = Rectangle((2, 6), 96, 60, fill=False, linewidth=2, edgecolor=TEAL,
                   linestyle=(0, (6, 4)), zorder=0)
    ax.add_patch(ls)
    ax.text(3.5, 63.5, "LocalStack (Docker :4566) — emulated AWS Cloud",
            color=TEAL, fontsize=10, fontweight="bold")

    # API layer
    box(ax, 31, 53, 22, 8, "API Gateway", fc=AMBER, tc=NAVY, fs=10)
    box(ax, 60, 52, 36, 9, "Synchronous Lambdas\nauth · campaign · candidate · company\n"
                           "credits · recruiters · analytics", fc=BLUE, fs=8.8)

    # storage row
    box(ax, 5, 39, 17, 9, "Amazon S3\n(CV objects)", fc=GREY, fs=9)
    box(ax, 26, 39, 17, 9, "Amazon SQS\nCV queue", fc=TEAL, fs=9)
    box(ax, 79, 39, 17, 9, "DynamoDB\nCompanies · Users\nCampaigns · Candidates", fc=NAVY, fs=8)

    # compute row
    box(ax, 5, 23, 17, 9, "Dead-Letter\nQueue (DLQ)", fc="#8A2D1B", fs=9)
    box(ax, 26, 23, 17, 9, "Worker Lambda\nextract · score ·\npersist · notify", fc=RED, fs=8.5)
    box(ax, 50, 23, 20, 9, "AI Engine\nOpenAI GPT-4o-mini\n(Gemini fallback)", fc=PURPLE, fs=8.5)
    box(ax, 79, 23, 17, 9, "Socket.IO Server\n(WebSocket push)", fc=PURPLE, fs=8.5)

    # payments row
    box(ax, 50, 9, 20, 7, "Webhook Lambda\n(verify → grant)", fc=BLUE, fs=8.5)
    box(ax, 79, 9, 17, 7, "Stripe\n(credit packs)", fc=AMBER, tc=NAVY, fs=9)

    # ---- arrows ----
    arrow(ax, (27, 87.5), (31, 87.5), "")                                  # browser -> next
    arrow(ax, (42, 83), (42, 61), "HTTPS /sl-api", fs=8)                   # next -> apigw
    arrow(ax, (53, 57), (60, 57), "invoke", fs=8)                          # apigw -> sync lambdas
    arrow(ax, (88, 52), (88, 48), "read / write", color=NAVY, fs=8)       # sync -> dynamo

    # async pipeline (numbered)
    arrow(ax, (10, 83), (10, 48), "1. PUT CV\n(presigned)", color=GREY, fs=8)   # browser -> S3
    arrow(ax, (22, 43.5), (26, 43.5), "2. ObjectCreated", color=TEAL, fs=7.5)   # S3 -> SQS
    arrow(ax, (34.5, 39), (34.5, 32), "3. poll", color=TEAL, fs=8)              # SQS -> worker
    arrow(ax, (43, 27.5), (50, 27.5), "4. score", color=PURPLE, fs=8)          # worker -> AI
    arrow(ax, (43, 30), (79, 43), "5. credit check\n+ write score", color=NAVY, fs=7.5, rad=-0.18)
    arrow(ax, (43, 25), (79, 26), "6. emit event", color=PURPLE, fs=8, rad=-0.08)  # worker -> socket srv
    arrow(ax, (26, 27.5), (22, 27.5), "fail", color=RED, fs=8)                  # worker -> DLQ
    arrow(ax, (84, 32), (53, 74), "7. live update", color=PURPLE, fs=8, rad=0.22, ls="--")

    # payments
    arrow(ax, (79, 12.5), (70, 12.5), "webhook", color=AMBER, fs=8)            # stripe -> webhook
    arrow(ax, (66, 16), (83, 39), "grant credits", color=BLUE, fs=7.5, rad=-0.2)
    arrow(ax, (90, 52), (90, 16), "checkout", color=AMBER, fs=7.5, rad=0.25, ls="--")

    save(fig, "fig5_architecture.png")


# ===========================================================================
# FIGURE 7 — SEQUENCE: Asynchronous CV ranking pipeline
# ===========================================================================
def fig_sequence_cv():
    actors = [("Browser", NAVY), ("Candidate\nLambda", BLUE), ("S3", GREY), ("SQS", TEAL),
              ("Worker\nLambda", RED), ("DynamoDB", NAVY), ("AI Engine", PURPLE), ("Socket.IO", PURPLE)]
    msgs = [
        ("Browser", "Candidate\nLambda", "1: request presigned URL", False, NAVY),
        ("Candidate\nLambda", "Browser", "2: presigned PUT URL", True, BLUE),
        ("Browser", "S3", "3: PUT cv.pdf", False, NAVY),
        ("S3", "SQS", "4: ObjectCreated event", False, TEAL),
        ("SQS", "Worker\nLambda", "5: deliver message", False, TEAL),
        ("Worker\nLambda", "DynamoDB", "6: atomic credit check (>=1)", False, NAVY),
        ("Worker\nLambda", "S3", "7: fetch CV bytes", False, GREY),
        ("Worker\nLambda", "AI Engine", "8: extract text + score vs criteria", False, PURPLE),
        ("AI Engine", "Worker\nLambda", "9: score + justification", True, PURPLE),
        ("Worker\nLambda", "DynamoDB", "10: persist ranked candidate", False, NAVY),
        ("Worker\nLambda", "Socket.IO", "11: emit rank:update", False, PURPLE),
        ("Socket.IO", "Browser", "12: live dashboard update", True, PURPLE),
    ]
    sequence("fig7_sequence.png",
             "Figure 7 — Sequence: Asynchronous CV Ranking Pipeline", actors, msgs,
             note="On unrecoverable error, the message is routed to the DLQ after max receives.")


# ===========================================================================
# FIGURE 2 — DFD Level 0 (context)
# ===========================================================================
def fig_dfd0():
    fig, ax = base(figsize=(12, 8))
    title(ax, "Figure 2 — Data Flow Diagram, Level 0 (Context)")

    # central process
    c = box(ax, 38, 44, 24, 12, "0\nHiretics\nPlatform", fc=TEAL, fs=12, rounded=True)

    ents = [
        ("Recruiter", 6, 70, "create campaigns →\n← ranked candidates"),
        ("Candidate", 6, 28, "upload CV / apply →\n← report & match score"),
        ("Company Admin", 74, 70, "buy credits →\n← invoices & balance"),
        ("Platform Owner", 74, 28, "monitor →\n← infra & revenue KPIs"),
        ("AI Engine", 40, 80, "text →\n← scores"),
        ("Stripe", 40, 8, "checkout →\n← payment events"),
    ]
    cx, cy = 50, 50
    for name, x, y, lbl in ents:
        box(ax, x, y, 20, 9, name, fc=NAVY, fs=9)
        ex, ey = x + 10, y + 4.5
        arrow(ax, (ex, ey), (cx, cy), "", color=GREY, rad=0.05)
        ax.text((ex + cx) / 2, (ey + cy) / 2, lbl, ha="center", va="center", fontsize=7,
                color=GREY, bbox=dict(boxstyle="round,pad=0.2", fc="white", ec="none", alpha=0.85))
    save(fig, "fig2_dfd0.png")


# ===========================================================================
# FIGURE 3 — DFD Level 1
# ===========================================================================
def fig_dfd1():
    fig, ax = base(figsize=(13.5, 9))
    title(ax, "Figure 3 — Data Flow Diagram, Level 1")

    procs = [
        ("1.0 Authentication\n& Tenancy", 6, 76, BLUE),
        ("2.0 Campaign\nManagement", 38, 76, BLUE),
        ("3.0 CV\nIngestion", 70, 76, BLUE),
        ("4.0 AI Scoring\nEngine", 70, 50, RED),
        ("5.0 Real-Time\nNotification", 70, 24, PURPLE),
        ("6.0 Billing\n& Credits", 38, 24, AMBER),
        ("7.0 Candidate\nCareer Analysis", 6, 50, TEAL),
        ("8.0 Platform\nObservability", 6, 24, GREY),
    ]
    P = {}
    for name, x, y, c in procs:
        tc = NAVY if c == AMBER else WHITE
        b = box(ax, x, y, 22, 11, name, fc=c, tc=tc, fs=9)
        P[name[:3]] = (x + 11, y + 5.5)

    # data stores
    def store(x, y, t):
        ax.add_patch(Rectangle((x, y), 22, 5, facecolor=LGREY, edgecolor=NAVY, lw=1.2, zorder=2))
        ax.text(x + 11, y + 2.5, t, ha="center", va="center", fontsize=8.5, color=NAVY, fontweight="bold")
        return (x + 11, y + 2.5)

    d_db = store(38, 50, "D1 | DynamoDB")
    d_s3 = store(38, 8, "D2 | S3 Object Store")

    def link(a, b, rad=0.0, c=GREY):
        arrow(ax, a, b, "", color=c, rad=rad)

    # meaningful flows
    link(P["1.0"], d_db, 0.05)
    link(P["2.0"], d_db, 0.0)
    link((81, 76), (81, 61), 0)            # 3.0 -> 4.0
    link((81, 61), (81, 35), 0)            # 4.0 -> 5.0
    link(P["4.0"], d_db, 0.1)
    link(P["7.0"], d_db, -0.05)
    link(P["6.0"], d_db, 0.0)
    link(P["8.0"], d_db, 0.1)
    link((70, 81), (49, 12), 0.0)          # ingestion -> S3
    link(d_s3, P["4.0"], -0.2)             # S3 -> scoring

    ax.text(50, 2, "External entities omitted for clarity — see Level-0 context (Figure 2).",
            ha="center", fontsize=7.5, color=GREY, style="italic")
    save(fig, "fig3_dfd1.png")


# ===========================================================================
# FIGURE 11 — ERD (logical)
# ===========================================================================
def fig_erd():
    fig, ax = base(figsize=(13.5, 9))
    title(ax, "Figure 11 — Entity Relationship Diagram (Logical Model)")

    def entity(x, y, name, attrs, fc=NAVY):
        w, hh = 22, 4 + len(attrs) * 2.0
        ax.add_patch(FancyBboxPatch((x, y - hh), w, hh, boxstyle="square,pad=0.02",
                     fc="white", ec=fc, lw=1.6, zorder=2))
        ax.add_patch(Rectangle((x, y - 3), w, 3, facecolor=fc, edgecolor=fc, zorder=3))
        ax.text(x + w / 2, y - 1.5, name, ha="center", va="center", color="white",
                fontsize=9.5, fontweight="bold", zorder=4)
        for i, a in enumerate(attrs):
            ax.text(x + 1, y - 4.6 - i * 2.0, a, ha="left", va="center", fontsize=7.2,
                    color=GREY, zorder=4)
        return {"x": x, "y": y, "w": w, "h": hh, "cx": x + w / 2, "top": y, "bot": y - hh}

    Company  = entity(6,  92, "Company", ["PK companyId", "name", "plan (Free/Pro)", "availableCredits"])
    User     = entity(40, 92, "User", ["PK userId", "FK companyId", "email (GSI)", "role", "passwordHash"])
    Campaign = entity(74, 92, "Campaign", ["PK campaignId", "FK companyId", "criteria", "visibility", "publicHash (GSI)"])
    Candidate= entity(74, 60, "Candidate", ["PK candidateId", "FK campaignId", "cvUrl", "score (GSI)", "justification"])
    Trans    = entity(6,  60, "Transaction", ["PK txnId", "FK companyId", "credits", "stripeRef", "amount"])
    CVVer    = entity(40, 60, "CVVersion", ["PK versionId", "FK userId", "label", "createdAt", "s3Key"])
    Report   = entity(40, 30, "Report", ["PK reportId", "FK versionId", "skillDecay", "pivotPaths", "matchScore"])
    Compare  = entity(74, 30, "Comparison", ["PK comparisonId", "FK versionA", "FK versionB", "delta"])

    def rel(a, b, label, an="bot", bn="top", rad=0.0):
        pa = (a["cx"], a[an]); pb = (b["cx"], b[bn])
        arrow(ax, pa, pb, label, color=TEAL, fs=7.5, style="-", rad=rad)
        # crow's-foot hint via text
    rel(Company, User, "1 : N", rad=0.0)
    rel(Company, Campaign, "1 : N", rad=0.0)
    rel(Campaign, Candidate, "1 : N")
    rel(Company, Trans, "1 : N")
    rel(User, CVVer, "1 : N")
    rel(CVVer, Report, "1 : N")
    rel(CVVer, Compare, "N : 1", rad=-0.1)

    ax.text(50, 4, "Physical design: table-per-entity in DynamoDB with GSIs "
                   "(EmailIndex, CompanyIndex, PublicHashIndex, CampaignScoreIndex).",
            ha="center", fontsize=8, color=NAVY, style="italic")
    save(fig, "fig11_erd.png")


# ===========================================================================
# FIGURE 1 — Use-case diagram
# ===========================================================================
def fig_usecase():
    fig, ax = base(figsize=(13.5, 9))
    title(ax, "Figure 1 — System Use-Case Diagram")

    # system boundary
    ax.add_patch(Rectangle((28, 8), 44, 84, fill=False, lw=1.6, edgecolor=NAVY))
    ax.text(50, 89, "Hiretics Platform", ha="center", fontsize=11, fontweight="bold", color=NAVY)

    def actor(x, y, name):
        ax.plot(x, y + 3, "o", ms=9, color=NAVY)                       # head
        ax.add_line(Line2D([x, x], [y + 2.5, y - 1], color=NAVY, lw=2))   # body
        ax.add_line(Line2D([x - 2, x + 2], [y + 1.5, y + 1.5], color=NAVY, lw=2))  # arms
        ax.add_line(Line2D([x, x - 1.8], [y - 1, y - 4], color=NAVY, lw=2))
        ax.add_line(Line2D([x, x + 1.8], [y - 1, y - 4], color=NAVY, lw=2))
        ax.text(x, y - 6, name, ha="center", fontsize=9, fontweight="bold", color=NAVY)
        return (x, y)

    def uc(x, y, t, fc=BLUE):
        from matplotlib.patches import Ellipse
        ax.add_patch(Ellipse((x, y), 18, 6, facecolor=fc, edgecolor=fc, zorder=2))
        ax.text(x, y, t, ha="center", va="center", color="white", fontsize=7.6, zorder=3)
        return (x, y)

    def link(a, u):
        ax.add_line(Line2D([a[0], u[0]], [a[1], u[1]], color="#7A8794", lw=1.0, zorder=0))

    rec = actor(12, 70, "Recruiter")
    cand = actor(12, 30, "Candidate")
    admin = actor(88, 70, "Company Admin")
    owner = actor(88, 30, "Platform Owner")

    u_login = uc(50, 84, "Authenticate (JWT)")
    u_camp  = uc(40, 74, "Create Campaign")
    u_aiauth= uc(40, 66, "AI Authoring Assist", PURPLE)
    u_rank  = uc(40, 58, "View Ranked CVs")
    u_upload= uc(40, 48, "Upload CV")
    u_report= uc(40, 40, "Get CV Analysis", TEAL)
    u_tailor= uc(40, 32, "Tailor CV to Job", TEAL)
    u_apply = uc(40, 24, "Apply to Public Job", TEAL)
    u_credit= uc(60, 70, "Buy Credits", AMBER)
    u_plan  = uc(60, 62, "Manage Plan", AMBER)
    u_mon   = uc(60, 34, "Monitor Infra", GREY)
    u_tenant= uc(60, 26, "Manage Tenants", GREY)

    for u in [u_login, u_camp, u_aiauth, u_rank]: link(rec, u)
    for u in [u_login, u_upload, u_report, u_tailor, u_apply]: link(cand, u)
    for u in [u_login, u_credit, u_plan]: link(admin, u)
    for u in [u_login, u_mon, u_tenant]: link(owner, u)

    # include relationship
    arrow(ax, u_upload, u_rank, "«include»", color=RED, fs=7, style="-|>", ls="--")
    save(fig, "fig1_usecase.png")


# ===========================================================================
# FIGURE 6 — Class diagram (domain model)
# ===========================================================================
def fig_class():
    fig, ax = base(figsize=(13.5, 9))
    title(ax, "Figure 6 — Class Diagram (Domain Model)")

    def cls(x, y, name, attrs, methods, fc=BLUE):
        n_lines = 1 + len(attrs) + len(methods)
        hh = 3.2 + (len(attrs) + len(methods)) * 2.1
        w = 26
        ax.add_patch(Rectangle((x, y - hh), w, hh, facecolor="white", edgecolor=NAVY, lw=1.4, zorder=2))
        ax.add_patch(Rectangle((x, y - 3.2), w, 3.2, facecolor=fc, edgecolor=NAVY, lw=1.4, zorder=3))
        ax.text(x + w / 2, y - 1.6, name, ha="center", va="center", color="white",
                fontsize=9.5, fontweight="bold", zorder=4)
        yy = y - 4.8
        for a in attrs:
            ax.text(x + 1, yy, a, ha="left", va="center", fontsize=7.0, color=GREY, zorder=4); yy -= 2.1
        ax.add_line(Line2D([x, x + w], [yy + 1.0, yy + 1.0], color=NAVY, lw=0.8, zorder=4))
        for m in methods:
            ax.text(x + 1, yy, m, ha="left", va="center", fontsize=7.0, color=BLUE, zorder=4); yy -= 2.1
        return {"x": x, "y": y, "w": w, "h": hh, "cx": x + w / 2, "bot": y - hh, "top": y}

    Company = cls(6, 92, "Company", ["+id", "+name", "+plan", "+availableCredits"],
                  ["+deductCredit()", "+grantCredits(n)"], NAVY)
    User = cls(40, 92, "User", ["+id", "+email", "+role", "+companyId"],
               ["+authenticate()", "+hasRole(r)"], BLUE)
    Campaign = cls(74, 92, "Campaign", ["+id", "+criteria", "+visibility", "+companyId"],
                   ["+publish()", "+rank()"], BLUE)
    Candidate = cls(74, 58, "Candidate", ["+id", "+cvUrl", "+score", "+campaignId"],
                    ["+computeScore()"], RED)
    AIService = cls(40, 58, "AIService", ["+provider", "+model"],
                    ["+scoreCV()", "+assistAuthoring()", "+analyzeCV()"], PURPLE)
    CVVersion = cls(6, 58, "CVVersion", ["+id", "+userId", "+s3Key"],
                    ["+compare(other)"], TEAL)
    Worker = cls(40, 28, "WorkerLambda", ["+queueUrl"],
                 ["+handle(event)", "+toDLQ()"], "#8A2D1B")

    def assoc(a, b, label, an="bot", bn="top", rad=0.0, diamond=False):
        pa = (a["cx"], a[an]); pb = (b["cx"], b[bn])
        arrow(ax, pa, pb, label, color=GREY, fs=7, style="-", rad=rad)

    assoc(Company, User, "1   employs   *")
    assoc(Company, Campaign, "1   owns   *", rad=0.0)
    assoc(Campaign, Candidate, "1   ranks   *")
    assoc(User, CVVersion, "1   has   *", rad=0.0)
    arrow(ax, (Worker["cx"], Worker["top"]), (AIService["cx"], AIService["bot"]), "uses", color=PURPLE, fs=7, style="-|>", ls="--")
    arrow(ax, (Candidate["x"], Candidate["y"] - 4), (Worker["x"] + Worker["w"], Worker["y"] - 4),
          "produces", color=GREY, fs=7, style="-|>", rad=-0.2)
    save(fig, "fig6_class.png")


# ===========================================================================
# FIGURE 4 — DFD Level 2 (CV Processing & AI Scoring Pipeline)
# ===========================================================================
def fig_dfd2():
    fig, ax = base(figsize=(14, 8.5))
    title(ax, "Figure 4 — Data Flow Diagram, Level 2 (CV Processing & AI Scoring Pipeline)")

    def store(x, y, t):
        ax.add_patch(Rectangle((x, y), 22, 5, facecolor=LGREY, edgecolor=NAVY, lw=1.2, zorder=2))
        ax.text(x + 11, y + 2.5, t, ha="center", va="center", fontsize=8.5, color=NAVY, fontweight="bold")
        return (x + 11, y + 2.5)

    # ---- nodes (snake layout: top row L->R, middle row R->L, bottom row L->R) ----
    box(ax, 3, 73, 17, 9, "Browser\n(Client)", fc=NAVY, fs=9)            # top-left
    box(ax, 26, 73, 17, 9, "3.1 Issue\nPresigned URL", fc=BLUE, fs=8.5)
    store(50, 75, "D2 | S3 Store")
    box(ax, 79, 73, 17, 9, "Amazon SQS\nCV Queue", fc=TEAL, fs=8.5)

    box(ax, 79, 52, 17, 9, "4.1 Poll &\nLock Credit", fc=RED, fs=8.5)    # middle row
    box(ax, 56, 52, 17, 9, "4.2 Extract\nCV Text", fc=RED, fs=8.5)
    box(ax, 33, 52, 17, 9, "4.3 AI Score\nvs Criteria", fc=RED, fs=8.5)
    box(ax, 3, 52, 17, 9, "AI Engine\nGPT-4o-mini", fc=PURPLE, fs=8.5)

    box(ax, 79, 31, 17, 8, "DLQ\n(failures)", fc="#8A2D1B", fs=8.5)      # bottom area
    box(ax, 33, 30, 17, 9, "4.4 Persist\n& Notify", fc=RED, fs=8.5)
    store(56, 31, "D1 | DynamoDB")
    box(ax, 33, 11, 17, 8, "Socket.IO\nServer", fc=PURPLE, fs=8.5)

    A = lambda a, b, t="", c=GREY, r=0.0, fs=7.5: arrow(ax, a, b, t, color=c, rad=r, fs=fs)
    # top row
    A((20, 79.5), (26, 79.5), "1: request", BLUE)
    A((26, 75.5), (20, 75.5), "2: presigned URL", BLUE, 0.0)
    A((11, 73), (55, 77), "3: PUT CV bytes", GREY, -0.12)
    A((61, 75), (79, 79), "4: ObjectCreated", TEAL, -0.1)
    A((87.5, 73), (87.5, 61), "5: deliver", TEAL)
    # middle row (right -> left)
    A((79, 56.5), (73, 56.5), "6", RED)
    A((87, 52), (67, 36), "7: atomic credit", NAVY, -0.2)
    A((64, 61), (58, 76), "fetch bytes", GREY, 0.2)
    A((56, 56.5), (50, 56.5), "8", RED)
    A((41, 52), (20, 56.5), "9: text", PURPLE, 0.12)
    A((20, 54), (33, 54), "10: score", PURPLE, -0.12)
    # down to persist
    A((41, 52), (41, 39), "11: ranked result", RED)
    A((50, 34.5), (56, 34.5), "12: write rank", NAVY)
    A((41, 30), (41, 19), "13: emit event", PURPLE)
    A((33, 15), (11, 73), "14: live update", PURPLE, 0.3, fs=7.5)
    # failure
    A((87.5, 52), (87.5, 39), "on failure", RED)

    ax.text(50, 4, "Processes 3.x (CV Ingestion) and 4.x (AI Scoring Engine) decomposed from Figure 3.",
            ha="center", fontsize=8, color=GREY, style="italic")
    save(fig, "fig4_dfd2.png")


# ===========================================================================
# FIGURE 10 — Collaboration Diagram (Campaign Creation & Ranking)
# ===========================================================================
def fig_collaboration():
    fig, ax = base(figsize=(14, 9.5))
    title(ax, "Figure 10 — Collaboration Diagram (Campaign Creation & Ranking)")

    # clockwise cycle so sequential messages connect neighbouring objects
    objs = {
        ":Recruiter":      (16, 80, NAVY),
        ":CampaignLambda": (50, 84, BLUE),
        ":DynamoDB":       (84, 78, NAVY),
        ":AIEngine":       (90, 46, PURPLE),
        ":WorkerLambda":   (66, 20, RED),
        ":SQS":            (34, 20, TEAL),
        ":S3":             (10, 46, GREY),
        ":SocketIO":       (50, 52, PURPLE),   # central hub for the live push
    }
    C = {}
    for name, (x, y, c) in objs.items():
        w, h = 22, 8
        box(ax, x - w / 2, y - h / 2, w, h, name, fc=c, fs=9)
        C[name] = {"c": (x, y), "x": x, "y": y, "w": w, "h": h}

    def edge(a, b):
        """nearest points on the two boxes -> short, tidy connectors."""
        ax_, ay_, aw, ah = C[a]["x"], C[a]["y"], C[a]["w"], C[a]["h"]
        bx_, by_, bw, bh = C[b]["x"], C[b]["y"], C[b]["w"], C[b]["h"]
        dx, dy = bx_ - ax_, by_ - ay_
        def clip(x, y, w, h, dx, dy):
            if dx == 0 and dy == 0:
                return x, y
            sx = (w / 2) / abs(dx) if dx else 1e9
            sy = (h / 2) / abs(dy) if dy else 1e9
            s = min(sx, sy)
            return x + dx * s, y + dy * s
        p1 = clip(ax_, ay_, aw, ah, dx, dy)
        p2 = clip(bx_, by_, bw, bh, -dx, -dy)
        return p1, p2

    def link(a, b, label, rad=0.0, c=GREY, off=(0, 0)):
        p1, p2 = edge(a, b)
        arrow(ax, p1, p2, label, color=c, fs=7.6, style="-|>", rad=rad, offset=off)

    link(":Recruiter", ":CampaignLambda", "1: createCampaign()", 0.08, NAVY)
    link(":CampaignLambda", ":DynamoDB", "2: put(Campaign)", 0.08, BLUE)
    link(":CampaignLambda", ":S3", "3: presign(uploads)", -0.12, BLUE)
    link(":S3", ":SQS", "4: ObjectCreated", 0.10, GREY)
    link(":SQS", ":WorkerLambda", "5: deliver(msg)", 0.08, TEAL)
    link(":WorkerLambda", ":AIEngine", "7: scoreCV()", 0.10, RED)
    link(":WorkerLambda", ":DynamoDB", "6: atomicCredit() / write", -0.18, RED, off=(3, 0))
    link(":WorkerLambda", ":SocketIO", "8: emit(rank:update)", 0.0, PURPLE)
    link(":SocketIO", ":Recruiter", "9: live update", 0.0, PURPLE)

    ax.text(50, 4, "Object interactions with sequential message numbering for the campaign-to-ranking flow.",
            ha="center", fontsize=8, color=GREY, style="italic")
    save(fig, "fig10_collaboration.png")


# ===========================================================================
# Reusable sequence-diagram renderer
# ===========================================================================
def sequence(fname, heading, actors, messages, note=None, figsize=(14, 9)):
    """actors: list of (label, color). messages: list of (src, dst, text, ret, color)."""
    fig, ax = base(figsize=figsize)
    title(ax, heading)
    n = len(actors)
    left, right = 6, 94
    step_x = (right - left) / (n - 1)
    xs = {a[0]: left + j * step_x for j, a in enumerate(actors)}
    top, bot = 88, 8
    for label, color in actors:
        x = xs[label]
        box(ax, x - step_x * 0.34, top, step_x * 0.68, 6, label, fc=color, fs=8.2)
        ax.add_line(Line2D([x, x], [top, bot], color="#AAB4C0", lw=1.0, ls=(0, (4, 3)), zorder=0))
    y = top - 6
    dy = (y - bot - 4) / (len(messages) + 0.5)
    for (src, dst, text, ret, color) in messages:
        if src == dst:                       # self message
            x = xs[src]
            ax.text(x + 1.2, y, "» " + text, ha="left", va="center", fontsize=7.4,
                    color=color, style="italic", zorder=4)
        else:
            # arrow first (no embedded label), then label ABOVE the line so it stays visible
            arrow(ax, (xs[src], y), (xs[dst], y), "", color=color, style="-|>",
                  ls="--" if ret else "-")
            mx = (xs[src] + xs[dst]) / 2
            ax.text(mx, y + 1.4, text, ha="center", va="bottom", fontsize=7.3, color=color,
                    zorder=5,
                    bbox=dict(boxstyle="round,pad=0.1", fc="white", ec="none", alpha=0.5))
        y -= dy
    if note:
        ax.text(50, bot - 1, note, ha="center", fontsize=8, color=RED, style="italic")
    save(fig, fname)


def fig_sequence_stripe():
    actors = [("Admin\n(Browser)", NAVY), ("Checkout\nLambda", BLUE), ("Stripe", AMBER),
              ("Webhook\nLambda", BLUE), ("DynamoDB", NAVY), ("Dashboard", PURPLE)]
    msgs = [
        ("Admin\n(Browser)", "Checkout\nLambda", "1: buyCredits(pack)", False, NAVY),
        ("Checkout\nLambda", "Stripe", "2: create Checkout Session", False, BLUE),
        ("Stripe", "Checkout\nLambda", "3: session URL", True, AMBER),
        ("Checkout\nLambda", "Admin\n(Browser)", "4: redirect to Stripe", True, BLUE),
        ("Admin\n(Browser)", "Stripe", "5: complete payment", False, NAVY),
        ("Stripe", "Webhook\nLambda", "6: checkout.session.completed (webhook)", False, AMBER),
        ("Webhook\nLambda", "Webhook\nLambda", "7: verify signature", False, BLUE),
        ("Webhook\nLambda", "DynamoDB", "8: atomic credit grant + Transaction", False, NAVY),
        ("Webhook\nLambda", "Stripe", "9: 200 OK", True, BLUE),
        ("DynamoDB", "Dashboard", "10: balance updated (live)", True, PURPLE),
    ]
    sequence("fig8_sequence_stripe.png",
             "Figure 8 — Sequence: Stripe Credit Purchase (Webhook-Confirmed)", actors, msgs,
             note="Credits are granted only on the server-verified webhook, never on client redirect.")


def fig_sequence_candidate():
    actors = [("Candidate\n(Browser)", NAVY), ("Analysis\nLambda", BLUE), ("S3", GREY),
              ("SQS", TEAL), ("AI Engine", PURPLE), ("DynamoDB", NAVY), ("Socket.IO", PURPLE)]
    msgs = [
        ("Candidate\n(Browser)", "Analysis\nLambda", "1: request presigned URL", False, NAVY),
        ("Analysis\nLambda", "Candidate\n(Browser)", "2: presigned URL", True, BLUE),
        ("Candidate\n(Browser)", "S3", "3: PUT cv.pdf", False, NAVY),
        ("S3", "SQS", "4: ObjectCreated (analysis queue)", False, GREY),
        ("SQS", "Analysis\nLambda", "5: deliver message", False, TEAL),
        ("Analysis\nLambda", "S3", "6: fetch CV bytes", False, GREY),
        ("Analysis\nLambda", "AI Engine", "7: analyze (skill-decay, pivots, 30-60-90)", False, PURPLE),
        ("AI Engine", "Analysis\nLambda", "8: structured report", True, PURPLE),
        ("Analysis\nLambda", "DynamoDB", "9: save Report + version", False, NAVY),
        ("Analysis\nLambda", "Socket.IO", "10: report ready", False, PURPLE),
        ("Socket.IO", "Candidate\n(Browser)", "11: live notification", True, PURPLE),
        ("Candidate\n(Browser)", "Analysis\nLambda", "12: tailorToJob(campaignId)", False, RED),
        ("Analysis\nLambda", "AI Engine", "13: tailor using campaign criteria", False, PURPLE),
        ("AI Engine", "Analysis\nLambda", "14: improvements + predicted match", True, PURPLE),
        ("Analysis\nLambda", "Candidate\n(Browser)", "15: targeted CV + match score", True, BLUE),
    ]
    sequence("fig9_sequence_candidate.png",
             "Figure 9 — Sequence: Candidate CV Analysis & Tailor-to-Job", actors, msgs,
             figsize=(14, 10))


# ===========================================================================
# FIGURE 12 — Deployment Diagram (LocalStack / Docker)
# ===========================================================================
def fig_deployment():
    fig, ax = base(figsize=(14, 9))
    title(ax, "Figure 12 — Deployment Diagram (LocalStack / Docker)")

    # developer workstation boundary
    ax.add_patch(Rectangle((2, 6), 96, 80, fill=False, lw=2, edgecolor=NAVY))
    ax.text(4, 82.5, "«device»  Developer Workstation (Windows / Ubuntu)", color=NAVY,
            fontsize=10, fontweight="bold")

    # browser
    box(ax, 6, 70, 22, 8, "«browser»\nNext.js 15 SPA", fc=NAVY, fs=9)

    # node runtime processes
    ax.add_patch(Rectangle((4, 50, ), 44, 16, fill=False, lw=1.4, edgecolor=BLUE, linestyle=(0, (5, 3))))
    ax.text(6, 63, "«runtime»  Node.js processes", color=BLUE, fontsize=9, fontweight="bold")
    box(ax, 6, 52, 19, 8, "Next.js Server\n(/sl-api proxy)", fc=BLUE, fs=8.5)
    box(ax, 28, 52, 18, 8, "Socket.IO\nServer", fc=PURPLE, fs=8.5)

    # docker engine boundary
    ax.add_patch(Rectangle((52, 12), 44, 62, fill=False, lw=1.6, edgecolor=TEAL))
    ax.text(54, 70.5, "«container engine»  Docker", color=TEAL, fontsize=9.5, fontweight="bold")

    # localstack container
    ax.add_patch(Rectangle((55, 30), 38, 36, fill=False, lw=1.4, edgecolor=TEAL, linestyle=(0, (5, 3))))
    ax.text(57, 62.5, "«container»  LocalStack :4566", color=TEAL, fontsize=9, fontweight="bold")
    box(ax, 57, 53, 16, 7, "API Gateway", fc=AMBER, tc=NAVY, fs=8)
    box(ax, 75, 53, 16, 7, "Lambda Service", fc=BLUE, fs=8)
    box(ax, 57, 43, 16, 7, "Amazon S3", fc=GREY, fs=8)
    box(ax, 75, 43, 16, 7, "Amazon SQS", fc=TEAL, fs=8)
    box(ax, 57, 33, 16, 7, "DynamoDB", fc=NAVY, fs=8)
    box(ax, 75, 33, 16, 7, "DLQ", fc="#8A2D1B", fs=8)

    # lambda child containers
    box(ax, 57, 16, 34, 9, "«child containers»  Lambda functions\n"
        "auth · campaign · candidate · worker · credits · analytics", fc=RED, fs=7.8)

    # external services
    box(ax, 6, 16, 18, 9, "OpenAI API\n(GPT-4o-mini)", fc=PURPLE, fs=8.5)
    box(ax, 28, 16, 18, 9, "Stripe API\n(payments)", fc=AMBER, tc=NAVY, fs=8.5)

    A = lambda a, b, t="", c=GREY, r=0.0: arrow(ax, a, b, t, color=c, rad=r, fs=7.5)
    A((15, 70), (15, 60), "HTTP", NAVY)
    A((22, 70), (37, 60), "WSS", PURPLE, -0.15)
    arrow(ax, (20, 52), (57, 53), "/sl-api -> :4566", color=BLUE, rad=-0.32, fs=7.5, offset=(0, -7))
    A((74, 30), (74, 25), "spawns", BLUE)                 # LocalStack -> child containers
    arrow(ax, (57, 22), (24, 22), "AI calls", color=PURPLE, rad=0.22, fs=7.5, offset=(0, 6))
    A((57, 18.5), (46, 18.5), "webhook / checkout", AMBER, 0.0)

    ax.text(50, 9, "Identical Serverless Framework IaC promotes unchanged to a real AWS account (see Future Work).",
            ha="center", fontsize=8, color=NAVY, style="italic")
    save(fig, "fig12_deployment.png")


if __name__ == "__main__":
    fig_architecture()
    fig_sequence_cv()
    fig_dfd0()
    fig_dfd1()
    fig_dfd2()
    fig_erd()
    fig_usecase()
    fig_class()
    fig_collaboration()
    fig_sequence_stripe()
    fig_sequence_candidate()
    fig_deployment()
    print("ALL DIAGRAMS DONE ->", OUT)
