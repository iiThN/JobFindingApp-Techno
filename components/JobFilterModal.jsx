import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const JOB_TYPES = ["All", "Full-Time", "Part-Time", "Contract", "Internship / OJT"];

export default function JobFilterModal({ visible, filters, onClose, onApply, onReset }) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: selected ? "#2623D3" : "#E1E5F0",
        backgroundColor: selected ? "#EEEEFF" : "#FFFFFF",
        marginRight: 8,
        marginBottom: 9,
      }}
    >
      <Text style={{ color: selected ? "#2623D3" : "#536078", fontSize: 13, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(13, 20, 50, 0.42)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, maxHeight: "88%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111C4B" }}>Filter jobs</Text>
              <Text style={{ color: "#7D87A0", fontSize: 12, marginTop: 3 }}>Narrow down opportunities that fit you.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 7 }}>
              <Feather name="x" size={23} color="#536078" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ color: "#111C4B", fontWeight: "800", marginBottom: 11 }}>Employment type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {JOB_TYPES.map((type) => (
                <Chip key={type} label={type} selected={draft.jobType === type} onPress={() => update("jobType", type)} />
              ))}
            </View>

            <Text style={{ color: "#111C4B", fontWeight: "800", marginTop: 12, marginBottom: 9 }}>Location</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E1E5F0", borderRadius: 12, paddingHorizontal: 12 }}>
              <Feather name="map-pin" size={17} color="#7D87A0" />
              <TextInput
                value={draft.location}
                onChangeText={(value) => update("location", value)}
                placeholder="Enter city or location"
                placeholderTextColor="#9299AB"
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 9, color: "#111C4B" }}
                autoCapitalize="words"
              />
            </View>

            <Text style={{ color: "#111C4B", fontWeight: "800", marginTop: 18, marginBottom: 9 }}>Skills</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E1E5F0", borderRadius: 12, paddingHorizontal: 12 }}>
              <Feather name="tool" size={17} color="#7D87A0" />
              <TextInput
                value={draft.skill}
                onChangeText={(value) => update("skill", value)}
                placeholder="e.g. React Native, Communication"
                placeholderTextColor="#9299AB"
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 9, color: "#111C4B" }}
              />
            </View>
            <Text style={{ color: "#9299AB", fontSize: 11, marginTop: 7, marginBottom: 15 }}>
              Filters use the job information saved by employers.
            </Text>
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={onReset} style={{ flex: 1, borderWidth: 1, borderColor: "#DDE2EF", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#536078", fontWeight: "800" }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onApply(draft)} style={{ flex: 1.5, backgroundColor: "#2623D3", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
