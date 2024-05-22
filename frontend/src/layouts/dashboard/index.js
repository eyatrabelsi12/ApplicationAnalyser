import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "./ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { format } from 'date-fns';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import 'chartjs-plugin-datalabels';
import { Line } from 'react-chartjs-2';
import OpenInNewOffIcon from '@mui/icons-material/OpenInNewOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TableContainer, Table, TableBody, TableRow, TableCell, TextField, IconButton, InputAdornment, MenuItem} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Icône d'horloge
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Icône de calendrier
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BugReportIcon from '@mui/icons-material/BugReport';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Icône d'erreur
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Icône de problème
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icône de cercle de vérification
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; // Icône de pouce levé
import DoneIcon from '@mui/icons-material/Done';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Icône de tendance à la hausse
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // Icône de tendance à la baisse
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'; // Icône de tendance plate
import BarChartIcon from '@mui/icons-material/BarChart'; // Icône de graphique à barres
import ShowChartIcon from '@mui/icons-material/ShowChart'; // Icône de graphique // Icône d'ajout à une liste avec vérification // Icône de coche// Icône d'avertissement
import Select from '@mui/material/Select';
import DeleteIcon from '@material-ui/icons/Delete';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import FolderIcon from '@material-ui/icons/Folder';
import PersonIcon from '@material-ui/icons/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
const formatDay = (date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy_HH:mm:ss') : ''; // Formater la date pour afficher le jour (dd), le mois (MM), l'année (yyyy), l'heure (HH), les minutes (mm) et les secondes (ss). Sinon, retourner une chaîne vide.
};
const formatDay1 = (date) => {
    return date ? format(new Date(date), 'dd/MM') : ''; // Modifier le format pour afficher uniquement le jour (dd), le mois (MM) et l'année (yyyy)
};
 
 
function Dashboard() {
    const [combinedData, setCombinedData] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [totalsByDate, setTotalsByDate] = useState({});
    const [isChartExpanded1, setIsChartExpanded1] = useState(false);
    const [isChartExpanded2, setIsChartExpanded2] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('web-ui');
    const [selectedFilter, setSelectedFilter] = useState('DHVD');
    const [chartData, setChartData] = useState({});
    const [isGraphExpanded1, setIsGraphExpanded1] = useState(true); // Définir isGraphExpanded1 sur true par défaut
    const [isGraphExpanded2, setIsGraphExpanded2] = useState(true); // Définir isGraphExpanded1 sur true par défaut
    const [selectedSuite, setSelectedSuite] = useState('WEB-UI');
    const [initialTableData, setInitialTableData] = useState([]); // Ajoutez un état pour suivre la suite sélectionnée
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [suiteOptions, setSuiteOptions] = useState([]);
    const role = localStorage.getItem("role");
   
    const [userRole, setUserRole] = useState(localStorage.getItem("role"));
 
 
 
 
 const [tableData, setTableData] = useState([]);
 const [bugs, setBugs] = useState('');
 const [fauxBugs, setFauxBugs] = useState('');
 const [editingIndex, setEditingIndex] = useState(null);
 // Ajoutez un nouvel état pour suivre l'option sélectionnée
const [selectedSuiteOption, setSelectedSuiteOption] = useState(null);
 
useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3008/automated');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const data = await response.json();
        setInitialTableData(data);
        setTableData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
 
  useEffect(() => {
    setUserRole(localStorage.getItem("role")); // Met à jour userRole avec la valeur actuelle du rôle stocké dans le stockage local
}, []);
 
useEffect(() => {
    const fetchSuiteOptions = async () => {
      try {
        const response = await axios.get('http://localhost:3008/suite-options');
        setSuiteOptions(response.data);
      } catch (error) {
        console.error('Error fetching suite options:', error);
      }
    };
    fetchSuiteOptions();
  }, []);
 
 
const handleBugsChange = (event) => {
    setBugs(event.target.value);
};
const handleFauxBugsChange = (event) => {
    setFauxBugs(event.target.value);
};
const handleCheckClick = async (index) => {
    try {
        // Créer une copie des données actuelles
        const updatedData = [...tableData];
       
        // Mettre à jour les valeurs bugs_on_jira et faux_bugs pour l'élément en cours d'édition
        updatedData[index].bugs_on_jira = bugs;
        updatedData[index].faux_bugs = fauxBugs;
 
        // Envoyer la requête PUT pour mettre à jour les données sur le serveur
        const response = await fetch(`http://localhost:3008/automated/${updatedData[index].id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData[index]),
        });
 
        // Vérifier si la requête s'est déroulée avec succès
        if (!response.ok) {
            throw new Error(`Failed to update data: ${response.status}`);
        }
 
        // Mettre à jour l'état avec les nouvelles données
        setTableData(updatedData);
 
        // Réinitialiser l'index d'édition
        setEditingIndex(null);
    } catch (error) {
        console.error('Error updating data:', error);
    }
};
 
const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
};
 
 
 const [selectedRows, setSelectedRows] = useState([]);
const [rowHover, setRowHover] = useState(null); // Pour stocker l'index de la ligne survolée
 
 
const [hoveredIndex, setHoveredIndex] = useState(null);
 
    const handleMouseEnter = (index) => {
        setHoveredIndex(index);
    };
 
    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };
 
 
 
    const handleSearch = (value) => {
        setSearchTerm(value);
        const filteredData = initialTableData.filter(data =>
            data.selected_sprint.toLowerCase().includes(value.toLowerCase())
        );
        setTableData(filteredData);
    };
 
    const fetchData = async (category, filter) => {
        try {
            const response = await axios.get('http://localhost:3008/stepstatus-data-combined', {
                params: {
                    selectedFilter: String(filter), // Assurez-vous que selectedFilter est une chaîne de caractères
                    selectedCategory: category,
                }
            });
            setCombinedData(response.data);
   
            const totals = {};
            response.data.forEach(data => {
                const date = formatDay1(data.textdate);
                if (!totals[date]) {
                    totals[date] = {
                        passed: 0,
                        failed: 0,
                        skipped: 0,
                        pending: 0,
                    };
                }
                // Incrémenter le total pour chaque stepstatus
                totals[date].passed += data.total_passed;
                totals[date].failed += data.total_failed;
                totals[date].skipped += data.total_skipped;
                totals[date].pending += data.total_pending;
            });
            setTotalsByDate(totals);
        } catch (error) {
            console.error('Erreur lors de la récupération des données de StepStatus combinées :', error);
        }
    };
   
 
    useEffect(() => {
        const fetchDataAndStatistics = async (category, filter) => {
            await fetchData(category, filter); // Récupérer les données
            await fetchStatistics(); // Récupérer les statistiques
        };
 
        fetchDataAndStatistics(selectedCategory, selectedFilter); // Appeler fetchData avec les valeurs sélectionnées initiales
    }, [selectedCategory, selectedFilter]);
 
    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:3008/stepstatus-data');
            const data = response.data;
            const statistics = data.reduce((acc, data) => {
                const stepStatus = data.StepStatus.toLowerCase();
                acc[stepStatus + 'Percentage'] = data.Percentage ? parseFloat(data.Percentage).toFixed(2) : '0%';
                acc[stepStatus + 'FirstTextDate'] = data.firstTextDate; // Ajouter la date d'exécution dans l'état statistics
                acc['FirstScenarioType'] = data.FirstScenarioType; // Ajouter le FirstScenarioType
                acc['FirstTagName'] = data.FirstTagName; // Ajouter le FirstTagName
                return acc;
            }, {});
            console.log('Statistics:', statistics); // Vérifiez que statistics est correctement formé
            setStatistics(statistics);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques :', error);
        }
    };
 
    const handleFilterChange = async (filter) => {
        setSelectedFilter(String(filter)); // Assurez-vous que selectedFilter est une chaîne de caractères
    };
   
   
    const handleCategoryChange = async (category) => {
        setSelectedCategory(category);
        setSelectedSuiteOption(null);
    };
   
   
   
 
    const toggleChartSize1 = () => {
        setIsChartExpanded1(!isChartExpanded1);
        setIsGraphExpanded1(!isGraphExpanded1); // Inversez l'état de isGraphExpanded1
    };
 
    const handleRowClick = (index) => {
        setEditingIndex(index);
        setBugs(tableData[index].bugs_on_jira);
        setFauxBugs(tableData[index].faux_bugs);
    };
   
    const handleEditClick = (index, id) => {
        setEditingRow(index);
        setEditingItemId(id); // Stocker l'identifiant unique de l'élément édité
        const currentData = tableData[index];
        setBugsValue(currentData.bugs_on_jira.toString());
        setFauxBugsValue(currentData.faux_bugs.toString());
      };
     
 
   // Assurez-vous d'avoir cette fonction dans votre code
const toggleChartSize2 = () => {
    setIsChartExpanded2(!isChartExpanded2);
    setIsGraphExpanded2(!isGraphExpanded2); // Inversez l'état de isGraphExpanded1
};
const fetchData1 = async () => {
    try {
      const response = await axios.get('/automated');
      setTableData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };
 
  useEffect(() => {
    fetchData1(); // Appel fetchData lors du montage du composant pour récupérer les données initiales
  }, []);
   
    const [selectedPeriod, setSelectedPeriod] = useState('6months'); // Valeur par défaut: 6 mois
 
    const handlePeriodChange = (value) => {
        setSelectedPeriod(value);
    };
   
    const handleDeleteClick = async (index) => {
        try {
            // Créez une copie des données actuelles
            const updatedData = [...tableData];
           
            // Supprimez l'élément correspondant du tableau
            const deletedItem = updatedData.splice(index, 1)[0];
   
            // Envoyez une requête DELETE pour supprimer les données sur le serveur
            await fetch(`http://localhost:3008/automated/${deletedItem.id}`, {
                method: 'DELETE',
            });
   
            // Mettez à jour l'état avec les nouvelles données
            setTableData(updatedData);
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };
   
 
    useEffect(() => {
        const fetchData = async () => {
          try {
            let url = 'http://localhost:3008/data';
   
            // Modifier l'URL de la requête en fonction de la période sélectionnée
            if (selectedPeriod === '6months') {
              url += '?period=6months';
            } else if (selectedPeriod === '1year') {
              url += '?period=1year';
            }
   
            // Ajouter le paramètre suite à l'URL si une suite est sélectionnée
            if (selectedSuite) {
              url += `&suite=${selectedSuite}`;
            }
   
            const response = await axios.get(url);
            const data = response.data;
   
            // Utiliser les données filtrées pour construire le graphique
            const chartLabels = data.map(item => item.selected_sprint);
            const scenarioData = data.map(item => item.scenario);
            const testCaseData = data.map(item => item.test_cases);
            const bugsData = data.map(item => item.bugs_on_jira);
   
            setChartData({
              labels: chartLabels,
              datasets: [
                {
                  label: 'Scenarios',
                  data: scenarioData,
                  fill: false,
                  backgroundColor: 'rgb(14, 216, 184)',
                  borderColor:'rgb(14, 216, 184)',
                  borderWidth: 2,
                  tension: 0.3,
                },
                {
                  label: 'Test Cases',
                  data: testCaseData,
                  fill: false,
                  backgroundColor: '#3598db',
                  borderColor:'#3598db',
                  borderWidth: 2,
                  tension: 0.3,
                },
                {
                  label: 'Raised_Bugs',
                  data: bugsData,
                  fill: false,
                  backgroundColor: 'red',
                  borderColor:'red',
                  borderWidth: 2,
                  tension: 0.3,
                },
              ],
            });
           
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
   
        fetchData();
      }, [selectedPeriod, selectedSuite]); // Mettre à jour les données lorsque la période ou la suite sélectionnée change
   
   
    return (
       
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                        <ComplexStatisticsCard
    color="info"
    icon="block"
    count={`${statistics.skippedPercentage !== undefined ? statistics.skippedPercentage : '0%'} %`}
    percentage={{
        color: "success",
        value: `${statistics.skippedPercentage !== undefined ? statistics.skippedPercentage : '0%'}%`,
        label: (
            <div>
                <div> <CalendarTodayIcon /> {formatDay(statistics.skippedFirstTextDate)}</div>
                <div> <DescriptionIcon /> {statistics.FirstScenarioType} - {statistics.FirstTagName ? statistics.FirstTagName.replace('@', '') : ''}</div>
                <div ><FolderIcon style={{fontSize:'110%'}}/>last File</div>
            </div>
        )
    }}
/>
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                        <ComplexStatisticsCard
    icon="pending"
    color="warning"
    count={`${statistics.pendingPercentage !== undefined ? statistics.pendingPercentage : '0'}%`}
    percentage={{
        color: "success",
        value: `${statistics.pendingPercentage !== undefined ? statistics.pendingPercentage : '0'}%`,
        label: (
            <div>
                <div><CalendarTodayIcon /> {formatDay(statistics.passedFirstTextDate)}</div>
                <div> <DescriptionIcon /> {statistics.FirstScenarioType} - {statistics.FirstTagName ? statistics.FirstTagName.replace('@', '') : ''}</div>
                <div ><FolderIcon style={{fontSize:'110%'}} />last File</div>
            </div>
        )
    }}
/>
 
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                        <ComplexStatisticsCard
    color="success"
    icon="check_circle"
    count={`${statistics.passedPercentage !== undefined ? statistics.passedPercentage : '0%'}%`}
    percentage={{
        color: "success",
        value: `${statistics.passedPercentage !== undefined ? statistics.passedPercentage : '0%'}%`,
        label: (
            <div>
                <div><CalendarTodayIcon /> {formatDay(statistics.passedFirstTextDate)}</div>
                <div> <DescriptionIcon /> {statistics.FirstScenarioType} - {statistics.FirstTagName ? statistics.FirstTagName.replace('@', '') : ''}</div>
                <div ><FolderIcon style={{fontSize:'110%'}} />last File</div>
            </div>
        )
    }}
/>
 
                        </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                        <ComplexStatisticsCard
    icon="highlight_off"
    color="primary"
    count={`${statistics.failedPercentage !== undefined ? statistics.failedPercentage : '0%'}%`}
    percentage={{
        color: "success",
        value: `${statistics.failedPercentage !== undefined ? statistics.failedPercentage: '0%'}%`,
        label: (
            <div>
                <div><CalendarTodayIcon /> {formatDay(statistics.failedFirstTextDate)}</div>
                <div> <DescriptionIcon /> {statistics.FirstScenarioType} - {statistics.FirstTagName ? statistics.FirstTagName.replace('@', '') : ''}</div>
                <div ><FolderIcon style={{fontSize:'110%'}} />last File</div>
            </div>
        )
    }}
/>
 
                        </MDBox>
                    </Grid>
                    <Grid container spacing={2} style={{marginLeft:'1px'}}>
                    <Grid item xs={12} md={6}>
                    <Card
                           style={{
                            width: isChartExpanded1 ? "158vh" : "486px",
                            height: isChartExpanded1 ? "85vh" : "310px",
                            position: isChartExpanded1 ? "fixed" : "static",
                            top: isChartExpanded1 ? "129%" : "auto",
                            left: isChartExpanded1 ? "60%" : "auto",
                            transform: isChartExpanded1 ? "translate(-50%, -136%)" : "none",
                            zIndex: isChartExpanded1 ? 999 : "auto",
                        }}>          
                            <CardContent >
                            <div style={{fontFamily:'italic',color:'gray',marginLeft: isGraphExpanded1 ? '119px' : '39%'}}>Histogramme Analyser</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: '80%', color: "gray" }}>
                                                                                       {/* Bouton pour agrandir/réduire la carte */}
                           
                                    <div>
                                        <label style={{ marginRight: "10px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedFilter === 'DHVD'}
                                                onChange={() => handleFilterChange('DHVD')}
                                            />
                                            DHVD
                                        </label>
                                        <label style={{ marginRight: "10px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedFilter === 'DHVM'}
                                                onChange={() => handleFilterChange('DHVM')}
                                            />
                                            DHVM
                                        </label>
                                        <label style={{ marginRight: "10px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedFilter === 'DHV'}
                                                onChange={() => handleFilterChange('DHV')}
                                            />
                                            DHV
                                        </label>
                                    </div>
       
                                    <div>
                                        <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: '80%', color: "gray", borderColor: "red" ,marginLeft: isGraphExpanded1 ? '88px' : '230%' }}>
                                            <option value="web-ui">Web-UI</option>
                                            <option value="dataManagement">Data Management</option>
                                            <option value="RestAPI">RestAPI</option>
                                            <option value="Navigations">Navigation</option>
                                             {suiteOptions.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
                                        </select>
                                       
                                    </div>
                                    <div onClick={toggleChartSize1 } style={{ fontFamily: 'Arial', fontSize: '100%', color: "gray",marginLeft:'-7px',marginTop:'-2px'}}>
        {isChartExpanded1 ? <OpenInNewOffIcon/> : <OpenInNewIcon/>}
       
    </div>
                                </div>
                             
                                {selectedFilter && isGraphExpanded1 &&   (
                                 
    <ReportsBarChart
        data={{
            labels: Object.keys(totalsByDate),
            datasets: [
                {
                    label: 'Passed',
                    data: Object.values(totalsByDate).map(total => total.passed),
                    backgroundColor: 'rgb(14, 216, 184)', // Green for Passed
                },
                {
                    label: 'Failed',
                    data: Object.values(totalsByDate).map(total => total.failed),
                    backgroundColor: 'red', // Red for Failed
                },
                {
                    label: 'Skipped',
                    data: Object.values(totalsByDate).map(total => total.skipped),
                    backgroundColor: 'rgb(53, 152, 219)', // Blue for Skipped
                },
                {
                    label: 'Pending',
                    data: Object.values(totalsByDate).map(total => total.pending),
                    backgroundColor: 'yellow', // Yellow for Pending
                },
            ],
        }}
        options={{
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
                tooltip: {
                    enabled: true,
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value, ctx) => {
                        return value;
                    },
                    color: '#fff',
                    text: (ctx) => {
                        const total = Object.values(totalsByDate[ctx.label]).reduce((acc, curr) => acc + curr, 0);
                        const percentage = statistics[ctx.label.toLowerCase() + 'Percentage'];
                        return `Total: ${total}, Percentage: ${percentage !== undefined ? percentage : '0%'}`;
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                   
                },
            },
        }}
       
    />
 
) }
  {selectedFilter && !isGraphExpanded1 && (
                                 
                                 <ReportsBarChart
                                     data={{
                                         labels: Object.keys(totalsByDate),
                                         datasets: [
                                             {
                                                 label: 'Passed',
                                                 data: Object.values(totalsByDate).map(total => total.passed),
                                                 backgroundColor: 'rgb(14, 216, 184)', // Green for Passed
                                             },
                                             {
                                                 label: 'Failed',
                                                 data: Object.values(totalsByDate).map(total => total.failed),
                                                 backgroundColor: 'red', // Red for Failed
                                             },
                                             {
                                                 label: 'Skipped',
                                                 data: Object.values(totalsByDate).map(total => total.skipped),
                                                 backgroundColor: 'rgb(53, 152, 219)', // Blue for Skipped
                                             },
                                             {
                                                 label: 'Pending',
                                                 data: Object.values(totalsByDate).map(total => total.pending),
                                                 backgroundColor: 'yellow', // Yellow for Pending
                                             },
                                         ],
                                     }}
                                     options={{
                                         plugins: {
                                             legend: {
                                                 display: true,
                                                 position: 'bottom',
                                             },
                                             tooltip: {
                                                 enabled: true,
                                             },
                                             datalabels: {
                                                 anchor: 'end',
                                                 align: 'end',
                                                 formatter: (value, ctx) => {
                                                     return value;
                                                 },
                                                 color: '#fff',
                                                 text: (ctx) => {
                                                     const total = Object.values(totalsByDate[ctx.label]).reduce((acc, curr) => acc + curr, 0);
                                                     const percentage = statistics[ctx.label.toLowerCase() + 'Percentage'];
                                                     return `Total: ${total}, Percentage: ${percentage !== undefined ? percentage : '0%'}`;
                                                 },
                                             },
                                         },
                                         scales: {
                                             x: {
                                                 stacked: true,
                                             },
                                             y: {
                                                 stacked: true,
                                                 
                                             },
                                         },
                                     }}
                                     
                                 />
                             
                             ) }
 
                             
                            </CardContent>
                        </Card>
                   </Grid>
                   <Grid item xs={12} md={6}>
                   <Card style={{
         width: isChartExpanded2 ? "155vh" : "495px",
        position: isChartExpanded2 ? "fixed" : "static",
        top: isChartExpanded2 ? "76%" : "auto",
        left: isChartExpanded2 ? "60%" : "auto",
        transform: isChartExpanded2 ? "translate(-50%, -73%)" : "none",
        zIndex: isChartExpanded2 ? 999 : "auto",
    }}>          
 
    <CardContent>
    <div style={{fontFamily:'italic',color:'gray',marginLeft: isGraphExpanded2 ? '119px' : '36%'}}>KPI Suite Test Automation</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: '80%', color: "gray"}}>
            <select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: '80%', color: "gray", borderColor: "red",marginLeft:'90%'}}>
                <option value="6months">6 mois</option>
                <option value="1year">1 an</option>
            </select>
        </div>
                       
                            <div onClick={toggleChartSize2 } style={{ fontFamily: 'Arial', fontSize: '80%', color: "gray",marginLeft:'-15px',marginTop:'-22px'}}>
        {isChartExpanded2 ? <OpenInNewOffIcon/> : <OpenInNewIcon/>}
       
    </div>  
    <div>
                                        <select value={selectedSuite} // Mettre à jour la valeur du sélecteur avec l'état de la suite sélectionnée
          onChange={e => setSelectedSuite(e.target.value)}  style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial', fontSize: '63%', color: "gray", borderColor: "red" ,width:'90px',marginTop:'-22px',marginLeft: isGraphExpanded2 ? '310px' : '80%' }}>
                                            <option value="WEB-UI">Web-UI</option>
                                            <option value="Data-Management">Data Management</option>
                                            <option value="Rest API">Rest API</option>
                                            <option value="Navigation">Navigation</option>
                                            {suiteOptions.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
                                        </select>
                                    </div>
                                 
        {selectedFilter && chartData && chartData.datasets && (
            <Line data={chartData} />
        )}
    </CardContent>
 
 
                        </Card>
                        </Grid>
                    </Grid>
                   
                    <Grid container spacing={1} mt={1}>
    <Grid item xs={1} md={6}>
        <Card style={{ width: '203%' }}>
        <TableContainer>
            <TextField
                label="Search by Sprint"
                variant="outlined"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginTop: '20px', marginLeft: '2%', width: '20%', marginBottom: '2%' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton style={{ marginLeft: '360%' }}>
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <Table>
                <TableRow style={{ backgroundColor: 'white', height: 'fixed', color: 'black' }}>
                    {userRole === 'admin' && (
                        <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                           <PeopleIcon style={{ color: 'black' }} />  Username
                        </TableCell>
                    )}
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                    <CalendarMonthIcon style={{ color: '#0ED8B8',fontSize: '100%' }} /> Sprint
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                        <BugReportIcon style={{ color: 'red' }} /> Raised Bugs
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                        <WarningIcon style={{ color: 'orange'}} /> False Positive
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                        <BarChartIcon style={{ color: 'gray' }} /> False Positive Percentage
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                        <CheckCircleIcon style={{ color: 'green' }} /> True Bugs
                    </TableCell>
                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%' }}>
                        <PlaylistAddCheckIcon style={{ color: 'black' }} /> Action
                    </TableCell>
                </TableRow>
                <TableBody>
                    {tableData
                        .filter(data => data.selected_sprint.toLowerCase().includes(searchTerm.toLowerCase()))
                        .slice(0, rowsPerPage === -1 ? undefined : rowsPerPage)
                        .map((data, index) => {
                            const falsePositivePercentage = data.bugs_on_jira !== 0
                                ? (data.faux_bugs * 100) / data.bugs_on_jira
                                : 0;
 
                            return (
                                <TableRow
                                    key={index}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{ backgroundColor: hoveredIndex === index ? 'rgb(237, 235, 234)' : 'inherit' }}
                                >
                                    {userRole === 'admin' && (
                                        <TableCell style={{ fontFamily: 'italic', fontSize: '95%' ,textAlign:'center'}}>{data.username.replace(/\./g, ' ')}</TableCell>
                                    )}
                                    <TableCell style={{ fontFamily: 'italic', fontSize: '95%' ,textAlign:'center'}}>{data.selected_sprint}</TableCell>
                                    <TableCell style={{ fontFamily: 'italic', fontSize: '95%',textAlign:'center' }}>
                                        {editingIndex === index ? (
                                            <TextField value={bugs} onChange={handleBugsChange} />
                                        ) : (
                                            data.bugs_on_jira
                                        )}
                                    </TableCell>
                                    <TableCell style={{ fontFamily: 'italic', fontSize: '100%',textAlign:'center' }}>
                                        {editingIndex === index ? (
                                            <TextField value={fauxBugs} onChange={handleFauxBugsChange} />
                                        ) : (
                                            data.faux_bugs
                                        )}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 'bold', fontFamily: 'italic', fontSize: '80%', textAlign: 'center' }}>
                        <div style={{ width: '50px', height: '50px', marginLeft: '28%' }}>
                            <CircularProgressbar
                                value={falsePositivePercentage}
                                text={`${falsePositivePercentage.toFixed(2)}%`}
                                styles={buildStyles({
                                    pathColor: '#2ec9a5',
                                    textColor: 'black',
                                    trailColor: ' #eaeaea',
                                    backgroundColor: '#2ec9a5',
                                })}
                            />
                        </div>
                    </TableCell>
                                    <TableCell style={{ fontFamily: 'italic', fontSize: '95%',textAlign:'center' }}>
                                        {data.bugs_on_jira - data.faux_bugs}
                                    </TableCell>
                                    <TableCell style={{ fontFamily: 'italic', fontSize: '95%' ,textAlign:'center'}}>
                                        {userRole === 'user' ? (
                                            editingIndex === index ? (
                                                <IconButton onClick={() => handleCheckClick(index)}>
                                                    <CheckIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton onClick={() => handleRowClick(index)}>
                                                    <EditIcon style={{ color: 'rgb(21, 211, 176)' }} />
                                                </IconButton>
                                            )
                                        ) : (
                                            editingIndex === index ? (
                                                <IconButton onClick={() => handleCheckClick(index)}>
                                                    <CheckIcon />
                                                    <EditIcon style={{ color: 'rgb(21, 211, 176)' }} />
                                                </IconButton>
                                            ) : (
                                                <IconButton onClick={() => handleRowClick(index)}>
                                                    <EditIcon style={{ color: 'rgb(21, 211, 176)' }} />
                                                    <DeleteIcon style={{ color: 'red', marginLeft: '15%' }} onClick={() => handleDeleteClick(index)} />
                                                </IconButton>
                                            )
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
            <p style={{  marginLeft: '84%', marginTop: '1%',fontFamily:'italic',color:'gray'}}>Per_Row_Page</p>
        <Select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                variant="outlined"
                style={{ width: '5%', marginLeft: '90%', marginTop: '1%',marginBottom:'2%', borderColor: 'black' }}
            >
                <p >Per_Row_Page</p>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={-1}>All</MenuItem>
            </Select>
 
        </TableContainer>
 
 
 
 
 
   
        </Card>
    </Grid>
</Grid>
 
 
 
                   
                </Grid>
               
               
            </MDBox>
        </DashboardLayout>
    );
}
 
export default Dashboard;