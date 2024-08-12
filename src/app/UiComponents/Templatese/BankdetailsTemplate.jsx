import React from 'react';
import {

    Button,

} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const PrintBankDetailsButton = ({user}) => {
    const handleDownload = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        // Add title and images
        doc.setFontSize(20);
        doc.text("EmSAT Staff Addition Form", 40, 40);
        doc.addImage('/fullLogo.png', 'PNG', 40, 60, 510, 60);  // Full width image

        // Add personal details table
        doc.autoTable({
            startY: 140,
            body: [
                ['Name', user.name],
                ['Contact Number (mobile)', user.phone],
                ['Email', user.email],
                ['Emirate (Address Line)', '.................................'],
            ],
            styles: {
                fontSize: 12,
                cellPadding: 8,
            },
        });

        // Add banking details table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            body: [
                ['Emirates ID', user.emiratesId],
                ['Passport Number', user.passportNumber],
                ['Bank name', user.bankName],
                ['Name as registered with the bank', user.bankUserName],
                ['IBAN', user.ibanBank],
            ],
            styles: {
                fontSize: 12,
                cellPadding: 8,
            },
        });

        // Add notice and signature sections
        doc.setTextColor(211, 47, 47);
        doc.setFontSize(12);
        doc.setLineHeightFactor(1.7);
        doc.text('ID copy and screenshot of bank details (name, IBAN, etc.) must be attached along with this form.', 40, doc.lastAutoTable.finalY + 30);
        doc.text('*Name should be exactly as mentioned in the ID selected.', 40, doc.lastAutoTable.finalY + 45);
        doc.setTextColor(0, 0, 0);
        doc.text('SIGNATURE:', 40, doc.lastAutoTable.finalY + 75); // Added margin-top

        // FOR OFFICE USE ONLY section
        doc.setFontSize(14);
        doc.text('FOR OFFICE USE ONLY', 40, doc.lastAutoTable.finalY + 120);
        doc.setFontSize(12);
        doc.line(40, doc.lastAutoTable.finalY + 125, 550, doc.lastAutoTable.finalY + 125);
        doc.text('System Update Information and Comments:', 40, doc.lastAutoTable.finalY + 150);

        // Add checkbox and fields
        doc.setFontSize(11);
        doc.text('[ ] Updated on System', 40, doc.lastAutoTable.finalY + 180);
        doc.text('Entered by: ...................................', 300, doc.lastAutoTable.finalY + 180);
        doc.text('[ ] Not Updated on System', 40, doc.lastAutoTable.finalY + 210);
        doc.text('Date: .......................................', 300, doc.lastAutoTable.finalY + 210);

        // Comments section
        doc.setFontSize(12);
        doc.text('Comments:', 40, doc.lastAutoTable.finalY + 255);
        doc.setLineWidth(1);
        doc.line(40, doc.lastAutoTable.finalY + 260, 550, doc.lastAutoTable.finalY + 260);
        doc.line(40, doc.lastAutoTable.finalY + 360, 550, doc.lastAutoTable.finalY + 360);

        // Save the PDF
        doc.save('bank-details-template.pdf');
    };

    return (
          <Button onClick={handleDownload} variant="contained" color="primary">
              Download Bank Details Template
          </Button>
    );
};

export default PrintBankDetailsButton;
