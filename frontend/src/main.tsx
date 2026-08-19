import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import axios from "axios";

import { router } from "./app/routing/router";

import "./index.css";

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}


ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);