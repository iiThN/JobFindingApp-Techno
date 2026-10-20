import { ScrollView, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from '../../../components/Navigations';
import styles from "../../../components/stylesIn";

export default function FindJob() {
  return (
    <View style={styles.container}>
      
      <SafeAreaView style={styles.homeContainer} edges={["top"]}>
        <TopNav />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}