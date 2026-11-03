import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import { useOnboarding } from "@/hooks/useOnboarding";

const { width } = Dimensions.get("window");
const VIEW_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

const SLIDES = [
  {
    id: "1",
    title: "Bem-vindo ao PetTrack!",
    description:
      "A melhor forma de acompanhar a saúde do seu pet e se conectar com seu veterinário de confiança.",
    animationUrl: "https://lottie.host/7833bdc6-ccb3-4f93-b6d3-24151a66ccbc/hOmsaI1J3u.json",
  },
  {
    id: "2",
    title: "Tudo na Palma da Mão",
    description:
      "Tenha a carteirinha de vacinação, lembretes automáticos de medicamentos e controle financeiro sempre atualizados.",
    animationUrl: "https://lottie.host/d6b38cda-1c21-4fce-bc2a-286a146e27fb/6J7r3A9t2P.json",
  },
  {
    id: "3",
    title: "Para Veterinários",
    description:
      "Gerencie sua agenda em tempo real, emita receitas em PDF e acompanhe o prontuário dos seus pacientes.",
    animationUrl: "https://lottie.host/57a3e743-34e8-468e-b8cd-6ec6ecb6d087/0H18G38gD3.json",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const s = makeStyles(colors);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const finish = async () => {
    await completeOnboarding();
    router.replace("/auth/login");
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await finish();
    }
  };

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.skipButton} onPress={finish}>
        <Text style={s.skipText}>Pular</Text>
      </TouchableOpacity>

      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={({ item }) => (
            <View style={s.slide}>
              <View style={s.animationContainer}>
                <LottieView
                  source={{ uri: item.animationUrl }}
                  autoPlay
                  loop
                  style={s.animation}
                  resizeMode="contain"
                />
              </View>
              <View style={s.textContainer}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.description}>{item.description}</Text>
              </View>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={VIEW_CONFIG}
          ref={slidesRef}
        />
      </View>

      <View style={s.footer}>
        <View style={s.paginatorContainer}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.id}
              style={[s.dot, currentIndex === i ? s.dotActive : s.dotInactive]}
            />
          ))}
        </View>

        <TouchableOpacity style={s.button} onPress={handleNext}>
          <Text style={s.buttonText}>
            {currentIndex === SLIDES.length - 1 ? "Começar Agora" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: "center" },
    skipButton: { position: "absolute", top: 56, right: 24, zIndex: 10, padding: 8 },
    skipText: { color: "#4f46e5", fontWeight: "700", fontSize: 16 },
    slide: { width, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
    animationContainer: { flex: 0.6, justifyContent: "center", alignItems: "center" },
    animation: { width: width * 0.72, height: width * 0.72 },
    textContainer: { flex: 0.4, alignItems: "center" },
    title: {
      fontWeight: "800",
      fontSize: 26,
      marginBottom: 12,
      color: colors.text,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    footer: { flex: 1, justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 44 },
    paginatorContainer: { flexDirection: "row", height: 48, justifyContent: "center", alignItems: "center" },
    dot: { height: 10, borderRadius: 5, backgroundColor: "#4f46e5", marginHorizontal: 6 },
    dotActive: { width: 22, opacity: 1 },
    dotInactive: { width: 10, opacity: 0.3 },
    button: {
      backgroundColor: "#4f46e5",
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      shadowColor: "#4f46e5",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
}
