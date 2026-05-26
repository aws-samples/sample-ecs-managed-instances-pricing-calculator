import React, { useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Container,
  Header,
  Table,
  Box,
  SpaceBetween,
  Button
} from '@cloudscape-design/components';
import { getCurrency } from '../data/currencies';
import { regions } from '../data/options';

function Results({ results, currency = 'USD', exchangeRate = 1 }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .download-button {
        background-color: #232F3E !important;
        border-color: #232F3E !important;
        color: #FFFFFF !important;
        font-size: 14px !important;
        padding: 8px 20px !important;
      }
      .download-button:hover {
        background-color: #31465F !important;
        border-color: #31465F !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper function to convert USD to selected currency
  const convertCurrency = (amountUSD) => {
    if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
      return 0;
    }
    return amountUSD * exchangeRate;
  };

  // Helper function to format currency
  const formatCurrencyHelper = (amount, currencyCode) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }
    const currencyInfo = getCurrency(currencyCode);
    const decimals = ['JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
    return `${currencyInfo.symbol}${amount.toFixed(decimals)}`;
  };

  // Format with both USD and selected currency (if different)
  const formatDualCurrency = (amountUSD) => {
    if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) {
      return 'N/A';
    }
    
    const usdFormatted = formatCurrencyHelper(amountUSD, 'USD');
    
    if (currency === 'USD') {
      return usdFormatted;
    }
    
    const converted = convertCurrency(amountUSD);
    const convertedFormatted = formatCurrencyHelper(converted, currency);
    return `${usdFormatted} / ${convertedFormatted}`;
  };

  const exportToPDF = () => {
    // Use landscape orientation for non-USD currencies to fit dual-currency values
    const isMultiCurrency = currency !== 'USD';
    const doc = new jsPDF({ orientation: isMultiCurrency ? 'landscape' : 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;
    
    const currencyInfo = getCurrency(currency);

    // Map currency symbols to PDF-safe ASCII alternatives
    // jsPDF's default Helvetica font only supports WinAnsiEncoding
    const getPDFSafeSymbol = (code) => {
      const safeSymbols = {
        'USD': '$',
        'EUR': 'EUR ',
        'GBP': 'GBP ',
        'JPY': 'JPY ',
        'CNY': 'CNY ',
        'INR': 'INR ',
        'AUD': 'A$',
        'CAD': 'C$',
        'SGD': 'S$',
        'BRL': 'R$'
      };
      return safeSymbols[code] || code + ' ';
    };

    const safeCurrencySymbol = getPDFSafeSymbol(currency);

    // PDF currency formatting helper using safe symbols
    const pdfFmt = (amountUSD) => {
      if (currency === 'USD') {
        return `$${amountUSD.toFixed(2)}`;
      }
      const converted = convertCurrency(amountUSD);
      const decimals = ['JPY', 'KRW'].includes(currency) ? 0 : 2;
      return `$${amountUSD.toFixed(2)} / ${safeCurrencySymbol}${converted.toFixed(decimals)}`;
    };

    // Helper to check if we need a new page (reserves 25px for footer)
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 25;
    const checkPageBreak = (requiredSpace = 60) => {
      if (yPosition + requiredSpace > pageHeight - footerMargin) {
        doc.addPage();
        yPosition = 15;
      }
    };

    // Table styles for multi-currency (smaller font, linebreak overflow)
    const tableStyles = isMultiCurrency
      ? { fontSize: 7, overflow: 'linebreak', cellPadding: 2 }
      : { fontSize: 8 };

    // Margin for autoTable to avoid footer overlap
    const tableMargin = { top: 15, bottom: footerMargin };

    // Color palette for PDF
    const colors = {
      awsOrange: [255, 153, 0],        // AWS orange for headers
      green: [39, 174, 96],             // Green for savings/positive
      lightGreen: [232, 245, 233],      // Light green background
      red: [231, 76, 60],               // Red for costs/negative
      lightRed: [253, 237, 236],        // Light red background
      blue: [41, 128, 185],             // Blue for ECS Managed column
      lightBlue: [235, 245, 251],       // Light blue background
      darkGray: [52, 73, 94],           // Dark gray for section headers
      lightGray: [245, 245, 245],       // Light gray for alternating rows
    };

    const headStyles = { fillColor: colors.awsOrange, textColor: [255, 255, 255], fontStyle: 'bold' };

    // Add title
    doc.setFontSize(18);
    doc.text('Amazon ECS Managed Instances Cost Analysis', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add date and currency info
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    
    // Add region info
    const regionLabel = results.region 
      ? (regions.find(r => r.value === results.region)?.label || results.region)
      : 'Not specified';
    doc.text(`AWS Region: ${regionLabel}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    if (currency !== 'USD') {
      doc.text(`Currency: ${currencyInfo.label} (Exchange Rate: ${exchangeRate})`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.setFontSize(8);
      doc.text('Note: All values shown in both USD and selected currency', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    } else {
      doc.text('Currency: USD - US Dollar ($)', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Instance Breakdown
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.text('Instance Cost Breakdown', 14, yPosition);
    yPosition += 5;

    const instanceHeaders = currency === 'USD' 
      ? ['Instance Type', 'Count', 'EC2 Cost ($)', 'Amazon ECS Managed Instances Fee ($/hr)', 'ECS Fee ($)', 'Total ($)']
      : ['Instance Type', 'Count', `EC2 Cost ($ / ${currency})`, `Amazon ECS Managed Instances Fee ($/hr)`, `ECS Fee ($ / ${currency})`, `Total ($ / ${currency})`];

    const instanceData = [instanceHeaders];

    results.instanceBreakdown.forEach(item => {
      instanceData.push([
        item.instanceType,
        item.count.toString(),
        pdfFmt(item.ec2Cost),
        item.ecsManagementFeePerHour ? `$${item.ecsManagementFeePerHour.toFixed(5)}` : 'N/A',
        pdfFmt(item.ecsManagedInstancesFee),
        pdfFmt(item.totalCost)
      ]);
    });

    autoTable(doc, {
      startY: yPosition,
      head: [instanceData[0]],
      body: instanceData.slice(1),
      theme: 'striped',
      margin: tableMargin,
      headStyles,
      styles: tableStyles,
      columnStyles: {
        5: { fontStyle: 'bold' } // Total column bold
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Total Infrastructure Costs
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.text('Total Infrastructure Costs', 14, yPosition);
    yPosition += 5;

    const infraHeaders = currency === 'USD'
      ? ['Cost Component', 'Amount ($)']
      : ['Cost Component', `Amount ($ / ${currency})`];

    const infrastructureData = [infraHeaders];
    
    infrastructureData.push(
      ['Total EC2 Cost', pdfFmt(results.totalEC2Cost)],
      ['Total ECS Management Fee', pdfFmt(results.totalECSManagedFee)],
      ['Total Infrastructure Cost', pdfFmt(results.totalEC2Cost + results.totalECSManagedFee)]
    );

    autoTable(doc, {
      startY: yPosition,
      head: [infrastructureData[0]],
      body: infrastructureData.slice(1),
      theme: 'striped',
      margin: tableMargin,
      headStyles,
      styles: tableStyles,
      didParseCell: (data) => {
        // Highlight the total row with a darker background
        if (data.section === 'body' && data.row.index === 2) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = colors.lightGray;
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Bin-Packing Efficiency
    if (results.binPacking) {
      checkPageBreak(70);
      doc.setFontSize(14);
      doc.text('Bin-Packing Efficiency', 14, yPosition);
      yPosition += 5;

      const binPackingData = [
        ['Metric', 'Standard Amazon EC2', 'Amazon ECS Managed Instances'],
        ['Instance Count', results.totalInstances.toString(), `${results.totalOptimizedInstances} (${results.binPacking.instancesSaved} fewer)`],
        ['Utilization', `${(results.binPacking.currentUtilization * 100).toFixed(0)}%`, `${(results.binPacking.managedUtilization * 100).toFixed(0)}%`],
        ['Amazon EC2 Infrastructure Cost', pdfFmt(results.totalEC2Cost), pdfFmt(results.totalOptimizedEC2Cost)],
        ['Amazon EC2 Savings from Bin-Packing', '-', pdfFmt(results.binPacking.ec2Savings)]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [binPackingData[0]],
        body: binPackingData.slice(1),
        theme: 'striped',
      margin: tableMargin,
        headStyles,
        styles: tableStyles,
        didParseCell: (data) => {
          if (data.section === 'body') {
            // Color the ECS Managed column (index 2) with light blue
            if (data.column.index === 2) {
              data.cell.styles.fillColor = colors.lightBlue;
            }
            // Highlight savings row in green
            if (data.row.index === 3) {
              data.cell.styles.fillColor = colors.lightGreen;
              data.cell.styles.textColor = colors.green;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Staffing Costs
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.text('Staffing Costs', 14, yPosition);
    yPosition += 5;

    const staffingHeaders = currency === 'USD'
      ? ['Approach', 'Hours per Month', 'Monthly Cost ($)']
      : ['Approach', 'Hours per Month', `Monthly Cost ($ / ${currency})`];

    const staffingData = [staffingHeaders];
    
    staffingData.push(
      ['Standard Amazon EC2 (Manual)', results.standardEC2StaffingHours.toFixed(1), pdfFmt(results.standardEC2StaffingCost)],
      ['Amazon ECS Managed Instances (Automated)', results.ecsManagedStaffingHours.toFixed(1), pdfFmt(results.ecsManagedStaffingCost)]
    );

    autoTable(doc, {
      startY: yPosition,
      head: [staffingData[0]],
      body: staffingData.slice(1),
      theme: 'striped',
      margin: tableMargin,
      headStyles,
      styles: tableStyles,
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Highlight ECS Managed row (lower cost) in green
          if (data.row.index === 1) {
            data.cell.styles.fillColor = colors.lightGreen;
          }
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Cost Comparison
    checkPageBreak(80);
    doc.setFontSize(14);
    doc.text('Cost Comparison: Standard Amazon EC2 vs Amazon ECS Managed Instances', 14, yPosition);
    yPosition += 5;

    const comparisonData = [
      ['Metric', 'Standard Amazon EC2', 'Amazon ECS Managed Instances']
    ];

    comparisonData.push(
      ['Total Instances', results.totalInstances.toString(), `${results.totalOptimizedInstances} (bin-packed)`],
      ['Amazon EC2 Infrastructure Cost', pdfFmt(results.totalEC2Cost), pdfFmt(results.totalOptimizedEC2Cost)],
      ['ECS Management Fee', pdfFmt(0), pdfFmt(results.totalECSManagedFee)],
      ['Staffing Hours/Month', results.standardEC2StaffingHours.toFixed(1), results.ecsManagedStaffingHours.toFixed(1)],
      ['Staffing Cost', pdfFmt(results.standardEC2StaffingCost), pdfFmt(results.ecsManagedStaffingCost)],
      ['Total Monthly Cost', pdfFmt(results.standardEC2TotalCost), pdfFmt(results.ecsManagedTotalCost)]
    );

    autoTable(doc, {
      startY: yPosition,
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      theme: 'striped',
      margin: tableMargin,
      headStyles,
      styles: tableStyles,
      didParseCell: (data) => {
        if (data.section === 'head') {
          // Color "ECS Managed" header column with blue tint
          if (data.column.index === 2) {
            data.cell.styles.fillColor = colors.blue;
          }
        }
        if (data.section === 'body') {
          // Highlight the Total Monthly Cost row
          if (data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = (tableStyles.fontSize || 8) + 1;
            // Color the winning (lower cost) column green, higher cost red
            if (data.column.index === 1) {
              data.cell.styles.fillColor = results.savings > 0 ? colors.lightRed : colors.lightGreen;
            }
            if (data.column.index === 2) {
              data.cell.styles.fillColor = results.savings > 0 ? colors.lightGreen : colors.lightRed;
            }
          }
          // Light blue tint on ECS Managed column for other rows
          if (data.row.index !== 5 && data.column.index === 2) {
            data.cell.styles.fillColor = colors.lightBlue;
          }
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Savings Summary - color coded
    checkPageBreak(30);
    yPosition += 5;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    if (results.savings > 0) {
      doc.setTextColor(colors.green[0], colors.green[1], colors.green[2]);
    } else {
      doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
    }
    const savingsLabel = results.savings > 0 ? 'SAVINGS with Amazon ECS Managed Instances' : 'ADDITIONAL COST with Amazon ECS Managed Instances';
    const savingsDecimals = ['JPY', 'KRW'].includes(currency) ? 0 : 2;
    const savingsText = currency === 'USD'
      ? `${savingsLabel}: $${Math.abs(results.savings).toFixed(2)}/month (${Math.abs(results.savingsPercentage).toFixed(1)}%)`
      : `${savingsLabel}: $${Math.abs(results.savings).toFixed(2)} / ${safeCurrencySymbol}${convertCurrency(Math.abs(results.savings)).toFixed(savingsDecimals)}/month (${Math.abs(results.savingsPercentage).toFixed(1)}%)`;
    doc.text(savingsText, 14, yPosition);
    
    // Reset text color and font
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Time savings note
    if (results.savings > 0) {
      yPosition += 7;
      doc.setFontSize(10);
      doc.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
      doc.text(`Time saved: ${results.standardEC2StaffingHours - results.ecsManagedStaffingHours} platform engineering hours/month`, 14, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      const mainFooterText = `© ${currentYear}, Amazon Web Services, Inc. or its affiliates. All rights reserved.`;
      doc.text(mainFooterText, 14, doc.internal.pageSize.getHeight() - 10);

      const pageText = `Page ${i} of ${pageCount}`;
      doc.text(pageText, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save('ecs-managed-instances-cost-analysis.pdf');
  };

  return (
    <Container
      header={<Header variant="h2">Cost Analysis Results</Header>}
    >
      <SpaceBetween size="l">
        <Container
          header={
            <Header 
              variant="h3"
              description={currency !== 'USD' ? 'Values shown in USD / Selected Currency' : 'All values in USD'}
            >
              Instance Cost Breakdown
            </Header>
          }
        >
          <Table
            columnDefinitions={[
              {
                id: 'instanceType',
                header: 'Instance Type',
                cell: item => item.instanceType
              },
              {
                id: 'count',
                header: 'Current Count',
                cell: item => item.count
              },
              {
                id: 'optimizedCount',
                header: 'Optimized Count (Bin-Packed)',
                cell: item => item.optimizedCount || item.count
              },
              {
                id: 'ec2Cost',
                header: 'Amazon EC2 Cost',
                cell: item => formatDualCurrency(item.ec2Cost)
              },
              {
                id: 'managementFeePerHour',
                header: 'Amazon ECS Managed Instances Fee ($/hr)',
                cell: item => item.ecsManagementFeePerHour ? `$${item.ecsManagementFeePerHour.toFixed(5)}` : 'N/A'
              },
              {
                id: 'ecsManagedInstancesFee',
                header: 'Amazon ECS Managed Instances Fee (Monthly)',
                cell: item => formatDualCurrency(item.ecsManagedInstancesFee)
              },
              {
                id: 'totalCost',
                header: 'Total Cost',
                cell: item => formatDualCurrency(item.totalCost)
              }
            ]}
            items={results.instanceBreakdown}
            variant="embedded"
          />
        </Container>

        <Container
          header={
            <Header 
              variant="h3"
              description={currency !== 'USD' ? 'Values shown in USD / Selected Currency' : 'All values in USD'}
            >
              Total Infrastructure Costs
            </Header>
          }
        >
          <Table
            columnDefinitions={[
              {
                id: 'component',
                header: 'Cost Component',
                cell: item => item.component
              },
              {
                id: 'amount',
                header: 'Amount',
                cell: item => formatDualCurrency(item.amount)
              }
            ]}
            items={[
              { component: 'Total Amazon EC2 Cost', amount: results.totalEC2Cost },
              { component: 'Total Amazon ECS Managed Instances Fee', amount: results.totalECSManagedFee },
              { component: 'Total Infrastructure Cost', amount: results.totalEC2Cost + results.totalECSManagedFee }
            ]}
            variant="embedded"
          />
        </Container>

        <Container
          header={
            <Header 
              variant="h3"
              description={currency !== 'USD' ? 'Values shown in USD / Selected Currency' : 'All values in USD'}
            >
              Bin-Packing Efficiency
            </Header>
          }
        >
          <SpaceBetween size="m">
            {results.binPacking && (
              <Box variant="awsui-key-label" padding="s">
                <SpaceBetween size="xs">
                  <Box fontSize="body-s" color="text-status-info">
                    Amazon ECS Managed Instances bin-pack tasks more efficiently, reducing the number of instances needed.
                  </Box>
                  <Box fontSize="body-s">
                    Current utilization: {(results.binPacking.currentUtilization * 100).toFixed(0)}% → Managed target: {(results.binPacking.managedUtilization * 100).toFixed(0)}%
                  </Box>
                </SpaceBetween>
              </Box>
            )}
            <Table
              columnDefinitions={[
                {
                  id: 'metric',
                  header: 'Metric',
                  cell: item => item.metric
                },
                {
                  id: 'standardEC2',
                  header: 'Standard Amazon EC2',
                  cell: item => item.standardEC2
                },
                {
                  id: 'ecsManaged',
                  header: 'Amazon ECS Managed Instances',
                  cell: item => item.ecsManaged
                }
              ]}
              items={[
                {
                  metric: 'Instance Count',
                  standardEC2: results.totalInstances.toString(),
                  ecsManaged: `${results.totalOptimizedInstances} (${results.binPacking?.instancesSaved || 0} fewer)`
                },
                {
                  metric: 'Utilization',
                  standardEC2: `${((results.binPacking?.currentUtilization || 0.6) * 100).toFixed(0)}%`,
                  ecsManaged: `${((results.binPacking?.managedUtilization || 0.9) * 100).toFixed(0)}%`
                },
                {
                  metric: 'Amazon EC2 Infrastructure Cost',
                  standardEC2: formatDualCurrency(results.totalEC2Cost),
                  ecsManaged: formatDualCurrency(results.totalOptimizedEC2Cost)
                },
                {
                  metric: 'Amazon EC2 Savings from Bin-Packing',
                  standardEC2: '-',
                  ecsManaged: formatDualCurrency(results.binPacking?.ec2Savings || 0)
                }
              ]}
              variant="embedded"
            />
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header 
              variant="h3"
              description={currency !== 'USD' ? 'Values shown in USD / Selected Currency' : 'All values in USD'}
            >
              Staffing Costs (Fleet-Based Model)
            </Header>
          }
        >
          <SpaceBetween size="m">
            {results.managementTimeModel && (
              <Box variant="awsui-key-label" padding="s">
                <SpaceBetween size="xs">
                  <Box fontSize="body-s" color="text-status-info">
                    Fixed monthly overhead for fleet management (independent of instance count)
                  </Box>
                  <Box fontSize="body-s">
                    Standard Amazon EC2: {results.managementTimeModel.standardEC2.baseHoursPerMonth}h/month — ASG config, AMI management, patching, monitoring, scaling policies
                  </Box>
                  <Box fontSize="body-s">
                    Amazon ECS Managed Instances: {results.managementTimeModel.ecsManaged.baseHoursPerMonth}h/month — Capacity provider monitoring, capacity planning
                  </Box>
                </SpaceBetween>
              </Box>
            )}
            <Table
              columnDefinitions={[
                {
                  id: 'approach',
                  header: 'Approach',
                  cell: item => item.approach
                },
                {
                  id: 'hoursPerMonth',
                  header: 'Hours per Month',
                  cell: item => item.hoursPerMonth
                },
                {
                  id: 'cost',
                  header: 'Monthly Cost',
                  cell: item => formatDualCurrency(item.cost)
                }
              ]}
              items={[
                { 
                  approach: 'Standard Amazon EC2 (ASG Management)', 
                  hoursPerMonth: results.standardEC2StaffingHours.toFixed(1), 
                  cost: results.standardEC2StaffingCost 
                },
                { 
                  approach: 'Amazon ECS Managed Instances (Capacity Provider)', 
                  hoursPerMonth: results.ecsManagedStaffingHours.toFixed(1), 
                  cost: results.ecsManagedStaffingCost 
                }
              ]}
              variant="embedded"
            />
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header 
              variant="h3"
              description={currency !== 'USD' ? 'Comparison between managing standard Amazon EC2 instances vs using Amazon ECS Managed Instances (USD / Selected Currency)' : 'Comparison between managing standard Amazon EC2 instances vs using Amazon ECS Managed Instances'}
            >
              Cost Comparison: Standard Amazon EC2 vs Amazon ECS Managed Instances
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Table
              columnDefinitions={[
                {
                  id: 'metric',
                  header: 'Metric',
                  cell: item => item.metric
                },
                {
                  id: 'standardEC2',
                  header: 'Standard Amazon EC2',
                  cell: item => item.standardEC2
                },
                {
                  id: 'ecsManaged',
                  header: 'Amazon ECS Managed Instances',
                  cell: item => item.ecsManaged
                }
              ]}
              items={[
                { 
                  metric: 'Total Instances', 
                  standardEC2: results.totalInstances.toString(), 
                  ecsManaged: `${results.totalOptimizedInstances} (bin-packed)` 
                },
                { 
                  metric: 'Amazon EC2 Infrastructure Cost', 
                  standardEC2: formatDualCurrency(results.totalEC2Cost), 
                  ecsManaged: formatDualCurrency(results.totalOptimizedEC2Cost) 
                },
                { 
                  metric: 'Amazon ECS Managed Instances Fee', 
                  standardEC2: formatDualCurrency(0), 
                  ecsManaged: formatDualCurrency(results.totalECSManagedFee) 
                },
                { 
                  metric: 'Staffing Hours per Month', 
                  standardEC2: results.standardEC2StaffingHours.toFixed(1), 
                  ecsManaged: results.ecsManagedStaffingHours.toFixed(1) 
                },
                { 
                  metric: 'Staffing Cost', 
                  standardEC2: formatDualCurrency(results.standardEC2StaffingCost), 
                  ecsManaged: formatDualCurrency(results.ecsManagedStaffingCost) 
                },
                { 
                  metric: 'Total Monthly Cost', 
                  standardEC2: formatDualCurrency(results.standardEC2TotalCost), 
                  ecsManaged: formatDualCurrency(results.ecsManagedTotalCost) 
                }
              ]}
              variant="embedded"
            />
            
            <Box padding="m" variant={results.savings > 0 ? 'div' : 'div'}>
              <SpaceBetween size="xs">
                <Box fontSize="heading-m" fontWeight="bold" color={results.savings > 0 ? 'text-status-success' : 'text-status-error'}>
                  {results.savings > 0 ? 'Savings' : 'Additional Cost'} with Amazon ECS Managed Instances: {formatDualCurrency(Math.abs(results.savings))}/month
                </Box>
                <Box fontSize="body-m">
                  {results.savings > 0 ? 'Cost Reduction' : 'Cost Increase'}: {Math.abs(results.savingsPercentage).toFixed(1)}%
                </Box>
                {results.savings > 0 && (
                  <Box fontSize="body-s" color="text-status-info">
                    By using Amazon ECS Managed Instances, you save {results.standardEC2StaffingHours - results.ecsManagedStaffingHours} hours of platform engineering time per month.
                  </Box>
                )}
                {currency !== 'USD' && (
                  <Box fontSize="body-s" color="text-status-inactive" fontStyle="italic">
                    Note: Exchange rate used: 1 USD = {exchangeRate} {currency}
                  </Box>
                )}
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>

        <Box textAlign="center" padding={{ top: 'l', bottom: 'l' }}>
          <Button
            variant="primary"
            iconName="download"
            onClick={exportToPDF}
            className="download-button"
          >
            Download Results as PDF
          </Button>
        </Box>
      </SpaceBetween>
    </Container>
  );
}

export default Results;
