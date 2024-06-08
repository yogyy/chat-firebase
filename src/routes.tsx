import App from "@/App";
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
  ],
  { basename: "/chatzzz" },
);

export default router;
