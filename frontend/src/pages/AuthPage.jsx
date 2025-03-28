import SignUp from "../components/SignUp.jsx";
import LogIn from "../components/LogIn.jsx";
import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom.js";

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom);
    
    return (
        <>
            {authScreenState === "login" ? <LogIn /> : <SignUp />}
        </> 
    )
}

export default AuthPage