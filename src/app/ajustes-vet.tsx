import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function AjustesVet() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  const [notificacoes, setNotificacoes] = useState(true);
  const [offline, setOffline] = useState(false);

  // Modal Perfil
  const [modalPerfil, setModalPerfil] = useState(false);
  const [nome, setNome] = useState("");
  const [crmv, setCrmv] = useState("");

  // Modal Clínica
  const [modalClinica, setModalClinica] = useState(false);
  const [nomeClinica, setNomeClinica] = useState("");
  const [enderecoClinica, setEnderecoClinica] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const sessionStr = await AsyncStorage.getItem("@session");
    if (sessionStr) {
      const user = JSON.parse(sessionStr);
      setNome(user.nome || "");
      setCrmv(user.crmv || "");
    }
    const clinicaData = await AsyncStorage.getItem("@clinica_dados");
    if (clinicaData) {
      const clinica = JSON.parse(clinicaData);
      setNomeClinica(clinica.nome || "");
      setEnderecoClinica(clinica.endereco || "");
    }
    const notif = await AsyncStorage.getItem("@settings_notificacoes");
    if (notif !== null) setNotificacoes(notif === "true");
  };

  const salvarPerfil = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem("@session");
      if (!sessionStr) return;
      const user = JSON.parse(sessionStr);

      const updatedUser = { ...user, nome, crmv };
      await AsyncStorage.setItem("@session", JSON.stringify(updatedUser));

      // Atualizar também na lista de @users
      const usersData = await AsyncStorage.getItem("@users");
      if (usersData) {
        const users = JSON.parse(usersData);
        const idx = users.findIndex((u: any) => u.id === user.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], nome, crmv };
          await AsyncStorage.setItem("@users", JSON.stringify(users));
        }
      }

      setModalPerfil(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const salvarClinica = async () => {
    try {
      await AsyncStorage.setItem("@clinica_dados", JSON.stringify({ nome: nomeClinica, endereco: enderecoClinica }));
      setModalClinica(false);
      Alert.alert("Sucesso", "Dados da clínica atualizados!");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const handleNotificacoes = async (val: boolean) => {
    setNotificacoes(val);
    await AsyncStorage.setItem("@settings_notificacoes", val.toString());
  };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Ajustes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        
        <Text style={s.sectionTitle}>Conta e Clínica</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.rowItem} onPress={() => setModalPerfil(true)}>
            <View style={s.rowLeft}>
              <Ionicons name="person" size={24} color="#3b82f6" />
              <View style={{ marginLeft: 16 }}>
                <Text style={s.rowText}>Editar Perfil e CRMV</Text>
                {(nome || crmv) && <Text style={s.rowSubText}>{nome}{crmv ? ` • CRMV: ${crmv}` : ""}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.rowItem} onPress={() => setModalClinica(true)}>
            <View style={s.rowLeft}>
              <Ionicons name="business" size={24} color="#3b82f6" />
              <View style={{ marginLeft: 16 }}>
                <Text style={s.rowText}>Dados da Clínica</Text>
                {nomeClinica && <Text style={s.rowSubText}>{nomeClinica}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>Preferências</Text>
        <View style={s.card}>
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="notifications" size={24} color="#3b82f6" />
              <Text style={[s.rowText, { marginLeft: 16 }]}>Notificações de Consultas</Text>
            </View>
            <Switch 
              value={notificacoes} 
              onValueChange={handleNotificacoes}
              trackColor={{ false: colors.border, true: "#93c5fd" }}
              thumbColor={notificacoes ? "#3b82f6" : colors.surfaceSecondary}
            />
          </View>
          <View style={s.divider} />
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="moon" size={24} color={isDark ? "#a78bfa" : "#3b82f6"} />
              <Text style={[s.rowText, { marginLeft: 16 }]}>Modo Escuro</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: "#a78bfa" }}
              thumbColor={isDark ? "#7c3aed" : colors.surfaceSecondary}
            />
          </View>
          <View style={s.divider} />
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="cloud-offline" size={24} color="#3b82f6" />
              <Text style={[s.rowText, { marginLeft: 16 }]}>Sincronização Offline</Text>
            </View>
            <Switch 
              value={offline} 
              onValueChange={setOffline}
              trackColor={{ false: colors.border, true: "#93c5fd" }}
              thumbColor={offline ? "#3b82f6" : colors.surfaceSecondary}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>Sobre</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
              <Text style={[s.rowText, { marginLeft: 16 }]}>Privacidade e Termos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          <View style={s.rowItem}>
            <View style={s.rowLeft}>
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <Text style={[s.rowText, { marginLeft: 16 }]}>Versão do App (v1.0.0)</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal Editar Perfil */}
      <Modal visible={modalPerfil} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Editar Perfil</Text>
            <Text style={s.modalLabel}>Nome Completo</Text>
            <TextInput style={s.modalInput} value={nome} onChangeText={setNome} placeholderTextColor={colors.textMuted} placeholder="Seu nome" />
            <Text style={s.modalLabel}>CRMV</Text>
            <TextInput style={s.modalInput} value={crmv} onChangeText={setCrmv} placeholderTextColor={colors.textMuted} placeholder="Ex: 12345/SP" />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModalPerfil(false)}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={salvarPerfil}>
                <Text style={s.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Dados da Clínica */}
      <Modal visible={modalClinica} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Dados da Clínica</Text>
            <Text style={s.modalLabel}>Nome da Clínica</Text>
            <TextInput style={s.modalInput} value={nomeClinica} onChangeText={setNomeClinica} placeholderTextColor={colors.textMuted} placeholder="Ex: Clínica VetCare" />
            <Text style={s.modalLabel}>Endereço</Text>
            <TextInput style={s.modalInput} value={enderecoClinica} onChangeText={setEnderecoClinica} placeholderTextColor={colors.textMuted} placeholder="Rua, número, cidade" />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setModalClinica(false)}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSaveBtn} onPress={salvarClinica}>
                <Text style={s.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
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
    sectionTitle: { fontSize: 13, fontWeight: "bold", color: colors.textMuted, marginTop: 24, marginBottom: 12, marginLeft: 8, textTransform: "uppercase", letterSpacing: 1 },
    card: {
      backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 8,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    rowItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
    rowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    rowText: { fontSize: 16, color: colors.text, fontWeight: "500" },
    rowSubText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalBox: {
      backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 28, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text, marginBottom: 24 },
    modalLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
    modalInput: {
      backgroundColor: colors.inputBackground, borderRadius: 12, padding: 16, fontSize: 16,
      color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 20,
    },
    modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
    modalCancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.surfaceSecondary, alignItems: "center" },
    modalCancelText: { color: colors.text, fontWeight: "600", fontSize: 16 },
    modalSaveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: "#3b82f6", alignItems: "center" },
    modalSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  });
}
