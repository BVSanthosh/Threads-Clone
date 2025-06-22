import { useRecoilValue } from "recoil";
import useShowToast from "./useShowToast";
import userAtom from "../atoms/userAtom";
import { useState } from "react";
import axiosInstance from "../lib/axios";

const useHandleFollow = (user) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(user.following.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);
  const showToast = useShowToast();

  const toggleFollow = async () => {
    if (!currentUser) {
      showToast("Error", "Please login to follow", "error");
      return;
    }

    if (updating) return;

    setUpdating(true);

    try {
      const res = await axiosInstance.post(`/users/follow/${user._id}`);
      const data = res.data;

      if (data.error) {
        showToast("Error", data.error.message || data.error, "error");
        return;
      }

      if (following) {
        showToast("Success", `Unfollowed ${user.name}`, "success");
      } else {
        showToast("Success", `Followed ${user.name}`, "success");
      }

      setFollowing(!following);
    } catch (error) {
      showToast("Error", error.response?.data?.error || error.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  return { toggleFollow, updating, following };
};

export default useHandleFollow;
