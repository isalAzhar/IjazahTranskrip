import axios from "axios";
import BASE_URL from "./api";

export const getUnits =
  async () => {

    const response =
      await axios.get(
        `${BASE_URL}/api/master-unit`
      );

    return response.data;
};

export const createUnit =
  async (data) => {

    const response =
      await axios.post(
        `${BASE_URL}/api/master-unit`,
        data
      );

    return response.data;
};

export const deleteUnit =
  async (id) => {

    const response =
      await axios.delete(
        `${BASE_URL}/api/master-unit/${id}`
      );

    return response.data;
};