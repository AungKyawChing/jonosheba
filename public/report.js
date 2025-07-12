const { jsPDF } = window.jspdf;
        let employeeNames = [];

        // Format date to YYYY-MM-DD HH:MM:SS
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // Fetch employee names
        async function fetchEmployeeNames() {
            try {
                const response = await fetch(`${SCRIPT_URL}?action=getEmployeeNames`);
                const data = await response.json();
                console.log('Employee Names:', data);
                if (data.status === 'success') {
                    employeeNames = data.data;
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error fetching employee names:', error);
            }
        }

        // Fetch receipts and generate report
        async function generateReport() {
            const errorMessage = document.getElementById('errorMessage');
            const reportMaster = document.querySelector('.report-master');
            const reportTitle = document.getElementById('reportTitle');
            const pdfReportTitle = document.getElementById('pdfReportTitle');
            const generatePDFButton = document.getElementById('generatePDFButton');
            errorMessage.style.display = 'none';
            reportMaster.style.display = 'none';
            generatePDFButton.disabled = true;

            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            if (!startDate || !endDate) {
                errorMessage.textContent = 'দয়া করে শুরু এবং শেষ তারিখ নির্বাচন করুন';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const titleText = `রিপোর্ট<br>${formatDate(start)} – ${formatDate(end)}`;
                reportTitle.innerHTML = titleText;
                pdfReportTitle.innerHTML = titleText;

                const earliestDate = '2000-01-01T00:00:00';
                const openingResponse = await fetch(`${SCRIPT_URL}?action=getReceipts&startDate=${encodeURIComponent(earliestDate)}&endDate=${encodeURIComponent(startDate)}`);
                const openingData = await openingResponse.json();
                console.log('Opening Balance Receipts:', openingData);
                if (openingData.status !== 'success') {
                    throw new Error(openingData.message);
                }

                let openingBalance = 0;
                const openingReceipts = openingData.data;

                const incomeColumns = {
                    'শেয়ার জমা': 4,
                    'শেয়ার জমা': 4,
                    'শেয়ার জরিমানা': 5,
                    'শেয়ার জরিমানা': 5,
                    'সঞ্চয় জমা': 6,
                    'সঞ্চয় জমা': 6,
                    'সঞ্চয় জরিমানা': 7,
                    'সঞ্চয় জরিমানা': 7,
                    'ঋণ ফেরত': 8,
                    'ঋণের মুনাফা/সেবামূল্য': 9,
                    'ঋণের জরিমানা': 10,
                    'ঋণ ফর্ম বিক্রয়': 11,
                    'ভর্তি ফি': 12,
                    'ডিপিএস হিসাব খোলা ফি': 13,
                    'ডিপিএস জমা': 14,
                    'ডিপিএস জরিমানা': 15,
                    'স্থায়ী আমানত হিসাব খোলা ফি': 16,
                    'স্থায়ী আমানত জমা': 17,
                    'স্থায়ী আমানত জরিমানা': 18
                };
                const expenseColumns = {
                    'শেয়ার ফেরত': 4,
                    'শেয়ার ফেরত': 4,
                    'সঞ্চয় উত্তোলন': 5,
                    'সঞ্চয় উত্তোলন': 5,
                    'ঋণদান': 6,
                    'স্টেশনারী খরচ': 7,
                    'মিটিং খরচ': 8,
                    'যাতায়াত খরচ': 9,
                    'ডিপিএস উত্তোলন': 10,
                    'ডিপিএস লাভ বিতরণ': 11,
                    'স্থায়ী আমানত উত্তোলন': 12,
                    'স্থায়ী আমানত লাভ বিতরণ': 13,
                    'বেতন': 14,
                    'অফিস ভাড়া': 15,
                    'বিদ্যুৎ বিল': 16,
                    'সম্মানী ভাতা': 17,
                    'অফিস আপ্যায়ন': 18,
                    'রক্ষণাবেক্ষণ': 19,
                    'আসবাবপত্র': 20
                };

                openingReceipts.forEach(receipt => {
                    const isIncome = employeeNames.includes(receipt.collectorName);
                    const isExpense = employeeNames.includes(receipt.payerName);
                    const transactionDetails = receipt.transactionDetails || [];
                    transactionDetails.forEach(detail => {
                        const amount = parseFloat(detail.amount) || 0;
                        if (isIncome) {
                            openingBalance += amount;
                        }
                        if (isExpense) {
                            openingBalance -= amount;
                        }
                    });
                });
                console.log('Opening Balance:', openingBalance);

                console.log('Fetching receipts with:', { startDate, endDate });
                const response = await fetch(`${SCRIPT_URL}?action=getReceipts&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
                const data = await response.json();
                console.log('API Response:', data);
                if (data.status !== 'success') {
                    throw new Error(data.message);
                }

                const receipts = data.data;
                const incomeByType = {};
                const expenseByType = {};
                let totalIncome = 0;
                let totalExpense = 0;

                const incomeTableBody = document.querySelector('#detailedIncomeTable tbody');
                const expenseTableBody = document.querySelector('#detailedExpenseTable tbody');
                incomeTableBody.innerHTML = '';
                expenseTableBody.innerHTML = '';

                receipts.forEach(receipt => {
                    const isIncome = employeeNames.includes(receipt.collectorName);
                    const isExpense = employeeNames.includes(receipt.payerName);
                    const transactionDetails = receipt.transactionDetails || [];

                    if (isIncome) {
                        const incomeRow = new Array(21).fill('');
                        incomeRow[0] = receipt.dateTime;
                        incomeRow[1] = receipt.receiptNumber || 'N/A';
                        incomeRow[2] = receipt.memberNumber || 'N/A';
                        incomeRow[3] = receipt.memberName || 'N/A';
                        let rowTotal = 0;

                        transactionDetails.forEach(detail => {
                            const type = detail.type || 'Unknown';
                            const amount = parseFloat(detail.amount) || 0;
                            incomeByType[type] = (incomeByType[type] || 0) + amount;
                            totalIncome += amount;
                            const colIndex = incomeColumns[type];
                            if (colIndex !== undefined) {
                                incomeRow[colIndex] = amount.toFixed(2);
                                rowTotal += amount;
                            } else {
                                incomeRow[19] = (incomeRow[19] ? incomeRow[19] + ', ' : '') + `${type} = ${amount.toFixed(2)}`;
                                rowTotal += amount;
                            }
                        });

                        incomeRow[20] = rowTotal.toFixed(2);
                        const tr = document.createElement('tr');
                        tr.innerHTML = incomeRow.map((val, idx) => `<td${idx === 1 ? ' class="sticky center-text"' : ' class="center-text"'}>${val}</td>`).join('');
                        incomeTableBody.appendChild(tr);
                    }

                    if (isExpense) {
                        const expenseRow = new Array(23).fill('');
                        expenseRow[0] = receipt.dateTime;
                        expenseRow[1] = receipt.receiptNumber || 'N/A';
                        expenseRow[2] = receipt.memberNumber || 'N/A';
                        expenseRow[3] = receipt.memberName || 'N/A';
                        let rowTotal = 0;

                        transactionDetails.forEach(detail => {
                            const type = detail.type || 'Unknown';
                            const amount = parseFloat(detail.amount) || 0;
                            expenseByType[type] = (expenseByType[type] || 0) + amount;
                            totalExpense += amount;
                            const colIndex = expenseColumns[type];
                            if (colIndex !== undefined) {
                                expenseRow[colIndex] = amount.toFixed(2);
                                rowTotal += amount;
                            } else {
                                expenseRow[21] = (expenseRow[21] ? expenseRow[21] + ', ' : '') + `${type} = ${amount.toFixed(2)}`;
                                rowTotal += amount;
                            }
                        });

                        expenseRow[22] = rowTotal.toFixed(2);
                        const tr = document.createElement('tr');
                        tr.innerHTML = expenseRow.map((val, idx) => `<td${idx === 1 ? ' class="sticky center-text"' : ' class="center-text"'}>${val}</td>`).join('');
                        expenseTableBody.appendChild(tr);
                    }
                });

                const incomeTotalRow = document.createElement('tr');
                incomeTotalRow.className = 'total-row';
                incomeTotalRow.innerHTML = `<td colspan="20" class="center-text" style="font-weight: bold;">সর্বমোট</td><td class="center-text" style="font-weight: bold;">${totalIncome.toFixed(2)}</td>`;
                incomeTableBody.appendChild(incomeTotalRow);

                const expenseTotalRow = document.createElement('tr');
                expenseTotalRow.className = 'total-row';
                expenseTotalRow.innerHTML = `<td colspan="22" class="center-text" style="font-weight: bold;">সর্বমোট</td><td class="center-text" style="font-weight: bold;">${totalExpense.toFixed(2)}</td>`;
                expenseTableBody.appendChild(expenseTotalRow);

                const incomeSummaryTableBody = document.querySelector('#incomeTable tbody');
                const pdfIncomeTableBody = document.querySelector('#pdfIncomeTable tbody');
                incomeSummaryTableBody.innerHTML = '';
                pdfIncomeTableBody.innerHTML = '';
                for (const [type, amount] of Object.entries(incomeByType)) {
                    const rowHTML = `<td>${type}</td><td>${amount.toFixed(2)}</td>`;
                    const row = document.createElement('tr');
                    row.innerHTML = rowHTML;
                    incomeSummaryTableBody.appendChild(row);
                    const pdfRow = document.createElement('tr');
                    pdfRow.innerHTML = rowHTML;
                    pdfIncomeTableBody.appendChild(pdfRow);
                }
                const incomeSummaryTotalRow = document.createElement('tr');
                incomeSummaryTotalRow.className = 'total-row';
                incomeSummaryTotalRow.innerHTML = `<td>মোট আয়</td><td>${totalIncome.toFixed(2)}</td>`;
                incomeSummaryTableBody.appendChild(incomeSummaryTotalRow);
                const pdfIncomeSummaryTotalRow = document.createElement('tr');
                pdfIncomeSummaryTotalRow.className = 'total-row';
                pdfIncomeSummaryTotalRow.innerHTML = `<td>মোট আয়</td><td>${totalIncome.toFixed(2)}</td>`;
                pdfIncomeTableBody.appendChild(pdfIncomeSummaryTotalRow);

                const expenseSummaryTableBody = document.querySelector('#expenseTable tbody');
                const pdfExpenseTableBody = document.querySelector('#pdfExpenseTable tbody');
                expenseSummaryTableBody.innerHTML = '';
                pdfExpenseTableBody.innerHTML = '';
                for (const [type, amount] of Object.entries(expenseByType)) {
                    const rowHTML = `<td>${type}</td><td>${amount.toFixed(2)}</td>`;
                    const row = document.createElement('tr');
                    row.innerHTML = rowHTML;
                    expenseSummaryTableBody.appendChild(row);
                    const pdfRow = document.createElement('tr');
                    pdfRow.innerHTML = rowHTML;
                    pdfExpenseTableBody.appendChild(pdfRow);
                }
                const expenseSummaryTotalRow = document.createElement('tr');
                expenseSummaryTotalRow.className = 'total-row';
                expenseSummaryTotalRow.innerHTML = `<td>মোট ব্যয়</td><td>${totalExpense.toFixed(2)}</td>`;
                expenseSummaryTableBody.appendChild(expenseSummaryTotalRow);
                const pdfExpenseSummaryTotalRow = document.createElement('tr');
                pdfExpenseSummaryTotalRow.className = 'total-row';
                pdfExpenseSummaryTotalRow.innerHTML = `<td>মোট ব্যয়</td><td>${totalExpense.toFixed(2)}</td>`;
                pdfExpenseTableBody.appendChild(pdfExpenseSummaryTotalRow);

                const currentBalance = openingBalance + totalIncome - totalExpense;
                const balanceTableBody = document.querySelector('#balanceTable tbody');
                const pdfBalanceTableBody = document.querySelector('#pdfBalanceTable tbody');
                const balanceHTML = `
                    <tr><td>প্রারম্ভিক নগদ (${formatDate(start)} এর আগে)</td><td>${openingBalance.toFixed(2)}</td></tr>
                    <tr><td>মোট আয় (${formatDate(start)} থেকে ${formatDate(end)})</td><td>${totalIncome.toFixed(2)}</td></tr>
                    <tr><td>মোট ব্যয় (${formatDate(start)} থেকে ${formatDate(end)})</td><td>${totalExpense.toFixed(2)}</td></tr>
                    <tr class="total-row"><td>হাতে নগদ (${formatDate(end)})</td><td>${currentBalance.toFixed(2)}</td></tr>
                `;
                balanceTableBody.innerHTML = balanceHTML;
                pdfBalanceTableBody.innerHTML = balanceHTML;

                reportMaster.style.display = 'block';
                generatePDFButton.disabled = false;
            } catch (error) {
                console.error('Error generating report:', error);
                errorMessage.textContent = 'রিপোর্ট তৈরি করতে ব্যর্থ: ' + error.message;
                errorMessage.style.display = 'block';
            }
        }

        // Generate PDF for main report
        async function generatePDF() {
            const pdfContent = document.getElementById('pdfContent');
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const start = new Date(startDate);
            const end = new Date(endDate);

            const startStr = formatDate(start).replace(/[:\s]/g, '_');
            const endStr = formatDate(end).replace(/[:\s]/g, '_');
            const fileName = `Transaction_Report_${startStr}_to_${endStr}.pdf`;

            try {
                pdfContent.style.display = 'block';
                const canvas = await html2canvas(pdfContent, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    width: pdfContent.scrollWidth,
                    height: pdfContent.scrollHeight
                });
                console.log('Canvas created:', canvas);

                await new Promise(resolve => setTimeout(resolve, 500));

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(fileName);
                pdfContent.style.display = 'none';
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('PDF তৈরি করতে ব্যর্থ: ' + error.message);
                pdfContent.style.display = 'none';
            }
        }

        // Helper function to create table with given data
        function createTable(data, headers, tableId, lastColumnIndex) {
            const table = document.createElement('table');
            table.id = tableId;
            table.className = 'table table-striped table-bordered';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.className = 'center-text';
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            const tbody = document.createElement('tbody');
            let pageTotal = 0;
            data.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach((cell, idx) => {
                    const td = document.createElement('td');
                    td.className = idx === 1 ? 'sticky center-text' : 'center-text';
                    td.textContent = cell || '';
                    tr.appendChild(td);
                    if (idx === lastColumnIndex) {
                        pageTotal += parseFloat(cell) || 0;
                    }
                });
                tbody.appendChild(tr);
            });

            // Add page total row
            const totalRow = document.createElement('tr');
            totalRow.className = 'total-row';
            const totalCells = new Array(headers.length).fill('');
            totalCells[0] = 'পৃষ্ঠার সর্বমোট';
            totalCells[lastColumnIndex] = pageTotal.toFixed(2);
            totalRow.innerHTML = totalCells.map((val, idx) => `<td${idx === 1 ? ' class="sticky center-text"' : ' class="center-text"'}>${val}</td>`).join('');
            tbody.appendChild(totalRow);

            table.appendChild(thead);
            table.appendChild(tbody);
            return table;
        }

        // Helper function to split data into pages based on height
        async function splitDataIntoPages(data, headers, tableId, maxHeightPx) {
            const pages = [];
            let currentPageData = [];
            let estimatedHeight = 0;
            const rowHeightEstimate = 20; // Reduced row height estimate for smaller font
            const headerHeightEstimate = 40; // Reduced header height estimate
            const totalRowHeightEstimate = 20; // Height for page total row

            for (let i = 0; i < data.length; i++) {
                currentPageData.push(data[i]);
                estimatedHeight += rowHeightEstimate;

                // Check if adding this row exceeds the max height (with safety margin)
                if (estimatedHeight + headerHeightEstimate + totalRowHeightEstimate > maxHeightPx * 0.9 && currentPageData.length > 1) {
                    pages.push([...currentPageData.slice(0, -1)]); // Exclude the last row
                    currentPageData = [data[i]]; // Start new page with the current row
                    estimatedHeight = rowHeightEstimate; // Reset height for new page
                } else if (i === data.length - 1) {
                    pages.push([...currentPageData]); // Add the last page
                }
            }

            // Validate each page by rendering and checking actual height
            const validatedPages = [];
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.visibility = 'hidden';
            tempContainer.style.width = '293mm';
            tempContainer.className = 'pdf-content';
            document.body.appendChild(tempContainer);

            for (let pageData of pages) {
                const tempTable = createTable(pageData, headers, tableId, tableId === 'pdfDetailedIncomeTable' ? 20 : 22);
                tempContainer.innerHTML = '';
                tempContainer.appendChild(tempTable);

                await new Promise(resolve => setTimeout(resolve, 100)); // Allow DOM to render
                const actualHeight = tempTable.offsetHeight;

                if (actualHeight <= maxHeightPx * 0.9) {
                    validatedPages.push(pageData);
                } else {
                    // If the page is too tall, split it further
                    let subPageData = [];
                    let subPageHeight = 0;
                    for (let row of pageData) {
                        subPageData.push(row);
                        subPageHeight += rowHeightEstimate;

                        if (subPageHeight + headerHeightEstimate + totalRowHeightEstimate > maxHeightPx * 0.9 && subPageData.length > 1) {
                            validatedPages.push([...subPageData.slice(0, -1)]);
                            subPageData = [row];
                            subPageHeight = rowHeightEstimate;
                        }
                    }
                    if (subPageData.length > 0) {
                        validatedPages.push([...subPageData]);
                    }
                }
            }

            document.body.removeChild(tempContainer);
            return validatedPages;
        }

        // Print Income List as PDF using html2canvas
        // Print Income List as PDF using html2canvas
async function printIncomeList() {
    const pdfContent = document.getElementById('pdfIncomeListContent');
    const pdfHeader = pdfContent.querySelector('.pdf-header');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = formatDate(start).replace(/[:\s]/g, '_');
    const endStr = formatDate(end).replace(/[:\s]/g, '_');
    const fileName = `Income_List_${startStr}_to_${endStr}.pdf`;

    try {
        // Populate data from detailedIncomeTable
        const tbody = document.querySelector('#detailedIncomeTable tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not(.total-row)'));
        const data = rows.map(row => Array.from(row.cells).map(cell => cell.textContent));
        const headers = Array.from(document.querySelector('#detailedIncomeTable thead tr').cells).map(cell => cell.textContent);

        if (data.length === 0) {
            alert('কোনো ডেটা পাওয়া যায়নি। দয়া করে রিপোর্ট তৈরি করুন।');
            return;
        }

        // Set header text
        pdfHeader.querySelector('h3').textContent = `আয়ের বিস্তারিত তালিকা ${formatDate(start)} – ${formatDate(end)}`;

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 297; // A4 landscape width
        const pageHeight = 210; // A4 landscape height
        const margin = 2; // 2mm margin
        const tableWidth = 293; // Table width
        const maxHeightPx = (pageHeight - 15 - 2 * margin) * 3.78; // 15mm for header + margins, converted to pixels (1mm ≈ 3.78px)

        // Split data into pages
        const pages = await splitDataIntoPages(data, headers, 'pdfDetailedIncomeTable', maxHeightPx);
        console.log('Pages created:', pages.length, pages);

        // Render each page
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage();

            const pageData = pages[i];
            const tempTable = createTable(pageData, headers, 'pdfDetailedIncomeTable', 20);

            // Create a temporary container for rendering
            const tempContainer = document.createElement('div');
            tempContainer.className = 'pdf-content';
            tempContainer.style.width = '297mm';
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            tempContainer.style.display = 'block'; // Ensure container is visible for rendering

            // Add header only on the first page
            if (i === 0) {
                tempContainer.appendChild(pdfHeader.cloneNode(true));
                tempContainer.style.height = '210mm';
            } else {
                tempContainer.style.height = `${pageHeight - 2 * margin}mm`; // No header space
            }

            tempContainer.appendChild(tempTable);
            document.body.appendChild(tempContainer);

            // Wait for DOM to render
            await new Promise(resolve => setTimeout(resolve, 200)); // Increased timeout for rendering

            // Capture the entire page content
            const canvas = await html2canvas(tempContainer, {
                scale: 1, // Reduced scale to prevent memory issues
                useCORS: true,
                allowTaint: true,
                logging: true,
                width: tempContainer.offsetWidth,
                height: tempContainer.offsetHeight,
                windowWidth: pageWidth * 3.78, // Set window width to match A4
                windowHeight: pageHeight * 3.78 // Set window height to match A4
            });
            console.log('Canvas dimensions:', canvas.width, canvas.height);

            document.body.removeChild(tempContainer);

            const imgHeight = canvas.height * tableWidth / canvas.width;
            const yPosition = i === 0 ? margin : margin + 5; // Adjust y-position for non-first pages
            pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', margin, yPosition, tableWidth, imgHeight);
            console.log(`Page ${i + 1} added to PDF`);

            // Add page number
            pdf.setFontSize(8);
            pdf.text(`পৃষ্ঠা ${i + 1}`, pageWidth - 20, pageHeight - 5);
        }

        pdf.save(fileName);
        pdfContent.style.display = 'none';
    } catch (error) {
        console.error('Error generating Income List PDF:', error);
        alert('ইনকাম লিস্ট PDF তৈরি করতে ব্যর্থ: ' + error.message);
        pdfContent.style.display = 'none';
    }
}

        // Print Expense List as PDF using html2canvas
        async function printExpenseList() {
            const pdfContent = document.getElementById('pdfExpenseListContent');
            const pdfHeader = pdfContent.querySelector('.pdf-header');
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const start = new Date(startDate);
            const end = new Date(endDate);

            const startStr = formatDate(start).replace(/[:\s]/g, '_');
            const endStr = formatDate(end).replace(/[:\s]/g, '_');
            const fileName = `Expense_List_${startStr}_to_${endStr}.pdf`;

            try {
                // Populate data from detailedExpenseTable
                const tbody = document.querySelector('#detailedExpenseTable tbody');
                const rows = Array.from(tbody.querySelectorAll('tr:not(.total-row)'));
                const data = rows.map(row => Array.from(row.cells).map(cell => cell.textContent));
                const headers = Array.from(document.querySelector('#detailedExpenseTable thead tr').cells).map(cell => cell.textContent);

                if (data.length === 0) {
                    alert('কোনো ডেটা পাওয়া যায়নি। দয়া করে রিপোর্ট তৈরি করুন।');
                    return;
                }

                // Set header text
                pdfHeader.querySelector('h3').textContent = `ব্যয়ের বিস্তারিত তালিকা ${formatDate(start)} – ${formatDate(end)}`;

                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = 297; // A4 landscape width
                const pageHeight = 210; // A4 landscape height
                const margin = 2; // 2mm margin
                const tableWidth = 293; // Table width
                const maxHeightPx = (pageHeight - 15 - 2 * margin) * 3.78; // 15mm for header + margins, converted to pixels (1mm ≈ 3.78px)

                // Split data into pages
                const pages = await splitDataIntoPages(data, headers, 'pdfDetailedExpenseTable', maxHeightPx);

                // Render each page
                for (let i = 0; i < pages.length; i++) {
                    if (i > 0) pdf.addPage();

                    const pageData = pages[i];
                    const tempTable = createTable(pageData, headers, 'pdfDetailedExpenseTable', 22);

                    // Create a temporary container for rendering
                    const tempContainer = document.createElement('div');
                    tempContainer.className = 'pdf-content';
                    tempContainer.style.width = '297mm';
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';

                    // Add header only on the first page
                    if (i === 0) {
                        tempContainer.appendChild(pdfHeader.cloneNode(true));
                        tempContainer.style.height = '210mm';
                    } else {
                        tempContainer.style.height = `${pageHeight - 2 * margin}mm`; // No header space
                    }

                    tempContainer.appendChild(tempTable);
                    document.body.appendChild(tempContainer);

                    // Capture the entire page content
                    const canvas = await html2canvas(tempContainer, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        logging: true,
                        width: tempContainer.offsetWidth,
                        height: tempContainer.offsetHeight
                    });

                    document.body.removeChild(tempContainer);

                    const imgHeight = canvas.height * tableWidth / canvas.width;
                    const yPosition = i === 0 ? margin : margin + 5; // Adjust y-position for non-first pages
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, yPosition, tableWidth, imgHeight);

                    // Add page number
                    pdf.setFontSize(8);
                    pdf.text(`পৃষ্ঠা ${i + 1}`, pageWidth - 20, pageHeight - 5);
                }

                pdf.save(fileName);
                pdfContent.style.display = 'none';
            } catch (error) {
                console.error('Error generating Expense List PDF:', error);
                alert('এক্সপেন্স লিস্ট PDF তৈরি করতে ব্যর্থ: ' + error.message);
                pdfContent.style.display = 'none';
            }
        }

        // Load employee names on page load
        fetchEmployeeNames();