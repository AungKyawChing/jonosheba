/**
 * কাস্টমার লেজার ফেচ করার মেইন ফাংশন
 */
 async function getCustomerLedger(info) {
    const { customerType, customerNumber } = info;

    // ১. ফাইল নাম ক্যালকুলেট করা (যেমন: সদস্য ১০৫ হলে ২০০ নং ফাইল)
    const customerFile = (Math.ceil(customerNumber / 100) * 100).toString();
    console.log(customerFile);
    const container = document.getElementById('LedgerDisplayArea');
    container.innerHTML = `<p style="color: #3498db; font-weight: bold;">সদস্য নং ${customerNumber} এর লেজার লোড হচ্ছে...</p>`;
    container.style.display = 'block';
    console.log(customerNumber);
    try {
        // ২. universalGetRequest ব্যবহার করে ব্যাকএন্ডের কি (Key) অনুযায়ী ডাটা পাঠানো
        const res = await universalGetRequest('getCustomerLedgerData', {
            customerType: customerType,
            customerFile: customerFile, // ব্যাকএন্ডের সাথে মিল রেখে
            customerNo: customerNumber.toString() // ব্যাকএন্ডের সাথে মিল রেখে
        });

        if (res.status === "success") {
            // ৩. সফল হলে টেবিল রেন্ডার করা (res.data তে ledgerValues থাকবে)
            renderLedgerTable(res.data, customerNumber, customerType);
        } else {
            container.innerHTML = `<p style="color: red;">ত্রুটি: ${res.message}</p>`;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = `<p style="color: red;">সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি।</p>`;
    }
}

/**
 * ডাটা পাওয়ার পর টেবিল রেন্ডার করার ফাংশন
 */
function renderLedgerTable(data, customerNo, customerType) {
    if (!data || data.length === 0) {
        alert("কোনো লেনদেন রেকর্ড পাওয়া যায়নি।");
        return;
    }

    let headerHtml = "";
    let bodyData = [];

    // টাইপ অনুযায়ী হেডার এবং ডাটা স্লাইসিং
    if (customerType === "member") {
        bodyData = data.slice(2); // আপনার ব্যাকএন্ডের ১ম ২ সারি বাদ
        headerHtml = `
            <thead>
                <tr>
                    <th rowspan="2">তারিখ ও সময়</th>
                    <th colspan="4">শেয়ার</th>
                    <th colspan="4">সঞ্চয়</th>
                    <th colspan="6">ঋণ</th>
                    <th rowspan="2">রশিদ নং</th>
                    <th rowspan="2">ভাউচার নং</th>
                    <th rowspan="2">প্রদানকারী</th>
                    <th rowspan="2">আদায়কারী</th>
                </tr>
                <tr>
                    <th>জমা</th><th>ফেরৎ</th><th>সর্বমোট</th><th>জরিমানা</th>
                    <th>জমা</th><th>উত্তোলন</th><th>অবশিষ্ট</th><th>জরিমানা</th>
                    <th>উত্তোলন</th><th>ফেরৎ</th><th>অবশিষ্ট</th><th>মুনাফা প্রদান</th><th>আদায়যোগ্য</th><th>জরিমানা</th>
                </tr>
            </thead>`;
    } else {
        bodyData = data.slice(1); // প্রোডাক্টের জন্য ১ম ১ সারি বাদ
        headerHtml = `
            <thead>
                <tr>
                    <th>তারিখ ও সময়</th>
                    <th>জমা</th><th>উত্তোলন</th><th>সর্বমোট</th><th>জরিমানা</th>
                    <th>রশিদ নং</th><th>ভাউচার নং</th><th>প্রদানকারী</th><th>আদায়কারী</th>
                </tr>
            </thead>`;
    }

    // টেবিল HTML জেনারেশন
    let html = `<h3>${customerType === 'member' ? 'সদস্য' : 'প্রোডাক্ট'} নং: ${customerNo} এর বিস্তারিত লেজার</h3>`;
    html += `<div class="table-container">`;
    html += `<table>${headerHtml}<tbody>`;

    bodyData.forEach(row => {
        html += "<tr>";
        row.forEach((cell) => {
            html += `<td> ${cell || "--"} </td>`;
        });
        html += "</tr>";
    });
    
    html += "</tbody></table></div>";

    const container = document.getElementById('LedgerDisplayArea'); 
    container.innerHTML = html; 
    // টেবিল এরিয়াতে অটো ফোকাস করা
    window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
}