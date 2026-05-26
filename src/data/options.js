// AWS Regions available in the calculator
export const regions = [
  { label: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
  { label: 'US East (Ohio) - us-east-2', value: 'us-east-2' },
  { label: 'US West (N. California) - us-west-1', value: 'us-west-1' },
  { label: 'US West (Oregon) - us-west-2', value: 'us-west-2' },
  { label: 'Canada (Central) - ca-central-1', value: 'ca-central-1' },
  { label: 'South America (Sao Paulo) - sa-east-1', value: 'sa-east-1' },
  { label: 'Europe (Ireland) - eu-west-1', value: 'eu-west-1' },
  { label: 'Europe (London) - eu-west-2', value: 'eu-west-2' },
  { label: 'Europe (Paris) - eu-west-3', value: 'eu-west-3' },
  { label: 'Europe (Frankfurt) - eu-central-1', value: 'eu-central-1' },
  { label: 'Europe (Zurich) - eu-central-2', value: 'eu-central-2' },
  { label: 'Europe (Stockholm) - eu-north-1', value: 'eu-north-1' },
  { label: 'Europe (Milan) - eu-south-1', value: 'eu-south-1' },
  { label: 'Europe (Spain) - eu-south-2', value: 'eu-south-2' },
  { label: 'Asia Pacific (Tokyo) - ap-northeast-1', value: 'ap-northeast-1' },
  { label: 'Asia Pacific (Seoul) - ap-northeast-2', value: 'ap-northeast-2' },
  { label: 'Asia Pacific (Osaka) - ap-northeast-3', value: 'ap-northeast-3' },
  { label: 'Asia Pacific (Singapore) - ap-southeast-1', value: 'ap-southeast-1' },
  { label: 'Asia Pacific (Sydney) - ap-southeast-2', value: 'ap-southeast-2' },
  { label: 'Asia Pacific (Jakarta) - ap-southeast-3', value: 'ap-southeast-3' },
  { label: 'Asia Pacific (Melbourne) - ap-southeast-4', value: 'ap-southeast-4' },
  { label: 'Asia Pacific (Mumbai) - ap-south-1', value: 'ap-south-1' },
  { label: 'Asia Pacific (Hyderabad) - ap-south-2', value: 'ap-south-2' },
  { label: 'Asia Pacific (Hong Kong) - ap-east-1', value: 'ap-east-1' },
  { label: 'Middle East (Bahrain) - me-south-1', value: 'me-south-1' },
  { label: 'Middle East (UAE) - me-central-1', value: 'me-central-1' },
  { label: 'Africa (Cape Town) - af-south-1', value: 'af-south-1' },
  { label: 'Israel (Tel Aviv) - il-central-1', value: 'il-central-1' }
];


// EC2 Instance Types grouped by category
// Based on: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/managed-instances-instance-types.html
const instanceFamilies = {
  'General Purpose': {
    // t3, t3a, t4g: Burstable performance instances (excluding nano and micro instance sizes)
    't3': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
    't3a': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
    't4g': ['small', 'medium', 'large', 'xlarge', '2xlarge'],
    // m5, m5a, m5ad, m5d, m5dn, m5n, m5zn
    'm5': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5d': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5dn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5n': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'm5zn': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge'],
    // m6a, m6g, m6gd, m6i, m6id, m6idn, m6in
    'm6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'm6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'm6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'm6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'm6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'm6idn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'm6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    // m7a, m7g, m7gd, m7i, m7i-flex
    'm7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'm7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'm7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'm7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'm7i-flex': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
    // m8g, m8gd
    'm8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'm8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
  },
  'Compute Optimized': {
    // c5, c5a, c5ad, c5d, c5n
    'c5': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge'],
    'c5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'c5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'c5d': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '12xlarge', '18xlarge', '24xlarge'],
    'c5n': ['large', 'xlarge', '2xlarge', '4xlarge', '9xlarge', '18xlarge'],
    // c6a, c6g, c6gd, c6i, c6id, c6in
    'c6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'c6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'c6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'c6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'c6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'c6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    // c7a, c7g, c7gd, c7gn, c7i, c7i-flex
    'c7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'c7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'c7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'c7gn': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'c7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'c7i-flex': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
    // c8g, c8gd, c8gn
    'c8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'c8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'c8gn': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    // hpc6a, hpc6id, hpc7a
    'hpc6a': ['48xlarge'],
    'hpc6id': ['32xlarge'],
    'hpc7a': ['12xlarge', '24xlarge', '48xlarge', '96xlarge'],
  },
  'Memory Optimized': {
    // r5, r5a, r5ad, r5b, r5d, r5dn, r5n
    'r5': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5ad': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5b': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5d': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5dn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    'r5n': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    // r6a, r6g, r6gd, r6i, r6id, r6idn, r6in
    'r6a': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'r6g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'r6gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'r6i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'r6id': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'r6idn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'r6in': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    // r7a, r7g, r7gd, r7i, r7iz
    'r7a': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'r7g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'r7gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'r7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'r7iz': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '32xlarge'],
    // r8g, r8gd
    'r8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'r8gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    // u (High Memory) instances
    'u-3tb1': ['56xlarge'],
    'u7i-6tb': ['metal'],
    'u7i-8tb': ['metal'],
    'u7i-12tb': ['metal'],
    'u7in-24tb': ['metal'],
    'u7in-32tb': ['metal'],
    // x2gd, x2idn, x2iedn, x2iezn
    'x2gd': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    'x2idn': ['16xlarge', '24xlarge', '32xlarge'],
    'x2iedn': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge', '24xlarge', '32xlarge'],
    'x2iezn': ['2xlarge', '4xlarge', '6xlarge', '8xlarge', '12xlarge'],
    // x8g
    'x8g': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    // z1d
    'z1d': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge'],
  },
  'Storage Optimized': {
    // d3, d3en
    'd3': ['xlarge', '2xlarge', '4xlarge', '8xlarge'],
    'd3en': ['xlarge', '2xlarge', '4xlarge', '6xlarge', '8xlarge', '12xlarge'],
    // i4g, i4i
    'i4g': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
    'i4i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '32xlarge'],
    // i7i, i7ie, i8g
    'i7i': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'i7ie': ['large', 'xlarge', '2xlarge', '3xlarge', '6xlarge', '12xlarge', '18xlarge', '24xlarge', '48xlarge'],
    'i8g': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge'],
    // im4gn, is4gen
    'im4gn': ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
    'is4gen': ['medium', 'large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
  },
  'Accelerated Computing': {
    // g4dn
    'g4dn': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge'],
    // g5, g5g
    'g5': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'g5g': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '16xlarge'],
    // g6, g6e, g6f
    'g6': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'g6e': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    'g6f': ['xlarge', '2xlarge', '4xlarge', '8xlarge', '12xlarge', '16xlarge', '24xlarge', '48xlarge'],
    // gr6, gr6f
    'gr6': ['4xlarge', '8xlarge'],
    'gr6f': ['4xlarge', '8xlarge'],
    // p3dn, p4d, p5
    'p3dn': ['24xlarge'],
    'p4d': ['24xlarge'],
    'p5': ['48xlarge'],
    // p6-b200
    'p6-b200': ['48xlarge'],
  }
};

// Generate flat instance type options from families, grouped by category
export const instanceTypes = Object.entries(instanceFamilies).flatMap(
  ([category, families]) =>
    Object.entries(families).flatMap(([family, sizes]) =>
      sizes.map(size => ({
        label: `${family}.${size}`,
        value: `${family}.${size}`,
        filteringTags: [category, family],
        description: category
      }))
    )
);
