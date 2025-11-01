import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
