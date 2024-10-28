import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  firestore,
  SHOPPINGLIST,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "./firebase/config";
import { serverTimestamp } from "firebase/firestore";

export default function App() {
  const [shopItem, setShopItem] = useState("");
  const [itemList, setItemList] = useState([]);

  // Aikaleima vain, että saa järjestykseen
  const saveToDB = async () => {
    const refToFirestoreInstance = await addDoc(collection(firestore, SHOPPINGLIST), {
      text: shopItem,
      created: serverTimestamp(),
    }).catch((error) => console.log(error));
    setShopItem("");
  };

  useEffect(() => {
    const refToCollection = query(collection(firestore, SHOPPINGLIST), orderBy("created", "desc"));

    const unsubscribe = onSnapshot(refToCollection, (querysnapshot) => {
      const tmpItemList = [];
      querysnapshot.forEach((doc) => {
        tmpItemList.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      setItemList(tmpItemList);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleItemDeletion = async (tobeDeleted) => {
    try {
      const refDocument = doc(firestore, SHOPPINGLIST, tobeDeleted.id);
      await deleteDoc(refDocument);
    } catch (error) {
      console.log("Error deleting document:: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Ostoslistan demotus</Text>
      <View style={styles.inputbox}>
        <TextInput
          style={styles.inputText}
          placeholder="add a new todo.."
          value={shopItem}
          onChangeText={(text) => setShopItem(text)}
        />
        <Button title="add" onPress={saveToDB} />
      </View>
      <FlatList
        data={itemList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemDeletion(item)}>
            <Text style={styles.shopItemTeksti}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "400",
    padding: 8,
    paddingBottom: 14,
  },
  inputText: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "gray",
    fontSize: 16,
    width: "80%",
  },
  inputbox: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  shopItemTeksti: {
    fontSize: 20,
    padding: 8,
  },
});
