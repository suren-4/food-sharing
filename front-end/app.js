async function uploadAndVerify() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) return alert("Please select a file!");

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        try {
            const fileData = event.target.result;
            const certHash = CryptoJS.SHA256(fileData).toString();
            console.log("🔍 Certificate Hash:", certHash);

            document.getElementById("result").innerText = "Verifying...";

            // Connect to blockchain
            if (!window.ethereum) return alert("Install Metamask");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const contract = new ethers.Contract("YOUR_CONTRACT_ADDRESS", contractABI, provider);

            // Fetch Certificate Data
            const [ipfsHash, issuer, timestamp] = await contract.getCertificate(certHash);
            console.log("✅ Certificate Found:", ipfsHash, issuer, timestamp);

            document.getElementById("result").innerHTML = `
                ✅ <b>Certificate Verified!</b> <br>
                📌 Stored on Blockchain <br>
                🌍 <a href="https://gateway.pinata.cloud/ipfs/${ipfsHash}" target="_blank">View Certificate</a> <br>
                🏢 Issued by: ${issuer} <br>
                🕒 Timestamp: ${new Date(timestamp * 1000).toLocaleString()}
            `;
        } catch (err) {
            console.error("❌ Error Fetching Certificate:", err);
            document.getElementById("result").innerHTML = "❌ <b>Certificate NOT found on Blockchain!</b>";
        }
    };

    reader.readAsText(file);
}

// Create a base app layout with bottom navigation
const appLayout = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Food Share</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        /* Base mobile app styles */
        :root {
            --primary: #2D3250;
            --secondary: #424769;
            --accent: #F6B17A;
            --accent-dark: #F68657;
            --text: #2D3250;
            --light: #F7E6C4;
            --white: #ffffff;
            --gray: #f5f5f5;
            --nav-height: 60px;
            --safe-bottom: env(safe-area-inset-bottom);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        body {
            min-height: 100vh;
            min-height: -webkit-fill-available;
            background: var(--gray);
            position: fixed;
            width: 100%;
            overflow: hidden;
        }

        .app-container {
            height: 100vh;
            height: -webkit-fill-available;
            display: flex;
            flex-direction: column;
        }

        /* Top Header */
        .app-header {
            background: var(--white);
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .header-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--primary);
        }

        /* Main Content Area */
        .main-content {
            flex: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding: 15px;
            padding-bottom: calc(var(--nav-height) + 20px);
        }

        /* Bottom Navigation */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: calc(var(--nav-height) + var(--safe-bottom));
            background: var(--white);
            display: flex;
            justify-content: space-around;
            padding-bottom: var(--safe-bottom);
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }

        .nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--secondary);
            text-decoration: none;
            font-size: 12px;
            padding: 8px;
            transition: color 0.3s ease;
        }

        .nav-item.active {
            color: var(--accent);
        }

        .nav-item i {
            font-size: 20px;
            margin-bottom: 4px;
        }

        /* Common Components */
        .card {
            background: var(--white);
            border-radius: 16px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .btn {
            background: var(--accent);
            color: var(--white);
            border: none;
            border-radius: 12px;
            padding: 15px;
            font-size: 16px;
            font-weight: 500;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .btn:active {
            transform: scale(0.98);
        }

        /* Form Elements */
        .input-group {
            margin-bottom: 15px;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--secondary);
            font-size: 14px;
        }

        .input-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--gray);
            border-radius: 12px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .input-group input:focus {
            border-color: var(--accent);
            outline: none;
        }

        /* Loading States */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--gray);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Toast Messages */
        .toast {
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            padding: 15px;
            background: var(--white);
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <div class="header-title">Food Share</div>
            <div class="header-actions">
                <!-- Add header actions here -->
            </div>
        </header>

        <main class="main-content">
            <!-- Page content will be injected here -->
        </main>

        <nav class="bottom-nav">
            <a href="/home" class="nav-item active">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="/donate" class="nav-item">
                <i class="fas fa-hand-holding-heart"></i>
                <span>Donate</span>
            </a>
            <a href="/find" class="nav-item">
                <i class="fas fa-search"></i>
                <span>Find</span>
            </a>
            <a href="/profile" class="nav-item">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </a>
        </nav>
    </div>
</body>
</html>
`;

// Export the layout
export default appLayout;
