// Application State
let provider = null;
let signer = null;
let currentAccount = null;
let currentNetwork = null;
let contract = null;

// Default local/Ganache deployed address (can be updated via UI)
let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// DOM Elements
const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletBtnText = document.getElementById("walletBtnText");
const networkBadge = document.getElementById("networkBadge");
const networkNameEl = document.getElementById("networkName");
const activeAccountDisplay = document.getElementById("activeAccountDisplay");
const userRoleBadge = document.getElementById("userRoleBadge");
const contractAddressInput = document.getElementById("contractAddressInput");
const updateContractBtn = document.getElementById("updateContractBtn");

// Tab Navigation
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Toast
const toastBox = document.getElementById("toastBox");
const toastIcon = document.getElementById("toastIcon");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toastTxLink = document.getElementById("toastTxLink");
const closeToastBtn = document.getElementById("closeToastBtn");

// Verification Elements
const verifyCertIdInput = document.getElementById("verifyCertIdInput");
const verifyBtn = document.getElementById("verifyBtn");
const verifyResult = document.getElementById("verifyResult");
const certStatusBanner = document.getElementById("certStatusBanner");
const certBadge = document.getElementById("certBadge");
const resultCertId = document.getElementById("resultCertId");
const resultStudentName = document.getElementById("resultStudentName");
const resultRegNo = document.getElementById("resultRegNo");
const resultCourse = document.getElementById("resultCourse");
const resultGrade = document.getElementById("resultGrade");
const resultIssuerName = document.getElementById("resultIssuerName");
const resultIssuerAddress = document.getElementById("resultIssuerAddress");
const resultIssueDate = document.getElementById("resultIssueDate");
const revocationReasonRow = document.getElementById("revocationReasonRow");
const resultRevocationReason = document.getElementById("resultRevocationReason");
const samplePills = document.querySelectorAll(".sample-pill");

// Issue Form Elements
const issueForm = document.getElementById("issueForm");
const issueCertId = document.getElementById("issueCertId");
const issueStudentName = document.getElementById("issueStudentName");
const issueStudentReg = document.getElementById("issueStudentReg");
const issueCourse = document.getElementById("issueCourse");
const issueGrade = document.getElementById("issueGrade");
const generateCertIdBtn = document.getElementById("generateCertIdBtn");
const fillSampleIssueBtn = document.getElementById("fillSampleIssueBtn");
const submitIssueBtn = document.getElementById("submitIssueBtn");

// Revoke Form Elements
const revokeForm = document.getElementById("revokeForm");
const revokeCertId = document.getElementById("revokeCertId");
const revokeReason = document.getElementById("revokeReason");
const submitRevokeBtn = document.getElementById("submitRevokeBtn");

// Admin Elements
const addIssuerForm = document.getElementById("addIssuerForm");
const issuerAddress = document.getElementById("issuerAddress");
const issuerName = document.getElementById("issuerName");
const revokeIssuerForm = document.getElementById("revokeIssuerForm");
const revokeIssuerAddress = document.getElementById("revokeIssuerAddress");

// Test Scenarios
const runValidTestBtn = document.getElementById("runValidTestBtn");
const runInvalidTestBtn = document.getElementById("runInvalidTestBtn");
const runUnauthorizedTestBtn = document.getElementById("runUnauthorizedTestBtn");
const testLogsContainer = document.getElementById("testLogsContainer");
const clearLogsBtn = document.getElementById("clearLogsBtn");

// Initialize on page load
window.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupSamplePills();
  initToast();

  const savedAddress = localStorage.getItem("eduverify_contract_address");
  if (savedAddress && ethers.utils.isAddress(savedAddress)) {
    contractAddress = savedAddress;
    contractAddressInput.value = savedAddress;
  }

  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    // Check if already connected
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      await setupAccount(accounts[0]);
    }

    // Listen to MetaMask events
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length > 0) {
        await setupAccount(accounts[0]);
        appendLog(`[MetaMask] Switched account: ${accounts[0]}`);
      } else {
        resetAccount();
        appendLog(`[MetaMask] Wallet disconnected.`);
      }
    });

    window.ethereum.on("chainChanged", async (chainIdHex) => {
      window.location.reload();
    });
  } else {
    showToast("MetaMask Missing", "Please install MetaMask extension to interact with the blockchain.", "error");
    networkNameEl.innerText = "No Web3 Provider";
  }
});

// Tab Switching
function setupTabs() {
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// Sample IDs Click
function setupSamplePills() {
  samplePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      verifyCertIdInput.value = pill.getAttribute("data-id");
      verifyCertificate();
    });
  });
}

// Update Contract Address
updateContractBtn.addEventListener("click", () => {
  const inputVal = contractAddressInput.value.trim();
  if (!ethers.utils.isAddress(inputVal)) {
    showToast("Invalid Address", "Please provide a valid 20-byte Ethereum address (0x...).", "error");
    return;
  }
  contractAddress = inputVal;
  localStorage.setItem("eduverify_contract_address", contractAddress);
  initContract();
  showToast("Contract Updated", `Target contract address set to: ${contractAddress.slice(0, 10)}...`, "info");
});

// Connect MetaMask
connectWalletBtn.addEventListener("click", async () => {
  if (!window.ethereum) {
    showToast("MetaMask Required", "MetaMask extension was not detected. Please install it.", "error");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length > 0) {
      await setupAccount(accounts[0]);
      showToast("Wallet Connected", `Connected as ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, "success");
    }
  } catch (err) {
    console.error(err);
    showToast("Connection Rejected", err.message || "User rejected connection request.", "error");
  }
});

async function setupAccount(account) {
  currentAccount = account;
  signer = provider.getSigner();

  // Display details
  activeAccountDisplay.innerText = `${account.slice(0, 6)}...${account.slice(-4)}`;
  walletBtnText.innerText = `${account.slice(0, 6)}...${account.slice(-4)}`;
  connectWalletBtn.classList.remove("btn-primary");
  connectWalletBtn.classList.add("btn-secondary");

  // Network info
  const net = await provider.getNetwork();
  currentNetwork = net;
  networkBadge.classList.add("connected");
  networkNameEl.innerText = getFriendlyNetworkName(net.chainId, net.name);

  // Initialize Contract instance
  initContract();

  // Update role badge
  await refreshUserRole();
}

function resetAccount() {
  currentAccount = null;
  signer = null;
  contract = null;
  activeAccountDisplay.innerText = "None";
  walletBtnText.innerText = "Connect MetaMask";
  connectWalletBtn.classList.add("btn-primary");
  connectWalletBtn.classList.remove("btn-secondary");
  userRoleBadge.innerText = "Guest Verifier";
  userRoleBadge.style.background = "";
  userRoleBadge.style.color = "";
}

function getFriendlyNetworkName(chainId, defaultName) {
  switch (chainId) {
    case 1: return "Ethereum Mainnet";
    case 11155111: return "Sepolia Testnet";
    case 1337:
    case 5777: return "Ganache / Localhost";
    case 31337: return "Hardhat Local";
    default: return defaultName || `Chain ID ${chainId}`;
  }
}

function initContract() {
  if (!provider) return;
  const runner = signer || provider;
  try {
    contract = new ethers.Contract(contractAddress, CONTRACT_ABI, runner);
  } catch (err) {
    console.error("Failed to instantiate contract", err);
  }
}

async function refreshUserRole() {
  if (!contract || !currentAccount) {
    userRoleBadge.innerText = "Guest Verifier";
    return;
  }

  try {
    const ownerAddr = await contract.owner();
    if (ownerAddr.toLowerCase() === currentAccount.toLowerCase()) {
      userRoleBadge.innerText = "Contract Owner (Admin)";
      userRoleBadge.style.background = "#eff6ff";
      userRoleBadge.style.color = "#2563eb";
      return;
    }

    const isAuth = await contract.isIssuerAuthorized(currentAccount);
    if (isAuth) {
      userRoleBadge.innerText = "Authorized Issuer";
      userRoleBadge.style.background = "#f0fdf4";
      userRoleBadge.style.color = "#16a34a";
      return;
    }

    userRoleBadge.innerText = "Public Verifier";
    userRoleBadge.style.background = "#f1f5f9";
    userRoleBadge.style.color = "#64748b";
  } catch (err) {
    console.warn("Could not determine user role:", err);
    userRoleBadge.innerText = "Connected";
  }
}

// Convert user string or hex into bytes32
function toBytes32(inputStr) {
  const trimmed = inputStr.trim();
  if (trimmed.startsWith("0x") && trimmed.length === 66) {
    return trimmed;
  }
  // Otherwise generate keccak256 hash of the input string
  return ethers.utils.id(trimmed);
}

// ----------------------------------------------------------------------
// TAB 1: Verify Certificate
// ----------------------------------------------------------------------
verifyBtn.addEventListener("click", verifyCertificate);
verifyCertIdInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") verifyCertificate();
});

async function verifyCertificate() {
  const rawId = verifyCertIdInput.value.trim();
  if (!rawId) {
    showToast("Input Required", "Please enter a Certificate ID to verify.", "warning");
    return;
  }

  if (!contract) {
    initContract();
  }

  const bytes32Id = toBytes32(rawId);
  verifyResult.classList.remove("hidden");
  certStatusBanner.className = "cert-status-banner";
  certBadge.className = "badge-status";
  certBadge.innerText = "QUERYING...";
  resultCertId.innerText = `ID: ${rawId} (${bytes32Id.slice(0, 10)}...)`;

  try {
    const data = await contract.verifyCertificate(bytes32Id);

    if (!data.exists) {
      certBadge.className = "badge-status status-notfound";
      certBadge.innerText = "RECORD NOT FOUND";
      resultStudentName.innerText = "No Record";
      resultRegNo.innerText = "-";
      resultCourse.innerText = "-";
      resultGrade.innerText = "-";
      resultIssuerName.innerText = "-";
      resultIssuerAddress.innerText = "-";
      resultIssueDate.innerText = "-";
      revocationReasonRow.style.display = "none";
      return;
    }

    resultStudentName.innerText = data.studentName;
    resultRegNo.innerText = data.studentRegNo;
    resultCourse.innerText = data.courseName;
    resultGrade.innerText = data.grade;
    resultIssuerName.innerText = data.issuerName;
    resultIssuerAddress.innerText = data.issuedBy;
    resultIssueDate.innerText = new Date(data.issueDate.toNumber() * 1000).toLocaleString();

    if (data.isRevoked) {
      certBadge.className = "badge-status status-revoked";
      certBadge.innerText = "REVOKED / INVALID";
      revocationReasonRow.style.display = "flex";
      resultRevocationReason.innerText = data.revocationReason || "No explanation recorded.";
    } else {
      certBadge.className = "badge-status status-verified";
      certBadge.innerText = "AUTHENTIC & VERIFIED";
      revocationReasonRow.style.display = "none";
    }
  } catch (err) {
    console.error("Verification failed:", err);
    showToast("Query Error", err.reason || err.message || "Failed to query contract on-chain.", "error");
  }
}

// ----------------------------------------------------------------------
// TAB 2: Issue Certificate
// ----------------------------------------------------------------------
generateCertIdBtn.addEventListener("click", () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  issueCertId.value = `CERT-2026-CSE-${randomSuffix}`;
});

fillSampleIssueBtn.addEventListener("click", () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  issueCertId.value = `CERT-2026-CSE-${randomSuffix}`;
  issueStudentName.value = "Soham Sandeep Pawar";
  issueStudentReg.value = "230905312";
  issueCourse.value = "B.Tech in Computer Science & Engineering";
  issueGrade.value = "9.45 CGPA";
});

issueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!signer) {
    showToast("Wallet Required", "Please connect MetaMask with an authorized account.", "warning");
    return;
  }

  const certIdStr = issueCertId.value.trim();
  const name = issueStudentName.value.trim();
  const regNo = issueStudentReg.value.trim();
  const course = issueCourse.value.trim();
  const grade = issueGrade.value.trim();

  if (!certIdStr || !name || !regNo || !course || !grade) {
    showToast("Validation Error", "All fields are required.", "warning");
    return;
  }

  const bytes32Id = toBytes32(certIdStr);

  try {
    submitIssueBtn.disabled = true;
    submitIssueBtn.innerText = "Submitting Transaction...";

    const tx = await contract.issueCertificate(bytes32Id, name, regNo, course, grade);
    showToast("Transaction Broadcast", `Tx Hash: ${tx.hash.slice(0, 10)}... Confirming...`, "info", tx.hash);
    appendLog(`[Issue] Broadcasted transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    showToast("Certificate Issued", `Confirmed in block #${receipt.blockNumber}`, "success", tx.hash);
    appendLog(`[Issue] Confirmed in block ${receipt.blockNumber}. Gas Used: ${receipt.gasUsed.toString()}`);

    // Pre-fill verify tab
    verifyCertIdInput.value = certIdStr;
    issueForm.reset();
  } catch (err) {
    console.error("Issuance failed:", err);
    const msg = parseRevertReason(err);
    showToast("Issuance Failed", msg, "error");
    appendLog(`[Error] Issuance rejected: ${msg}`);
  } finally {
    submitIssueBtn.disabled = false;
    submitIssueBtn.innerHTML = `<span>Sign & Issue on Blockchain</span>`;
  }
});

// ----------------------------------------------------------------------
// TAB 3: Revoke Certificate
// ----------------------------------------------------------------------
revokeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!signer) {
    showToast("Wallet Required", "Please connect MetaMask first.", "warning");
    return;
  }

  const rawId = revokeCertId.value.trim();
  const reason = revokeReason.value.trim();

  if (!rawId || !reason) {
    showToast("Validation Error", "Certificate ID and revocation reason are required.", "warning");
    return;
  }

  const bytes32Id = toBytes32(rawId);

  try {
    submitRevokeBtn.disabled = true;
    submitRevokeBtn.innerText = "Submitting Revocation...";

    const tx = await contract.revokeCertificate(bytes32Id, reason);
    showToast("Transaction Broadcast", `Tx Hash: ${tx.hash.slice(0, 10)}... Confirming...`, "info", tx.hash);
    appendLog(`[Revoke] Broadcasted transaction: ${tx.hash}`);

    const receipt = await tx.wait();
    showToast("Certificate Revoked", `Successfully revoked in block #${receipt.blockNumber}`, "success", tx.hash);
    appendLog(`[Revoke] Confirmed in block ${receipt.blockNumber}. Certificate ID: ${rawId}`);

    revokeForm.reset();
  } catch (err) {
    console.error("Revocation failed:", err);
    const msg = parseRevertReason(err);
    showToast("Revocation Failed", msg, "error");
    appendLog(`[Error] Revocation rejected: ${msg}`);
  } finally {
    submitRevokeBtn.disabled = false;
    submitRevokeBtn.innerHTML = `<span>Revoke Certificate</span>`;
  }
});

// ----------------------------------------------------------------------
// TAB 4: Manage Issuers (Admin)
// ----------------------------------------------------------------------
addIssuerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!signer) {
    showToast("Wallet Required", "Please connect MetaMask.", "warning");
    return;
  }

  const addr = issuerAddress.value.trim();
  const name = issuerName.value.trim();

  if (!ethers.utils.isAddress(addr)) {
    showToast("Invalid Address", "Please enter a valid Ethereum address.", "warning");
    return;
  }
  if (!name) {
    showToast("Invalid Name", "Issuer name cannot be empty.", "warning");
    return;
  }

  try {
    const tx = await contract.addIssuer(addr, name);
    showToast("Authorizing Issuer", `Transaction sent: ${tx.hash.slice(0, 10)}...`, "info", tx.hash);
    appendLog(`[Admin] Authorizing issuer ${addr} (${name})`);

    const receipt = await tx.wait();
    showToast("Issuer Authorized", `Successfully registered in block #${receipt.blockNumber}`, "success", tx.hash);
    appendLog(`[Admin] Issuer registered in block ${receipt.blockNumber}`);
    addIssuerForm.reset();
  } catch (err) {
    const msg = parseRevertReason(err);
    showToast("Authorization Failed", msg, "error");
    appendLog(`[Error] Authorization failed: ${msg}`);
  }
});

revokeIssuerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!signer) {
    showToast("Wallet Required", "Please connect MetaMask.", "warning");
    return;
  }

  const addr = revokeIssuerAddress.value.trim();
  if (!ethers.utils.isAddress(addr)) {
    showToast("Invalid Address", "Please enter a valid Ethereum address.", "warning");
    return;
  }

  try {
    const tx = await contract.revokeIssuer(addr);
    showToast("Revoking Authority", `Transaction sent: ${tx.hash.slice(0, 10)}...`, "info", tx.hash);
    appendLog(`[Admin] Revoking authorization for ${addr}`);

    const receipt = await tx.wait();
    showToast("Issuer Revoked", `Authority revoked in block #${receipt.blockNumber}`, "success", tx.hash);
    appendLog(`[Admin] Issuer revoked in block ${receipt.blockNumber}`);
    revokeIssuerForm.reset();
  } catch (err) {
    const msg = parseRevertReason(err);
    showToast("Revocation Failed", msg, "error");
    appendLog(`[Error] Revocation failed: ${msg}`);
  }
});

// ----------------------------------------------------------------------
// TAB 5: Test Scenarios
// ----------------------------------------------------------------------
runValidTestBtn.addEventListener("click", async () => {
  appendLog("\n--- RUNNING SCENARIO 1: VALID TRANSACTION ---");
  if (!signer) {
    appendLog("[-] Failed: MetaMask wallet not connected.");
    showToast("Connect Wallet", "Please connect your wallet first.", "warning");
    return;
  }

  const testId = `CERT-TEST-VALID-${Date.now().toString().slice(-4)}`;
  const bytes32Id = toBytes32(testId);
  appendLog(`[*] Generating credential ID: ${testId}`);
  appendLog(`[*] Converted bytes32: ${bytes32Id}`);
  appendLog(`[*] Calling contract.issueCertificate(...)`);

  try {
    const tx = await contract.issueCertificate(
      bytes32Id,
      "Soham Sandeep Pawar",
      "230905312",
      "B.Tech in Computer Science & Engineering",
      "9.45 CGPA"
    );
    appendLog(`[+] Transaction submitted! Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    appendLog(`[+] Transaction confirmed in block #${receipt.blockNumber}! Gas used: ${receipt.gasUsed.toString()}`);

    // Verify on-chain data retrieval
    appendLog(`[*] Reading back verification data...`);
    const verified = await contract.verifyCertificate(bytes32Id);
    appendLog(`[+] Retrieval Success:`);
    appendLog(`    - Name: ${verified.studentName}`);
    appendLog(`    - Reg No: ${verified.studentRegNo}`);
    appendLog(`    - Course: ${verified.courseName}`);
    appendLog(`    - Grade: ${verified.grade}`);
    appendLog(`    - Issuer: ${verified.issuerName} (${verified.issuedBy})`);
    appendLog(`    - Revoked Status: ${verified.isRevoked}`);
    appendLog(`[SUCCESS] Scenario 1 completed successfully.`);
    showToast("Scenario 1 Passed", "Valid certificate issued and verified on-chain.", "success", tx.hash);
  } catch (err) {
    const msg = parseRevertReason(err);
    appendLog(`[-] Test Execution Error: ${msg}`);
    showToast("Test Failed", msg, "error");
  }
});

runInvalidTestBtn.addEventListener("click", async () => {
  appendLog("\n--- RUNNING SCENARIO 2: INVALID INPUT VALIDATION ---");
  if (!signer) {
    appendLog("[-] Failed: MetaMask wallet not connected.");
    showToast("Connect Wallet", "Please connect your wallet first.", "warning");
    return;
  }

  const testId = `CERT-TEST-INVALID-${Date.now()}`;
  const bytes32Id = toBytes32(testId);
  appendLog(`[*] Testing with empty student name string: ""`);
  appendLog(`[*] Calling contract.issueCertificate(..., name: "", ...)`);

  try {
    // Calling with empty student name: triggers require(bytes(_studentName).length > 0)
    const tx = await contract.issueCertificate(
      bytes32Id,
      "",
      "230905312",
      "B.Tech in Computer Science & Engineering",
      "9.45 CGPA"
    );
    await tx.wait();
    appendLog(`[-] Unexpected: Transaction did not revert.`);
  } catch (err) {
    const msg = parseRevertReason(err);
    appendLog(`[+] Expected Revert Caught: "${msg}"`);
    appendLog(`[+] Solidity validation successfully guarded against invalid empty input.`);
    appendLog(`[SUCCESS] Scenario 2 completed successfully.`);
    showToast("Scenario 2 Passed", `Caught expected revert: ${msg}`, "success");
  }
});

runUnauthorizedTestBtn.addEventListener("click", async () => {
  appendLog("\n--- RUNNING SCENARIO 3: UNAUTHORISED ACTION REVERT ---");
  if (!signer) {
    appendLog("[-] Failed: MetaMask wallet not connected.");
    showToast("Connect Wallet", "Please connect your wallet first.", "warning");
    return;
  }

  appendLog(`[*] Current signer: ${currentAccount}`);
  appendLog(`[*] Attempting to call addIssuer(...) as arbitrary account`);

  try {
    // Attempting to call addIssuer from an unauthorized account
    const dummyAccount = "0x000000000000000000000000000000000000dEaD";
    const tx = await contract.addIssuer(dummyAccount, "Unauthorized University Entity");
    await tx.wait();
    appendLog(`[-] Unexpected: Action succeeded without owner privilege.`);
  } catch (err) {
    const msg = parseRevertReason(err);
    appendLog(`[+] Expected Revert Caught: "${msg}"`);
    appendLog(`[+] Access control modifier successfully blocked unauthorized caller.`);
    appendLog(`[SUCCESS] Scenario 3 completed successfully.`);
    showToast("Scenario 3 Passed", `Caught expected revert: ${msg}`, "success");
  }
});

clearLogsBtn.addEventListener("click", () => {
  testLogsContainer.innerText = "> Logs cleared. Ready.";
});

function appendLog(line) {
  testLogsContainer.innerText += `\n${line}`;
  testLogsContainer.scrollTop = testLogsContainer.scrollHeight;
}

// ----------------------------------------------------------------------
// Helper Utilities
// ----------------------------------------------------------------------
function parseRevertReason(err) {
  if (err.data && err.data.message) return err.data.message;
  if (err.error && err.error.message) return err.error.message;
  if (err.reason) return err.reason;
  if (err.message) {
    const revertMatch = err.message.match(/execution reverted: (.*?)"/);
    if (revertMatch && revertMatch[1]) return revertMatch[1];
    if (err.message.includes("user rejected")) return "User rejected transaction in MetaMask";
    return err.message.slice(0, 100);
  }
  return "Transaction reverted without reason.";
}

function initToast() {
  closeToastBtn.addEventListener("click", () => {
    toastBox.classList.add("hidden");
  });
}

function showToast(title, message, type = "info", txHash = null) {
  toastTitle.innerText = title;
  toastMessage.innerText = message;

  if (type === "success") {
    toastIcon.innerText = "✅";
  } else if (type === "error") {
    toastIcon.innerText = "❌";
  } else if (type === "warning") {
    toastIcon.innerText = "⚠️";
  } else {
    toastIcon.innerText = "ℹ️";
  }

  if (txHash) {
    toastTxLink.classList.remove("hidden");
    toastTxLink.innerText = `Tx: ${txHash}`;
  } else {
    toastTxLink.classList.add("hidden");
  }

  toastBox.classList.remove("hidden");
  setTimeout(() => {
    toastBox.classList.add("hidden");
  }, 7000);
}
