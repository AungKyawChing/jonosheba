/**
 * Universal GET Request Sender
 * @param {string} action - ব্যাকএন্ডের অ্যাকশন নাম
 * @param {object} params - ফিল্টার বা অতিরিক্ত ডাটা (ডিফল্ট খালি অবজেক্ট)
 */
 async function universalGetRequest(action, params = {}) {
    const queryString = new URLSearchParams({ action, ...params }).toString();
    const finalURL = `${WEB_APP_URL}?${queryString}`;

    try {
        const response = await fetch(finalURL, {
            method: 'GET',
            mode: 'cors'
        });

        // ডাটাটি একবার ভেরিয়েবলে নিয়ে নিন যাতে আর হারিয়ে না যায়
        const result = await response.json(); 
        
        // এখন লগ করুন বা রিটার্ন করুন, কোনো সমস্যা হবে না
        console.log("Response from " + action + ":", result);
        return result; 

    } catch (err) {
        console.error("Fetch Error:", err);
        return { status: "error", message: "Network error: " + err.message };
    }
}