import {initializeFirebase} from "./firebase-config";
import {fetchDataFromFirestoreSubCollection, getData, saveData} from "./firestore-utils";
import bigExport from "firestore-to-bigquery-export";
import bigqueryAccount from '../bigqueryAccount';

bigExport.setBigQueryConfig(bigqueryAccount);

initializeFirebase()
    .then(() => fetchDataFromFirestoreSubCollection('myBar', true))
    .then(async (data) => {
        // await bigExport.createBigQueryTable('firestore_export', 'my_bar_2020_09_24', data);
        try {
            await saveDataToFile(data, 'my_bar_2020_09_24.json');
        } catch (e){}
        const result = await bigExport.copyToBigQuery('firestore_export', 'my_bar_2020_09_24', data)
        console.log('Copied ' + result + ' documents to BigQuery.')
    })
    .then(() => console.log('Success! 🔥'))
    .catch((error) => console.log('Error! 💩', error));


