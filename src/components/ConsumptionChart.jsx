import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const ConsumptionChart = () => {
    const [filter, setFilter] = useState('1Y');

    // Mapeo detallado de datos por filtro temporal
    const datasets = {
        '1M': {
            categories: ['S1', 'S2', 'S3', 'S4'],
            data: [110, 95, 120, 105],
            label: '2026'
        },
        '6M': {
            categories: ['SEP', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB'],
            data: [320, 350, 410, 440, 450, 420],
            label: 'HISTÓRICO'
        },
        '1Y': {
            categories: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
            data: [450, 420, 390, 310, 280, 240, 410, 430, 320, 350, 410, 440],
            label: '2025-26'
        },
        'ALL': {
            categories: ['2023', '2024', '2025', '2026'],
            data: [5200, 4800, 4600, 1200],
            label: 'ANUAL'
        }
    };

    const currentDataset = datasets[filter];

    const chartData = {
        options: {
            chart: {
                id: 'consumption-history',
                toolbar: { show: false },
                background: 'transparent',
                sparkline: { enabled: false },
                fontFamily: 'Inter, sans-serif',
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            colors: ['#FF8C00'],
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.3,
                    opacityTo: 0,
                    stops: [0, 90, 100]
                }
            },
            grid: {
                show: true,
                borderColor: 'rgba(255, 255, 255, 0.05)',
                strokeDashArray: 5,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: false } },
            },
            xaxis: {
                categories: currentDataset.categories,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '9px',
                        fontWeight: 600
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '9px'
                    }
                }
            },
            tooltip: {
                theme: 'dark',
                x: { show: true },
                y: {
                    formatter: (val) => `${val} kWh`,
                    title: { formatter: () => 'Consumo:' }
                },
                marker: { show: true },
                style: { fontSize: '10px' },
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    const val = series[seriesIndex][dataPointIndex];
                    const cost = (val * 0.14).toFixed(2);
                    return `
                        <div class="px-4 py-3 bg-[#000810]/95 backdrop-blur-xl border border-white/10 rounded-xl">
                            <div class="text-[8px] text-white/30 uppercase tracking-widest mb-1 italic font-bold">Registro Energético</div>
                            <div class="flex justify-between items-center gap-6">
                                <span class="text-[10px] text-white font-black">${w.globals.labels[dataPointIndex]} ${currentDataset.label}</span>
                                <span class="text-[12px] text-[#FF8C00] font-black">${val} kWh</span>
                            </div>
                            <div class="h-[1px] bg-white/5 my-2"></div>
                            <div class="flex justify-between items-center">
                                <span class="text-[9px] text-white/40 font-medium tracking-tight">Coste proyectado</span>
                                <span class="text-[11px] text-white font-black">${cost} €</span>
                            </div>
                        </div>
                    `;
                }
            },
            dataLabels: { enabled: false },
            markers: {
                size: 0,
                hover: {
                    size: 6,
                    colors: ['#FF8C00'],
                    strokeColors: '#fff',
                    strokeWidth: 2,
                }
            },
        },
        series: [{
            name: 'Consumo Histórico',
            data: currentDataset.data
        }]
    };

    return (
        <div className="glass-card !p-6 border-white/10 hover:border-white/20 transition-all group">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase mb-1">Registro de Flujos</h3>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-light italic">Evolución de Consumo Estructural</p>
                </div>
                <div className="flex gap-1">
                    {['1M', '6M', '1Y', 'ALL'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-3 py-1 rounded-md text-[8px] font-black tracking-widest transition-all ${filter === t ? 'bg-[#FF8C00] text-black shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'bg-white/5 text-white/30 hover:bg-white/10'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-48">
                <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="area"
                    height="100%"
                />
            </div>
        </div>
    );
};

export default ConsumptionChart;
