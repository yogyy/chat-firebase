import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

type ImageLocation = "profile" | "chat";
const upload = async (file: File, location?: ImageLocation) => {
  const date = new Date().toLocaleString().replace(/\//g, "-"); // replace / to -
  const fileName = date.replace(/(\d{4}),/, "$1") + " " + file.name; // remove comma after year
  const storageRef = ref(
    storage,
    `images/${location ? location + "/" : ""}${fileName}`,
  );

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        reject("Something went wrong!" + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      },
    );
  });
};

export default upload;
