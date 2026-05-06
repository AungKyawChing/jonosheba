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