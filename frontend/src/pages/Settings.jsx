import { Button, Text, useColorMode } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast.js";
import useLogout from "../hooks/useLogout.js";
import axiosInstance from "../lib/axios";

const Settings = () => {
  const showToast = useShowToast();
  const { logout } = useLogout();
  const { colorMode, toggleColorMode } = useColorMode();

  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account?")) return;

    try {
      const { data } = await axiosInstance.put("/api/users/freeze");

      if (data.error) {
        showToast("Error", data.error.message, "error");
        return;
      }

      if (data.success) {
        await logout();
        showToast("Success", "Your account has been frozen", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Switch color mode
      </Text>
      <Button my={2} size={"sm"} colorScheme={"red"} onClick={toggleColorMode}>
        {colorMode === "dark" ? "Dark mode" : "Light mode"}
      </Button>
      <Text my={1} fontWeight={"bold"}>
        Freeze your account
      </Text>
      <Text my={1}>You can unfreeze your account by logging in.</Text>
      <Button my={2} size={"sm"} colorScheme={"red"} onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default Settings;
