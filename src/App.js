import React, { useState } from 'react';
import { AppLayout, Container, Header, SpaceBetween, ExpandableSection, Select, FormField, Input, Grid, Alert } from '@cloudscape-design/components';
import Calculator from './components/Calculator';
import Results from './components/Results';
import Assumptions from './components/Assumptions';
import { getEC2Price } from './services/pricingService';
import { defaultAssumptions } from './data/assumptions';
import { currencies, defaultCurrency, getCurrency } from './data/currencies';

function App() {
  const [results, setResults] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [isAssumptionsExpanded, setIsAssumptionsExpanded] = useState(false);
  const [assumptions, setAssumptions] = useState({ ...defaultAssumptions });
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState(getCurrency(defaultCurrency).rate);

  const updateAssumptions = (newAssumptions) => {
    setAssumptions(newAssumptions);
  };

  const handleCurrencyChange = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    const currency = getCurrency(currencyCode);
    setExchangeRate(currency.rate);
  };

  const handleExchangeRateChange = (newRate) => {
    setExchangeRate(newRate);
  };

  const calculateCosts = async (formData) => {
    try {
      setCalculationError(null);
      const { region, hoursPerMonth, instanceGroups } = formData;

      // Input validation
      if (!region || typeof region !== 'string') {
        throw new Error('Please select a valid AWS region.');
      }
      if (!hoursPerMonth || hoursPerMonth < 1 || hoursPerMonth > 744) {
        throw new Error('Hours per month must be between 1 and 744.');
      }
      if (!Array.isArray(instanceGroups) || instanceGroups.length === 0) {
        throw new Error('Please add at least one instance group.');
      }

      // Calculate total number of instances
      const totalInstances = instanceGroups.reduce((sum, group) => sum + group.instanceCount, 0);
    
    // Bin-packing: calculate optimized instance counts for ECS Managed
    const currentUtil = assumptions.binPacking?.currentUtilization || 0.60;
    const managedUtil = assumptions.binPacking?.managedUtilization || 0.90;
    
    // Calculate costs for each instance group
    const instanceBreakdown = await Promise.all(
      instanceGroups.map(async group => {
        const { instanceType, instanceCount, ecsManagementFeePerHour } = group;
        const instanceHourlyCost = await getEC2Price(region, instanceType);
        
        // Standard EC2: original instance count
        const ec2Cost = instanceCount * instanceHourlyCost * hoursPerMonth;
        
        // ECS Managed: optimized (bin-packed) instance count
        const optimizedCount = Math.ceil(instanceCount * currentUtil / managedUtil);
        const optimizedEC2Cost = optimizedCount * instanceHourlyCost * hoursPerMonth;
        
        // Use the ecs management fee if available, otherwise calculate using assumptions percentage
        const managementFee = ecsManagementFeePerHour !== null 
          ? ecsManagementFeePerHour 
          : instanceHourlyCost * assumptions.ecsManagementFeePercentage;
        
        // ECS fee applies only to the optimized (fewer) instances
        const ecsManagedInstancesFee = optimizedCount * managementFee * hoursPerMonth;
        
        return {
          instanceType,
          count: instanceCount,
          optimizedCount,
          ec2Cost,
          optimizedEC2Cost,
          ecsManagedInstancesFee,
          ecsManagementFeePerHour: managementFee,
          totalCost: ec2Cost + ecsManagedInstancesFee
        };
      })
    );
    
    // Calculate totals
    const totalEC2Cost = instanceBreakdown.reduce((sum, item) => sum + item.ec2Cost, 0);
    const totalOptimizedEC2Cost = instanceBreakdown.reduce((sum, item) => sum + item.optimizedEC2Cost, 0);
    const totalECSManagedFee = instanceBreakdown.reduce((sum, item) => sum + item.ecsManagedInstancesFee, 0);
    const totalOptimizedInstances = instanceBreakdown.reduce((sum, item) => sum + item.optimizedCount, 0);
    
    // Calculate staffing costs using cluster/fleet-based model (fixed base hours)
    const mgmtModel = assumptions.managementTimeModel;
    const standardEC2StaffingHours = mgmtModel.standardEC2.baseHoursPerMonth;
    const ecsManagedStaffingHours = mgmtModel.ecsManaged.baseHoursPerMonth;
    
    const standardEC2StaffingCost = standardEC2StaffingHours * assumptions.platformEngineerHourlyRate;
    const ecsManagedStaffingCost = ecsManagedStaffingHours * assumptions.platformEngineerHourlyRate;
    
    // Calculate total costs for comparison
    // Standard EC2: original instance count EC2 cost + staffing
    const standardEC2TotalCost = totalEC2Cost + standardEC2StaffingCost;
    // ECS Managed: optimized (fewer) instances EC2 cost + ECS fee + staffing
    const ecsManagedTotalCost = totalOptimizedEC2Cost + totalECSManagedFee + ecsManagedStaffingCost;
    
    // Calculate savings
    const savings = standardEC2TotalCost - ecsManagedTotalCost;
    const savingsPercentage = standardEC2TotalCost > 0 ? (savings / standardEC2TotalCost) * 100 : 0;
    
    setResults({
      region,
      instanceBreakdown,
      totalEC2Cost,
      totalOptimizedEC2Cost,
      totalECSManagedFee,
      totalInstances,
      totalOptimizedInstances,
      binPacking: {
        currentUtilization: currentUtil,
        managedUtilization: managedUtil,
        instancesSaved: totalInstances - totalOptimizedInstances,
        ec2Savings: totalEC2Cost - totalOptimizedEC2Cost
      },
      standardEC2StaffingHours,
      ecsManagedStaffingHours,
      standardEC2StaffingCost,
      ecsManagedStaffingCost,
      standardEC2TotalCost,
      ecsManagedTotalCost,
      savings,
      savingsPercentage,
      managementTimeModel: mgmtModel
    });
    
    // Expand results section when new results are calculated
    setIsResultsExpanded(true);
    } catch (error) {
      console.error('Cost calculation failed:', error);
      setCalculationError(error.message || 'An unexpected error occurred during calculation.');
      setResults(null);
  }
  };

  return (
    <AppLayout
      navigationHide
      toolsHide
      content={
        <Container>
          <SpaceBetween size="l">
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Header
                variant="h1"
                description="Calculate the Total Cost of Ownership (TCO) for Amazon Elastic Container Service (Amazon ECS) Managed Instances"
              >
                Amazon ECS Managed Instances Cost Calculator
              </Header>
            </SpaceBetween>
            
            <Container>
              <SpaceBetween size="m">
                <Header variant="h3">Currency Settings</Header>
                
                <Alert type="info" header="Exchange Rate Information">
                  Exchange rates are approximate and may not reflect current market rates. 
                  Please verify the current exchange rate from reliable sources and update the rate below for accurate cost estimates.
                </Alert>
                
                <Grid
                  gridDefinition={[
                    { colspan: { default: 12, xxs: 6 } },
                    { colspan: { default: 12, xxs: 6 } }
                  ]}
                >
                  <FormField label="Preferred Currency">
                    <Select
                      selectedOption={currencies.find(c => c.value === selectedCurrency)}
                      onChange={({ detail }) => handleCurrencyChange(detail.selectedOption.value)}
                      options={currencies}
                      placeholder="Select currency"
                      ariaLabel="Currency selector"
                    />
                  </FormField>
                  
                  <FormField 
                    label="Exchange Rate (from USD)"
                    description={`1 USD = ${exchangeRate} ${selectedCurrency}`}
                  >
                    <Input
                      type="number"
                      step="0.0001"
                      value={exchangeRate.toString()}
                      onChange={({ detail }) => handleExchangeRateChange(parseFloat(detail.value) || 1)}
                      disabled={selectedCurrency === 'USD'}
                    />
                  </FormField>
                </Grid>
              </SpaceBetween>
            </Container>
            
            <SpaceBetween size="l">
              <Calculator onCalculate={calculateCosts} assumptions={assumptions} />
              
              <Container>
                <ExpandableSection
                  headerText="Assumptions"
                  variant="container"
                  expanded={isAssumptionsExpanded}
                  onChange={({ detail }) => setIsAssumptionsExpanded(detail.expanded)}
                >
                  <Assumptions 
                    assumptions={assumptions}
                    onUpdateAssumptions={updateAssumptions}
                  />
                </ExpandableSection>
              </Container>


              {calculationError && (
                <Alert type="error" header="Calculation Error" dismissible onDismiss={() => setCalculationError(null)}>
                  {calculationError}
                </Alert>
              )}
              
              {results && (
                <Container>
                  <ExpandableSection
                    headerText="Cost Analysis"
                    variant="container"
                    expanded={isResultsExpanded}
                    onChange={({ detail }) => setIsResultsExpanded(detail.expanded)}
                  >
                    <Results 
                      results={results} 
                      currency={selectedCurrency}
                      exchangeRate={exchangeRate}
                    />
                  </ExpandableSection>
                </Container>
              )}
            </SpaceBetween>
          </SpaceBetween>
        </Container>
      }
    />
  );
}

export default App;
