# Amazon Elastic Container Service (Amazon ECS) Managed Instances TCO Calculator

Amazon ECS Managed Instances simplify container infrastructure management by automating instance provisioning, patching, and lifecycle management. This TCO calculator helps in visualizing the cost savings by using Amazon ECS Managed Instances.

## Overview

This application helps AWS customers and partners estimate the potential cost savings of using Amazon ECS Managed Instances compared to standard Amazon Elastic Compute Cloud (Amazon EC2)-based Amazon ECS deployments. It takes into account:

- EC2 instance costs across 700+ instance types
- ECS Managed Instances management fees
- Platform engineering staffing costs
- Regional pricing variations across 28 AWS regions
- Multi-currency support for global teams

The calculator provides a comprehensive Total Cost of Ownership (TCO) analysis, showing both infrastructure and operational costs to help you make informed decisions about adopting ECS Managed Instances.

## Key Features

- **Real-time Cost Calculation** - Calculate costs for ECS managed instances across all AWS regions
- **Comprehensive Instance Support** - 700+ EC2 instance types across 101 families including:
  - **General Purpose**: t3, t3a, t4g, m5-m8g series (22 families)
  - **Compute Optimized**: c5-c8g series, hpc series (22 families)
  - **Memory Optimized**: r5-r8g series, x series, u series, z1d (28 families)
  - **Storage Optimized**: d3, i4-i8g series, im4gn, is4gen (10 families)
  - **Accelerated Computing**: g4-g6 series, gr6 series, p3-p6 series (14 families)
  - Latest generation: m8g/m8gd, c8g/c8gd/c8gn, r8g/r8gd, i8g, x8g (Graviton4), p5 (H100), p6-b200 (B200)
- **Dynamic Pricing System** - Two methods for accurate pricing:
  - **AWS Price List API**: Fetch real, current pricing directly from AWS (100% accurate)
  - **Calculated Estimates**: Fast offline pricing using base prices + regional multipliers (~95% accurate)
- **28 AWS Regions** - Complete coverage of all major AWS regions worldwide
- **Multi-Currency Support** - View costs in 10 major currencies with configurable exchange rates
- **Auto-Calculated Management Fee** - ECS management fee automatically calculated as 12% of EC2 hourly cost per instance type
- **Adjustable Per-Instance Fee** - Customize the management fee ($/hour) for each instance type if needed
- **Multiple Instance Types** - Add and compare multiple instance types simultaneously
- **Comprehensive Cost Analysis** - Detailed breakdown showing:
  - Instance cost breakdown by type
  - Total infrastructure costs (EC2 + ECS fees)
  - Staffing costs comparison (Standard EC2 vs ECS Managed)
  - Side-by-side cost comparison with savings calculation
- **Platform Engineering Costs** - Calculate and compare staffing costs between manual EC2 management and automated ECS management
- **Configurable Assumptions** - Adjust platform engineering hourly rates and management time estimates
- **PDF Export** - Download detailed cost analysis reports with currency support

## Installation

```bash
cd ecs-pricing-calculator
npm install
```

## Usage

### Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### How to Use

1. **Select Currency** - Choose your preferred currency from the dropdown (default: USD)
2. **Configure Exchange Rate** - Adjust the exchange rate if needed (auto-populated for each currency)
3. **Select Region** - Choose from 28 AWS regions worldwide
4. **Configure Instances** - Add one or more instance types from 700+ available options
5. **Review Management Fee** - ECS management fee is auto-calculated as 12% of EC2 cost (adjustable)
6. **Set Usage** - Adjust hours per month (default: 730 hours)
7. **Adjust Assumptions** (Optional) - Expand the Assumptions section to customize:
   - Platform engineer salary and hourly rate
   - Infrastructure management hours per instance
8. **Calculate** - Click "Calculate Costs" to see the comprehensive breakdown
9. **Review Results** - Analyze costs in both USD and your selected currency
10. **Export** - Download results as PDF with dual currency display

## Pricing System

The calculator uses a dynamic pricing system with two methods:

### AWS Price List API Method (Recommended)
- **Accuracy**: 100% - Real AWS pricing
- **Coverage**: 28 regions, 700+ instance types
- **Command**: `npm run fetch-aws-pricing`
- **Time**: 10-15 minutes
- **Best for**: Production, monthly updates

### Calculated Estimates Method
- **Accuracy**: ~95% - Estimated pricing
- **Coverage**: 28 regions, 700+ instance types
- **Command**: `npm run update-pricing`
- **Time**: 5 seconds
- **Best for**: Development, quick updates

Both methods generate `public/data/ec2-prices.json` which is loaded by the app. Monthly updates are recommended for production accuracy.

See [PRICING_SYSTEM.md](./PRICING_SYSTEM.md) for complete documentation.

### Pricing Details

- **EC2 Costs**: Based on AWS On-Demand pricing for Linux instances, fetched from AWS Price List API or calculated using regional multipliers.
- **ECS Managed Instances Fee**: Automatically calculated as 12% of EC2 hourly cost per instance type. Can be adjusted individually. Actual fees may vary — verify in AWS Console or contact AWS Support.
- **Regional Pricing**: Automatically adjusted for each AWS region. Regional multipliers range from 1.0 (US East) to 1.35 (São Paulo).

## Currency Support

The calculator supports 10 major currencies with configurable exchange rates:

- **USD** - US Dollar ($) - Base currency (all AWS pricing is in USD)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **JPY** - Japanese Yen (¥)
- **CNY** - Chinese Yuan (¥)
- **INR** - Indian Rupee (₹)
- **AUD** - Australian Dollar (A$)
- **CAD** - Canadian Dollar (C$)
- **SGD** - Singapore Dollar (S$)
- **BRL** - Brazilian Real (R$)

Exchange rates auto-populate with approximate values and can be adjusted in the UI. PDF exports include dual currency display (USD / Selected Currency) when a non-USD currency is selected.

**Note**: Exchange rates are approximate mid-market rates as of May 26, 2026. Users should verify rates from reliable sources for accurate estimates.

## Cost Components

The calculator provides a comprehensive cost analysis including:

### 1. Instance Cost Breakdown
- Per-instance type details showing EC2 costs, ECS fees, and totals
- Hourly ECS management fee displayed for each instance type

### 2. Total Infrastructure Costs
- Total EC2 infrastructure costs
- Total ECS managed instance fees
- Combined infrastructure total (excluding staffing)

### 3. Staffing Costs
- **Standard EC2 (Manual Management)**: 2 hours per instance per month
- **ECS Managed Instances (Automated)**: 0.5 hours per instance per month
- Calculated based on configurable platform engineer hourly rate

### 4. Cost Comparison
- Side-by-side comparison of Standard EC2 vs ECS Managed Instances
- Shows infrastructure costs, staffing costs, and total monthly costs
- Calculates savings (or additional costs) with percentage
- Highlights time savings in platform engineering hours

All costs can be viewed in your preferred currency with automatic conversion from USD base pricing.

## Quick Commands

```bash
# Development
npm start                    # Start dev server
npm run update-pricing       # Quick pricing update (5 sec)

# Production
npm run fetch-aws-pricing    # Fetch real AWS pricing (10-15 min)
npm run build                # Build for production

# Testing
npm test                     # Run tests
```

### Adding New Instance Types
1. Edit `scripts/fetch-aws-pricing.js` or `scripts/generate-pricing-data.js`
2. Add instance family to the list
3. Run pricing update script
4. Update `src/data/options.js` to make available in UI

### Adding New Regions
1. Edit pricing scripts with new region
2. Run pricing update script
3. Update `src/data/options.js` to make available in UI

## Security

This is a client-side calculator — no user data leaves your browser. All calculations happen locally.

The optional `npm run fetch-aws-pricing` script requires AWS credentials with `pricing:GetProducts` permission. Use an IAM role or environment variables; never hardcode credentials. See the [AWS documentation on configuring credentials](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

## Disclaimer

Cost estimates produced by this calculator are approximate and for planning purposes only. Pricing data may not reflect current AWS pricing. Always verify costs through the [AWS Pricing page](https://aws.amazon.com/pricing/) or your AWS account before making purchasing decisions. Exchange rates are approximate mid-market rates as of May 26, 2026 and should be verified from reliable sources before use.

## License

This project is licensed under the MIT-0 License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please follow AWS coding standards and include tests for new features.

For developers and maintainers:
- [PRICING_SYSTEM.md](./PRICING_SYSTEM.md) - Complete pricing system documentation
- [PRICING_METHODS.md](./PRICING_METHODS.md) - Comparison of pricing methods
- [AWS_PRICING_API_GUIDE.md](./AWS_PRICING_API_GUIDE.md) - AWS API integration guide
- [scripts/README.md](./scripts/README.md) - Pricing scripts documentation

## Support

For issues or questions:
- Review the comprehensive documentation in this repository
- Check [Amazon ECS documentation](https://docs.aws.amazon.com/ecs/)
- Open an issue in the repository for bugs or feature requests

## Known Limitations

- This project uses `react-scripts@5.0.1` (Create React App), which bundles eslint 8.x. Eslint 8 is no longer receiving updates but remains functional. A future migration to Vite or similar would resolve this.

## Acknowledgments

- Pricing data sourced from AWS Price List API