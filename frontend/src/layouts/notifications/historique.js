import React, { useState, useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import MDBox from "components/MDBox";


const CercleDeRapportPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [percentages, setPercentages] = useState(null); 
    const [featureSummary, setFeatureSummary] = useState(null);
    const [showCircles, setShowCircles] = useState(false);
    const pieChartRef = useRef(null); 

    const handleFetchData = async () => {
        try {
            const response = await fetch('http://localhost:3008/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nom_fichier: inputValue })
            });
            const data = await response.json();
            if (response.ok) {
                if (data.summary) {
                    setSummary(data.summary);
                    setError(null);
                    setPercentages(data.percentages);
                    setShowCircles(true);
                } else {
                    window.alert("Ce rapport n'existe pas dans la base");
                    setSummary(null);
                    setPercentages(null);
                    setFeatureSummary(null);
                    setShowCircles(false);
                }
                if (data.featureSummary) {
                    setFeatureSummary(data.featureSummary);
                }
            } else {
                setError(data.error);
                setSummary(null);
                setPercentages(null);
                setFeatureSummary(null);
                setShowCircles(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Internal server error');
            setSummary(null);
            setPercentages(null);
            setFeatureSummary(null);
            setShowCircles(false);
            window.alert('Erreur interne du serveur');
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleFetchData();
    };

    const getTotalFeatureCount = (featureSummary) => {
        let totalFeatures = 0;
        if (featureSummary && featureSummary.length > 0) {
            featureSummary.forEach((feature) => {
                totalFeatures += parseInt(feature.total_passed) + parseInt(feature.total_failed);
            });
        }
        return totalFeatures;
    };

    useEffect(() => {
        if (pieChartRef && pieChartRef.current) {
            const chartInstance = pieChartRef.current.chartInstance;
            if (chartInstance) {
                chartInstance.options.plugins.tooltip.callbacks.label = function (tooltipItem, data) {
                    const dataset = data.datasets[tooltipItem.datasetIndex];
                    const total = dataset.data.reduce((acc, value) => acc + value, 0);
                    const currentValue = dataset.data[tooltipItem.index];
                    const percentage = parseFloat(((currentValue / total) * 100).toFixed(2));
                    return `${data.labels[tooltipItem.index]}: ${currentValue} (${percentage}%)`;
                };
                chartInstance.update();
            }
        }
    }, [summary]);

    const data = {
        labels: ['Passed', 'Failed', 'Skipped', 'Pending'],
        datasets: [
            {
                data: [summary ? summary.total_passed : 0, summary ? summary.total_failed : 0, summary ? summary.total_skipped : 0, summary ? summary.total_pending : 0],
                backgroundColor: ['#11c143', '#ff0000', '#3598db', '#ffff00'],
                hoverBackgroundColor: ['#11c143', '#ff0000', '#3598db', '#ffff00'],
            },
        ],
    };

    const calculatePercentage = (passed, failed, total) => {
        const passedPercentage = (passed * 100) / total;
        const failedPercentage = (failed * 100) / total;
        return [passedPercentage.toFixed(2), failedPercentage.toFixed(2)];
    };

    let featureData = {};
    let featurePercentage = [];
    if (featureSummary && featureSummary.length > 0) {
        featureData = {
            labels: ['Passed', 'Failed'],
            datasets: [
                {
                    data: [
                        parseInt(featureSummary[0].total_passed),
                        parseInt(featureSummary[0].total_failed)
                    ],
                    backgroundColor: ['#11c143', '#ff0000'],
                    hoverBackgroundColor: ['#11c143', '#ff0000'],
                },
            ],
        };
        featurePercentage = calculatePercentage(
            parseInt(featureSummary[0].total_passed),
            parseInt(featureSummary[0].total_failed),
            getTotalFeatureCount(featureSummary)
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
    };

    return (
        <DashboardLayout>
        <DashboardNavbar />
        <Card style={{ borderColor: 'aqua', borderWidth: '1px', width: '1000px', height: '500px', marginTop: '1%', left: '-1%' }}>
            <CardContent style={{ borderColor: 'aqua', borderWidth: '1px' }}>
                <Typography variant="h6" component="div"></Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        id="input"
                        label="Entrez le nom du fichier"
                        variant="outlined"
                        width="70%"
                      
                        margin="normal"
                        required
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        InputProps={{
                            style: { borderColor: 'black' },
                            classes: {
                                focused: 'inputFocused'
                            }
                        }}
                    />
                    <br />
                    <Button type="submit" variant="contained" style={{ color: 'white', backgroundColor: 'rgb(14, 216, 184)', borderColor: 'black' }}>
                        Afficher
                    </Button>
                </form>

                {error && <Typography variant="body1" color="error">{error}</Typography>}
                {showCircles && summary && percentages && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', width: '100%' }}>
                        <Card style={{ backgroundColor: 'rgb(249, 249, 249)', width: '300px', top: '5px', borderColor: '', marginRight: '10px' }}>
                            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '6.5px', fontFamily: 'Arial', height: '360px' }}>
                                <Typography variant="body1" style={{ fontSize: '350%', fontFamily: 'Italic', color: 'rgb(107, 103, 103)' }}>Run info</Typography>
                                <hr style={{ width: '100%', margin: '7px 0' }} />
                                <div>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Project</b></Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>DATAHUB visage</Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Suite</b></Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{summary.tag}</Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Date_d'execution</b></Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{formatDate(summary.first_textdate)}</Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Environnement DATAHUB</b></Typography>
                                    {summary && summary.first_type && (
    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{summary.first_type}</Typography>

)}
                            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Build_Hash</b></Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{summary.build_hash}</Typography>

                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Scénarios</b></Typography>
                                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{summary.total_testname}</Typography>

                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
  <div style={{ marginRight: '50%' }}>
    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}>
      <b style={{ color: 'rgb(107, 103, 103)' }}>Tests</b>
    </Typography>
    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>
      {summary.total_steps}
    </Typography>
  </div>
  <div>
    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}>
      <b style={{ color: 'rgb(107, 103, 103)' }}>Feature</b>
    </Typography>
    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>
      {getTotalFeatureCount(featureSummary)}
    </Typography>
  </div>

</div>

                            </CardContent>
                        </Card>
                        <Card style={{ backgroundColor: 'rgb(249, 249, 249)', width: '300px', top: '5px', marginRight: '10px' }}>
                            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '7px', fontFamily: 'Arial', height: '360px' }}>
                                <Typography variant="body1" style={{ fontSize: '350%', fontFamily: 'Italic', color: 'rgb(107, 103, 103)' ,marginLeft:'-80%'}}>Tests</Typography>
                                <hr style={{ width: '100%', margin: '5px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                                    <Pie ref={pieChartRef} data={data} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleIcon style={{ color: '#11c143', marginRight: '1px', fontSize: '50px' ,height:'25%',width:'25%'}} />
                                        <Typography variant="body1" style={{ fontSize: '14px' }}>{percentages.passed}%</Typography>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <CancelIcon style={{ color: '#ff0000', marginRight: '1px', fontSize: '30px' ,height:'25%',width:'25%'}} />
                                        <Typography variant="body1" style={{ fontSize: '14px' }}>{percentages.failed}%</Typography>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <NotInterestedIcon style={{ color: '#3598db', marginRight: '1px', fontSize: '30px',height:'25%',width:'25%' }} />
                                        <Typography variant="body1" style={{ fontSize: '14px' }}>{percentages.skipped}%</Typography>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <HourglassEmptyIcon style={{ color: '#ffff00', marginRight: '1px', fontSize: '30px' ,height:'25%',width:'25%'}} />
                                        <Typography variant="body1" style={{ fontSize: '14px' }}>{percentages.pending}%</Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{ backgroundColor: 'rgb(249, 249, 249)', width: '300px', top: '5px', marginRight: '10px' }}>
                            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px', fontFamily: 'Arial', height: '360px' }}>
                                <Typography variant="body1" style={{ fontSize: '24px', fontFamily: 'Italic', color: 'rgb(107, 103, 103)', marginLeft: '-69%' }}>Features</Typography>
                                <hr style={{ width: '100%', margin: '5px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '90%',marginTop:'16px' }}>
                                    <Pie data={featureData} />
                                </div>
                                {featurePercentage.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                                            <CheckCircleIcon style={{ color: '#11c143', marginRight: '5px', fontSize: '14px' ,marginTop:'20px'}} />
                                            <Typography variant="body1" style={{ fontSize: '14px' ,marginTop:'20px'}}>{featurePercentage[0]}%</Typography>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <CancelIcon style={{ color: '#ff0000', marginRight: '5px', fontSize: '14px' ,marginTop:'20px'}} />
                                            <Typography variant="body1" style={{ fontSize: '14px',marginTop:'20px' }}>{featurePercentage[1]}%</Typography>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
        </DashboardLayout>
    );
};

export default CercleDeRapportPage;
