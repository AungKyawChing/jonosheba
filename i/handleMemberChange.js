/**
 * সদস্য নং ইনপুট দিলে ব্যাকএন্ড থেকে নাম খুঁজে বের করে ফিল্ডে বসায়
 */
async function handleMemberChange(type) {
    const formId = type === 'receipt' ? 'receiptForm' : 'voucherForm';
    const form = document.getElementById(formId);

    // নির্দিষ্ট ফর্ম থেকে মেম্বার নম্বর এবং নাম ফিল্ড সিলেক্ট করা
    const memberNoInput = form.querySelector('[name="memberNo"]');
    const memberNameInput = form.querySelector('[name="memberName"]');

    const memberNo = memberNoInput.value.trim();

    if (!memberNo) {
        alert("দয়া করে সদস্য নম্বরটি লিখুন!");
        memberNoInput.focus();
        return;
    }

    // লোডিং অবস্থা দেখানো
    memberNameInput.value = "খোঁজা হচ্ছে...";
    memberNameInput.style.color = "blue";

    try {
        // universalGetRequest ব্যবহার করে ব্যাকএন্ডে অ্যাকশন পাঠানো
        const result = await universalGetRequest('getMemberNameByNo', { memberNo: memberNo });

        if (result.status === "success" && result.data) {
            memberNameInput.value = result.data; // মেম্বারের নাম সেট
            memberNameInput.style.color = "black";



// --- নতুন লজিক শুরু (রশিদে প্রদানকারী ও ভাউচারে আদায়কারীর ইনপুট এ Auto সদস্যের নাম) ---
            if (type === 'receipt') {
                // Receipt হলে 'provider' (প্রদানকারী) ইনপুটে নাম সেট হবে
                const providerInput = form.querySelector('[name="provider"]');
                if (providerInput) providerInput.value = result.data;
            } else if (type === 'voucher') {
                // Voucher হলে 'collector' (আদায়কারী) ইনপুটে নাম সেট হবে
                const collectorInput = form.querySelector('[name="collector"]');
                if (collectorInput) collectorInput.value = result.data;
            }
            // --- নতুন লজিক শেষ ---



        } else {
            memberNameInput.value = "";
            alert("দুঃখিত! এই সদস্য নম্বরটি সঠিক নয় অথবা ডাটাবেসে নেই।");
        }
    } catch (e) {
        console.error("Member Search Error:", e);
        memberNameInput.value = "";
        alert("সার্ভার এরর! অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
}