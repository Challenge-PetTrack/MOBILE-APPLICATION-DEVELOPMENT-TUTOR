import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useCreateGasto, useDeleteGasto, useTutorGastos } from "@/hooks/useGastos";
import { CATEGORIAS_GASTO, getCategoriaGasto } from "@/constants/catalogos";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default function FinanceiroTutorScreen() {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const { gastos, total, porCategoria, isLoading, isError, refetch } = useTutorGastos();
  const createGasto = useCreateGasto();
  const deleteGasto = useDeleteGasto();

  const [modalVisible, setModalVisible] = useState(false);
  const [categoria, setCategoria] = useState("racao");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSalvar = async () => {
    const valorNum = parseCurrency(valor);
    if (!descricao.trim() || !Number.isFinite(valorNum) || valorNum <= 0) {
      Alert.alert("Atenção", "Preencha uma descrição e um valor válido maior que zero.");
      return;
    }

    try {
      await createGasto.mutateAsync({ categoria, descricao, valor: valorNum });
      setDescricao("");
      setValor("");
      setCategoria("racao");
      setModalVisible(false);
    } catch {
      Alert.alert("Erro", "Não foi possível registrar o gasto.");
    }
  };

  if (isLoading) return <LoadingScreen message="Carregando despesas..." />;
  if (isError) return <ErrorScreen onRetry={refetch} />;

  return (
    <View style={s.container}>
      <Header
        title="Gestão Financeira"
        rightAction={
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => setModalVisible(true)}
            accessibilityLabel="Novo gasto"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Total Investido no Pet</Text>
          <Text style={s.summaryValue}>{formatCurrency(total)}</Text>
          <Text style={s.summarySub}>{gastos.length} lançamento(s) registrado(s)</Text>
        </View>

        {porCategoria.length > 0 && (
          <View style={s.breakdownCard}>
            <Text style={s.sectionTitle}>Distribuição por Categoria</Text>
            {porCategoria.map((cat) => (
              <View key={cat.id} style={s.catRow}>
                <View style={s.catHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name={cat.icone} size={16} color={cat.cor} />
                    <Text style={s.catName}>{cat.nome}</Text>
                  </View>
                  <Text style={s.catAmount}>
                    {formatCurrency(cat.subtotal)} ({cat.percentual}%)
                  </Text>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      { width: `${Math.max(4, cat.percentual)}%`, backgroundColor: cat.cor },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.listHeader}>
          <Text style={s.sectionTitle}>Histórico de Despesas</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={s.newLink}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {gastos.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyText}>Nenhuma despesa registrada até o momento.</Text>
          </View>
        ) : (
          gastos.map((g) => {
            const cat = getCategoriaGasto(g.categoria);
            return (
              <View key={g.id} style={s.expenseCard}>
                <View style={[s.catIconBox, { backgroundColor: `${cat.cor}20` }]}>
                  <Ionicons name={cat.icone} size={22} color={cat.cor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expenseDesc}>{g.descricao}</Text>
                  <Text style={s.expenseMeta}>
                    {cat.nome} • {formatDate(g.data)}
                  </Text>
                </View>
                <Text style={s.expenseValue}>{formatCurrency(g.valor)}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Remover Gasto", "Deseja excluir este lançamento?", [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Remover",
                        style: "destructive",
                        onPress: () => deleteGasto.mutate(g.id),
                      },
                    ])
                  }
                  style={{ padding: 6 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Nova Despesa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Categoria</Text>
            <View style={s.catChips}>
              {CATEGORIAS_GASTO.map((c) => {
                const selected = categoria === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      s.catChip,
                      selected && { backgroundColor: c.cor },
                    ]}
                    onPress={() => setCategoria(c.id)}
                  >
                    <Ionicons
                      name={c.icone}
                      size={15}
                      color={selected ? "#fff" : colors.textSecondary}
                    />
                    <Text style={[s.catChipText, selected && { color: "#fff" }]}>
                      {c.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>Descrição</Text>
            <TextInput
              style={s.input}
              placeholder="Ex.: Ração Super Premium 15kg"
              placeholderTextColor={colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={s.label}>Valor (R$)</Text>
            <TextInput
              style={s.input}
              placeholder="Ex.: 189,90"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={valor}
              onChangeText={setValor}
            />

            <TouchableOpacity
              style={s.saveBtn}
              onPress={handleSalvar}
              disabled={createGasto.isPending}
            >
              <Text style={s.saveBtnText}>
                {createGasto.isPending ? "Salvando..." : "Registrar Despesa"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#10b981",
      justifyContent: "center",
      alignItems: "center",
    },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    summaryCard: {
      backgroundColor: "#10b981",
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
    },
    summaryLabel: { color: "#d1fae5", fontSize: 14, fontWeight: "600" },
    summaryValue: { color: "#fff", fontSize: 34, fontWeight: "bold", marginTop: 6 },
    summarySub: { color: "#ecfdf5", fontSize: 13, marginTop: 6 },
    breakdownCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
    },
    sectionTitle: { fontSize: 17, fontWeight: "bold", color: colors.text, marginBottom: 12 },
    catRow: { marginBottom: 12 },
    catHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    catName: { fontSize: 14, fontWeight: "600", color: colors.text },
    catAmount: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    barTrack: {
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.surfaceSecondary,
      overflow: "hidden",
    },
    barFill: { height: 7, borderRadius: 4 },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    newLink: { color: "#10b981", fontWeight: "bold", fontSize: 14 },
    emptyBox: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
    },
    emptyText: { color: colors.textMuted, marginTop: 10, fontSize: 14, textAlign: "center" },
    expenseCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    catIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
    expenseDesc: { fontSize: 15, fontWeight: "bold", color: colors.text },
    expenseMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    expenseValue: { fontSize: 15, fontWeight: "bold", color: colors.text },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      padding: 24,
      paddingBottom: 36,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
    label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    catChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    catChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceSecondary,
    },
    catChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    saveBtn: {
      backgroundColor: "#10b981",
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
