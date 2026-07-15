import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { Ticket } from '../hooks/useTicket';

// Grille A4 : 4 colonnes x 12 lignes = 48 coupons par page
const COUPON_WIDTH = 134;   // ~47.3 mm
const COUPON_HEIGHT = 62;   // ~21.9 mm
const GAP = 6;              // ~2.1 mm
const PAGE_PADDING = 18;    // ~6.4 mm

const styles = StyleSheet.create({
    page: {
        width: '100%',
        height: '100%',
        padding: PAGE_PADDING,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        backgroundColor: '#fff',
    },
    coupon: {
        width: COUPON_WIDTH,
        height: COUPON_HEIGHT,
        borderWidth: 0.8,
        borderStyle: 'dashed',
        borderColor: '#222',
        borderRadius: 3,
        padding: 4,
        justifyContent: 'space-between',
        alignItems: 'stretch',
        backgroundColor: '#fff',
    },
    offerName: {
        fontSize: 4.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        lineHeight: 1.1,
        marginBottom: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'solid',
        paddingBottom: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 1,
    },
    label: {
        fontSize: 4,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginRight: 4,
    },
    code: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 0.3,
        fontFamily: 'Courier-Bold',
        flex: 1,
        textAlign: 'right',
    },
});

interface A4CouponsPdfProps {
    offerName: string;
    tickets: Ticket[];
}

export const A4CouponsPdf: React.FC<A4CouponsPdfProps> = ({ offerName, tickets }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {tickets.map((ticket, index) => (
                    <View key={ticket.id || index} style={styles.coupon}>
                        <Text style={styles.offerName}>{offerName}</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Login</Text>
                            <Text style={styles.code}>{ticket.ticket_code || 'N/A'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Password</Text>
                            <Text style={styles.code}>{ticket.ticket_secret || ticket.password || 'N/A'}</Text>
                        </View>
                    </View>
                ))}
            </Page>
        </Document>
    );
};

export default A4CouponsPdf;
