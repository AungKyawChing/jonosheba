/**
 * নির্দিষ্ট এলিমেন্টকে PDF হিসেবে এক্সপোর্ট করার ইউনিভার্সাল ফাংশন
 * @param {string} elementId - যে ডিভটি প্রিন্ট করতে চান (যেমন: 'printArea')
 * @param {string} fileName - পিডিএফ ফাইলের নাম
 */
 function exportElementToPDF(elementId, fileName = 'Document.pdf') {
    const element = document.getElementById(elementId);
    
    // পিডিএফ কনফিগারেশন
    const opt = {
        margin:       [10, 10, 10, 10], // top, left, bottom, right in mm
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
    };

    // লাইব্রেরি কল করা
    html2pdf().set(opt).from(element).save();
}