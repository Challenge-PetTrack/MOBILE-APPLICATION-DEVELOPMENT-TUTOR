import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

type Gasto = {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
};

const CATEGORIAS = [
  { id: "veterinario", nome: "Veterinário", icone: "medical" as any, cor: "#ef4444" },
  { id: "racao", nome: "Ração", icone: "restaurant" as any, cor: "#f59e0b" },
  { id: "banho", nome: "Banho & Tosa", icone: "water" as any, cor: "#0ea5e9" },
  { id: "brinquedos", nome: "Brinquedos", icone: "tennisball" as any, cor: "#8b5cf6" },
  { id: "outros", nome: "Outros", icone: "cart" as any, cor: "#10b981" },
];

export default function FinanceiroTutor() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoria, setCategoria] = useState("outros");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadGastos();
    }, [])
  );

  const loadGastos = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);

      const dados = await AsyncStorage.getItem(`@gastos_${user.id}`);
      if (dados) {
        setGastos(JSON.parse(dados));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const salvarGasto = async () => {
    const valorNum = parseFloat(valor.replace(",", "."));
    if (!descricao.trim() || isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Erro", "Preencha a descrição e um valor válido.");
      return;
    }

    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);

      const novoGasto: Gasto = {
        id: Date.now().toString(),
        categoria,
        descricao,
        valor: valorNum,
        data: new Date().toISOString(),
      };

      const novaLista = [novoGasto, ...gastos];
      await AsyncStorage.setItem(`@gastos_${user.id}`, JSON.stringify(novaLista));
      setGastos(novaLista);
      
      // Resetar form
      setDescricao("");
      setValor("");
      setCategoria("outros");
      setModalVisible(false);

    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o gasto.");
    }
  };

  const deletarGasto = async (id: string) => {
    Alert.alert("Remover Gasto", "Deseja remover este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          const sessionStr = await AsyncStorage.getItem("@session");
          if (!sessionStr) return;
          const user = JSON.parse(sessionStr);

          const novaLista = gastos.filter(g => g.id !== id);
          await AsyncStorage.setItem(`@gastos_${user.id}`, JSON.stringify(novaLista));
          setGastos(novaLista);
        }
      }
    ]);
  };

  const formatarMoeda = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const totalGasto = gastos.reduce((acc, curr) => acc + curr.valor, 0);

  const getCategoriaInfo = (id: string) => {
    return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[4];
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Gestão Financeira</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Total Gasto (Histórico)</Text>
          <Text style={s.summaryValue}>{formatarMoeda(totalGasto)}</Text>
        </View>

        <View style={s.listHeader}>
          <Text style={s.sectionTitle}>Transações</Text>
          <TouchableOpacity style={s.addButtonSm} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.addButtonSmText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {gastos.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyText}>Nenhuma despesa registrada.</Text>
          </View>
        ) : (
          gastos.map((item) => {
            const cat = getCategoriaInfo(item.categoria);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={s.transactionCard}
                onLongPress={() => deletarGasto(item.id)}
              >
                <View style={[s.catIcon, { backgroundColor: cat.cor + "20" }]}>
                  <Ionicons name={cat.icone} size={24} color={cat.cor} />
                </View>
                <View style={s.transactionInfo}>
                  <Text style={s.transactionDesc}>{item.descricao}</Text>
                  <Text style={s.transactionCat}>{cat.nome} • {new Date(item.data).toLocaleDateString("pt-BR")}</Text>
                </View>
                <Text style={s.transactionValue}>- {formatarMoeda(item.valor)}</Text>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal Novo Gasto */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Adicionar Despesa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
              {CATEGORIAS.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catPill, categoria === cat.id && { backgroundColor: cat.cor }]}
                  onPress={() => setCategoria(cat.id)}
                >
                  <Ionicons name={cat.icone} size={16} color={categoria === cat.id ? "#fff" : cat.cor} style={{ marginRight: 6 }} />
                  <Text style={[s.catPillText, categoria === cat.id && { color: "#fff" }]}>{cat.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>Descrição</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: Banho Premium"
              placeholderTextColor={colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={s.label}>Valor (R$)</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: 50,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            <TouchableOpacity style={s.saveBtn} onPress={salvarGasto}>
              <Text style={s.saveBtnText}>Salvar Gasto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    title: { fontSize: 22, fontWeight: "bold", color: colors.text },
    content: { paddingHorizontal: 24 },
    summaryCard: {
      backgroundColor: "#10b981", borderRadius: 20, padding: 24, marginBottom: 24,
      shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    summaryLabel: { color: "#d1fae5", fontSize: 14, fontWeight: "600", marginBottom: 8 },
    summaryValue: { color: "#fff", fontSize: 36, fontWeight: "bold" },
    listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
    addButtonSm: { flexDirection: "row", backgroundColor: "#10b981", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: "center" },
    addButtonSmText: { color: "#fff", fontWeight: "bold", marginLeft: 4 },
    emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
    emptyText: { color: colors.textMuted, marginTop: 12, fontSize: 16 },
    transactionCard: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, padding: 16,
      borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    catIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
    transactionInfo: { flex: 1, marginLeft: 16 },
    transactionDesc: { fontSize: 16, fontWeight: "bold", color: colors.text, marginBottom: 4 },
    transactionCat: { fontSize: 13, color: colors.textSecondary },
    transactionValue: { fontSize: 16, fontWeight: "bold", color: "#ef4444" },
    fab: {
      position: "absolute", bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
      backgroundColor: "#10b981", justifyContent: "center", alignItems: "center",
      shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    label: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
    input: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16, fontSize: 16,
      color: colors.text, borderWidth: 1, borderColor: "transparent",
    },
    catScroll: { flexDirection: "row", marginBottom: 8 },
    catPill: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.borderLight,
    },
    catPillText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
    saveBtn: { backgroundColor: "#10b981", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 24, marginBottom: 12 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
