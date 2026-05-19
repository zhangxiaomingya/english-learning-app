import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Listening from "@/pages/Listening";
import Speaking from "@/pages/Speaking";
import Reading from "@/pages/Reading";
import Writing from "@/pages/Writing";
import Vocabulary from "@/pages/Vocabulary";

function App() {
  const [currentTab, setCurrentTab] = useState("home");

  const renderContent = () => {
    switch (currentTab) {
      case "home":
        return <Home onNavigate={setCurrentTab} />;
      case "listening":
        return <Listening />;
      case "speaking":
        return <Speaking />;
      case "reading":
        return <Reading />;
      case "writing":
        return <Writing />;
      case "vocabulary":
        return <Vocabulary />;
      default:
        return <Home onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container">
        <main className="min-h-screen safe-area-top">
          {renderContent()}
        </main>
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
}

export default App;
