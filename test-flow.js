const fetch = require('node-fetch');

(async () => {
  try {
    console.log("Testing onboarding API...");
    const res = await fetch("https://sidekick-llo4a463a-justins-projects-6e10bcfe.vercel.app/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "Test Corp",
        location: "San Francisco, CA",
        managerName: "John Doe",
        managerPhone: "+1 415 555 0100"
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2).slice(0, 300) + "...");
    
    if (data.accessCode) {
      console.log("\n✓ Onboarding works! Generated access code:", data.accessCode);
    } else {
      console.log("\n✗ No access code returned:", data.error);
    }
  } catch (e) {
    console.log("✗ Error:", e.message);
  }
})();
