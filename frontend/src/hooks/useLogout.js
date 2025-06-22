import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "./useShowToast";
import axiosInstance from "../lib/axios"; // import your axios instance

const useLogout = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();

  const logout = async () => {
    try {
      const { data } = await axiosInstance.post("/users/logout");

      if (data.error) {
        showToast(
          "Error",
          typeof data.error === "string"
            ? data.error
            : data.error.message || "Logout failed",
          "error"
        );
        return;
      }

      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.error || error.message || "Logout failed",
        "error"
      );
    }
  };

  return { logout };
};

export default useLogout;
