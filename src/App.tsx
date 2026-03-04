/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import Viewer from "./pages/Viewer";
import Billing from "./pages/Billing";
import Queue from "./pages/Queue";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="register" element={<Registration />} />
              <Route path="queue" element={<Queue />} />
              <Route path="billing" element={<Billing />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/viewer/:id" element={<Viewer />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}
