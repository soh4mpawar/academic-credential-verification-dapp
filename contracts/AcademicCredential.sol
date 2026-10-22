// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AcademicCredential
 * @dev Decentralized academic credential issuance and verification registry.
 */
contract AcademicCredential {
    address public owner;

    struct Issuer {
        string name;
        bool isAuthorized;
        uint256 addedAt;
    }

    struct Certificate {
        bytes32 certId;
        string studentName;
        string studentRegNo;
        string courseName;
        string grade;
        uint256 issueDate;
        address issuedBy;
        bool isRevoked;
        string revocationReason;
    }

    // Address to Issuer details
    mapping(address => Issuer) public issuers;

    // Certificate ID to Certificate details
    mapping(bytes32 => Certificate) public certificates;

    // List of all issued certificate IDs for enumeration
    bytes32[] public certificateList;

    // Events
    event IssuerAdded(address indexed issuerAddress, string issuerName, uint256 timestamp);
    event IssuerRevoked(address indexed issuerAddress, uint256 timestamp);
    event CertificateIssued(
        bytes32 indexed certId,
        string studentRegNo,
        string studentName,
        address indexed issuedBy,
        uint256 timestamp
    );
    event CertificateRevoked(
        bytes32 indexed certId,
        string reason,
        address indexed revokedBy,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the contract owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            issuers[msg.sender].isAuthorized || msg.sender == owner,
            "Caller is not authorized to issue certificates"
        );
        _;
    }

    /**
     * @dev Sets deployer as owner and registers initial admin authority.
     */
    constructor() {
        owner = msg.sender;
        issuers[msg.sender] = Issuer({
            name: "University Administration Office",
            isAuthorized: true,
            addedAt: block.timestamp
        });
        emit IssuerAdded(msg.sender, "University Administration Office", block.timestamp);
    }

    /**
     * @notice Authorize an academic institution or department to issue credentials.
     * @param _issuerAddress Wallet address of the institution/faculty.
     * @param _issuerName Name of the department or institution.
     */
    function addIssuer(address _issuerAddress, string memory _issuerName) external onlyOwner {
        require(_issuerAddress != address(0), "Invalid issuer address");
        require(bytes(_issuerName).length > 0, "Issuer name cannot be empty");
        require(!issuers[_issuerAddress].isAuthorized, "Issuer is already authorized");

        issuers[_issuerAddress] = Issuer({
            name: _issuerName,
            isAuthorized: true,
            addedAt: block.timestamp
        });

        emit IssuerAdded(_issuerAddress, _issuerName, block.timestamp);
    }

    /**
     * @notice Revoke authority of an issuer.
     * @param _issuerAddress Wallet address to revoke.
     */
    function revokeIssuer(address _issuerAddress) external onlyOwner {
        require(issuers[_issuerAddress].isAuthorized, "Issuer is not authorized");
        require(_issuerAddress != owner, "Cannot revoke contract owner");

        issuers[_issuerAddress].isAuthorized = false;
        emit IssuerRevoked(_issuerAddress, block.timestamp);
    }

    /**
     * @notice Issue a new student academic certificate.
     * @param _certId Unique identifier for the certificate (hash or custom bytes32).
     * @param _studentName Full name of the student.
     * @param _studentRegNo Student registration / roll number.
     * @param _courseName Degree or course title.
     * @param _grade Final grade or CGPA.
     */
    function issueCertificate(
        bytes32 _certId,
        string memory _studentName,
        string memory _studentRegNo,
        string memory _courseName,
        string memory _grade
    ) external onlyAuthorizedIssuer {
        require(_certId != bytes32(0), "Certificate ID cannot be empty");
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(bytes(_studentRegNo).length > 0, "Registration number cannot be empty");
        require(bytes(_courseName).length > 0, "Course name cannot be empty");
        require(bytes(_grade).length > 0, "Grade cannot be empty");
        require(certificates[_certId].issueDate == 0, "Certificate with this ID already exists");

        certificates[_certId] = Certificate({
            certId: _certId,
            studentName: _studentName,
            studentRegNo: _studentRegNo,
            courseName: _courseName,
            grade: _grade,
            issueDate: block.timestamp,
            issuedBy: msg.sender,
            isRevoked: false,
            revocationReason: ""
        });

        certificateList.push(_certId);

        emit CertificateIssued(_certId, _studentRegNo, _studentName, msg.sender, block.timestamp);
    }

    /**
     * @notice Revoke an existing certificate in case of fraud or academic misconduct.
     * @param _certId Unique identifier of the certificate.
     * @param _reason Justification for revocation.
     */
    function revokeCertificate(bytes32 _certId, string memory _reason) external {
        require(certificates[_certId].issueDate != 0, "Certificate does not exist");
        require(!certificates[_certId].isRevoked, "Certificate is already revoked");
        require(bytes(_reason).length > 0, "Revocation reason cannot be empty");
        require(
            msg.sender == owner || msg.sender == certificates[_certId].issuedBy,
            "Only issuing authority or owner can revoke"
        );

        certificates[_certId].isRevoked = true;
        certificates[_certId].revocationReason = _reason;

        emit CertificateRevoked(_certId, _reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify a certificate by its unique ID.
     * @param _certId Unique identifier of the certificate.
     */
    function verifyCertificate(bytes32 _certId)
        external
        view
        returns (
            bool exists,
            string memory studentName,
            string memory studentRegNo,
            string memory courseName,
            string memory grade,
            uint256 issueDate,
            address issuedBy,
            string memory issuerName,
            bool isRevoked,
            string memory revocationReason
        )
    {
        Certificate memory cert = certificates[_certId];
        if (cert.issueDate == 0) {
            return (false, "", "", "", "", 0, address(0), "", false, "");
        }

        string memory instName = issuers[cert.issuedBy].name;
        if (bytes(instName).length == 0) {
            instName = "Authorized Department";
        }

        return (
            true,
            cert.studentName,
            cert.studentRegNo,
            cert.courseName,
            cert.grade,
            cert.issueDate,
            cert.issuedBy,
            instName,
            cert.isRevoked,
            cert.revocationReason
        );
    }

    /**
     * @notice Returns total number of certificates registered on-chain.
     */
    function getCertificateCount() external view returns (uint256) {
        return certificateList.length;
    }

    /**
     * @notice Check authorization status of an issuer.
     */
    function isIssuerAuthorized(address _issuerAddress) external view returns (bool) {
        return issuers[_issuerAddress].isAuthorized || _issuerAddress == owner;
    }
}
