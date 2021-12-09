import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import Lobby from "@/pages/Lobby.vue";
import Game from "@/pages/Game.vue";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "MainPage",
    component: MainPage,
  },
  {
    path: "/lobby/:id",
    name: "Lobby",
    component: Lobby,
  },
  {
    path: "/game/:id",
    name: "Game",
    component: Game,
    beforeEnter: () => {
      if (!store.state.isGameInProgress) {
        return { path: "/" };
      }
      return true;
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
