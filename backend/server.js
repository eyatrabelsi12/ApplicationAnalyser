require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});1

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const accessToken = tokenParts[1];

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(403).json({ message: 'Failed to authenticate token' });
      }
    }
    req.user = decoded;
    next();
  });
};

app.post('/automated', verifyToken, async (req, res) => {
  const { scenario, testCases, bugsOnJira, selectedSprint, fauxBugsNumber, suite } = req.body;
  const { user_id, username, role } = req.user;

  try {
      const result = await pool.query(
        'INSERT INTO automated_data (scenario, test_cases, bugs_on_jira, selected_sprint, suite, user_id, username, faux_bugs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [scenario, testCases, bugsOnJira, selectedSprint, suite, user_id, username, fauxBugsNumber]
      );
      const insertedData = result.rows[0];
      res.status(200).json({ success: true, message: 'Data inserted successfully', data: insertedData });
  } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ success: false, message: 'An error occurred while inserting data' });
  }
});

app.post('/insert-data', async (req, res) => {
  try {
    if (!req.body.fileName || !req.body.file || !req.body.buildHash || !req.body.type) {
      throw new Error('Certains champs requis sont manquants dans la requête.');
    }

    const fileName = req.body.fileName;
    const fileData = req.body.file;
    const buildHash = req.body.buildHash;
    const type = req.body.type;

    // Vérifier si le nom de fichier existe déjà dans la table
    const fileExists = await checkFileExists(fileName);

    if (fileExists) {
      res.status(409).json({ alert: `Le fichier ${fileName} est déjà stocké dans la base de données.` });
    } else {
      // Enregistrer le nom du fichier dans la table des fichiers enregistrés
      const fileId = await saveFileNameToDatabase(fileName, buildHash, type);

      // Continuer avec l'enregistrement des données JSON
      await saveDataToDatabase(fileName, fileId, fileData);

      // Calculer les pourcentages
      const percentages = await calculatePercentages(fileId);

      // Renvoyer les pourcentages et le nom de fichier concaténé au front-end
      res.status(200).json({
        message: 'Données JSON enregistrées avec succès',
        successPercentage: percentages.successPercentage,
        failurePercentage: percentages.failurePercentage,
        skippedPercentage: percentages.skippedPercentage,
        pendingPercentage: percentages.pendingPercentage,
        concatenatedFileName: percentages.concatenatedFileName
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des données JSON dans la base de données :', error);
    res.status(500).json({ error: 'Erreur interne du serveur : ' + error.message });
  }
});



app.post('/delete-data', (req, res) => {
  const { suiteNameToDelete } = req.body;
  const query = 'DELETE FROM pipeline_data WHERE suite_name = $1'; // Requête de suppression
  const values = [suiteNameToDelete];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error executing delete query', error);
      res.status(500).json({ success: false, message: 'An error occurred while deleting data.' });
    } else {
      console.log('Data deleted successfully');
      res.status(200).json({ success: true, message: 'Data deleted successfully.' });
    }
  });
});




app.post('/submit-data', (req, res) => {
  const { suiteName, selectedDate } = req.body;
  const query = 'INSERT INTO pipeline_data (suite_name, select_date) VALUES ($1, $2)';
  const values = [suiteName, selectedDate];
  
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ success: false, message: 'An error occurred while saving data.' });
    } else {
      console.log('Data saved successfully');
      res.status(200).json({ success: true, message: 'Data saved successfully.' });
    }
  });
});
// Route pour récupérer les options de suite
app.get('/suite-options', async (req, res) => {
  try {
    // Exécutez la requête SQL pour récupérer les options de suite depuis votre base de données
    const query = 'SELECT suite_name FROM pipeline_data'; // Modifier la requête en fonction de votre schéma de base de données
    const { rows } = await pool.query(query);

    // Extrayez les noms de suite des résultats de la requête
    const suiteOptions = rows.map(row => row.suite_name);

    // Envoyez les options de suite en réponse à la requête
    res.status(200).json(suiteOptions);
  } catch (error) {
    console.error('Error fetching suite options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour supprimer une option de suite
app.delete('/suite-options/:option', async (req, res) => {
  const optionToDelete = req.params.option;

  try {
    // Execute the SQL query to delete the suite option from the database
    const query = 'DELETE FROM pipeline_data WHERE suite_name = $1';
    const values = [optionToDelete];
    const result = await pool.query(query, values);

    // Check if a row was affected, indicating that the option was deleted
    if (result.rowCount === 1) {
      res.status(200).json({ success: true, message: 'Option deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Option not found.' });
    }
  } catch (error) {
    console.error('Error deleting suite option:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//


app.delete('/delete-suite-option/:option', async (req, res) => {
  const optionToDelete = req.params.option;

  try {
      const query = 'DELETE FROM pipeline_data WHERE suite_name = $1';
      const values = [optionToDelete];
      const result = await pool.query(query, values);

      if (result.rowCount > 0) {
          console.log(`Option '${optionToDelete}' deleted successfully`);
          return res.status(200).json({ success: true, message: 'Option deleted successfully.' });
      } else {
          console.log(`Option '${optionToDelete}' not found or already deleted`);
          return res.status(404).json({ success: false, error: 'Option not found or already deleted' });
      }
  } catch (error) {
      console.error('Error deleting suite option:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});









async function calculatePercentages(fileId) {
  try {
    const percentagesQuery = `
      SELECT
        CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed') * 100.0 /
          ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS passed_percentage,
       
        CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed') * 100.0 /
          ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS failed_percentage,
       
        CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped') * 100.0 /
          ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS skipped_percentage,
       
        CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending') * 100.0 /
          ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
           + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS pending_percentage,
        
        (SELECT MAX(nom_fichier_concatiner) FROM scenarios WHERE fichier_Id = $1) AS concatenated_file_name
      FROM scenarios
      WHERE fichier_Id = $1
      GROUP BY fichier_Id
    `;
 
    const percentagesResult = await pool.query(percentagesQuery, [fileId]);
    const { passed_percentage, failed_percentage, skipped_percentage, pending_percentage, concatenated_file_name } = percentagesResult.rows[0];
 
    return {
      successPercentage: passed_percentage,
      failurePercentage: failed_percentage,
      skippedPercentage: skipped_percentage,
      pendingPercentage: pending_percentage,
      concatenatedFileName: concatenated_file_name
    };
  } catch (error) {
    throw new Error(`Erreur lors du calcul des pourcentages : ${error.message}`);
  }
}



async function checkFileExists(fileName) {
    console.log("Nom de fichier:", fileName);
    const client = await pool.connect();
    try {
        const query = 'SELECT COUNT(*) FROM fichier_enregistres WHERE nom_fichier = $1';
        const result = await client.query(query, [fileName]);
        console.log("Résultat de la requête:", result.rows);
        return result.rows[0].count > 0;
    } catch (error) {
        throw new Error(`Erreur lors de la vérification de l'existence du fichier : ${error.message}`);
    } finally {
        client.release();
    }
}



async function saveDataToDatabase(fileName, fileId, fileData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fichierId = fileId;
    const nomFichier = fileName;

    const fichierQuery = 'SELECT Build_hash, type, DATE_TRUNC(\'day\', date_enregistrement) AS date_enregistrement FROM fichier_enregistres WHERE fichier_id = $1';
    const fichierResult = await client.query(fichierQuery, [fichierId]);
    const { build_hash, build_date, type, date_enregistrement } = fichierResult.rows[0];

    // Convertir la date enregistrée en objet Date et ajouter un jour
    const dateEnregistrement = new Date(date_enregistrement);
    dateEnregistrement.setDate(dateEnregistrement.getDate() + 1);

    for (const scenario of fileData) {
      if (!scenario.elements || !Array.isArray(scenario.elements)) {
        continue;
      }
      const scenarioID = scenario.id || "ID non spécifié";

      for (const element of scenario.elements) {
        const scenarioName = element.name;
        const scenarioStatus = element.status;
        const scenarioTags = element.tags.map(tag => tag.name);

        const testQuery = 'INSERT INTO Tests (TestName, fichier_id) VALUES ($1, $2) RETURNING TestID';
        const testRows = await client.query(testQuery, [scenarioName, fileId]);

        if (testRows.rows.length === 0 || !testRows.rows[0].testid) {
          throw new Error("Erreur lors de l'insertion des données: Impossible de récupérer l'ID du test");
        }

        const testID = testRows.rows[0].testid;

        const featureQuery = 'INSERT INTO Features (FeatureName, Description, URI, Line, TestID) VALUES ($1, $2, $3, $4, $5) RETURNING FeatureID, FeatureName';
        const featureRows = await client.query(featureQuery, [scenarioID, scenario.description || '', scenario.uri || '', scenario.line || null, testID]);

        if (featureRows.rows.length === 0 || !featureRows.rows[0].featureid) {
          throw new Error("Erreur lors de l'insertion des données: Impossible de récupérer l'ID de la fonctionnalité");
        }

        const featureID = featureRows.rows[0].featureid;
        const featureName = featureRows.rows[0].featurename;

        const tagsQuery = 'INSERT INTO TagsNames (TestID, name_1, name_2, name_3, name_4, name_5, name_6) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await client.query(tagsQuery, [testID, scenarioTags[0] || null, scenarioTags[1] || null, scenarioTags[2] || null, scenarioTags[3] || null, scenarioTags[4] || null, scenarioTags[5] || null]);

        const tagIDQuery = 'SELECT TagID FROM TagsNames WHERE TestID = $1';
        const tagIDResult = await client.query(tagIDQuery, [testID]);
        const tagID = tagIDResult.rows[0].tagid;

        for (const step of element.steps) {
          const { keyword, name, result, embeddings } = step;
          const { status, duration, error_message } = result || { status: null, duration: null, error_message: null };

          let stepID = null;

          if (status !== null) {
            const scenarioStepsQuery = 'INSERT INTO Steps (TestID, StepKeyword, StepName, StepStatus, duration, error_message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING StepID';
            const stepRows = await client.query(scenarioStepsQuery, [testID, keyword, name, status, duration, error_message]);
            stepID = stepRows.rows[0].stepid;
          }

          if (Array.isArray(embeddings)) {
            let textDate = null;
            let imageData = null;
            let mimeTypes = [];

            for (const embedding of embeddings) {
              const { data, mime_type } = embedding;
              mimeTypes.push(mime_type);

              if (mime_type === 'text/plain') {
                textDate = data;
              } else if (mime_type === 'image/png') {
                imageData = data;
              }
            }

            const embeddingInsertQuery = 'INSERT INTO Embeddings (StepID, Mime_Type, TextDate, ImageData) VALUES ($1, $2, $3, $4) RETURNING EmbeddingID';
            const embeddingInsertResult = await client.query(embeddingInsertQuery, [stepID, mimeTypes.join(', '), textDate, imageData]);
            const embeddingID = embeddingInsertResult.rows[0].embeddingid;

            const scenariosQuery = 'INSERT INTO scenarios (TestID, TestName, StepID, StepKeyword, StepName, StepStatus, TagID, name_1, name_2, name_3, name_4, name_5, name_6, EmbeddingID, Mime_Type, duration, fichier_id, nom_fichier, TextDate, ImageData, FeatureID, FeatureName, Build_hash, date_enregistrement, type, nom_fichier_concatiner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING nom_fichier_concatiner';
            const scenariosResult = await client.query(scenariosQuery, [
              testID,
              scenarioName,
              stepID,
              keyword,
              name,
              status,
              tagID,
              scenarioTags[0],
              scenarioTags[1],
              scenarioTags[2],
              scenarioTags[3],
              scenarioTags[4],
              scenarioTags[5],
              embeddingID,
              mimeTypes.join(', '),
              duration,
              fichierId,
              nomFichier,
              textDate,
              imageData,
              featureID,
              featureName,
              build_hash,
              dateEnregistrement, // Utilisation de la date ajustée
              type,
              `${type}_${
                scenarioTags.includes('@WEB-UI') ? 'WEB-UI' :
                scenarioTags.includes('@Data_Management') ? 'Data_Management' :
                scenarioTags.includes('@REST') ? 'REST' :
                scenarioTags.includes('@Navigation') ? 'Navigation' :
                (scenarioTags.some(tag => ['@Data_Management','@WEB-UI', '@REST', '@Navigation'].includes(tag)) ? scenarioTags.find(tag => ['@Data_Management','@WEB-UI', '@REST', '@Navigation'].includes(tag)).replace('@', '') : null)
              }_${dateEnregistrement.toISOString().slice(0,10).split('-').reverse().join('-')}_${build_hash}.json`
            ]);

            const nomFichierConcatiner = scenariosResult.rows[0].nom_fichier_concatiner;

            const updateFichierQuery = 'UPDATE fichier_enregistres SET nom_fichier_concatiner = $1 WHERE fichier_id = $2';
            await client.query(updateFichierQuery, [nomFichierConcatiner, fichierId]);
          } else {
            const embeddingInsertQuery = 'INSERT INTO Embeddings (StepID, Mime_Type, TextDate, ImageData) VALUES ($1, $2, $3, $4) RETURNING EmbeddingID';
            const embeddingInsertResult = await client.query(embeddingInsertQuery, [stepID, null, null, null]);
            const embeddingID = embeddingInsertResult.rows[0].embeddingid;

            const scenariosQuery = 'INSERT INTO scenarios (TestID, TestName, StepID, StepKeyword, StepName, StepStatus, TagID, name_1, name_2, name_3, name_4, name_5, name_6, EmbeddingID, Mime_Type, duration, fichier_id, nom_fichier, TextDate, ImageData, FeatureID, FeatureName, Build_hash,date_enregistrement, type, nom_fichier_concatiner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING nom_fichier_concatiner';
            const scenariosResult = await client.query(scenariosQuery, [
              testID,
              scenarioName,
              stepID,
              keyword,
              name,
              status,
              tagID,
              scenarioTags[0],
              scenarioTags[1],
              scenarioTags[2],
              scenarioTags[3],
              scenarioTags[4],
              scenarioTags[5],
              null,
              null,
              duration,
              fichierId,
              nomFichier,
              null,
              null,
              featureID,
              featureName,
              build_hash,
              dateEnregistrement, // Utilisation de la date ajustée
              type,
              `${type}_${
                scenarioTags.includes('@WEB-UI') ? 'WEB-UI' :
                scenarioTags.includes('@Data_Management') ? 'Data_Management' :
                scenarioTags.includes('@REST') ? 'REST' :
                scenarioTags.includes('@Navigation') ? 'Navigation' :
                (scenarioTags.some(tag => ['@Data_Management','@WEB-UI', '@REST', '@Navigation'].includes(tag)) ? scenarioTags.find(tag => ['@Data_Management','@WEB-UI', '@REST', '@Navigation'].includes(tag)).replace('@', '') : null)
              }_${dateEnregistrement.toISOString().slice(0,10).split('-').reverse().join('-')}_${build_hash}.json`
            ]);

            const nomFichierConcatiner = scenariosResult.rows[0].nom_fichier_concatiner;

            const updateFichierQuery = 'UPDATE fichier_enregistres SET nom_fichier_concatiner = $1 WHERE fichier_id = $2';
            await client.query(updateFichierQuery, [nomFichierConcatiner, fichierId]);
          }
        }
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Erreur lors de l'enregistrement des données dans la base de données : ${error.message}`);
  } finally {
    client.release();
  }
}


async function saveFileNameToDatabase(fileName, buildHash, type) {
  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      const query = 'INSERT INTO fichier_enregistres (nom_fichier, build_hash, type) VALUES ($1, $2, $3) RETURNING fichier_id';
      const result = await client.query(query, [fileName, buildHash, type]);
      const fileId = result.rows[0].fichier_id;

      const updateQuery = `
      UPDATE fichier_enregistres
      SET nom_fichier_concatiner = (
          SELECT s.nom_fichier_concatiner
          FROM scenarios s
          WHERE s.fichier_id = fichier_enregistres.fichier_id
          LIMIT 1
      )
      WHERE EXISTS (
          SELECT 1
          FROM scenarios s
          WHERE s.fichier_id = fichier_enregistres.fichier_id
      );
      `;
      await client.query(updateQuery, [fileId]);

      await client.query('COMMIT');

      return fileId;
  } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Erreur lors de l'enregistrement du nom de fichier dans la base de données : ${error.message}`);
  } finally {
      client.release();
  }
}



async function saveFileNameToDatabase(fileName, buildHash, type) {
  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      // Insérer dans la table fichier_enregistres
      const query = 'INSERT INTO fichier_enregistres (nom_fichier, build_hash, type) VALUES ($1, $2, $3) RETURNING fichier_id';
      const result = await client.query(query, [fileName, buildHash, type]);
      const fileId = result.rows[0].fichier_id;

      // Mettre à jour nom_fichier_concatiner en utilisant les données de la table scenarios
      const updateQuery = `
          UPDATE fichier_enregistres
          SET nom_fichier_concatiner = (
              SELECT s.nom_fichier_concatiner
              FROM scenarios s
              WHERE s.fichier_id = fichier_enregistres.fichier_id
              LIMIT 1
          )
          WHERE EXISTS (
              SELECT 1
              FROM scenarios s
              WHERE s.fichier_id = fichier_enregistres.fichier_id
          );
      `;
      await client.query(updateQuery, []);

      await client.query('COMMIT');

      return fileId;
  } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Erreur lors de l'enregistrement du nom de fichier dans la base de données : ${error.message}`);
  } finally {
      client.release();
  }
}


 



// Fonction pour obtenir le nom de fichier concaténé
function generateConcatenatedFileName(type, name_2, name_3, build_hash, date_enregistrement) {
  let name = null;

  // Vérification de name_2
  if (name_2 && ['@WEB-UI', '@Data_Management', '@REST', '@Navigation'].includes(name_2)) {
      name = name_2.replace('@', '');
  }

  // Si name_2 ne contient pas de valeur valide, vérification de name_3
  if (!name && name_3 && ['@WEB-UI', '@Data_Management', '@REST', '@Navigation'].includes(name_3)) {
      name = name_3.replace('@', '');
  }

  // Si aucun des deux n'a une valeur valide, utiliser une valeur par défaut
  if (!name) {
      name = 'Default'; // Ou toute autre valeur par défaut que vous souhaitez utiliser
  }

  // Formater la date
  const formattedDate = new Date(date_enregistrement).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  }).replace(/\//g, '-');

  // Construire le nom de fichier concaténé
  const concatenatedFileName = `${type}_${name}_${formattedDate}_${build_hash}.json`;

  return concatenatedFileName;
}







// Fonction pour obtenir le nom de fichier concaténé
function generateConcatenatedFileName(type, name, build_hash, date_enregistrement, nomFichier) {
  let concatenatedFileName = `${type}_`;

  switch (name) {
      case '@WEB-UI':
          concatenatedFileName += 'WEB-UI ';
          break;
      case '@Data_Management':
          concatenatedFileName += 'Data_Management ';
          break;
      case '@REST':
          concatenatedFileName += 'REST ';
          break;
      case '@Navigation':
          concatenatedFileName += 'Navigation ';
          break;
      default:
          if (['@Data_Management', '@WEB-UI', '@REST', '@Navigation'].includes(name)) {
              concatenatedFileName += name.replace('@', '') + ' ';
          }
  }

  // Formater la date
  const formattedDate = new Date(date_enregistrement).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  }).replace(/\//g, '-');

  concatenatedFileName += `_${formattedDate}_${build_hash}.json`;

  return concatenatedFileName;
}









 




const formatFileName = (originalFileName) => {
  // Séparez le nom de fichier en différentes parties en utilisant "_" comme délimiteur
  const parts = originalFileName.split('_');

  // Assurez-vous qu'il y a au moins quatre parties (type, nom_2 ou nom_3, textdate, build_hash)
  if (parts.length < 4) {
      return null; // Retourne null si le nom de fichier n'est pas dans le format attendu
  }

  // Récupérez les parties nécessaires
  const type = parts.shift(); // Récupérez et supprimez le premier élément du tableau (type)
  const name = parts.shift(); // Récupérez et supprimez le deuxième élément du tableau (nom_2 ou nom_3)
  const textdate = parts.shift(); // Récupérez et supprimez le troisième élément du tableau (textdate)
  const build_hash = parts.join('_'); // Le reste est le hachage de construction

  // Reformatez-les dans le style requis et incluez .json à la fin
  return `${type}_${name}_${textdate}_${build_hash}.json`;
};

  app.post('/summary', async (req, res) => {
    try {
        const { nom_fichier } = req.body;
 
        // Récupérer le fichier_id associé au nom du fichier
        const fileIdQuery = 'SELECT fichier_id FROM fichier_enregistres WHERE nom_fichier_concatiner = $1';
        const fileIdResult = await pool.query(fileIdQuery, [nom_fichier]);
        const formattedFileName = formatFileName(nom_fichier);
 
        // Vérifier si la requête a retourné des résultats
        if (fileIdResult.rows.length === 0) {
            return res.status(404).json({ error: "Ce rapport n'existe pas dans la base" });
        }
 
        const fileId = fileIdResult.rows[0].fichier_id;
 
        const totalTestNamesQuery = `
            SELECT COUNT(DISTINCT testname) AS total_testnames
            FROM scenarios
            WHERE fichier_Id = $1
        `;
        const totalTestNamesResult = await pool.query(totalTestNamesQuery, [fileId]);
        const totalTestNames = totalTestNamesResult.rows[0].total_testnames;
 
        const totalPassedQuery = `
        SELECT COUNT(DISTINCT testname) AS total_testnames
        FROM scenarios
        WHERE fichier_Id = $1 and stepstatus='passed'
    `;
    const totalfailedQuery = `
    SELECT COUNT(DISTINCT testname) AS total_testnames
    FROM scenarios
    WHERE fichier_Id = $1 and stepstatus='failed'
`;
const totalskippedQuery = `
SELECT COUNT(DISTINCT testname) AS total_testnames
FROM scenarios
WHERE fichier_Id = $1 and stepstatus='skipped'
`;
const totalpendingQuery = `
SELECT COUNT(DISTINCT testname) AS total_testnames
FROM scenarios
WHERE fichier_Id = $1 and stepstatus='pending'
`;
        // Requête pour récupérer la première date valide dans le texte
        const textdateQuery = `
            SELECT
                textdate
            FROM
                scenarios
            WHERE
                fichier_Id = $1
                AND textdate IS NOT NULL
                AND textdate ~* '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z'
            ORDER BY
                textdate
            LIMIT 1
        `;
 
        const textdateResult = await pool.query(textdateQuery, [fileId]);
        let textdate = null;
 
        if (textdateResult.rows.length > 0) {
            textdate = textdateResult.rows[0].textdate;
        }
 
        // Récupérer les statistiques pour le fichier_id donné
        // Récupérer les statistiques pour le fichier_id donné
        const summaryQuery = `
        SELECT
        CASE
            WHEN name_3 = '@WEB-UI' THEN 'WEB-UI Automated Tests'
            WHEN name_3 = '@Data_Management' THEN 'Data_Management Automated Tests'
            WHEN name_3 = '@REST' THEN 'REST Automated Tests'
            WHEN name_3 = '@Navigation' THEN 'Navigation Automated Tests'
            WHEN name_2 IN ('@Data_Management','@WEB-UI', '@REST', '@Navigation') THEN REPLACE(name_2, '@', '') || '-Automated Tests'
            ELSE NULL -- Dans le cas où aucun des cas ci-dessus n'est vérifié
        END AS tag,
       
        (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed') AS total_passed,
        (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed') AS total_failed,
        (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped') AS total_skipped,
        (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending') AS total_pending,
        ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')) AS total_steps,
        (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1) AS total_testname,
        $2 AS first_textdate,
        (SELECT type FROM scenarios WHERE fichier_Id = $1 AND textdate IS NOT NULL ORDER BY textdate LIMIT 1) AS first_type,
        (SELECT Build_hash FROM scenarios WHERE fichier_Id = $1 LIMIT 1) AS build_hash, -- Ajout de Build_hash
        CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed') * 100.0 /
            ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
             + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
             + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
             + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS passed_percentage,
       
       
    CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed') * 100.0 /
        ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS failed_percentage,
       
    CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped') * 100.0 /
        ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS skipped_percentage,
       
    CONCAT(FORMAT('%s', ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending') * 100.0 /
        ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'passed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'failed')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'skipped')
         + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = $1 AND stepstatus = 'pending')))), 'N', 'C', '%') AS pending_percentage
   
   
    FROM
        scenarios
    WHERE
        fichier_Id = $1
        AND (name_3 IN ('@WEB-UI','@Data_Management', '@REST', '@Navigation') OR name_2 IN ('@WEB-UI','@Data_Management', '@REST', '@Navigation'))
    GROUP BY
        tag
    ORDER BY
        tag
    LIMIT 1;
   
   
   
 
   
       
`;
 
 
        const summaryResult = await pool.query(summaryQuery, [fileId, textdate]);
        let summary = summaryResult.rows[0]; // On suppose qu'il n'y a qu'une seule ligne de résultats
 
        // Modifier les valeurs de tag
        if (summary.tag === '@WEB-UI') {
            summary.tag = 'WEB-UI Automated Tests';
        } else if (summary.tag === '@Data_Management' || summary.tag === '@REST' || summary.tag === '@Navigation') {
            summary.tag = summary.tag.replace('@', '') + ' Automated Tests';
        }
     
       
        const percentages = {
            passed: parseFloat((summary.total_passed / summary.total_steps * 100).toFixed(2)),
            failed: parseFloat((summary.total_failed / summary.total_steps * 100).toFixed(2)),
            skipped: parseFloat((summary.total_skipped / summary.total_steps * 100).toFixed(2)),
            pending: parseFloat((summary.total_pending / summary.total_steps * 100).toFixed(2))
        };
       
 
        // Récupérer les statistiques pour le fichier_id donné
        const featureSummaryQuery = `
            SELECT
                COUNT(DISTINCT CASE WHEN stepstatus = 'passed' THEN featurename END) AS total_passed,
                COUNT(DISTINCT CASE WHEN stepstatus = 'failed' THEN featurename END) AS total_failed
            FROM
                scenarios
            WHERE
                fichier_Id = $1
        `;
 
        const featureSummaryResult = await pool.query(featureSummaryQuery, [fileId]);
        const featureSummary = featureSummaryResult.rows;
 
        console.log('Feature Summary:', featureSummary); // Ajoutez ce log pour vérifier si featureSummary est correctement récupéré
 
        res.json({ summary, percentages, featureSummary });
    } catch (error) {
        console.error('Error retrieving summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/lastfiles', async (req, res) => {
  try {
      const lastFilesQuery = `
          SELECT nom_fichier_concatiner
          FROM fichier_enregistres
          ORDER BY date_enregistrement DESC
          LIMIT 10;
      `;
      const lastFilesResult = await pool.query(lastFilesQuery);
      const lastFiles = lastFilesResult.rows.map(file => file.nom_fichier_concatiner);
      res.json(lastFiles);
  } catch (error) {
      console.error('Error retrieving last files:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


 // Endpoint pour obtenir les FeatureName distinctes de deux fichiers
app.get('/features/distinct', async (req, res) => {
    const { file1, file2 } = req.query;
    try {
      const features = await getDistinctFeatureNames(file1, file2);
      res.json(features);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur interne du serveur');
    }
  });
  
  // Endpoint pour obtenir les TestName pour une FeatureName spécifique
  app.get('/tests/by-feature', async (req, res) => {
    const { featureName, fileName1, fileName2 } = req.query;
    try {
      const testNames = await getTestNamesForFeature(featureName, fileName1, fileName2);
      res.json(testNames);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur interne du serveur');
    }
  });
  
  
  async function getDistinctFeatureNames(fileName1, fileName2) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT DISTINCT f.FeatureName, s.name_1
        FROM Features f
        INNER JOIN Scenarios s ON f.TestID = s.TestID
        LEFT JOIN TagsNames tn ON f.TestID = tn.TestID
        WHERE s.nom_fichier_concatiner IN ($1, $2)
      `;
      
      const sqlQuery = `
        SELECT DISTINCT
          s1.name_1,
          s1.StepStatus AS StepStatusFile1,
          s2.StepStatus AS StepStatusFile2
        FROM
          scenarios s1
        INNER JOIN
          scenarios s2 ON s1.name_1 = s2.name_1
        WHERE
          s1.nom_fichier_concatiner=$1 AND s2.nom_fichier_concatiner=$2 
          AND (
            (s1.StepStatus = 'passed' AND s2.StepStatus = 'passed')
            OR (s1.StepStatus = 'passed' AND s2.StepStatus = 'failed')
            OR (s1.StepStatus = 'failed' AND s2.StepStatus = 'passed')
            OR (s1.StepStatus = 'failed' AND s2.StepStatus = 'failed')
          )
      `;
      
      const CountQuery = `
        SELECT
          s.featurename,
          s.nom_fichier_concatiner,
          COUNT(DISTINCT CASE WHEN s.stepstatus = 'passed' THEN s.featurename END) AS total_passed,
          COUNT(DISTINCT CASE WHEN s.stepstatus = 'failed' THEN s.featurename END) AS total_failed,
          COUNT(DISTINCT CASE WHEN s.stepstatus = 'skipped' THEN s.featurename END) AS total_skipped,
          COUNT(DISTINCT CASE WHEN s.stepstatus = 'pending' THEN s.featurename END) AS total_pending
        FROM
          scenarios s
        WHERE
          s.nom_fichier_concatiner IN ($1, $2)
        GROUP BY
          s.featurename, s.nom_fichier_concatiner;
      `;
  
      const resultCount = await client.query(CountQuery, [fileName1, fileName2]);
      const featureCounts = resultCount.rows.reduce((acc, row) => {
        const featureName = row.featurename;
        acc[featureName] = {
          file1: row.total_passed + row.total_failed + row.total_skipped + row.total_pending,
          file2: row.total_passed + row.total_failed + row.total_skipped + row.total_pending
        };
        return acc;
      }, {});
      
      const result = await client.query(query, [fileName1, fileName2]);
      const distinctFeatureNames = result.rows.map(row => ({
        FeatureName: row.featurename,
        name_1: row.name_1
      }));
      
      const statusResult = await client.query(sqlQuery, [fileName1, fileName2]);
      const mergedResults = distinctFeatureNames.map(feature => {
        const status = statusResult.rows.find(row => row.name_1 === feature.name_1);
        const counts = featureCounts[feature.FeatureName] || { file1: 0, file2: 0 };
        return {
          ...feature,
          StepStatusFile1: status ? status.stepstatusfile1 : null,
          StepStatusFile2: status ? status.stepstatusfile2 : null,
          countsFile1: counts.file1,
          countsFile2: counts.file2
        };
      });
      
      return mergedResults;
    } finally {
      client.release();
    }
  }

    
async function getTestNamesForFeature(featureName, file1, file2) {
  const client = await pool.connect();
  try {
    const query = `
    WITH StepStatus AS (
      SELECT
          tn.TestID,
          fe.nom_fichier_concatiner,
          fe.type,
          CASE
              WHEN 'failed' IN (
                  SELECT s.StepStatus
                  FROM Steps s
                  WHERE s.TestID = tn.TestID
              ) THEN 'failed'
              WHEN EXISTS (
                  SELECT 1
                  FROM Steps s
                  WHERE s.TestID = tn.TestID
                    AND s.StepStatus = 'pending'
              ) THEN 'pending'
              WHEN 'skipped' IN (
                  SELECT s.StepStatus
                  FROM Steps s
                  WHERE s.TestID = tn.TestID
              ) THEN
                  CASE
                      WHEN EXISTS (
                          SELECT 1
                          FROM Steps sp
                          WHERE sp.TestID = tn.TestID
                            AND sp.StepStatus = 'pending'
                      ) THEN 'pending'
                      ELSE 'skipped'
                  END
              ELSE 'passed'
          END AS StepStatus
      FROM
          TagsNames tn
      INNER JOIN
          Tests t ON tn.TestID = t.TestID
      INNER JOIN
          fichier_enregistres fe ON t.fichier_id = fe.fichier_id
  )
  SELECT
      f.FeatureName,
      ARRAY_AGG(
          CASE
              WHEN tag.name_3 LIKE '@DHRD-%' THEN tag.name_3
              WHEN tag.name_4 LIKE '@DHRD-%' THEN tag.name_4
          END
      ) AS TestNames,
      ARRAY_AGG(t.TestName) AS TestName,
      MAX(CASE WHEN fe.nom_fichier_concatiner = $2 THEN ss.StepStatus END) AS StepStatusFile1,
      MAX(CASE WHEN fe.nom_fichier_concatiner = $3 THEN ss.StepStatus END) AS StepStatusFile2,
      (SELECT fe.type FROM fichier_enregistres fe WHERE fe.nom_fichier_concatiner = $2) AS FileTypeFile1,
      (SELECT fe.type FROM fichier_enregistres fe WHERE fe.nom_fichier_concatiner = $3) AS FileTypeFile2,
      (SELECT textdate FROM scenarios WHERE fichier_id = (SELECT fichier_id FROM fichier_enregistres WHERE nom_fichier_concatiner = $2) AND textdate IS NOT NULL AND textdate ~* '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z' ORDER BY textdate LIMIT 1) AS DateFile1,
      (SELECT textdate FROM scenarios WHERE fichier_id = (SELECT fichier_id FROM fichier_enregistres WHERE nom_fichier_concatiner = $3) AND textdate IS NOT NULL AND textdate ~* '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z' ORDER BY textdate LIMIT 1) AS DateFile2
  FROM
      Features f
  INNER JOIN
      Tests t ON f.TestID = t.TestID
  INNER JOIN
      TagsNames tag ON t.TestID = tag.TestID
  INNER JOIN
      fichier_enregistres fe ON fe.fichier_id = t.fichier_id
  INNER JOIN
      StepStatus ss ON ss.TestID = t.TestID
  WHERE
      f.FeatureName = $1 AND fe.nom_fichier_concatiner IN ($2, $3)
  GROUP BY
      f.FeatureName, t.TestName;
 
`;
 
 
      const result = await client.query(query, [featureName, file1, file2]);
      return result.rows.map(row => ({
          featureName: row.featurename,
          testNames: row.testnames.filter(name => name), // Filtrer les noms null
          testName: row.testname.filter(name => name), // Filtrer les noms null
          stepStatusFile1: row.stepstatusfile1,
          stepStatusFile2: row.stepstatusfile2,
          fileTypeFile1: row.filetypefile1,
          fileTypeFile2: row.filetypefile2,
          dateFile1: convertDate(row.datefile1),
          dateFile2: convertDate(row.datefile2)
      }));
  } finally {
      client.release();
  }
}
 
  
// Fonction de conversion de date avec suppression des secondes et des millisecondes
function convertDate(dateString) {
  const date = new Date(dateString);
 
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
 
  const formattedDate = `${year}${month}${day}-00${hours}${minutes}`;
  return formattedDate;
}




app.get('/file-info', async (req, res) => {
  const { fileName1, fileName2 } = req.query;
  try {
      console.log("Noms de fichiers reçus :", fileName1, fileName2);
 
       // Affichage des noms de fichiers dans la console côté serveur

      // Appel de la fonction pour obtenir les informations sur les fichiers
      const fileInfo = await getFileInfo(fileName1, fileName2);

      // Affichage des informations sur les fichiers dans la console côté serveur
      console.log("Informations sur le fichier 1 :", fileInfo[0]); // Affichage des informations pour le premier fichier
      console.log("Informations sur le fichier 2 :", fileInfo[1]); // Affichage des informations pour le deuxième fichier

      // Renvoi des informations sur les fichiers au client
      res.json(fileInfo);
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur interne du serveur');
  }
});
// Côté serveur



app.get('/automated', async (req, res) => {
  try {
    // Exécutez une requête SQL SELECT pour récupérer toutes les données de la table automated_data
    const result = await pool.query('SELECT * FROM automated_data');
    const data = result.rows; // Récupérez les données récupérées depuis la base de données
    res.status(200).json(data); // Renvoyer les données au format JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching data' });
  }
});


app.get('/data', async (req, res) => {
  try {
    let suiteFilter = '';
    const { suite } = req.query;
 
    // Vérifiez si le paramètre suite est fourni dans la requête
    if (suite) {
      suiteFilter = `WHERE suite = '${suite}'`;
    }
 
    let query = `SELECT scenario, test_cases, bugs_on_jira, selected_sprint
                 FROM automated_data
                 ${suiteFilter}`;
 
    // Si l'utilisateur a sélectionné "6 mois", récupérez les données des 12 derniers sprints
    if (req.query.period === '6months') {
      query += ` ORDER BY created_at DESC
                 LIMIT 12`;
    }
    // Si l'utilisateur a sélectionné "1 an", récupérez les données des 24 derniers sprints
    else if (req.query.period === '1year') {
      query += ` ORDER BY created_at DESC
                 LIMIT 24`;
    }
 
    const result = await pool.query(query);
 
    // Récupération des données de la base de données
    const data = result.rows.map(row => ({
      scenario: row.scenario,
      test_cases: row.test_cases,
      bugs_on_jira: row.bugs_on_jira,
      selected_sprint: row.selected_sprint
    }));
 
    // Afficher les données dans la console
    console.log('Data:', data);
 
    // Envoi des données au client
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});
// Route pour la modification des données
app.delete('/automated/:id', async (req, res) => {
  const id = req.params.id;
  try {
      // Exécutez une requête SQL DELETE pour supprimer l'entrée correspondante de la table automated_data
      await pool.query('DELETE FROM automated_data WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).json({ success: false, message: 'An error occurred while deleting data' });
  }
});



app.put('/automated/:id', async (req, res) => {
  const { id } = req.params;
  const { bugs_on_jira, faux_bugs } = req.body;
  try {
    // Exécutez une requête SQL UPDATE pour mettre à jour les données dans la base de données
    await pool.query(
      'UPDATE automated_data SET bugs_on_jira = $1, faux_bugs = $2 WHERE id = $3',
      [bugs_on_jira, faux_bugs, id]
    );

    res.status(200).json({ success: true, message: 'Données mises à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la mise à jour des données' });
  }
});





app.get('/data', async (req, res) => {
  try {
    let query = `SELECT scenario, test_cases, bugs_on_jira, selected_sprint
                 FROM automated_data`;

    // Si l'utilisateur a sélectionné "6 mois", récupérez les données des 12 derniers sprints
    if (req.query.period === '6months') {
      query += ` ORDER BY created_at DESC
                 LIMIT 12`;
    } 
    // Si l'utilisateur a sélectionné "1 an", récupérez les données des 24 derniers sprints
    else if (req.query.period === '1year') {
      query += ` ORDER BY created_at DESC
                 LIMIT 24`;
    } 
   

    const result = await pool.query(query);

    // Récupération des données de la base de données
    const data = result.rows.map(row => ({
      scenario: row.scenario,
      test_cases: row.test_cases,
      bugs_on_jira: row.bugs_on_jira,
      selected_sprint: row.selected_sprint
    }));

    // Afficher les données dans la console
    console.log('Data:', data);

    // Envoi des données au client
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});


async function getFileInfo(fileName1, fileName2) {
  const client = await pool.connect();
  try {
      const fileInfoQuery = `
      SELECT DISTINCT
      fichier_Id,
      nom_fichier_concatiner,
      CONCAT(first_type.type, ' ') AS type,
      CASE
          WHEN first_type.name_3 = '@WEB-UI' THEN 'WEB-UI Automated Tests'
          WHEN first_type.name_3 = '@Data_Management' THEN 'Data_Management Automated Tests'
          WHEN first_type.name_3 = '@REST' THEN 'REST Automated Tests'
          WHEN first_type.name_3 = '@Navigation' THEN 'Navigation Automated Tests'
          WHEN first_type.name_2 IN ('@Data_Management','@WEB-UI', '@REST', '@Navigation') THEN REPLACE(first_type.name_2, '@', '') || '-Automated Tests'
          ELSE NULL
      END AS tag,
      (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id) AS total_testnames,
      (SELECT MIN(textdate) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND textdate LIKE '____-__-__T__:__:__.___Z') AS first_textdate,
      (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed') AS total_passed,
      (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed') AS total_failed,
      (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped') AS total_skipped,
      (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending') AS total_pending,
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending')) AS total_steps,
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed') * 100.0 /
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending'))) AS passed_percentage,
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed') * 100.0 /
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending'))) AS failed_percentage,
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped') * 100.0 /
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending'))) AS skipped_percentage,
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending') * 100.0 /
      ((SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'passed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'failed')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'skipped')
      + (SELECT COUNT(DISTINCT testname) FROM scenarios WHERE fichier_Id = first_type.fichier_Id AND stepstatus = 'pending'))) AS pending_percentage,
      (SELECT Build_hash FROM scenarios WHERE fichier_Id = first_type.fichier_Id LIMIT 1) AS build_hash -- Ajout de Build_hash
  FROM (
      SELECT
          fichier_Id,
          nom_fichier_concatiner,
          type,
          name_2,
          name_3,
          ROW_NUMBER() OVER(PARTITION BY nom_fichier_concatiner, fichier_Id ORDER BY TestID) AS rn
      FROM scenarios
      WHERE nom_fichier_concatiner IN ($1, $2)
  ) AS first_type
  WHERE first_type.rn = 1;
 
      `;

      const result = await client.query(fileInfoQuery, [fileName1, fileName2]);
      return result.rows.map(row => ({
          fichier_Id: row.fichier_id,
          nom_fichier_concatiner: row.nom_fichier_concatiner,
          type: row.type,
          tag: row.tag,
          total_testnames: row.total_testnames,
          first_textdate: row.first_textdate,
          total_steps: row.total_steps,
          total_passed: row.total_passed,
          total_failed: row.total_failed,
          total_pending: row.total_pending,
          total_skipped: row.total_skipped,
          passed_percentage: row.passed_percentage+ '%',
          failed_percentage: row.failed_percentage+ '%',
          skipped_percentage: row.skipped_percentage+ '%',
          pending_percentage: row.pending_percentage+ '%',
          build_hash:row.build_hash,
      }));
  } finally {
      client.release();
  }
}
app.get('/stepstatus-data', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Début de la transaction
   
      const lastFileQuery = `
        SELECT fichier_id
        FROM fichier_enregistres
        ORDER BY fichier_id DESC
        LIMIT 1
      `;
      const lastFileResult = await client.query(lastFileQuery);
   
      if (lastFileResult.rows.length === 0) {
        await client.query('ROLLBACK'); // Annulation de la transaction
        console.log('Aucun fichier enregistré trouvé.');
        return res.status(404).json({ error: 'Aucun fichier enregistré trouvé.' });
      }
   
      const latestFileId = lastFileResult.rows[0].fichier_id;
   
      const stepStatusQuery = `
        SELECT
          s.StepStatus,
          COUNT(DISTINCT scenarios.TestName) AS count,
          CASE
            WHEN SUM(COUNT(DISTINCT scenarios.TestName)) OVER () = 0 THEN '0%'
            ELSE CONCAT(FORMAT('%s', (COUNT(DISTINCT scenarios.TestName) * 100.0 / SUM(COUNT(DISTINCT scenarios.TestName)) OVER ()), 'N', 'C'), '%')
          END AS percentage
        FROM
          (SELECT DISTINCT StepStatus FROM scenarios) s
        LEFT JOIN
          scenarios ON scenarios.StepStatus = s.StepStatus AND scenarios.fichier_id = $1
        GROUP BY
          s.StepStatus
      `;
   
      const stepStatusResult = await client.query(stepStatusQuery, [latestFileId]);
      console.log("Step Status Result:", stepStatusResult.rows);
   
      const textDateQuery = `
        SELECT
          textdate
        FROM
          scenarios
        WHERE
          fichier_Id = $1
          AND textdate IS NOT NULL
          AND textdate ~* '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z'
        ORDER BY
          textdate
        LIMIT 1
      `;
      const textDateResult = await client.query(textDateQuery, [latestFileId]);
      const firstTextDate = textDateResult.rows.length > 0 ? textDateResult.rows[0].textdate : null;
      console.log("First Text Date:", firstTextDate);
      const firstScenarioTypeQuery = `
        SELECT DISTINCT type
        FROM scenarios
        WHERE fichier_id = $1
        ORDER BY type
        LIMIT 1
      `;
      const firstScenarioTypeResult = await client.query(firstScenarioTypeQuery, [latestFileId]);
      const firstScenarioType = firstScenarioTypeResult.rows.length > 0 ? firstScenarioTypeResult.rows[0].type : null;
      console.log("First Scenario Type:", firstScenarioType);
   
      // Ajoutez cette partie juste avant await client.query('COMMIT');
      const firstTagNameQuery = `
        SELECT COALESCE(name_2, name_3) AS first_tag
        FROM scenarios
        WHERE fichier_id = $1
            AND (name_2 IN ('@WEB-UI', '@Data_Management', '@REST', '@Navigation') OR name_3 IN ('@WEB-UI', '@Data_Management', '@REST', '@Navigation'))
        ORDER BY
            CASE
                WHEN name_2 IN ('@WEB-UI', '@Data_Management', '@REST', '@Navigation') THEN 1
                WHEN name_3 IN ('@WEB-UI', '@Data_Management', '@REST', '@Navigation') THEN 2
                ELSE 3
            END
        LIMIT 1
      `;
   
      const firstTagNameResult = await client.query(firstTagNameQuery, [latestFileId]);
      const firstTagName = firstTagNameResult.rows.length > 0 ? firstTagNameResult.rows[0].first_tag : null;
      console.log("First Tag Name:", firstTagName);
   
      await client.query('COMMIT'); // Validation de la transaction
   
      const responseData = stepStatusResult.rows.map(row => ({
        StepStatus: row.stepstatus,
        Percentage: row.percentage,
        firstTextDate: firstTextDate,
        FirstScenarioType: firstScenarioType,
        FirstTagName: firstTagName
      }));
      console.log("Response Data:", responseData);
   
      res.status(200).json(responseData);
    } catch (error) {
      await client.query('ROLLBACK'); // Annulation de la transaction en cas d'erreur
      console.error('Erreur lors de la récupération des données de stepstatus :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données de stepstatus. Veuillez réessayer.' });
    } finally {
      client.release(); // Libération du client
    }
  });
app.get('/stepstatus-data-combined', async (req, res) => {
  try {
      let fileAndNameCondition = `
          AND EXISTS (
              SELECT 1
              FROM scenarios s2
              WHERE s2.fichier_id = s.fichier_id
              ${
                  req.query.selectedFilter ?
                  `AND s2.type = '${req.query.selectedFilter}'` :
                  ''
              }
              ${
                  req.query.selectedCategory ?
                  `AND s2.name_2 LIKE '${getCategoryPattern(req.query.selectedCategory)}%'` :
                  ''
              }
              AND (s2.name_2 LIKE '%@WEB-UI%' OR s2.name_2 LIKE '%@Data_Management%' OR s2.name_2 LIKE '%@Navigation%' OR s2.name_2 LIKE '%@REST%')
              LIMIT 1
          )
      `;

      const query = `
          SELECT
              fichier_id,
              nom_fichier,
              (SELECT textdate FROM scenarios WHERE fichier_Id = s.fichier_id AND textdate IS NOT NULL AND textdate ~* '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z' ORDER BY textdate LIMIT 1) AS textdate,
              COUNT(DISTINCT CASE WHEN stepstatus = 'passed' THEN testname END) AS total_passed,
              COUNT(DISTINCT CASE WHEN stepstatus = 'failed' THEN testname END) AS total_failed,
              COUNT(DISTINCT CASE WHEN stepstatus = 'skipped' THEN testname END) AS total_skipped,
              COUNT(DISTINCT CASE WHEN stepstatus = 'pending' THEN testname END) AS total_pending
          FROM scenarios s
          WHERE 1=1
          ${fileAndNameCondition} -- Condition de filtre basée sur le type de fichier et le nom
          GROUP BY fichier_id, nom_fichier
          ORDER BY fichier_id;
      `;
      const { rows } = await pool.query(query);
      res.json(rows);
  } catch (error) {
      console.error('Erreur lors de la récupération des données de StepStatus combinées :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données de StepStatus combinées' });
  }
});


// Fonction utilitaire pour obtenir le motif de la catégorie
const getCategoryPattern = (selectedCategory) => {
  switch (selectedCategory) {
      case 'web-ui':
          return '@WEB-UI';
      case 'dataManagement':
          return '@Data_Management';
      case 'RestAPI':
          return '@REST';
      case 'Navigations':
          return '@Navigation';
      default:
          return '';
  }
};

app.get('/stepstatus-data-passed', async (req, res) => {
    try {
        const query = `
            SELECT fichier_id, nom_fichier, MIN(textdate) AS textdate, COUNT(*) AS total_passed
            FROM scenarios
            WHERE fichier_id IN (
                SELECT DISTINCT fichier_id
                FROM scenarios
                ORDER BY fichier_id DESC
                LIMIT 10
            ) AND stepstatus = 'passed'
            GROUP BY fichier_id, nom_fichier
            ORDER BY fichier_id;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de StepStatus "passed" :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de StepStatus "passed"' });
    }
});
// Endpoint pour récupérer les données de StepStatus "failed"
app.get('/stepstatus-data-failed', async (req, res) => {
    try {
        const query = `
            SELECT s.fichier_id, s.nom_fichier, MIN(s.textdate) AS textdate, COUNT(*) AS total_failed
            FROM scenarios s
            JOIN (
                SELECT DISTINCT fichier_id
                FROM scenarios
                ORDER BY fichier_id DESC
                LIMIT 10
            ) AS recent_files
            ON s.fichier_id = recent_files.fichier_id
            WHERE s.stepstatus = 'failed'
            GROUP BY s.fichier_id, s.nom_fichier
            ORDER BY s.fichier_id;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de StepStatus "failed" :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de StepStatus "failed"' });
    }
});

// Endpoint pour récupérer les données de StepStatus "skipped"
app.get('/stepstatus-data-skipped', async (req, res) => {
    try {
        const query = `
            SELECT s.fichier_id, s.nom_fichier, MIN(s.textdate) AS textdate, COUNT(*) AS total_skipped
            FROM scenarios s
            JOIN (
                SELECT DISTINCT fichier_id
                FROM scenarios
                ORDER BY fichier_id DESC
                LIMIT 10
            ) AS recent_files
            ON s.fichier_id = recent_files.fichier_id
            WHERE s.stepstatus = 'skipped'
            GROUP BY s.fichier_id, s.nom_fichier
            ORDER BY s.fichier_id;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de StepStatus "skipped" :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de StepStatus "skipped"' });
    }
});

// Endpoint pour récupérer les données de StepStatus "pending"
app.get('/stepstatus-data-pending', async (req, res) => {
    try {
        const query = `
            SELECT s.fichier_id, s.nom_fichier, MIN(s.textdate) AS textdate, COUNT(*) AS total_pending
            FROM scenarios s
            JOIN (
                SELECT DISTINCT fichier_id
                FROM scenarios
                ORDER BY fichier_id DESC
                LIMIT 10
            ) AS recent_files
            ON s.fichier_id = recent_files.fichier_id
            WHERE s.stepstatus = 'pending'
            GROUP BY s.fichier_id, s.nom_fichier
            ORDER BY s.fichier_id;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de StepStatus "pending" :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de StepStatus "pending"' });
    }
});

app.post('/check-and-display', async (req, res) => {
    try {
        const { filename, featurename } = req.body;

        let query = `
            SELECT 
                Tests.TestName AS "TestName",
                Steps.StepName AS "StepName",
                Steps.StepKeyword AS "StepKeyword",
                Steps.duration AS "Duration",
                Steps.error_message AS "ErrorMessage"
            FROM 
                Steps
            JOIN 
                Tests ON Steps.TestID = Tests.TestID
            WHERE 
                Tests.FileName = $1 
                AND Steps.StepStatus = 'failed'
        `;

        // Ajouter le filtre featurename à la requête SQL si présent
        const queryParams = [filename];
        if (featurename) {
            query += ' AND Tests.TestID IN (SELECT TestID FROM Features WHERE FeatureName = $2)';
            queryParams.push(featurename);
        }

        const stepsResult = await pool.query(query, queryParams);
        const stepsData = stepsResult.rows;

        res.status(200).json(stepsData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error.message);
        res.status(500).send('Erreur lors de la récupération des données: ' + error.message);
    }
});


  









app.listen(PORT, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
  });