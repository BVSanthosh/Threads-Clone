import { atom } from "recoil";

export const contactsAtom = atom({
    key: "contactsAtom",
    default: [],
});

export const selectedContactAtom = atom({
    key: "selectedContactAtom",
    default: {
        _id: "",
        userId: "",
        username: "",
        profilePic: "",
    }
});  