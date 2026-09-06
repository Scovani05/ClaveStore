import axios from "axios";
import { getSampleDashboard } from "./sampleData.js";

export const musicInsightService = {
  async getInsight() {
    const sample = getSampleDashboard();

    try {
      const response = await axios.get("https://api.frankfurter.app/latest", {
        params: { from: "EUR", to: "USD" },
        timeout: 2500
      });
      const usd = response.data?.rates?.USD;

      return {
        title: "Compra inteligente para loja musical",
        tip: "Usa bundles e stock baixo para decidir campanhas, compras a fornecedores e packs para escolas.",
        externalSignal: usd ? `Cambio EUR/USD ${Number(usd).toFixed(3)} para compras internacionais.` : "Sinal externo obtido.",
        ideas: sample.playbooks
      };
    } catch (error) {
      return {
        title: "Packs e usados com boa margem",
        tip: "Começa pelos bundles para iniciantes, escolas de música e usados certificados.",
        externalSignal: "Dados externos indisponíveis neste momento.",
        ideas: sample.playbooks
      };
    }
  }
};