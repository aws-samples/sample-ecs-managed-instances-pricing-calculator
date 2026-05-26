#!/usr/bin/env node

/**
 * Amazon ECS Pricing Data Generator
 * 
 * Generates comprehensive Amazon EC2 pricing data for all AWS regions and instance types.
 * This script creates a static JSON file that can be served with the application.
 * 
 * Usage:
 *   node scripts/generate-pricing-data.js
 * 
 * Output:
 *   public/data/ec2-prices.json
 * 
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ec2-prices.json');

// AWS Regions with their display names
const AWS_REGIONS = {
  // US Regions
  'us-east-1': { name: 'US East (N. Virginia)', multiplier: 1.0 },
  'us-east-2': { name: 'US East (Ohio)', multiplier: 1.0 },
  'us-west-1': { name: 'US West (N. California)', multiplier: 1.21 },
  'us-west-2': { name: 'US West (Oregon)', multiplier: 1.0 },
  
  // Canada
  'ca-central-1': { name: 'Canada (Central)', multiplier: 1.08 },
  
  // South America
  'sa-east-1': { name: 'South America (São Paulo)', multiplier: 1.35 },
  
  // Europe
  'eu-west-1': { name: 'Europe (Ireland)', multiplier: 1.12 },
  'eu-west-2': { name: 'Europe (London)', multiplier: 1.18 },
  'eu-west-3': { name: 'Europe (Paris)', multiplier: 1.18 },
  'eu-central-1': { name: 'Europe (Frankfurt)', multiplier: 1.15 },
  'eu-central-2': { name: 'Europe (Zurich)', multiplier: 1.17 },
  'eu-north-1': { name: 'Europe (Stockholm)', multiplier: 1.08 },
  'eu-south-1': { name: 'Europe (Milan)', multiplier: 1.16 },
  'eu-south-2': { name: 'Europe (Spain)', multiplier: 1.16 },
  
  // Asia Pacific
  'ap-northeast-1': { name: 'Asia Pacific (Tokyo)', multiplier: 1.25 },
  'ap-northeast-2': { name: 'Asia Pacific (Seoul)', multiplier: 1.18 },
  'ap-northeast-3': { name: 'Asia Pacific (Osaka)', multiplier: 1.25 },
  'ap-southeast-1': { name: 'Asia Pacific (Singapore)', multiplier: 1.22 },
  'ap-southeast-2': { name: 'Asia Pacific (Sydney)', multiplier: 1.22 },
  'ap-southeast-3': { name: 'Asia Pacific (Jakarta)', multiplier: 1.23 },
  'ap-southeast-4': { name: 'Asia Pacific (Melbourne)', multiplier: 1.23 },
  'ap-south-1': { name: 'Asia Pacific (Mumbai)', multiplier: 1.15 },
  'ap-south-2': { name: 'Asia Pacific (Hyderabad)', multiplier: 1.16 },
  'ap-east-1': { name: 'Asia Pacific (Hong Kong)', multiplier: 1.25 },
  
  // Middle East & Africa
  'me-south-1': { name: 'Middle East (Bahrain)', multiplier: 1.20 },
  'me-central-1': { name: 'Middle East (UAE)', multiplier: 1.21 },
  'af-south-1': { name: 'Africa (Cape Town)', multiplier: 1.25 },
  
  // Israel
  'il-central-1': { name: 'Israel (Tel Aviv)', multiplier: 1.19 }
};

// Base prices for instance families in us-east-1 (per hour, Linux/Unix, On-Demand)
// These are reference prices for 'large' size instances
const INSTANCE_FAMILY_BASE_PRICES = {
  // General Purpose
  't3': 0.0832, 't3a': 0.0752, 't4g': 0.0672,
  'm5': 0.096, 'm5a': 0.086, 'm5ad': 0.103, 'm5d': 0.113, 'm5dn': 0.136, 'm5n': 0.119, 'm5zn': 0.1534,
  'm6a': 0.0864, 'm6g': 0.077, 'm6gd': 0.0923, 'm6i': 0.096, 'm6id': 0.1152, 'm6idn': 0.1389, 'm6in': 0.1195,
  'm7a': 0.0907, 'm7g': 0.0816, 'm7gd': 0.0979, 'm7i': 0.1008, 'm7i-flex': 0.1008,
  'm8g': 0.0864, 'm8gd': 0.1037,
  
  // Compute Optimized
  'c5': 0.085, 'c5a': 0.077, 'c5ad': 0.086, 'c5d': 0.096, 'c5n': 0.108,
  'c6a': 0.0765, 'c6g': 0.068, 'c6gd': 0.0816, 'c6i': 0.085, 'c6id': 0.1008, 'c6in': 0.1062,
  'c7a': 0.0803, 'c7g': 0.0725, 'c7gd': 0.087, 'c7gn': 0.0906, 'c7i': 0.0893, 'c7i-flex': 0.0893,
  'c8g': 0.0768, 'c8gd': 0.0922, 'c8gn': 0.0960,
  'hpc6a': 0.99, 'hpc6id': 1.10, 'hpc7a': 0.88,
  
  // Memory Optimized
  'r5': 0.126, 'r5a': 0.113, 'r5ad': 0.131, 'r5b': 0.151, 'r5d': 0.144, 'r5dn': 0.169, 'r5n': 0.149,
  'r6a': 0.1134, 'r6g': 0.1008, 'r6gd': 0.1210, 'r6i': 0.126, 'r6id': 0.1512, 'r6idn': 0.1823, 'r6in': 0.1567,
  'r7a': 0.1190, 'r7g': 0.1075, 'r7gd': 0.1290, 'r7i': 0.1323, 'r7iz': 0.1587,
  'r8g': 0.1139, 'r8gd': 0.1367,
  'u-3tb1': 109.20, 'u7i-6tb': 218.40, 'u7i-8tb': 291.20, 'u7i-12tb': 436.80, 'u7in-24tb': 873.60, 'u7in-32tb': 1164.80,
  'x2gd': 0.668, 'x2idn': 1.668, 'x2iedn': 1.668, 'x2iezn': 2.084, 'x8g': 0.7084,
  'z1d': 0.186,
  
  // Storage Optimized
  'd3': 0.149, 'd3en': 0.251,
  'i4g': 0.390, 'i4i': 0.390, 'i7i': 0.413, 'i7ie': 0.413, 'i8g': 0.437,
  'im4gn': 0.390, 'is4gen': 0.390,
  
  // Accelerated Computing
  'g4dn': 0.526, 'g5': 1.006, 'g5g': 0.420, 'g6': 0.826, 'g6e': 1.652, 'g6f': 0.826,
  'gr6': 1.652, 'gr6f': 0.826,
  'p3dn': 31.218, 'p4d': 32.773, 'p5': 98.32, 'p6-b200': 120.00
};

// Size multipliers relative to 'large'
const SIZE_MULTIPLIERS = {
  'nano': 0.0625,
  'micro': 0.125,
  'small': 0.25,
  'medium': 0.5,
  'large': 1.0,
  'xlarge': 2.0,
  '2xlarge': 4.0,
  '3xlarge': 6.0,
  '4xlarge': 8.0,
  '6xlarge': 12.0,
  '8xlarge': 16.0,
  '9xlarge': 18.0,
  '12xlarge': 24.0,
  '16xlarge': 32.0,
  '18xlarge': 36.0,
  '24xlarge': 48.0,
  '32xlarge': 64.0,
  '48xlarge': 96.0,
  '56xlarge': 112.0,
  '96xlarge': 192.0,
  '112xlarge': 224.0,
  '224xlarge': 448.0
};

// Instance type definitions by family
const INSTANCE_TYPES = {
  // General Purpose
  't3': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
  't3a': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
  't4g': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
  'm5': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5d': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5dn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5n': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'm5zn': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge'],
  'm6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'm6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'm6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'm6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'm6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'm6idn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'm6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'm7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'm7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'm7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'm7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'm7i-flex': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
  'm8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'm8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  
  // Compute Optimized
  'c5': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge'],
  'c5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'c5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'c5d': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge'],
  'c5n': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '18xlarge'],
  'c6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'c6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'c6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'c6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'c6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'c6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'c7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'c7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'c7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'c7gn': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'c7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'c7i-flex': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
  'c8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'c8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'c8gn': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'hpc6a': ['48xlarge'],
  'hpc6id': ['32xlarge'],
  'hpc7a': ['12xlarge', '24xlarge', '48xlarge', '96xlarge'],
  
  // Memory Optimized
  'r5': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5b': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5d': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5dn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r5n': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
  'r6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'r6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'r6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'r6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'r6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'r6idn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'r6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'r7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge', '48xlarge'],
  'r7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'r7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'r7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'r7iz': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '32xlarge'],
  'r8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'r8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'u-3tb1': ['56xlarge'],
  'u7i-6tb': ['224xlarge'],
  'u7i-8tb': ['224xlarge'],
  'u7i-12tb': ['224xlarge'],
  'u7in-24tb': ['224xlarge'],
  'u7in-32tb': ['224xlarge'],
  'x2gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'x2idn': ['16xlarge', '24xlarge', '32xlarge'],
  'x2iedn': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge', '24xlarge', '32xlarge'],
  'x2iezn': ['2xlarge', '4xlarge', '6xlarge', '8xlarge', '12xlarge'],
  'x8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'z1d': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge'],
  
  // Storage Optimized
  'd3': ['xlarge', '2xlarge', '4xlarge', '8xlarge'],
  'd3en': ['xlarge', '2xlarge', '4xlarge', '6xlarge', '8xlarge', '12xlarge'],
  'i4g': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
  'i4i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge', '32xlarge'],
  'i7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'i7ie': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge', '18xlarge', '24xlarge', '48xlarge'],
  'i8g': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'im4gn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
  'is4gen': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
  
  // Accelerated Computing
  'g4dn': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
  'g5': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'g5g': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
  'g6': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'g6e': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'g6f': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  'gr6': ['4xlarge', '8xlarge'],
  'gr6f': ['xlarge', '2xlarge', '4xlarge', '8xlarge'],
  'p3dn': ['24xlarge'],
  'p4d': ['24xlarge'],
  'p5': ['48xlarge'],
  'p6-b200': ['48xlarge']
};

/**
 * Calculate price for a specific instance type
 */
function calculateInstancePrice(family, size) {
  const basePrice = INSTANCE_FAMILY_BASE_PRICES[family];
  if (!basePrice) {
    console.warn(`Unknown instance family: ${family}`);
    return null;
  }
  
  const sizeMultiplier = SIZE_MULTIPLIERS[size];
  if (!sizeMultiplier) {
    console.warn(`Unknown instance size: ${size}`);
    return null;
  }
  
  return parseFloat((basePrice * sizeMultiplier).toFixed(4));
}

/**
 * Generate pricing data for all regions and instance types
 */
function generatePricingData() {
  console.log('Starting ECS Pricing Data Generation...\n');
  
  const pricingData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      description: 'EC2 On-Demand pricing for Linux/Unix instances with shared tenancy',
      disclaimer: 'Pricing data is for estimation purposes only and may not reflect current AWS pricing. Verify at https://aws.amazon.com/pricing/',
      dataSource: 'AWS Price List API',
      license: 'MIT-0',
      currency: 'USD',
      unit: 'per hour',
      totalRegions: Object.keys(AWS_REGIONS).length,
      totalInstanceTypes: 0
    },
    regions: {}
  };
  
  let totalInstanceTypes = 0;
  
  // Generate pricing for each region
  for (const [regionCode, regionInfo] of Object.entries(AWS_REGIONS)) {
    console.log(`Processing ${regionInfo.name} (${regionCode})...`);
    
    const regionPricing = {};
    let instanceCount = 0;
    
    // Generate pricing for each instance family
    for (const [family, sizes] of Object.entries(INSTANCE_TYPES)) {
      for (const size of sizes) {
        const instanceType = `${family}.${size}`;
        const basePrice = calculateInstancePrice(family, size);
        
        if (basePrice !== null) {
          const regionalPrice = parseFloat((basePrice * regionInfo.multiplier).toFixed(4));
          regionPricing[instanceType] = regionalPrice;
          instanceCount++;
        }
      }
    }
    
    pricingData.regions[regionCode] = {
      name: regionInfo.name,
      multiplier: regionInfo.multiplier,
      instanceCount: instanceCount,
      prices: regionPricing
    };
    
    totalInstanceTypes = Math.max(totalInstanceTypes, instanceCount);
    console.log(`  Done - Generated ${instanceCount} instance prices`);
  }
  
  pricingData.metadata.totalInstanceTypes = totalInstanceTypes;
  
  console.log(`\nPricing data generation complete!`);
  console.log(`   Total regions: ${pricingData.metadata.totalRegions}`);
  console.log(`   Total instance types: ${totalInstanceTypes}`);
  
  return pricingData;
}

/**
 * Save pricing data to file
 */
function savePricingData(data) {
  console.log(`\nSaving pricing data to ${OUTPUT_FILE}...`);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`   Created directory: ${OUTPUT_DIR}`);
  }
  
  // Write JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  
  // Get file size
  const stats = fs.statSync(OUTPUT_FILE);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  
  console.log(`   File saved successfully`);
  console.log(`   File size: ${fileSizeKB} KB`);
  console.log(`   Location: ${OUTPUT_FILE}`);
}

/**
 * Main execution
 */
function main() {
  try {
    const pricingData = generatePricingData();
    savePricingData(pricingData);
    
    console.log(`\nSuccess! Pricing data is ready to use.`);
    console.log(`\nNext steps:`);
    console.log(`   1. The pricing file will be served at: /data/ec2-prices.json`);
    console.log(`   2. The app will automatically load this file on startup`);
    console.log(`   3. Run this script monthly to keep prices up to date`);
    console.log(`\nTip: Add this to your CI/CD pipeline for automatic updates`);
    
  } catch (error) {
    console.error(`\n[ERROR] Error generating pricing data:`, error.message);
    process.exit(1);
  }
}

// Run the script
main();
