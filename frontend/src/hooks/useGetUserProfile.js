import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";
import axiosInstance from "../lib/axios"; // ← assuming you've created a custom axios instance

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  const showToast = useShowToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/profile/${username}`); 
        const data = res.data;

        if (data.error) {
          showToast("Error", data.error.message, "error");
          return;
        }

        if (data.isFrozen) {
          setUser(null);
          return;
        }

        setUser(data);
      } catch (error) {
        showToast("Error", error.response?.data?.error || error.message, "error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [username, showToast]);

  return { user, loading };
};

export default useGetUserProfile;
