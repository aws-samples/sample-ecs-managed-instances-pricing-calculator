// Default assumptions for the ECS Managed Instances calculator
export const defaultAssumptions = {
  // Staffing costs
  platformEngineerSalary: 150000, // Annual salary in USD
  platformEngineerHourlyRate: 72.12, // Hourly rate based on salary / working hours
  workingHoursPerYear: 2080, // 40 hours/week * 52 weeks

  // ECS Management fee
  ecsManagementFeePercentage: 0.12, // 12% of on-demand EC2 cost

  // Bin-packing / utilization assumptions
  binPacking: {
    currentUtilization: 0.60, // 60% average utilization on standard EC2
    managedUtilization: 0.90, // 90% target utilization with ECS Managed Instances
    description: 'ECS Managed Instances bin-pack tasks more efficiently, allowing fewer instances to handle the same workload.'
  },

  // Cluster/Fleet-based management time model (fixed monthly overhead)
  managementTimeModel: {
    standardEC2: {
      baseHoursPerMonth: 12, // Fixed overhead for ASG, AMI, patching, scaling policies
      breakdown: {
        asgConfiguration: 2, // ASG setup, tuning, and maintenance
        launchTemplateManagement: 2, // Launch template updates and versioning
        amiManagement: 3, // Custom AMI creation, testing, and updates
        scalingPolicyOptimization: 1, // Scaling policy tuning and testing
        securityPatching: 4 // Patching coordination, testing, rollout
      },
      description: 'Includes ASG management, custom AMI maintenance, patching coordination, and scaling policy tuning.'
    },
    ecsManaged: {
      baseHoursPerMonth: 2, // Minimal overhead for capacity provider monitoring
      breakdown: {
        capacityProviderConfiguration: 1, // Initial setup and occasional tuning
        capacityPlanning: 1 // Minimal capacity planning reviews
      },
      description: 'Includes capacity provider monitoring. Most operations (patching, scaling, AMI management) are automated by AWS.'
    }
  }
};
