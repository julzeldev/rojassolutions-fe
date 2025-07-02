import type { Route } from "./+types/login";
import LoginPage from "../pages/login/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "login to React Router!" },
  ];
}

export default function Login() {
  return <LoginPage />;
}
