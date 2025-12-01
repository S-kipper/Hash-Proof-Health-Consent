async function submitConsent() {

    const data = {
        name: document.getElementById("name").value,
        dob: document.getElementById("dob").value,
        purpose: document.getElementById("purpose").value,
        notes: document.getElementById("notes").value
    };

    document.getElementById("status").innerText = "Submitting... please wait.";

    const response = await fetch("http://localhost:5000/submit-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
        document.getElementById("status").innerText =
            "Consent submitted successfully! TX Hash: " + result.txHash;
    } else {
        document.getElementById("status").innerText = "Error: " + result.error;
    }
}
