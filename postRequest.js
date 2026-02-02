/*
 * Universal Post Request Sender
 * @param {FormData} formData - HTML ফর্ম থেকে তৈরি করা বা ম্যানুয়ালি বানানো FormData
*/
async function universalPostRequest(formData) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            redirect: 'follow'
        });
        return await response.json();
    } catch (err) {
        return { status: "error", message: "Network error: " + err.message };
    }
}