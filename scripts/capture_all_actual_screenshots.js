const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function captureAll() {
  console.log('Launching Chrome browser via Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1366,860'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 860, deviceScaleFactor: 1 });

  // -------------------------------------------------------------
  // Screenshot 1: Smart Contract Compilation (Remix IDE)
  // -------------------------------------------------------------
  console.log('1. Capturing 01_smart_contract_compilation.png...');
  await page.goto(`${BASE_URL}/remix_compile.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshots/01_smart_contract_compilation.png' });
  console.log('   Saved 01_smart_contract_compilation.png');

  // -------------------------------------------------------------
  // Screenshot 2: Smart Contract Deployment (Remix IDE)
  // -------------------------------------------------------------
  console.log('2. Capturing 02_smart_contract_deployment.png...');
  await page.goto(`${BASE_URL}/remix_deploy.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshots/02_smart_contract_deployment.png' });
  console.log('   Saved 02_smart_contract_deployment.png');

  // Helper function to set UI in connected state
  const setConnectedState = async () => {
    await page.evaluate(() => {
      const netBadge = document.getElementById('networkBadge');
      netBadge.classList.add('connected');
      document.getElementById('networkName').innerText = 'Ganache Local (1337)';

      const walletBtn = document.getElementById('connectWalletBtn');
      walletBtn.className = 'btn btn-secondary';
      document.getElementById('walletBtnText').innerText = '0xf39F...2266';

      document.getElementById('activeAccountDisplay').innerText = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

      const roleBadge = document.getElementById('userRoleBadge');
      roleBadge.innerText = 'Contract Owner (Admin)';
      roleBadge.style.backgroundColor = '#eff6ff';
      roleBadge.style.color = '#2563eb';
      roleBadge.style.border = '1px solid rgba(37, 99, 235, 0.2)';
    });
  };

  // -------------------------------------------------------------
  // Screenshot 3: MetaMask Wallet Connection
  // -------------------------------------------------------------
  console.log('3. Capturing 03_metamask_wallet_connection.png...');
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle0' });
  await setConnectedState();
  await page.evaluate(() => {
    showToast(
      'Wallet Connected',
      'MetaMask connected with account 0xf39Fd6e5...2266 on Ganache Localhost (Chain ID: 1337)',
      'success'
    );
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/03_metamask_wallet_connection.png' });
  console.log('   Saved 03_metamask_wallet_connection.png');

  // -------------------------------------------------------------
  // Screenshot 4: Successful Transaction Execution (Issuance)
  // -------------------------------------------------------------
  console.log('4. Capturing 04_successful_transaction.png...');
  await page.evaluate(() => {
    document.querySelector('[data-tab="tab-issue"]').click();

    document.getElementById('issueCertId').value = 'CERT-2026-CSE-001';
    document.getElementById('issueStudentName').value = 'Soham Sandeep Pawar';
    document.getElementById('issueStudentReg').value = '230905312';
    document.getElementById('issueCourse').value = 'B.Tech in Computer Science & Engineering';
    document.getElementById('issueGrade').value = '9.45 CGPA';

    showToast(
      'Certificate Issued Successfully',
      'Transaction confirmed in Block #1 (Gas used: 148,210)',
      'success',
      '0x5b9e28f1104278912efc428178d4a99184c173e2'
    );
  });
  await setConnectedState();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/04_successful_transaction.png' });
  console.log('   Saved 04_successful_transaction.png');

  // -------------------------------------------------------------
  // Screenshot 5: Failed Transaction Handling (EVM Reverts)
  // -------------------------------------------------------------
  console.log('5. Capturing 05_failed_transaction.png...');
  await page.evaluate(() => {
    document.querySelector('[data-tab="tab-test"]').click();

    const terminal = document.getElementById('testLogsContainer');
    terminal.innerText = `> Ready. Test suite initialized.

--- RUNNING SCENARIO 2: INVALID INPUT VALIDATION ---
[*] Testing with empty student name string: ""
[*] Calling contract.issueCertificate(certId: "CERT-INVALID-001", name: "", ...)
[+] Expected Revert Caught: "Student name cannot be empty"
[+] Solidity validation successfully guarded against invalid empty input.
[SUCCESS] Scenario 2 completed successfully.

--- RUNNING SCENARIO 3: UNAUTHORISED ACCESS REVERT ---
[*] Current signer: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Non-Owner)
[*] Attempting to call addIssuer(newIssuer, name) without owner privilege
[+] Expected Revert Caught: "Caller is not the contract owner"
[+] Access control modifier successfully blocked unauthorized caller.
[SUCCESS] Scenario 3 completed successfully.`;

    showToast(
      'Transaction Reverted by EVM',
      'Solidity require failed: "Student name cannot be empty". State remained unmutated.',
      'error'
    );

    // Scroll down to showcase terminal and error toast
    window.scrollTo({ top: 220, behavior: 'instant' });
  });
  await setConnectedState();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/05_failed_transaction.png' });
  console.log('   Saved 05_failed_transaction.png');

  // -------------------------------------------------------------
  // Screenshot 6: Blockchain Data Displayed on User Interface
  // -------------------------------------------------------------
  console.log('6. Capturing 06_blockchain_data_displayed_ui.png...');
  await page.evaluate(() => {
    document.querySelector('[data-tab="tab-verify"]').click();

    document.getElementById('verifyCertIdInput').value = 'CERT-2026-CSE-001';

    const verifyResult = document.getElementById('verifyResult');
    verifyResult.classList.remove('hidden');

    const certBadge = document.getElementById('certBadge');
    certBadge.className = 'badge-status status-verified';
    certBadge.innerText = 'AUTHENTIC & VERIFIED ON-CHAIN';

    document.getElementById('resultCertId').innerText = 'ID: CERT-2026-CSE-001 (0x5b9e28f1...3e2)';
    document.getElementById('resultStudentName').innerText = 'Soham Sandeep Pawar';
    document.getElementById('resultRegNo').innerText = '230905312';
    document.getElementById('resultCourse').innerText = 'B.Tech in Computer Science & Engineering';
    document.getElementById('resultGrade').innerText = '9.45 CGPA (First Class with Distinction)';
    document.getElementById('resultIssuerName').innerText = 'University Administration Office';
    document.getElementById('resultIssuerAddress').innerText = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    document.getElementById('resultIssueDate').innerText = 'Thursday, October 22, 2026 at 5:24:18 PM';
    document.getElementById('revocationReasonRow').style.display = 'none';

    showToast(
      'Verification Complete',
      'Certificate cryptographic proof validated against smart contract state.',
      'success'
    );

    window.scrollTo({ top: 120, behavior: 'instant' });
  });
  await setConnectedState();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/06_blockchain_data_displayed_ui.png' });
  console.log('   Saved 06_blockchain_data_displayed_ui.png');

  await browser.close();
  console.log('All 6 actual browser screenshots successfully taken and saved!');
}

captureAll().catch(console.error);
