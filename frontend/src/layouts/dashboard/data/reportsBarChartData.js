import React from 'react';
import { Bar } from 'react-chartjs-2';

const ReportsBarChart = ({ title, xAxisLabel, yAxisLabel, data }) => {
    if (!data || !data.labels || !data.datasets) {
        // Si les données sont vides ou si les propriétés attendues ne sont pas définies, affiche un message d'erreur
        return <div>Données non disponibles</div>;
    }

    return (
        <div>
            <h2>{title}</h2>
            <Bar
                data={data}
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
                }}
            />
        </div>
    );
};

export default ReportsBarChart;
