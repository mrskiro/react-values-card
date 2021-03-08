import { valueCards } from "../config";
import { firebase, db } from "../lib/firebase";
import { randomShuffle } from "../utils/card";

export const useRoom = () => {
  const roomsRef = db.collection("/rooms");

  const createRoom = (roomName: string, ownerName: string): string => {
    const id = firebase.firestore().collection("_").doc().id;
    firebase
      .auth()
      .signInAnonymously()
      .then(async (credential) => {
        await roomsRef.doc(id).set({
          name: roomName,
          owner: ownerName,
          players: [{ uid: credential.user?.uid, name: ownerName, hand: [] }],
          deck: randomShuffle(valueCards),
          graveyards: [],
        });

        const collection = db.collection(`rooms/${id}/players`);

        const documentLength = await collection
          .get()
          .then((docs) => docs.size + 1);

        collection.doc(credential.user?.uid).set({
          order: documentLength,
          uid: credential.user?.uid,
          name: ownerName,
          hand: [],
        });
      });

    return id;
  };

  const joinRoom = (roomId: string, name: string) => {
    firebase
      .auth()
      .signInAnonymously()
      .then(async (credential) => {
        roomsRef.doc(roomId).update({
          players: firebase.firestore.FieldValue.arrayUnion({
            uid: credential.user?.uid,
            name,
          }),
        });
        const collection = db.collection(`rooms/${roomId}/players`);

        const documentLength = await collection
          .get()
          .then((docs) => docs.size + 1);

        collection.doc(credential.user?.uid).set({
          order: documentLength,
          uid: credential.user?.uid,
          name,
          hand: [],
        });
      });
  };

  return {
    createRoom,
    joinRoom,
  };
};