import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#FF8C42',
        paddingBottom: 20,
        marginBottom: 30,
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    academyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C2416',
    },
    contactDetails: {
        fontSize: 9,
        color: '#8B7355',
        marginTop: 4,
    },
    titleContainer: {
        alignItems: 'flex-end',
    },
    receiptTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF8C42',
        textTransform: 'uppercase',
    },
    receiptMeta: {
        fontSize: 9,
        color: '#2C2416',
        marginTop: 4,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF8C42',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E4D7',
        paddingBottom: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%',
        marginBottom: 8,
    },
    label: {
        color: '#8B7355',
        fontSize: 8,
        textTransform: 'uppercase',
    },
    value: {
        color: '#2C2416',
    },
    paymentSummary: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FFF9F4',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#F0E4D7',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0E4D7',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF8C42',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0E4D7',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 8,
        color: '#8B7355',
        marginBottom: 4,
    },
    thankYou: {
        fontSize: 10,
        color: '#FF8C42',
        marginTop: 10,
    }
});

interface ReceiptProps {
    receiptNumber: string;
    date: string;
    student: {
        name: string;
        parentName: string;
        email: string;
        mobile: string;
    };
    course: {
        name: string;
        level: string;
        language: string;
    };
    batch: {
        name: string;
        timing: string;
        startDate: string;
        endDate: string;
    };
    payment: {
        amount: number;
        transactionId: string;
        method: string;
        paymentDate: string;
    };
}

export const ReceiptDocument = ({ receiptNumber, date, student, course, batch, payment }: ReceiptProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.academyName}>Speak Orange Academy</Text>
                    <Text style={styles.contactDetails}>Ahmedabad, Gujarat, India</Text>
                    <Text style={styles.contactDetails}>+91 98765 43210 | info@speakorange.com</Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.receiptTitle}>Payment Receipt</Text>
                    <Text style={styles.receiptMeta}>No: {receiptNumber}</Text>
                    <Text style={styles.receiptMeta}>Date: {date}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Student Details</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Student Name</Text>
                        <Text style={styles.value}>{student.name}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Parent Name</Text>
                        <Text style={styles.value}>{student.parentName || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Email Address</Text>
                        <Text style={styles.value}>{student.email}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <Text style={styles.value}>{student.mobile}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registration Details</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Course</Text>
                        <Text style={styles.value}>{course.name} ({course.level})</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Language</Text>
                        <Text style={styles.value}>{course.language}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Batch</Text>
                        <Text style={styles.value}>{batch.name}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Timing</Text>
                        <Text style={styles.value}>{batch.timing}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.paymentSummary}>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Transaction ID</Text>
                        <Text style={styles.value}>{payment.transactionId}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Payment Method</Text>
                        <Text style={styles.value}>{payment.method}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Payment Date</Text>
                        <Text style={styles.value}>{payment.paymentDate}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.value}>Verified & Approved</Text>
                    </View>
                </View>
                <View style={styles.amountRow}>
                    <Text>Total Amount Paid</Text>
                    <Text style={styles.totalAmount}>₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>This is a system-generated receipt and does not require a physical signature.</Text>
                <Text style={styles.footerText}>Speak Orange Academy - Shaping Futures, One Word at a Time.</Text>
                <Text style={styles.thankYou}>Thank you for choosing Speak Orange Academy!</Text>
            </View>
        </Page>
    </Document>
);
