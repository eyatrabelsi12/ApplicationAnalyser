import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

async function saveDataToDatabase(fileName, fileId, fileData, fichier_id, nom_fichier) {

}

function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Aucun fichier sélectionné');
      return;
    }
  
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      const fileData = JSON.parse(event.target.result);
  
      try {
        const response = await axios.post(
            'http://localhost:3008/insert-data',
            {
              fileName: selectedFile.name,
              file: fileData,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true,  
            }
          );
  
       
        const fileId = response.data.fileId;
  
        
        await saveDataToDatabase(selectedFile.name, fileId, fileData, fileId, selectedFile.name);
  
        alert('Fichier JSON chargé avec succès');
        console.log('Réponse du serveur :', response.data);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          alert(`Le fichier ${selectedFile.name} existe déjà. Veuillez choisir un autre nom de fichier.`);
        } else {
          alert('Erreur lors du chargement du fichier JSON');
          console.error('Erreur lors du chargement du fichier JSON :', error);
        }
      }
    };
    fileReader.readAsText(selectedFile);
  };
  
  return (
    <div>
      <h1>Importation du fichier JSON</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Charger fichier</button>
      <br></br>
      <Link to="/comparaison">Comparer</Link>
    </div>
  );
}

export default FileUploader;
