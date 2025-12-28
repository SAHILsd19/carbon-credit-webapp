import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateInvoice = (data) =>
    new Promise((resolve) => {
        const filename = `invoice_${Date.now()}.pdf`;
        const folderPath = path.join("uploads", "invoices");

        // Create invoices folder if missing
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePath = path.join(folderPath, filename);

        // 🔹 Create PDF first
        const doc = new PDFDocument({ margin: 50 });

        // 🔹 Load Unicode font for ₹ symbol
        const fontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf");

        doc.font(fontPath);

        // 🔹 Pipe AFTER doc and font are initialized
        doc.pipe(fs.createWriteStream(filePath));

        // ----------------------------------------------------
        // 🟢 HEADER / TITLE
        // ----------------------------------------------------
        doc
            .fontSize(26)
            .fillColor("#0a7f45")
            .text("🌱 Carbon Market Invoice", { align: "center" })
            .moveDown(0.6);

        doc
            .fontSize(12)
            .fillColor("#666")
            .text("Certified Carbon Credit Transaction Receipt", { align: "center" })
            .moveDown(1.2);

        // ----------------------------------------------------
        // 🔹 INVOICE DETAILS
        // ----------------------------------------------------
        const invoiceDate = new Date().toLocaleString();
        const invoiceNo = Math.floor(100000 + Math.random() * 900000);

        doc
            .fontSize(12)
            .fillColor("black")
            .text(`Invoice Number : INV-${invoiceNo}`)
            .text(`Invoice Date   : ${invoiceDate}`)
            .moveDown(1);

        // ----------------------------------------------------
        // 🔹 BUYER & SELLER
        // ----------------------------------------------------
        doc
            .fontSize(14)
            .fillColor("#0a7f45")
            .text("Parties Involved")
            .moveDown(0.5);

        doc
            .fontSize(12)
            .fillColor("black")
            .text(`Buyer : ${data.buyerName} (${data.buyerEmail})`)
            .text(`Seller: ${data.sellerName} (${data.sellerEmail})`)
            .moveDown(1);

        // ----------------------------------------------------
        // 🔹 CREDIT DETAILS
        // ----------------------------------------------------
        doc
            .fontSize(14)
            .fillColor("#0a7f45")
            .text("Carbon Credit Transaction Details")
            .moveDown(0.5);

        doc
            .fontSize(12)
            .fillColor("black")
            .text(`Credit Name       : ${data.creditName}`)
            .text(`Vintage Year      : ${data.year}`)
            .text(`Quantity Purchased: ${data.tons} tons`)
            .text(`Cost Per Ton      : ₹${data.price}`)
            .moveDown(0.5);

        doc
            .fontSize(16)
            .fillColor("black")
            .text(`TOTAL AMOUNT PAID : ₹${data.totalAmount}`)
            .moveDown(1);

        // ----------------------------------------------------
        // 🔹 BLOCKCHAIN HASH (OPTIONAL)
        // ----------------------------------------------------
        if (data.blockHash) {
            doc
                .fontSize(14)
                .fillColor("#0a7f45")
                .text("Blockchain Verification")
                .moveDown(0.4);

            doc
                .fontSize(11)
                .fillColor("black")
                .text(`Transaction Hash : ${data.blockHash}`)
                .text(`Block Explorer    : https://polygonscan.com/tx/${data.blockHash}`)
                .moveDown(1);
        }

        // ----------------------------------------------------
        // 🔹 TERMS & CONDITIONS
        // ----------------------------------------------------
        doc
            .fontSize(13)
            .fillColor("#0a7f45")
            .text("Terms & Policy")
            .moveDown(0.4);

        doc
            .fontSize(10)
            .fillColor("#444")
            .text("• This invoice certifies the purchase of verified carbon credits.")
            .text("• Credits are permanently retired upon transaction and cannot be reused.")
            .text("• Refunds are not permitted after blockchain confirmation.")
            .text("• For compliance disputes contact: support@carbonmarket.org")
            .moveDown(1.2);

        // ----------------------------------------------------
        // 🔹 FOOTER SIGNATURE
        // ----------------------------------------------------
        doc
            .fontSize(12)
            .fillColor("#0a7f45")
            .text("Authorized Digital Signature")
            .moveDown(2);

        doc
            .fontSize(10)
            .fillColor("#888")
            .text("This is a system-generated invoice. No physical signature required.", {
                align: "center",
            });

        doc.end();

        resolve(`/uploads/invoices/${filename}`);
    });

export default generateInvoice;