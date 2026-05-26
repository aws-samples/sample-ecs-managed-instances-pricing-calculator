#!/usr/bin/env node

/**
 * Amazon EC2 Pricing Fetcher
 * 
 * Fetches real Amazon EC2 pricing data from AWS Price List API for all regions and instance types.
 * This script generates accurate pricing data directly from AWS instead of using estimates.
 * 
 * Usage:
 *   node scripts/fetch-aws-pricing.js
 * 
 * Output:
 *   public/data/ec2-prices.json
 * 
 * Requirements:
 *   - AWS SDK (@aws-sdk/client-pricing)
 *   - AWS credentials configured (optional - API is public)
 * 
 * Update Frequency:
 *   Run monthly or when AWS announces price changes
 */

const { PricingClient, GetProductsCommand } = require('@aws-sdk/client-pricing');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ec2-prices.json');

// AWS Pricing API is only available in us-east-1 and ap-south-1
const pricingClient = new PricingClient({ region: 'us-east-1' });

// AWS Regions to fetch pricing for
const AWS_REGIONS = {
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',
  'ca-central-1': 'Canada (Central)',
  'sa-east-1': 'South America (São Paulo)',
  'eu-west-1': 'Europe (Ireland)',
  'eu-west-2': 'Europe (London)',
  'eu-west-3': 'Europe (Paris)',
  'eu-central-1': 'Europe (Frankfurt)',
  'eu-central-2': 'Europe (Zurich)',
  'eu-north-1': 'Europe (Stockholm)',
  'eu-south-1': 'Europe (Milan)',
  'eu-south-2': 'Europe (Spain)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-northeast-3': 'Asia Pacific (Osaka)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-southeast-3': 'Asia Pacific (Jakarta)',
  'ap-southeast-4': 'Asia Pacific (Melbourne)',
  'ap-south-1': 'Asia Pacific (Mumbai)',
  'ap-south-2': 'Asia Pacific (Hyderabad)',
  'ap-east-1': 'Asia Pacific (Hong Kong)',
  'me-south-1': 'Middle East (Bahrain)',
  'me-central-1': 'Middle East (UAE)',
  'af-south-1': 'Africa (Cape Town)',
  'il-central-1': 'Israel (Tel Aviv)'
};

// Instance types to fetch (comprehensive list)
const INSTANCE_FAMILIES = [
  // General Purpose
  't3', 't3a', 't4g',
  'm5', 'm5a', 'm5ad', 'm5d', 'm5dn', 'm5n', 'm5zn',
  'm6a', 'm6g', 'm6gd', 'm6i', 'm6id', 'm6idn', 'm6in',
  'm7a', 'm7g', 'm7gd', 'm7i', 'm7i-flex',
  'm8g', 'm8gd',
  
  // Compute Optimized
  'c5', 'c5a', 'c5ad', 'c5d', 'c5n',
  'c6a', 'c6g', 'c6gd', 'c6i', 'c6id', 'c6in',
  'c7a', 'c7g', 'c7gd', 'c7gn', 'c7i', 'c7i-flex',
  'c8g', 'c8gd', 'c8gn',
  'hpc6a', 'hpc6id', 'hpc7a',
  
  // Memory Optimized
  'r5', 'r5a', 'r5ad', 'r5b', 'r5d', 'r5dn', 'r5n',
  'r6a', 'r6g', 'r6gd', 'r6i', 'r6id', 'r6idn', 'r6in',
  'r7a', 'r7g', 'r7gd', 'r7i', 'r7iz',
  'r8g', 'r8gd',
  'u-3tb1', 'u7i-6tb', 'u7i-8tb', 'u7i-12tb', 'u7in-24tb', 'u7in-32tb',
  'x2gd', 'x2idn', 'x2iedn', 'x2iezn', 'x8g',
  'z1d',
  
  // Storage Optimized
  'd3', 'd3en',
  'i4g', 'i4i', 'i7i', 'i7ie', 'i8g',
  'im4gn', 'is4gen',
  
  // Accelerated Computing
  'g4dn', 'g5', 'g5g', 'g6', 'g6e', 'g6f',
  'gr6', 'gr6f',
  'p3dn', 'p4d', 'p5', 'p6-b200'
];

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch pricing for a specific region
 */
async function fetchRegionPricing(regionCode, regionName) {
  console.log(`\nFetching pricing for ${regionName} (${regionCode})...`);
  
  const prices = {};
  let fetchedCount = 0;
  let errorCount = 0;
  
  try {
    // Fetch pricing for all instance families in this region
    // We'll fetch in batches to avoid overwhelming the API
    for (const family of INSTANCE_FAMILIES) {
      try {
        const filters = [
          { Type: 'TERM_MATCH', Field: 'ServiceCode', Value: 'AmazonEC2' },
          { Type: 'TERM_MATCH', Field: 'location', Value: regionName },
          { Type: 'TERM_MATCH', Field: 'instanceFamily', Value: family },
          { Type: 'TERM_MATCH', Field: 'operatingSystem', Value: 'Linux' },
          { Type: 'TERM_MATCH', Field: 'tenancy', Value: 'Shared' },
          { Type: 'TERM_MATCH', Field: 'preInstalledSw', Value: 'NA' },
          { Type: 'TERM_MATCH', Field: 'capacitystatus', Value: 'Used' }
        ];
        
        const command = new GetProductsCommand({
          ServiceCode: 'AmazonEC2',
          Filters: filters,
          MaxResults: 100
        });
        
        const response = await pricingClient.send(command);
        
        if (response.PriceList && response.PriceList.length > 0) {
          for (const priceItem of response.PriceList) {
            let product;
            try {
              product = JSON.parse(priceItem);
            } catch (parseError) {
              console.warn(`Skipping malformed price item: ${parseError.message}`);
              continue;
            }

            if (!product?.product?.attributes) continue;
            
            // Extract instance type
            const instanceType = product.product.attributes.instanceType;
            if (!instanceType) continue;
            
            // Extract on-demand pricing
            const terms = product.terms?.OnDemand;
            if (!terms) continue;
            
            // Get the first (and usually only) term
            const termKey = Object.keys(terms)[0];
            const priceDimensions = terms[termKey]?.priceDimensions;
            if (!priceDimensions) continue;
            
            // Get the first price dimension
            const dimensionKey = Object.keys(priceDimensions)[0];
            const pricePerUnit = priceDimensions[dimensionKey]?.pricePerUnit?.USD;
            
            if (pricePerUnit) {
              prices[instanceType] = parseFloat(pricePerUnit);
              fetchedCount++;
            }
          }
        }
        
        // Rate limiting - AWS Pricing API has limits
        await delay(100);
        
      } catch (error) {
        console.warn(`  [WARN] Error fetching ${family}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`  Done - Fetched ${fetchedCount} instance prices`);
    if (errorCount > 0) {
      console.log(`  [WARN] ${errorCount} families had errors`);
    }
    
  } catch (error) {
    console.error(`  [ERROR] Error fetching region pricing: ${error.message}`);
  }
  
  return prices;
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting Amazon EC2 Pricing Fetch from AWS Price List API...\n');
  console.log('This may take 10-15 minutes due to API rate limits...\n');
  
  const pricingData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '2.0.0',
      description: 'EC2 On-Demand pricing fetched from AWS Price List API',
      source: 'AWS Price List API',
      currency: 'USD',
      unit: 'per hour',
      totalRegions: Object.keys(AWS_REGIONS).length,
      totalInstanceTypes: 0
    },
    regions: {}
  };
  
  let totalInstanceTypes = 0;
  let completedRegions = 0;
  
  // Fetch pricing for each region
  for (const [regionCode, regionName] of Object.entries(AWS_REGIONS)) {
    const prices = await fetchRegionPricing(regionCode, regionName);
    
    pricingData.regions[regionCode] = {
      name: regionName,
      instanceCount: Object.keys(prices).length,
      prices: prices
    };
    
    totalInstanceTypes = Math.max(totalInstanceTypes, Object.keys(prices).length);
    completedRegions++;
    
    console.log(`\nProgress: ${completedRegions}/${Object.keys(AWS_REGIONS).length} regions completed`);
    
    // Longer delay between regions to respect API limits
    await delay(1000);
  }
  
  pricingData.metadata.totalInstanceTypes = totalInstanceTypes;
  
  console.log(`\nPricing data fetch complete!`);
  console.log(`   Total regions: ${pricingData.metadata.totalRegions}`);
  console.log(`   Max instance types per region: ${totalInstanceTypes}`);
  
  // Save pricing data
  console.log(`\nSaving pricing data to ${OUTPUT_FILE}...`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`   Created directory: ${OUTPUT_DIR}`);
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pricingData, null, 2));
  
  const stats = fs.statSync(OUTPUT_FILE);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  
  console.log(`   File saved successfully`);
  console.log(`   File size: ${fileSizeKB} KB`);
  console.log(`   Location: ${OUTPUT_FILE}`);
  
  console.log(`\nSuccess! Real AWS pricing data is ready to use.`);
  console.log(`\nNext steps:`);
  console.log(`   1. The pricing file will be served at: /data/ec2-prices.json`);
  console.log(`   2. The app will automatically load this file on startup`);
  console.log(`   3. Run this script monthly to keep prices up to date`);
  console.log(`\nTip: Add this to your CI/CD pipeline for automatic updates`);
}

// Run the script
main().catch(error => {
  console.error(`\n[ERROR] Fatal error:`, error);
  process.exit(1);
});
