import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  FormField,
  Input,
  Button,
  SpaceBetween,
  Grid,
  Box,
  TextContent,
  Alert
} from '@cloudscape-design/components';
import { defaultAssumptions } from '../data/assumptions';

function Assumptions({ assumptions, onUpdateAssumptions }) {
  const mgmtModel = assumptions.managementTimeModel;

  const [formData, setFormData] = useState({
    platformEngineerSalary: assumptions.platformEngineerSalary,
    workingHoursPerYear: assumptions.workingHoursPerYear,
    // Fleet-based management model
    standardEC2BaseHours: mgmtModel.standardEC2.baseHoursPerMonth,
    ecsManagedBaseHours: mgmtModel.ecsManaged.baseHoursPerMonth,
    ecsManagementFeePercentage: assumptions.ecsManagementFeePercentage * 100,
    // Bin-packing utilization
    currentUtilization: (assumptions.binPacking?.currentUtilization || 0.60) * 100,
    managedUtilization: (assumptions.binPacking?.managedUtilization || 0.90) * 100
  });

  const [hourlyRate, setHourlyRate] = useState(
    assumptions.platformEngineerSalary / assumptions.workingHoursPerYear
  );

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Calculate hourly rate whenever salary or working hours change
    const calculatedRate = formData.platformEngineerSalary / formData.workingHoursPerYear;
    setHourlyRate(calculatedRate);
  }, [formData.platformEngineerSalary, formData.workingHoursPerYear]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedAssumptions = {
      ...assumptions,
      platformEngineerSalary: formData.platformEngineerSalary,
      workingHoursPerYear: formData.workingHoursPerYear,
      platformEngineerHourlyRate: hourlyRate,
      managementTimeModel: {
        standardEC2: {
          ...mgmtModel.standardEC2,
          baseHoursPerMonth: formData.standardEC2BaseHours
        },
        ecsManaged: {
          ...mgmtModel.ecsManaged,
          baseHoursPerMonth: formData.ecsManagedBaseHours
        }
      },
      ecsManagementFeePercentage: formData.ecsManagementFeePercentage / 100,
      binPacking: {
        currentUtilization: formData.currentUtilization / 100,
        managedUtilization: formData.managedUtilization / 100,
        description: assumptions.binPacking?.description || 'ECS Managed Instances bin-pack tasks more efficiently, allowing fewer instances to handle the same workload.'
      }
    };

    onUpdateAssumptions(updatedAssumptions);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    const defaultModel = defaultAssumptions.managementTimeModel;
    setFormData({
      platformEngineerSalary: 150000,
      workingHoursPerYear: 2080,
      standardEC2BaseHours: defaultModel.standardEC2.baseHoursPerMonth,
      ecsManagedBaseHours: defaultModel.ecsManaged.baseHoursPerMonth,
      ecsManagementFeePercentage: 12,
      currentUtilization: 60,
      managedUtilization: 90
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <SpaceBetween size="l">
        {showSuccess && (
          <Alert
            type="success"
            dismissible
            onDismiss={() => setShowSuccess(false)}
          >
            Assumptions updated successfully! Recalculate costs to see the updated values.
          </Alert>
        )}

        <Container
          header={<Header variant="h2">Platform Engineering Costs</Header>}
        >
          <SpaceBetween size="l">
            <Grid
              gridDefinition={[
                { colspan: { default: 12, xxs: 6 } },
                { colspan: { default: 12, xxs: 6 } }
              ]}
            >
              <FormField label="Platform Engineer Annual Salary ($)">
                <Input
                  type="number"
                  value={formData.platformEngineerSalary.toString()}
                  onChange={({ detail }) =>
                    handleInputChange('platformEngineerSalary', parseFloat(detail.value) || 0)
                  }
                  min={0}
                />
              </FormField>

              <FormField label="Working Hours per Year">
                <Input
                  type="number"
                  value={formData.workingHoursPerYear.toString()}
                  onChange={({ detail }) =>
                    handleInputChange('workingHoursPerYear', parseFloat(detail.value) || 1)
                  }
                  min={1}
                />
              </FormField>
            </Grid>

            <Grid
              gridDefinition={[
                { colspan: { default: 12, xxs: 6 } }
              ]}
            >
              <FormField label="Calculated Hourly Rate">
                <Box padding="m" variant="code">
                  ${hourlyRate.toFixed(2)}
                </Box>
              </FormField>
            </Grid>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header 
              variant="h2"
              description="Fleet-based model: Fixed monthly overhead for ASG/Capacity Provider management"
            >
              Infrastructure Management
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Header variant="h3">Standard Amazon EC2 with Auto Scaling Group</Header>
            <FormField 
              label="Management Hours per Month"
              description="Fixed overhead: ASG config, AMI management, patching, monitoring, scaling policies"
            >
              <Input
                type="number"
                step="1"
                value={formData.standardEC2BaseHours.toString()}
                onChange={({ detail }) =>
                  handleInputChange('standardEC2BaseHours', parseFloat(detail.value) || 0)
                }
                min={0}
              />
            </FormField>

            {mgmtModel.standardEC2.breakdown && (
              <Box variant="awsui-key-label">
                <TextContent>
                  <small>Breakdown: ASG config ({mgmtModel.standardEC2.breakdown.asgConfiguration}h) + 
                  Launch templates ({mgmtModel.standardEC2.breakdown.launchTemplateManagement}h) + 
                  AMI management ({mgmtModel.standardEC2.breakdown.amiManagement}h) + 
                  Scaling policies ({mgmtModel.standardEC2.breakdown.scalingPolicyOptimization}h) + 
                  Patching ({mgmtModel.standardEC2.breakdown.securityPatching}h)</small>
                </TextContent>
              </Box>
            )}

            <Header variant="h3">Amazon ECS Managed Instances with Capacity Provider</Header>
            <FormField 
              label="Management Hours per Month"
              description="Fixed overhead: capacity provider monitoring, capacity planning"
            >
              <Input
                type="number"
                step="1"
                value={formData.ecsManagedBaseHours.toString()}
                onChange={({ detail }) =>
                  handleInputChange('ecsManagedBaseHours', parseFloat(detail.value) || 0)
                }
                min={0}
              />
            </FormField>

            {mgmtModel.ecsManaged.breakdown && (
              <Box variant="awsui-key-label">
                <TextContent>
                  <small>Breakdown: Capacity provider config ({mgmtModel.ecsManaged.breakdown.capacityProviderConfiguration}h) + 
                  Capacity planning ({mgmtModel.ecsManaged.breakdown.capacityPlanning}h)</small>
                </TextContent>
              </Box>
            )}

            <FormField 
              label="Amazon ECS Managed Instances Fee (%)"
              description="Default percentage of Amazon EC2 hourly cost (can be overridden per instance in Calculator)"
            >
              <Input
                type="number"
                step="0.1"
                value={formData.ecsManagementFeePercentage.toString()}
                onChange={({ detail }) =>
                  handleInputChange('ecsManagementFeePercentage', parseFloat(detail.value) || 0)
                }
                min={0}
                max={100}
              />
            </FormField>

            <Header variant="h3">Bin-Packing / Instance Utilization</Header>
            <Box variant="awsui-key-label">
              <TextContent>
                <small>Amazon ECS Managed Instances bin-pack tasks more efficiently, allowing fewer instances to handle the same workload. 
                The optimized instance count is calculated as: ceil(currentCount × currentUtilization / managedUtilization)</small>
              </TextContent>
            </Box>
            <Grid
              gridDefinition={[
                { colspan: { default: 12, xxs: 6 } },
                { colspan: { default: 12, xxs: 6 } }
              ]}
            >
              <FormField 
                label="Current Amazon EC2 Utilization (%)"
                description="Average utilization of your existing Amazon EC2 instances"
              >
                <Input
                  type="number"
                  step="1"
                  value={formData.currentUtilization.toString()}
                  onChange={({ detail }) =>
                    handleInputChange('currentUtilization', parseFloat(detail.value) || 0)
                  }
                  min={1}
                  max={100}
                />
              </FormField>

              <FormField 
                label="Amazon ECS Managed Instances Target Utilization (%)"
                description="Expected utilization with Amazon ECS Managed Instances bin-packing"
              >
                <Input
                  type="number"
                  step="1"
                  value={formData.managedUtilization.toString()}
                  onChange={({ detail }) =>
                    handleInputChange('managedUtilization', parseFloat(detail.value) || 0)
                  }
                  min={1}
                  max={100}
                />
              </FormField>
            </Grid>
          </SpaceBetween>
        </Container>

        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="primary"
            formAction="submit"
          >
            Update Assumptions
          </Button>
          <Button
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </form>
  );
}

export default Assumptions;
