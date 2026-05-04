/**
 * নির্দিষ্ট এলিমেন্টকে PDF হিসেবে এক্সপোর্ট করার ইউনিভার্সাল ফাংশন
 * @param {string} elementId - যে ডিভটি প্রিন্ট করতে চান (যেমন: 'printArea')
 * @param {string} fileName - পিডিএফ ফাইলের নাম
 */
 function exportElementToPDF(elementId, fileName) {
    // ১. নির্দিষ্ট এলিমেন্টটি ধরুন
    const printContents = document.getElementById(elementId).innerHTML;
    const originalContents = document.body.innerHTML;
    
    // ২. পেজ টাইটেল পরিবর্তন (এটিই ফাইল নেম হিসেবে সেভ হবে)
    const originalTitle = document.title;
    document.title = fileName;
    
    // ৩. শুধুমাত্র ঐ এলিমেন্টটি বডিতে সেট করা
    document.body.innerHTML = printContents;
    
    // ৪. প্রিন্ট উইন্ডো ওপেন করা
    setTimeout(() => {
        window.print();
                            // ৫. প্রিন্ট শেষে আগের অবস্থায় ফিরে যাওয়া
            setTimeout(() => {
                document.body.innerHTML = originalContents;
                document.title = originalTitle;
            }, 2000);
    }, 2000);
}
