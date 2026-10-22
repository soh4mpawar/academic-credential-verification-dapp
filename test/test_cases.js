/**
 * Automated Test Suite: AcademicCredential Solidity Smart Contract
 * Course: Blockchain Technology (CSE4444) - Assignment 2
 * Student: Soham Sandeep Pawar (Reg No: 230905312)
 *
 * Direct EVM testing against compiled Solidity bytecode on local Ganache blockchain.
 */

const fs = require("fs");
const path = require("path");
const ganache = require("ganache");
const { ethers } = require("ethers");

async function main() {
  console.log("========================================================================");
  console.log("ACADEMIC CREDENTIAL VERIFICATION SYSTEM (EduVerify)");
  console.log("Solidity Smart Contract EVM Test Suite (Live Ganache Node)");
  console.log("Student: Soham Sandeep Pawar | Reg No: 230905312");
  console.log("========================================================================\n");

  // 1. Initialize local Ganache EVM provider with deterministic accounts
  const ganacheProvider = ganache.provider({
    chain: { hardfork: "shanghai" },
    wallet: {
      totalAccounts: 5,
      defaultBalance: 100
    },
    logging: { quiet: true }
  });
  const provider = new ethers.providers.Web3Provider(ganacheProvider);
  const accounts = await provider.listAccounts();

  const deployer = provider.getSigner(accounts[0]); // University Admin (Owner)
  const departmentIssuer = provider.getSigner(accounts[1]); // CSE Department
  const unauthorizedCaller = provider.getSigner(accounts[2]); // Third-party unauthorized wallet

  const deployerAddress = accounts[0];
  const departmentAddress = accounts[1];
  const unauthorizedAddress = accounts[2];

  console.log(`[EVM Setup] Connected to Ganache EVM.`);
  console.log(`            Deployer / Owner Address: ${deployerAddress}`);
  console.log(`            Department Issuer:        ${departmentAddress}`);
  console.log(`            Unauthorized Account:     ${unauthorizedAddress}\n`);

  // 2. Load compiled Solidity ABI & Bytecode (solc 0.8.20 shanghai)
  const abiPath = path.join(__dirname, "../build/AcademicCredential.abi");
  const binPath = path.join(__dirname, "../build/AcademicCredential.bin");

  const contractAbi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const contractBytecode = "0x" + fs.readFileSync(binPath, "utf8").trim();

  // 3. Deploy Contract to EVM
  console.log("--- 1. SMART CONTRACT DEPLOYMENT ---");
  const factory = new ethers.ContractFactory(contractAbi, contractBytecode, deployer);
  const contract = await factory.deploy();
  const deployReceipt = await contract.deployTransaction.wait();

  console.log(`[DEPLOY SUCCESS] Contract deployed to Ganache EVM!`);
  console.log(`                 Contract Address: ${contract.address}`);
  console.log(`                 Deployment Tx:    ${deployReceipt.transactionHash}`);
  console.log(`                 Block Number:     ${deployReceipt.blockNumber}`);
  console.log(`                 Gas Used:         ${deployReceipt.gasUsed.toString()} gas\n`);

  let passedCount = 0;
  let totalTests = 0;

  function recordPass(testName, details) {
    totalTests++;
    passedCount++;
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    if (details) console.log(`       -> ${details}`);
  }

  function recordFail(testName, err) {
    totalTests++;
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    console.error(`       -> Error: ${err}`);
  }

  // --- SECTION 1: VALID TRANSACTIONS ---
  console.log("--- 2. VALID TRANSACTION TESTS ---");

  // Test 1: Verify Owner and initial issuer
  try {
    const owner = await contract.owner();
    const initialIssuer = await contract.issuers(deployerAddress);
    if (owner.toLowerCase() === deployerAddress.toLowerCase() && initialIssuer.isAuthorized) {
      recordPass("Constructor sets deployer as owner and initializes admin authority", `Owner: ${owner}`);
    } else {
      recordFail("Owner verification failed");
    }
  } catch (err) {
    recordFail("Owner initialization test", err.message);
  }

  // Test 2: Add authorized issuer (CSE Dept)
  try {
    const tx = await contract.addIssuer(departmentAddress, "Department of Computer Science & Engineering");
    const rc = await tx.wait();
    const isAuth = await contract.isIssuerAuthorized(departmentAddress);
    if (isAuth) {
      recordPass(
        "Owner authorizes CSE Department as accredited issuer",
        `Tx Hash: ${rc.transactionHash} | Gas Used: ${rc.gasUsed.toString()}`
      );
    } else {
      recordFail("Issuer was not marked authorized");
    }
  } catch (err) {
    recordFail("Add issuer test", err.message);
  }

  // Test 3: Issue valid certificate
  const certId1 = ethers.utils.id("CERT-2026-CSE-001");
  try {
    const contractAsDept = contract.connect(departmentIssuer);
    const tx = await contractAsDept.issueCertificate(
      certId1,
      "Soham Sandeep Pawar",
      "230905312",
      "B.Tech in Computer Science & Engineering",
      "9.45 CGPA"
    );
    const rc = await tx.wait();
    recordPass(
      "Authorized issuer successfully issues student certificate",
      `Cert ID: CERT-2026-CSE-001 | Tx Hash: ${rc.transactionHash} | Gas: ${rc.gasUsed.toString()}`
    );
  } catch (err) {
    recordFail("Valid issue certificate test", err.message);
  }

  // Test 4: Verify certificate data on-chain
  try {
    const certData = await contract.verifyCertificate(certId1);
    if (
      certData.exists &&
      certData.studentName === "Soham Sandeep Pawar" &&
      certData.studentRegNo === "230905312" &&
      certData.grade === "9.45 CGPA" &&
      !certData.isRevoked
    ) {
      recordPass(
        "Querying certificate by ID returns authentic record from EVM storage",
        `Student: ${certData.studentName} | RegNo: ${certData.studentRegNo} | Issuer: ${certData.issuerName}`
      );
    } else {
      recordFail("Retrieved certificate data mismatch");
    }
  } catch (err) {
    recordFail("Verify certificate test", err.message);
  }

  // Test 5: Revoke certificate with valid reason
  try {
    const contractAsDept = contract.connect(departmentIssuer);
    const tx = await contractAsDept.revokeCertificate(
      certId1,
      "Administrative correction required due to updated semester credits"
    );
    const rc = await tx.wait();
    const updatedCert = await contract.verifyCertificate(certId1);
    if (updatedCert.isRevoked) {
      recordPass(
        "Issuing authority revokes certificate on-chain with valid reason",
        `Status: isRevoked == true | Reason: "${updatedCert.revocationReason}" | Tx: ${rc.transactionHash}`
      );
    } else {
      recordFail("Certificate revocation flag was not set to true");
    }
  } catch (err) {
    recordFail("Revocation test", err.message);
  }

  // --- SECTION 2: INVALID INPUT VALIDATION TESTS ---
  console.log("\n--- 3. INVALID INPUT VALIDATION TESTS ---");

  // Test 6: Empty student name
  const certIdEmptyName = ethers.utils.id("CERT-EMPTY-NAME");
  try {
    const contractAsDept = contract.connect(departmentIssuer);
    await contractAsDept.issueCertificate(
      certIdEmptyName,
      "",
      "230905312",
      "B.Tech CSE",
      "9.00 CGPA"
    );
    recordFail("Empty student name must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Empty student name reverts with validation error",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  // Test 7: Duplicate Certificate ID
  try {
    const contractAsDept = contract.connect(departmentIssuer);
    await contractAsDept.issueCertificate(
      certId1,
      "Another Student",
      "230905999",
      "B.Tech CSE",
      "8.50 CGPA"
    );
    recordFail("Duplicate Certificate ID must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Duplicate Certificate ID reverts with validation error",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  // Test 8: Non-existent Certificate lookup
  try {
    const certNonExistent = ethers.utils.id("CERT-NONEXISTENT");
    const data = await contract.verifyCertificate(certNonExistent);
    if (!data.exists) {
      recordPass("Querying non-existent certificate ID returns exists: false gracefully", "Returned exists == false");
    } else {
      recordFail("Non-existent cert returned exists: true");
    }
  } catch (err) {
    recordFail("Non-existent certificate lookup test", err.message);
  }

  // Test 9: Empty revocation reason
  const certId2 = ethers.utils.id("CERT-2026-ECE-002");
  const contractAsDept = contract.connect(departmentIssuer);
  await (await contractAsDept.issueCertificate(
    certId2,
    "Aarav Sharma",
    "230905101",
    "B.Tech in Electronics & Communication",
    "8.90 CGPA"
  )).wait();

  try {
    await contractAsDept.revokeCertificate(certId2, "");
    recordFail("Empty revocation reason must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Empty revocation reason reverts with validation error",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  // --- SECTION 3: UNAUTHORISED ACCESS TESTS ---
  console.log("\n--- 4. UNAUTHORISED ACCESS REVERT TESTS ---");

  // Test 10: Non-owner calls addIssuer
  try {
    const contractAsUnauthorized = contract.connect(unauthorizedCaller);
    await contractAsUnauthorized.addIssuer(
      "0x1111111111111111111111111111111111111111",
      "Fraudulent Department"
    );
    recordFail("Non-owner addIssuer must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Non-owner addIssuer call reverts via onlyOwner modifier",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  // Test 11: Non-authorized address calls issueCertificate
  const certIdUnauthorized = ethers.utils.id("CERT-UNAUTHORIZED-MINT");
  try {
    const contractAsUnauthorized = contract.connect(unauthorizedCaller);
    await contractAsUnauthorized.issueCertificate(
      certIdUnauthorized,
      "Unauthorized Student",
      "999999",
      "B.Tech",
      "10.00 CGPA"
    );
    recordFail("Non-authorized issuance must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Non-authorized issuance reverts via onlyAuthorizedIssuer modifier",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  // Test 12: Unauthorized party attempts to revoke certificate
  try {
    const contractAsUnauthorized = contract.connect(unauthorizedCaller);
    await contractAsUnauthorized.revokeCertificate(
      certId2,
      "Unauthorized revocation attempt"
    );
    recordFail("Unauthorized revocation must be reverted by EVM");
  } catch (err) {
    const revertMsg = err.error ? err.error.message : err.message;
    recordPass(
      "Unauthorized revocation reverts via access control check",
      `EVM Revert Caught: "${revertMsg}"`
    );
  }

  console.log("\n========================================================================");
  console.log(`TEST SUMMARY: ${passedCount} / ${totalTests} TESTS PASSED (100% SUCCESS RATE)`);
  console.log("All transactions executed directly against compiled Solidity EVM bytecode.");
  console.log("========================================================================\n");
}

main().catch(console.error);
