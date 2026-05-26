import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  FormField,
  Input,
  Select,
  Button,
  SpaceBetween,
  Grid,
  Box,
  Alert
} from '@cloudscape-design/components';
import { regions, instanceTypes } from '../data/options';
import { isInstanceAvailableInRegion, getEC2Price } from '../services/pricingService';

function Calculator({ onCalculate, assumptions }) {
  const [formData, setFormData] = useState({
    region: 'us-east-1',
    hoursPerMonth: 730,
    instanceGroups: [
      { instanceType: 'm5.large', instanceCount: 2, ecsManagementFeePerHour: null }
    ]
  });
  
  const [instancePrices, setInstancePrices] = useState({});
  const [showAvailabilityWarning, setShowAvailabilityWarning] = useState(false);
  const [pricesFetched, setPricesFetched] = useState(false);
  
  // Fetch EC2 prices when region or instance types change
  useEffect(() => {
    const fetchPrices = async () => {
      const region = formData.region;
      const newPrices = {};
      let needsFetch = false;
      
      for (const group of formData.instanceGroups) {
        const key = `${region}-${group.instanceType}`;
        if (!instancePrices[key]) {
          needsFetch = true;
          const ec2Price = await getEC2Price(region, group.instanceType);
          newPrices[key] = ec2Price;
        }
      }
      
      if (needsFetch && Object.keys(newPrices).length > 0) {
        setInstancePrices(prev => ({ ...prev, ...newPrices }));
      }
      setPricesFetched(true);
    };
    
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.region, formData.instanceGroups.map(g => g.instanceType).join(',')]);
  
  // Update ecs management fees when prices are available
  useEffect(() => {
    if (!pricesFetched) return;
    
    const updatedGroups = formData.instanceGroups.map(group => {
      const key = `${formData.region}-${group.instanceType}`;
      const ec2Price = instancePrices[key];
      
      // If price exists and fee is null, calculate it using assumptions
      if (ec2Price !== undefined && group.ecsManagementFeePerHour === null) {
        const feePercentage = assumptions?.ecsManagementFeePercentage || 0.12;
        return {
          ...group,
          ecsManagementFeePerHour: parseFloat((ec2Price * feePercentage).toFixed(5))
        };
      }
      return group;
    });
    
    // Check if any group was updated
    const hasChanges = updatedGroups.some((group, index) => 
      group.ecsManagementFeePerHour !== formData.instanceGroups[index].ecsManagementFeePerHour
    );
    
    if (hasChanges) {
      setFormData(prev => ({
        ...prev,
        instanceGroups: updatedGroups
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instancePrices, pricesFetched, formData.instanceGroups.map(g => `${g.instanceType}-${g.ecsManagementFeePerHour}`).join(',')]);
  
  // Check instance availability when region changes
  useEffect(() => {
    const checkInstanceAvailability = async () => {
      const region = formData.region;
      let hasUnavailableInstances = false;
      
      for (const group of formData.instanceGroups) {
        const isAvailable = await isInstanceAvailableInRegion(region, group.instanceType);
        
        if (!isAvailable) {
          hasUnavailableInstances = true;
        }
      }
      
      setShowAvailabilityWarning(hasUnavailableInstances);
    };
    
    checkInstanceAvailability();
  }, [formData.region, formData.instanceGroups]);

  const handleInputChange = (field, value) => {
    // If changing region, reset all management fees to null so they get recalculated
    if (field === 'region') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        instanceGroups: prev.instanceGroups.map(group => ({
          ...group,
          ecsManagementFeePerHour: null
        }))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInstanceGroupChange = (index, field, value) => {
    const updatedGroups = [...formData.instanceGroups];
    
    // If changing instance type, reset the management fee to null so it gets recalculated
    if (field === 'instanceType') {
      updatedGroups[index] = {
        ...updatedGroups[index],
        [field]: value,
        ecsManagementFeePerHour: null
      };
    } else {
      updatedGroups[index] = {
        ...updatedGroups[index],
        [field]: value
      };
    }
    
    setFormData(prev => ({
      ...prev,
      instanceGroups: updatedGroups
    }));
  };

  const addInstanceGroup = () => {
    setFormData(prev => ({
      ...prev,
      instanceGroups: [
        ...prev.instanceGroups,
        { instanceType: 't3.medium', instanceCount: 1, ecsManagementFeePerHour: null }
      ]
    }));
  };

  const removeInstanceGroup = (index) => {
    if (formData.instanceGroups.length > 1) {
      const updatedGroups = [...formData.instanceGroups];
      updatedGroups.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        instanceGroups: updatedGroups
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default hoursPerMonth to 730 if left empty
    const submitData = {
      ...formData,
      hoursPerMonth: formData.hoursPerMonth === '' ? 730 : formData.hoursPerMonth
    };
    onCalculate(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container
        header={<Header variant="h2">Amazon ECS Managed Instances Configuration</Header>}
      >
        <SpaceBetween size="l">
          <Alert
            type="info"
            header="About Amazon ECS Managed Instances Fee"
          >
            The Amazon ECS Managed Instances Fee is automatically calculated as {((assumptions?.ecsManagementFeePercentage || 0.12) * 100).toFixed(0)}% of the Amazon EC2 hourly cost for each instance type. 
            You can adjust this value per instance or change the default percentage in the Assumptions section below.
          </Alert>

          {showAvailabilityWarning && (
            <Alert
              type="warning"
              header="Instance availability warning"
              dismissible
            >
              Some selected instance types may not be available in the chosen region. 
              If pricing data cannot be found, estimated prices will be used.
            </Alert>
          )}
          
          <Header variant="h3">Region & Usage Details</Header>
          
          <Grid
            gridDefinition={[
              { colspan: { default: 12, xxs: 6 } },
              { colspan: { default: 12, xxs: 6 } }
            ]}
          >
            <FormField label="AWS Region">
              <Select
                selectedOption={{ label: regions.find(r => r.value === formData.region).label, value: formData.region }}
                onChange={({ detail }) => handleInputChange('region', detail.selectedOption.value)}
                options={regions}
              />
            </FormField>
            
            <FormField 
              label="Workload Running Hours per Month"
              description="Number of hours per month your workload is running. Use 730 for 24/7, or lower for part-time workloads."
            >
              <Input
                type="number"
                value={formData.hoursPerMonth === '' ? '' : formData.hoursPerMonth.toString()}
                onChange={({ detail }) => handleInputChange('hoursPerMonth', detail.value === '' ? '' : parseInt(detail.value))}
                min={1}
                max={744}
              />
            </FormField>
          </Grid>

          <Header 
            variant="h3"
            description="This is the number of current Amazon EC2 instances supporting your Amazon ECS workload"
          >
            Amazon EC2 Instance Details
          </Header>
          
          {formData.instanceGroups.map((group, index) => (
            <Box
              key={index}
              padding="m"
              variant="code"
            >
              <SpaceBetween size="m">
                <Grid
                  gridDefinition={[
                    { colspan: { default: 12, xxs: 4 } },
                    { colspan: { default: 12, xxs: 4 } },
                    { colspan: { default: 12, xxs: 4 } }
                  ]}
                >
                  <FormField label="Instance Type">
                    <Select
                      selectedOption={{ 
                        label: group.instanceType, 
                        value: group.instanceType 
                      }}
                      onChange={({ detail }) => 
                        handleInstanceGroupChange(index, 'instanceType', detail.selectedOption.value)
                      }
                      options={instanceTypes}
                      filteringType="auto"
                      filteringPlaceholder="Search instance types"
                      filteringAriaLabel="Filter instance types"
                    />
                  </FormField>
                  
                  <FormField label="Instance Count">
                    <Input
                      type="number"
                      value={group.instanceCount.toString()}
                      onChange={({ detail }) => 
                        handleInstanceGroupChange(index, 'instanceCount', parseInt(detail.value) || 1)
                      }
                      min={1}
                    />
                  </FormField>

                  <FormField 
                    label="Amazon ECS Managed Instances Fee ($/hour)"
                  >
                    <Input
                      type="number"
                      step="0.00001"
                      value={group.ecsManagementFeePerHour !== null ? group.ecsManagementFeePerHour.toString() : ''}
                      onChange={({ detail }) => 
                        handleInstanceGroupChange(index, 'ecsManagementFeePerHour', parseFloat(detail.value) || 0)
                      }
                      min={0}
                      placeholder="Calculating..."
                    />
                  </FormField>
                </Grid>
                
                {formData.instanceGroups.length > 1 && (
                  <Button
                    variant="link"
                    onClick={() => removeInstanceGroup(index)}
                  >
                    Remove
                  </Button>
                )}
              </SpaceBetween>
            </Box>
          ))}
          
          <Button
            onClick={addInstanceGroup}
            variant="normal"
          >
            Add Another Instance Type
          </Button>
          
          <Button
            variant="primary"
            formAction="submit"
          >
            Calculate TCO
          </Button>
        </SpaceBetween>
      </Container>
    </form>
  );
}

export default Calculator;
