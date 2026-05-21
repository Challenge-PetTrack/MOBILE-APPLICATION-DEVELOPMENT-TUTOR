import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Animated } from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { storage } from "@/service/storage";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Bem-vindo ao PetTrack!",
    description: "A melhor forma de acompanhar a saúde do seu pet e se conectar com seu veterinário de confiança.",
    // Cachorrinho pulando
    animationUrl: "https://lottie.host/7833bdc6-ccb3-4f93-b6d3-24151a66ccbc/hOmsaI1J3u.json", 
  },
  {
    id: "2",
    title: "Tudo na Palma da Mão",
    description: "Tenha a carteirinha de vacinação, lembretes de medicamentos e controle financeiro sempre atualizados.",
    // Médico / Vacina
    animationUrl: "https://lottie.host/d6b38cda-1c21-4fce-bc2a-286a146e27fb/6J7r3A9t2P.json",
  },
  {
    id: "3",
    title: "Para Veterinários",
    description: "Gerencie sua agenda, emita receitas em PDF e tenha o histórico completo de todos os seus pacientes.",
    // Agenda / Prontuário
    animationUrl: "https://lottie.host/57a3e743-34e8-468e-b8cd-6ec6ecb6d087/0H18G38gD3.json",
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Concluir onboarding
      await storage.setOnboardingDone();
      router.replace("/auth/login");
    }
  };

  const handleSkip = async () => {
    await storage.setOnboardingDone();
    router.replace("/auth/login");
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.animationContainer}>
          <LottieView
            source={{ uri: item.animationUrl }}
            autoPlay
            loop
            style={styles.animation}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPaginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()} />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        {renderPaginator()}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? "Começar Agora" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 16,
  },
  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  animationContainer: {
    flex: 0.7,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.3,
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  paginatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4f46e5",
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
