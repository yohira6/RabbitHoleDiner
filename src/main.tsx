import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import Blog from "../app/blog";
import "../app/globals.css";

function getRoute() {
  if (window.location.hash) return window.location.hash;

  const basePath = import.meta.env.BASE_URL.replace(/^\//, "").replace(/\/$/, "");
  const segments = window.location.pathname.split("/").filter(Boolean);
  const baseIndex = basePath ? segments.indexOf(basePath) : -1;
  const relative = segments.slice(baseIndex + 1);
  if (relative[0] !== "blog") return "#/";
  return relative[1] ? `#/blog/${relative[1]}` : "#/blog";
}

function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);
    return () => {
      window.removeEventListener("hashchange", updateRoute);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  return route.startsWith("#/blog") ? <Blog route={route} /> : <Home />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
