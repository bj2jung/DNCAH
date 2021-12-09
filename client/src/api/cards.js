import axios from "axios";

export async function fetchCardsApi(cardType, numCards, pack) {
  try {
    const fetchedCards = await axios.get(
      `${
        process.env.VUE_APP_ROOT_API
      }cards/${cardType}/?numCards=${numCards}&pack=${encodeURIComponent(pack)}`
    );
    return fetchedCards.data;
  } catch (error) {
    return error;
  }
}

export async function fetchPacksApi() {
  try {
    const fetchedPacks = await axios.get(
      `${process.env.VUE_APP_ROOT_API}cards/packs`
    );
    return fetchedPacks.data;
  } catch (error) {
    return error;
  }
}
