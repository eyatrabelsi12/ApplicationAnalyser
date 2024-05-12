import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const ChartComponent = () => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [passedRes, failedRes, skippedRes, pendingRes] = await Promise.all([
                    axios.get('/stepstatus-data-passed'),
                    axios.get('/stepstatus-data-failed'),
                    axios.get('/stepstatus-data-skipped'),
                    axios.get('/stepstatus-data-pending')
                ]);

                const passedData = passedRes.data || [];
                const failedData = failedRes.data || [];
                const skippedData = skippedRes.data || [];
                const pendingData = pendingRes.data || [];

                const chartData = {
                    labels: passedData.map(entry => entry.nom_fichier),
                    datasets: [
                        {
                            label: 'Passed',
                            data: passedData.map(entry => entry.total_passed),
                            borderColor: 'green',
                            fill: false
                        },
                        {
                            label: 'Failed',
                            data: failedData.map(entry => entry.total_failed),
                            borderColor: 'red',
                            fill: false
                        },
                        {
                            label: 'Skipped',
                            data: skippedData.map(entry => entry.total_skipped),
                            borderColor: 'orange',
                            fill: false
                        },
                        {
                            label: 'Pending',
                            data: pendingData.map(entry => entry.total_pending),
                            borderColor: 'blue',
                            fill: false
                        }
                    ]
                };

                setChartData(chartData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Step Status Chart</h2>
            <Line data={chartData} />
        </div>
    );
};

export default ChartComponent;
