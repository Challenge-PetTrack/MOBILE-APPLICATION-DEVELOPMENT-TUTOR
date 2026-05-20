import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ScoreScreen() {
  const router = useRouter();
  
  const [tasks, setTasks] = useState([
    { id: 1, title: "Passeio Diário", points: 30, completed: false, icon: "walk" },
    { id: 2, title: "Alimentação Saudável", points: 20, completed: false, icon: "restaurant" },
    { id: 3, title: "Água Trocada", points: 15, completed: false, icon: "water" },
    { id: 4, title: "Brincadeiras", points: 25, completed: false, icon: "tennisball" },
    { id: 5, title: "Escovar Pelos", points: 10, completed: false, icon: "brush" },
  ]);

  const [score, setScore] = useState(0);

  useEffect(() => {
    const total = tasks.filter(t => t.completed).reduce((acc, curr) => acc + curr.points, 0);
    setScore(total);
  }, [tasks]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getScoreColor = () => {
    if (score < 40) return "#ef4444"; // Red
    if (score < 80) return "#f59e0b"; // Orange/Amber
    return "#10b981"; // Green
  };

  const getScoreMessage = () => {
    if (score === 100) return "Perfeito! Seu pet está super feliz hoje! 🌟";
    if (score >= 70) return "Muito bem! Ótima rotina! 🐕";
    if (score >= 40) return "Bom, mas podemos melhorar! 🐾";
    return "Vamos animar esse pet! Comece as tarefas! 😴";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.title}>Score do Pet</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>
        <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Tarefas Diárias</Text>
      <Text style={styles.sectionSubtitle}>Complete as atividades para aumentar o bem-estar do seu pet.</Text>

      <View style={styles.tasksContainer}>
        {tasks.map(task => (
          <TouchableOpacity 
            key={task.id} 
            style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
            onPress={() => toggleTask(task.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, task.completed && styles.iconContainerCompleted]}>
              <Ionicons name={task.icon as any} size={24} color={task.completed ? "#fff" : "#f59e0b"} />
            </View>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                {task.title}
              </Text>
              <Text style={styles.taskPoints}>+{task.points} pts</Text>
            </View>
            <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
              {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreMax: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "600",
    marginTop: -8,
  },
  scoreMessage: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  tasksContainer: {
    gap: 12,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardCompleted: {
    backgroundColor: "#fef3c7", // Light amber tint
    borderColor: "#fde68a",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconContainerCompleted: {
    backgroundColor: "#f59e0b",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: "#92400e", // Dark amber
    textDecorationLine: "line-through",
  },
  taskPoints: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
});
