import { TouchableOpacity,View, Text, StyleSheet} from "react-native";


export default function FormButton({
  btnTitle,
  onPress
}){

  return(
    <View>
      <TouchableOpacity
        style={styles.formBtn}
        activeOpacity={0.5}
        onPress={onPress}>
          <Text style={styles.formBtnTitle}>{btnTitle}</Text>
      </TouchableOpacity>
    </View>
  )

}

const styles = StyleSheet.create({
  formBtn: {
    height: 46,
    backgroundColor: "#2623D3",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  formBtnTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  }
})