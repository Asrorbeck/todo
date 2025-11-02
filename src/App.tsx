import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { FinanceProvider } from "@/context/finance-context";
import { SavingsProvider } from "@/context/savings-context";
import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <FinanceProvider>
            <SavingsProvider>
              <MainLayout />
            </SavingsProvider>
          </FinanceProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
