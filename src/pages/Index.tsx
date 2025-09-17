import { MindmakerApp } from "@/components/MindmakerApp";
import { MindmakerProvider } from "@/contexts/MindmakerContext";

const Index = () => {
  return (
    <MindmakerProvider>
      <MindmakerApp />
    </MindmakerProvider>
  );
};

export default Index;
