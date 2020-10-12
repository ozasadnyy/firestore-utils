import fs from 'fs';
import path from 'path';
import chunk from 'lodash/chunk';
import { firestore } from './firebase-config';

const FILE_EXTENSION_PATTERN = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi;

export function getData(path) {
  const source = getPathObject(path);
  if (source.file) {
    return fetchDataFromFile(source.file);
  }
  return fetchDataFromFirestore(source.collection, source.doc);
}

export function saveData(data, path) {
  const destination = getPathObject(path);
  if (destination.file) {
    return saveDataToFile(data, destination.file);
  }
  return saveDataToFirestore(data, destination.collection, destination.doc);
}

export function fetchDataFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(process.cwd(), file), 'utf8', (err, data) => {
      if (err) reject(err);
      const parsedData = JSON.parse(data);
      let result = parsedData;
      if (Array.isArray(parsedData)) {
        result = convertToObject(parsedData);
      }
      resolve(result);
    });
  });
}

export function saveDataToFile(data, file) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(process.cwd(), file), JSON.stringify(data), (err) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

export function fetchDataFromFirestore(collection, doc) {
  if (!doc) {
    return firestore.collection(collection).get()
      .then((snapshot) => {
        const collectionData = {};
        snapshot.forEach((doc) => {
          collectionData[doc.id] = doc.data();
        });
        return Promise.resolve(collectionData);
      });
  }
  return firestore.collection(collection).doc(doc).get()
    .then((document) => {
      return Promise.resolve(document.data());
    });
}

export async function fetchDataFromFirestoreSubCollection(collectionGroup, snapshot = false) {
  const querySnapshot = await firestore.collectionGroup(collectionGroup).get();
  const collectionData = {};
  if (snapshot) return querySnapshot;
  querySnapshot.forEach((doc) => {
    collectionData[doc.id] = doc.data();
  });
  return collectionData;
}

export function saveDataToFirestore(data, collection, doc) {
  if (!doc) {
    const dataChunks = chunk(Object.entries(data), 400);

    const promisses = dataChunks.map(dataChunk => {
      const batch = firestore.batch();
      dataChunk.forEach(([key, value]) => {
        const docRef = firestore.collection(collection).doc(key);
        batch.set(docRef, value);
      });
      return batch.commit();
    });

    return Promise.all(promisses);
  }
  return firestore.collection(collection).doc(doc).set(data);
}


export function getPathObject(params) {
  const normalizedParams = params.replace(/\/$/, '');
  const paramsExtension = normalizedParams.match(FILE_EXTENSION_PATTERN);

  if (paramsExtension && paramsExtension[0]) {
    return {
      file: normalizedParams,
    };
  } else if (normalizedParams.split('/').length % 2 !== 0) {
    return {
      collection: normalizedParams,
    };
  }
  return {
    collection: normalizedParams.slice(0, normalizedParams.lastIndexOf('/')),
    doc: normalizedParams.slice(normalizedParams.lastIndexOf('/') + 1),
  };
}

function convertToObject(array) {
  return array.reduce((agregator, obj, index) => {
    return {
      ...agregator,
      [obj.id || index]: obj
    };
  }, {});
}
