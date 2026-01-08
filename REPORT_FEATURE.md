# Extensive Transaction Report Feature

## Overview
A comprehensive transaction reporting system that generates multi-sheet Excel reports with detailed analytics.

## Features

The "Download Report" button on the Transactions page generates an Excel file with 8 detailed sheets:

### 1. **Summary Sheet**
- Report period and generation date
- Key metrics (total transactions, sales, discounts, taxes)
- Average sale value
- Total items sold
- Payment method breakdown

### 2. **All Transactions Sheet**
- Complete list of all transactions
- Invoice number, date, customer
- Total, discount, tax amounts
- Payment method and status
- Cashier name
- Items count per transaction

### 3. **Product-wise Report**
- Sales performance by individual products
- Total quantity sold per product
- Revenue generated per product
- Number of transactions
- Average price per product
- Sorted by revenue (highest to lowest)

### 4. **Category-wise Report**
- Sales performance by product categories
- Number of unique products per category
- Total quantity and revenue per category
- Transaction count per category
- Average revenue per transaction

### 5. **Institute-wise Report**
- Sales performance by institute
- Unique products sold per institute
- Total quantity and revenue per institute
- Transaction count
- Average per transaction

### 6. **Daily Sales Report**
- Day-by-day sales breakdown
- Transactions per day
- Revenue, discount, and tax by day
- Items sold per day
- Average sale per day

### 7. **Payment Methods Report**
- Analysis by payment method (Cash, Card, etc.)
- Transaction count per method
- Total revenue per method
- Average transaction value
- Percentage of total sales

### 8. **Cashier Performance**
- Individual cashier statistics
- Transactions handled
- Revenue generated
- Items sold
- Average transaction value
- Average items per transaction

## Usage

1. Navigate to the **Transactions** page
2. Select the date range using the date filters
3. Click the **"Download Report"** button
4. Wait for the report generation (a loading indicator will show)
5. The Excel file will be automatically downloaded with filename: `Transaction_Report_YYYYMMDD_to_YYYYMMDD.xlsx`

## Technical Details

- **Library**: XLSX (SheetJS)
- **Report Generator**: `/src/utils/reportGenerator.ts`
- **File Format**: Excel (.xlsx)
- **Date Range**: Configurable via date filters on the UI

## Notes

- The report uses the currently filtered date range
- Category and Institute extraction assumes specific naming conventions in product names
- You may need to customize `extractCategory()` and `extractInstitute()` functions based on your actual data structure
- Reports are generated client-side for better performance

## Future Enhancements

Consider adding:
- Custom date range picker
- Report scheduling/automation
- PDF export option
- Email delivery of reports
- Additional filters (by cashier, payment method, etc.)
- Graphical charts in the Excel file
