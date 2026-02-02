/**
 * তারিখ ফরম্যাট করার হেল্পার
 */
const TimeFormatter = {
    // ব্রাউজারের ইনপুট ফিল্ডের জন্য ফরম্যাট (YYYY-MM-DDTHH:mm:ss)
    nowForInput: () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },

    // গুগল শিটে পাঠানোর জন্য ফরম্যাট (yyyy-MM-dd HH:mm:ss)
    formatForSheet: (dateTimeStr) => {
        return dateTimeStr.replace('T', ' ');
    },

    // তারিখ থেকে মাস (yyyy-MM) আলাদা করে
    getMonthKey: (dateTimeStr) => dateTimeStr.substring(0, 7)
};