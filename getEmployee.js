/**
 * ব্যাকএন্ড থেকে এমপ্লয়ি লিস্ট নিয়ে আসার মডুলার ফাংশন
 * @returns {Promise<Array>} এমপ্লয়ি নামের অ্যারে
 */
async function fetchEmployeeNames() {
    try {
        const result = await universalGetRequest('getEmployeeNames');

        if (result.status === "success") {
            // ডাটা স্ট্রাকচার অনুযায়ী এমপ্লয়ি লিস্ট রিটার্ন
            return result.data.employees || result.data || [];
        } else {
            console.error("Employee list load failed:", result.message);
            return [];
        }
    } catch (e) {
        console.error("Employee Fetch Error:", e);
        return [];
    }
}