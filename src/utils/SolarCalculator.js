/**
 * SolarCalculator.js
 * Auditoría de Eficiencia v2.0 - Sincronizado por @Facturas
 */
export const calculateSolarImpact = (area, priceKWh = 0.1434, radiation = 4.75) => {
    // Parámetros técnicos auditados
    const panelWattage = 0.450; // 450W
    const panelArea = 2.1;
    const performanceRatio = 0.75; // Reducción de eficiencia real (calor, suciedad, inversores)

    // 1. Capacidad Técnica (@Geo-Architect)
    const numPanels = Math.floor(area / panelArea);
    const totalKWp = numPanels * panelWattage;

    // 2. Producción Anual Real (kWh/año)
    const annualProduction = totalKWp * radiation * 365 * performanceRatio;

    // 3. Modelo de Consumo Residencial Medio en España
    // Según REE, consumo medio ~3.500 kWh/año. Escalamiento por área de tejado.
    const baseConsumo = 3500;
    const estimatedConsumption = baseConsumo + (area * 15);

    // 4. Auditoría de Ahorro (@Facturas)
    // El ahorro del 15% en tarifa es razonable, pero el autoconsumo es complejo.
    const optimizedPrice = priceKWh * 0.88; // Ahorro proyectado tarifa mercado libre (12%)
    const surplusPrice = 0.06; // Precio medio compensación excedentes en España

    // Autoconsumo: Tasa de uso directo de la energía solar generada sin baterías (~40%)
    const selfConsumptionRate = 0.40;
    const consumedFromSolar = Math.min(annualProduction * selfConsumptionRate, estimatedConsumption);
    const surplusExported = Math.max(0, annualProduction - consumedFromSolar);

    // Cálculo de Gastos
    const currentAnnualCost = estimatedConsumption * priceKWh;

    // Ahorro directo (Lo que dejas de comprar)
    const directSavings = consumedFromSolar * priceKWh;
    // Ahorro por excedentes (Lo que te abonan)
    const surplusSavings = surplusExported * surplusPrice;
    // Ahorro por tarifa (Mejora del precio en la energía restante comprada)
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
        chartData: [
            { name: 'Gasto Inicial', value: Math.round(currentAnnualCost), color: '#ffffff20' },
            { name: 'Optimización Factura', value: Math.round(currentAnnualCost - (estimatedConsumption * (priceKWh - optimizedPrice))), color: '#33ccff80' },
            { name: 'Ecosistema Solar', value: Math.round(finalCost), color: '#00f2ff' }
        ]
    };
};
