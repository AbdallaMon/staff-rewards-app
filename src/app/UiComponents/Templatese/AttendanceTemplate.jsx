import React from 'react';
import {
    Button,
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PrintButton = ({user, dayAttendance, shifts}) => {
    const handleDownload = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        // Add title and images
        doc.setFontSize(16);
        doc.text("EmSAT/PLD Exam Claim Form", 40, 40);
        doc.addImage('/certLogo.png', 'PNG', 40, 60, 150, 40); // Increased width for left logo
        doc.addImage('/examLogo.png', 'PNG', 450, 60, 100, 40);

        // Add personal details table without header
        doc.autoTable({
            startY: 110,
            body: [
                ['Full Name', user.name || "No name found"],
                ['Duty', user.duty?.name || "No duty found"],
                ['Test Date', new Date(dayAttendance.date).toLocaleDateString()]
            ],
            theme: 'grid', // No borders
            styles: {cellPadding: 8}, // Add padding around text in the table cells
            margin: {left: 40, top: 10}
        });

        // Calculate total rewards
        const totalRewards = dayAttendance.attendances.reduce(
              (acc, attendance) => acc + attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0),
              0
        );

        // Add attended shifts table with total rewards in the footer
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Shift', 'Duration (hours)', 'Reward']],
            body: dayAttendance.attendances.map(attendance => [
                attendance.shift.name,
                attendance.shift.duration,
                attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0)
            ]),
            foot: [[{content: 'Total Rewards', colSpan: 2, styles: {halign: 'right'}}, totalRewards]],
            margin: {top: 5},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        // Add all shifts table with padding
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 17,
            head: [['Shift', 'Timing (hours)']],
            body: shifts.map(shift => [
                shift.name,
                shift.duration
            ]),
            margin: {top: 5},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        // Add signature and confirmation section
        doc.setFontSize(10); // Reduced font size for signature section
        doc.text("I confirm that the information provided above is accurate.", 40, doc.lastAutoTable.finalY + 30);
        doc.text("Employee Signature:", 40, doc.lastAutoTable.finalY + 60);
        doc.text("Site Supervisor Name:", 300, doc.lastAutoTable.finalY + 60);

        // Add divider
        doc.setLineWidth(2);
        doc.line(40, doc.lastAutoTable.finalY + 110, 550, doc.lastAutoTable.finalY + 110);

        // Add footer section for CERT use
        doc.text("For CERT use only", 40, doc.lastAutoTable.finalY + 135);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 145,
            head: [['Centre Manager', 'Signature', 'Date']],
            body: [
                ['Director', '', ''],
                ['Signature', '', '']
            ],
            margin: {top: 2},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        // Save the PDF
        doc.save('attendance-template.pdf');
    };

    return (
          <Button onClick={handleDownload} variant="contained" color="primary">
              Download Attendance Template
          </Button>
    );
};

export default PrintButton;
