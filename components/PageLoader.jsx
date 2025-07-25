import { View, ActivityIndicator } from "react-native";
import styles from "@/assets/style/styles.js";

const PageLoader = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00beac" />
    </View>
  );
};


export default PageLoader;
