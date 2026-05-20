import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function FinanceiroVet() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [consultasMes, setConsultasMes] = useState(0);
  const [faturamento, setFaturamento] = useState(0);
  const [valorPadrão, setValorPadrao] = useState(150);
  const [consultasList, setConsultasList] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);

      const clinicaStr = await AsyncStorage.getItem("@clinica_dados");
      const valorConsulta = clinicaStr ? parseFloat(JSON.parse(clinicaStr).valorConsulta || "150") : 150;
      setValorPadrao(valorConsulta);

      const data = await AsyncStorage.getItem("@consultas");
      if (data) {
        const all = JSON.parse(data);
        const doVet = all.filter((c: any) => c.vetId === user.id);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const consultasEsteMes = doVet.filter((c: any) => {
          const d = new Date(c.data);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        setConsultasMes(consultasEsteMes.length);
        setFaturamento(consultasEsteMes.length * valorConsulta);
        setConsultasList(consultasEsteMes.reverse()); // Recentes primeiro
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Financeiro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.monthTitle}>{currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}</Text>
        
        <View style={s.dashboardContainer}>
          <View style={s.dashCard}>
            <View style={s.dashIconBox}>
              <Ionicons name="medical" size={24} color="#0d9488" />
            </View>
            <Text style={s.dashValue}>{consultasMes}</Text>
            <Text style={s.dashLabel}>Consultas (Mês)</Text>
          </View>
          
          <View style={s.dashCard}>
            <View style={[s.dashIconBox, { backgroundColor: "#10b98120" }]}>
              <Ionicons name="cash" size={24} color="#10b981" />
            </View>
            <Text style={[s.dashValue, { color: "#10b981" }]}>R$ {faturamento.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</Text>
            <Text style={s.dashLabel}>Faturamento Estimado</Text>
          </View>
        </View>

        <View style={s.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
          <Text style={s.infoText}>
            Cálculo baseado no valor padrão de <Text style={{fontWeight: "bold"}}>R$ {valorPadrão.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</Text> por consulta, configurado na aba Ajustes.
          </Text>
        </View>

        <Text style={s.sectionTitle}>Consultas Faturadas</Text>

        {consultasList.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyStateText}>Nenhum faturamento registrado neste mês.</Text>
          </View>
        ) : (
          consultasList.map((c, i) => (
            <View key={i} style={s.transactionCard}>
              <View style={s.transLeft}>
                <View style={s.transIcon}>
                  <Ionicons name="checkmark-done-circle" size={24} color="#10b981" />
                </View>
                <View>
                  <Text style={s.transTitle}>{c.petNome}</Text>
                  <Text style={s.transDate}>{new Date(c.data).toLocaleDateString("pt-BR")} • Consulta</Text>
                </View>
              </View>
              <Text style={s.transValue}>+ R$ {valorPadrão.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.background,
    },
    backButton: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
      justifyContent: "center", alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    content: { paddingHorizontal: 24 },
    monthTitle: { fontSize: 18, fontWeight: "bold", color: colors.textSecondary, marginBottom: 16, textTransform: "capitalize" },
    dashboardContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    dashCard: {
      backgroundColor: colors.surface, flex: 1, borderRadius: 16, padding: 16,
      marginHorizontal: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    dashIconBox: { backgroundColor: "#ccfbf1", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    dashValue: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 4 },
    dashLabel: { fontSize: 12, color: colors.textSecondary },
    infoBox: {
      flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", padding: 12, borderRadius: 12, marginBottom: 32,
      borderWidth: 1, borderColor: "#bfdbfe"
    },
    infoText: { fontSize: 13, color: "#1e3a8a", flex: 1, marginLeft: 8 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 16 },
    emptyState: { alignItems: "center", paddingVertical: 40, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderStyle: "dashed", borderColor: colors.borderLight },
    emptyStateText: { marginTop: 12, color: colors.textMuted, fontSize: 15 },
    transactionCard: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, padding: 16,
      borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    transLeft: { flexDirection: "row", alignItems: "center" },
    transIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#10b98120", justifyContent: "center", alignItems: "center", marginRight: 12 },
    transTitle: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 2 },
    transDate: { fontSize: 13, color: colors.textSecondary },
    transValue: { fontSize: 16, fontWeight: "bold", color: "#10b981" },
  });
}
