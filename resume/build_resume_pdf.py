from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak

OUT = "/Users/nikitasingh/Downloads/NikitaSingh_Resume_Updated.pdf"

PAGE_W, PAGE_H = A4
M = 0.5 * inch
CONTENT_W = PAGE_W - 2 * M

body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=12, spaceAfter=2)
name_st = ParagraphStyle("name", parent=body, fontName="Helvetica-Bold", fontSize=17, leading=20, alignment=TA_CENTER, spaceAfter=1)
contact = ParagraphStyle("contact", parent=body, fontSize=9, alignment=TA_CENTER, spaceAfter=4)
header_st = ParagraphStyle("header", parent=body, fontName="Helvetica-Bold", fontSize=10, spaceBefore=8, spaceAfter=1)
left_bold = ParagraphStyle("lb", parent=body, fontName="Helvetica-Bold", spaceAfter=0)
right_bold = ParagraphStyle("rb", parent=left_bold, alignment=2)
left_it = ParagraphStyle("li", parent=body, fontName="Helvetica-Oblique", spaceAfter=1)
right_it = ParagraphStyle("ri", parent=left_it, alignment=2)
bullet_st = ParagraphStyle("bul", parent=body, leftIndent=14, bulletIndent=4, spaceAfter=1.5,
                           bulletFontName="Helvetica", bulletFontSize=9.5)

story = []

def header(text):
    story.append(Paragraph(text, header_st))
    story.append(HRFlowable(width="100%", thickness=0.7, color=HexColor("#444444"), spaceBefore=0, spaceAfter=3))

def two_col(left, right, bold=True):
    ls, rs = (left_bold, right_bold) if bold else (left_it, right_it)
    t = Table([[Paragraph(left, ls), Paragraph(right, rs)]],
              colWidths=[CONTENT_W * 0.72, CONTENT_W * 0.28])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)

def bullet(text):
    story.append(Paragraph(text, bullet_st, bulletText="-"))

def gap(h=4):
    story.append(Spacer(1, h))

story.append(Paragraph("Nikita Singh", name_st))
story.append(Paragraph("Gurugram, Haryana &nbsp;·&nbsp; nikitasingh18dec@gmail.com &nbsp;·&nbsp; 8318721284 &nbsp;·&nbsp; linkedin.com/in/nikitasingh98", contact))

header("EXPERIENCE")

two_col("American Express", "Gurugram, Haryana")
two_col("Software Engineer", "October 2024 – Present", bold=False)
bullet("Engineered an agentic AI assistant for the Caselite case-management platform using Llama-based LLMs, automating end-to-end case creation and case-processing workflows — reducing average case-handling time for Customer Care Professionals (CCPs) and establishing a scalable foundation for AI-driven servicing.")
bullet("Automated banking case creation in CLIC by onboarding the KYC Refresh Report case type with automated success/failure notifications and failure-reason reporting — eliminating manual case-creation effort, accelerating issue triage, and improving operational efficiency.")
bullet("Re-architected the demographic-fetching service in ACE using parallel processing with optimized pagination and sorting for high-volume linked-account scenarios (80+ accounts) — significantly reducing API latency, increasing throughput and scalability, and improving CCP user experience.")
bullet("Spearheaded the JDK 21 migration across the SCRA platform and 4 dependent repositories, modernizing the technology stack, improving runtime performance, and lowering long-term maintenance cost and technical debt.")
bullet("Integrated C360 Customer and Account REST APIs to enrich Linked Account data with Open Date, Military Lending Act (MLA), and State APR regulatory indicators, and optimized API orchestration to eliminate redundant GAR API calls — strengthening data accuracy, regulatory compliance, and response times.")
bullet("Designed and delivered configurable, template-driven communication frameworks with reason-code governance for SCRA benefit enrollment, banking dispute resolution, and Caselite, and automated acknowledgment emails post case creation — standardizing card-member outreach and reducing manual CCP workload.")
bullet("Built a centralized OneData UI abstracting and securing database CRUD operations — eliminating direct manual database access, mitigating credential-exposure risk, and laying the groundwork for role-based access control (RBAC).")
bullet("Delivered an Advanced Search capability (name, email, phone) for banking cases and onboarded new SCRA workbaskets and case types (KYC Refresh, BSA Attachment) — accelerating case discovery and reducing turnaround time for benefit-enrollment requests.")
bullet("Owned end-to-end resolution of critical production incidents for CBR cases, independently root-causing and fixing a correlation-ID mapping defect in ACE API integration; stabilized E2/E3 environments and executed zero-defect SCRA Phase-2 deployments across E3 and E3-SL (PIV), strengthening platform reliability and release quality.")
bullet("Remediated 100% of critical and high Twistlock security vulnerabilities in caselite-automation, contributed to the Jenkins-to-GitHub Actions CI/CD migration, and mentored new engineers through knowledge-transfer sessions on system design and delivery practices.")
gap()

two_col("Jubilant Foodworks Ltd.", "Gurugram, Haryana")
two_col("Software Engineer", "August 2022 – September 2024", bold=False)
bullet("Led the design discussions and development of a high-availability nextgen order management system microservices architecture using SOLID principles and maximum code coverage, resulting in a 30% increase in system performance and reliability.")
bullet("Implemented MongoDB as the principal database solution, enhancing data storage and retrieval efficiency for a high-volume application.")
bullet("Employed Agile methodologies to implement Order History, Promo Integration in OMS, Advance Order, and Cancel Order, and continuously improved the functionality and performance of the Order Tracker and OMS Service.")
bullet("Built real-time data streaming pipelines using Kafka for Bulk Promo Rollback, capturing menu-sync events and order status updates for real-time analysis and faster business decision-making.")
bullet("Implemented Quartz Scheduler to identify and manage canceled orders — loyalty and promo rollback, refunds, and retries of failed advance orders for store delivery.")
bullet("Collaborated closely with 5+ cross-functional teams to gather requirements, define system architecture, and ensure alignment with business objectives.")
gap()

two_col("IndiaMart InterMesh Ltd.", "Noida, Uttar Pradesh")
two_col("Software Engineer", "July 2021 – July 2022", bold=False)
bullet("Developed RESTful APIs in Spring Boot for reply mailers and their consumer files, optimizing communication processes and enhancing system efficiency.")
bullet("Created dynamic HTML email templates during the migration of consumer files to a centralized service, ensuring consistency across platforms and devices.")
bullet("Implemented CI/CD pipelines to automate the deployment process, streamlining development workflows.")
gap()

story.append(PageBreak())
two_col("IndiaMart InterMesh Ltd.", "Noida, Uttar Pradesh")
two_col("Software Engineer – Intern", "April 2021 – June 2021", bold=False)
bullet("Implemented RabbitMQ and Java to include reply snippets on the buyer side of SMS and personalised reply mailers.")

header("SKILLS")
for label, items in [
    ("Languages &amp; Frameworks: ", "Java 21, Python, Spring Boot, Hibernate, REST APIs, Data Structures &amp; Algorithms"),
    ("AI &amp; Automation: ", "Agentic AI, LangChain, Hugging Face, Llama, Prompt Engineering"),
    ("Data &amp; Messaging: ", "MongoDB, SQL, PostgreSQL, Kafka, RabbitMQ"),
    ("Platforms &amp; DevOps: ", "Kubernetes, AWS, Git, GitHub Actions, Jenkins, CI/CD, BPMN"),
]:
    story.append(Paragraph(f"<b>{label}</b>{items}", body))

header("CERTIFICATIONS")
bullet("Build with AI: Autonomous Agents with LangChain and Hugging Face")

header("EDUCATION")
two_col("Harcourt Butler Technical University (H.B.T.U)", "Kanpur, Uttar Pradesh")
two_col("Bachelor of Technology, Computer Science &amp; Engineering · GPA: 8.215", "August 2017 – June 2021", bold=False)
two_col("Central Academy", "Basti, Uttar Pradesh")
two_col("Intermediate · 92.20%", "March 2016 – May 2017", bold=False)
two_col("St. Basil's School", "Basti, Uttar Pradesh")
two_col("High School · 89.33%", "March 2014 – May 2015", bold=False)

header("LEADERSHIP EXPERIENCE")
two_col("Events Head", "HBTU · March 2019")
story.append(Paragraph("Spearheaded a team of 60 as Events Head &amp; Stage Management Head and successfully organized ADHYAAY-19, the Techno-Cultural Fest of HBTU.", body))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=0.45 * inch, bottomMargin=0.45 * inch,
                        title="Nikita Singh — Resume", author="Nikita Singh")
doc.build(story)
print("saved", OUT)
