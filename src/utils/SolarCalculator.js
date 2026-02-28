/**
 * SolarCalculator.js
 * Auditoría de Eficiencia v2.0 - Sincronizado por @Facturas
 */
export const calculateSolarImpact = (area, priceKWhInput = 0.1434, radiation = 4.75) => {
    // Parámetros técnicos auditados
    const marketPrice = 0.1434; // Precio PVPC/Mercado actual (referencia)
    const priceKWh = parseFloat(priceKWhInput) || marketPrice;

    const panelWattage = 0.450; // 450W
    const panelArea = 2.1;
    const performanceRatio = 0.75; // Reducción de eficiencia real (calor, suciedad, inversores)

    // Deteción de Anomalías (@Facturas - Chief Billing Auditor)
    // "Identify Spending Anomalies if the client's price is more than 15% higher than the market price"
    const priceAnomaly = priceKWh > (marketPrice * 1.15);

    // 1. Capacidad Técnica (@Geo-Architect)
    const numPanels = Math.floor(area / panelArea);
    const totalKWp = numPanels * panelWattage;

    // 2. Producción Anual Real (kWh/año)
    const annualProduction = totalKWp * radiation * 365 * performanceRatio;

    // 3. Modelo de Consumo Residencial Medio en España
    const baseConsumo = 3500;
    const estimatedConsumption = baseConsumo + (area * 15);

    // 4. Auditoría de Ahorro (@Facturas)
    const optimizedPrice = marketPrice * 0.88; // Apuntamos a un precio óptimo un 12% por debajo del mercado
    const surplusPrice = 0.06;

    // Autoconsumo: Tasa de uso directo
    const selfConsumptionRate = 0.40;
    const consumedFromSolar = Math.min(annualProduction * selfConsumptionRate, estimatedConsumption);
    const surplusExported = Math.max(0, annualProduction - consumedFromSolar);

    // Cálculo de Gastos
    const currentAnnualCost = estimatedConsumption * priceKWh;

    // Ahorro directo
    const directSavings = consumedFromSolar * priceKWh;
    // Ahorro por excedentes
    const surplusSavings = surplusExported * surplusPrice;
    // Ahorro por tarifa
    const remainingEnergyToBuy = Math.max(0, estimatedConsumption - consumedFromSolar);
    const tariffOptimizationSavings = remainingEnergyToBuy * (priceKWh - optimizedPrice);

    const totalAnnualSavings = directSavings + surplusSavings + tariffOptimizationSavings;
    const finalCost = Math.max(0, currentAnnualCost - totalAnnualSavings);

    return {
        area,
        numPanels,
        systemPeakKW: totalKWp.toFixed(2),
        annualEnergyProduction: Math.round(annualProduction),
        estimatedConsumption: Math.round(estimatedConsumption),
        annualSavings: Math.round(totalAnnualSavings),
        priceAnomaly,
        currentPrice: priceKWh,
        marketPrice,
        chartData: [
            { name: 'Gasto Inicial', value: Math.round(currentAnnualCost), color: '#ffffff20' },
            { name: 'Optimización Factura', value: Math.round(currentAnnualCost - (estimatedConsumption * (priceKWh - optimizedPrice))), color: '#33ccff80' },
            { name: 'Ecosistema Solar', value: Math.round(finalCost), color: '#00f2ff' }
        ]
    };
};
