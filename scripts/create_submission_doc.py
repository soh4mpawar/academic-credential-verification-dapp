import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

doc = docx.Document()

# Page Margins
sections = doc.sections
for section in sections:
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.65)
    section.right_margin = Inches(0.65)

# Helper styling functions
def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_hyperlink(paragraph, url, text):
    part = paragraph.part
    r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
    hyperlink = parse_xml(f'<w:hyperlink {nsdecls("w")} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{r_id}"><w:r><w:rPr><w:color w:val="2563EB"/><w:u w:val="single"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr><w:t>{text}</w:t></w:r></w:hyperlink>')
    paragraph._p.append(hyperlink)

# Title Block
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run_inst = p_title.add_run("MANIPAL INSTITUTE OF TECHNOLOGY\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n")
run_inst.font.name = "Calibri"
run_inst.font.size = Pt(13)
run_inst.font.bold = True
run_inst.font.color.rgb = RGBColor(15, 23, 42)

run_sub = p_title.add_run("BLOCKCHAIN TECHNOLOGY (CSE4444) — ASSIGNMENT 2\n")
run_sub.font.name = "Calibri"
run_sub.font.size = Pt(15)
run_sub.font.bold = True
run_sub.font.color.rgb = RGBColor(37, 99, 235)

p_rule = doc.add_paragraph()
p_rule.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_rule = p_rule.add_run("―" * 65)
r_rule.font.color.rgb = RGBColor(203, 213, 225)

# Student & Submission Metadata Table
table = doc.add_table(rows=5, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit = False

metadata = [
    ("Student Name:", "Soham Sandeep Pawar", False),
    ("Registration Number:", "230905312", False),
    ("Assignment Title:", "Design and Development of an Original DApp (Assignment 2)", False),
    ("Title of Developed DApp:", "Decentralized Academic Credential Verification System (EduVerify)", False),
    ("GitHub Repository Link:", "https://github.com/soh4mpawar/academic-credential-verification-dapp", True)
]

for idx, (label, val, is_link) in enumerate(metadata):
    row = table.rows[idx]
    
    # Col 0: Label
    cell0 = row.cells[0]
    cell0.width = Inches(2.0)
    p0 = cell0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r0 = p0.add_run(label)
    r0.font.name = "Calibri"
    r0.font.size = Pt(10)
    r0.font.bold = True
    r0.font.color.rgb = RGBColor(30, 41, 59)
    set_cell_background(cell0, "F1F5F9")
    set_cell_margins(cell0, 70, 70, 100, 100)
    
    # Col 1: Value
    cell1 = row.cells[1]
    cell1.width = Inches(5.2) # Wide enough so URL never wraps across lines!
    p1 = cell1.paragraphs[0]
    if is_link:
        add_hyperlink(p1, val, val)
    else:
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(10)
        if "Soham" in val or "230905312" in val or "EduVerify" in val:
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(15, 23, 42)
        else:
            r1.font.color.rgb = RGBColor(51, 65, 85)
    set_cell_background(cell1, "FFFFFF")
    set_cell_margins(cell1, 70, 70, 100, 100)

doc.add_paragraph() # Spacer

# Section 1: Problem Description
h1 = doc.add_heading("1. Problem Description & Real-World Motivation", level=2)
h1.style.font.color.rgb = RGBColor(30, 41, 59)

p_desc = doc.add_paragraph(
    "Academic credential fraud, including counterfeit degree certificates and unverified grade submissions, "
    "presents a severe problem for universities, employers, and professional licensing authorities. Traditional "
    "verification workflows require manual inquiries, letters of confirmation, or centralized third-party registries, "
    "all of which suffer from significant delays, administrative expenses, and vulnerabilities to single-point failure.\n\n"
    "To resolve this, EduVerify implements a decentralized academic credential registry built on the Ethereum blockchain. "
    "The system allows accredited universities and departments to mint immutable academic certificates for graduates. "
    "Each certificate is identified by a unique cryptographic identifier and records the student's name, roll number, "
    "course, cumulative grade, issuing authority, and timestamp. Prospective employers or verification agencies can instantly "
    "validate authenticity directly against smart contract state without relying on centralized intermediaries."
)
p_desc.style.font.name = "Calibri"
p_desc.style.font.size = Pt(10)

# Section 2: Smart Contract & Frontend Architecture
h2 = doc.add_heading("2. Smart Contract & Frontend Architecture", level=2)
h2.style.font.color.rgb = RGBColor(30, 41, 59)

p_arch = doc.add_paragraph(
    "The decentralized application is structured as follows:\n"
    "• Smart Contract (AcademicCredential.sol): Implemented in Solidity ^0.8.20. Maintains access-controlled registries "
    "for authorized issuers and students' academic records, with built-in validation preventing empty inputs, duplicate certificate IDs, "
    "and unauthorized state modifications.\n"
    "• Frontend Interface: Modern web interface built using HTML5, CSS3, and JavaScript, providing dedicated workflows "
    "for Public Certificate Verification, Credential Issuance, Revocation, and Administrative Issuer Management.\n"
    "• Web3 & MetaMask Integration: Implemented using Ethers.js v5.7.2 connecting to the Ethereum blockchain via window.ethereum "
    "for transaction signing, balance querying, role detection, and event synchronization."
)
p_arch.style.font.name = "Calibri"
p_arch.style.font.size = Pt(10)

# Section 3: Test Cases & Experimental Results
h3 = doc.add_heading("3. Test Cases & Verification Results", level=2)
h3.style.font.color.rgb = RGBColor(30, 41, 59)

p_test_desc = doc.add_paragraph(
    "The system was evaluated against valid, invalid, and unauthorized inputs in accordance with the assignment guidelines. "
    "All test scenarios executed with expected state transitions and revert behaviors:"
)
p_test_desc.style.font.name = "Calibri"
p_test_desc.style.font.size = Pt(10)

test_table = doc.add_table(rows=7, cols=5)
test_table.alignment = WD_TABLE_ALIGNMENT.CENTER

headers = ["Test ID", "Category", "Description / Input", "Observed EVM Behavior", "Status"]
header_row = test_table.rows[0]
for idx, text in enumerate(headers):
    cell = header_row.cells[idx]
    set_cell_background(cell, "1E293B")
    p = cell.paragraphs[0]
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(9.5)
    r.font.bold = True
    r.font.color.rgb = RGBColor(255, 255, 255)
    set_cell_margins(cell, 60, 60, 80, 80)

test_rows_data = [
    ("TC-01", "Valid", "Owner authorizes CSE Department (0x7099...)", "Issuer added, state updated, event emitted", "PASS"),
    ("TC-02", "Valid", "Issue valid credential (CERT-2026-CSE-001)", "Transaction mined, block confirmed, record stored", "PASS"),
    ("TC-03", "Valid", "Public query of valid Certificate ID", "Returns student details with Authentic badge", "PASS"),
    ("TC-04", "Invalid Input", "Issue certificate with empty student name (\"\")", "EVM Revert: 'Student name cannot be empty'", "PASS"),
    ("TC-05", "Invalid Input", "Issue certificate with duplicate ID", "EVM Revert: 'Certificate with this ID already exists'", "PASS"),
    ("TC-06", "Unauthorised", "Non-owner attempts to call addIssuer(...)", "EVM Revert: 'Caller is not the contract owner'", "PASS")
]

for row_idx, data in enumerate(test_rows_data):
    row = test_table.rows[row_idx + 1]
    bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
    for col_idx, text in enumerate(data):
        cell = row.cells[col_idx]
        set_cell_background(cell, bg_color)
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        if text == "PASS":
            r.font.bold = True
            r.font.color.rgb = RGBColor(22, 163, 74)
        elif "Revert" in text:
            r.font.color.rgb = RGBColor(220, 38, 38)
        else:
            r.font.color.rgb = RGBColor(30, 41, 59)
        set_cell_margins(cell, 50, 50, 70, 70)

doc.add_page_break()

# Section 4: Visual Evidence & Screenshots
h4 = doc.add_heading("4. Visual Evidence & Execution Screenshots", level=2)
h4.style.font.color.rgb = RGBColor(30, 41, 59)

screenshots = [
    ("Figure 1: Smart Contract Compilation in Remix IDE (Solidity v0.8.20)", "screenshots/01_smart_contract_compilation.png"),
    ("Figure 2: Smart Contract Deployment on Ganache Local Network", "screenshots/02_smart_contract_deployment.png"),
    ("Figure 3: MetaMask Wallet Connection & User Role Detection", "screenshots/03_metamask_wallet_connection.png"),
    ("Figure 4: Successful Credential Issuance Transaction Execution", "screenshots/04_successful_transaction.png"),
    ("Figure 5: Transaction Revert Handling (Invalid Input & Unauthorised Call)", "screenshots/05_failed_transaction.png"),
    ("Figure 6: Blockchain Data Query & Certificate Verification Interface", "screenshots/06_blockchain_data_displayed_ui.png")
]

for title, path in screenshots:
    p_fig_title = doc.add_paragraph()
    r_fig = p_fig_title.add_run(title)
    r_fig.font.name = "Calibri"
    r_fig.font.size = Pt(10)
    r_fig.font.bold = True
    r_fig.font.color.rgb = RGBColor(30, 41, 59)
    
    if os.path.exists(path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(path, width=Inches(6.2))
    
    doc.add_paragraph() # Spacing

output_path = "SohamPawar_230905312_BT_Assignment2.docx"
doc.save(output_path)
print(f"Document successfully created: {output_path}")
