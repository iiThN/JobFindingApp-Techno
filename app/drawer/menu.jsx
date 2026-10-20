import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../../components/stylesIn';

export default function MenuScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={() => router.back()}
        activeOpacity={1} 
      />

      <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeMenuBtn}>
              <Feather name="chevron-left" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

        <View style={styles.safeArea}>
          <View style={styles.userInfo}>
            
            <View style={styles.avatarPlaceholder}>
              <Octicons name="person" size={24} color="#2623D3" />
            </View>
            <View>
              <Text style={styles.userName}>inJob</Text>
              <Text style={styles.userEmail}>inJob@email.com</Text>
            </View>
          </View>

          <View style={styles.menuActsContainer}>
            {/* pwede ma butangan ug mga item for the MENU */}
          </View>
          
          <View style={styles.menuFooter}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );
}