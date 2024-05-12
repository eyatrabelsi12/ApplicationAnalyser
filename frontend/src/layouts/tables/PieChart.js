import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto'; // Assurez-vous d'importer Chart.js si ce n'est pas déjà fait

// Votre code ici

const PieChart = ({ passed, failed, skipped, pending, title }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
  
    // Calculez les pourcentages seulement si les données ne sont pas NaN
    const calculatePercentage = (value, total) => {
      return !isNaN(value) && !isNaN(total) ? (value / total) * 100 : 0;
    };
  
    useEffect(() => {
      // Code existant inchangé
  
      chartInstance.current = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: ['Passed', 'Failed', 'Skipped', 'Pending'],
          datasets: [
            {
              label: 'Test Results',
              data: [
                calculatePercentage(passed, passed + failed + skipped + pending),
                calculatePercentage(failed, passed + failed + skipped + pending),
                calculatePercentage(skipped, passed + failed + skipped + pending),
                calculatePercentage(pending, passed + failed + skipped + pending),
              ],
              backgroundColor: ['green', 'red', 'blue', 'yellow']
            }
          ]
        },
        options: {
          // Options existantes inchangées
        }
      });
  
      // Nettoyez le graphique lors du démontage du composant
      return () => {
        if (chartInstance.current !== null) {
          chartInstance.current.destroy();
        }
      };
    }, [passed, failed, skipped, pending, title]);
  
    return <canvas ref={chartRef} />;
  };
  
  export default PieChart;
