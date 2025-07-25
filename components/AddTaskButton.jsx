import styles from "@/assets/style/styles.js";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AddTaskButton = ({ onPress, label = "Add Task" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={styles.addButton}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Feather
        name="plus-circle"
        size={22}
        color="#fff"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.addButtonText}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default AddTaskButton;
