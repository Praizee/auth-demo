import { useEffect, useState } from "react";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import { getRoute, navigate } from "./lib/router";
import { DashboardPage } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { ProfilePage } from "./pages/Profile";
import { SignupPage } from "./pages/Signup";
import type { Route } from "./types";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function Router() {
  const { isAuthed } = useAuth();
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    function handleRouteChange() {
      setRoute(getRoute());
    }

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    const authRoute = route === "/login" || route === "/signup";
    const privateRoute = route === "/dashboard" || route === "/profile";

    if (privateRoute && !isAuthed) {
      navigate("/login");
    }

    if (authRoute && isAuthed) {
      navigate("/dashboard");
    }
  }, [isAuthed, route]);

  if (route === "/signup") {
    return <SignupPage />;
  }

  if (route === "/dashboard") {
    return <DashboardPage />;
  }

  if (route === "/profile") {
    return <ProfilePage />;
  }

  return <LoginPage />;
}

export default App;

