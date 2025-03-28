import { useRecoilValue } from "recoil";
import useShowToast from "./useShowToast";
import userAtom from "../atoms/userAtom";
import { useState } from "react";

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
  
      if(updating) return;
  
      setUpdating(true);
  
      try {
        const res = await fetch(`/api/users/follow/${user._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });
  
        const data = await res.json()
  
        if (data.error) {
          showToast("Error", data.error.message, "error");
          return;
        }
  
        if (following) {
          showToast("Success", `Unfollowed ${user.name}`, "success")
          user.followers.pop();
        } else{
          showToast("Success", `Followed ${user.name}`, "success");
          user.followers.push(currentUser?._id);
        } 
        
        setFollowing(!following);
      } catch(error) {
        showToast("Error", error.message, "error");
      } finally{
        setUpdating(false);
      }
  }

  return { toggleFollow, updating, following };
}

export default useHandleFollow;