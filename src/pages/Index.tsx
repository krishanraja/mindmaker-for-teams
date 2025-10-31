import { ExecTeamsApp } from "@/components/exec-teams/ExecTeamsApp";
import { ExecTeamsProvider } from "@/contexts/ExecTeamsContext";

const Index = () => {
  return (
    <ExecTeamsProvider>
      <ExecTeamsApp />
    </ExecTeamsProvider>
  );
};

export default Index;
