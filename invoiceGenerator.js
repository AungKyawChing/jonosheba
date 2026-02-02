/**
 * সর্বজনীন রিসিট বা ভাউচার জেনারেটর
 */
function generateDynamicInvoice(data) {
    const invoiceSlLabel = data.type === 'Receipt' ? 'রশিদ নং:' : 'ভাউচার নং:';
    const customerNoLabel = data.sector === 'Members' ? 'সদস্য নং:' : 'হিসাব নং:';
    const customerNameLabel = data.sector === 'Members' ? 'সদস্যের নাম:' : 'হিসাবীর নাম:';
    const dateTime = data.dateTime || "";

    let tableRows = "";
    let totalAmount = 0;

    if (data.transactions && data.transactions.length > 0) {
        data.transactions.forEach(item => {
            const amt = parseFloat(item.amount) || 0;
            totalAmount += amt;
            tableRows += `
                <tr>
                    <td style="border:1px solid #000; padding:2px; text-align:left;">${item.name}</td>
                    <td style="border:1px solid #000; padding:2px; text-align:right;">${amt.toFixed(2)}</td>
                </tr>`;
        });
    }

    const invoiceHTML = `
    <div id="invoiceOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; align-items:center; overflow-y:auto; padding:0;">
        
        <div class="no-print" style="margin-top: 20px; margin-bottom: 20px; display:flex; gap:15px; position: sticky; top: 20px; z-index: 10000;">
            <button onclick="printSingleInvoice()" style="background:#28a745; color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:5px; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Print PDF</button>
            <button onclick="document.getElementById('invoiceOverlay').remove()" style="background:#dc3545; color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:5px; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Close</button>
        </div>

        <div id="printableInvoice" style="background:#fff; width:105mm; min-height: 148mm; padding:10mm; border:none; outline:none; font-family: 'Arial', sans-serif; color: #000; box-sizing: border-box; position: relative;">
            
            <div style="text-align:center; padding-bottom:10px; margin-bottom:15px;">
                <h5 style="margin:0; color:#444; font-size:11px; font-weight:normal;">${data.month} ${data.sector} ${data.type}</h5>
                <h2 style="margin:5px 0; font-size:17px; font-weight:bold;">জনসেবা কো-অপারেটিভ ক্রেডিট ইউনিয়ন লিঃ</h2>
                <p style="font-size:10px; margin:2px;">স্থাপিত: ০১/০১/২০২১ খ্রিঃ, রেজিঃ নং ২০২৪.১.২৩.২২১৬.০৩৬৪</p>
                <p style="font-size:10px; margin:2px;">ঠিকানা: নোয়াপাড়া ৩নং ওয়ার্ড, হারবাং, চকরিয়া, কক্সবাজার।</p>
                <p style="font-size:10px; margin:2px;">Office: 01866-666666, E-mail: jonosheba64@gmail.com</p>
            </div>

            <table style="width:100%; font-size:14px; margin-bottom:10px; border:none; border-collapse: collapse;">
                <tr>
                    <td style="padding:4px 0; border:none;"><strong>${invoiceSlLabel}</strong> ${data.slNo}</td>
                    <td style="padding:4px 0; border:none; text-align:right;"><strong>তারিখ:</strong> ${dateTime}</td>
                </tr>
                ${data.customerNo ? `<tr><td colspan="2" style="padding:4px 0; border:none;"><strong>${customerNoLabel}</strong> ${data.customerNo}</td></tr>` : ''}
                ${data.customerNo ? `<tr><td colspan="2" style="padding:4px 0; border:none;"><strong>${customerNameLabel}</strong> ${data.customerName}</td></tr>` : `<tr><td colspan="2" style="padding:4px 0; border:none;"><strong>লেনদেনকারীর নাম:</strong> ${data.providerName}</td></tr>`}
            </table>
            
            <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:10px; border:1.5px solid #000;">
                <thead>
                    <tr style="background:#f2f2f2;">
                        <th style="border:1px solid #000; padding:2px; text-align:left;">বিবরণ</th>
                        <th style="border:1px solid #000; padding:2px; text-align:right;">টাকা</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr style="font-weight:bold;">
                        <td style="border:1px solid #000; padding:2px; text-align:right;">মোট টাকা:</td>
                        <td style="border:1px solid #000; padding:2px; text-align:right;">${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>

            ${data.note ? `<div style="font-size:13px; margin-top:10px; font-style: italic;"><strong>Note:</strong> ${data.note}</div>` : ''}

            <table style="width:100%; margin-top:50px; font-size:13px; border:none;">
                <tr>
                    <td style="width:45%; text-align:center; border:none; border-top:1px solid #000; padding-top:5px;">
                        প্রদানকারীর স্বাক্ষর<br><strong>${data.providerName}</strong>
                    </td>
                    <td style="width:10%; border:none;"></td>
                    <td style="width:45%; text-align:center; border:none; border-top:1px solid #000; padding-top:5px;">
                        আদায়কারীর স্বাক্ষর<br><strong>${data.collectorName}</strong>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    
    <style>
        @media print {
            #invoiceOverlay { background: white !important; display: block !important; padding: 0 !important; }
            .no-print { display: none !important; }
            #printableInvoice { width: 105mm !important; margin: 0 !important; padding: 10mm !important; }
        }
    </style>`;

    document.body.insertAdjacentHTML('beforeend', invoiceHTML);
}

/**
 * PDF জেনারেশন ফাংশন (Top Alignment Fix)
 */
function printSingleInvoice() {

    const element = document.getElementById('printableInvoice');
    // ১. এলিমেন্টের হাইট পিক্সেল থেকে মিলিমিটারে রূপান্তর করা
    // সূত্র: (pixels * 25.4) / DPI (সাধারণত ৯৬ DPI ধরা হয়)
    //const heightInMm = (element.offsetHeight * 25.4) / 96;

    const opt = {
        margin: 0,
        filename: `Invoice.pdf`,
        image: { type: 'png', quality: 1 },
        html2canvas: {
            scale: 4,
            useCORS: true,
            y: 0, // Canvas শুরু হবে একদম টপ ০ থেকে
            scrollY: 0
        },
        jsPDF: {
            unit: 'mm',
            format: [105, 140], // A4 এর অর্ধেক প্রস্থ
            orientation: 'portrait',
            compress: true
        },
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
    // যদি ১ এর বেশি পেজ হয়, তবে বাকিগুলো ডিলিট করে দিবে
    for (let i = totalPages; i > 1; i--) {
        pdf.deletePage(i);
    }
        // অতিরিক্ত পেজ বা গ্যাপ রিমুভ নিশ্চিত করা
    }).save();
}