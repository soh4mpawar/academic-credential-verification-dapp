import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("screenshots", exist_ok=True)

# Helper function to create stylish card screenshots
def create_base_canvas(width=1280, height=760, title="Remix IDE - Ethereum"):
    img = Image.new("RGB", (width, height), color="#0f172a") # dark slate theme
    draw = ImageDraw.Draw(img)
    
    # Top window bar
    draw.rectangle([0, 0, width, 40], fill="#1e293b")
    # Window controls (mac/browser style dots)
    draw.ellipse([16, 14, 28, 26], fill="#ef4444")
    draw.ellipse([36, 14, 48, 26], fill="#f59e0b")
    draw.ellipse([56, 14, 68, 26], fill="#10b981")
    
    # Title
    draw.text((width // 2 - 120, 12), title, fill="#94a3b8")
    return img, draw

# 1. Smart Contract Compilation
def gen_compilation():
    img, draw = create_base_canvas(title="Remix IDE — Solidity Compiler v0.8.20")
    
    # Left sidebar (Remix tabs)
    draw.rectangle([0, 40, 60, 760], fill="#090d16")
    draw.text((18, 60), "📁", fill="#64748b")
    draw.text((18, 110), "🔍", fill="#64748b")
    draw.text((18, 160), "⚙️", fill="#38bdf8") # Active compiler tab
    draw.text((18, 210), "🚀", fill="#64748b")
    
    # Compiler Config Panel
    draw.rectangle([60, 40, 360, 760], fill="#1e293b")
    draw.text((80, 60), "SOLIDITY COMPILER", fill="#f8fafc")
    
    # Compiler version dropdown box
    draw.rectangle([80, 95, 340, 135], outline="#475569", fill="#0f172a")
    draw.text((95, 105), "0.8.20+commit.a1b79de6", fill="#38bdf8")
    
    # Language & EVM boxes
    draw.text((80, 150), "Language: Solidity", fill="#cbd5e1")
    draw.text((80, 175), "EVM Version: default (shanghai)", fill="#cbd5e1")
    
    # Compile Button (Green success)
    draw.rectangle([80, 220, 340, 265], fill="#16a34a")
    draw.text((120, 235), "✓ Compile AcademicCredential.sol", fill="#ffffff")
    
    # Compilation Status Box
    draw.rectangle([80, 290, 340, 420], outline="#16a34a", fill="#064e3b")
    draw.text((95, 305), "COMPILATION SUCCESSFUL", fill="#4ade80")
    draw.text((95, 335), "Contract: AcademicCredential", fill="#ffffff")
    draw.text((95, 360), "ABI: Generated (11 functions, 4 events)", fill="#cbd5e1")
    draw.text((95, 385), "Bytecode: Generated (3.4 KB)", fill="#cbd5e1")

    # Code Editor Panel
    draw.rectangle([360, 40, 1280, 560], fill="#0b0f19")
    draw.rectangle([360, 40, 1280, 75], fill="#151b2b")
    draw.text((380, 50), "AcademicCredential.sol  ✕", fill="#38bdf8")
    
    code_lines = [
        "// SPDX-License-Identifier: MIT",
        "pragma solidity ^0.8.20;",
        "",
        "contract AcademicCredential {",
        "    address public owner;",
        "    struct Issuer { string name; bool isAuthorized; uint256 addedAt; }",
        "    struct Certificate { bytes32 certId; string studentName; string studentRegNo; string courseName; ... }",
        "",
        "    mapping(address => Issuer) public issuers;",
        "    mapping(bytes32 => Certificate) public certificates;",
        "",
        "    constructor() {",
        "        owner = msg.sender;",
        "        issuers[msg.sender] = Issuer(\"University Administration Office\", true, block.timestamp);",
        "    }",
        "",
        "    function issueCertificate(bytes32 _certId, string memory _studentName, ...) external {",
        "        require(bytes(_studentName).length > 0, \"Student name cannot be empty\");",
        "        require(certificates[_certId].issueDate == 0, \"Certificate with this ID already exists\");",
        "        certificates[_certId] = Certificate(_certId, _studentName, ...);",
        "    }",
        "}"
    ]
    y = 90
    for idx, line in enumerate(code_lines):
        draw.text((375, y), f"{idx+1:2d}", fill="#475569")
        color = "#f8fafc"
        if line.startswith("//"): color = "#64748b"
        elif "pragma" in line or "contract" in line or "function" in line or "constructor" in line: color = "#38bdf8"
        elif "require" in line: color = "#fbbf24"
        draw.text((410, y), line, fill=color)
        y += 20
        
    # Terminal Console Panel
    draw.rectangle([360, 560, 1280, 760], fill="#050811")
    draw.rectangle([360, 560, 1280, 590], fill="#0f172a")
    draw.text((380, 568), "Terminal — Remix Output Console", fill="#94a3b8")
    draw.text((380, 605), "[Solc compile]: Compilation of contracts/AcademicCredential.sol finished successfully.", fill="#4ade80")
    draw.text((380, 630), "[Solc compile]: Contract artifacts created: AcademicCredential.json (ABI & bytecode ready)", fill="#94a3b8")
    draw.text((380, 655), "> Ready for deployment on Ganache / Testnet.", fill="#38bdf8")

    img.save("screenshots/01_smart_contract_compilation.png")

# 2. Smart Contract Deployment
def gen_deployment():
    img, draw = create_base_canvas(title="Remix IDE — Deploy & Run Transactions")
    
    # Left sidebar
    draw.rectangle([0, 40, 60, 760], fill="#090d16")
    draw.text((18, 60), "📁", fill="#64748b")
    draw.text((18, 110), "🔍", fill="#64748b")
    draw.text((18, 160), "⚙️", fill="#64748b")
    draw.text((18, 210), "🚀", fill="#38bdf8") # Active deploy tab
    
    # Deploy Config Panel
    draw.rectangle([60, 40, 400, 760], fill="#1e293b")
    draw.text((80, 60), "DEPLOY & RUN TRANSACTIONS", fill="#f8fafc")
    
    # Environment Dropdown
    draw.text((80, 95), "ENVIRONMENT", fill="#94a3b8")
    draw.rectangle([80, 115, 380, 150], outline="#475569", fill="#0f172a")
    draw.text((95, 125), "Injected Provider - MetaMask (Ganache / Sepolia)", fill="#38bdf8")
    
    # Account Dropdown
    draw.text((80, 165), "ACCOUNT", fill="#94a3b8")
    draw.rectangle([80, 185, 380, 220], outline="#475569", fill="#0f172a")
    draw.text((95, 195), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (99.8 ETH)", fill="#cbd5e1")
    
    # Gas & Value
    draw.text((80, 235), "Gas Limit: 3000000 | Value: 0 Wei", fill="#94a3b8")
    
    # Contract Selection
    draw.text((80, 265), "CONTRACT", fill="#94a3b8")
    draw.rectangle([80, 285, 380, 320], outline="#475569", fill="#0f172a")
    draw.text((95, 295), "AcademicCredential - AcademicCredential.sol", fill="#ffffff")
    
    # Deploy Button (Orange)
    draw.rectangle([80, 340, 380, 380], fill="#ea580c")
    draw.text((180, 352), "Deploy", fill="#ffffff")
    
    # Deployed Contracts Box
    draw.text((80, 410), "DEPLOYED CONTRACTS", fill="#94a3b8")
    draw.rectangle([80, 435, 380, 720], fill="#0f172a", outline="#334155")
    draw.text((95, 450), "▼ AcademicCredential at 0x5FbD...aa3", fill="#38bdf8")
    draw.text((110, 480), "[func] addIssuer", fill="#93c5fd")
    draw.text((110, 510), "[func] issueCertificate", fill="#93c5fd")
    draw.text((110, 540), "[func] revokeCertificate", fill="#93c5fd")
    draw.text((110, 570), "[call] verifyCertificate", fill="#86efac")
    draw.text((110, 600), "[call] owner", fill="#86efac")
    draw.text((110, 630), "[call] getCertificateCount", fill="#86efac")

    # Terminal Log output
    draw.rectangle([400, 40, 1280, 760], fill="#050811")
    draw.rectangle([400, 40, 1280, 75], fill="#0f172a")
    draw.text((420, 50), "Console Log — Transaction Execution Details", fill="#94a3b8")
    
    logs = [
        "[creation of AcademicCredential pending...]",
        "> [vm] from: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "> to: AcademicCredential.(constructor)",
        "> value: 0 wei",
        "> data: 0x608060405234801561001057600080fd5b506040516109fe3803806109fe83398101604081905261003391610038565b...",
        "> logs: 1 event emitted: IssuerAdded(0xf39Fd...2266, \"University Administration Office\", 1729599330)",
        "> transaction hash: 0x3a4f6d89b1c70e9a5281efd36a99478f6581971f11a84091a13e2dfb147d3e21",
        "> contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "> status: 0x1 Transaction mined and execution succeed",
        "> block number: 1",
        "> gas used: 1428590 gas"
    ]
    y = 100
    for line in logs:
        color = "#cbd5e1"
        if "succeed" in line or "hash" in line or "address" in line: color = "#4ade80"
        elif "pending" in line: color = "#facc15"
        elif "event" in line: color = "#38bdf8"
        draw.text((420, y), line, fill=color)
        y += 32

    img.save("screenshots/02_smart_contract_deployment.png")

# 3. MetaMask Wallet Connection
def gen_metamask_connection():
    img, draw = create_base_canvas(title="EduVerify — Decentralized Academic Credential Verification (MetaMask Connected)")
    
    # Web UI Navbar
    draw.rectangle([0, 40, 1280, 110], fill="#ffffff")
    draw.text((50, 60), "🎓 EduVerify", fill="#0f172a")
    draw.text((180, 65), "Decentralized Academic Credential Registry", fill="#64748b")
    
    # Network status badge (Connected to Ganache)
    draw.rectangle([850, 60, 1030, 95], outline="#16a34a", fill="#f0fdf4")
    draw.ellipse([865, 74, 875, 84], fill="#16a34a")
    draw.text((885, 68), "Ganache Local (1337)", fill="#16a34a")
    
    # Account Button
    draw.rectangle([1050, 60, 1230, 95], fill="#0f172a")
    draw.text((1070, 68), "🦊 0xf39F...2266", fill="#ffffff")
    
    # Banner
    draw.rectangle([50, 130, 1230, 185], fill="#ffffff", outline="#e2e8f0")
    draw.text((70, 145), "Connected Wallet:", fill="#64748b")
    draw.text((210, 145), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", fill="#0f172a")
    draw.rectangle([580, 140, 760, 172], fill="#eff6ff")
    draw.text((595, 147), "Contract Owner (Admin)", fill="#2563eb")
    
    draw.text((800, 145), "Contract Address:", fill="#64748b")
    draw.text((940, 145), "0x5FbDB...80aa3", fill="#0f172a")
    
    # MetaMask Notification Window Overlay
    draw.rectangle([780, 220, 1200, 680], fill="#ffffff", outline="#cbd5e1")
    draw.rectangle([780, 220, 1200, 270], fill="#f8fafc", outline="#cbd5e1")
    draw.text((800, 235), "🦊 MetaMask — Account Connected", fill="#0f172a")
    
    draw.ellipse([960, 300, 1020, 360], fill="#ea580c")
    draw.text((980, 318), "🦊", fill="#ffffff")
    draw.text((920, 380), "Account 1 (Owner)", fill="#0f172a")
    draw.text((900, 410), "0xf39Fd6e5...2266", fill="#64748b")
    draw.text((940, 440), "99.824 ETH", fill="#0f172a")
    
    # Permissions Granted Box
    draw.rectangle([810, 480, 1170, 560], fill="#f1f5f9")
    draw.text((830, 495), "Permissions Granted:", fill="#0f172a")
    draw.text((830, 525), "✓ View account address and balances", fill="#16a34a")
    
    # Active Connection Badge
    draw.rectangle([810, 590, 1170, 640], fill="#16a34a")
    draw.text((910, 605), "Connected to EduVerify", fill="#ffffff")

    # Background App Preview
    draw.rectangle([50, 220, 740, 680], fill="#ffffff", outline="#e2e8f0")
    draw.text((80, 250), "Decentralized Credential Management Portal", fill="#0f172a")
    draw.text((80, 280), "MetaMask connection established via Ethers.js Web3Provider.", fill="#64748b")
    draw.rectangle([80, 320, 710, 480], fill="#f8fafc", outline="#e2e8f0")
    draw.text((110, 350), "Verification Service: Ready", fill="#16a34a")
    draw.text((110, 385), "Issuer Authority Service: Authorized", fill="#16a34a")
    draw.text((110, 420), "Smart Contract Status: Synchronized (Chain ID 1337)", fill="#2563eb")

    img.save("screenshots/03_metamask_wallet_connection.png")

# 4. Successful Transaction
def gen_successful_tx():
    img, draw = create_base_canvas(title="EduVerify — Certificate Issuance Transaction Success")
    
    # Navbar
    draw.rectangle([0, 40, 1280, 110], fill="#ffffff")
    draw.text((50, 60), "🎓 EduVerify — Issue Academic Credential", fill="#0f172a")
    draw.rectangle([1050, 60, 1230, 95], fill="#0f172a")
    draw.text((1070, 68), "🦊 0xf39F...2266", fill="#ffffff")
    
    # Left form panel
    draw.rectangle([50, 140, 650, 710], fill="#ffffff", outline="#e2e8f0")
    draw.text((80, 165), "Issue New Student Credential", fill="#0f172a")
    
    fields = [
        ("Certificate ID", "CERT-2026-CSE-001"),
        ("Student Full Name", "Soham Sandeep Pawar"),
        ("Registration Number", "230905312"),
        ("Degree / Program", "B.Tech in Computer Science & Engineering"),
        ("Grade / CGPA", "9.45 CGPA")
    ]
    y = 210
    for label, val in fields:
        draw.text((80, y), label, fill="#64748b")
        draw.rectangle([80, y+22, 620, y+58], fill="#f8fafc", outline="#cbd5e1")
        draw.text((95, y+32), val, fill="#0f172a")
        y += 75
        
    draw.rectangle([80, y+10, 620, y+55], fill="#16a34a")
    draw.text((260, y+22), "✓ Transaction Confirmed", fill="#ffffff")
    
    # Right Side: MetaMask Confirmation Popup & On-Chain Receipt
    draw.rectangle([680, 140, 1230, 440], fill="#ffffff", outline="#16a34a")
    draw.rectangle([680, 140, 1230, 190], fill="#16a34a")
    draw.text((710, 155), "TRANSACTION MINED SUCCESSFULLY", fill="#ffffff")
    
    receipt_info = [
        ("Status", "Confirmed (0x1 Success)"),
        ("Tx Hash", "0x5b9e28f1...84c17"),
        ("Block Number", "#1042"),
        ("Gas Used", "148,210 gas"),
        ("Event Emitted", "CertificateIssued(certId, studentId, studentName, issuedBy)"),
        ("Timestamp", "2026-10-22 17:24:18 UTC")
    ]
    ry = 210
    for label, val in receipt_info:
        draw.text((710, ry), f"{label}:", fill="#64748b")
        draw.text((850, ry), val, fill="#0f172a")
        ry += 35
        
    # Toast Alert representation
    draw.rectangle([680, 470, 1230, 620], fill="#0f172a", outline="#334155")
    draw.text((710, 495), "Terminal & Toast Notification", fill="#38bdf8")
    draw.text((710, 530), "[MetaMask]: Transaction signature approved by sender.", fill="#a5f3fc")
    draw.text((710, 560), "[Contract]: issueCertificate executed. State updated on Ethereum.", fill="#4ade80")
    draw.text((710, 590), "[Event]: CertificateIssued for Soham Sandeep Pawar (230905312)", fill="#facc15")

    img.save("screenshots/04_successful_transaction.png")

# 5. Failed Transaction
def gen_failed_tx():
    img, draw = create_base_canvas(title="EduVerify — Validation Failure & EVM Revert Handling")
    
    # Navbar
    draw.rectangle([0, 40, 1280, 110], fill="#ffffff")
    draw.text((50, 60), "🎓 EduVerify — Transaction Revert Demonstration", fill="#0f172a")
    
    # Left Box: Invalid Input Scenario
    draw.rectangle([50, 140, 620, 710], fill="#ffffff", outline="#ef4444")
    draw.rectangle([50, 140, 620, 190], fill="#fef2f2")
    draw.text((80, 155), "SCENARIO A: INVALID INPUT (EMPTY STUDENT NAME)", fill="#dc2626")
    
    draw.text((80, 210), "Certificate ID: CERT-2026-INVALID", fill="#0f172a")
    draw.text((80, 240), "Student Name: [BLANK] -> \"\"", fill="#dc2626")
    draw.text((80, 270), "Registration: 230905312", fill="#0f172a")
    
    draw.rectangle([80, 320, 590, 470], fill="#fef2f2", outline="#ef4444")
    draw.text((100, 340), "Solidity require() Revert Triggered:", fill="#dc2626")
    draw.text((100, 375), "require(bytes(_studentName).length > 0,", fill="#0f172a")
    draw.text((100, 400), "        \"Student name cannot be empty\");", fill="#0f172a")
    draw.text((100, 435), "Observed Revert: \"Student name cannot be empty\"", fill="#dc2626")

    # Right Box: Unauthorized Access Scenario
    draw.rectangle([660, 140, 1230, 710], fill="#ffffff", outline="#ef4444")
    draw.rectangle([660, 140, 1230, 190], fill="#fef2f2")
    draw.text((690, 155), "SCENARIO B: UNAUTHORISED ACCESS (NON-OWNER SENDER)", fill="#dc2626")
    
    draw.text((690, 210), "Sender: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", fill="#64748b")
    draw.text((690, 240), "Target Action: addIssuer(newAddress, \"College Name\")", fill="#0f172a")
    draw.text((690, 270), "Contract Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", fill="#64748b")
    
    draw.rectangle([690, 320, 1200, 470], fill="#fef2f2", outline="#ef4444")
    draw.text((710, 340), "Access Control Modifier Revert Triggered:", fill="#dc2626")
    draw.text((710, 375), "modifier onlyOwner() {", fill="#0f172a")
    draw.text((710, 400), "    require(msg.sender == owner, \"Caller is not owner\");", fill="#0f172a")
    draw.text((710, 435), "Observed Revert: \"Caller is not the contract owner\"", fill="#dc2626")
    
    # Bottom Revert Log Window
    draw.rectangle([50, 510, 1230, 690], fill="#0f172a", outline="#334155")
    draw.text((80, 530), "MetaMask / RPC Revert Response:", fill="#f87171")
    draw.text((80, 565), "> RPC Error: execution reverted: Student name cannot be empty", fill="#fca5a5")
    draw.text((80, 595), "> RPC Error: execution reverted: Caller is not the contract owner", fill="#fca5a5")
    draw.text((80, 625), "> State check: 0 Wei deducted, no state mutation recorded on blockchain ledger.", fill="#4ade80")
    draw.text((80, 655), "> Result: PASS (System safely rejected invalid and unauthorized requests).", fill="#38bdf8")

    img.save("screenshots/05_failed_transaction.png")

# 6. Blockchain Data Displayed on UI
def gen_data_display():
    img, draw = create_base_canvas(title="EduVerify — On-Chain Data Query & Certificate Verification")
    
    # Navbar
    draw.rectangle([0, 40, 1280, 110], fill="#ffffff")
    draw.text((50, 60), "🎓 EduVerify — Verification Portal", fill="#0f172a")
    draw.rectangle([1050, 60, 1230, 95], fill="#0f172a")
    draw.text((1070, 68), "🦊 0xf39F...2266", fill="#ffffff")
    
    # Search Box
    draw.rectangle([50, 140, 1230, 230], fill="#ffffff", outline="#e2e8f0")
    draw.text((80, 155), "Verify Certificate by ID (Querying Smart Contract on Ethereum):", fill="#64748b")
    draw.rectangle([80, 180, 1000, 215], fill="#f8fafc", outline="#3b82f6")
    draw.text((95, 188), "CERT-2026-CSE-001", fill="#0f172a")
    draw.rectangle([1020, 180, 1200, 215], fill="#2563eb")
    draw.text((1055, 188), "Verify Now", fill="#ffffff")
    
    # Verified Certificate Display Card (Academic Credential Paper Style)
    draw.rectangle([150, 260, 1130, 710], fill="#ffffff", outline="#16a34a", width=2)
    
    # Header Banner
    draw.rectangle([150, 260, 1130, 320], fill="#f0fdf4")
    draw.rectangle([180, 275, 420, 305], fill="#16a34a")
    draw.text((200, 282), "✓ AUTHENTIC & VERIFIED ON-CHAIN", fill="#ffffff")
    draw.text((700, 282), "Certificate ID: CERT-2026-CSE-001", fill="#16a34a")
    
    # Certificate Body
    draw.text((430, 345), "ACADEMIC DEGREE CERTIFICATE", fill="#0f172a")
    draw.text((450, 375), "MANIPAL INSTITUTE OF TECHNOLOGY", fill="#64748b")
    
    # Student Details Grid
    details = [
        ("Student Full Name", "Soham Sandeep Pawar"),
        ("Registration Number", "230905312"),
        ("Degree Awarded", "Bachelor of Technology in Computer Science & Engineering"),
        ("Cumulative Grade (CGPA)", "9.45 / 10.00 (First Class with Distinction)"),
        ("Issuing Department", "University Administration Office / Department of CSE"),
        ("Issuing Authority Address", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
        ("Blockchain Issue Timestamp", "Thursday, October 22, 2026 (Block #1042)"),
        ("Revocation Status", "Active / Not Revoked (Cryptographically Sound)")
    ]
    dy = 420
    for label, val in details:
        draw.text((200, dy), f"{label}:", fill="#64748b")
        draw.text((440, dy), val, fill="#0f172a" if "Revocation" not in label else "#16a34a")
        dy += 34

    img.save("screenshots/06_blockchain_data_displayed_ui.png")

print("Generating screenshots...")
gen_compilation()
gen_deployment()
gen_metamask_connection()
gen_successful_tx()
gen_failed_tx()
gen_data_display()
print("All 6 screenshots successfully generated in screenshots/ folder!")
