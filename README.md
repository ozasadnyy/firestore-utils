At the moment Firestore admin panel doesn't allow to export/import data from their DB. These scripts allow you to load data on your machine, edit and bring it back. See examples to learn how it works.

## Setup
* Go to **Project settings / Service accounts / Firebase admin SDK**
* Select **Node.js** and click **“Generate new private key“**
* Download file
* Rename file to **“serviceAccount.json”** and put this file to project root

### Save collection/doc to file
```cmd
    npm run firestore:copy sourcePath fileToSave.json
```
##### Examples:
Save a collection
```cmd
    npm run firestore:copy config/scheme/pages pages-scheme.json
```
Save a document
```cmd
    npm run firestore:copy config/backup backup.json
```

### Load a file to collection/doc 
```cmd
    npm run firestore:copy fileToLoad.json destinationPath
```
##### Examples:
Load to collection
```cmd
    npm run firestore:copy pages-scheme.json config/scheme/pages
```
Load a document
```cmd
    npm run firestore:copy backup.json config/backup
```

### Copy collection->collection or doc->doc
```cmd
    npm run firestore:copy sourcePath destinationPath
```
##### Examples:
Copy a collection
```cmd
    npm run firestore:copy pages config/scheme/pages
```
Copy a document
```cmd
    npm run firestore:copy pages/about postponed/draft/pages/about
```