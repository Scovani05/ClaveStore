import { mockDashboard } from "../../../client/src/data/mockMusicStore.js";

export const getSampleDashboard = () => JSON.parse(JSON.stringify(mockDashboard));

export const sampleDashboard = getSampleDashboard();