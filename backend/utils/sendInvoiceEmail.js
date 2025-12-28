// backend/utils/sendInvoiceEmail.js
import nodemailer from "nodemailer";
import path from "path";

const sendInvoiceEmail = async({ to, buyerName, pdfPath, totalAmount, creditName, blockHash }) => {
    try {
        // Create transporter using environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com"
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER, // your email
                pass: process.env.SMTP_PASS, // your app password
            },
        });

        // pdfPath is like "/uploads/invoices/invoice_123.pdf"
        const absolutePdfPath = path.join(process.cwd(), pdfPath.replace(/^\//, ""));

        const subject = `Your Carbon Credit Invoice - ${creditName}`;
        const explorerLink = blockHash ?
            `https://polygonscan.com/tx/${blockHash}` :
            null;

        let html = `
      <p>Hi ${buyerName},</p>
      <p>Thank you for your purchase on <b>CarbonMarket</b>.</p>
      <p>Attached is your official invoice for the following transaction:</p>
      <ul>
        <li><b>Credit:</b> ${creditName}</li>
        <li><b>Total Amount Paid:</b> ₹${totalAmount}</li>
      </ul>
    `;

        if (explorerLink) {
            html += `
        <p>You can verify this transaction on the blockchain here:</p>
        <p><a href="${explorerLink}" target="_blank">${explorerLink}</a></p>
      `;
        }

        html += `
      <p>If you have any queries, reply to this email.</p>
      <p>Regards,<br/>CarbonMarket Team</p>
    `;

        await transporter.sendMail({
            from: `"CarbonMarket" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            attachments: [{
                filename: "invoice.pdf",
                path: absolutePdfPath,
            }, ],
        });

        console.log("Invoice email sent to", to);
    } catch (err) {
        console.error("Error sending invoice email:", err.message);
        // Don't throw – we don't want purchase to fail just because email failed
    }
};

export default sendInvoiceEmail;