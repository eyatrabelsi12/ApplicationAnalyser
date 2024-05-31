import React, { useState ,useEffect,useRef} from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { faCheckCircle, faNotEqual, faEquals } from '@fortawesome/free-solid-svg-icons';
import { FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Importez l'icône de flèche vers le bas de Material-UI
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'; // Importez l'icône de flèche vers le haut de Material-UI
import { styled } from '@mui/material/styles';
 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DocumentIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckmarkIcon from '@mui/icons-material/Check';
import ListIcon from '@mui/icons-material/List';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EditIcon from '@mui/icons-material/Edit';
import SubjectIcon from '@mui/icons-material/Subject';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import 'chart.js/auto';

import Chart from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
 
import { faSearch } from '@fortawesome/free-solid-svg-icons'
 
 
 
 
 
function Tables() {
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
 
  const [fileName1, setFileName1] = useState('');
  const [fileName2, setFileName2] = useState('');
  const [fileInfo1, setFileInfo1] = useState('');
  const [fileInfo2, setFileInfo2] = useState('');
  const [files, setFiles] = useState([]);
  const [isComparisonDone, setIsComparisonDone] = useState(false);
 
  const [search, setSearch] = useState({
    searchFeature: '',
    searchName: ''
  });
  const [showError, setShowError] = useState({});
  const [showScreenShot, setShowScreenShot] = useState({});
  // Fonction pour inverser l'état du bouton lorsqu'il est cliqué
  const toggleError = (testName) => {
    setShowError((prev) => ({
      ...prev,
      [testName]: !prev[testName],
    }));
  };
  const toggleScreenShot = (testName) => {
    // Logique pour basculer l'état du screenshot
    // Par exemple :
    setShowScreenShot((prevState) => ({
      ...prevState,
      [testName]: !prevState[testName]
    }));
  };
  
  const [selectedTest, setSelectedTest] = useState(null);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [testNames, setTestNames] = useState([]);
  const [ ShowFeatures,  setShowFeatures] = useState(true);
  const [comparisonData, setComparisonData] = useState([]);
  const [showComparison, setShowComparison] = useState(true);
  const [testNameCounts, setTestNameCounts] = useState({});
  const [testNameDistinctCounts, setTestNameDistinctCounts] = useState({});
  const extractType = (fileName) => {
    const parts = fileName.split('_');
    return parts[0]; 
};

  useEffect(() => {
    fetchLastFiles();

    // Ajouter les styles globaux pour les options de sélection
    const style = document.createElement('style');
    style.innerHTML = `
      select option:hover {
        background-color: black;
        color: white;
      }
    `;
    document.head.appendChild(style);

    // Nettoyer les styles lorsque le composant se démonte
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  

  const fetchLastFiles = async () => {
    try {
      const response = await fetch('http://localhost:3008/lastfiles');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fichiers');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error.message);
    }
  };
 
  const formatBuildDate = (dateString) => {
    // Convertir la chaîne de caractères en objet Date
    const date = new Date(dateString);
   
    // Extraire les composants de date et d'heure
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
 
    // Formater la date selon vos spécifications
    const formattedDate = `${year}-${month}-${day}`;
 
    return formattedDate;
  };
 
  const fetchFeatures = async () => {
    try {
      
const Type1 = extractType(fileName1);
const Type2 = extractType(fileName2);




if (Type1 !== Type2) {
  const alertDiv = document.createElement('div');
  alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 57%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
  alertDiv.innerHTML = `
  Enter two files belonging to the same pipeline
    <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
  `;
  document.body.appendChild(alertDiv);
  return;
}
       // Vérifier que les noms de fichiers sont différents et non vides
      if (fileName1 === fileName2) {
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 59%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
        Enter two different reports.
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
        return;
      }
      if (fileName1 === '' || fileName2 === '') {
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
        Please enter the names of both files.
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
        return;
      }
 
        // Extraire les parties pertinentes des noms de fichiers
        const extractTestType = (fileName) => {
          const parts = fileName.split('_');
          return parts[1]; // Suppose que le type de test est toujours la deuxième partie du nom de fichier
      };
 
      const testType1 = extractTestType(fileName1);
      const testType2 = extractTestType(fileName2);
 
      // Vérifier si les fichiers appartiennent au même test
      if (testType1 !== testType2) {
          const alertDiv = document.createElement('div');
          alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 55%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
          alertDiv.innerHTML = `
          Enter two files belonging to the same test
            <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
          `;
          document.body.appendChild(alertDiv);
          return;
      }
 
        const response = await fetch(`http://localhost:3008/features/distinct?file1=${fileName1}&file2=${fileName2}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        console.log("features :", data);
 
        // Vérifier si des données ont été récupérées
     
       
        let fileInfoData;
        const fileInfoResponse = await fetch(`http://localhost:3008/file-info?fileName1=${encodeURIComponent(fileName1)}&fileName2=${encodeURIComponent(fileName2)}`);
        if (!fileInfoResponse.ok) {
            throw new Error('Erreur lors de la récupération des informations de fichier');
        }
        fileInfoData = await fileInfoResponse.json();
        setFileInfo1(fileInfoData[0] || {});
        setFileInfo2(fileInfoData[1] || {});
        // Définir les informations de fileInfo dans l'état
        setFileInfo1({
          type: fileInfoData[0]?.type || '',
          first_textdate: fileInfoData[0]?.first_textdate || '',
          tag: fileInfoData[0]?.tag || '',
          total_testnames: fileInfoData[0]?.total_testnames || 0,
          total_steps: fileInfoData[0]?.total_steps || 0,
          total_passed: fileInfoData[0]?.total_passed || 0,
          total_failed: fileInfoData[0]?.total_failed || 0,
          total_pending: fileInfoData[0]?.total_pending || 0,
          total_skipped: fileInfoData[0]?.total_skipped || 0,
          passed_percentage: fileInfoData[0]?.passed_percentage || 0,
          failed_percentage: fileInfoData[0]?.failed_percentage || 0,
          skipped_percentage: fileInfoData[0]?.skipped_percentage || 0,
          pending_percentage: fileInfoData[0]?.pending_percentage || 0,
          passed_percentage :fileInfoData[0]?.passed_percentage || 0,
          failed_percentage :fileInfoData[0]?.failed_percentage || 0,
          skipped_percentage :fileInfoData[0]?.skipped_percentage || 0,
          pending_percentage :fileInfoData[0]?.pending_percentage || 0,
          build_hash: fileInfoData[0]?.build_hash|| '',
        });
        setFileInfo2({
          type: fileInfoData[1]?.type || '',
          first_textdate: fileInfoData[1]?.first_textdate || '',
          tag: fileInfoData[1]?.tag || '',
          total_testnames: fileInfoData[1]?.total_testnames || 0,
          total_steps: fileInfoData[1]?.total_steps || 0 ,
          total_passed: fileInfoData[1]?.total_passed || 0,
          total_failed: fileInfoData[1]?.total_failed || 0,
          total_pending: fileInfoData[1]?.total_pending || 0,
          total_skipped: fileInfoData[1]?.total_skipped || 0,// Utilisez l'indice 1 pour fileInfoData pour le total_steps du deuxième fichier
          passed_percentage: fileInfoData[1]?.passed_percentage || 0,
          failed_percentage: fileInfoData[1]?.failed_percentage || 0,
          skipped_percentage: fileInfoData[1]?.skipped_percentage || 0,
          pending_percentage: fileInfoData[1]?.pending_percentage || 0,
          passed_percentage :fileInfoData[1]?.passed_percentage || 0,
          failed_percentage :fileInfoData[1]?.failed_percentage || 0,
          skipped_percentage :fileInfoData[1]?.skipped_percentage || 0,
          pending_percentage :fileInfoData[1]?.pending_percentage || 0,
          build_hash: fileInfoData[1]?.build_hash|| '',
        });
        const testNameCounts = {};
        const testNameDistinctCounts = {};
        
        await Promise.all(data.map(async (feature) => {
            const response = await fetch(`http://localhost:3008/tests/by-feature?featureName=${encodeURIComponent(feature.FeatureName)}&fileName1=${encodeURIComponent(fileName1)}&fileName2=${encodeURIComponent(fileName2)}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des noms de test');
            }
            const testNamesData = await response.json();
        
            // Concaténer tous les noms de test dans un tableau pour chaque featureName
            const allTestNames = testNamesData.flatMap(test => test.testName);
            testNameCounts[feature.FeatureName] = allTestNames.length;
        
            // Utiliser un ensemble pour compter les TestName distincts
            const testNameSet = new Set(allTestNames);
            testNameDistinctCounts[feature.FeatureName] = testNameSet.size;
        
            // Initialiser les compteurs pour les anciens et les nouveaux statuts
            let previousStatusCounts = { skipped: 0, passed: 0, failed: 0, pending: 0 };
            let currentStatusCounts = { skipped: 0, passed: 0, failed: 0, pending: 0 };
        
            // Compter les occurrences de chaque statut pour chaque testName, y compris les doublons
            testNamesData.forEach(test => {
                // Incrémenter les compteurs pour les anciens statuts
                previousStatusCounts[test.stepStatusFile1]++;
        
                // Incrémenter les compteurs pour les nouveaux statuts
                currentStatusCounts[test.stepStatusFile2]++;
            });
        
            // Mettre à jour les propriétés PreviousStatusCounts et CurrentStatusCounts dans l'objet feature
            feature.PreviousStatusCounts = previousStatusCounts;
            feature.CurrentStatusCounts = currentStatusCounts;
        }));
        
        // Mettre à jour les états
        setTestNameCounts(testNameCounts);
        setTestNameDistinctCounts(testNameDistinctCounts);
        setFeatures(data);
        setSelectedFeature(null);
        setShowFeatures(true);
        setShowColumns(true);
        setShowComparison(true);
        setIsComparisonDone(true);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error.message);
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
          Erreur lors de la récupération des données: ${error.message}
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
        setError('Erreur lors de la récupération des données. Veuillez réessayer.');
    }
};
 
const passedPercentage = parseFloat(fileInfo1.passed_percentage).toFixed(2);
const failedPercentage = parseFloat(fileInfo1.failed_percentage).toFixed(2);
const skippedPercentage = parseFloat(fileInfo1.skipped_percentage).toFixed(2);
const pendingPercentage = parseFloat(fileInfo1.pending_percentage).toFixed(2);
 
const passedPercentage2 = parseFloat(fileInfo2.passed_percentage).toFixed(2);
const failedPercentage2 = parseFloat(fileInfo2.failed_percentage).toFixed(2);
const skippedPercentage2 = parseFloat(fileInfo2.skipped_percentage).toFixed(2);
const pendingPercentage2= parseFloat(fileInfo2.pending_percentage).toFixed(2);
 
 
 
 
 
 
 
 
const data = {
  labels: ['Passed', 'Failed', 'Skipped', 'Pending'],
  datasets: [
      {
          data: [passedPercentage2 , failedPercentage2 , skippedPercentage2 , pendingPercentage2 ],
          backgroundColor: ['#08c999', '#ff0000', '#3598db', '#ffff00'],
          hoverBackgroundColor: ['#08c999', '#ff0000', '#3598db', '#ffff00'],
          labels: [
            `${passedPercentage}%`,
            `${failedPercentage}%`,
            `${skippedPercentage}%`,
            `${pendingPercentage}%`
          ],
      },
  ],
};
const data1 = {
  labels: ['Passed', 'Failed', 'Skipped', 'Pending'],
  datasets: [
    {
      data: [passedPercentage, failedPercentage, skippedPercentage, pendingPercentage],
      backgroundColor: ['#08c999', '#ff0000', '#3598db', '#ffff00'],
      hoverBackgroundColor: ['#08c999', '#ff0000', '#3598db', '#ffff00'],
      labels: [
        `${passedPercentage}%`,
        `${failedPercentage}%`,
        `${skippedPercentage}%`,
        `${pendingPercentage}%`
      ],
    },
  ],
};
 
 
const options = {
  plugins: {
    legend: {
      display: false // Pour cacher la légende
    }
  }
};
const options1 = {
  plugins: {
    legend: {
      display: false // Pour cacher la légende
    }
  }
};
 
const fetchTestNames = async (featureName) => {
  try {
    const response = await fetch(`http://localhost:3008/tests/by-feature?featureName=${encodeURIComponent(featureName)}&fileName1=${encodeURIComponent(fileName1)}&fileName2=${encodeURIComponent(fileName2)}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des noms de test');
    }
    const data = await response.json();
    setSelectedFeature(featureName);
    setTestNames(data); // Mettez à jour les données de testNames directement
   
    // Afficher les données dans la console
    console.log('Données des noms de test:', data);
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de test:', error.message);
  }
};
 
 
const handleSearchFeatureChange = (event) => {
  // Conserver la saisie telle quelle, y compris la casse et les espaces
  setSearch({ ...search, searchFeature: event.target.value });
};
 
// Fonction pour filtrer les featureNames en fonction de la recherche
const filteredFeatures = features.filter(feature => {
  // Normaliser les espaces dans le nom de la fonctionnalité
  const normalizedFeatureName = feature.FeatureName.replace(/\s+/g, ' ').trim();
  const normalizedSearchFeature = search.searchFeature.replace(/\s+/g, ' ').trim();
 
  // Si la recherche est vide, renvoyer true pour afficher toutes les fonctionnalités
  if (!normalizedSearchFeature) {
    return true;
  }
 
  // Séparer les mots de la recherche
  const searchWords = normalizedSearchFeature.split(/\s+/).filter(word => word !== '');
 
  // Vérifier si chaque mot de la recherche est inclus dans le nom de la fonctionnalité
  return searchWords.every(word => normalizedFeatureName.includes(word));
});
 
const handleSearchNameChange = (event) => {
  setSearch({
    ...search,
    searchName: event.target.value
  });
};
 
// Filtrer les données en fonction de la recherche par DHRD
const filteredTestNames = testNames.filter(testPair =>
  testPair.testNames && // Vérifier si testNames est défini
  testPair.testNames.some(name => name.toLowerCase().includes(search.searchName.toLowerCase())) // Vérifier si l'un des noms de test (en minuscules) inclut la recherche (en minuscules)
);
 
 
 
const handleFeatureClick = (featureName) => {
  setSelectedFeature(featureName);
  fetchTestNames(featureName); // Appel à fetchTestNames pour récupérer les noms de test associés à la fonctionnalité sélectionnée
};
 
 
 
// Fonction pour nettoyer les caractères spéciaux
function cleanSpecialCharacters(str, keepHyphen = false) {
  if (keepHyphen) {
      return str.replace(/[():]/g, ' '); // Remplacer :, () par des espaces, mais pas le caractère -
  } else {
      return str.replace(/[():\-]/g, ' '); // Remplacer :, -, () par des espaces
  }
}
 
 
 
 
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card >
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  File Comparison
                </MDTypography>
              </MDBox>
              {/* Boîte modale pour afficher l'image sélectionnée */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-container">
            <img src={selectedImage} alt="Selected Screenshot" />
          </div>
        </div>
      )}
              <MDBox pt={2} style={{ maxHeight: '200vh', overflow: 'auto' }}>
                <div className="compare-page">
                <div>
                <FormControl variant="outlined" style={{ width: '30%', marginRight: '90px',marginLeft:'20px'}}>
  <InputLabel style={{ fontFamily: 'italic', fontSize: '18px'}}>Execution_1</InputLabel>
  <Select
    id="fileName1"
    value={fileName1}
    onChange={(e) => setFileName1(e.target.value)}
    label="Execution_1"
    style={{ '&:focus': { backgroundColor: 'white' } }}
  >
    {files.map((fileName1, index) => (
      <MenuItem key={index} value={fileName1}>{fileName1}</MenuItem>
    ))}
  </Select>
</FormControl>
<FormControl variant="outlined" style={{ width: '30%', marginLeft:'10%' }}>
  <InputLabel style={{ fontFamily: 'italic', fontSize: '18px' }}>Execution_2</InputLabel>
  <Select
    id="fileName2"
    value={fileName2}
    onChange={(e) => setFileName2(e.target.value)}
    label="Execution_2"
    style={{ '&:focus': { backgroundColor: 'white' } }}
  >
    {files.map((fileName2, index) => (
      <MenuItem key={index} value={fileName2}>{fileName2}</MenuItem>
    ))}
  </Select>
</FormControl>


          <Button
            onClick={fetchFeatures}
            variant="contained"
            style={{ color: 'white', backgroundColor: 'rgb(14, 216, 184)', borderColor: 'white',marginLeft:'20px' }}
          >
            Compare
          </Button>
        </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', width: '40%' }}>
                 
                  {isComparisonDone && (
    <Card style={{ backgroundColor: 'rgb(249, 249, 249)', width: '500px', top: '5px', borderColor: '', marginRight: '10px' }}>
    <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '6.2px', fontFamily: 'Arial', height: '299px' }}>
        <Typography variant="body1" style={{ fontSize: '350%', fontFamily: 'Italic', color: 'rgb(107, 103, 103)' }}>Report 1</Typography>
        <hr style={{ width: '100%', margin: '7px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
     
            <div style={{ marginRight: '20px' }}>
           
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>DATAHUB environment</b></Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo1.type}</Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Execution Date</b></Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}> {formatBuildDate(fileInfo1.first_textdate)}</Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Suite</b></Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo1.tag}</Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Build_Hash</b></Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo1.build_hash}</Typography>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Scenarios</b></Typography>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)',margin:'1%' }}>{fileInfo1.total_testnames}</Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Tests</b></Typography>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)', marginLeft:'1%'}}>{fileInfo1.total_steps}</Typography>
                </div>
               
            </div>
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' ,marginTop:'6px'}}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon style={{ color: '#22b14c', fontSize: '8px', marginTop: '2px', width: '18px', height: '18px' ,marginLeft:'260%'}} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)', marginLeft: '40%' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                   
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)'}}>{fileInfo1.total_passed}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon style={{ color: 'red', marginLeft: '-0.5px', fontSize: '8px', marginTop: '2px', width: '18px', height: '18px' }} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)', marginLeft: '-50px'}}>{fileInfo1.total_failed}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <NotInterestedIcon style={{ color: 'blue', marginRight: '-20px', fontSize: '8px', marginTop: '2px', width: '18px', height: '18px' }} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)', marginLeft: '-30px' }}>{fileInfo1.total_skipped}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <HourglassEmptyIcon style={{ color: 'yellow', fontSize: '8px', marginTop: '2px', width: '18px', height: '18px' }} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)', marginLeft: '-50px'}}>{fileInfo1.total_pending}</Typography>
                </div>
                <div>
                <Doughnut
  data={data1}
  style={{
    width: '145px',    // Fixed width
    height: '145px',   // Fixed height
    marginLeft: '215px',
    marginRight: 'auto',
    marginTop:'-199px',
    display: 'block',
  }}
  options={options}
/>

                </div>
            </div>
        </div>
    </CardContent>
</Card>

)}

  {isComparisonDone && (
<div style={{ fontSize: '130%', fontFamily: 'Italic', color: 'rgb(107, 103, 103)' ,fontWeight: 'bold',marginLeft:'-6px',marginRight:'6px',marginTop:'110px' }}>VS</div>
 )}
 
 {isComparisonDone && (
   
<Card style={{ backgroundColor: 'rgb(249, 249, 249)', width: '500px', top: '5px', borderColor: '', marginRight: '-500px' }}>
    <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '6.2px', fontFamily: 'Arial', height: '299px' }}>
        <Typography variant="body1" style={{ fontSize: '350%', fontFamily: 'Italic', color: 'rgb(107, 103, 103)' }}>Report 2</Typography>
        <hr style={{ width: '100%', margin: '7px 0' }} />
        <div>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>DATAHUB environment</b></Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo2.type}</Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Execution Date</b></Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}> {formatBuildDate(fileInfo2.first_textdate)}</Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Suite</b></Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo2.tag}</Typography>
            <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Build_Hash</b></Typography>
                <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' }}>{fileInfo2.build_hash}</Typography>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Scenarios</b></Typography>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' ,margin:'1%'}}>{fileInfo2.total_testnames}</Typography>
                </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}>Tests</b></Typography>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' ,margin:'1%'}}>{fileInfo2.total_steps}</Typography>
                </div>
             
            <div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon style={{ color: '#22b14c', marginLeft: '320%', fontSize: '8px' ,marginTop:'2px',width:'18px',height:'18px'}} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)',marginLeft:'60px' }}>{fileInfo2.total_passed}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon style={{ marginRight: '-11px', color: 'red' , marginLeft: '30px', fontSize: '8px' ,marginTop:'2px',width:'18px',height:'18px'}} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)',marginLeft:'14px' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' ,marginLeft:'3px'}}>{fileInfo2.total_failed}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <NotInterestedIcon style={{  marginRight: '-11px',color: 'blue', marginLeft: '50px', fontSize: '8px' ,marginTop:'2px',width:'18px',height:'18px'}} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)',marginLeft:'14px' }}>{fileInfo2.total_skipped}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <HourglassEmptyIcon style={{  marginRight: '-11px',color: 'yellow', marginLeft: '54px', fontSize: '8px' ,marginTop:'2px',width:'18px',height:'18px'}} />
                        <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(119, 119, 119)' }}><b style={{ color: 'rgb(107, 103, 103)' }}></b></Typography>
                    </div>
                    <Typography variant="body1" style={{ fontSize: '200%', fontFamily: 'Arial', color: 'rgb(150, 142, 142)' ,marginLeft:'14px'}}>{fileInfo2.total_pending}</Typography>
                </div>
                <div style={{marginLeft:'58%',marginTop:'-59%'}}>
                <Doughnut
  data={data}
  style={{
    width: '144px',    // Fixed width
    height: '144px',   // Fixed height
    marginLeft: '10px',
    marginRight: 'auto',
    marginTop:'2px',
    display: 'block',
  }}
  options={options}
/>
                </div>
 
        </div>
        </div>
    </CardContent>
</Card>
                  )}
                        </div><br></br>
 
                        {isComparisonDone && (
    <>              
        {/* Champ de recherche par Feature */}
        {!selectedFeature && (
            <div className="search-bar">
               <div className="search-icon">
    <FontAwesomeIcon icon={faSearch} style={{ width: '15px', height: '15px' }} />
  </div>
                <input
                    type="text"
                    placeholder="Rechercher par Feature..."
                    value={search.searchFeature}
                    onChange={handleSearchFeatureChange}
                />
            </div>
        )}
    </>
)}
 
 
                  {ShowFeatures && (
  <div className="table-section">
    {!selectedFeature && (
      <>
        {showColumns && (
          <table>
            <thead>
              <tr >
                <th style={{ textAlign: 'center', verticalAlign: 'middle' ,fontFamily:'italic'}} className="feature-header">Jira Key</th>
                <th className="feature-header" style={{fontFamily:'italic'}}>Features</th>
                <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }} className="feature-header">Scenarios</th>
                <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }} className="feature-header">Tests</th>
                <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }} className="feature-header">Compare Results</th>
                <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }} className="feature-header">Previous</th>
                <th style={{ textAlign: 'center', verticalAlign: 'middle' ,fontFamily:'italic'}} className="feature-header">Current</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map(feature => {
                // Nettoyer les valeurs pour l'affichage
                const cleanedFeatureName = feature.name_1.replace('@', ''); // Supprimer les caractères "@"
                const cleanedFeatureNameDisplay = cleanSpecialCharacters(cleanedFeatureName, true); // Nettoyer les caractères spéciaux, en gardant le '-'
                const cleanedFeatureTitle = cleanSpecialCharacters(feature.FeatureName); // Nettoyer les caractères spéciaux
 
                // Récupérer le nombre total de testName pour cette featureName à partir de testNameCounts
                const totalTestNames = testNameCounts[feature.FeatureName] || 0;
                // Diviser le nombre total de testName par 2
                const halfTotalTestNames = Math.ceil(totalTestNames / 2);
 
                let statusIcon = ''; // Définir l'icône de statut par défaut
                if (feature.PreviousStatusCounts.passed === feature.CurrentStatusCounts.passed &&
                    feature.PreviousStatusCounts.failed === feature.CurrentStatusCounts.failed &&
                    feature.PreviousStatusCounts.skipped === feature.CurrentStatusCounts.skipped &&
                    feature.PreviousStatusCounts.pending === feature.CurrentStatusCounts.pending) {
                  statusIcon = 'identical-icon'; // Utiliser l'icône identique lorsque les deux jeux de données sont identiques
                } else {
                  statusIcon = 'difference-icon'; // Utiliser l'icône de différence lorsque les jeux de données diffèrent
                }
 
                // Définir les objets PreviousStatusCounts et CurrentStatusCounts avec des valeurs par défaut
                const previousStatusCounts = feature.PreviousStatusCounts || { skipped: 0, passed: 0, failed: 0, pending: 0 };
                const currentStatusCounts = feature.CurrentStatusCounts || { skipped: 0, passed: 0, failed: 0, pending: 0 };
 
                // Fonction pour obtenir la couleur de fond en fonction de la valeur
                const getBackgroundColor = (value) => {
                  if (value === 'passed') return '#22b14c';
                  if (value === 'failed') return '#db4040';
                  if (value === 'skipped') return '#3598db';
                  if (value === 'pending') return '#ffd119';
                  return 'white'; // Par défaut
                };
 
                return (
                  <tr key={feature.FeatureName}>
                   
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}> <a href={`${'https://support.neoxam.com/browse/'
}${cleanedFeatureNameDisplay}`} target="_blank" rel="noopener noreferrer">{cleanedFeatureNameDisplay}</a></td>
                    <td>
    <a href="#" onClick={() => handleFeatureClick(feature.FeatureName)} >{cleanedFeatureTitle}</a>
  </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{testNameDistinctCounts[feature.FeatureName]}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{halfTotalTestNames}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <FontAwesomeIcon
  icon={statusIcon === 'difference-icon' ? faNotEqual : faEquals}
  style={{ color: statusIcon === 'difference-icon' ? 'red' : '#22b14c' }}
  title={statusIcon === 'difference-icon' ? 'Different' : 'Identical'}
/>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Affichage des occurrences de chaque statut pour l'ancien statut */}
                      {Object.entries(previousStatusCounts).map(([status, count], index) => (
                        count > 0 && <div key={index} style={{ backgroundColor: getBackgroundColor(status), padding: '4px', display: 'inline-block', marginRight: '1px' }}>
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{count}</span>
                        </div>
                      ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Affichage des occurrences de chaque statut pour l'ancien statut */}
                      {Object.entries(currentStatusCounts).map(([status, count], index) => (
                        count > 0 && <div key={index} style={{ backgroundColor: getBackgroundColor(status), padding: '4px', display: 'inline-block', marginRight: '1px' }}>
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{count}</span>
                        </div>
                      ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </>
   
)}
 
 
{selectedFeature && !selectedTest && (
  <>
<div className="search-bar">
  <div className="search-icon">
    <FontAwesomeIcon icon={faSearch} style={{ width: '15px', height: '15px' }} />
  </div>
  <input
    type="text"
    placeholder="Rechercher par DHRD..."
    value={search.searchName}
    onChange={handleSearchNameChange}
  />
</div>
 
 
 
    <button style={{ backgroundColor: 'rgb(247, 245, 244)', color: 'black', marginBlock: '13px', cursor: 'pointer', borderRadius: '10px', padding: '5px 10px', margin: '0 10px', float: 'right' ,marginBottom:'4px',borderColor:'black' ,outlineColor:'black'}} onClick={() => setSelectedFeature(null)}>← Retour</button>
    <table>
      <thead>
        <tr>
        <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }}>Jira Key</th>
          <th style={{fontFamily:'italic'}}>Scenarios</th>
          <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }}>Compare Results</th>
          <th style={{ textAlign: 'center', verticalAlign: 'middle' ,fontFamily:'italic'}}>Old Status</th>
          <th style={{ textAlign: 'center', verticalAlign: 'middle',fontFamily:'italic' }}>New Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredTestNames.map((testPair, index) => {
           // Déclarer la variable statusIcon en dehors de la boucle map
  let statusIcon = ''; // Définir l'icône de statut par défaut
  if (testPair.stepStatusFile1 !== testPair.stepStatusFile2) {
    statusIcon = 'difference-icon'; // Si les StepStatus sont différents, utiliser l'icône de différence
  } else {
    statusIcon = 'identical-icon'; // Sinon, utiliser l'icône identique
  }
          const halfLength = Math.ceil(testPair.testNames.length / 2);
          const halfTestNames = testPair.testNames.slice(0, halfLength); // Prend la moitié des lignes des testName
          return halfTestNames.map((testName, innerIndex) => (
            <tr key={testName} > {/* Utilisez le nom de la featureName comme clé */}
             <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
  <a href={`https://support.neoxam.com/browse/${testName.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
    {testName.replace('@', '')}
  </a>
</td>
<td>
  {testPair.testName[index * 0]}

  {testPair.errorMessageFile1 || testPair.errorMessageFile2 ? (
    <div onClick={() => toggleError(testName)} style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: 'red' }}>
        {showError[testName] ? <ArrowDropUpIcon style={{ color: 'red' }} /> : <ArrowDropDownIcon style={{ color: 'red' }} />}
        {/* Afficher le message d'erreur à côté de l'icône */}
        <p>show Error</p>
      </div>
    </div>
  ) : null}
  {/* Afficher les messages d'erreur si le bouton est cliqué */}
  {showError[testName] && (
    <div>
    {/* Afficher ErrorMessageExecution1 s'il est défini */}
    {testPair.errorMessageFile1 && (
      <p style={{ color: 'red' }}>- ErrorMessageExecution1 <br></br>{testPair.errorMessageFile1}</p>
    )}
    {/* Afficher ErrorMessageExecution2 s'il est défini */}
    {testPair.errorMessageFile2 && (
      <p style={{ color: 'red' }}>- ErrorMessageExecution2<br></br> {testPair.errorMessageFile2}</p>
    )}
  </div>
  )}
   {testPair.imageDataFile1 || testPair.imageDataFile2 ? (
    <div onClick={() => toggleScreenShot(testName)} style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: 'red' }}>
        {showScreenShot[testName] ? <ArrowDropUpIcon style={{ color: 'red' }} /> : <ArrowDropDownIcon style={{ color: 'red' }} />}
        {/* Afficher le message d'erreur à côté de l'icône */}
        <p>ScreenShot</p>
      </div>
    </div>
  ) : null}

  {/* Afficher les screenshots si le bouton est cliqué */}
  {showScreenShot[testName] && (
    <div>
      {/* Afficher le screenshot de ErrorMessageExecution1 s'il est défini */}
      {testPair.imageDataFile1 && (
        <p>- ScreenshotExecution1 <img src={`data:image/png;base64,${testPair.imageDataFile1}`} alt="Screenshot"style={{ width: '600px', height: '300px' }}   className="hoverable-image" /></p>
      )}
      {/* Afficher le screenshot de ErrorMessageExecution2 s'il est défini */}
      {testPair.imageDataFile2 && (
      <p>- ScreenshotExecution2 <img src={`data:image/png;base64,${testPair.imageDataFile2}`} alt="Screenshot" style={{ width: '600px', height: '300px' }}  className="hoverable-image"  /></p>

      )}
    </div>
  )}
</td>


              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
              <FontAwesomeIcon
   icon={statusIcon === 'difference-icon' ? faNotEqual : faEquals}
  style={{ color: statusIcon === 'difference-icon' ? 'red' : '#22b14c' }}
  title={statusIcon === 'difference-icon' ? 'Different' : 'Identical'}
/>
</td>
<td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{testPair.stepStatusFile1} </td>
            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{testPair.stepStatusFile2}</td>
            </tr>
          ));
        })}
      </tbody>
    </table>
  </>
)}
 
 
       
                    </div>
                  )}
                </div>
                <style>{`
                  .compare-page {
                    padding: 30px;
                    color: black;
                  }
 
                  .input-section {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    color: black;
                    font-size: 15px;
                  }
 
                  .search-bar {
                    position: relative;
                  }
                 
                  .search-icon {
                    position: absolute;
                    top: 50%;
                   
                    left: 155px; /* Ajustez selon votre préférence */
                    transform: translateY(-50%);
                  }
                 
               
                  .input-section label {
                    margin-right: 10px;
                  }
 
                  .input-section input {
                    margin-right: 20px;
                    padding: 1px;
                    border-radius: 3px;
                    border: 1px solid aquamarine;
                  }
 
                  .feature-header {
                    background-color:rgb(247, 245, 244);
                    color: black;
                  }
                  .hoverable-image:hover {
                    transform: scale(1.5); /* Augmente la taille de l'image de 1.5x */
                    transition: transform 0.3s ease; /* Ajoute une transition fluide */
                    margin-left: 80px; /* Ajoute un décalage sur le côté droit de l'image agrandie */
                  }
                  .input-section button {
                    padding: 5px 10px;
                    background-color: rgb(97, 197, 164);
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 5px;
                  }
 
                  .error {
                    color: black;
                    margin-top: 10px;
                  }
 
                  .search-bar {
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                 
                  }
                  .search-bar input {
                    margin-right: 10px;
                    padding: 5px;
                    border-radius: 10px;
                    border: 1px solid aquamarine;
                  }
 
                  .search-bar button {
                    padding: 5px 10px;
                    background-color: rgb(97, 197, 164);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                  }
 
                  table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                    background-color: white;
                  }
 
                  th {
                    text-align: left;
                    padding: 8px;
                    border: 1px solid #dddddd;
                    font-size: 30px;
                    color: black;
                  }
 
                  th, td {
                    text-align: left;
                    padding: 8px;
                    border: 1px solid #dddddd;
                    font-size: 15px;
                  }
 
                  td {
                    text-align: left;
                    padding: 8px;
                    border: 1px solid #dddddd;
                    font-size: 15px;
                    color: black;
                  }
 
                  th {
                    background-color: rgb(247, 245, 244);
                    color:black;
                  }
 
                  .back-button {
                    margin-top: 20px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    padding: 5px 10px;
                  }
                `}</style>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
 
export default Tables;