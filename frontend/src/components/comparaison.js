import React, { useState } from 'react';
import axios from 'axios';

function TestResultsComparison() {
  const [file1, setFile1] = useState('');
  const [file2, setFile2] = useState('');
  const [comparisonResults, setComparisonResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCompareClick = () => {
  
    axios.get(`http://localhost:3008/compare-test-results/${file1}/${file2}`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          setComparisonResults(response.data);
          setErrorMessage('');
        } else {
          setComparisonResults([]);
          setErrorMessage('Aucun résultat de comparaison trouvé.');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la comparaison des résultats des tests :', error);
        setErrorMessage('Erreur lors de la comparaison des résultats des tests.');
      });
  };

  return (
    <div>
      <h1>Comparaison des résultats des tests</h1>
      <div>
        <input
          type="text"
          value={file1}
          onChange={(e) => setFile1(e.target.value)}
          placeholder="Entrez le nom du premier fichier"
        />
        <input
          type="text"
          value={file2}
          onChange={(e) => setFile2(e.target.value)}
          placeholder="Entrez le nom du deuxième fichier"
        />
        <button onClick={handleCompareClick}>Comparer les résultats</button>
      </div>
      <div>
        {errorMessage && <p>{errorMessage}</p>}
        {/* Affichez les résultats de la comparaison ici */}
        {comparisonResults.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Fichier 1</th>
                <th>Fichier 2</th>
                <th>Étape</th>
                <th>Statut Fichier 1</th>
                <th>Statut Fichier 2</th>
              </tr>
            </thead>
            <tbody>
              {comparisonResults.map((result, index) => (
                result.steps.map((step, stepIndex) => (
                  <tr key={`${index}-${stepIndex}`}>
                    <td>{result.fileName1}</td>
                    <td>{result.fileName2}</td>
                    <td>{step.stepName}</td>
                    <td>{step.stepStatus1}</td>
                    <td>{step.stepStatus2}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TestResultsComparison;
