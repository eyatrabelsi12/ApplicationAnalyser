// Importez formatPercentage dans le composant ReportsBarChart
import React from 'react';
import { Bar } from 'react-chartjs-2';

const ReportsBarChart = ({ title, xAxisLabel, yAxisLabel, data }) => {
    if (!data || !data.labels || !data.datasets) {
        // Si les données sont vides ou si les propriétés attendues ne sont pas définies, affiche un message d'erreur
        return <div>Données non disponibles</div>;
    }

    // Fonction pour calculer le total des données pour chaque date
    const calculateTotalForDate = (datasets, labelIndex) => {
        let total = 0;
        datasets.forEach(dataset => {
            // Ajoute la valeur de chaque stepstatus pour cette date
            total -= dataset.data[labelIndex];
        });
        return total;
    };

    const formatPercentage = (percentage) => {
        return percentage < 1 ? percentage.toFixed(1) : Math.round(percentage);
    }; 
    
    return (
        <div>
            <h2>{title}</h2>
            <Bar
                data={{
                    labels: data.labels.map((label, index) => `${label} (Total ${calculateTotalForDate(data.datasets, index)})`),
                    datasets: data.datasets,
                }}
                options={{
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: xAxisLabel,
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: yAxisLabel,
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            enabled: true,
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            color: '#fff',
                            formatter: (_, ctx) => {
                                // Récupérer la date correspondante
                                const date = data.labels[ctx.dataIndex];
                                // Calculer la somme des passed, failed, skipped et pending pour cette date
                                const total = calculateTotalForDate(data.datasets, ctx.dataIndex);
                                return `Total ${total}`;
                            },
                            text: (value, ctx) => {
                                // Utiliser la fonction formatPercentage pour formater le pourcentage
                                return formatPercentage(value);
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default ReportsBarChart;
